// Procedural Ambient Sound Synthesizer using Web Audio API
// This ensures continuous, high-quality, offline-capable study sounds
// even if local MP3 files are empty or fail to load.

let audioCtx: AudioContext | null = null;
let sourceNode: AudioBufferSourceNode | ScriptProcessorNode | OscillatorNode | null = null;
let osc1: OscillatorNode | null = null;
let osc2: OscillatorNode | null = null;
let gainNode: GainNode | null = null;
let filterNode: BiquadFilterNode | null = null;
let lfoNode: OscillatorNode | null = null;
let lfoGainNode: GainNode | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

// Generate White Noise Buffer
function createWhiteNoiseBuffer(ctx: AudioContext): AudioBuffer {
  const bufferSize = ctx.sampleRate * 2; // 2 seconds
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

// Generate Brown Noise Buffer
function createBrownNoiseBuffer(ctx: AudioContext): AudioBuffer {
  const bufferSize = ctx.sampleRate * 2; // 2 seconds
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let lastOut = 0.0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    data[i] = (lastOut + (0.02 * white)) / 1.02;
    lastOut = data[i];
    data[i] *= 3.5; // Amplify to match general white noise volume
  }
  return buffer;
}

// Generate Pink Noise Buffer (for smooth rain/river)
function createPinkNoiseBuffer(ctx: AudioContext): AudioBuffer {
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
    data[i] *= 0.11; // estimate
    b6 = white * 0.115926;
  }
  return buffer;
}

export function stopAmbientSound() {
  // Stop all active sources
  try {
    if (sourceNode) {
      sourceNode.disconnect();
      try {
        (sourceNode as any).stop();
      } catch (e) {}
      sourceNode = null;
    }
    if (osc1) {
      osc1.disconnect();
      try { osc1.stop(); } catch (e) {}
      osc1 = null;
    }
    if (osc2) {
      osc2.disconnect();
      try { osc2.stop(); } catch (e) {}
      osc2 = null;
    }
    if (lfoNode) {
      lfoNode.disconnect();
      try { lfoNode.stop(); } catch (e) {}
      lfoNode = null;
    }
    if (lfoGainNode) {
      lfoGainNode.disconnect();
      lfoGainNode = null;
    }
    if (filterNode) {
      filterNode.disconnect();
      filterNode = null;
    }
    if (gainNode) {
      gainNode.disconnect();
      gainNode = null;
    }
  } catch (err) {
    console.warn("Error stopping synth sound:", err);
  }
}

export function playAmbientSound(id: string, volume: number = 0.25) {
  stopAmbientSound();
  if (!id) return;

  try {
    const ctx = getAudioContext();
    gainNode = ctx.createGain();
    // Normalize and scale volume based on user setting
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);

    if (id === "white_noise" || id === "white") {
      const buffer = createWhiteNoiseBuffer(ctx);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      source.connect(gainNode);
      gainNode.connect(ctx.destination);
      source.start();
      sourceNode = source;
    } 
    else if (id === "brown_noise" || id === "brown") {
      const buffer = createBrownNoiseBuffer(ctx);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      source.connect(gainNode);
      gainNode.connect(ctx.destination);
      source.start();
      sourceNode = source;
    } 
    else if (id === "rain") {
      // Pink noise + Bandpass filter centered around 1200Hz + subtle highpass impulses
      const buffer = createPinkNoiseBuffer(ctx);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      filterNode = ctx.createBiquadFilter();
      filterNode.type = "bandpass";
      filterNode.frequency.setValueAtTime(1200, ctx.currentTime);
      filterNode.Q.setValueAtTime(1.0, ctx.currentTime);

      source.connect(filterNode);
      filterNode.connect(gainNode);
      gainNode.connect(ctx.destination);
      source.start();
      sourceNode = source;
    } 
    else if (id === "ocean") {
      // Brown noise modulated by a very slow LFO (0.08Hz - 12.5s cycle) for rolling wave motion
      const buffer = createBrownNoiseBuffer(ctx);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      filterNode = ctx.createBiquadFilter();
      filterNode.type = "lowpass";
      filterNode.frequency.setValueAtTime(400, ctx.currentTime);

      lfoGainNode = ctx.createGain();
      lfoGainNode.gain.setValueAtTime(0.12, ctx.currentTime);

      lfoNode = ctx.createOscillator();
      lfoNode.type = "sine";
      lfoNode.frequency.setValueAtTime(0.08, ctx.currentTime); // very slow roll

      // Connect LFO to control the gain Node
      const waveGain = ctx.createGain();
      waveGain.gain.setValueAtTime(0.15, ctx.currentTime); // base gain

      source.connect(filterNode);
      filterNode.connect(waveGain);
      waveGain.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Connect LFO to modulate wave gain
      lfoNode.connect(lfoGainNode);
      lfoGainNode.connect(waveGain.gain);

      lfoNode.start();
      source.start();
      sourceNode = source;
    } 
    else if (id === "river") {
      // White noise with a custom bandpass and an LFO modulating the center frequency
      // to simulate babbling, flowing water
      const buffer = createWhiteNoiseBuffer(ctx);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      filterNode = ctx.createBiquadFilter();
      filterNode.type = "bandpass";
      filterNode.frequency.setValueAtTime(750, ctx.currentTime);
      filterNode.Q.setValueAtTime(1.5, ctx.currentTime);

      lfoNode = ctx.createOscillator();
      lfoNode.type = "sine";
      lfoNode.frequency.setValueAtTime(0.4, ctx.currentTime); // rapid flutter

      lfoGainNode = ctx.createGain();
      lfoGainNode.gain.setValueAtTime(120, ctx.currentTime); // flutter intensity (120Hz variance)

      source.connect(filterNode);
      filterNode.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Modulate filter frequency for bubbling effect
      lfoNode.connect(lfoGainNode);
      lfoGainNode.connect(filterNode.frequency);

      lfoNode.start();
      source.start();
      sourceNode = source;
    } 
    else if (id === "binaural") {
      // Low relaxing hum
      osc1 = ctx.createOscillator();
      osc2 = ctx.createOscillator();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(110, ctx.currentTime); // 110Hz
      
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(114, ctx.currentTime); // 114Hz binaural difference

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start();
      osc2.start();
    }
  } catch (err) {
    console.warn("Failed to play procedural ambient sound:", err);
  }
}

export function updateAmbientVolume(volume: number) {
  if (gainNode && audioCtx) {
    try {
      gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
    } catch (e) {}
  }
}
