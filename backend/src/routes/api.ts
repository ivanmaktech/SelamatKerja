
import { Router } from 'express';
import multer from 'multer';
import { explainContract, checkFee, askQuestion } from '../controllers/apiController';

const router = Router();
const upload = multer({ dest: 'uploads/' });

router.post('/explain-contract', upload.single('contract'), (req, res, next) => { explainContract(req, res).catch(next); });
router.post('/check-fee', (req, res, next) => { checkFee(req, res).catch(next); });
router.post('/ask', (req, res, next) => { askQuestion(req, res).catch(next); });

export default router;

