import { Router } from 'express';

import userController from './app/controllers/userController';
import sessionController from './app/controllers/sessionController';
import recipientsController from './app/controllers/recipientsController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();

routes.post('/users', userController.store);
routes.post('/sessions', sessionController.store);

routes.use(authMiddleware);

routes.post('/recipients', recipientsController.store);
routes.put('/recipients', recipientsController.update);
routes.put('/users', userController.update);

export default routes;
