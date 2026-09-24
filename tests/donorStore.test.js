const donorStore = require('../src/models/donorStore');

beforeEach(() => donorStore.reset());

describe('donorStore', () => {
  test('create agrega un donante válido', () => {
    const donor = donorStore.create({ name: 'Juan Pérez', email: 'juan@mail.com', bloodType: 'O+' });
    expect(donor.id).toBe(1);
    expect(donor.name).toBe('Juan Pérez');
    expect(donor.createdAt).toBeDefined();
  });

  test('create lanza error si faltan campos obligatorios', () => {
    expect(() => donorStore.create({ name: 'Sin email' })).toThrow('name y email son obligatorios');
  });

  test('create lanza error si el email ya está registrado', () => {
    donorStore.create({ name: 'Juan', email: 'juan@mail.com' });
    expect(() => donorStore.create({ name: 'Otro Juan', email: 'juan@mail.com' })).toThrow(
      'Ya existe un donante con ese email'
    );
  });

  test('getAll retorna todos los donantes', () => {
    donorStore.create({ name: 'Juan', email: 'juan@mail.com' });
    donorStore.create({ name: 'Ana', email: 'ana@mail.com' });
    expect(donorStore.getAll()).toHaveLength(2);
  });

  test('getById retorna el donante correcto o undefined', () => {
    const donor = donorStore.create({ name: 'Juan', email: 'juan@mail.com' });
    expect(donorStore.getById(donor.id).name).toBe('Juan');
    expect(donorStore.getById(9999)).toBeUndefined();
  });

  test('update modifica los campos indicados', () => {
    const donor = donorStore.create({ name: 'Juan', email: 'juan@mail.com' });
    const updated = donorStore.update(donor.id, { name: 'Juan Actualizado', phone: '555-0000' });
    expect(updated.name).toBe('Juan Actualizado');
    expect(updated.phone).toBe('555-0000');
    expect(updated.email).toBe('juan@mail.com');
  });

  test('update retorna null si el donante no existe', () => {
    expect(donorStore.update(9999, { name: 'x' })).toBeNull();
  });

  test('remove elimina un donante existente y retorna false si no existe', () => {
    const donor = donorStore.create({ name: 'Juan', email: 'juan@mail.com' });
    expect(donorStore.remove(donor.id)).toBe(true);
    expect(donorStore.getAll()).toHaveLength(0);
    expect(donorStore.remove(9999)).toBe(false);
  });
});
