import { useState, useRef, useCallback, useEffect } from 'react';

export function useRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [durationSec, setDurationSec] = useState(0);
  const [waveformData, setWaveformData] = useState(Array(24).fill(6));
  const [error, setError] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const analyserRef = useRef(null);
  const audioCtxRef = useRef(null);

  const startRecording = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioCtxRef.current.createMediaStreamSource(stream);
      const analyser = audioCtxRef.current.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(t => t.stop());
      };
      mediaRecorder.start(200);
      setIsRecording(true);
      setDurationSec(0);
      setAudioBlob(null);
      timerRef.current = setInterval(() => {
        setDurationSec(d => d + 1);
        if (analyserRef.current) {
          const data = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(data);
          setWaveformData(Array.from(data.slice(0, 24)).map(v => Math.max(4, (v / 255) * 40)));
        }
      }, 100);
    } catch (err) {
      setError('Microphone access denied. Please allow microphone in browser settings.');
    }
  }, []);

  const stopRecording = useCallback(() => {
    clearInterval(timerRef.current);
    mediaRecorderRef.current?.stop();
    audioCtxRef.current?.close();
    setIsRecording(false);
    setWaveformData(Array(24).fill(4));
  }, []);

  const resetRecording = useCallback(() => {
    stopRecording();
    setAudioBlob(null);
    setDurationSec(0);
    setWaveformData(Array(24).fill(6));
  }, [stopRecording]);

  useEffect(() => () => clearInterval(timerRef.current), []);

  return { isRecording, audioBlob, durationSec, waveformData, error, startRecording, stopRecording, resetRecording };
}

export function useTimer(initialSeconds, onExpire) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);

  const start = useCallback(() => {
    setIsRunning(true);
    timerRef.current = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) { clearInterval(timerRef.current); setIsRunning(false); onExpire?.(); return 0; }
        return s - 1;
      });
    }, 1000);
  }, [onExpire]);

  const pause = useCallback(() => { clearInterval(timerRef.current); setIsRunning(false); }, []);
  const reset = useCallback((n) => { clearInterval(timerRef.current); setIsRunning(false); setSecondsLeft(n ?? initialSeconds); }, [initialSeconds]);

  useEffect(() => () => clearInterval(timerRef.current), []);

  const formatted = `${String(Math.floor(secondsLeft / 60)).padStart(2,'0')}:${String(secondsLeft % 60).padStart(2,'0')}`;
  const pct = Math.max(0, (secondsLeft / initialSeconds) * 100);
  return { secondsLeft, formatted, pct, isRunning, start, pause, reset };
}
