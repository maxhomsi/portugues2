// data.js
import { WORDS } from './wordlist.js';

// utility: remove diacritics (normalize accents) for forgiving comparisons
export function normalizeText(s) {
  if (typeof s !== 'string') return '';
  // NFD decomposition, remove diacritics, toLowerCase, trim
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

// Structure to hold stroke data per question
// A stroke is an array of points [{x,y,t}], where t is timestamp (optional)
export class StrokeRecorder {
  constructor() {
    this.strokes = []; // array of strokes, each stroke is array of points
    this.currentStroke = null;
  }

  start(x, y) {
    this.currentStroke = [{ x, y, t: Date.now() }];
  }

  move(x, y) {
    if (!this.currentStroke) return;
    this.currentStroke.push({ x, y, t: Date.now() });
  }

  end() {
    if (!this.currentStroke) return;
    this.strokes.push(this.currentStroke);
    this.currentStroke = null;
  }

  clear() {
    this.strokes = [];
    this.currentStroke = null;
  }

  export() {
    // return a deep copy
    return JSON.parse(JSON.stringify(this.strokes));
  }

  import(strokes) {
    this.strokes = JSON.parse(JSON.stringify(strokes || []));
  }
}

// Game state manager
export class GameState {
  constructor(roundSize = 10) {
    this.roundSize = roundSize;
    this.reset();
  }

  reset() {
    // shuffle words and pick unique roundSize words
    const copy = [...WORDS];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    this.roundWords = copy.slice(0, this.roundSize);
    this.currentIndex = 0;
    this.score = 0;
    this.history = []; // array of { word, expected, answer, correct, strokes }
    this.finished = false;
  }

  getCurrentWord() {
    if (!this.roundWords || this.currentIndex >= this.roundWords.length) return null;
    return this.roundWords[this.currentIndex];
  }

  recordAnswer(answerText, strokes) {
    const expected = this.getCurrentWord();
    const cleanAnswer = normalizeText(answerText || '');
    const expectedNorm = normalizeText(expected || '');
    const correct = cleanAnswer === expectedNorm;
    if (correct) this.score++;
    // store answer and strokes
    this.history.push({ word: expected, expected, answer: answerText.trim(), answerNorm: cleanAnswer, correct, strokes: strokes || [] });
    this.currentIndex++;
    if (this.currentIndex >= this.roundWords.length) this.finished = true;
    return { correct, expected };
  }

  // get percent score
  getPercent() {
    return Math.round((this.score / this.roundSize) * 100);
  }
}
