const pool = require('../config/db');

const Order = {
  async findByUser(userId) {
    const { rows } = await pool.query(
      'SELECT * FROM orders WHERE user_id=$1 ORDER BY created_at DESC', [userId]
    );
    return rows;
  },
  async findAll() {
    const { rows } = await pool.query(
      `SELECT o.*, u.username, u.email FROM orders o
       JOIN users u ON o.user_id=u.id ORDER BY o.created_at DESC`
    );
    return rows;
  },
  async findById(id) {
    const { rows } = await pool.query(
      `SELECT o.*, u.username, u.email FROM orders o
       JOIN users u ON o.user_id=u.id WHERE o.id=$1`, [id]
    );
    return rows[0] || null;
  },
  async getItems(orderId) {
    const { rows } = await pool.query(
      'SELECT * FROM order_items WHERE order_id=$1', [orderId]
    );
    return rows;
  },
  async create(userId, { shipping_address, notes, items, total }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const { rows } = await client.query(
        `INSERT INTO orders (user_id,status,total,shipping_address,notes)
         VALUES ($1,'confirmed',$2,$3,$4) RETURNING *`,
        [userId, total, shipping_address, notes||'']
      );
      const order = rows[0];
      for (const item of items) {
        await client.query(
          `INSERT INTO order_items (order_id,product_id,product_name,product_price,quantity)
           VALUES ($1,$2,$3,$4,$5)`,
          [order.id, item.product_id, item.name, item.price, item.quantity]
        );
        await client.query(
          'UPDATE products SET stock=stock-$1 WHERE id=$2', [item.quantity, item.product_id]
        );
      }
      await client.query('COMMIT');
      return order;
    } catch(err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },
  async updateStatus(id, status) {
    const { rows } = await pool.query(
      'UPDATE orders SET status=$1 WHERE id=$2 RETURNING *', [status, id]
    );
    return rows[0] || null;
  },
  async stats() {
    const { rows } = await pool.query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status='confirmed') as confirmed,
        COUNT(*) FILTER (WHERE status='shipped') as shipped,
        COUNT(*) FILTER (WHERE status='delivered') as delivered,
        COUNT(*) FILTER (WHERE status='cancelled') as cancelled,
        COALESCE(SUM(total) FILTER (WHERE status!='cancelled'),0) as revenue
      FROM orders
    `);
    return rows[0];
  },
};
module.exports = Order;
