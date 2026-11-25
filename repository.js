const { getDb } = require('./data_source');
// Không bao giờ trả _id ra client
const PROJECTION = { _id: 0 };
function products() {
  return getDb().collection('products');
}
// GET /products, GET /products?limit=n
async function findAll(limit) {
  const cursor = products().find({}, { projection: PROJECTION }).sort({ id: 1 });
  if (limit === undefined) return cursor.toArray();
  if (limit === 0) return [];  // .limit(0) trong Mongo = KHÔNG giới hạn
  return cursor.limit(limit).toArray();
}
async function findById(id) {
  if (!Number.isInteger(id)) return null;
  return products().findOne({ id }, { projection: PROJECTION });
}
// Bộ đếm id tự tăng, atomic
async function nextId() {
  const counter = await getDb()
    .collection('counters')
    .findOneAndUpdate(
      { _id: 'products' },
      { $inc: { seq: 1 } },
      { returnDocument: 'after' }
    );
  return counter.seq;
}
// POST
async function create(fields) {
  const product = { id: await nextId(), ...fields };
  await products().insertOne({ ...product });   // spread: insertOne gắn _id vào object gốc
  return product;
}
// PUT
async function replace(id, fields) {
  if (!Number.isInteger(id)) return null;
  const doc = { id, ...fields };                // thay toàn bộ, bỏ field cũ
  const result = await products().replaceOne({ id }, doc);
  if (result.matchedCount === 0) return null;
  return doc;
}
// PATCH
async function update(id, fields) {
  if (!Number.isInteger(id)) return null;
  const result = await products().findOneAndUpdate(
    { id },
    { $set: fields },                           // chỉ sửa field được gửi lên
    { returnDocument: 'after', projection: PROJECTION }
  );
  return result ?? null;
}
// DELETE
async function remove(id) {
  if (!Number.isInteger(id)) return null;
  const result = await products().findOneAndDelete({ id }, { projection: PROJECTION });
  return result ?? null;
}
module.exports = { findAll, findById, create, replace, update, remove };
