const { authenticate, authorize } = require('../src/middleware/auth');
const { signToken } = require('../src/utils/token');
const { roles } = require('../src/config');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('authenticate middleware', () => {
  test('rechaza si no hay header Authorization', () => {
    const req = { headers: {} };
    const res = mockRes();
    const next = jest.fn();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('rechaza si el token es inválido', () => {
    const req = { headers: { authorization: 'Bearer token-invalido' } };
    const res = mockRes();
    const next = jest.fn();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('permite continuar y agrega req.user si el token es válido', () => {
    const token = signToken({ id: 1, username: 'ana', role: roles.ADMIN });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    const next = jest.fn();

    authenticate(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user.username).toBe('ana');
  });
});

describe('authorize middleware', () => {
  test('rechaza si no hay usuario autenticado', () => {
    const req = {};
    const res = mockRes();
    const next = jest.fn();

    authorize(roles.ADMIN)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('rechaza si el rol no está permitido', () => {
    const req = { user: { role: roles.USER } };
    const res = mockRes();
    const next = jest.fn();

    authorize(roles.ADMIN)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test('permite continuar si el rol está permitido', () => {
    const req = { user: { role: roles.ADMIN } };
    const res = mockRes();
    const next = jest.fn();

    authorize(roles.ADMIN, roles.USER)(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
