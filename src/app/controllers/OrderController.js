import * as Yup from 'yup';
import { parseISO, format, isBefore } from 'date-fns';

import Orders from '../models/Orders';
import Deliveryman from '../models/Deliverymans';
import Recipient from '../models/Recipients';
import User from '../models/User';
import File from '../models/Files';

import OrderMail from '../jobs/OrderMail';
import Queue from '../../lib/Queue';

class OrderController {
  async store(req, res) {
    const userIsAdmin = await User.findOne({
      where: { id: req.userId, admin: true },
    });
    if (!userIsAdmin) {
      return res
        .status(401)
        .json({ error: 'Only admins can store a new order.' });
    }

    const schema = Yup.object().shape({
      recipient_id: Yup.number()
        .integer()
        .positive()
        .required(),
      deliveryman_id: Yup.number()
        .integer()
        .positive()
        .required(),
      signature_id: Yup.number()
        .integer()
        .positive(),
      product: Yup.string()
        .max(60)
        .required()
        .min(3),
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Request is not valid.' });
    }

    const {
      deliveryman_id,
      recipient_id,
      product,
      signature_id = null,
    } = req.body;

    const deliveryman = await Deliveryman.findByPk(deliveryman_id);
    const recipient = await Recipient.findByPk(recipient_id);
    if (!deliveryman || !recipient) {
      return res
        .status(404)
        .json({ error: 'Deliveryman or Recipient not found.' });
    }

    const order = await Orders.create({
      deliveryman_id,
      recipient_id,
      signature_id,
      product,
    });

    await Queue.add(OrderMail.key, {
      recipient,
      deliveryman,
    });

    return res.json(order);
  }

  async index(req, res) {
    const userIsAdmin = await User.findOne({
      where: { id: req.userId, admin: true },
    });
    if (!userIsAdmin) {
      return res
        .status(401)
        .json({ error: 'Only admins can list the orders.' });
    }

    const shape = Yup.object().shape({
      page: Yup.number()
        .positive()
        .integer(),
    });
    if (!(await shape.isValid(req.query))) {
      return res.status(400).json({ error: 'Page number is not valid.' });
    }

    const { page = 1 } = req.query;

    const order = await Orders.findAll({
      where: { canceled_at: null },
      attributes: ['id', 'product', 'start_date', 'end_date'],
      order: ['id'],
      limit: 20,
      offset: 20 * (page - 1),
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: [
            'id',
            'name',
            'street',
            'number',
            'complement',
            'state',
            'city',
            'zipcode',
          ],
        },
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    return res.json(order);
  }

  async update(req, res) {
    const userIsAdmin = await User.findOne({
      where: { id: req.userId, admin: true },
    });
    if (!userIsAdmin) {
      return res
        .status(401)
        .json({ error: 'Only admins can update the orders.' });
    }

    const schema = Yup.object().shape({
      recipient_id: Yup.number()
        .integer()
        .positive(),
      deliveryman_id: Yup.number()
        .integer()
        .positive(),
      signature_id: Yup.number()
        .integer()
        .positive()
        .nullable(),
      product: Yup.string().max(45),
      canceled_at: Yup.date().nullable(),
      start_date: Yup.date().nullable(),
      end_date: Yup.date().nullable(),
    });
    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Request format is invalid.' });

    const { id } = req.params;

    const order = await Orders.findByPk(id);
    if (!order) return res.status(404).json({ error: 'Order not found.' });

    const {
      recipient_id,
      deliveryman_id,
      signature_id,
      product,
      canceled_at,
      start_date,
      end_date,
    } = req.body;

    if (recipient_id && !(await Recipient.findByPk(recipient_id))) {
      return res.status(404).json({
        error: `This Recipient(ID): ${recipient_id} does not exists.`,
      });
    }

    if (deliveryman_id && !(await Deliveryman.findByPk(deliveryman_id))) {
      return res.status(404).json({
        error: `This Deliveryman(ID): ${deliveryman_id} does not exists.`,
      });
    }

    if (signature_id && !(await File.findByPk(signature_id))) {
      return res.status(404).json({
        error: `This Signature(ID): ${signature_id} does not exists.`,
      });
    }

    /**
     * Check start_date interval.
     */
    if (start_date) {
      const schedule = format(parseISO(start_date), 'HH:mm');
      const hours = schedule.substring(0, 2);
      const minutes = schedule.substring(3);

      /**
       * Check if the date is in a valid period.
       */
      if (
        hours < 8 ||
        hours > 18 ||
        minutes < 0 ||
        minutes > 59 ||
        // eslint-disable-next-line eqeqeq
        (hours == 18 && minutes != 0)
      ) {
        return res
          .status(400)
          .json({ error: `This schedule (${schedule}) is invalid.` });
      }
    }

    /**
     * Check if the order has been picked up by Deliveryman
     */
    if (end_date) {
      const deliveryExists = await Orders.findOne({
        where: { id, start_date: null },
      });
      if (deliveryExists) {
        return res.status(401).json({
          error: `Order with ID: ${id} has not yet been picked up by the Deliveryman.`,
        });
      }
    }

    /**
     * Check if  end_date is before start_date
     */
    if (order.start_date) {
      const checkIsBefore = isBefore(parseISO(end_date), order.start_date);

      if (checkIsBefore) {
        return res
          .status(400)
          .json({ error: 'The start date cannot be earlier than end date.' });
      }
    }

    const updatedOrder = await order.update({
      recipient_id,
      deliveryman_id,
      signature_id,
      product,
      canceled_at,
      start_date,
      end_date,
    });

    return res.json(updatedOrder);
  }

  async destroy(req, res) {
    const userIsAdmin = await User.findOne({
      where: { id: req.userId, admin: true },
    });
    if (!userIsAdmin) {
      return res
        .status(401)
        .json({ error: 'Only admins can update the orders.' });
    }

    const order = await Orders.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found.' });

    const orderId = order.id;

    await order.update({ canceled_at: new Date() });

    return res.status(200).json({
      message: `Order with ID: ${orderId} has been successfully canceled`,
    });
  }
}

export default new OrderController();
