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

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);

routes.post('/recipients', RecipientsController.store);
routes.put('/recipients', RecipientsController.update);

routes.put('/users', UserController.update);

routes.post('/files', upload.single('file'), FileController.store);

routes.post('/deliverymans', DeliverymansController.store);
routes.get('/deliverymans', DeliverymansController.index);
routes.put('/deliverymans', DeliverymansController.update);
routes.delete('/deliverymans/:id', DeliverymansController.destroy);

routes.post('/order', OrderController.store);
routes.get('/order', OrderController.index);
routes.put('/order/:id', OrderController.update);
routes.delete('/order/:id', OrderController.destroy);

routes.get('/deliveryman/:id/deliveries', DeliveryOrderController.index);
routes.get('/deliveryman/:id/delivered', DeliveryOrderController.show);

export default routes;
