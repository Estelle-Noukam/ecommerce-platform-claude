const pool = require('../config/db');
const bcrypt = require('bcrypt');

const User = {
  async findAll() {
    const { rows } = await pool.query(
      'SELECT id,username,email,role,first_name,last_name,address,phone,created_at FROM users ORDER BY id'
    );
    return rows;
  },
  async findById(id) {
    const { rows } = await pool.query(
      'SELECT id,username,email,role,first_name,last_name,address,phone,created_at FROM users WHERE id=$1', [id]
    );
    return rows[0] || null;
  },
  async findByEmail(email) {
    const { rows } = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    return rows[0] || null;
  },
  async create({ username, email, password, role='user', first_name='', last_name='' }) {
    const hash = await bcrypt.hash(password, 12);
    const { rows } = await pool.query(
      `INSERT INTO users (username,email,password_hash,role,first_name,last_name)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING id,username,email,role,first_name,last_name,created_at`,
      [username, email, hash, role, first_name, last_name]
    );
    return rows[0];
  },
  async update(id, fields) {
    const { rows } = await pool.query(
      `UPDATE users SET first_name=$1,last_name=$2,address=$3,phone=$4
       WHERE id=$5 RETURNING id,username,email,role,first_name,last_name,address,phone`,
      [fields.first_name, fields.last_name, fields.address, fields.phone, id]
    );
    return rows[0] || null;
  },
  async updateRole(id, role) {
    const { rows } = await pool.query(
      'UPDATE users SET role=$1 WHERE id=$2 RETURNING id,username,email,role', [role, id]
    );
    return rows[0] || null;
  },
  async delete(id) {
    const { rowCount } = await pool.query('DELETE FROM users WHERE id=$1', [id]);
    return rowCount > 0;
  },
  async verifyPassword(plain, hash) { return bcrypt.compare(plain, hash); },
  async emailExists(email, excludeId=null) {
    const q = excludeId ? 'SELECT 1 FROM users WHERE email=$1 AND id!=$2' : 'SELECT 1 FROM users WHERE email=$1';
    const { rowCount } = await pool.query(q, excludeId ? [email, excludeId] : [email]);
    return rowCount > 0;
  },
  async usernameExists(username, excludeId=null) {
    const q = excludeId ? 'SELECT 1 FROM users WHERE username=$1 AND id!=$2' : 'SELECT 1 FROM users WHERE username=$1';
    const { rowCount } = await pool.query(q, excludeId ? [username, excludeId] : [username]);
    return rowCount > 0;
  },
};
module.exports = User;
