import test from 'node:test';
import assert from 'node:assert/strict';
import { getEmailProvider } from './index';
import { verifyEmailText } from './templates/verify-email';

test('email provider reports resend', () => {
    assert.equal(getEmailProvider(), 'resend');
});

test('verify template includes provided URL', () => {
    const code = '123456';
    const text = verifyEmailText({ otpCode: code });
    assert.equal(text.includes(code), true);
});
