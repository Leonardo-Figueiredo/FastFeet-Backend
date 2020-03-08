module.exports = {
  up: queryInterface => {
    return queryInterface.bulkInsert(
      'recipients',
      [
        {
          cpf: '123456',
          name: 'John Doe',
          street: 'Rua Angela Maria',
          number: 49,
          complement: 'Apto. 216 bloco B',
          state: 'São Paulo',
          city: 'São Paulo',
          zipcode: '12345678998',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  down: () => {},
};
