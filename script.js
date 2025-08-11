// --- Get all the HTML elements we need ---
const gameScreen = document.getElementById('game-screen');
const resultsScreen = document.getElementById('results-screen');
const scoreDisplay = document.getElementById('score-display');
const scoreValue = document.getElementById('score-value'); // The number part of the score
const questionCounter = document.getElementById('question-counter');
const cursiveWord = document.getElementById('cursive-word');
const answerForm = document.getElementById('answer-form');
const answerInput = document.getElementById('answer-input');
const feedbackIcon = document.getElementById('feedback-icon');
const finalMessage = document.getElementById('final-message');
const finalScoreDisplay = document.getElementById('final-score-display');
const restartButton = document.getElementById('restart-button');
const fireworksContainer = document.getElementById('fireworks-container');

// --- Game State ---
let score = 0;
let currentQuestionIndex = 0;
let currentWords = [];

// --- Functions ---

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function displayQuestion() {
    feedbackIcon.textContent = '';
    feedbackIcon.className = '';
    answerInput.value = '';
    answerInput.disabled = false;
    answerInput.focus();

    cursiveWord.textContent = currentWords[currentQuestionIndex];
    // Add animation class to make the word pop in
    cursiveWord.style.animation = 'none';
    cursiveWord.offsetHeight; /* trigger reflow */
    cursiveWord.style.animation = null; 

    scoreValue.textContent = score;
    questionCounter.textContent = `Questão ${currentQuestionIndex + 1} de 10`;
}

function endRound() {
    gameScreen.classList.add('hidden');
    resultsScreen.classList.remove('hidden');
    finalMessage.className = ''; // Reset class from previous round

    if (score === 10) {
        finalMessage.textContent = 'PARABÉNS!!!';
        finalMessage.classList.add('rainbow'); // Add rainbow class for the text!
        fireworksContainer.innerHTML = `
            <div class="firework"></div><div class="firework"></div><div class="firework"></div>
            <div class="firework"></div><div class="firework"></div><div class="firework"></div>
        `;
        fireworksContainer.classList.add('active');
    } else if (score >= 5) {
        finalMessage.textContent = 'Muito bem, quase 100%!';
    } else {
        finalMessage.textContent = 'Vamos tentar novamente?';
    }

    finalScoreDisplay.textContent = `Sua pontuação: ${score} de 10 acertos`;
}

function startNewRound() {
    score = 0;
    currentQuestionIndex = 0;
    currentWords = shuffleArray([...wordList]).slice(0, 10);
    
    resultsScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    fireworksContainer.classList.remove('active');
    fireworksContainer.innerHTML = '';

    displayQuestion();
}

answerForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const userAnswer = answerInput.value.trim().toLowerCase();
    if (userAnswer === '') return;

    const correctAnswer = currentWords[currentQuestionIndex].toLowerCase();
    answerInput.disabled = true;

    if (userAnswer === correctAnswer) {
        score++;
        feedbackIcon.textContent = '✅';
        feedbackIcon.className = 'correct';
        // Trigger the score pulse animation!
        scoreDisplay.classList.add('score-update');
        setTimeout(() => scoreDisplay.classList.remove('score-update'), 500);
    } else {
        feedbackIcon.textContent = '❌';
        feedbackIcon.className = 'incorrect';
    }

    setTimeout(() => {
        if (currentQuestionIndex < 9) {
            currentQuestionIndex++;
            displayQuestion();
        } else {
            endRound();
        }
    }, 1200);
});

restartButton.addEventListener('click', startNewRound);

// --- Initial Game Start ---
startNewRound();