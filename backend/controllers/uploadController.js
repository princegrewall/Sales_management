const fs = require('fs');
const csv = require('csv-parser');
const salesService = require('../services/salesService');

exports.uploadCSV = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const path = req.file.path;
  const records = [];

  try {
    await new Promise((resolve, reject) => {
      fs.createReadStream(path)
        .pipe(csv())
        .on('data', (data) => {
          records.push(data);
        })
        .on('end', resolve)
        .on('error', reject);
    });

    // Map records to Sale schema fields where possible
    const inserted = await salesService.importRecords(records);

    // remove uploaded file
    fs.unlink(path, () => {});

    res.json({ insertedCount: inserted.length });
  } catch (err) {
    console.error('CSV upload error', err);
    res.status(500).json({ error: 'Failed to process CSV' });
  }
};
