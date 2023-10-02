import { Request, Response, NextFunction, query } from "express";
import { deviceLiveData } from "../connection/liveTimeData";
import fMsg, { mqttEmitter } from "../utils/helper";

export const getServerCacheData = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let nozzleNo = req.query.nozzleNo;

    let [saleLiter, totalPrice] = deviceLiveData.get(nozzleNo);

    // console.log(saleLiter, totalPrice);

    let result = {
      nozzleNo,
      saleLiter,
      totalPrice,
    };
    fMsg(res, "sever cache data", result);
  } catch (e) {
    throw new Error("No data in server cache");
  }
};


export const getDeviceCacheData = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let nozzleNo = req.query.nozzleNo?.toString();
  let depNo = req.query.depNo?.toString();


  mqttEmitter(`detpos/local_server/reload/${depNo}` , `${nozzleNo}`)
};