import { NextFunction, Request, Response } from 'express';
import IndexService from '../services/index.service';

class IndexController {
  public indexService = new IndexService();

  public index = (req: Request, res: Response, next: NextFunction) => {
    try {
      return res.json({
        status: true,
        message: "Server Online",
        data: null,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  };

  public start = async  (req: Request, res: Response, next: NextFunction) => {
    try {
       const {service_id} = req.body;
       const data = await this.indexService.start(service_id);
       return res.json({
         status: true,
         message: "Operation successful",
         data,
         error: null,
       });
    } catch (e) {
      next(e);
    }
  }

  public stop = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {service_id} = req.body;
      if (service_id) {
        const data = await this.indexService.stop(service_id);
        return res.json({
          status: true,
          message: "Operation successful",
          data,
          error: null,
        });
      } else {
        return res.status(400).json({
          status: false,
          message: "Include the service_id of the service you will like to stop",
          data: null,
          error: "Invalid req parameters"
        });
      }

    } catch (e) {
      next(e);
    }
  }

  public status = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {service_id} = req.params;
      if (service_id) {
        const data = await this.indexService.status(service_id);
        return res.json({
          status: true,
          message: "Operation successful",
          data,
          error: null,
        });
      }
      return res.status(400).json({
        status: false,
        message: "Include the service_id of the service you will like to view status",
        data: null,
        error: "Invalid req parameters"
      });
    } catch (e) {
      next(e);
    }
  }
}

export default IndexController;
