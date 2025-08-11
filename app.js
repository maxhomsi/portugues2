import { wordList } from './wordlist.js';
import { initialData } from './data.js';

const App = () => {
    // React State Hooks
    const [score, setScore] = React.useState(initialData.score);
    const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(initialData.currentQuestionIndex);
    const [currentWords, setCurrentWords] = React.useState(initialData.currentWords);
    const [userInput, setUserInput] = React.useState(initialData.userInput);
    const [feedback, setFeedback] = React.useState(initialData.feedback);
    const [isRoundOver, setIsRoundOver] = React.useState(initialData.isRoundOver);
    const [fireworksActive, setFireworksActive] = React.useState(initialData.fireworksActive);

    // Function to shuffle an array and return a new shuffled array
    const shuffleArray = (array) => {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    };

    // Function to start a new round of the game
    const startNewRound = () => {
        const uniqueWords = shuffleArray(wordList).slice(0, 10);
        setCurrentWords(uniqueWords);
        setScore(0);
        setCurrentQuestionIndex(0);
        setUserInput('');
        setFeedback(null);
        setIsRoundOver(false);
        setFireworksActive(false);
    };

    // useEffect to start the first round when the component mounts
    React.useEffect(() => {
        startNewRound();
    }, []);

    // Function to handle the form submission
    const handleSubmit = (event) => {
        event.preventDefault();
        if (!userInput.trim()) return; // Prevent submission of empty answers

        const correctAnswer = currentWords[currentQuestionIndex];
        const isCorrect = userInput.trim().toLowerCase() === correctAnswer.toLowerCase();
        const nextScore = isCorrect ? score + 1 : score;

        if (isCorrect) {
            setScore(prevScore => prevScore + 1);
            setFeedback('correct');
        } else {
            setFeedback('incorrect');
        }

        // Show feedback for a moment, then move to the next question or end the round
            if (currentQuestionIndex < 9) {
                setCurrentQuestionIndex(prevIndex => prevIndex + 1);
                setUserInput('');
                setFeedback(null);
            } else {
                setIsRoundOver(true);
                // Trigger fireworks if the final score is 10
                if ((isCorrect ? score + 1 : score) === 10) {
                    setFireworksActive(true);
                }
            }
        if (score >= 5 && score < 10) return "Muito bem, quase 100%!";
        if (score === 10) return "PARABENS!!!!!!";
        return "";
    };

    // If there are no words loaded yet, show a loading message
    if (currentWords.length === 0) {
        return React.createElement('div', { className: 'app-container' }, 'Carregando...');
    }

    return React.createElement(
        'div',
        { className: 'app-container' },
        
        // Conditional Fireworks Display
        fireworksActive && React.createElement(
            'div', {className: 'fireworks-container'},
            React.createElement('div', {className: 'firework'}),
            React.createElement('div', {className: 'firework'}),
            React.createElement('div', {className: 'firework'}),
            React.createElement('div', {className: 'firework'}),
            React.createElement('div', {className: 'firework'}),
            React.createElement('div', {className: 'firework'}),
        ),
        
        // Render End of Round Screen
        isRoundOver
            ? React.createElement(
                'div', { className: 'results-container' },
                React.createElement('h2', { className: 'final-message' }, getFinalMessage()),
                React.createElement('p', { style: { fontSize: '1.5em' } }, `Sua pontuação final: ${score} de 10`),
                React.createElement('button', { className: 'button', onClick: startNewRound }, 'Jogue Novamente')
            )
            // Render Game Screen
            : React.createElement(
                React.Fragment,
                null,
                React.createElement(
                    'div', { className: 'header' },
                    React.createElement('div', { className: 'score' }, `Pontos: ${score}`),
                    React.createElement('div', { className: 'question-counter' }, `Questão ${currentQuestionIndex + 1} de 10`)
                ),
                React.createElement('div', { className: 'cursive-word' }, currentWords[currentQuestionIndex]),
                React.createElement(
                    'form', { className: 'answer-form', onSubmit: handleSubmit },
                    React.createElement('input', {
                        type: 'text',
                        className: 'answer-input',
                        placeholder: 'Digite a palavra aqui...',
                        value: userInput,
                        onChange: (e) => setUserInput(e.target.value),
                        autoFocus: true,
                        disabled: feedback !== null // Disable input while feedback is shown
                    }),
                    feedback && React.createElement(
                        'span', 
                        { className: `feedback-icon ${feedback}` },
                        feedback === 'correct' ? '✓' : '✗'
                    )
                )
            )
    );
};

ReactDOM.render(React.createElement(App), document.getElementById('root'));