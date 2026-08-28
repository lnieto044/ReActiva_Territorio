import { writeFileSync } from 'fs';
import { execFileSync } from 'child_process';

const API_KEY = process.env.GEMINI_API_KEY;
const FFMPEG = 'C:/Users/Usuario/Documents/ReActiva Territorio/node_modules/@ffmpeg-installer/win32-x64/ffmpeg.exe';
const AUDIO_DIR = 'C:/Users/Usuario/Documents/ReActiva Territorio/pitch-work/audio';
const VOICE = 'Charon';
const MODEL = 'gemini-2.5-flash-preview-tts';

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function synth(text, attempt = 1) {
  // Prompt mas simple: instrucciones contradictorias como "no repitas nada"
  // parecen causarle tartamudeos al modelo. Se quita esa clausula.
  const prompt = `Narra esto en voz alta, en español latinoamericano neutro, voz masculina segura y fluida, ritmo natural de pitch: ${text}`;
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseModalities: ['AUDIO'], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } } } },
      }),
    },
  );
  if ((res.status === 429 || res.status === 503) && attempt <= 6) {
    await sleep(5000 * attempt);
    return synth(text, attempt + 1);
  }
  const data = await res.json();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${JSON.stringify(data).slice(0, 300)}`);
  const part = data.candidates?.[0]?.content?.parts?.[0];
  if (!part?.inlineData?.data) throw new Error('sin audio');
  return Buffer.from(part.inlineData.data, 'base64');
}

const FIXES = {
  'p1-hook':
    'El 10 de agosto de 2026, un sismo de magnitud siete punto cuatro remeció a Colombia. Miles de familias en el Chocó lo perdieron todo. El daño llegó hasta Quibdó, Cali, Pereira, Manizales y Armenia. Y nos hicimos una pregunta simple: ¿cómo se coordina la ayuda cuando más se necesita?',
  'p8-cierre':
    'Esto no es una maqueta de hackatón. Es una herramienta real, lista para un piloto. ReActiva Territorio: coordinar la recuperación, caso por caso. Si quieres saber más, contáctame: Luis Nieto, guillermonieto punto dos mil tres, arroba, gmail punto com.',
};

const EXPECTED_CHARS_PER_SEC = 13.5;
const durations = {};

for (const [id, text] of Object.entries(FIXES)) {
  const expectedSec = text.length / EXPECTED_CHARS_PER_SEC;
  console.log(`Regenerando ${id} (esperado ~${expectedSec.toFixed(1)}s)...`);
  let pcm, dur, tries = 0;
  do {
    tries++;
    pcm = await synth(text);
    dur = pcm.length / (24000 * 2);
    console.log(`  intento ${tries}: ${dur.toFixed(1)}s`);
  } while (dur > expectedSec * 1.6 && tries < 3);

  writeFileSync(`${AUDIO_DIR}/${id}.pcm`, pcm);
  execFileSync(FFMPEG, ['-y', '-loglevel', 'error', '-f', 's16le', '-ar', '24000', '-ac', '1', '-i', `${AUDIO_DIR}/${id}.pcm`, `${AUDIO_DIR}/${id}.wav`]);
  durations[id] = dur;
  console.log(`  OK final: ${dur.toFixed(1)}s`);
}

writeFileSync(`${AUDIO_DIR}/fix_durations.json`, JSON.stringify(durations, null, 2));
console.log('LISTO');
