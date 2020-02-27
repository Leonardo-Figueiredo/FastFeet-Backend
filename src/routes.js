import { Router } from 'express';

import userController from './app/controllers/userController';
import sessionController from './app/controllers/sessionController';
import recipientsController from './app/controllers/recipientsController';
import deliverymansController from './app/controllers/deliverymansController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();

routes.post('/users', userController.store);
routes.post('/sessions', sessionController.store);

routes.use(authMiddleware);

routes.post('/recipients', recipientsController.store);
routes.put('/recipients', recipientsController.update);

routes.put('/users', userController.update);

routes.post('/deliverymans', deliverymansController.store);
routes.get('/deliverymans', deliverymansController.index);
routes.put('/deliverymans', deliverymansController.update);
routes.delete('/deliverymans', deliverymansController.delete);

export default routes;
