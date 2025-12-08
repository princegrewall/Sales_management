// backend/index.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const path = require('path');
const fs = require('fs');

const db = require('./db/db'); // your DB connector (backend/db/db.js)
const salesRoutes = require('./routes/salesRoutes'); // must export GET / and POST /upload
const uploadsDir = path.join(__dirname, 'uploads');

const app = express();
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// ensure uploads dir exists
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// mount routes: salesRoutes should include upload route (POST /api/sales/upload)
app.use('/api/sales', salesRoutes);

app.get('/', (req, res) =>
  res.send({ status: 'ok', message: 'TruEstate backend running with MongoDB' })
);

const PORT = process.env.PORT || 4000;

/**
 * Helper: safely import a CSV into DB using salesService.importFromCSVFile(filePath)
 * Returns { importedCount, errors } or throws.
 */
async function importCsvIfExists(candidate) {
  if (!candidate || !fs.existsSync(candidate)) return { importedCount: 0, skipped: true };
  const service = require('./services/salesService'); // ensure this file exports importFromCSVFile
  console.log('Seeding/importing DB from CSV:', candidate);
  const result = await service.importFromCSVFile(candidate);
  return result;
}

async function start() {
  await db.connect();

  try {
    // seed DB on first run if collection empty
    const Sale = require('./models/sale');
    const count = await Sale.countDocuments();
    if (count === 0) {
      const files = fs.existsSync(uploadsDir)
        ? fs.readdirSync(uploadsDir).filter((f) => f.toLowerCase().endsWith('.csv'))
        : [];
      const candidate = files.length ? path.join(uploadsDir, files[0]) : path.join(__dirname, 'test-upload.csv');

      if (fs.existsSync(candidate)) {
        const r = await importCsvIfExists(candidate);
        console.log('Seed/import result:', r && (r.importedCount ?? r.length) || 0);
      } else {
        console.log('No CSV found to seed DB');
      }
    }

    // watch uploads folder for new CSV files and import them when fully written
    // Debounce approach: when change detected, wait `DEBOUNCE_MS` before importing
    const DEBOUNCE_MS = 1200;
    let debounceTimers = {}; // filename -> timeoutId

    fs.watch(uploadsDir, (eventType, filename) => {
      if (!filename) return;
      const lower = filename.toLowerCase();
      if (!lower.endsWith('.csv')) return;

      const filePath = path.join(uploadsDir, filename);

      // Debounce multiple events for the same file
      if (debounceTimers[filename]) clearTimeout(debounceTimers[filename]);

      debounceTimers[filename] = setTimeout(async () => {
        try {
          if (fs.existsSync(filePath)) {
            console.log('Detected new CSV, importing:', filePath);
            const r = await importCsvIfExists(filePath);
            console.log('Import finished for', filePath, 'result:', r && r.importedCount);
          }
        } catch (e) {
          console.error('Error importing new CSV', e);
        } finally {
          delete debounceTimers[filename];
        }
      }, DEBOUNCE_MS);
    });
  } catch (err) {
    console.error('DB seed/watch setup error', err);
  }

  app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
}

start().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});
