import express, { Request, Response, Router } from 'express';

const router: Router = express.Router();

router.get('/wss', (req: Request, res: Response) => {
    res.send('server is up running');
});

export default router;