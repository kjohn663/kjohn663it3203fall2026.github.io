//TIMER JAVASCRIPT

//set timer 600 seconds = 10 minutes
var count = 600;
var timer;

//stop timer
function stopTimer(){
		clearInterval(timer);
}

//timer function counting down
function startTimer(){
	timer = setInterval(function() {
    document.getElementById('count').innerHTML = count;
    count--;

    //what to do when time runs out
    if (count === 0) {
        clearInterval(timer);
        document.getElementById('count').innerHTML = '---';
        // popup message
        alert("You have elapsed the full 10 minute time. Click reset button to start the quiz over.");
    }
}, 1000);
}	

//QUIZ JAVASCRIPT

//object constructor
var Quiz = function(quizDiv, answers) {

	//variables/attributes
	this.Classes = Object({
		QUESTION: "question", 
		QUESTION_TITLE: "question_title",
		QUESTION_ANSWERS: "question_answers",
		RIGHT: "right",
		WRONG: "wrong",
	});

	//js/html communication for quiz container
	this.container = document.getElementById(quizDiv);
	//array of quetions
	this.questions = [];
	//result object
	this.result = new QuizResult();
	//answers
	this.answers = answers;

	//
	for (var i=0; i < this.container.children.length; i++) {
		if (this.container.children[i].classList.contains(Quiz.Classes.QUESTION)) {
			this.questions.push(this.container.children[i]);
		}
	}
};

//establish instance of quiz object
//plus variables/attributes
Quiz.Classes = Object({
    QUESTION: "question",
    QUESTION_TITLE: "question_title",
    QUESTION_ANSWERS: "question_answers",
    RIGHT: "right",
    WRONG: "wrong",
});

//check answers function
Quiz.prototype.checkAnswers = function() {
	//results array
	var questionResults = [];
	//every question, match corresponding answer & user input 
	for (var i=0; i < this.questions.length; i++) {
		var question = this.questions[i];
		var answer = this.answers[i];
		var userAnswer = [];
		var answerInputs = question.getElementsByClassName(Quiz.Classes.QUESTION_ANSWERS)[0].getElementsByTagName('input');
		var input;
		//recording specific user input
		for (var j=0; j < answerInputs.length; j++) {
			input = answerInputs[j];
			if (input.type === "checkbox" || input.type === "radio") {
				 if (input.checked) userAnswer.push(input.value);
			} else if (input.value !== '') {
				userAnswer.push(input.value);
			}
		}
		
		//simplifies singular answers 
		if (userAnswer.length == 1 && !Array.isArray(answer)) {
			userAnswer = userAnswer[0];
		} 
		
		//call answer comparison for grading
		questionResults.push(Utils.compare(userAnswer, answer));
	}

	//results at top
	this.result.setResults(questionResults);
	return true;
};

//show correct answers & colour based on right or wrong
//prototype allows for adding additional functions
Quiz.prototype.colourResults = function(recall) {
	var question;
	//for every question, apply right or wrong class
	for (var i=0; i < this.questions.length; i++) {
		question = this.questions[i];
		if (this.result.results[i]) {
			question.getElementsByClassName(Quiz.Classes.QUESTION_TITLE)[0].classList.add(Quiz.Classes.RIGHT);
		}
		else {
			question.getElementsByClassName(Quiz.Classes.QUESTION_TITLE)[0].classList.add(Quiz.Classes.WRONG);
		}
		//writing back after attaching colour class
		recall(this, question, i, this.result.results[i]);
	}
};

//quiz result constructor + variables/attributes
var QuizResult = function() {
	this.results = [];
	this.totalQs = 0;
	this.score = 0;

};

//getting results & adding to score
QuizResult.prototype.setResults = function(questionResults) {
	this.results = questionResults;
	this.totalQs = this.results.length;
	this.score = 0;
	//totaling up results
	for (var i=0; i < this.results.length; i++) {
		if (this.results[i]) this.score++;
	}

};

//imported comparison function
var Utils = function() {};
Utils.compare = function(obj1, obj2) {
	if (obj1.length != obj2.length) return false;

	if (Array.isArray(obj1) && Array.isArray(obj2)) {
		for (var i=0; i < obj1.length; i++) {
			if (obj1[i] !== obj2[i]) return false;
		}
		return true;
	}
	return obj1 === obj2;
};

//quiz object
var quiz;

//display results
function showResults() {
	if (quiz.checkAnswers()) {
		//passing result info
		var quizResultElement = document.getElementById('result');
		//changeing display to make grade appear
		quizResultElement.style.display = 'block';
		//pass score as string
		document.getElementById('score').innerHTML = quiz.result.score.toString();
		//pass if more than ---
		if (quiz.result.score > 2) {
			document.getElementById('pass').innerHTML ="Pass";
		} else {
			document.getElementById('pass').innerHTML ="Fail";
		}
	//calling colour function based on handle answers argument
	quiz.colourResults(handleAnswers);
	}
	stopTimer();
	var elapsed = 600 - count;
	document.getElementById('elapsed').innerHTML = elapsed.toString();
}

//show correct answers next to wrong ones
function handleAnswers(quiz, question, num, correct) {
    if (!correct) {
        var answers = question.getElementsByTagName('input');
        for (var i = 0; i < answers.length; i++) {
			//show correct answers for selections
            if (answers[i].type === "checkbox" || answers[i].type === "radio"){ 
                if (quiz.answers[num].indexOf(answers[i].value) > -1) {
                    answers[i].parentNode.classList.add(Quiz.Classes.RIGHT);
                }
            } else {
				//show correct answers for write-ins
                var correctAnswer = document.createElement('span');
				correctAnswer.id = 'inputCorrection';
                correctAnswer.classList.add(Quiz.Classes.RIGHT);
                correctAnswer.innerHTML = quiz.answers[num];
                correctAnswer.style.marginLeft = '10px';
                answers[i].parentNode.insertBefore(correctAnswer, answers[i].nextSibling);
            }
        }
    }
}

//reset quiz
function resetQuiz() {
  //change results to hide again
  var quizResultElement = document.getElementById('result');
  quizResultElement.style.display = 'none';
  
  //remove all colours and answers
  for (var i=0; i < quiz.questions.length; i++) {
		var question = quiz.questions[i];
		var answers = question.getElementsByTagName('input');
		question.getElementsByClassName(Quiz.Classes.QUESTION_TITLE)[0].classList.remove(Quiz.Classes.RIGHT);
		question.getElementsByClassName(Quiz.Classes.QUESTION_TITLE)[0].classList.remove(Quiz.Classes.WRONG);
		for (var j = 0; j < answers.length; j++) {
			if (answers[i].type === "checkbox" || answers[i].type === "radio"){
				answers[j].parentNode.classList.remove(Quiz.Classes.RIGHT);
				answers[j].parentNode.classList.remove(Quiz.Classes.WRONG);
			} else {
				 var correctAnswer = document.getElementById('inputCorrection');
				 if (correctAnswer) {
					 correctAnswer.remove();
				 }
			}
        }
		
  }
  
  //reset timer
  count = 600;
  startTimer();
}

//ON LOAD
window.onload = function() {
	//start timer
	startTimer();
	//answer bank
    quiz = new Quiz('quiz', [
        '42',
        'b',
        ['b', 'c', 'd']
    ]);
};
