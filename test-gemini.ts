
import { generateContractExplanation } from './backend/src/services/geminiService';
async function run() {
    console.log('Testing gemini...');
    const result = await generateContractExplanation('Hello world');
    console.log(result);
}
run();

