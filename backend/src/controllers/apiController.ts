
import { Request, Response } from 'express';
import { generateContractExplanation, checkRecruitmentFee, answerRightsQuestion } from '../services/geminiService';
import fs from 'fs';
import PDFParser from 'pdf2json';

export const explainContract = async (req: Request, res: Response): Promise<void> => {
    try {
        let textContent = req.body.text || '';
        
        if (req.file && req.file.path) {
            try {
                if (req.file.mimetype === 'application/pdf') {
                    textContent = await new Promise((resolve, reject) => {
                        const pdfParser = new PDFParser(null, true);
                        
                        pdfParser.on('pdfParser_dataError', (errData: any) => {
                            resolve('Could not cleanly read the PDF. Please try pasting the text instead.');
                        });
                        
                        pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
                            try {
                                resolve(pdfParser.getRawTextContent().replace(/\r\n/g, ' '));
                            } catch (e) {
                                resolve('Could not cleanly read the PDF.');
                            }
                        });
                        
                        // @ts-ignore
                        pdfParser.loadPDF(req.file.path);
                    });
                }
            } catch (pdfError) {
                console.error('PDF Parsing Error:', pdfError);
                textContent = 'Could not cleanly read the PDF. Please try pasting the text instead.';
            } finally {
                // Cleanup
                try {
                    if (fs.existsSync(req.file.path)) {
                        fs.unlinkSync(req.file.path);
                    }
                } catch(e) {}
            }
        }

        const explanation = await generateContractExplanation(textContent);
        res.json({ success: true, data: explanation });
    } catch (error) {
        console.error('Error explaining contract', error);
        res.status(500).json({ success: false, error: 'Failed to process contract' });
    }
};

export const checkFee = async (req: Request, res: Response) => {
    try {
        const { fee } = req.body;
        const result = await checkRecruitmentFee(fee);
        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Error checking fee', error);
        res.status(500).json({ success: false, error: 'Failed to check fee' });
    }
};

export const askQuestion = async (req: Request, res: Response) => {
    try {
        const { question } = req.body;
        const answer = await answerRightsQuestion(question);
        res.json({ success: true, data: answer });
    } catch (error) {
        console.error('Error answering question', error);
        res.status(500).json({ success: false, error: 'Failed to answer question' });
    }
};

