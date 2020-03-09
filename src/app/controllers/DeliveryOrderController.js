import { Op } from 'sequelize';
import * as Yup from 'yup';
import {
  format,
  parseISO,
  isBefore,
  startOfDay,
  endOfDay,
  toDate,
} from 'date-fns';

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

  async store(req, res) {
    const { id: deliveryman_id, order_id } = req.params;

    const deliveryman = await Deliverymans.findByPk(deliveryman_id);
    if (!deliveryman) {
      return res
        .status(404)
        .json({ error: `Deliveryman ${deliveryman_id} not found.` });
    }

    const order = await Orders.findByPk(order_id);
    if (!order) {
      return res.status(404).json({ error: `Order ${order_id} not found.` });
    }

    const schema = Yup.object().shape({ start_date: Yup.date().required() });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Request is not valid.' });
    }

    if (order.start_date) {
      return res.status(401).json({ error: 'Start date already exists.' });
    }

    if (order.end_date) {
      return res.status(401).json({ error: 'This order already finalized.' });
    }

    const { start_date } = req.body;

    const parsedDate = toDate(start_date);

    const { count, rows } = await Orders.findAndCountAll({
      where: {
        start_date: {
          [Op.ne]: null,
          [Op.between]: [startOfDay(parsedDate), endOfDay(parsedDate)],
        },
        deliveryman_id,
      },
    });

    if (count > 5) {
      return res
        .status(401)
        .json({ error: 'You have expired your withdrawal limit.' });
    }
    /**
     * Change start_date to upgradet_at, and we can limit a 5 times.
     */

    await order.update({ start_date });

    return res.json();
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

    const { start_date, end_date } = req.body;

    if (start_date) {
      if (order.start_date) {
        return res.status(401).json({ error: 'Start date already exists.' });
      }
    }

    /**
     * Check if  end_date is before start_date && if have a started date.
     */
    if (end_date) {
      if (order.start_date) {
        const checkIsBefore = isBefore(parseISO(end_date), order.start_date);

        if (checkIsBefore) {
          return res
            .status(400)
            .json({ error: 'The start date cannot be earlier than end date.' });
        }
      } else {
        return res
          .status(401)
          .json({ error: 'You cant finalize an delivery without start.' });
      }
    }

    return res.json(order);
  }
}

export default new DeliveryController();
