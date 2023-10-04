import { Request, Response, NextFunction, query } from "express";
import { deviceLiveData } from "../connection/liveTimeData";
import fMsg, { mqttEmitter } from "../utils/helper";
import { client } from "../utils/connect";

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


// export const getDeviceCacheData = (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   let nozzleNo = req.query.nozzleNo?.toString();
//   let depNo = req.query.depNo?.toString();

//   mqttEmitter(`detpos/local_server/reload/${depNo}` , `${nozzleNo}`)

//   client.on("message", (topic, message) => {
//     if (topic == `detpos/device/Reload/${depNo}` ) {
//      return topic
//     }
//   });
// };


export const getDeviceCacheData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let nozzleNo = req.query.nozzleNo?.toString();
    let depNo = req.query.depNo?.toString();

    // Publish message to MQTT topic
    mqttEmitter(`detpos/local_server/reload/${depNo}`, `${nozzleNo}`);

    // Create a promise to handle MQTT message reception
    const mqttMessagePromise = new Promise((resolve, reject) => {
      client.on('message', (topic, message) => {
        if (topic === `detpos/device/Reload/${depNo}`) {
          resolve(message.toString());
        }
      });
    });

    // Wait for MQTT message or reject after 5 seconds
    const mqttMessage : any = await Promise.race([
      mqttMessagePromise,
      new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(new Error('device offline'));
        }, 5000);
      }),
    ]);

    const regex = /[A-Z]/g;
    let data: any[] = mqttMessage.toString().split(regex);

    console.log(data)

    fMsg(res , "reload data" ,{
      saleLiter : data[2],
      totalPrice : data[3],
      devTotalizar_liter: data[4]
    })

    // Send success response with the received data
    // res.status(200).json({ data: mqttMessage });
  } catch (e) {
    // Handle errors, such as MQTT connection issues or timeout
    // res.status(409).json({ error: error.message });

    next(e)

  }
};

