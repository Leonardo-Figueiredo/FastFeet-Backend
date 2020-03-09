import { Op } from 'sequelize';
import * as Yup from 'yup';

import Deliverymans from '../models/Deliverymans';
import Orders from '../models/Orders';

class DeliveryController {
  async index(req, res) {
    const { id } = req.params;
    const deliveryman = await Deliverymans.findByPk(id);

    if (!deliveryman) {
      return res
        .status(404)
        .json({ error: `Deliveryman with id: ${id} not found.` });
    }

    const order = await Orders.findAll({
      where: {
        deliveryman_id: id,
        end_date: null,
        canceled_at: null,
      },
      attributes: ['id', 'product', 'recipient_id'],
    });
    if (!order[0]) {
      return res.status(404).json({ error: 'This deliveryman has no orders.' });
    }

    return res.json(order);
  }

  async show(req, res) {
    const { id } = req.params;
    const deliveryman = await Deliverymans.findByPk(id);

    if (!deliveryman) {
      return res
        .status(404)
        .json({ error: `Deliveryman with id: ${id} not found.` });
    }

    const order = await Orders.findAll({
      where: {
        deliveryman_id: id,
        end_date: { [Op.ne]: null },
      },
      attributes: ['id', 'product', 'start_date', 'end_date', 'recipient_id'],
    });

    if (!order[0]) {
      return res
        .status(404)
        .json({ error: 'You dont have any delivery finalized.' });
    }

    return res.json(order);
  }

  async update(req, res) {
    const { id, order_id } = req.params;
    const deliveryman = await Deliverymans.findByPk(id);

    if (!deliveryman) {
      return res
        .status(404)
        .json({ error: `Deliveryman with id: ${id} not found.` });
    }

    const schema = Yup.object().shape({
      start_date: Yup.date(),
      end_date: Yup.date(),
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Request is not valid.' });
    }

    const order = await Orders.findByPk(order_id);
    if (!order) {
      return res.status(404).json({ error: `Order ${order_id} not found.` });
    }

    return res.json(order);
  }
}

export default new DeliveryController();