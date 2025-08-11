// Este arquivo gerencia o estado do jogo e a lógica de seleção de palavras.
const GameData = {
    score: 0,
    currentIndex: 0,
    selectedWords: [],
    roundWordsCount: 10,

    /**
     * Retorna a palavra atual com base no currentIndex.
     * @returns {string} A palavra atual.
     */
    getCurrentWord() {
        return this.selectedWords[this.currentIndex];
    },
    
    /**
     * Seleciona um número 'n' de palavras aleatórias e únicas da lista principal.
     * @param {string[]} list - A lista completa de palavras.
     * @param {number} n - O número de palavras a serem selecionadas.
     * @returns {string[]} Uma nova lista com 'n' palavras únicas.
     */
    selectRandomWords(list, n) {
        // Cria uma cópia da lista para não modificar a original
        const shuffled = [...list].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, n);
    },

    /**
     * Reinicia o estado do jogo para uma nova rodada.
     * Redefine a pontuação, o índice e seleciona um novo conjunto de palavras.
     */
    resetRound() {
        this.score = 0;
        this.currentIndex = 0;
        this.selectedWords = this.selectRandomWords(wordList, this.roundWordsCount);
    },
};