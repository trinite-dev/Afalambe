import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { FactCheckCorpusEntry, FactCheckCorpusFile } from './types';

const CORPUS_RELATIVE = join('_data', 'fact-checks', 'corpus.json');

let cachedEntries: FactCheckCorpusEntry[] | null = null;
let cachedPath: string | null = null;

function candidatePaths(): string[] {
    const fromEnv = process.env.FACT_CHECK_CORPUS_PATH?.trim();
    const here = dirname(fileURLToPath(import.meta.url));
    const fromPackage = resolve(here, '..', '..', '..', CORPUS_RELATIVE);
    const fromCwd = resolve(process.cwd(), CORPUS_RELATIVE);
    const fromCwdUp = resolve(process.cwd(), '..', '..', CORPUS_RELATIVE);
    return [
        ...(fromEnv ? [resolve(fromEnv)] : []),
        fromPackage,
        fromCwd,
        fromCwdUp,
        resolve(process.cwd(), '..', CORPUS_RELATIVE),
    ];
}

export function resolveCorpusPath(explicitPath?: string): string {
    if (explicitPath) {
        return resolve(explicitPath);
    }
    for (const candidate of candidatePaths()) {
        if (existsSync(candidate)) {
            return candidate;
        }
    }
    throw new Error(
        `Fact-check corpus not found. Expected ${CORPUS_RELATIVE} under the monorepo root.`,
    );
}

export function loadFactCheckCorpus(path?: string, options?: { reload?: boolean }): FactCheckCorpusEntry[] {
    const corpusPath = resolveCorpusPath(path);
    if (!options?.reload && cachedEntries && cachedPath === corpusPath) {
        return cachedEntries;
    }

    const raw = readFileSync(corpusPath, 'utf8');
    const parsed = JSON.parse(raw) as FactCheckCorpusFile;
    if (!parsed || !Array.isArray(parsed.entries)) {
        throw new Error(`Invalid fact-check corpus at ${corpusPath}`);
    }

    cachedPath = corpusPath;
    cachedEntries = parsed.entries.filter(
        (entry) =>
            typeof entry.id === 'string' &&
            typeof entry.claimText === 'string' &&
            typeof entry.factCheckText === 'string' &&
            entry.claimText.trim().length > 0 &&
            entry.factCheckText.trim().length > 0,
    );
    return cachedEntries;
}

export function resetCorpusCache(): void {
    cachedEntries = null;
    cachedPath = null;
}
