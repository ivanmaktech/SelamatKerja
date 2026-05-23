"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const apiController_1 = require("../controllers/apiController");
const jobsController_1 = require("../controllers/jobsController");
const authController_1 = require("../controllers/authController");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const upload = (0, multer_1.default)({ dest: 'uploads/' });
// Test route
router.get('/ping', (req, res) => res.json({ success: true, message: 'pong' }));
// Auth routes
router.post('/auth/signup', authController_1.signup);
router.post('/auth/login', authController_1.login);
router.get('/auth/me', authController_1.me);
router.put('/auth/profile', authController_1.updateProfile);
// Chatbot routes
router.post('/explain-contract', upload.single('contract'), (req, res, next) => { (0, apiController_1.explainContract)(req, res).catch(next); });
router.post('/check-fee', (req, res, next) => { (0, apiController_1.checkFee)(req, res).catch(next); });
router.post('/ask', (req, res, next) => { (0, apiController_1.askQuestion)(req, res).catch(next); });
router.post('/explain-contract-fairness', (req, res, next) => { (0, apiController_1.evaluateFairness)(req, res).catch(next); });
router.get('/jobs', (req, res, next) => { (0, jobsController_1.getJobs)(req, res).catch(next); });
router.post('/jobs', (req, res, next) => { (0, jobsController_1.createJob)(req, res).catch(next); });
router.post('/jobs/interest', (req, res) => { (0, jobsController_1.submitInterest)(req, res); });
router.post('/explain-match', (req, res, next) => { (0, jobsController_1.explainMatch)(req, res).catch(next); });
router.get('/candidates', (req, res, next) => { (0, jobsController_1.getCandidates)(req, res).catch(next); });
router.get('/employers/:employerName/interests', (req, res) => { (0, jobsController_1.getEmployerInterests)(req, res); });
router.post('/contracts', (req, res) => { (0, jobsController_1.submitContract)(req, res); });
router.get('/kakak/:kakakName/contracts', (req, res) => { (0, jobsController_1.getKakakContracts)(req, res); });
exports.default = router;
