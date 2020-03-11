module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('delivery_problems', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
      },
      delivery_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'deliverymans',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      description: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        AllowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        AllowNull: false,
      },
    });
  },

  down: queryInterface => {
    return queryInterface.dropTable('delivery_problems');
  },
};
