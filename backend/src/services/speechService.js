const OpenAI = require('openai');
const { toFile } = require('openai');
const openAIKey = process.env.OPENAI_API_KEY?.trim();
const openai = new OpenAI({ apiKey: openAIKey || 'not-configured' });

exports.transcribeAudioBuffer = async (buffer, mimeType = 'audio/webm') => {
  if (!openAIKey) return '';
  const extension = mimeType.includes('mpeg') ? 'mp3' : mimeType.includes('wav') ? 'wav' : 'webm';
  const audioFile = await toFile(buffer, `recording.${extension}`, { type: mimeType });
  const transcription = await openai.audio.transcriptions.create({
    file: audioFile, model: 'whisper-1', language: 'en'
  });
  return transcription.text;
};

exports.synthesizeSpeech = async (text) => {
  const response = await openai.audio.speech.create({
    model: 'tts-1', voice: 'nova', input: text
  });
  return Buffer.from(await response.arrayBuffer());
};
