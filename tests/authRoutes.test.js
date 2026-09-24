const request = require('supertest');
const createApp = require('../src/app');
const userStore = require('../src/models/userStore');

const app = createApp();

beforeEach(() => userStore.reset());

describe('POST /api/auth/register', () => {
  test('registra un usuario nuevo', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'ana', password: '123456', role: 'administrador' });

    expect(res.status).toBe(201);
    expect(res.body.user.username).toBe('ana');
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  test('rechaza si faltan campos', async () => {
    const res = await request(app).post('/api/auth/register').send({ username: 'ana' });
    expect(res.status).toBe(400);
  });

  test('rechaza contraseñas muy cortas', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'ana', password: '123' });
    expect(res.status).toBe(400);
  });

  test('rechaza usuarios duplicados', async () => {
    await request(app).post('/api/auth/register').send({ username: 'ana', password: '123456' });
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'ana', password: '654321' });
    expect(res.status).toBe(409);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send({ username: 'ana', password: '123456' });
  });

  test('inicia sesión con credenciales correctas y devuelve un token', async () => {
    const res = await request(app).post('/api/auth/login').send({ username: 'ana', password: '123456' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test('rechaza credenciales incorrectas', async () => {
    const res = await request(app).post('/api/auth/login').send({ username: 'ana', password: 'mala' });
    expect(res.status).toBe(401);
  });

  test('rechaza si faltan campos', async () => {
    const res = await request(app).post('/api/auth/login').send({ username: 'ana' });
    expect(res.status).toBe(400);
  });

  test('rechaza usuario inexistente', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'no-existe', password: '123456' });
    expect(res.status).toBe(401);
  });
});
