const userStore = require('../src/models/userStore');
const { roles } = require('../src/config');

beforeEach(() => userStore.reset());

describe('userStore', () => {
  test('createUser crea un usuario con rol válido', () => {
    const user = userStore.createUser({ username: 'ana', password: '123456', role: roles.ADMIN });
    expect(user.username).toBe('ana');
    expect(user.role).toBe(roles.ADMIN);
    expect(user.passwordHash).not.toBe('123456');
  });

  test('createUser asigna rol usuario por defecto si el rol es inválido', () => {
    const user = userStore.createUser({ username: 'luis', password: '123456', role: 'root' });
    expect(user.role).toBe(roles.USER);
  });

  test('createUser lanza error si el usuario ya existe', () => {
    userStore.createUser({ username: 'ana', password: '123456' });
    expect(() => userStore.createUser({ username: 'ana', password: 'otraClave' })).toThrow(
      'El usuario ya existe'
    );
  });

  test('findByUsername encuentra un usuario existente', () => {
    userStore.createUser({ username: 'ana', password: '123456' });
    expect(userStore.findByUsername('ana')).toBeDefined();
    expect(userStore.findByUsername('no-existe')).toBeUndefined();
  });

  test('findById encuentra un usuario por id', () => {
    const created = userStore.createUser({ username: 'ana', password: '123456' });
    expect(userStore.findById(created.id).username).toBe('ana');
  });

  test('validatePassword valida correctamente contraseñas correctas e incorrectas', () => {
    const user = userStore.createUser({ username: 'ana', password: '123456' });
    expect(userStore.validatePassword(user, '123456')).toBe(true);
    expect(userStore.validatePassword(user, 'incorrecta')).toBe(false);
  });

  test('toSafeUser oculta el passwordHash y maneja null', () => {
    const user = userStore.createUser({ username: 'ana', password: '123456' });
    const safe = userStore.toSafeUser(user);
    expect(safe.passwordHash).toBeUndefined();
    expect(safe.username).toBe('ana');
    expect(userStore.toSafeUser(null)).toBeNull();
  });
});
