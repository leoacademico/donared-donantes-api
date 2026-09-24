const request = require('supertest');
const createApp = require('../src/app');
const userStore = require('../src/models/userStore');
const donorStore = require('../src/models/donorStore');

const app = createApp();

let adminToken;
let userToken;

beforeEach(async () => {
  userStore.reset();
  donorStore.reset();

  await request(app)
    .post('/api/auth/register')
    .send({ username: 'admin', password: '123456', role: 'administrador' });
  await request(app)
    .post('/api/auth/register')
    .send({ username: 'user', password: '123456', role: 'usuario' });

  const adminLogin = await request(app)
    .post('/api/auth/login')
    .send({ username: 'admin', password: '123456' });
  const userLogin = await request(app)
    .post('/api/auth/login')
    .send({ username: 'user', password: '123456' });

  adminToken = adminLogin.body.token;
  userToken = userLogin.body.token;
});

describe('GET /api/donors', () => {
  test('rechaza sin token', async () => {
    const res = await request(app).get('/api/donors');
    expect(res.status).toBe(401);
  });

  test('permite listar a cualquier usuario autenticado', async () => {
    const res = await request(app).get('/api/donors').set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.donors).toEqual([]);
  });
});

describe('POST /api/donors', () => {
  test('el rol usuario no puede crear donantes', async () => {
    const res = await request(app)
      .post('/api/donors')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Juan', email: 'juan@mail.com' });
    expect(res.status).toBe(403);
  });

  test('el rol administrador puede crear donantes', async () => {
    const res = await request(app)
      .post('/api/donors')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Juan', email: 'juan@mail.com', bloodType: 'O+' });
    expect(res.status).toBe(201);
    expect(res.body.donor.name).toBe('Juan');
  });

  test('rechaza datos inválidos', async () => {
    const res = await request(app)
      .post('/api/donors')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Sin email' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/donors/:id', () => {
  test('retorna 404 si el donante no existe', async () => {
    const res = await request(app).get('/api/donors/999').set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(404);
  });

  test('retorna el donante si existe', async () => {
    const created = await request(app)
      .post('/api/donors')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Juan', email: 'juan@mail.com' });

    const res = await request(app)
      .get(`/api/donors/${created.body.donor.id}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.donor.name).toBe('Juan');
  });
});

describe('PUT /api/donors/:id', () => {
  test('el rol usuario no puede actualizar', async () => {
    const created = await request(app)
      .post('/api/donors')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Juan', email: 'juan@mail.com' });

    const res = await request(app)
      .put(`/api/donors/${created.body.donor.id}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Hackeado' });

    expect(res.status).toBe(403);
  });

  test('el administrador puede actualizar un donante existente', async () => {
    const created = await request(app)
      .post('/api/donors')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Juan', email: 'juan@mail.com' });

    const res = await request(app)
      .put(`/api/donors/${created.body.donor.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Juan Actualizado' });

    expect(res.status).toBe(200);
    expect(res.body.donor.name).toBe('Juan Actualizado');
  });

  test('retorna 404 al actualizar un donante inexistente', async () => {
    const res = await request(app)
      .put('/api/donors/999')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'x' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/donors/:id', () => {
  test('el rol usuario no puede eliminar', async () => {
    const created = await request(app)
      .post('/api/donors')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Juan', email: 'juan@mail.com' });

    const res = await request(app)
      .delete(`/api/donors/${created.body.donor.id}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
  });

  test('el administrador puede eliminar un donante existente', async () => {
    const created = await request(app)
      .post('/api/donors')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Juan', email: 'juan@mail.com' });

    const res = await request(app)
      .delete(`/api/donors/${created.body.donor.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(204);
  });

  test('retorna 404 al eliminar un donante inexistente', async () => {
    const res = await request(app)
      .delete('/api/donors/999')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });
});
