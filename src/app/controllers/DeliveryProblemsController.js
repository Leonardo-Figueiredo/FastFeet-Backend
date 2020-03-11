import * as Yup from 'yup';

import Orders from '../models/Orders';
import DeliveryProblems from '../models/DeliveryProblems';
import Deliveryman from '../models/Deliverymans';

class DeliveryProblemsController {
  async store(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number()
        .positive()
        .required(),
      description: Yup.string()
        .max(350)
        .required(),
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Request is not valid.' });
    }
    const { id: order_id } = req.params;
    const { id: deliveryman_id, description } = req.body;

    const order = await Orders.findByPk(order_id);
    if (!order) {
      return res.status(404).json({ error: 'This order does not exists' });
    }

    const deliveryman = await Deliveryman.findByPk(deliveryman_id);
    if (!deliveryman) {
      return res.status(404).json({ error: 'Deliveryman not found.' });
    }

    if (order.deliveryman_id !== deliveryman_id) {
      return res
        .status(401)
        .json({ error: 'This order dont belongs this deliveryman.' });
    }

    const deliveryProblem = await DeliveryProblems.create({
      delivery_id: order_id,
      description,
    });

    const { id, delivery_id, description: desc } = deliveryProblem;

    return res.json({ id, delivery_id, desc });
  }

  async index(req, res) {
    const { page = 1 } = req.query;

    const problemDeliveries = await DeliveryProblems.findAll({
      attributes: ['id', 'delivery_id', 'description'],
      limit: 20,
      offset: (page - 1) * 20,
    });

    return res.json(problemDeliveries);
  }

  async show(req, res) {
    const { id } = req.params;
    const { page = 1 } = req.query;

    const problem = await DeliveryProblems.findOne({
      where: {
        delivery_id: id,
      },
    });
    if (!problem) {
      return res
        .status(404)
        .json({ error: 'This order has no registred problems.' });
    }

    const deliveryProblem = await DeliveryProblems.findAll({
      where: {
        delivery_id: id,
      },
      attributes: ['id', 'delivery_id', 'description'],
      limit: 20,
      offset: (page - 1) * 20,
    });

    return res.json(deliveryProblem);
  }

  async delete(req, res) {
    const { problem_id } = req.params;

    const problem = await DeliveryProblems.findByPk(problem_id, {
      attributes: ['id'],
      include: [
        {
          model: Orders,
          as: 'orders',
          attributes: ['id', 'canceled_at'],
        },
      ],
    });

    if (!problem) {
      return res.status(404).json({ error: 'Problem not found.' });
    }

    if (problem.orders.canceled_at) {
      return res.status(401).json({ error: 'This order already canceled.' });
    }

    await problem.orders.update({ canceled_at: new Date() });

    return res.json(problem);
  }
}

export default new DeliveryProblemsController();
