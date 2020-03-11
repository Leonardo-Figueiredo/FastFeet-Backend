import { Op } from 'sequelize';
import * as Yup from 'yup';
import { startOfDay, endOfDay, isBefore, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import Deliverymans from '../models/Deliverymans';
import Orders from '../models/Orders';
import File from '../models/Files';

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
    const { id: deliveryman_id, order_id } = req.params;

    /**
     * Check if Deliveryman exists.
     */
    const deliveryman = await Deliverymans.findByPk(deliveryman_id);
    if (!deliveryman) {
      return res
        .status(404)
        .json({ error: `Deliveryman ${deliveryman_id} not found.` });
    }

    /**
     * Check if Order exists.
     */
    const order = await Orders.findByPk(order_id);
    if (!order) {
      return res.status(404).json({ error: `Order ${order_id} not found.` });
    }

    const schema = Yup.object().shape({
      start_date: Yup.date(),
      end_date: Yup.date(),
      signature_id: Yup.number()
        .positive()
        .when('end_date', (end_date, field) =>
          end_date ? field.required() : field
        ),
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Request is not valid.' });
    }

    const { start_date, end_date, signature_id } = req.body;

    /**
     * Check if start date and end date are in the same request.
     */
    if (start_date && end_date) {
      return res
        .status(401)
        .json({ error: "You can't send end an start date together." });
    }

    /**
     * Check if delivery man tries to change the start date.
     */
    if (start_date && order.start_date) {
      return res.status(401).json({ error: 'Start date already exists.' });
    }

    /**
     * Check if order already finalized.
     */
    if (order.end_date) {
      return res.status(401).json({ error: 'This order already finalized.' });
    }

    /**
     * Check if this order belongs to this deliveryman.
     */
    // eslint-disable-next-line eqeqeq
    if (order.deliveryman_id != deliveryman_id) {
      return res
        .status(401)
        .json({ error: 'This order belongs a another deliveryman.' });
    }

    const today = new Date();

    const withdrawals = await Orders.count({
      where: {
        deliveryman_id,
        updated_at: {
          [Op.ne]: null,
          [Op.between]: [
            startOfDay(today, { locale: ptBR }),
            endOfDay(today, { locale: ptBR }),
          ],
        },
      },
      limit: 6,
    });

    /**
     * Check if Deliveryman already made 5 withdrawls.
     */
    if (withdrawals > 5) {
      return res
        .status(401)
        .json({ error: 'You have expired your withdrawal limit.' });
    }

    /**
     * Check if signature_id without end_date
     */
    if (signature_id && !end_date) {
      return res
        .status(401)
        .json({ error: 'End date is required if you send a signature.' });
    }

    /**
     * Check if signature_id exists
     */
    if (signature_id && !(await File.findByPk(signature_id))) {
      return res.status(404).json({ error: 'This signature do not exists.' });
    }

    /**
     * Check if start date exists to put the end_date
     */
    if (end_date && !order.start_date) {
      return res
        .status(401)
        .json({ error: 'This order has not yet been withdrawn' });
    }

    /**
     * Check if end_date is before start date.
     */
    if (isBefore(parseISO(end_date), order.start_date)) {
      return res
        .status(401)
        .json({ error: 'End date cannot be earlier than start date.' });
    }
    await order.update({ start_date, end_date, signature_id });

    return res.json(order);
  }
}

export default new DeliveryController();
