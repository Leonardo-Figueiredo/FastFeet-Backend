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
    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Request format is not valid.' });

    const userIsAdmin = await User.findOne({
      where: { id: req.userId, admin: true },
    });
    if (!userIsAdmin) {
      return res
        .status(401)
        .json({ error: 'Only admins can register a new Deliveryman.' });
    }

    const { email, name } = req.body;

    const deliverymanExists = await Deliverymans.findOne({
      where: { email },
    });
    if (deliverymanExists)
      return res.status(401).json({ error: 'Deliveryman already exists.' });

    const deliveryman = await Deliverymans.create({ name, email });

    return res.json(deliveryman);
  }

  async index(req, res) {
    const shape = Yup.object().shape({
      page: Yup.number()
        .positive()
        .integer(),
    });
    if (!(await shape.isValid(req.query))) {
      return res.status(400).json({ error: 'Page number is not valid.' });
    }

    const { page = 1 } = req.query;

    const deliverymans = await Deliverymans.findAll({
      order: ['id'],
      limit: 20,
      offset: (page - 1) * 20,
    });
    return res.json(deliverymans);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().max(45),
      avatar_id: Yup.number().max(3),
      email: Yup.string().email(),
      oldEmail: Yup.string()
        .email()
        .when('email', (email, field) => (email ? field.required() : field)),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Request is not valid.' });
    }

    const userIsAdmin = await User.findOne({
      where: { id: req.userId, admin: true },
    });
    if (!userIsAdmin) {
      return res
        .status(401)
        .json({ error: 'Only admins can register a new Deliveryman.' });
    }

    const { email, oldEmail, avatar_id } = req.body;

    const deliveryman = await Deliverymans.findOne({
      where: { email: oldEmail },
    });
    if (!deliveryman) {
      return res.status(404).json({ error: 'Deliveryman not found.' });
    }

    if (email) {
      const emailExists = await Deliverymans.findOne({
        where: { email },
      });
      if (emailExists) {
        return res.status(401).json({ error: 'This email already registred.' });
      }
    }

    if (avatar_id) {
      const file = await Deliverymans.findOne({ where: { avatar_id } });
      if (file) {
        return res.status(401).json({ error: 'Avatar is unique.' });
      }
    }

    // const { email, name, avatar_id } = await deliveryman.update(req.body);
    const update = await deliveryman.update(req.body);

    return res.json(update);
  }

  async delete(req, res) {
    const userIsAdmin = await User.findOne({
      where: { id: req.userId, admin: true },
    });
    if (!userIsAdmin) {
      return res
        .status(401)
        .json({ error: 'Only admins can delete a Deliveryman.' });
    }

    const deliveryman = await Deliverymans.findByPk(req.params.id);
    if (!deliveryman) {
      return res.status(404).json({ error: 'Deliveryman not found.' });
    }
    await deliveryman.destroy();

    return res
      .status(200)
      .json({ message: 'The deliveryman has been successfully deleted' });
  }
}

export default new DeliverymansController();
