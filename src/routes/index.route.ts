import { Router } from 'express';
import IndexController from '@controllers/index.controller';
import { Routes } from '@interfaces/routes.interface';

class IndexRoute implements Routes {
  public router = Router();
  public indexController = new IndexController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`/`, this.indexController.index);
    this.router.post(`/start`, this.indexController.start);
    this.router.post(`/stop`, this.indexController.stop);
    this.router.get(`/status/:service_id`, this.indexController.status);
  }
}

export default IndexRoute;
