// Este arquivo gerencia o estado do jogo e a lógica de seleção de palavras.
const GameData = {
    score: 0,
    currentIndex: 0,
    selectedWords: [],
    roundWordsCount: 10,

    getCurrentWord() {
        return this.selectedWords[this.currentIndex];
    },
    
    selectRandomWords(list, n) {
        const shuffled = [...list].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, n);
    },

    resetRound() {
        this.score = 0;
        this.currentIndex = 0;
        this.selectedWords = this.selectRandomWords(wordList, this.roundWordsCount);
    },
};