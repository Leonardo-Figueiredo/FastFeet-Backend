import * as Yup from 'yup';

import Orders from '../models/Orders';
import Deliveryman from '../models/Deliverymans';
import Recipient from '../models/Recipients';
import File from '../models/Files';

class OrderController {
  async store(req, res) {
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

    const { deliveryman_id, recipient_id } = req.body;

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
      signature_id: null,
      product: 'Canetas Azuis',
    });

    return res.json(order);
  }
}

export default new OrderController();
