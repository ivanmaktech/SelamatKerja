"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasAnyExtractedField = exports.extractContractFields = exports.extractContractText = void 0;
const fs_1 = __importDefault(require("fs"));
const tesseract_js_1 = require("tesseract.js");
const normalizeText = (text) => text.replace(/\r/g, ' ').replace(/\s+/g, ' ').trim();
const normalizeSnippet = (snippet) => snippet.replace(/\s+/g, ' ').replace(/^[\s:;,-]+/, '').trim();
const cleanupUploadedFile = (filePath) => {
    try {
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
        }
    }
    catch (error) {
        console.error('Failed to clean up uploaded contract file:', error);
    }
};
const extractAmount = (text) => {
    const currencyMatch = text.match(/(?:rm|myr|ringgit(?: malaysia)?)\s*([0-9][0-9,]*(?:\.[0-9]{2})?)/i);
    if (currencyMatch?.[1]) {
        return `RM${currencyMatch[1].replace(/,/g, '')}`;
    }
    const plainNumberMatch = text.match(/\b([0-9][0-9,]*(?:\.[0-9]{2})?)\b/);
    if (plainNumberMatch?.[1]) {
        return `RM${plainNumberMatch[1].replace(/,/g, '')}`;
    }
    return null;
};
const extractPayPeriod = (text) => {
    if (/(per\s*month|monthly|a\s*month|month\b)/i.test(text))
        return 'per month';
    if (/(per\s*week|weekly|a\s*week|week\b)/i.test(text))
        return 'per week';
    if (/(per\s*day|daily|a\s*day|day\b)/i.test(text))
        return 'per day';
    if (/(per\s*hour|hourly|an\s*hour|hour\b)/i.test(text))
        return 'per hour';
    return null;
};
const extractSectionByHeading = (text, headingPattern) => {
    const normalized = normalizeText(text);
    const headingMatch = normalized.match(headingPattern);
    if (!headingMatch || headingMatch.index == null) {
        return null;
    }
    const afterHeading = normalized.slice(headingMatch.index + headingMatch[0].length);
    const nextTopLevelHeading = afterHeading.match(/\s\d+\.\s+[A-Z][A-Z0-9\s&/()\-]{2,}/);
    const section = nextTopLevelHeading ? afterHeading.slice(0, nextTopLevelHeading.index).trim() : afterHeading.trim();
    return section || null;
};
const extractClause = (text, pattern) => {
    const match = normalizeText(text).match(pattern);
    if (!match) {
        return null;
    }
    return normalizeSnippet(match[1] || match[0]);
};
const extractSalaryClause = (text) => {
    const section = extractSectionByHeading(text, /\b5\.?\s*REMUNERATION\b/i) || normalizeText(text);
    const clause = extractClause(section, /\b5\.1\b\s*(.*?)(?=\s+\b5\.2\b|\s+\b6\.\b|$)/i)
        || extractClause(section, /monthly salary\s+of\s*(RM\s*[0-9][0-9,]*(?:\.[0-9]{2})?)/i)
        || extractClause(section, /salary\s*(?:shall be|is|of)?\s*(RM\s*[0-9][0-9,]*(?:\.[0-9]{2})?)/i);
    if (!clause)
        return null;
    const amount = extractAmount(clause);
    if (!amount)
        return null;
    return `${amount} ${extractPayPeriod(clause) || 'per month'}`;
};
const extractRecruitmentFeeClause = (text) => {
    const section = extractSectionByHeading(text, /\b6\.?\s*DEDUCTIONS AND FEES\b/i) || normalizeText(text);
    const clause = extractClause(section, /recruitment(?:\s+agency)? fee\s*:\s*(.*?)(?=\s+[A-Z][a-z]+\s+Fee:|\s+Medical Insurance|\s+Uniform Fee|\s+\b6\.2\b|\s+\b7\.\b|$)/i)
        || extractClause(section, /recruitment(?:\s+agency)? fee[^\n;]{0,120}/i);
    if (!clause)
        return null;
    return extractAmount(clause) ? normalizeSnippet(clause) : null;
};
const extractEmploymentDurationClause = (text) => {
    const section = extractSectionByHeading(text, /\b2\.?\s*COMMENCEMENT AND DURATION\b/i) || normalizeText(text);
    const commence = extractClause(section, /\b2\.1\b\s*(.*?)(?=\s+\b2\.2\b|\s+\b3\.\b|$)/i);
    const duration = extractClause(section, /\b2\.2\b\s*(.*?)(?=\s+\b2\.3\b|\s+\b3\.\b|$)/i);
    const parts = [commence, duration].filter(Boolean);
    return parts.length ? parts.map(normalizeSnippet).join('; ') : null;
};
const extractWorkingHoursClause = (text) => {
    const section = extractSectionByHeading(text, /\b4\.?\s*WORKING HOURS AND REST\b/i) || normalizeText(text);
    const clause = extractClause(section, /\b4\.1\b\s*(.*?)(?=\s+\b4\.2\b|\s+\b4\.3\b|\s+\b5\.\b|$)/i)
        || extractClause(section, /working hours[^\n;]{0,160}/i);
    return clause ? normalizeSnippet(clause) : null;
};
const extractRestDayClause = (text) => {
    const section = extractSectionByHeading(text, /\b4\.?\s*WORKING HOURS AND REST\b/i) || normalizeText(text);
    const clause = extractClause(section, /\b4\.2\b\s*(.*?)(?=\s+\b4\.3\b|\s+\b5\.\b|$)/i)
        || extractClause(section, /rest day[^\n;]{0,160}/i);
    if (!clause)
        return null;
    return normalizeSnippet(clause)
        .replace(/^the employee shall be entitled to\s*/i, '')
        .replace(/^rest day\s*/i, 'Rest day ')
        .trim();
};
const extractDeductionClause = (text) => {
    const section = extractSectionByHeading(text, /\b6\.?\s*DEDUCTIONS AND FEES\b/i) || normalizeText(text);
    const clause = extractClause(section, /\b6\.1\b\s*(.*?)(?=\s+\b6\.2\b|\s+\b7\.\b|$)/i)
        || extractClause(section, /deductions[^\n;]{0,220}/i);
    return clause ? normalizeSnippet(clause) : null;
};
const extractAccommodationClause = (text) => {
    const section = extractSectionByHeading(text, /\b7\.?\s*ACCOMMODATION AND MEALS\b/i) || normalizeText(text);
    const first = extractClause(section, /\b7\.1\b\s*(.*?)(?=\s+\b7\.2\b|\s+\b8\.\b|$)/i);
    const second = extractClause(section, /\b7\.2\b\s*(.*?)(?=\s+\b8\.\b|$)/i);
    const parts = [first, second].filter(Boolean);
    return parts.length ? parts.map(normalizeSnippet).join('; ') : null;
};
const extractPassportClause = (text) => {
    const section = extractSectionByHeading(text, /\b8\.?\s*PASSPORT AND DOCUMENTS\b/i) || normalizeText(text);
    const clause = extractClause(section, /\b8\.1\b\s*(.*?)(?=\s+\b8\.2\b|\s+\b9\.\b|$)/i)
        || extractClause(section, /passport[^\n;]{0,220}/i);
    return clause ? normalizeSnippet(clause) : null;
};
const extractTerminationClause = (text) => {
    const section = extractSectionByHeading(text, /\b9\.?\s*TERMINATION\b/i) || normalizeText(text);
    const clause = extractClause(section, /\b9\.1\b\s*(.*?)(?=\s+\b9\.2\b|\s+\b10\.\b|$)/i)
        || extractClause(section, /terminate[^\n;]{0,220}/i);
    return clause ? normalizeSnippet(clause) : null;
};
const extractPenaltyClause = (text) => {
    const section = extractSectionByHeading(text, /\b9\.?\s*TERMINATION\b/i) || normalizeText(text);
    const clause = extractClause(section, /\b9\.2\b\s*(.*?)(?=\s+\b10\.\b|$)/i)
        || extractClause(section, /early termination[^\n;]{0,220}/i);
    return clause ? normalizeSnippet(clause) : null;
};
const extractGenericSalary = (text) => {
    const clause = extractClause(text, /(?:monthly salary|basic salary|salary)\s*[:\-]?\s*([^\n;]{1,120})/i);
    if (!clause)
        return null;
    const amount = extractAmount(clause);
    if (!amount)
        return null;
    return `${amount} ${extractPayPeriod(clause) || 'per month'}`;
};
const extractGenericRecruitmentFee = (text) => {
    const clause = extractClause(text, /recruitment(?:\s+agency)? fee\s*[:\-]?\s*([^\n;]{1,160})/i);
    if (!clause)
        return null;
    return extractAmount(clause) ? normalizeSnippet(clause) : null;
};
const extractContractText = async (input) => {
    const directText = input.text?.trim();
    if (directText) {
        return normalizeText(directText);
    }
    if (!input.file) {
        return '';
    }
    try {
        if (!input.file.mimetype.startsWith('image/')) {
            return '';
        }
        const result = await (0, tesseract_js_1.recognize)(input.file.path, 'eng');
        return normalizeText(result.data.text || '');
    }
    catch (error) {
        console.error('Contract OCR Error:', error);
        return '';
    }
    finally {
        cleanupUploadedFile(input.file.path);
    }
};
exports.extractContractText = extractContractText;
const extractContractFields = (text) => {
    const normalized = normalizeText(text);
    return {
        salary: extractSalaryClause(normalized) || extractGenericSalary(normalized),
        recruitment_fee: extractRecruitmentFeeClause(normalized) || extractGenericRecruitmentFee(normalized),
        deductions: extractDeductionClause(normalized),
        working_hours: extractWorkingHoursClause(normalized),
        rest_day: extractRestDayClause(normalized),
        employment_duration: extractEmploymentDurationClause(normalized),
        termination_clause: extractTerminationClause(normalized),
        passport_clause: extractPassportClause(normalized),
        accommodation: extractAccommodationClause(normalized),
        penalties: extractPenaltyClause(normalized),
    };
};
exports.extractContractFields = extractContractFields;
const hasAnyExtractedField = (fields) => {
    return Object.values(fields).some((value) => value !== null);
};
exports.hasAnyExtractedField = hasAnyExtractedField;
