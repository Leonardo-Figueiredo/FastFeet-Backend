import Sequelize, { Model } from 'sequelize';

class Deliverymans extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        avatar_id: Sequelize.STRING,
        email: Sequelize.STRING,
      },
      { sequelize }
    );
  }
}

export default Deliverymans;
