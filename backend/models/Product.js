const pool = require('../config/db');

const Product = {
  async findAll({ category, search, featured, active=true } = {}) {
    let q = `SELECT p.*, c.name as category_name FROM products p
             LEFT JOIN categories c ON p.category_id = c.id WHERE 1=1`;
    const params = [];
    if (active !== null) { params.push(active); q += ` AND p.active=$${params.length}`; }
    if (category) { params.push(category); q += ` AND p.category_id=$${params.length}`; }
    if (featured) { q += ` AND p.featured=true`; }
    if (search) { params.push(`%${search}%`); q += ` AND (p.name ILIKE $${params.length} OR p.description ILIKE $${params.length})`; }
    q += ' ORDER BY p.featured DESC, p.created_at DESC';
    const { rows } = await pool.query(q, params);
    return rows;
  },
  async findById(id) {
    const { rows } = await pool.query(
      `SELECT p.*, c.name as category_name FROM products p
       LEFT JOIN categories c ON p.category_id=c.id WHERE p.id=$1`, [id]
    );
    return rows[0] || null;
  },
  async create({ name, description, price, stock, category_id, image_url, featured=false, active=true }) {
    const { rows } = await pool.query(
      `INSERT INTO products (name,description,price,stock,category_id,image_url,featured,active)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [name, description, price, stock, category_id||null, image_url||null, featured, active]
    );
    return rows[0];
  },
  async update(id, { name, description, price, stock, category_id, image_url, featured, active }) {
    const { rows } = await pool.query(
      `UPDATE products SET name=$1,description=$2,price=$3,stock=$4,
       category_id=$5,image_url=$6,featured=$7,active=$8 WHERE id=$9 RETURNING *`,
      [name, description, price, stock, category_id||null, image_url||null, featured, active, id]
    );
    return rows[0] || null;
  },
  async delete(id) {
    const { rowCount } = await pool.query('DELETE FROM products WHERE id=$1', [id]);
    return rowCount > 0;
  },
  async decrementStock(id, qty) {
    const { rows } = await pool.query(
      'UPDATE products SET stock=stock-$1 WHERE id=$2 AND stock>=$1 RETURNING stock', [qty, id]
    );
    return rows[0] || null;
  },
  async findCategories() {
    const { rows } = await pool.query('SELECT * FROM categories ORDER BY name');
    return rows;
  },
  async createCategory({ name, description }) {
    const { rows } = await pool.query(
      'INSERT INTO categories (name,description) VALUES ($1,$2) RETURNING *', [name, description]
    );
    return rows[0];
  },
  async deleteCategory(id) {
    const { rowCount } = await pool.query('DELETE FROM categories WHERE id=$1', [id]);
    return rowCount > 0;
  },
};
module.exports = Product;
