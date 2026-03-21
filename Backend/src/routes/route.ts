import { Router, Request, Response } from 'express';
import { getStandardService } from '../services/standard';

const router = Router();

router.get('/standard', (req: Request, res: Response) => {
    const data = getStandardService();
    res.json(data);
});

export default router;