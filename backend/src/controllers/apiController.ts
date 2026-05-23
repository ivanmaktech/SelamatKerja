
import { Request, Response } from 'express';
import { explainRawContract, checkRecruitmentFee, answerRightsQuestion, suggestContractRedFlags } from '../services/geminiService';
import { extractContractFields, extractContractText, hasAnyExtractedField } from '../services/contractParsingService';
import { evaluateContractFairness } from '../services/geminiService';

export const explainContract = async (req: Request, res: Response): Promise<void> => {
    try {
        const uploadedText = await extractContractText({
            text: req.body.text,
            file: req.file ? { path: req.file.path, mimetype: req.file.mimetype } : null,
        });

        if (!uploadedText) {
            res.status(400).json({ success: false, error: 'Could not read the contract. Please upload a clearer image or paste the text.' });
            return;
        }

        const extractedFields = extractContractFields(uploadedText);
        const aiSuggestions = hasAnyExtractedField(extractedFields)
            ? await suggestContractRedFlags(extractedFields)
            : await explainRawContract(uploadedText);

        res.json({ success: true, data: aiSuggestions, extracted: extractedFields });
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

export const evaluateFairness = async (req: Request, res: Response) => {
    try {
        const { contract, preferences } = req.body;
        if (!contract || !preferences) {
            res.status(400).json({ error: 'Missing contract or preferences' });
            return;
        }
        const result = await evaluateContractFairness(contract, preferences);
        res.json({ success: true, explanation: result });
    } catch (error) {
        console.error('Error evaluating fairness', error);
        res.status(500).json({ success: false, error: 'Failed to evaluate fairness' });
    }
};
