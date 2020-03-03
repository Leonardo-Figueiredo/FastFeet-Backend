import Sequelize, { Model } from 'sequelize';

class Orders extends Model {
  static init(sequelize) {
    super.init(
      {
        product: Sequelize.STRING,
      },
      { sequelize }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Recipients, { foreignKey: 'recipient_id' });
    this.belongsTo(models.Deliverymans, { foreignKey: 'deliveryman_id' });
    this.belongsTo(models.Files, { foreignKey: 'signature_id' });
  }
}

export default Orders;
