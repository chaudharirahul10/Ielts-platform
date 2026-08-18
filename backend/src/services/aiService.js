const OpenAI = require('openai');

const openAIKey = process.env.OPENAI_API_KEY?.trim();
const openai = new OpenAI({ apiKey: openAIKey || 'not-configured' });
const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

function safeJSON(text) {
  return JSON.parse(text.replace(/```json|```/g, '').trim());
}

async function useAI(request, fallback, label) {
  if (!openAIKey) return fallback();
  try {
    return await request();
  } catch (err) {
    console.error(`${label} failed:`, err.message);
    return fallback();
  }
}

function tutorFallback(messages) {
  const question = messages.filter((message) => message.role === 'user').at(-1)?.content || 'your IELTS preparation';
  return `For ${question.slice(0, 90)}, use a clear three-step answer: state your idea, explain it, then give one specific example. Review the useful vocabulary from the question and practise the answer aloud once at a natural pace.`;
}

function writingFallback(essay) {
  const words = essay.trim().split(/\s+/).filter(Boolean).length;
  const band = words >= 250 ? 6 : words >= 180 ? 5.5 : 5;
  return {
    bandScore: band,
    criteria: {
      taskAchievement: { band, feedback: words >= 250 ? 'Your response meets the expected length.' : 'Develop your ideas further and aim for at least 250 words.' },
      coherenceCohesion: { band, feedback: 'Use a clear introduction, body paragraphs, and a concise conclusion.' },
      lexicalResource: { band, feedback: 'Replace repeated words with precise topic vocabulary.' },
      grammaticalRange: { band, feedback: 'Include a mix of simple, compound, and complex sentences.' },
    },
    strengths: ['A complete response was submitted', 'Your writing is ready for focused revision'],
    improvements: ['Support each main idea with a specific example', 'Check article use and verb tense consistency'],
    improvedVersion: essay,
    vocabularySuggestions: [],
    commonMistakes: [],
  };
}

function speakingFallback(durationSec = 0) {
  const band = durationSec >= 45 ? 6 : 5.5;
  return {
    bandScore: band,
    criteria: {
      fluencyCoherence: { band, feedback: durationSec >= 30 ? 'Keep your ideas connected with linking phrases.' : 'Aim to speak for at least 30 seconds before stopping.' },
      lexicalResource: { band, feedback: 'Add precise topic-specific vocabulary and avoid repeated basic words.' },
      grammaticalRange: { band, feedback: 'Use a mix of simple and complex sentences accurately.' },
      pronunciation: { band, feedback: 'Speak steadily and stress the important words in each sentence.' },
    },
    strengths: ['Your response was recorded successfully', 'You practised answering an IELTS prompt'],
    improvements: ['Add a specific example to support each main point', 'Use linking phrases such as "for example" and "as a result"'],
    betterPhrases: [{ said: 'I think', better: 'From my perspective' }],
  };
}

function studyPlanFallback({ targetBand, studyHoursPerDay, weakAreas }) {
  const modules = ['listening', 'reading', 'writing', 'speaking', 'vocabulary', 'grammar', 'mixed'];
  const days = modules.map((module, index) => ({
    dayLabel: `Day ${index + 1}`,
    tasks: [
      { module, title: `${module[0].toUpperCase()}${module.slice(1)} practice`, durationMin: Math.max(20, Number(studyHoursPerDay || 1) * 30) },
      { module: 'vocabulary', title: 'Review 10 IELTS words', durationMin: 15 },
    ],
  }));
  return { summary: `A weekly plan to move toward Band ${targetBand}. Focus areas: ${weakAreas?.join(', ') || 'all core skills'}.`, weeks: [{ weekNumber: 1, focus: 'Build consistent IELTS practice', days }] };
}

function vocabularyFallback({ topic, count }) {
  const roots = ['significant', 'sustainable', 'evaluate', 'consequence', 'innovative', 'essential', 'widespread', 'beneficial'];
  return { words: roots.slice(0, Number(count) || 6).map((word) => ({
    word,
    partOfSpeech: 'adjective',
    definition: `A useful academic word for discussing ${topic}.`,
    example: `This is a ${word} issue when discussing ${topic}.`,
    synonyms: ['important', 'relevant'],
    usageNotes: 'Use this word only where it accurately describes your idea.',
  })) };
}

exports.evaluateWriting = async ({ essay, taskType, questionText }) => useAI(async () => {
  const prompt = `Evaluate this IELTS Writing ${taskType}. Question: ${questionText}. Response: ${essay}. Return JSON with bandScore, criteria (taskAchievement, coherenceCohesion, lexicalResource, grammaticalRange each with band and feedback), strengths, improvements, improvedVersion, vocabularySuggestions, commonMistakes.`;
  const response = await openai.chat.completions.create({ model, messages: [{ role: 'user', content: prompt }], temperature: 0.3, response_format: { type: 'json_object' } });
  return safeJSON(response.choices[0].message.content);
}, () => writingFallback(essay), 'Writing evaluation');

exports.evaluateSpeaking = async ({ transcript, questionText, part, durationSec }) => {
  if (!transcript) return speakingFallback(durationSec);
  return useAI(async () => {
    const prompt = `Evaluate this IELTS Speaking Part ${part}. Question: ${questionText}. Transcript: ${transcript}. Return JSON with bandScore, criteria (fluencyCoherence, lexicalResource, grammaticalRange, pronunciation each with band and feedback), strengths, improvements, betterPhrases.`;
    const response = await openai.chat.completions.create({ model, messages: [{ role: 'user', content: prompt }], temperature: 0.3, response_format: { type: 'json_object' } });
    return safeJSON(response.choices[0].message.content);
  }, () => speakingFallback(durationSec), 'Speaking evaluation');
};

exports.generateStudyPlan = async (input) => useAI(async () => {
  const prompt = `Create an IELTS study plan as JSON for current band ${input.currentLevel}, target ${input.targetBand}, exam date ${input.examDate}, ${input.studyHoursPerDay} hours daily. Return {summary,weeks:[{weekNumber,focus,days:[{dayLabel,tasks:[{module,title,durationMin}]}]}]}.`;
  const response = await openai.chat.completions.create({ model, messages: [{ role: 'user', content: prompt }], temperature: 0.4, response_format: { type: 'json_object' } });
  return safeJSON(response.choices[0].message.content);
}, () => studyPlanFallback(input), 'Study plan generation');

exports.generateVocabulary = async (input) => useAI(async () => {
  const prompt = `Generate ${input.count || 6} IELTS words for ${input.topic} at ${input.difficulty}. Return JSON {words:[{word,partOfSpeech,definition,example,synonyms,usageNotes}]}.`;
  const response = await openai.chat.completions.create({ model, messages: [{ role: 'user', content: prompt }], temperature: 0.5, response_format: { type: 'json_object' } });
  return safeJSON(response.choices[0].message.content);
}, () => vocabularyFallback(input), 'Vocabulary generation');

exports.chatWithTutor = async ({ messages, userContext }) => useAI(async () => {
  const system = `You are an IELTS tutor for a student at band ${userContext.currentLevel} targeting ${userContext.targetBand}. Be specific, accurate, and use at most 120 words.`;
  const response = await openai.chat.completions.create({ model, messages: [{ role: 'system', content: system }, ...messages], temperature: 0.7, max_tokens: 400 });
  return response.choices[0].message.content;
}, () => tutorFallback(messages), 'Tutor chat');

exports.explainAnswer = async ({ questionText, userAnswer, correctAnswer, context }) => useAI(async () => {
  const prompt = `Explain an IELTS answer in under 100 words. Question: ${questionText}. Student: ${userAnswer}. Correct: ${correctAnswer}. Context: ${context || 'N/A'}.`;
  const response = await openai.chat.completions.create({ model, messages: [{ role: 'user', content: prompt }], temperature: 0.3, max_tokens: 250 });
  return response.choices[0].message.content;
}, () => `The correct answer is ${correctAnswer}. Compare the question carefully with the supporting sentence in the passage: use only information that is stated directly, not an assumption.`, 'Answer explanation');

exports.quickGrammarCheck = async ({ text }) => useAI(async () => {
  const prompt = `Check grammar in this text and return JSON {errorCount,corrections:[{original,corrected,explanation}],correctedText}: ${text}`;
  const response = await openai.chat.completions.create({ model, messages: [{ role: 'user', content: prompt }], temperature: 0.2, response_format: { type: 'json_object' } });
  return safeJSON(response.choices[0].message.content);
}, () => ({ errorCount: 0, corrections: [], correctedText: text }), 'Grammar check');
