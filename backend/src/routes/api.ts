import { Router } from 'express';
import multer from 'multer';
import { explainContract, checkFee, askQuestion, evaluateFairness } from '../controllers/apiController';
import { getJobs, createJob, explainMatch, getCandidates, submitInterest, getEmployerInterests, submitContract, getKakakContracts } from '../controllers/jobsController';

const router = Router();
const upload = multer({ dest: 'uploads/' });

router.post('/explain-contract', upload.single('contract'), (req, res, next) => { explainContract(req, res).catch(next); });
router.post('/check-fee', (req, res, next) => { checkFee(req, res).catch(next); });
router.post('/ask', (req, res, next) => { askQuestion(req, res).catch(next); });
router.post('/explain-contract-fairness', (req, res, next) => { evaluateFairness(req, res).catch(next); });

router.get('/jobs', (req, res, next) => { getJobs(req, res).catch(next); });
router.post('/jobs', (req, res, next) => { createJob(req, res).catch(next); });
router.post('/jobs/interest', (req, res) => { submitInterest(req, res); });
router.post('/explain-match', (req, res, next) => { explainMatch(req, res).catch(next); });
router.get('/candidates', (req, res, next) => { getCandidates(req, res).catch(next); });

router.get('/employers/:employerName/interests', (req, res) => { getEmployerInterests(req, res); });
router.post('/contracts', (req, res) => { submitContract(req, res); });
router.get('/kakak/:kakakName/contracts', (req, res) => { getKakakContracts(req, res); });

export default router;
