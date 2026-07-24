export type {
    EvidenceHit,
    FactCheckCorpusEntry,
    FactCheckCorpusFile,
    FactCheckVerdict,
    RetrieveOptions,
} from './types';

export { loadFactCheckCorpus, resetCorpusCache, resolveCorpusPath } from './load-corpus';
export {
    foldText,
    mergeEvidenceHits,
    retrieveFromCorpus,
    scoreCorpusEntry,
    scoreDatabaseCandidate,
    significantTokensForDb,
    tokenize,
    toDatabaseEvidenceHit,
} from './retrieve';
export { formatEvidenceBlock } from './format-evidence';
export {
    appendFactCheckDetailsFooter,
    buildFactCheckDetailsRows,
    collectSourceUrls,
    extractHttpUrls,
    formatFactCheckDetailsFooter,
    resolveFactCheckLocale,
} from './format-fact-check-footer';
export type {
    FactCheckDetailsInput,
    FactCheckDetailsLocale,
    FactCheckDetailsRow,
} from './format-fact-check-footer';
export { classifyMessageIntent } from './classify-message-intent';
export type {
    ChatMessageIntent,
    ChatMessageIntentConfidence,
    ClassifyMessageIntentInput,
    ClassifyMessageIntentResult,
} from './classify-message-intent';
