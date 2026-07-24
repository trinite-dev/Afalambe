import test from 'node:test';
import assert from 'node:assert/strict';

import {
    activeClaimStorageKey,
    clearAuthChatClientState,
    clearDemoChatHistory,
    getActiveClaimId,
    loadDemoChatHistory,
    messageOutboxStorageKey,
    saveDemoChatHistory,
    setActiveClaimId,
} from './chat-history-storage';

class MemoryStorage {
    private readonly map = new Map<string, string>();

    getItem(key: string): string | null {
        return this.map.has(key) ? this.map.get(key)! : null;
    }

    setItem(key: string, value: string): void {
        this.map.set(key, value);
    }

    removeItem(key: string): void {
        this.map.delete(key);
    }
}

function withMemoryStorage(run: () => void): void {
    const previousWindow = (globalThis as { window?: unknown }).window;
    const storage = new MemoryStorage();
    (globalThis as { window: unknown }).window = { localStorage: storage };
    try {
        run();
    } finally {
        if (previousWindow === undefined) {
            delete (globalThis as { window?: unknown }).window;
        } else {
            (globalThis as { window: unknown }).window = previousWindow;
        }
    }
}

test('active claim keys are scoped by user', () => {
    assert.notEqual(activeClaimStorageKey('user-a'), activeClaimStorageKey('user-b'));
    assert.notEqual(messageOutboxStorageKey('user-a'), messageOutboxStorageKey('user-b'));
});

test('active claim round-trip and clear are user-scoped', () => {
    withMemoryStorage(() => {
        setActiveClaimId('user-a', 'claim-1');
        setActiveClaimId('user-b', 'claim-2');
        assert.equal(getActiveClaimId('user-a'), 'claim-1');
        assert.equal(getActiveClaimId('user-b'), 'claim-2');

        setActiveClaimId('user-a', null);
        assert.equal(getActiveClaimId('user-a'), null);
        assert.equal(getActiveClaimId('user-b'), 'claim-2');

        window.localStorage.setItem(messageOutboxStorageKey('user-b'), '[]');
        clearAuthChatClientState('user-b');
        assert.equal(getActiveClaimId('user-b'), 'claim-2');
        assert.equal(window.localStorage.getItem(messageOutboxStorageKey('user-b')), null);
    });
});

test('demo history save/load restores threads and active id', () => {
    withMemoryStorage(() => {
        saveDemoChatHistory({
            activeThreadId: 't1',
            threads: [
                {
                    id: 't1',
                    title: 'Alpha Conde',
                    updatedAt: 100,
                    messages: [{ id: 'm1', role: 'USER', content: 'Hello' }],
                    claim: { factCheckStatus: 'DEBUNKED', location: 'Guinee' },
                },
            ],
        });

        const loaded = loadDemoChatHistory();
        assert.ok(loaded);
        assert.equal(loaded.activeThreadId, 't1');
        assert.equal(loaded.threads.length, 1);
        assert.equal(loaded.threads[0]?.messages[0]?.content, 'Hello');
    });
});

test('corrupt or wrong-version demo history returns null', () => {
    withMemoryStorage(() => {
        window.localStorage.setItem('afalambe_demo_chat_v3', '{not-json');
        assert.equal(loadDemoChatHistory(), null);

        window.localStorage.setItem(
            'afalambe_demo_chat_v3',
            JSON.stringify({ version: 99, activeThreadId: null, threads: [] }),
        );
        assert.equal(loadDemoChatHistory(), null);

        clearDemoChatHistory();
        assert.equal(loadDemoChatHistory(), null);
    });
});
