import { useState, useRef, useEffect } from "react";
import "../Wordle.css";
import Row from "./Row";
import Keyboard from "./Keyboard";
import { LETTERS, potentialWords } from "../Data/lettersAndWords";

const getRandomSolution = () =>
  potentialWords[Math.floor(Math.random() * potentialWords.length)];

export default function Wordle() {
  const [guesses, setGuesses] = useState([
    "     ",
    "     ",
    "     ",
    "     ",
    "     ",
    "     ",
  ]);
  const [solution, setSolution] = useState(getRandomSolution());
  const [solutionFound, setSolutionFound] = useState(false);
  const [activeLetterIndex, setActiveLetterIndex] = useState(0);
  const [notification, setNotification] = useState("");
  const [activeRowIndex, setActiveRowIndex] = useState(0);
  const [failedGuesses, setFailedGuesses] = useState([]);
  const [correctLetters, setCorrectLetters] = useState([]);
  const [presentLetters, setPresentLetters] = useState([]);
  const [absentLetters, setAbsentLetters] = useState([]);
  const [score, setScore] = useState(0);

  const wordleRef = useRef();

  useEffect(() => {
    wordleRef.current.focus();
  }, []);

  const resetGame = () => {
    setGuesses(["     ", "     ", "     ", "     ", "     ", "     "]);
    setSolution(getRandomSolution()); // Generate a new random solution
    setSolutionFound(false);
    setActiveLetterIndex(0);
    setNotification("");
    setActiveRowIndex(0);
    setFailedGuesses([]);
    setCorrectLetters([]);
    setPresentLetters([]);
    setAbsentLetters([]);
    setScore(0); // Reset the score if required
  };

  const typeLetter = (letter) => {
    if (activeLetterIndex < 5) {
      setNotification("");

      let newGuesses = [...guesses];
      newGuesses[activeRowIndex] = replaceCharacter(
        newGuesses[activeRowIndex],
        activeLetterIndex,
        letter
      );

      setGuesses(newGuesses);
      setActiveLetterIndex((index) => index + 1);
    }
  };

  const replaceCharacter = (string, index, replacement) => {
    return (
      string.slice(0, index) +
      replacement +
      string.slice(index + replacement.length)
    );
  };

  const hitEnter = () => {
    if (activeLetterIndex === 5) {
      const currentGuess = guesses[activeRowIndex];

      if (!potentialWords.includes(currentGuess)) {
        setNotification("NOT IN THE WORD LIST");
      } else if (failedGuesses.includes(currentGuess)) {
        setNotification("WORD TRIED ALREADY");
      } else if (currentGuess === solution) {
        setSolutionFound(true);
        setNotification("WELL DONE");
        setCorrectLetters([...solution]);
        setScore((prevScore) => prevScore + 100); // Award points for correct guess
      } else {
        let correctLetters = [];

        [...currentGuess].forEach((letter, index) => {
          if (solution[index] === letter) correctLetters.push(letter);
        });

        setCorrectLetters([...new Set(correctLetters)]);

        setPresentLetters([
          ...new Set([
            ...presentLetters,
            ...[...currentGuess].filter((letter) => solution.includes(letter)),
          ]),
        ]);

        setAbsentLetters([
          ...new Set([
            ...absentLetters,
            ...[...currentGuess].filter((letter) => !solution.includes(letter)),
          ]),
        ]);

        setFailedGuesses([...failedGuesses, currentGuess]);
        setActiveRowIndex((index) => index + 1);
        setActiveLetterIndex(0);
        setScore((prevScore) => prevScore - 10); // Deduct points for wrong guess
      }
    } else {
      setNotification("FIVE LETTER WORDS ONLY");
    }
  };

  const hitBackspace = () => {
    setNotification("");

    if (guesses[activeRowIndex][0] !== " ") {
      const newGuesses = [...guesses];

      newGuesses[activeRowIndex] = replaceCharacter(
        newGuesses[activeRowIndex],
        activeLetterIndex - 1,
        " "
      );

      setGuesses(newGuesses);
      setActiveLetterIndex((index) => index - 1);
    }
  };

  const handleKeyDown = (event) => {
    if (solutionFound) return;

    if (LETTERS.includes(event.key)) {
      typeLetter(event.key);
      return;
    }

    if (event.key === "Enter") {
      hitEnter();
      return;
    }

    if (event.key === "Backspace") {
      hitBackspace();
    }
  };

  return (
    <div
      className="wordle"
      key={solution} // Force re-render on solution change
      ref={wordleRef}
      tabIndex="0"
      onBlur={(e) => {
        e.target.focus();
      }}
      onKeyDown={handleKeyDown}
    >
      <h1 className="title">Wordle Game</h1>
      <div className="score">Score: {score}</div>
      <button className="new-game-button" onClick={resetGame}>
        New Game
      </button>
      <div className={`notification ${solutionFound && "notification--green"}`}>
        {notification}
      </div>
      {guesses.map((guess, index) => {
        return (
          <Row
            key={index}
            word={guess}
            applyRotation={
              activeRowIndex > index ||
              (solutionFound && activeRowIndex === index)
            }
            solution={solution}
            bounceOnError={
              notification !== "WELL DONE" &&
              notification !== "" &&
              activeRowIndex === index
            }
          />
        );
      })}
      <Keyboard
        presentLetters={presentLetters}
        correctLetters={correctLetters}
        absentLetters={absentLetters}
        typeLetter={typeLetter}
        hitEnter={hitEnter}
        hitBackspace={hitBackspace}
      />
      
    </div>
  );
}
