const pool = require('../config/db');

const Cart = {
  async getOrCreate(userId) {
    let { rows } = await pool.query('SELECT * FROM carts WHERE user_id=$1', [userId]);
    if (!rows[0]) {
      const res = await pool.query(
        'INSERT INTO carts (user_id) VALUES ($1) RETURNING *', [userId]
      );
      rows = res.rows;
    }
    return rows[0];
  },
  async getItems(userId) {
    const cart = await Cart.getOrCreate(userId);
    const { rows } = await pool.query(
      `SELECT ci.id, ci.quantity, p.id as product_id, p.name, p.price,
              p.image_url, p.stock, p.active, c.name as category_name
       FROM cart_items ci
       JOIN products p ON ci.product_id=p.id
       LEFT JOIN categories c ON p.category_id=c.id
       WHERE ci.cart_id=$1`,
      [cart.id]
    );
    return rows;
  },
  async addItem(userId, productId, quantity=1) {
    const cart = await Cart.getOrCreate(userId);
    const { rows } = await pool.query(
      `INSERT INTO cart_items (cart_id,product_id,quantity)
       VALUES ($1,$2,$3)
       ON CONFLICT (cart_id,product_id)
       DO UPDATE SET quantity=cart_items.quantity+$3
       RETURNING *`,
      [cart.id, productId, quantity]
    );
    return rows[0];
  },
  async updateItem(userId, productId, quantity) {
    const cart = await Cart.getOrCreate(userId);
    if (quantity <= 0) {
      await pool.query('DELETE FROM cart_items WHERE cart_id=$1 AND product_id=$2', [cart.id, productId]);
      return null;
    }
    const { rows } = await pool.query(
      'UPDATE cart_items SET quantity=$1 WHERE cart_id=$2 AND product_id=$3 RETURNING *',
      [quantity, cart.id, productId]
    );
    return rows[0] || null;
  },
  async removeItem(userId, productId) {
    const cart = await Cart.getOrCreate(userId);
    await pool.query('DELETE FROM cart_items WHERE cart_id=$1 AND product_id=$2', [cart.id, productId]);
  },
  async clear(userId) {
    const cart = await Cart.getOrCreate(userId);
    await pool.query('DELETE FROM cart_items WHERE cart_id=$1', [cart.id]);
  },
  async count(userId) {
    const cart = await Cart.getOrCreate(userId);
    const { rows } = await pool.query(
      'SELECT COALESCE(SUM(quantity),0) as count FROM cart_items WHERE cart_id=$1', [cart.id]
    );
    return parseInt(rows[0].count);
  },
};
module.exports = Cart;
