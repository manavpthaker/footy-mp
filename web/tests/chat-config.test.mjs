import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { getChatConfig, saveChatKey, removeChatKey, settingsRequestAllowed } from '../lib/chat-config.ts';

test('local credentials rotate immediately, stay private, and fall back after removal', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'footy-chat-test-'));
  const previous = { ...process.env };
  try {
    delete process.env.VERCEL;
    process.env.FOOTY_LOCAL_SETTINGS = '1';
    process.env.FOOTY_CHAT_CONFIG_PATH = join(dir, 'private', 'chat.json');
    process.env.OPENAI_API_KEY = 'test-environment-key';
    process.env.FOOTY_LOCAL_SETTINGS_ORIGIN = 'https://preview.example.test';
    assert.equal((await getChatConfig()).apiKey, 'test-environment-key');
    await saveChatKey('synthetic-key-one');
    assert.equal((await getChatConfig()).apiKey, 'synthetic-key-one');
    assert.equal((await stat(process.env.FOOTY_CHAT_CONFIG_PATH)).mode & 0o777, 0o600);
    assert.equal((await stat(join(dir, 'private'))).mode & 0o777, 0o700);
    await saveChatKey('synthetic-key-two');
    assert.equal((await getChatConfig()).apiKey, 'synthetic-key-two');
    await removeChatKey();
    assert.equal((await getChatConfig()).apiKey, 'test-environment-key');
  } finally { process.env = previous; await rm(dir, { recursive: true, force: true }); }
});

test('credential changes reject missing origin, other sites, and unconfigured hosts', () => {
  const previous = { ...process.env };
  try {
    delete process.env.VERCEL;
    process.env.FOOTY_LOCAL_SETTINGS = '1';
    process.env.FOOTY_LOCAL_SETTINGS_ORIGIN = 'https://preview.example.test';
    const allowed = headers => settingsRequestAllowed(new Request('http://localhost/api/settings/chat', { headers }));
    assert.equal(allowed({ host: 'preview.example.test' }), false);
    assert.equal(allowed({ host: 'preview.example.test', origin: 'https://evil.test' }), false);
    assert.equal(allowed({ host: 'evil.test', origin: 'https://evil.test' }), false);
    assert.equal(allowed({ host: '127.0.0.1:3001', 'x-forwarded-host': 'evil.test', origin: 'https://preview.example.test' }), false);
    assert.equal(allowed({ host: '127.0.0.1:3001', 'x-forwarded-host': 'preview.example.test', origin: 'https://preview.example.test' }), true);
    process.env.FOOTY_LOCAL_SETTINGS = '0';
    assert.equal(allowed({ host: 'preview.example.test', origin: 'https://preview.example.test' }), false);
    process.env.FOOTY_LOCAL_SETTINGS = '1';
    process.env.VERCEL = '1';
    assert.equal(allowed({ host: 'preview.example.test', origin: 'https://preview.example.test' }), false);
  } finally { process.env = previous; }
});

test('disabled local settings cannot write credentials', async () => {
  const previous = { ...process.env };
  try {
    delete process.env.FOOTY_LOCAL_SETTINGS;
    await assert.rejects(saveChatKey('synthetic-key'), /disabled/);
    await assert.rejects(removeChatKey(), /disabled/);
  } finally { process.env = previous; }
});
