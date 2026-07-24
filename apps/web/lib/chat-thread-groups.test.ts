import test from 'node:test';
import assert from 'node:assert/strict';

import { groupThreadsByRecency } from './chat-thread-groups';

const labels = {
    today: 'Today',
    yesterday: 'Yesterday',
    previous7Days: 'Previous 7 days',
    older: 'Older',
};

test('groupThreadsByRecency buckets by local day boundaries', () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
    const yesterday = new Date(today.getTime() - 86_400_000);
    const lastMonth = new Date(today.getTime() - 30 * 86_400_000);

    const groups = groupThreadsByRecency(
        [
            { id: 'a', title: 'Today thread', updatedAt: today },
            { id: 'b', title: 'Yesterday thread', updatedAt: yesterday },
            { id: 'c', title: 'Old thread', updatedAt: lastMonth },
        ],
        labels,
        (date) => date.toISOString(),
    );

    assert.equal(groups.length, 3);
    assert.equal(groups[0]?.label, 'Today');
    assert.equal(groups[0]?.threads[0]?.id, 'a');
    assert.equal(groups[1]?.label, 'Yesterday');
    assert.equal(groups[2]?.label, 'Older');
});

test('groupThreadsByRecency omits empty sections', () => {
    const today = new Date();
    const groups = groupThreadsByRecency(
        [{ id: 'only', title: 'Only', updatedAt: today }],
        labels,
        () => 'now',
    );

    assert.equal(groups.length, 1);
    assert.equal(groups[0]?.label, 'Today');
});
