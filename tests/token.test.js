const { signToken, verifyToken } = require('../src/utils/token');

describe('token utils', () => {
  test('signToken genera un token verificable con el payload correcto', () => {
    const token = signToken({ id: 1, username: 'ana', role: 'administrador' });
    const decoded = verifyToken(token);
    expect(decoded.id).toBe(1);
    expect(decoded.username).toBe('ana');
    expect(decoded.role).toBe('administrador');
  });

  test('verifyToken lanza error con un token inválido', () => {
    expect(() => verifyToken('token-invalido')).toThrow();
  });
});
