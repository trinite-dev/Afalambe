import test from 'node:test';
import assert from 'node:assert/strict';

import {
    buildSourcePreviewItems,
    classifySourceUrl,
} from './source-preview';

test('classifySourceUrl prefers MIME over extension', () => {
    assert.equal(classifySourceUrl('https://cdn.example.com/file.bin', 'image/png'), 'image');
    assert.equal(classifySourceUrl('https://cdn.example.com/clip.mp4', 'audio/mpeg'), 'audio');
});

test('classifySourceUrl uses path extension', () => {
    assert.equal(classifySourceUrl('https://cdn.example.com/shot.WEBP?x=1'), 'image');
    assert.equal(classifySourceUrl('https://cdn.example.com/clip.mp4'), 'video');
    assert.equal(classifySourceUrl('https://cdn.example.com/note.mp3'), 'audio');
    assert.equal(classifySourceUrl('https://africacheck.org/fr/article'), 'link');
});

test('buildSourcePreviewItems dedupes and builds link labels', () => {
    const items = buildSourcePreviewItems(
        [
            'https://africacheck.org/fr/report',
            'https://africacheck.org/fr/report',
            'https://cdn.example.com/a.png',
        ],
        { 'https://cdn.example.com/a.png': 'image/png' },
    );

    assert.equal(items.length, 2);
    assert.equal(items[0]?.kind, 'link');
    assert.equal(items[0]?.hostname, 'africacheck.org');
    assert.equal(items[1]?.kind, 'image');
});

test('relative same-origin image paths are allowed and classified', () => {
    const items = buildSourcePreviewItems(['/@afalambe-hero.png', 'https://www.factuel.info/']);
    assert.equal(items.length, 2);
    assert.equal(items[0]?.kind, 'image');
    assert.equal(items[1]?.kind, 'link');
});
