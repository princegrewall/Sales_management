const salesService = require('../services/salesService');


exports.getSales = async (req, res) => {
try {
const result = await salesService.querySales(req.query);
res.json(result);
} catch (err) {
console.error(err);
res.status(500).json({ error: 'Internal server error' });
}
};