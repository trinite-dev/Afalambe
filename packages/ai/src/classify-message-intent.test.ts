import test from 'node:test';
import assert from 'node:assert/strict';

import { classifyMessageIntent } from './classify-message-intent';

test('classifies fact-check claims', () => {
    assert.equal(
        classifyMessageIntent({
            text: 'Est-ce vrai que le FMI demande de retirer l argent des banques ?',
            hasPriorAssistant: false,
        }).intent,
        'FACT_CHECK',
    );
    assert.equal(
        classifyMessageIntent({
            text: 'Can you verify this WhatsApp rumor about the Mpox vaccine?',
            hasPriorAssistant: false,
        }).intent,
        'FACT_CHECK',
    );
});

test('classifies meta / product questions', () => {
    assert.equal(
        classifyMessageIntent({
            text: 'Comment fonctionne Afalambe ?',
            hasPriorAssistant: false,
        }).intent,
        'META',
    );
    assert.equal(
        classifyMessageIntent({
            text: 'What is fact-checking and how do you verify claims?',
            hasPriorAssistant: false,
        }).intent,
        'META',
    );
});

test('classifies follow-up questions when a prior assistant exists', () => {
    assert.equal(
        classifyMessageIntent({
            text: 'Pourquoi ce verdict ?',
            hasPriorAssistant: true,
        }).intent,
        'FOLLOW_UP',
    );
    assert.equal(
        classifyMessageIntent({
            text: 'Can you explain the sources?',
            hasPriorAssistant: true,
        }).intent,
        'FOLLOW_UP',
    );
});

test('does not treat why as follow-up without prior assistant', () => {
    const result = classifyMessageIntent({
        text: 'Why is the sky blue?',
        hasPriorAssistant: false,
    });
    assert.equal(result.intent, 'OFF_TOPIC');
});

test('classifies off-topic greetings and chatter', () => {
    assert.equal(
        classifyMessageIntent({ text: 'Hello', hasPriorAssistant: false }).intent,
        'OFF_TOPIC',
    );
    assert.equal(
        classifyMessageIntent({
            text: 'What is the weather today in Conakry?',
            hasPriorAssistant: false,
        }).intent,
        'OFF_TOPIC',
    );
});
