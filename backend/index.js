// Express server setup
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/inventorydb', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Inventory Item Schema
const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  threshold: { type: Number, required: true }
});
const Item = mongoose.model('Item', itemSchema);

// Sale Schema
const saleSchema = new mongoose.Schema({
  item: { type: String, required: true }, // Store item name for simplicity
  qtySold: { type: Number, required: true },
  date: { type: Date, required: true },
  saleValue: { type: Number, required: true }
});
const Sale = mongoose.model('Sale', saleSchema);

// REST API routes
// Get all items
app.get('/api/items', async (req, res) => {
  const items = await Item.find();
  res.json(items);
});
// Get single item by ID
app.get('/api/items/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: 'Invalid ID' });
  }
});
// Add new item
app.post('/api/items', async (req, res) => {
  const item = new Item(req.body);
  await item.save();
  res.status(201).json(item);
});
// Update item
app.put('/api/items/:id', async (req, res) => {
  const item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(item);
});
// Delete item
app.delete('/api/items/:id', async (req, res) => {
  await Item.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});
// Get low stock items
app.get('/api/items/low-stock', async (req, res) => {
  const items = await Item.find({ $expr: { $lte: ["$quantity", "$threshold"] } });
  res.json(items);
});
// Get all sales
app.get('/api/sales', async (req, res) => {
  const sales = await Sale.find();
  res.json(sales);
});
// Add new sale
app.post('/api/sales', async (req, res) => {
  const sale = new Sale(req.body);
  await sale.save();
  res.status(201).json(sale);
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 