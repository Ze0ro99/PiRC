import { Router, type IRouter } from "express";
import healthRouter from "./health";
import pircRouter from "./pirc";

const router: IRouter = Router();

router.use(healthRouter);
router.use(pircRouter);

export default router;
