const Sale = require("../models/sale");
const utils = require("../utils/queryUtils");
const fs = require("fs");
const csv = require("csv-parser");
const path = require("path");

function buildFilter(query) {
  const filter = {};

  if (query.q) {
    const term = query.q.toString();
    filter.$or = [
      { customerName: { $regex: term, $options: "i" } },
      { phoneNumber: { $regex: term, $options: "i" } },
    ];
  }

  // accept either `region` (singular) or `regions` (plural) from client queries
  const regionParam = query.region || query.regions;
  // helper to escape user input for safe regex construction
  function escapeRegex(str) {
    return String(str).replace(/[.*+?^${}()|[\\]\\]/g, "\\$&");
  }

  if (regionParam) {
    // build case-insensitive exact-match regexes so stored values with different casing still match
    const regions = utils.splitCSV(regionParam);
    filter.customerRegion = { $in: regions.map((r) => new RegExp(`^${escapeRegex(r)}$`, "i")) };
  }

  if (query.gender) {
    const genders = utils.splitCSV(query.gender);
    filter.gender = { $in: genders.map((g) => new RegExp(`^${escapeRegex(g)}$`, "i")) };
  }

  const ageMin = utils.toNumber(query.ageMin);
  const ageMax = utils.toNumber(query.ageMax);
  if (!isNaN(ageMin) || !isNaN(ageMax)) {
    filter.age = {};
    if (!isNaN(ageMin)) filter.age.$gte = ageMin;
    if (!isNaN(ageMax)) filter.age.$lte = ageMax;
  }

 /* if (query.category) {
    const cats = utils.splitCSV(query.category).map((s) => s.toLowerCase());
    filter.productCategory = { $in: cats };
  }

  if (query.tags) {
    const tags = utils.splitCSV(query.tags).map((s) => s.toLowerCase());
    filter.tags = { $all: tags };
  }*/

    // ✅ PRODUCT CATEGORY (case-insensitive exact match)
if (query.category) {
  const cats = utils.splitCSV(query.category);

  filter.productCategory = {
    $in: cats.map(
      (c) => new RegExp(`^${escapeRegex(c)}$`, "i")
    ),
  };
}

// ✅ TAGS – match ANY selected tag inside the tags ARRAY
if (query.tags) {
  const tags = utils.splitCSV(query.tags);

  filter.tags = {
    $elemMatch: {
      $in: tags.map(
        (t) => new RegExp(`^${escapeRegex(t.trim())}$`, "i")
      ),
    },
  };
}


  if (query.paymentMethod) {
    filter.paymentMethod = query.paymentMethod;
  }

  if (query.dateFrom || query.dateTo) {
    const from = utils.toDate(query.dateFrom);
    const to = utils.toDate(query.dateTo);
    filter.date = {};
    if (from) filter.date.$gte = from;
    if (to) filter.date.$lte = to;
  }

  return filter;
}

function buildSort(sortBy, sortOrder) {
  if (!sortBy) return { date: -1 };
  const order = (sortOrder || "desc").toLowerCase() === "asc" ? 1 : -1;
  const map = {
    date: { date: order },
    quantity: { quantity: order },
    customerName: { customerName: order },
  };
  return map[sortBy] || { date: -1 };
}

exports.querySales = async (query) => {
  const page = Math.max(1, parseInt(query.page || "1", 10));
  const pageSize = Math.min(200, Math.max(1, parseInt(query.pageSize || "20", 10)));
  const skip = (page - 1) * pageSize;

  const filter = buildFilter(query);
  const sort = buildSort(query.sortBy, query.sortOrder);

  const [total, items] = await Promise.all([
    Sale.countDocuments(filter),
    Sale.find(filter).sort(sort).skip(skip).limit(pageSize).lean(),
  ]);

  const totalPages = Math.ceil(total / pageSize) || 1;
  return { data: items, meta: { total, totalPages, page, pageSize } };
};

/**
 * Insert array of docs in chunks to avoid creating huge in-memory inserts.
 * Returns { insertedCount, errors }.
 */
async function insertInBatches(docs, batchSize = 500) {
  let insertedCount = 0;
  const errors = [];

  for (let i = 0; i < docs.length; i += batchSize) {
    const chunk = docs.slice(i, i + batchSize);
    try {
      const res = await Sale.insertMany(chunk, { ordered: false });
      insertedCount += Array.isArray(res) ? res.length : 0;
    } catch (e) {
      if (e && e.insertedDocs) {
        insertedCount += e.insertedDocs.length;
      }
      errors.push(e.message || String(e));
    }
  }
  return { insertedCount, errors };
}

/**
 * Import array of plain objects (from CSV or other sources) into Sale collection.
 * Maps CSV columns to database schema.
 * Returns { insertedCount, errors }.
 */
exports.importRecords = async (records, options = {}) => {
  if (!Array.isArray(records) || records.length === 0) return { insertedCount: 0, errors: [] };

  const docs = records.map((r) => {
    const doc = {
      transactionId: r['Transaction ID'],
      date: utils.toDate(r['Date']) || undefined,
      customerId: r['Customer ID'],
      customerName: r['Customer Name'] || undefined,
      phoneNumber: r['Phone Number'] || undefined,
      gender: r['Gender'] || undefined,
      age: utils.toNumber(r['Age']),
      customerRegion: r['Customer Region'] || undefined,
      customerType: r['Customer Type'] || undefined,
      productId: r['Product ID'],
      productName: r['Product Name'] || undefined,
      brand: r['Brand'] || undefined,
      productCategory: r['Product Category'] || undefined,
      tags: r['Tags'] ? String(r['Tags']).split(/[;,]/).map((t) => t.trim()).filter(Boolean) : [],
      quantity: utils.toNumber(r['Quantity']),
      pricePerUnit: utils.toNumber(r['Price per Unit']),
      discountPercentage: utils.toNumber(r['Discount Percentage']),
      //amount: utils.toNumber(r['Total Amount']),
      totalAmount: utils.toNumber(r['Total Amount']),

      finalAmount: utils.toNumber(r['Final Amount']),
      paymentMethod: r['Payment Method'] || undefined,
      orderStatus: r['Order Status'] || undefined,
      deliveryType: r['Delivery Type'] || undefined,
      storeId: r['Store ID'],
      storeLocation: r['Store Location'] || undefined,
      salespersonId: r['Salesperson ID'],
      employeeName: r['Employee Name'] || undefined,
      raw: r,
    };
    return doc;
  });

  const batchSize = options.batchSize || 500;
  const res = await insertInBatches(docs, batchSize);
  return res;
};

/**
 * Streaming import from CSV file path.
 * - Parses CSV with csv-parser
 * - Maps each row to database schema
 * - Inserts in batches to avoid OOM
 * Returns { importedCount, errors }.
 */
exports.importFromCSVFile = async (filePath, options = {}) => {
  const CHUNK_SIZE = options.batchSize || 500;
  const insertedCount = { value: 0 };
  const errors = [];

  if (!filePath || !fs.existsSync(filePath)) return { importedCount: 0, errors: ["file-not-found"] };

  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePath).pipe(csv());
    let buffer = [];

    function mapRowToDoc(r) {
      return {
        transactionId: r['Transaction ID'],
        date: utils.toDate(r['Date']) || undefined,
        customerId: r['Customer ID'],
        customerName: r['Customer Name'] || undefined,
        phoneNumber: r['Phone Number'] || undefined,
        gender: r['Gender'] || undefined,
        age: utils.toNumber(r['Age']),
        customerRegion: r['Customer Region'] || undefined,
        customerType: r['Customer Type'] || undefined,
        productId: r['Product ID'],
        productName: r['Product Name'] || undefined,
        brand: r['Brand'] || undefined,
        productCategory: r['Product Category'] || undefined,
        tags: r['Tags'] ? String(r['Tags']).split(/[;,]/).map((t) => t.trim()).filter(Boolean) : [],
        quantity: utils.toNumber(r['Quantity']),
        pricePerUnit: utils.toNumber(r['Price per Unit']),
        discountPercentage: utils.toNumber(r['Discount Percentage']),
        amount: utils.toNumber(r['Total Amount']),
        //totalAmount: utils.toNumber(r['Total Amount']),

        finalAmount: utils.toNumber(r['Final Amount']),
        paymentMethod: r['Payment Method'] || undefined,
        orderStatus: r['Order Status'] || undefined,
        deliveryType: r['Delivery Type'] || undefined,
        storeId: r['Store ID'],
        storeLocation: r['Store Location'] || undefined,
        salespersonId: r['Salesperson ID'],
        employeeName: r['Employee Name'] || undefined,
        raw: r,
      };
    }

    let paused = false;

    async function flushBuffer() {
      if (buffer.length === 0) return;
      const toInsert = buffer;
      buffer = [];
      try {
        const res = await Sale.insertMany(toInsert, { ordered: false });
        insertedCount.value += Array.isArray(res) ? res.length : 0;
      } catch (e) {
        if (e && e.insertedDocs) insertedCount.value += e.insertedDocs.length;
        errors.push(e.message || String(e));
      }
    }

    stream
      .on("data", async (row) => {
        const doc = mapRowToDoc(row);
        buffer.push(doc);

        if (buffer.length >= CHUNK_SIZE && !paused) {
          paused = true;
          stream.pause();
          flushBuffer()
            .then(() => {
              paused = false;
              stream.resume();
            })
            .catch((err) => {
              paused = false;
              errors.push(err.message || String(err));
              stream.resume();
            });
        }
      })
      .on("end", async () => {
        try {
          await flushBuffer();
          resolve({ importedCount: insertedCount.value, errors });
        } catch (e) {
          errors.push(e.message || String(e));
          resolve({ importedCount: insertedCount.value, errors });
        }
      })
      .on("error", (err) => {
        errors.push(err.message || String(err));
        reject({ importedCount: insertedCount.value, errors });
      });
  });
};