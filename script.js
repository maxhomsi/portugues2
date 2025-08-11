// --- Get all the HTML elements we need to work with ---
const gameScreen = document.getElementById('game-screen');
const resultsScreen = document.getElementById('results-screen');
const scoreDisplay = document.getElementById('score-display');
const questionCounter = document.getElementById('question-counter');
const cursiveWord = document.getElementById('cursive-word');
const answerForm = document.getElementById('answer-form');
const answerInput = document.getElementById('answer-input');
const feedbackIcon = document.getElementById('feedback-icon');
const finalMessage = document.getElementById('final-message');
const finalScoreDisplay = document.getElementById('final-score-display');
const restartButton = document.getElementById('restart-button');
const fireworksContainer = document.getElementById('fireworks-container');

// --- Game State Variables ---
let score = 0;
let currentQuestionIndex = 0;
let currentWords = [];

// --- Functions ---

// Function to shuffle an array (the Fisher-Yates shuffle algorithm)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
    return array;
}

// Function to display the current question
function displayQuestion() {
    // Clear previous feedback and input
    feedbackIcon.textContent = '';
    feedbackIcon.className = '';
    answerInput.value = '';
    answerInput.disabled = false;
    answerInput.focus();

    // Update the displays
    cursiveWord.textContent = currentWords[currentQuestionIndex];
    scoreDisplay.textContent = `Pontos: ${score}`;
    questionCounter.textContent = `Questão ${currentQuestionIndex + 1} de 10`;
}

// Function to handle the end of the round
function endRound() {
    // Hide game, show results
    gameScreen.classList.add('hidden');
    resultsScreen.classList.remove('hidden');

    // Display final message based on score
    if (score === 10) {
        finalMessage.textContent = 'PARABENS!!!!!!';
        // Trigger the fireworks! 🎆
        fireworksContainer.innerHTML = `
            <div class="firework"></div> <div class="firework"></div>
            <div class="firework"></div> <div class="firework"></div>
            <div class="firework"></div> <div class="firework"></div>
        `;
        fireworksContainer.classList.add('active');
    } else if (score >= 5) {
        finalMessage.textContent = 'Muito bem, quase 100%!';
    } else {
        finalMessage.textContent = 'Vamos tentar novamente?';
    }

    finalScoreDisplay.textContent = `Sua pontuação final: ${score} de 10`;
}

// Function to start a new round from scratch
function startNewRound() {
    // Reset state
    score = 0;
    currentQuestionIndex = 0;
    
    // Get 10 new unique words
    currentWords = shuffleArray([...wordList]).slice(0, 10);
    
    // Reset UI
    resultsScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    fireworksContainer.classList.remove('active');
    fireworksContainer.innerHTML = ''; // Clear old fireworks

    displayQuestion();
}

// --- Event Listeners ---

// Listen for when the user submits an answer
answerForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Stop the page from reloading
    
    const userAnswer = answerInput.value.trim().toLowerCase();
    if (userAnswer === '') return; // Don't do anything if the input is empty

    const correctAnswer = currentWords[currentQuestionIndex].toLowerCase();
    
    answerInput.disabled = true; // Disable input while showing feedback

    // Check if the answer is correct
    if (userAnswer === correctAnswer) {
        score++;
        feedbackIcon.textContent = '✓';
        feedbackIcon.className = 'correct';
    } else {
        feedbackIcon.textContent = '✗';
        feedbackIcon.className = 'incorrect';
    }

    // Wait a moment, then move to the next question or end the game
    setTimeout(() => {
        if (currentQuestionIndex < 9) {
            currentQuestionIndex++;
            displayQuestion();
        } else {
            endRound();
        }
    }, 1000); // 1-second delay
});

// Listen for when the "Jogue Novamente" button is clicked
restartButton.addEventListener('click', startNewRound);

// --- Initial Game Start ---
// Start the first round as soon as the page loads!
startNewRound();