import Sequelize from 'sequelize';

import User from '../app/models/User';
import Recipients from '../app/models/Recipients';
import Deliverymans from '../app/models/Deliverymans';

import databaseConfig from '../config/database';

const models = [User, Recipients, Deliverymans];

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.connection = new Sequelize(databaseConfig);

    models.map(model => model.init(this.connection));
  }
}

export default new Database();
