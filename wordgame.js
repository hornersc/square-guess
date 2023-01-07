/**
 * Square Guess created by SC Horner, inspired by A Little Wordy, Wordle, and every other word game
 * github.com/hornersc/
 */


const submitNameButton = document.querySelector("#submitnamebutton");
const name1Input = document.querySelector("#name1input");
const name2Input = document.querySelector("#name2input");
const nameScreen = document.querySelector("#namescreen");
const createWordScreen = document.querySelector("#createwordscreen");
const nameTexts = document.querySelectorAll(".nametext");
const wordInput = document.querySelector("#wordinput");
const wordTest = document.querySelector("#wordtest");
const playScreen = document.querySelector("#playscreen");
const eventLog = document.querySelector("#eventlog");
const p1points = document.querySelector("#p1points");
const p2points = document.querySelector("#p2points");
const winScreen = document.querySelector("#winscreen");
const winText = document.querySelector("#wintext");
const cardsSection = document.querySelector("#cards");
const onePlayerBtn = document.querySelector("#onep");
const twoPlayerBtn = document.querySelector("#twop");
const startScreen = document.querySelector("#startscreen");
const restartBtn = document.querySelector("#restartbutton");

const vowels = ["A", "E", "I", "O", "U"];
const consonants = ["B", "C", "D", "F", "G", "H", "J", "K", "L", "M", "N", "P", "Q", "R", "S", "T", "V", "W", "X", "Y", "Z"];

let currentTurn = 1;
let player1 = {
    name: "Player 1",
    word: "",
    letters:  [],
    points: 0,
    completed: false
};
let player2 = {
    name: "Player 2",
    word: "",
    letters: [],
    points: 0,
    completed: false
};
let guesser = player1;
let opponent = player2;
let singlePlayerMode = false;

createCards();

restartBtn.addEventListener("click", function () {
    window.location.reload();
});

onePlayerBtn.addEventListener("click", function () {
    singlePlayerMode = true;
    player2.name = "Computer";
    player2.completed = true;
    $.ajax({
        url: 'wordgamebank.csv',
        dataType: 'text',
    }).done(selectCompWord);
    
    function selectCompWord(data) {
        words = data.split(/\s+/);
        player2.word = words[Math.floor(Math.random() * words.length)];
        let compvowels = 0;
        let compcons = 0;
        Array.from(player2.word).forEach(letter => {
            if (vowels.includes(letter)) compvowels += 1;
            else if (consonants.includes(letter)) compcons += 1;
            player1.letters.push(letter);
        });
        for (let i=0; i < 4-compvowels; i++) {
            player1.letters.push(vowels[Math.floor(Math.random() * vowels.length)]);
        }
        for (let i=0; i < 8-compcons; i++) {
            player1.letters.push(consonants[Math.floor(Math.random() * consonants.length)]);
        }
        shuffleArray(player1.letters);

    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    document.querySelectorAll(".twoplayer").forEach(element => {
        element.setAttribute("style", "");
        element.classList.add("hidden");
    });
    startScreen.classList.add("hidden");
    nameScreen.classList.remove("hidden");
});

twoPlayerBtn.addEventListener("click", function () {
    selectLetters(player1.letters);
    selectLetters(player2.letters);
    startScreen.classList.add("hidden");
    nameScreen.classList.remove("hidden");
});

// submits name inputs and changes to next screen
submitNameButton.addEventListener("click", function () {
    if (name1Input.value.length > 0 && ((name2Input.value.length > 0 && name1Input.value != name2Input.value) || singlePlayerMode)) {
        player1.name = name1Input.value;
        if (!singlePlayerMode) player2.name = name2Input.value;
        document.querySelector("#name1text").textContent = player1.name;
        document.querySelector("#name2text").textContent = player2.name;
        setNameTexts();
        
        createTestSection(wordInput);
        nameScreen.classList.add("hidden");
        if (singlePlayerMode) {
            playScreen.classList.remove("hidden");
            switchTurn();
        }
        else createWordScreen.classList.remove("hidden");
    }
});

// changes all name instances depending on current turn
function setNameTexts () {
    let currentName = player1.name;
    if (currentTurn == 2) {
        currentName = player2.name;
    }
    nameTexts.forEach(element => {
        element.textContent = currentName;
    });
}

function updatePoints () {
    p1points.textContent = player1.points;
    p2points.textContent = player2.points;
}

// randomly adds 4 vowels and 8 consonants to letter array
function selectLetters (letters) {
    for (let i=0; i < 4; i++) {
        letters.push(vowels[Math.floor(Math.random() * vowels.length)]);
    }
    for (let i=0; i < 8; i++) {
        letters.push(consonants[Math.floor(Math.random() * consonants.length)]);
    }
}

// adds event to the log
function addToLog (text) {
    let newlog = document.createElement("p");
    newlog.textContent = text;
    eventLog.appendChild(newlog);
    if (eventLog.children.length > 4) eventLog.removeChild(eventLog.firstElementChild);
}

function switchTurn () {
    if (currentTurn == 1 && !player2.completed) {
        guesser = player2;
        opponent = player1;
        currentTurn = 2;
    } else if (currentTurn == 2 && !player1.completed) {
        guesser = player1;
        opponent = player2;
        currentTurn = 1;
    }
    wordTest.innerHTML = "";
    setNameTexts();
    createTestSection(wordTest);
}

// take guess action
function guessWord (guessedWord) {
    addToLog(guesser.name + " guessed that " + opponent.name + "'s word is " + guessedWord);
    if (guessedWord == opponent.word) {
        addToLog("The guess is correct!");
        guesser.completed = true;
        if (singlePlayerMode) {
            winText.textContent = guesser.name + " used " + opponent.points + " points to find the word!";
            playScreen.classList.add("hidden");
            winScreen.classList.remove("hidden");
        }
        else {
            if (guesser.points > opponent.points) {
                winText.textContent = guesser.name + " wins!";
                playScreen.classList.add("hidden");
                winScreen.classList.remove("hidden");
            }
            else if (opponent.completed) {
                if (opponent.points == guesser.points) {
                    winText.textContent = "It was a tie!";
                } else {
                    winText.textContent = opponent.name + " wins!";
                }
                playScreen.classList.add("hidden");
                winScreen.classList.remove("hidden");
            }
        }
    }
    else {
        opponent.points += 2;
        updatePoints();
        addToLog("The guess is wrong!");
    }
}

// creates card buttons
function createCards () {
    // last letter
    let lastLetBtn = document.createElement("button");
    lastLetBtn.textContent = "Last Letter (1)";
    lastLetBtn.addEventListener("click", function () {
        addToLog(opponent.name + "'s last letter is " + opponent.word.charAt(opponent.word.length-1));
        opponent.points += 1;
        updatePoints();
        switchTurn();
    });
    cardsSection.appendChild(lastLetBtn);
    // first letter
    let firstLetBtn = document.createElement("button");
    firstLetBtn.textContent = "First Letter (2)";
    firstLetBtn.addEventListener("click", function () {
        addToLog(opponent.name + "'s first letter is " + opponent.word.charAt(0));
        opponent.points += 2;
        updatePoints();
        switchTurn();
    });
    cardsSection.appendChild(firstLetBtn);
    // random letter
    let randomLetBtn = document.createElement("button");
    randomLetBtn.textContent = "Random Letter (1)";
    randomLetBtn.addEventListener("click", function () {
        let guessLetter = guesser.letters[Math.floor(Math.random() * guesser.letters.length)];
        if (Array.from(opponent.word).includes(guessLetter)) {
            addToLog(opponent.name + " has letter " + guessLetter);
        }
        else {
            addToLog(opponent.name + " does not have letter " + guessLetter);
        }
        opponent.points += 1;
        updatePoints();
        switchTurn();
    });
    cardsSection.appendChild(randomLetBtn);
    // relative to 4
    let relLen4Btn = document.createElement("button");
    relLen4Btn.textContent = "Length Relative to 4 (1)";
    relLen4Btn.addEventListener("click", function () {
        let result = "the same size as";
        if (opponent.word.length > 4) result = "longer than";
        if (opponent.word.length < 4) result = "shorter than";
        addToLog(opponent.name + "'s word is " + result + " 4");
        opponent.points += 1;
        updatePoints();
        switchTurn();
    });
    cardsSection.appendChild(relLen4Btn);
    // relative to own
    let relLenOwnBtn = document.createElement("button");
    relLenOwnBtn.textContent = "Length Relative to Own Word (1)";
    relLenOwnBtn.setAttribute("class", "twoplayer");
    relLenOwnBtn.addEventListener("click", function () {
        let result = "the same size as";
        if (opponent.word.length > guesser.word.length) result = "longer than";
        if (opponent.word.length < guesser.word.length) result = "shorter than";
        addToLog(opponent.name + "'s word is " + result + " " + guesser.name + "'s");
        opponent.points += 1;
        updatePoints();
        switchTurn();
    });
    cardsSection.appendChild(relLenOwnBtn);
    // num of vowels
    let vowelNumBtn = document.createElement("button");
    vowelNumBtn.textContent = "Number of Vowels (1)";
    vowelNumBtn.addEventListener("click", function () {
        let count = 0;
        Array.from(opponent.word).forEach(letter => {
            if (vowels.includes(letter)) count += 1;
        });
        addToLog(opponent.name + "'s word has " + count + " vowel(s)");
        opponent.points += 1;
        updatePoints();
        switchTurn();
    });
    cardsSection.appendChild(vowelNumBtn);
    // num of consonants
    let consNumBtn = document.createElement("button");
    consNumBtn.textContent = "Number of Consonants (1)";
    consNumBtn.addEventListener("click", function () {
        let count = 0;
        Array.from(opponent.word).forEach(letter => {
            if (consonants.includes(letter)) count += 1;
        });
        addToLog(opponent.name + "'s word has " + count + " consonant(s)");
        opponent.points += 1;
        updatePoints();
        switchTurn();
    });
    cardsSection.appendChild(consNumBtn);
}

// creates testwordinput section
function createTestSection (element) {
    let currentLetters = player1.letters;
    if (currentTurn == 2) currentLetters = player2.letters;
        let wordDisplay = document.createElement("p");
        let letterstbl = document.createElement("table");
        let rows = [letterstbl.insertRow(0), letterstbl.insertRow(1), letterstbl.insertRow(2), letterstbl.insertRow(3)];
        let currentRow = 0;
        currentLetters.forEach(letter => {
            let cellButton = document.createElement("button");
            cellButton.textContent = letter;
            cellButton.addEventListener("click", function () {
                wordDisplay.textContent = wordDisplay.textContent + this.textContent;
                this.disabled = true;
                enterButton.disabled = false;
            });
            rows[currentRow].insertCell().appendChild(cellButton);
            if (rows[currentRow].cells.length >= 4) currentRow += 1;
        });
        let resetButton = document.createElement("button");
        resetButton.textContent = "reset";
        resetButton.addEventListener("click", function () {
            wordDisplay.textContent = "";
            rows.forEach(row => {
                Array.from(row.cells).forEach(cell => {
                    cell.children[0].disabled = false;
                })
            })
        });
        let enterButton = document.createElement("button");
        enterButton.textContent = "enter";
        enterButton.disabled = true;
        enterButton.addEventListener("click", function () {
            if (playScreen.classList.contains("hidden")) {
                if (currentTurn == 1) {
                    player1.word = wordDisplay.textContent;
                    element.innerHTML = "";
                    currentTurn = 2;
                    createTestSection(element);
                    currentTurn = 1;
                }
                else {
                    let templetters = player1.letters;
                    player1.letters = player2.letters;
                    player2.letters = templetters;

                    player2.word = wordDisplay.textContent;
                    element.innerHTML = "";
                    createWordScreen.classList.add("hidden");
                    playScreen.classList.remove("hidden");
                }
            } else {
                guessWord(wordDisplay.textContent, guesser, opponent);
            }
            switchTurn();
        })
        element.appendChild(wordDisplay);
        element.appendChild(letterstbl);
        element.appendChild(resetButton);
        element.appendChild(enterButton);
}