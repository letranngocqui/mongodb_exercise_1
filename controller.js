const { sendJson, readJsonBody } = require('./utils/http');
const { validateProduct, validatePatch } = require('./utils/validate');
const repo = require('./repository');

function parseId(idParam) {
  return /^\d+$/.test(idParam) ? Number(idParam) : NaN;
}

async function readFields(req) {
  try {
    const body = await readJsonBody(req);
    const { id: _ignored, ...fields } = body;
    return { fields };
  } catch (err) {
    return { error: err.message };
  }
}

// GET /products, GET /products?limit=n
async function getList(req, res, { url }) {
  const limitParam = url.searchParams.get('limit');
  if (limitParam === null) {
    return sendJson(res, 200, await repo.findAll());
  }
  if (!(/^\d+$/.test(limitParam))) {
    return sendJson(res, 400, { error: 'limit must be an integer >= 0' });
  }
  return sendJson(res, 200, await repo.findAll(Number(limitParam)));
}

// GET /products/id
async function getOne(req, res, { id }) {
  const product = await repo.findById(parseId(id));
  if (product === null)
    return sendJson(res, 404, { error: 'NOT FOUND' });
  return sendJson(res, 200, product);
}

// POST /products
async function createProduct(req, res) {
  const { fields, error } = await readFields(req);
  if (error)
    return sendJson(res, 400, { error });
  const validationErr = validateProduct(fields);
  if (validationErr)
    return sendJson(res, 400, { validationErr });
  return sendJson(res, 201, await repo.create(fields));
}

// PUT /products/id
async function replaceProduct(req, res, { id }) {
  const { fields, error } = await readFields(req);
  if (error)
    return sendJson(res, 400, { error });
  const validationErr = validateProduct(fields);
  if (validationErr)
    return sendJson(res, 400, { validationErr });
  const product = await repo.replace(parseId(id), fields);
  if (product === null)
    return sendJson(res, 404, { error: 'NOT FOUND' });
  return sendJson(res, 200, product);
}

// PATCH /products/id
async function updateProduct(req, res, { id }) {
  const { fields, error } = await readFields(req);
  if (error)
    return sendJson(res, 400, { error });
  const validationErr = validatePatch(fields);
  if (validationErr)
    return sendJson(res, 400, { validationErr });
  const product = await repo.update(parseId(id), fields);
  if (product === null)
    return sendJson(res, 404, { error: 'NOT FOUND' });
  return sendJson(res, 200, product);
}

// DELETE /products/id
async function removeProduct(req, res, { id }) {
  const deleted = await repo.remove(parseId(id));
  if (deleted === null)
    return sendJson(res, 404, { error: 'NOT FOUND' });
  return sendJson(res, 200, deleted);
}

module.exports = { getList, getOne, createProduct, replaceProduct, updateProduct, removeProduct };
