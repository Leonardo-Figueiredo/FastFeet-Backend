import Mail from '../../lib/Mail';

class OrderMail {
  get key() {
    return 'OrderMail';
  }

  async handle({ data }) {
    const { deliveryman, recipient } = data;

    await Mail.sendMail({
      to: `${deliveryman.name} <${deliveryman.email}>`,
      subject: `Nova encomenda para você ${deliveryman.name}`,
      template: 'deliveryStore',
      context: {
        deliveryman: deliveryman.name,
        recipient: recipient.name,
        state: recipient.state,
        city: recipient.city,
        street: recipient.street,
        number: recipient.number,
        zipcode: recipient.zipcode,
        complement: recipient.complement,
      },
    });
  }
}

export default new OrderMail();
