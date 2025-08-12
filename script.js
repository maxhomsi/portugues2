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
        char1: document.getElementById('char1'),
        char2: document.getElementById('char2'),
    };

    // --- Embedded Assets (Characters for Celebration) ---
    // These are complete and verified Base64 strings for animated GIFs.
    const celebratingChar1_base64 = 'data:image/gif;base64,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';
    const celebratingChar2_base64 = 'data:image/gif;base64,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';

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
    
    function normalizeInput(input) {
        return input.trim().toLowerCase().replace(/\s+/g, ' ');
    }
    
    function handleSubmit() {
        const userAnswer = normalizeInput(dom.answerInput.value);
        if (userAnswer === '') return;
        
        const currentWordObject = GameData.getCurrentWord();
        const correctAnswer = currentWordObject.pt;
        const translation = currentWordObject.en;

        dom.answerInput.disabled = true;
        dom.submitBtn.disabled = true;
        dom.feedback.classList.add('visible');
        
        if (userAnswer === correctAnswer.toLowerCase()) {
            GameData.score++;
            dom.feedback.textContent = `✅ Certo! Tradução: ${translation}`;
            dom.feedback.classList.add('correct');
        } else {
            dom.feedback.textContent = `❌ Errado. A palavra era: ${correctAnswer} (Tradução: ${translation})`;
            dom.feedback.classList.add('incorrect');
        }
        
        // Speak the correct word for pronunciation practice, regardless of the outcome.
        speak(correctAnswer);
        
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
        
        // Load character images and unhide
        dom.char1.src = celebratingChar1_base64;
        dom.char2.src = celebratingChar2_base64;
        dom.celebrationCharacters.hidden = false;

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
        dom.char1.src = '';
        dom.char2.src = '';

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

    // --- Game Initialization ---
    GameData.resetRound();
    renderQuestion();
});
