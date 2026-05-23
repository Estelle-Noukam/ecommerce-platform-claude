const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const { category, search, featured } = req.query;
    const active = req.query.active === 'false' ? null : true;
    return res.json(await Product.findAll({ category, search, featured: featured==='true', active }));
  } catch(err) { console.error(err); return res.status(500).json({ error:'Erreur serveur' }); }
});

router.get('/categories', async (req, res) => {
  try { return res.json(await Product.findCategories()); }
  catch { return res.status(500).json({ error:'Erreur serveur' }); }
});

router.get('/:id', async (req, res) => {
  try {
    const p = await Product.findById(parseInt(req.params.id));
    if (!p) return res.status(404).json({ error:'Produit introuvable' });
    return res.json(p);
  } catch { return res.status(500).json({ error:'Erreur serveur' }); }
});

router.post('/', requireAuth, requireAdmin, [
  body('name').trim().isLength({min:2,max:200}).withMessage('Nom requis'),
  body('price').isFloat({min:0}).withMessage('Prix invalide'),
  body('stock').isInt({min:0}).withMessage('Stock invalide'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors:errors.array() });
  try { return res.status(201).json(await Product.create(req.body)); }
  catch(err) { console.error(err); return res.status(500).json({ error:'Erreur serveur' }); }
});

router.put('/:id', requireAuth, requireAdmin, [
  body('name').trim().isLength({min:2,max:200}),
  body('price').isFloat({min:0}),
  body('stock').isInt({min:0}),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors:errors.array() });
  try {
    const p = await Product.update(parseInt(req.params.id), req.body);
    if (!p) return res.status(404).json({ error:'Produit introuvable' });
    return res.json(p);
  } catch { return res.status(500).json({ error:'Erreur serveur' }); }
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const ok = await Product.delete(parseInt(req.params.id));
    if (!ok) return res.status(404).json({ error:'Produit introuvable' });
    return res.json({ ok:true });
  } catch { return res.status(500).json({ error:'Erreur serveur' }); }
});

router.post('/categories', requireAuth, requireAdmin, [
  body('name').trim().isLength({min:2}).withMessage('Nom requis'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors:errors.array() });
  try { return res.status(201).json(await Product.createCategory(req.body)); }
  catch { return res.status(500).json({ error:'Erreur serveur' }); }
});

router.delete('/categories/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const ok = await Product.deleteCategory(parseInt(req.params.id));
    if (!ok) return res.status(404).json({ error:'Catégorie introuvable' });
    return res.json({ ok:true });
  } catch { return res.status(500).json({ error:'Erreur serveur' }); }
});

module.exports = router;
