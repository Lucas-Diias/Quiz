document.addEventListener("DOMContentLoaded", () => {
  let currentQuestionIndex = 0;
  let score = 0;
  let timerInterval;
  const userAnswers = [];

  const questionNumberElement = document.getElementById("question-number");
  const questionTextElement = document.getElementById("question-text");
  const optionsContainer = document.querySelector(".options");
  const nextButton = document.getElementById("next-button");
  const timerElement = document.getElementById("timer");
  const scoreElement = document.getElementById("score");
  const progressBar = document.getElementById("progress-bar");
  const scoreboardContainer = document.getElementById("scoreboard-container");
  const scoreboardBody = document.querySelector("#scoreboard tbody");
  const restartButton = document.getElementById("restart-button");
  const startbutton = document.getElementById("start-button");
  let jsonData = null;  //criar variavel para ter a data (perguntas) do ficheiro json

  startbutton.addEventListener("click", async function init() {
    jsonData = await readJsonFile("questions.json");
    if (!jsonData) {
      console.error("Nenhum dado JSON encontrado.");
      return;
    } else {
      initializeQuiz();
    }
  })

  // Function to save progress to localStorage
  function saveProgress() {
    localStorage.setItem(
      "quizProgress",
      JSON.stringify({
        currentQuestionIndex,
        score,
        userAnswers
      })
    );
  }

  // Function to retrieve progress from localStorage


  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function initializeQuiz() {
    const cont_inicial = document.getElementById("quiz-iniciar-container");
    cont_inicial.style.display = "none";

    const cont = document.getElementById("quiz-container");
    cont.style.display = "block";

    shuffleArray(jsonData);

    loadQuestion();
  }

  function loadQuestion() {
    const currentQuestion = jsonData[currentQuestionIndex];
    questionNumberElement.textContent = `${currentQuestionIndex + 1}/${jsonData.length
      }`;
    questionTextElement.textContent = currentQuestion.pergunta;

    optionsContainer.innerHTML = "";
    const shuffledOptions = shuffleArray([...currentQuestion.opcoes]);
    shuffledOptions.forEach((option) => {
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = "radio";
      input.name = "answer";
      input.value = option;

      const span = document.createElement("span");
      span.textContent = option;

      label.appendChild(input);
      label.appendChild(span);
      optionsContainer.appendChild(label);
    });

    updateProgressBar();
    resetTimer();
  }

  function updateProgressBar() {
    const progress = (currentQuestionIndex / jsonData.length) * 100;
    progressBar.style.width = `${progress}%`;
  }

  function resetTimer() {
    clearInterval(timerInterval);
    let timeLeft = 15;
    timerElement.textContent = timeLeft;

    timerInterval = setInterval(() => {
      timeLeft--;
      timerElement.textContent = timeLeft;

      // Color change when timer is running low
      if (timeLeft <= 5) {
        timerElement.style.color = "#e74c3c"; // Change to red
      }

      // Add additional visual cues as needed (e.g., animations, background color changes)

      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        handleNextButtonClick(); // Automatically move to next question or end quiz
      }
    }, 1000);
  }

  function handleNextButtonClick() {
    const selectedOption = document.querySelector(
      'input[name="answer"]:checked'
    );
    if (selectedOption) {
      userAnswers.push({
        question: jsonData[currentQuestionIndex].question,
        yourAnswer: selectedOption.value,
        correctAnswer: jsonData[currentQuestionIndex].correct
      });

      if (selectedOption.value === jsonData[currentQuestionIndex].correct) {
        score++;
        scoreElement.textContent = `Score: ${score}`;
      }
    } else {
      userAnswers.push({
        question: jsonData[currentQuestionIndex].question,
        yourAnswer: "No answer selected",
        correctAnswer: jsonData[currentQuestionIndex].correct
      });
    }

    currentQuestionIndex++;
    if (currentQuestionIndex < jsonData.length) {
      saveProgress(); // Save progress before loading next question
      loadQuestion();
    } else {
      saveProgress(); // Save progress before displaying results
      displayResults();
    }

    document
      .querySelectorAll('input[name="answer"]')
      .forEach((input) => (input.checked = false));
  }

  function displayResults() {
    clearInterval(timerInterval);
    questionNumberElement.textContent = "Quiz completo";
    questionTextElement.textContent = `O teu score foi ${score}/${jsonData.length}`;

    optionsContainer.innerHTML = "";
    nextButton.style.display = "none";
    scoreboardContainer.style.display = "block";
    localStorage.removeItem("quizProgress"); // Clear saved progress after displaying results
  }



  function restartQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    userAnswers.length = 0;
    scoreElement.textContent = `Score: ${score}`;
    nextButton.textContent = "Continuar";
    nextButton.style.display = "block";
    scoreboardContainer.style.display = "none";
    nextButton.removeEventListener("click", restartQuiz);
    nextButton.addEventListener("click", handleNextButtonClick);
    localStorage.removeItem("quizProgress"); // Clear saved progress on restart
    initializeQuiz();
  }

  nextButton.addEventListener("click", handleNextButtonClick);
  restartButton.addEventListener("click", restartQuiz);

  // Check localStorage for saved progress when DOM is loaded

});

async function readJsonFile(nameofJsonFile) {
  try {
    const response = await fetch(nameofJsonFile);

    if (!response.ok) {
      throw new Error('Network response was not ok.' + response.statusText);
    }
    return await response.json();
  } catch (error) {
    console.error('there was a problem with the fetch operation;', error);
  }
}
