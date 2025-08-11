let currentWord = "";
let score = 0;
let questionNumber = 0;
let roundWords = [];

const scoreboard = document.getElementById("scoreboard");
const questionCounter = document.getElementById("question-counter");
const wordDisplay = document.getElementById("word-display");
const answerInput = document.getElementById("answer-input");
const submitBtn = document.getElementById("submit-btn");
const feedback = document.getElementById("feedback");
const finalMessage = document.getElementById("final-message");
const playAgainBtn = document.getElementById("play-again");
const fireworksCanvas = document.getElementById("fireworks");
const ctx = fireworksCanvas.getContext("2d");

fireworksCanvas.width = window.innerWidth;
fireworksCanvas.height = window.innerHeight;

function startGame() {
  score = 0;
  questionNumber = 0;
  finalMessage.classList.add("hidden");
  playAgainBtn.classList.add("hidden");
  fireworksCanvas.classList.add("hidden");
  feedback.textContent = "";
  answerInput.value = "";

  roundWords = shuffleArray([...wordList]).slice(0, 10);
  nextQuestion();
}

function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

function removeAccents(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function nextQuestion() {
  if (questionNumber >= 10) {
    endGame();
    return;
  }

  currentWord = roundWords[questionNumber];
  questionCounter.textContent = `Pergunta ${questionNumber + 1} de 10`;
  scoreboard.textContent = `Placar: ${score}/10`;
  wordDisplay.textContent = currentWord;
  answerInput.value = "";
  answerInput.focus();
}

function checkAnswer() {
  const userAnswer = removeAccents(answerInput.value.trim().toLowerCase());
  const correctAnswer = removeAccents(currentWord.toLowerCase());

  if (userAnswer === correctAnswer) {
    score++;
    feedback.textContent = "✅ Correto!";
    feedback.style.color = "green";
  } else {
    feedback.textContent = `❌ Errado! Correto: ${currentWord}`;
    feedback.style.color = "red";
  }

  questionNumber++;
  setTimeout(nextQuestion, 1500);
}

function endGame() {
  scoreboard.textContent = `Placar: ${score}/10`;
  feedback.textContent = "";

  if (score < 5) {
    finalMessage.textContent = "Vamos tentar novamente?";
  } else if (score < 10) {
    finalMessage.textContent = "Muito bem, quase 100%!";
  } else {
    finalMessage.textContent = "PARABÉNS!!!!!!";
    startFireworks();
  }

  finalMessage.classList.remove("hidden");
  playAgainBtn.classList.remove("hidden");
}

function startFireworks() {
  fireworksCanvas.classList.remove("hidden");
  let particles = [];

  function createParticle(x, y, color) {
    return {
      x,
      y,
      color,
      radius: Math.random() * 4 + 1,
      speedX: Math.random() * 5 - 2.5,
      speedY: Math.random() * 5 - 2.5,
      life: 100
    };
  }

  function loop() {
    ctx.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);
    if (Math.random() < 0.05) {
      const x = Math.random() * fireworksCanvas.width;
      const y = Math.random() * fireworksCanvas.height / 2;
      const color = `hsl(${Math.random() * 360}, 100%, 50%)`;
      for (let i = 0; i < 50; i++) {
        particles.push(createParticle(x, y, color));
      }
    }

    particles.forEach((p, i) => {
      p.x += p.speedX;
      p.y += p.speedY;
      p.life--;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      if (p.life <= 0) particles.splice(i, 1);
    });

    requestAnimationFrame(loop);
  }

  loop();
}

submitBtn.addEventListener("click", checkAnswer);
answerInput.addEventListener("keydown", e => {
  if (e.key === "Enter") checkAnswer();
});
playAgainBtn.addEventListener("click", startGame);

startGame();
