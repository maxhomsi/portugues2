// Este arquivo contém toda a lógica interativa do jogo.

document.addEventListener('DOMContentLoaded', () => {
    // --- Referências aos Elementos do DOM ---
    const dom = {
        wordDisplay: document.getElementById('wordDisplay'),
        answerInput: document.getElementById('answerInput'),
        submitBtn: document.getElementById('submitBtn'),
        feedback: document.getElementById('feedback'),
        scoreboard: document.getElementById('scoreboard'),
        questionInfo: document.getElementById('questionInfo'),
        resultModal: document.getElementById('resultModal'),
        resultTitle: document.getElementById('resultTitle'),
        resultText: document.getElementById('resultText'),
        restartBtn: document.getElementById('restartBtn'),
        fireworksContainer: document.getElementById('fireworksContainer'),
    };

    // --- Configuração da Síntese de Voz ---
    const synth = window.speechSynthesis;
    let ptBrVoice = null;
    
    function loadVoices() {
        const voices = synth.getVoices();
        ptBrVoice = voices.find(voice => voice.lang === 'pt-BR');
        // Fallback para a primeira voz pt, caso 'pt-BR' não exista
        if (!ptBrVoice) {
            ptBrVoice = voices.find(voice => voice.lang.startsWith('pt'));
        }
    }
    // As vozes são carregadas de forma assíncrona
    synth.onvoiceschanged = loadVoices;
    loadVoices();

    /**
     * Fala o texto fornecido usando a voz pt-BR.
     * @param {string} text - O texto a ser falado.
     */
    function speak(text) {
        if (synth.speaking) {
            synth.cancel();
        }
        if (text !== '' && ptBrVoice) {
            const utterThis = new SpeechSynthesisUtterance(text);
            utterThis.voice = ptBrVoice;
            utterThis.pitch = 1.1;
            utterThis.rate = 0.9;
            synth.speak(utterThis);
        }
    }

    /**
     * Renderiza a questão atual na tela.
     */
    function renderQuestion() {
        const currentWordObject = GameData.getCurrentWord();
        
        // Animação de troca de palavra
        dom.wordDisplay.classList.add('changing');

        setTimeout(() => {
            // Mostra a palavra em português
            dom.wordDisplay.textContent = currentWordObject.pt;
            dom.wordDisplay.classList.remove('changing');
        }, 150); // Metade da transição

        dom.scoreboard.textContent = `Pontuação: ${GameData.score}/${GameData.roundWordsCount}`;
        dom.questionInfo.textContent = `Pergunta ${GameData.currentIndex + 1} de ${GameData.roundWordsCount}`;

        // Limpa o estado da UI
        dom.answerInput.value = '';
        dom.answerInput.disabled = false;
        dom.submitBtn.disabled = false;
        dom.feedback.textContent = '';
        dom.feedback.className = 'feedback';

        dom.answerInput.focus();
    }
    
    /**
     * Normaliza a entrada do usuário para comparação.
     * @param {string} input - A string de entrada.
     * @returns {string} A string normalizada em minúsculas.
     */
    function normalizeInput(input) {
        return input.trim().toLowerCase().replace(/\s+/g, ' ');
    }
    
    /**
     * Manipula o envio da resposta pelo usuário.
     */
    function handleSubmit() {
        const userAnswer = normalizeInput(dom.answerInput.value);
        const currentWordObject = GameData.getCurrentWord();
        const correctAnswer = currentWordObject.pt;
        const translation = currentWordObject.en;

        if (userAnswer === '') return;

        dom.answerInput.disabled = true;
        dom.submitBtn.disabled = true;

        dom.feedback.classList.add('visible');
        // Compara a resposta do usuário (em minúsculas) com a resposta correta (convertida para minúsculas)
        if (userAnswer === correctAnswer.toLowerCase()) {
            GameData.score++;
            dom.feedback.textContent = `✅ Certo! Tradução: ${translation}`;
            dom.feedback.classList.add('correct');
            speak(correctAnswer);
        } else {
            dom.feedback.textContent = `❌ Errado. A palavra era: ${correctAnswer} (Tradução: ${translation})`;
            dom.feedback.classList.add('incorrect');
        }
        
        dom.scoreboard.textContent = `Pontuação: ${GameData.score}/${GameData.roundWordsCount}`;

        setTimeout(advanceOrFinish, 2500); // Aumentado o tempo para dar chance de ler a tradução
    }

    /**
     * Avança para a próxima pergunta ou finaliza o jogo.
     */
    function advanceOrFinish() {
        GameData.currentIndex++;
        if (GameData.currentIndex < GameData.roundWordsCount) {
            renderQuestion();
        } else {
            showResultModal();
        }
    }

    /**
     * Exibe o modal de resultados com a pontuação final.
     */
    function showResultModal() {
        const score = GameData.score;
        let title = '';
        let text = `Sua pontuação final foi: ${score} de ${GameData.roundWordsCount}`;

        if (score === GameData.roundWordsCount) {
            title = '🎉 PARABÉNS!!!!!! 🎉';
            triggerFireworks();
        } else if (score >= 5) {
            title = 'Muito bem!';
            text = 'Você está quase lá! Continue praticando. ' + text;
        } else {
            title = 'Continue tentando!';
            text = 'A prática leva à perfeição. Vamos de novo? ' + text;
        }

        dom.resultTitle.textContent = title;
        dom.resultText.textContent = text;
        dom.resultModal.hidden = false;
        dom.restartBtn.focus();
    }

    /**
     * Inicia uma nova rodada do jogo.
     */
    function restartRound() {
        GameData.resetRound();
        dom.resultModal.hidden = true;
        renderQuestion();
    }

    /**
     * Dispara a animação de fogos de artifício em CSS.
     */
    function triggerFireworks() {
        const fireworksCount = 30; // Número de "explosões"
        const container = dom.fireworksContainer;
        container.innerHTML = '';

        for (let i = 0; i < fireworksCount; i++) {
            setTimeout(() => {
                const explosion = document.createElement('div');
                explosion.style.left = `${Math.random() * 100}%`;
                explosion.style.top = `${Math.random() * 100}%`;

                for (let j = 0; j < 25; j++) { // Partículas por explosão
                    const particle = document.createElement('div');
                    particle.classList.add('particle');
                    particle.style.setProperty('--x', `${(Math.random() - 0.5) * 200}px`);
                    particle.style.setProperty('--y', `${(Math.random() - 0.5) * 200}px`);
                    particle.style.background = `hsl(${Math.random() * 360}, 100%, 50%)`;
                    explosion.appendChild(particle);
                }
                container.appendChild(explosion);
                
                // Remove a explosão do DOM após a animação
                setTimeout(() => explosion.remove(), 1000);

            }, Math.random() * 1500);
        }
    }

    // --- Vinculação de Eventos ---
    dom.submitBtn.addEventListener('click', handleSubmit);
    dom.answerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    });
    dom.restartBtn.addEventListener('click', restartRound);

    // --- Inicialização do Jogo ---
    GameData.resetRound();
    renderQuestion();
});