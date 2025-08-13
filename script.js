document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const dom = {
        body: document.body,
        gameContainer: document.getElementById('gameContainer'),
        wordArea: document.querySelector('.word-area'),
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
        confettiContainer: document.getElementById('confettiContainer'),
        celebrationCharacters: document.getElementById('celebrationCharacters'),
    };

    // --- Audio and Voice Synthesis Setup ---
    const synth = window.speechSynthesis;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioCtx = AudioContext ? new AudioContext() : null;
    let ptBrVoice = null;
    
    function loadVoices() {
        if (!synth) return;
        const voices = synth.getVoices();
        ptBrVoice = voices.find(voice => voice.lang === 'pt-BR') || voices.find(voice => voice.lang.startsWith('pt'));
    }

    if (synth) {
      synth.onvoiceschanged = loadVoices;
      loadVoices();
    }
    
    /**
     * Speaks the given text using the Portuguese voice.
     * @param {string} text - The text to be spoken.
     */
    function speak(text) {
        if (!synth || !ptBrVoice) return;
        if (synth.speaking) synth.cancel();
        const utterThis = new SpeechSynthesisUtterance(text);
        utterThis.voice = ptBrVoice;
        utterThis.pitch = 1.1;
        utterThis.rate = 0.9;
        synth.speak(utterThis);
    }
    
    /**
     * Plays a celebratory "tada" sound.
     */
    function playTadaSound() {
        if (!audioCtx) return;
        const notes = [349.23, 440.00, 523.25, 698.46]; // F4, A4, C5, F5
        let startTime = audioCtx.currentTime;
        notes.forEach(freq => {
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(freq, startTime);
            gainNode.gain.setValueAtTime(0.3, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.5);
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            oscillator.start(startTime);
            oscillator.stop(startTime + 0.6);
            startTime += 0.1;
        });
    }

    /**
     * Dynamically adjusts the font size of an element to fit its container.
     * @param {HTMLElement} textElement - The text element to resize.
     */
    function adjustFontSize(textElement) {
        const container = dom.wordArea;
        textElement.style.fontSize = ''; // Reset to max size from CSS
        const style = window.getComputedStyle(textElement);
        let currentFontSize = parseFloat(style.fontSize);

        // Reduce font size iteratively until the text fits
        while (textElement.scrollWidth > container.clientWidth && currentFontSize > 16) {
            currentFontSize -= 2; // Decrease by 2px for faster adjustment
            textElement.style.fontSize = `${currentFontSize}px`;
        }
    }

    /**
     * Renders the current question on the screen.
     */
    function renderQuestion() {
        const currentWordObject = GameData.getCurrentWord();
        if (!currentWordObject) {
            console.error("No more words to display. Restarting round.");
            restartRound();
            return;
        }
        dom.wordDisplay.classList.add('changing');

        setTimeout(() => {
            dom.wordDisplay.textContent = currentWordObject.pt;
            dom.wordDisplay.classList.remove('changing');
            adjustFontSize(dom.wordDisplay); // Adjust font size after rendering
        }, 150);

        dom.scoreboard.textContent = `Pontuação: ${GameData.score}/${GameData.roundWordsCount}`;
        dom.questionInfo.textContent = `Pergunta ${GameData.currentIndex + 1} de ${GameData.roundWordsCount}`;
        dom.answerInput.value = '';
        dom.answerInput.disabled = false;
        dom.submitBtn.disabled = false;
        dom.feedback.textContent = '';
        dom.feedback.className = 'feedback';
        dom.answerInput.focus();
    }
    
    function normalizeInput(str) {
        if (typeof str !== 'string') return '';
        const withoutAccents = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return withoutAccents.trim().toLowerCase().replace(/\s+/g, ' ');
    }
    
    function handleSubmit() {
        const userAnswer = dom.answerInput.value;
        if (userAnswer === '') return;
        
        const currentWordObject = GameData.getCurrentWord();
        const correctAnswerWithAccents = currentWordObject.pt;
        const translation = currentWordObject.en;

        const normalizedUserAnswer = normalizeInput(userAnswer);
        const normalizedCorrectAnswer = normalizeInput(correctAnswerWithAccents);

        dom.answerInput.disabled = true;
        dom.submitBtn.disabled = true;
        dom.feedback.classList.add('visible');
        
        if (normalizedUserAnswer === normalizedCorrectAnswer) {
            GameData.score++;
            dom.feedback.textContent = `✅ Certo! Tradução: ${translation}`;
            dom.feedback.classList.add('correct');
        } else {
            dom.feedback.textContent = `❌ Errado. A palavra era: ${correctAnswerWithAccents} (Tradução: ${translation})`;
            dom.feedback.classList.add('incorrect');
        }
        
        // Speak the correct word for pronunciation practice, regardless of the outcome.
        speak(correctAnswerWithAccents);
        
        dom.scoreboard.textContent = `Pontuação: ${GameData.score}/${GameData.roundWordsCount}`;
        setTimeout(advanceOrFinish, 2500);
    }

    function advanceOrFinish() {
        GameData.currentIndex++;
        if (GameData.currentIndex < GameData.roundWordsCount) {
            renderQuestion();
        } else {
            showResultModal();
        }
    }

    function showResultModal() {
        const score = GameData.score;
        let title = '';
        let text = `Sua pontuação final foi: ${score} de ${GameData.roundWordsCount}`;

        if (score === GameData.roundWordsCount) {
            title = '🏆 PARABÉNS! 🏆';
            text = 'Você acertou todas! Que incrível! ' + text;
            triggerGrandCelebration();
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
    
    function triggerGrandCelebration() {
        dom.body.classList.add('celebration-mode');
        dom.gameContainer.classList.add('celebration-mode');
        dom.resultTitle.classList.add('celebration-mode');
        
        // The character assets were removed to prevent errors.
        // dom.celebrationCharacters.hidden = false;

        triggerFireworks();
        triggerConfetti();
        playTadaSound(); // The only celebratory audio call
    }

    function restartRound() {
        GameData.resetRound();
        dom.resultModal.hidden = true;
        
        // Reset all celebration effects
        dom.body.classList.remove('celebration-mode');
        dom.gameContainer.classList.remove('celebration-mode');
        dom.resultTitle.classList.remove('celebration-mode');
        dom.fireworksContainer.innerHTML = '';
        dom.confettiContainer.innerHTML = '';
        dom.celebrationCharacters.hidden = true;

        renderQuestion();
    }

    function triggerFireworks() {
        const count = 30, container = dom.fireworksContainer;
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const explosion = document.createElement('div');
                explosion.style.left = `${Math.random() * 100}%`;
                explosion.style.top = `${Math.random() * 100}%`;
                for (let j = 0; j < 25; j++) {
                    const p = document.createElement('div');
                    p.classList.add('particle');
                    p.style.setProperty('--x', `${(Math.random() - 0.5) * 200}px`);
                    p.style.setProperty('--y', `${(Math.random() - 0.5) * 200}px`);
                    p.style.background = `hsl(${Math.random() * 360}, 100%, 50%)`;
                    explosion.appendChild(p);
                }
                container.appendChild(explosion);
                setTimeout(() => explosion.remove(), 1000);
            }, Math.random() * 1500);
        }
    }
    
    function triggerConfetti() {
        const count = 100, container = dom.confettiContainer;
        const colors = ['#f94144', '#f3722c', '#f8961e', '#f9c74f', '#90be6d', '#43aa8b', '#577590'];
        for (let i = 0; i < count; i++) {
            const p = document.createElement('div');
            p.classList.add('particle');
            p.style.left = `${Math.random() * 100}%`;
            p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            p.style.animationDelay = `${Math.random() * 4}s`;
            p.style.transform = `rotate(${Math.random() * 360}deg)`;
            container.appendChild(p);
        }
    }

    // --- Event Listeners ---
    dom.submitBtn.addEventListener('click', handleSubmit);
    dom.answerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSubmit();
    });
    dom.restartBtn.addEventListener('click', restartRound);

    // Prevent copy/paste on the input field
    dom.answerInput.addEventListener('paste', (e) => e.preventDefault());
    
    // --- Game Initialization ---
    GameData.resetRound();
    renderQuestion();
});
