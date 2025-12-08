const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');
const uploadController = require('../controllers/uploadController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });


// GET /api/sales
router.get('/', salesController.getSales);

// POST /api/sales/upload (multipart form-data, field name: file)
router.post('/upload', upload.single('file'), uploadController.uploadCSV);


module.exports = router;