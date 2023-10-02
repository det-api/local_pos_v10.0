import {
  getDeviceCacheData,
  getServerCacheData,
} from "../controller/cacheData.controller";
import { validateAll, validateToken } from "../middleware/validator";
import { serverSchema } from "../schema/schema";
const cacheDataRoute = require("express").Router();

cacheDataRoute.get(
  "/server",
  validateAll(serverSchema),
  validateToken,
  getServerCacheData
);

cacheDataRoute.get(
  "/device",
  validateAll(serverSchema),
  validateToken,
  getDeviceCacheData
);

export default cacheDataRoute;
