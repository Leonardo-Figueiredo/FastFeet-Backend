import Sequelize from 'sequelize';

import User from '../app/models/User';
import Recipients from '../app/models/Recipients';
import Deliverymans from '../app/models/Deliverymans';
import File from '../app/models/Files';
import Order from '../app/models/Orders';
import DeliveryProblems from '../app/models/DeliveryProblems';

import databaseConfig from '../config/database';

const models = [File, User, Recipients, Deliverymans, Order, DeliveryProblems];

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.connection = new Sequelize(databaseConfig);

    /** We need return model to loader
     * in
     * Model is required "return this" for model map()
     */
    models
      .map(model => model.init(this.connection))
      .map(model => model.associate && model.associate(this.connection.models));
  }
}

export default new Database();
