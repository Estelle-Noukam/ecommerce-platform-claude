const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.get('/', requireAuth, async (req, res) => {
  try {
    if (req.session.role === 'admin') return res.json(await Order.findAll());
    return res.json(await Order.findByUser(req.session.userId));
  } catch(err) { console.error(err); return res.status(500).json({ error:'Erreur serveur' }); }
});

router.get('/stats', requireAuth, requireAdmin, async (req, res) => {
  try { return res.json(await Order.stats()); }
  catch { return res.status(500).json({ error:'Erreur serveur' }); }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const order = await Order.findById(parseInt(req.params.id));
    if (!order) return res.status(404).json({ error:'Commande introuvable' });
    if (req.session.role !== 'admin' && order.user_id !== req.session.userId)
      return res.status(403).json({ error:'Accès refusé' });
    const items = await Order.getItems(order.id);
    return res.json({ ...order, items });
  } catch { return res.status(500).json({ error:'Erreur serveur' }); }
});

router.post('/', requireAuth, [
  body('shipping_address').trim().isLength({min:10}).withMessage('Adresse de livraison requise'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors:errors.array() });
  try {
    const cartItems = await Cart.getItems(req.session.userId);
    if (!cartItems.length) return res.status(400).json({ errors:[{msg:'Panier vide'}] });
    for (const item of cartItems) {
      if (!item.active) return res.status(400).json({ errors:[{msg:`Produit indisponible : ${item.name}`}] });
      if (item.stock < item.quantity) return res.status(400).json({ errors:[{msg:`Stock insuffisant : ${item.name}`}] });
    }
    const total = cartItems.reduce((s, i) => s + parseFloat(i.price) * i.quantity, 0);
    const order = await Order.create(req.session.userId, {
      shipping_address: req.body.shipping_address,
      notes: req.body.notes || '',
      items: cartItems.map(i => ({ product_id:i.product_id, name:i.name, price:i.price, quantity:i.quantity })),
      total: total.toFixed(2),
    });
    await Cart.clear(req.session.userId);
    return res.status(201).json(order);
  } catch(err) { console.error(err); return res.status(500).json({ error:'Erreur serveur' }); }
});

router.patch('/:id/status', requireAuth, requireAdmin, [
  body('status').isIn(['pending','confirmed','shipped','delivered','cancelled']),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors:errors.array() });
  try {
    const order = await Order.updateStatus(parseInt(req.params.id), req.body.status);
    if (!order) return res.status(404).json({ error:'Commande introuvable' });
    return res.json(order);
  } catch { return res.status(500).json({ error:'Erreur serveur' }); }
});

module.exports = router;
