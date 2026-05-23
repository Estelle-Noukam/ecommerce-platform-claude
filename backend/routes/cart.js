const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Cart = require('../models/Cart');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, async (req, res) => {
  try { return res.json(await Cart.getItems(req.session.userId)); }
  catch(err) { console.error(err); return res.status(500).json({ error:'Erreur serveur' }); }
});

router.get('/count', requireAuth, async (req, res) => {
  try { return res.json({ count: await Cart.count(req.session.userId) }); }
  catch { return res.status(500).json({ error:'Erreur serveur' }); }
});

router.post('/items', requireAuth, [
  body('product_id').isInt({min:1}),
  body('quantity').optional().isInt({min:1}),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors:errors.array() });
  try {
    const item = await Cart.addItem(req.session.userId, req.body.product_id, req.body.quantity||1);
    return res.status(201).json(item);
  } catch(err) { console.error(err); return res.status(500).json({ error:'Erreur serveur' }); }
});

router.put('/items/:productId', requireAuth, [
  body('quantity').isInt({min:0}),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors:errors.array() });
  try {
    const item = await Cart.updateItem(req.session.userId, parseInt(req.params.productId), req.body.quantity);
    return res.json(item || { removed:true });
  } catch { return res.status(500).json({ error:'Erreur serveur' }); }
});

router.delete('/items/:productId', requireAuth, async (req, res) => {
  try {
    await Cart.removeItem(req.session.userId, parseInt(req.params.productId));
    return res.json({ ok:true });
  } catch { return res.status(500).json({ error:'Erreur serveur' }); }
});

router.delete('/', requireAuth, async (req, res) => {
  try {
    await Cart.clear(req.session.userId);
    return res.json({ ok:true });
  } catch { return res.status(500).json({ error:'Erreur serveur' }); }
});

module.exports = router;
