import * as Yup from 'yup';

import Deliverymans from '../models/Deliverymans';
import User from '../models/User';

class DeliverymansController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string()
        .max(45)
        .required(),
      email: Yup.string()
        .email()
        .required(),
    });

    const userIsAdmin = await User.findOne({
      where: { id: req.userId, admin: true },
    });

    if (!userIsAdmin) {
      return res
        .status(401)
        .json({ error: 'Only admins can register a new Deliveryman.' });
    }

    return res.json({ ok: 'true' });
  }

  async index(req, res) {
    const deliverymans = await Deliverymans.findAll();
    res.json(deliverymans);
  }

  async update(req, res) {
    res.json();
  }

  async delete(req, res) {
    res.json();
  }
}

export default new DeliverymansController();
