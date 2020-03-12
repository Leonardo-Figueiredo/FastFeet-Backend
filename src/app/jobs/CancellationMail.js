import { format, parseISO } from 'date-fns';

import Mail from '../../lib/Mail';

class CancellationMail {
  get key() {
    return 'CancellationMail';
  }

  async handle({ data }) {
    const { problem } = data;

    await Mail.sendMail({
      to: `${problem.orders.deliveryman.name} <${problem.orders.deliveryman.email}>`,
      subject: `A encomenda ${problem.delivery_id} foi cancelada.`,
      template: 'cancellation',
      context: {
        deliveryman: problem.orders.deliveryman.name,
        order: problem.delivery_id,
        canceled_at: format(
          parseISO(problem.orders.canceled_at),
          'dd/MM/yyyy - HH:mm'
        ),
        description: problem.description,
      },
    });
  }
}

export default new CancellationMail();
