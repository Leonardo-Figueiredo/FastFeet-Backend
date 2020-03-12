import Mail from '../../lib/Mail';

class CancellationMail {
  get key() {
    return 'CancellationMail';
  }

  async handle(data) {
    const { problem } = data;

    await Mail.sendMail({
      to: `${problem.deliveryman.name} <${problem.deliveryman.email}>`,
      subject: `Encomenda cancelada ${problem.delivery_id}`,
      template: 'cancellation',
      context: {
        deliveryman: problem.deliveryman.name,
        order: problem.delivery_id,
        canceled_at: problem.order.canceled_at,
        description: problem.description,
      },
    });
  }
}

export default new CancellationMail();
