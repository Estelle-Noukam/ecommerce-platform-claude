const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try { return res.json(await User.findAll()); }
  catch { return res.status(500).json({ error:'Erreur serveur' }); }
});

router.get('/profile', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) return res.status(404).json({ error:'Introuvable' });
    return res.json(user);
  } catch { return res.status(500).json({ error:'Erreur serveur' }); }
});

router.put('/profile', requireAuth, [
  body('first_name').trim().isLength({max:100}).optional({checkFalsy:true}),
  body('last_name').trim().isLength({max:100}).optional({checkFalsy:true}),
  body('address').trim().isLength({max:500}).optional({checkFalsy:true}),
  body('phone').trim().isLength({max:20}).optional({checkFalsy:true}),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors:errors.array() });
  try {
    const user = await User.update(req.session.userId, req.body);
    return res.json(user);
  } catch { return res.status(500).json({ error:'Erreur serveur' }); }
});

router.patch('/:id/role', requireAuth, requireAdmin, [
  body('role').isIn(['admin','user']),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors:errors.array() });
  const id = parseInt(req.params.id);
  if (id === req.session.userId) return res.status(400).json({ error:'Impossible de modifier votre propre rôle' });
  try {
    const user = await User.updateRole(id, req.body.role);
    if (!user) return res.status(404).json({ error:'Utilisateur introuvable' });
    return res.json(user);
  } catch { return res.status(500).json({ error:'Erreur serveur' }); }
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  if (id === req.session.userId) return res.status(400).json({ error:'Impossible de supprimer votre propre compte' });
  try {
    const ok = await User.delete(id);
    if (!ok) return res.status(404).json({ error:'Utilisateur introuvable' });
    return res.json({ ok:true });
  } catch { return res.status(500).json({ error:'Erreur serveur' }); }
});

module.exports = router;
