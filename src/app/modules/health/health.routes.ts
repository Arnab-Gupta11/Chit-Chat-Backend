import { Router } from 'express';
import { healthController } from './health.controller';

const router = Router();

router.get('/', healthController.check);
router.get('/db', healthController.dbCheck);
router.get('/runtime', healthController.runtimeStats);

export { router as healthRouter };
