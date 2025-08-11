import { wordList } from './wordList.js';
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

    // Function to shuffle an array
    const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);

    // Function to start a new round
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

    // Start the first round on component mount
    React.useEffect(() => {
        startNewRound();
    }, []);
    
    // Handle the answer submission
    const handleSubmit = (event) => {
        event.preventDefault();
        if (!userInput.trim()) return;

        const correctAnswer = currentWords[currentQuestionIndex];
        const isCorrect = userInput.trim().toLowerCase() === correctAnswer.toLowerCase();
        
        // Update score and set feedback immediately
        if (isCorrect) {
            setScore(prevScore => prevScore + 1);
            setFeedback('correct');
        } else {
            setFeedback('incorrect');
        }
        
        // Check if the game should end *after* this question
        const isLastQuestion = currentQuestionIndex >= 9;

        // Set fireworks if final score will be 10
        if(isLastQuestion && isCorrect && score + 1 === 10) {
            setFireworksActive(true);
        }

        // Delay moving to the next question or ending the round
        setTimeout(() => {
            if (isLastQuestion) {
                setIsRoundOver(true);
            } else {
                setCurrentQuestionIndex(prevIndex => prevIndex + 1);
                setUserInput('');
                setFeedback(null);
            }
        }, 800);
    };

    // Determine the final message
    const getFinalMessage = () => {
        if (score === 10) return "PARABENS!!!!!!";
        if (score >= 5) return "Muito bem, quase 100%!";
        return "Vamos tentar novamente?";
    };
    
    // Display a loading screen until words are ready
    if (currentWords.length === 0) {
        return <div className="app-container">Carregando...</div>;
    }

    return (
        <div className="app-container">
            {fireworksActive && (
                <div className="fireworks-container">
                    <div className="firework"></div>
                    <div className="firework"></div>
                    <div className="firework"></div>
                    <div className="firework"></div>
                    <div className="firework"></div>
                    <div className="firework"></div>
                </div>
            )}
            
            {isRoundOver ? (
                <div className="results-container">
                    <h2 className="final-message">{getFinalMessage()}</h2>
                    <p style={{ fontSize: '1.5em' }}>Sua pontuação final: {score} de 10</p>
                    <button className="button" onClick={startNewRound}>
                        Jogue Novamente
                    </button>
                </div>
            ) : (
                <>
                    <div className="header">
                        <div className="score">Pontos: {score}</div>
                        <div className="question-counter">Questão {currentQuestionIndex + 1} de 10</div>
                    </div>
                    <div className="cursive-word">{currentWords[currentQuestionIndex]}</div>
                    <form className="answer-form" onSubmit={handleSubmit}>
                        <input
                            type="text"
                            className="answer-input"
                            placeholder="Digite a palavra aqui..."
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            autoFocus
                            disabled={feedback !== null}
                        />
                        {feedback && (
                            <span className={`feedback-icon ${feedback}`}>
                                {feedback === 'correct' ? '✓' : '✗'}
                            </span>
                        )}
                    </form>
                </>
            )}
        </div>
    );
};

ReactDOM.render(<App />, document.getElementById('root'));