import test from 'node:test';
import assert from 'node:assert/strict';
import { STATES, experienceReducer } from '../lib/experience-state.ts';
import { AudioManager } from '../lib/AudioManager.ts';

test('the seven narrative states can be completed in order', () => {
  let state = 'LOCKED';
  for (const next of STATES.slice(1)) {
    state = experienceReducer(state, { type: 'NEXT', to: next });
    assert.equal(state, next);
  }
  assert.equal(state, 'COMPLETE');
});
test('out-of-order and duplicate gestures cannot skip the invitation', () => {
  for (let i = 0; i < STATES.length; i++)
    for (let j = 0; j < STATES.length; j++) {
      const result = experienceReducer(STATES[i], {
        type: 'NEXT',
        to: STATES[j],
      });
      assert.equal(result, j === i + 1 ? STATES[j] : STATES[i]);
    }
});
test('replay always restores the sealed letter', () => {
  for (const state of STATES)
    assert.equal(experienceReducer(state, { type: 'RESET' }), 'LOCKED');
});
class Parameter {
  value = 1;
  setValueAtTime(v) {
    this.value = v;
  }
  linearRampToValueAtTime(v) {
    this.value = v;
  }
  exponentialRampToValueAtTime(v) {
    this.value = v;
  }
  setTargetAtTime(v) {
    this.value = v;
  }
}
class AudioNode {
  gain = new Parameter();
  frequency = new Parameter();
  started = false;
  stopped = false;
  connect() {}
  disconnect() {}
  start() {
    assert.equal(this.started, false);
    this.started = true;
  }
  stop() {
    assert.equal(
      this.started,
      true,
      'audio must be started before stop is scheduled',
    );
    this.stopped = true;
  }
}
class TestContext {
  static instances = [];
  state = 'suspended';
  currentTime = 0;
  sampleRate = 100;
  destination = {};
  nodes = [];
  constructor() {
    TestContext.instances.push(this);
  }
  createGain() {
    const n = new AudioNode();
    this.nodes.push(n);
    return n;
  }
  createBufferSource() {
    const n = new AudioNode();
    this.nodes.push(n);
    return n;
  }
  createBiquadFilter() {
    return new AudioNode();
  }
  createOscillator() {
    return this.createBufferSource();
  }
  createBuffer() {
    return { getChannelData: () => new Float32Array(300) };
  }
  async resume() {
    this.state = 'running';
  }
  async suspend() {
    this.state = 'suspended';
  }
  async close() {
    this.state = 'closed';
  }
}
test('audio remains locked until interaction; cues schedule correctly and dispose', async () => {
  const previous = globalThis.AudioContext;
  globalThis.AudioContext = TestContext;
  try {
    const audio = new AudioManager();
    audio.play('paper');
    assert.equal(TestContext.instances.length, 0);
    audio.setMuted(true);
    await audio.unlock();
    assert.equal(TestContext.instances.length, 1);
    const ctx = TestContext.instances[0];
    assert.equal(ctx.nodes[0].gain.value, 0);
    for (const cue of [
      'seal-crack',
      'paper',
      'whoosh',
      'water',
      'bubble-pop',
      'magic-chime',
      'ocean',
    ])
      assert.doesNotThrow(() => audio.play(cue));
    const count = ctx.nodes.length;
    audio.play('ocean');
    assert.equal(ctx.nodes.length, count, 'no overlapping ambience loops');
    audio.setMuted(false);
    assert.equal(ctx.nodes[0].gain.value, 0.42);
    audio.pause();
    assert.equal(ctx.state, 'suspended');
    audio.resume();
    assert.equal(ctx.state, 'running');
    audio.stopOcean();
    audio.stopOcean();
    audio.dispose();
    assert.equal(ctx.state, 'closed');
  } finally {
    globalThis.AudioContext = previous;
  }
});
test('unsupported audio does not prevent the visual invitation', async () => {
  const previous = globalThis.AudioContext;
  globalThis.AudioContext = class {
    constructor() {
      throw new Error('unavailable');
    }
  };
  try {
    const audio = new AudioManager();
    await assert.doesNotReject(() => audio.unlock());
    assert.doesNotThrow(() => audio.play('seal-crack'));
    audio.dispose();
  } finally {
    globalThis.AudioContext = previous;
  }
});
