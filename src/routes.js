import { Router } from 'express';
import multer from 'multer';

import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import RecipientsController from './app/controllers/RecipientsController';
import DeliverymansController from './app/controllers/DeliverymansController';
import FileController from './app/controllers/FileController';
import OrderController from './app/controllers/OrderController';
import DeliveryOrderController from './app/controllers/DeliveryOrderController';
import DeliveryProblemsController from './app/controllers/DeliveryProblemsController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

// After this Middleware, all routes need a valid session.
routes.use(authMiddleware);

//    Recipients
routes.post('/recipients', RecipientsController.store);
routes.put('/recipients', RecipientsController.update);

//    Users
routes.put('/users', UserController.update);

//    Files
routes.post('/files', upload.single('file'), FileController.store);

//    Deliverymans
routes.post('/deliverymans', DeliverymansController.store);
routes.get('/deliverymans', DeliverymansController.index);
routes.put('/deliverymans', DeliverymansController.update);
routes.delete('/deliverymans/:id', DeliverymansController.destroy);

//    Orders
routes.post('/orders', OrderController.store);
routes.get('/orders', OrderController.index);
routes.put('/orders/:id', OrderController.update);
routes.delete('/orders/:id', OrderController.destroy);

//    Deliveries
routes.get('/deliveryman/:id/deliveries', DeliveryOrderController.index);
routes.get('/deliveryman/:id/delivered', DeliveryOrderController.show);
routes.put(
  '/deliveryman/:id/deliveries/:order_id',
  upload.single('signature'),
  DeliveryOrderController.update
);

//    Delivery Problems
routes.get('/delivery/problems', DeliveryProblemsController.index);
routes.get('/delivery/:id/problems', DeliveryProblemsController.show);
routes.post('/delivery/:id/problems', DeliveryProblemsController.store);

routes.delete(
  '/problem/:problem_id/cancel-delivery',
  DeliveryProblemsController.delete
);

export default routes;
