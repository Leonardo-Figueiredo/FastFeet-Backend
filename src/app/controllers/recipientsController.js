import * as Yup from 'yup';
import User from '../models/User';
import Recipients from '../models/Recipients';

class RecipientsController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      cpf: Yup.string()
        .required()
        .min(11)
        .max(11),
      street: Yup.string()
        .required()
        .max(30),
      number: Yup.string()
        .required()
        .max(5),
      complement: Yup.string()
        .required()
        .max(30),
      state: Yup.string()
        .required()
        .max(15),
      city: Yup.string()
        .required()
        .max(15),
      zipcode: Yup.string()
        .required()
        .max(8),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Request is not valid.' });
    }

    const user = await User.findByPk(req.userId);
    const userIsAdmin = await User.findOne({
      where: { id: user.id, admin: true },
    });

    if (!userIsAdmin) {
      return res
        .status(401)
        .json({ error: 'Only administrators can store a new recipient.' });
    }

    const recipientExists = await Recipients.findOne({
      where: { cpf: req.body.cpf },
    });

    if (recipientExists) {
      return res.status(400).json({ error: 'Recipient already exists.' });
    }

    const {
      id,
      cpf,
      name,
      street,
      number,
      complement,
      state,
      city,
      zipcode,
    } = await Recipients.create(req.body);

    return res.json({
      id,
      name,
      cpf,
      street,
      number,
      complement,
      state,
      city,
      zipcode,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      cpf: Yup.string()
        .required()
        .min(11)
        .max(11),
      street: Yup.string().max(30),
      number: Yup.string().max(5),
      complement: Yup.string().max(30),
      state: Yup.string().max(15),
      city: Yup.string().max(15),
      zipcode: Yup.string().max(8),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Request is not valid.' });
    }

    const { cpf } = req.body;

    const recipient = await Recipients.findOne({
      where: { cpf },
    });

    if (!recipient) {
      return res.status(404).json({ error: 'CPF not recognized' });
    }

    const {
      id,
      name,
      street,
      number,
      complement,
      state,
      city,
      zipcode,
    } = await recipient.update(req.body);

    return res.json({
      id,
      cpf,
      name,
      street,
      number,
      complement,
      state,
      city,
      zipcode,
    });
  }
}

export default new RecipientsController();
