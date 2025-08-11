// Game state variables
let currentWords = [];
let currentIndex = 0;
let score = 0;
let feedbackTimeout;
let roundOver = false;

// DOM elements
const cursiveWordEl = document.getElementById('cursive-word');
const userInputEl = document.getElementById('user-input');
const submitBtn = document.getElementById('submit-btn');
const scoreDisplayEl = document.getElementById('score-display');
const questionCountEl = document.getElementById('question-count');
const feedbackEl = document.getElementById('feedback-message');
const mainContentEl = document.getElementById('main-content');
const appContainerEl = document.querySelector('.app-container');

// Start a new game round
function newGame() {
    score = 0;
    currentIndex = 0;
    roundOver = false;
    currentWords = [];
    
    // Shuffle the words and pick the first 10
    const shuffledWords = [...words].sort(() => 0.5 - Math.random());
    currentWords = shuffledWords.slice(0, 10);
    
    // Clear the main content and show the game
    mainContentEl.innerHTML = `
        <div class="game-container">
            <div class="question-info">
                <span id="question-count">Questão 1 de 10</span>
            </div>
            <div class="word-display-container">
                <p id="cursive-word"></p>
            </div>
            <div class="input-container">
                <input type="text" id="user-input" placeholder="Escreva a palavra aqui...">
                <button id="submit-btn">Enviar</button>
            </div>
            <div id="feedback-message"></div>
        </div>
    `;

    // Re-assign DOM elements after new HTML is loaded
    cursiveWordEl = document.getElementById('cursive-word');
    userInputEl = document.getElementById('user-input');
    submitBtn = document.getElementById('submit-btn');
    questionCountEl = document.getElementById('question-count');
    feedbackEl = document.getElementById('feedback-message');

    // Add event listener to the new submit button
    submitBtn.addEventListener('click', checkAnswer);
    userInputEl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            checkAnswer();
        }
    });

    updateUI();
}

// Update the UI with the next word and score
function updateUI() {
    if (currentIndex < 10) {
        cursiveWordEl.textContent = currentWords[currentIndex];
        userInputEl.value = '';
        userInputEl.focus();
        scoreDisplayEl.textContent = `Score: ${score}/10`;
        questionCountEl.textContent = `Questão ${currentIndex + 1} de 10`;
    } else {
        endGame();
    }
}

// Check the user's answer
function checkAnswer() {
    if (roundOver) return;

    const userAnswer = userInputEl.value.trim().toLowerCase();
    const correctAnswer = currentWords[currentIndex].toLowerCase();

    if (userAnswer === correctAnswer) {
        score++;
        showFeedback("🎉 Correto!", "positive");
    } else {
        showFeedback(`❌ Incorreto. Era "${correctAnswer}".`, "negative");
    }

    currentIndex++;
    setTimeout(updateUI, 1500); // Wait 1.5 seconds before moving to the next word
}

// Display feedback message to the user
function showFeedback(message, className) {
    clearTimeout(feedbackTimeout);
    feedbackEl.textContent = message;
    feedbackEl.className = className;
    feedbackTimeout = setTimeout(() => {
        feedbackEl.textContent = '';
        feedbackEl.className = '';
    }, 1500);
}

// Handle the end of the game
function endGame() {
    roundOver = true;
    let endMessage = "";
    let isFirework = false;

    if (score === 10) {
        endMessage = "PARABENS!!!!!! 🥳";
        isFirework = true;
    } else if (score >= 5) {
        endMessage = "Muito bem, quase 100%! 👍";
    } else {
        endMessage = "Vamos tentar novamente? 😢";
    }

    // Display end screen
    mainContentEl.innerHTML = `
        <div class="end-screen">
            <h2>Fim da Rodada!</h2>
            <p>Seu score foi de ${score} de 10.</p>
            <p>${endMessage}</p>
            <button id="play-again-btn">Jogar Novamente</button>
        </div>
    `;

    // Add event listener to the new "Play Again" button
    document.getElementById('play-again-btn').addEventListener('click', newGame);

    if (isFirework) {
        createFireworks();
    }
}

// Create a fireworks animation
function createFireworks() {
    const fireworksContainer = document.createElement('div');
    fireworksContainer.className = 'fireworks-container';
    appContainerEl.appendChild(fireworksContainer);

    for (let i = 0; i < 50; i++) {
        const firework = document.createElement('div');
        firework.className = 'firework';
        firework.style.left = `${Math.random() * 100}%`;
        firework.style.top = `${Math.random() * 100}%`;
        fireworksContainer.appendChild(firework);
    }
    
    setTimeout(() => {
        fireworksContainer.remove();
    }, 3000); // Remove fireworks after 3 seconds
}

// Initial call to start the game
newGame();