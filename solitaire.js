/* =========================================================
   SOLITAIRE 🃏
   Classic Klondike
   Mobile: TAP → TAP
   Desktop: DRAG → DROP
========================================================= */


/* =========================================================
   DOM
========================================================= */

const stockElement = document.getElementById("stock");
const wasteElement = document.getElementById("waste");
const tableauElement = document.getElementById("tableau");

const foundationElements = {
    hearts: document.getElementById("foundation-hearts"),
    diamonds: document.getElementById("foundation-diamonds"),
    clubs: document.getElementById("foundation-clubs"),
    spades: document.getElementById("foundation-spades")
};

const movesDisplay = document.getElementById("moves");
const timerDisplay = document.getElementById("timer");
const restartButton = document.getElementById("restartButton");
const gameMessage = document.getElementById("gameMessage");
const musicButton = document.getElementById("musicButton");
const winOverlay = document.getElementById("winOverlay");
const winRestartButton = document.getElementById("winRestartButton");


/* =========================================================
   CARD IMAGE SOURCE
========================================================= */

const CARD_BASE_URL =
    "https://webisso.github.io/playing-cards/png";


/*
   YOUR CUSTOM CARD BACK

   Replace this URL whenever you want.
*/

const CARD_BACK_IMAGE =
    "https://raw.githubusercontent.com/ruzrun/Monthniversary/main/photo1.png";


/* =========================================================
   CARD DATA
========================================================= */

const suits = [
    "hearts",
    "diamonds",
    "clubs",
    "spades"
];

const ranks = [
    "ace",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "jack",
    "queen",
    "king"
];

const rankValues = {

    ace: 1,

    "2": 2,
    "3": 3,
    "4": 4,
    "5": 5,
    "6": 6,
    "7": 7,
    "8": 8,
    "9": 9,
    "10": 10,

    jack: 11,
    queen: 12,
    king: 13

};

const redSuits = new Set([
    "hearts",
    "diamonds"
]);


/* =========================================================
   GAME STATE
========================================================= */

let deck = [];
let stock = [];
let waste = [];

let foundations = {
    hearts: [],
    diamonds: [],
    clubs: [],
    spades: []
};

let tableau = [
    [],
    [],
    [],
    [],
    [],
    [],
    []
];

let moves = 0;
let elapsedTime = 0;

let timerInterval = null;

let gameStarted = false;
let gameWon = false;
let gameOver = false;


/* =========================================================
   TAP SELECTION
========================================================= */

let selectedCards = null;
let selectedSource = null;


/* =========================================================
   DESKTOP DRAG STATE
========================================================= */

let draggedCards = null;
let draggedSource = null;


/* =========================================================
   MUSIC
========================================================= */

const backgroundMusic =
    new Audio("music.mp3");

backgroundMusic.loop = true;
backgroundMusic.volume = 0.35;

let musicEnabled = true;


/* =========================================================
   SHUFFLE
========================================================= */

function shuffle(array) {

    for (
        let i = array.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() * (i + 1)
            );

        [
            array[i],
            array[j]
        ] = [
            array[j],
            array[i]
        ];

    }

    return array;

}


/* =========================================================
   CREATE CARD
========================================================= */

function createCard(suit, rank) {

    return {

        id:
            `${rank}-${suit}`,

        suit:
            suit,

        rank:
            rank,

        value:
            rankValues[rank],

        faceUp:
            false

    };

}


/* =========================================================
   CARD IMAGE
========================================================= */

function getCardImage(card) {

    return (
        `${CARD_BASE_URL}/` +
        `${card.rank}_of_${card.suit}.png`
    );

}


/* =========================================================
   CREATE DECK
========================================================= */

function createDeck() {

    deck = [];

    suits.forEach(
        suit => {

            ranks.forEach(
                rank => {

                    deck.push(
                        createCard(
                            suit,
                            rank
                        )
                    );

                }
            );

        }
    );

    shuffle(deck);

}


/* =========================================================
   DEAL
========================================================= */

function dealCards() {

    tableau = [
        [],
        [],
        [],
        [],
        [],
        [],
        []
    ];


    for (
        let column = 0;
        column < 7;
        column++
    ) {

        for (
            let i = 0;
            i <= column;
            i++
        ) {

            const card =
                deck.pop();

            card.faceUp =
                i === column;

            tableau[column].push(
                card
            );

        }

    }


    stock =
        deck.splice(0);


    stock.forEach(
        card => {

            card.faceUp = false;

        }
    );

}


/* =========================================================
   NEW GAME
========================================================= */

function newGame() {

    stopTimer();

    deck = [];
    stock = [];
    waste = [];


    foundations = {
        hearts: [],
        diamonds: [],
        clubs: [],
        spades: []
    };


    tableau = [
        [],
        [],
        [],
        [],
        [],
        [],
        []
    ];


    moves = 0;
    elapsedTime = 0;

    gameStarted = false;
    gameWon = false;
    gameOver = false;


    clearSelection();

    createDeck();
    dealCards();


    updateMoves();
    updateTimer();


    hideWinOverlay();


    updateMessage(
        "Tap a card, then tap where you want to move it 🃏"
    );


    if (restartButton) {

        restartButton.textContent =
            "🙂";

    }


    render();

}


/* =========================================================
   START GAME
========================================================= */

function ensureGameStarted() {

    if (gameStarted) {
        return;
    }


    gameStarted = true;

    startTimer();
    startMusic();

}


/* =========================================================
   TIMER
========================================================= */

function startTimer() {

    stopTimer();


    timerInterval =
        setInterval(
            () => {

                if (
                    elapsedTime >= 999
                ) {

                    elapsedTime = 999;

                    updateTimer();

                    return;

                }


                elapsedTime++;

                updateTimer();

            },
            1000
        );

}


function stopTimer() {

    if (timerInterval) {

        clearInterval(
            timerInterval
        );

        timerInterval = null;

    }

}


function updateTimer() {

    if (!timerDisplay) {
        return;
    }


    timerDisplay.textContent =
        String(
            elapsedTime
        ).padStart(
            3,
            "0"
        );

}


/* =========================================================
   MOVES
========================================================= */

function addMove() {

    moves++;

    updateMoves();

}


function updateMoves() {

    if (!movesDisplay) {
        return;
    }


    movesDisplay.textContent =
        moves;

}


/* =========================================================
   MESSAGE
========================================================= */

function updateMessage(message) {

    if (!gameMessage) {
        return;
    }


    gameMessage.textContent =
        message;

}


/* =========================================================
   RENDER
========================================================= */

function render() {

    renderStock();
    renderWaste();
    renderFoundations();
    renderTableau();

}


/* =========================================================
   CREATE CARD ELEMENT
========================================================= */

function createCardElement(card) {

    const image =
        document.createElement("img");


    image.className =
        "card";


    image.draggable =
        false;


    if (card.faceUp) {

        image.src =
            getCardImage(card);

        image.alt =
            `${card.rank} of ${card.suit}`;

        image.draggable =
            true;

    } else {

        image.src =
            CARD_BACK_IMAGE;

        image.alt =
            "Face-down card";

        image.classList.add(
            "face-down"
        );

    }


    image.addEventListener(
        "dragstart",
        event => {

            event.stopPropagation();

        }
    );


    return image;

}


/* =========================================================
   STOCK
========================================================= */

function renderStock() {

    if (!stockElement) {
        return;
    }


    stockElement.innerHTML = "";

    stockElement.classList.remove(
        "empty"
    );


    if (
        stock.length > 0
    ) {

        const back =
            document.createElement("img");


        back.className =
            "card stock-card";


        back.src =
            CARD_BACK_IMAGE;


        back.alt =
            "Stock";


        stockElement.appendChild(
            back
        );

    } else {

        stockElement.classList.add(
            "empty"
        );


        if (
            waste.length > 0
        ) {

            stockElement.textContent =
                "↻";

        }

    }


    stockElement.onclick =
        event => {

            event.stopPropagation();

            drawFromStock();

        };

}


/* =========================================================
   DRAW STOCK
========================================================= */

function drawFromStock() {

    if (
        gameWon ||
        gameOver
    ) {

        return;

    }


    ensureGameStarted();

    clearSelection();


    if (
        stock.length > 0
    ) {

        const card =
            stock.pop();


        card.faceUp = true;


        waste.push(
            card
        );


        addMove();

    }

    else if (
        waste.length > 0
    ) {

        stock =
            waste.reverse();

        waste = [];


        stock.forEach(
            card => {

                card.faceUp = false;

            }
        );


        addMove();

    }


    render();

}


/* =========================================================
   WASTE
========================================================= */

function renderWaste() {

    if (!wasteElement) {
        return;
    }


    wasteElement.innerHTML = "";


    if (
        waste.length === 0
    ) {

        return;

    }


    const card =
        waste[
            waste.length - 1
        ];


    const image =
        createCardElement(card);


    image.classList.add(
        "waste-card"
    );


    addCardInteraction(
        image,
        card,
        {
            type: "waste"
        }
    );


    wasteElement.appendChild(
        image
    );

}


/* =========================================================
   FOUNDATIONS
========================================================= */

function renderFoundations() {

    suits.forEach(
        suit => {

            const element =
                foundationElements[suit];


            if (!element) {
                return;
            }


            element.innerHTML = "";


            const pile =
                foundations[suit];


            if (
                pile.length === 0
            ) {

                setupFoundationTarget(
                    element,
                    suit
                );

                return;

            }


            const card =
                pile[
                    pile.length - 1
                ];


            const image =
                createCardElement(card);


            image.classList.add(
                "foundation-card"
            );


            addCardInteraction(
                image,
                card,
                {
                    type: "foundation",
                    suit: suit
                }
            );


            element.appendChild(
                image
            );


            setupFoundationTarget(
                element,
                suit
            );

        }
    );

}


/* =========================================================
   FOUNDATION TARGET
========================================================= */

function setupFoundationTarget(
    element,
    suit
) {

    element.onclick = null;


    element.onclick =
        event => {

            if (
                event.target !== element
            ) {

                return;

            }


            if (
                !selectedCards ||
                gameWon ||
                gameOver
            ) {

                return;

            }


            if (
                selectedCards.length !== 1
            ) {

                showMoveFeedback(
                    false,
                    element
                );

                return;

            }


            const card =
                selectedCards[0];


            if (
                card.suit !== suit
            ) {

                showMoveFeedback(
                    false,
                    element
                );

                return;

            }


            const valid =
                canMoveToFoundation(
                    card,
                    selectedSource
                );


            if (valid) {

                moveCardToFoundation(
                    card,
                    selectedSource
                );


                showMoveFeedback(
                    true,
                    element
                );

            } else {

                showMoveFeedback(
                    false,
                    element
                );

            }

        };


    element.ondragover =
        event => {

            event.preventDefault();


            if (
                !draggedCards ||
                draggedCards.length !== 1
            ) {

                return;

            }


            const valid =
                canMoveToFoundation(
                    draggedCards[0],
                    draggedSource
                );


            element.classList.toggle(
                "valid-drop",
                valid
            );


            element.classList.toggle(
                "invalid-drop",
                !valid
            );

        };


    element.ondragleave =
        () => {

            element.classList.remove(
                "valid-drop",
                "invalid-drop"
            );

        };


    element.ondrop =
        event => {

            event.preventDefault();


            element.classList.remove(
                "valid-drop",
                "invalid-drop"
            );


            if (
                draggedCards &&
                draggedCards.length === 1
            ) {

                const valid =
                    moveCardToFoundation(
                        draggedCards[0],
                        draggedSource
                    );


                showMoveFeedback(
                    valid,
                    element
                );

            }


            clearSelection();

        };

}


/* =========================================================
   TABLEAU
========================================================= */

function renderTableau() {

    if (!tableauElement) {
        return;
    }


    const columns =
        tableauElement.querySelectorAll(
            ".tableau-column"
        );


    columns.forEach(
        (
            columnElement,
            columnIndex
        ) => {

            columnElement.innerHTML = "";


            const column =
                tableau[columnIndex];


            columnElement.classList.toggle(
                "empty-tableau",
                column.length === 0
            );


            columnElement.onclick = null;


            /*
               EMPTY COLUMN
               Only a King can be placed here.
            */

            if (
                column.length === 0
            ) {

                columnElement.onclick =
                    event => {

                        event.stopPropagation();


                        if (
                            !selectedCards ||
                            gameWon ||
                            gameOver
                        ) {

                            return;

                        }


                        const valid =
                            canMoveToTableau(
                                selectedCards,
                                selectedSource,
                                columnIndex
                            );


                        if (valid) {

                            moveToTableau(
                                selectedCards,
                                selectedSource,
                                columnIndex
                            );


                            showMoveFeedback(
                                true,
                                columnElement
                            );

                        } else {

                            showMoveFeedback(
                                false,
                                columnElement
                            );

                        }

                    };

            }


            column.forEach(
                (
                    card,
                    cardIndex
                ) => {

                    const image =
                        createCardElement(card);


                    image.style.top =
                        `${cardIndex * 28}px`;


                    image.style.zIndex =
                        cardIndex + 1;


                    addCardInteraction(
                        image,
                        card,
                        {
                            type: "tableau",
                            column: columnIndex,
                            index: cardIndex
                        }
                    );


                    columnElement.appendChild(
                        image
                    );

                }
            );


            columnElement.ondragover =
                event => {

                    event.preventDefault();


                    if (
                        !draggedCards ||
                        gameWon ||
                        gameOver
                    ) {

                        return;

                    }


                    const valid =
                        canMoveToTableau(
                            draggedCards,
                            draggedSource,
                            columnIndex
                        );


                    columnElement.classList.toggle(
                        "valid-drop",
                        valid
                    );


                    columnElement.classList.toggle(
                        "invalid-drop",
                        !valid
                    );

                };


            columnElement.ondragleave =
                () => {

                    columnElement.classList.remove(
                        "valid-drop",
                        "invalid-drop"
                    );

                };


            columnElement.ondrop =
                event => {

                    event.preventDefault();


                    columnElement.classList.remove(
                        "valid-drop",
                        "invalid-drop"
                    );


                    if (
                        draggedCards &&
                        !gameWon &&
                        !gameOver
                    ) {

                        const valid =
                            moveToTableau(
                                draggedCards,
                                draggedSource,
                                columnIndex
                            );


                        showMoveFeedback(
                            valid,
                            columnElement
                        );

                    }


                    clearSelection();

                };

        }
    );

}


/* =========================================================
   CARD INTERACTION
========================================================= */

function addCardInteraction(
    element,
    card,
    source
) {

    /*
       TAP
    */

    element.addEventListener(
        "click",
        event => {

            event.preventDefault();
            event.stopPropagation();


            if (
                gameWon ||
                gameOver
            ) {

                return;

            }


            /*
               Face-down card.
            */

            if (
                !card.faceUp
            ) {

                if (
                    source.type === "tableau"
                ) {

                    const column =
                        tableau[
                            source.column
                        ];


                    const top =
                        column[
                            column.length - 1
                        ];


                    if (
                        top === card
                    ) {

                        ensureGameStarted();

                        card.faceUp = true;

                        addMove();

                        vibrate(25);

                        render();

                        checkWin();

                        if (!gameWon) {
                            checkNoMoreMoves();
                        }

                    }

                }

                return;

            }


            handleCardTap(
                card,
                source,
                element
            );

        }
    );


    /*
       DOUBLE CLICK
       Automatically move to foundation.
    */

    element.addEventListener(
        "dblclick",
        event => {

            event.preventDefault();
            event.stopPropagation();


            if (
                !card.faceUp ||
                gameWon ||
                gameOver
            ) {

                return;

            }


            ensureGameStarted();


            const valid =
                canMoveToFoundation(
                    card,
                    source
                );


            if (valid) {

                moveCardToFoundation(
                    card,
                    source
                );


                showMoveFeedback(
                    true,
                    element
                );

            } else {

                showMoveFeedback(
                    false,
                    element
                );

            }

        }
    );


    /*
       DESKTOP DRAG
    */

    element.addEventListener(
        "dragstart",
        event => {

            if (
                !card.faceUp ||
                gameWon ||
                gameOver
            ) {

                event.preventDefault();

                return;

            }


            const movable =
                getMovableCards(
                    card,
                    source
                );


            if (
                movable.length === 0
            ) {

                event.preventDefault();

                return;

            }


            ensureGameStarted();


            draggedCards =
                movable;

            draggedSource =
                source;


            event.dataTransfer.effectAllowed =
                "move";


            event.dataTransfer.setData(
                "text/plain",
                card.id
            );


            element.classList.add(
                "moving"
            );

        }
    );


    element.addEventListener(
        "dragend",
        () => {

            element.classList.remove(
                "moving"
            );


            draggedCards = null;
            draggedSource = null;


            document
                .querySelectorAll(
                    ".valid-drop, .invalid-drop"
                )
                .forEach(
                    element => {

                        element.classList.remove(
                            "valid-drop",
                            "invalid-drop"
                        );

                    }
                );

        }
    );

}


/* =========================================================
   HANDLE CARD TAP
========================================================= */

function handleCardTap(
    card,
    source,
    element
) {

    if (
        gameWon ||
        gameOver
    ) {

        return;

    }


    ensureGameStarted();


    /*
       FIRST TAP
    */

    if (!selectedCards) {

        const movable =
            getMovableCards(
                card,
                source
            );


        if (
            movable.length === 0
        ) {

            showMoveFeedback(
                false,
                element
            );

            return;

        }


        selectedCards =
            movable;

        selectedSource =
            source;


        highlightSelectedCards();

        vibrate(20);

        return;

    }


    /*
       SECOND TAP ON SAME CARD
       Cancel selection.
    */

    if (
        selectedCards.includes(card)
    ) {

        clearSelection();

        render();

        return;

    }


    /*
       SECOND TAP ON TABLEAU CARD
    */

    if (
        source.type === "tableau"
    ) {

        const destinationColumn =
            source.column;


        const valid =
            canMoveToTableau(
                selectedCards,
                selectedSource,
                destinationColumn
            );


        if (valid) {

            moveToTableau(
                selectedCards,
                selectedSource,
                destinationColumn
            );


            showMoveFeedback(
                true,
                element
            );


            return;

        }


        showMoveFeedback(
            false,
            element
        );


        return;

    }


    /*
       SECOND TAP ON FOUNDATION
    */

    if (
        source.type === "foundation"
    ) {

        if (
            selectedCards.length === 1
        ) {

            const selectedCard =
                selectedCards[0];


            if (
                selectedCard.suit ===
                source.suit
            ) {

                const valid =
                    canMoveToFoundation(
                        selectedCard,
                        selectedSource
                    );


                if (valid) {

                    moveCardToFoundation(
                        selectedCard,
                        selectedSource
                    );


                    showMoveFeedback(
                        true,
                        element
                    );


                    return;

                }

            }

        }


        showMoveFeedback(
            false,
            element
        );


        return;

    }


    /*
       TAP ANOTHER MOVABLE CARD
       Change selection.
    */

    const newMovable =
        getMovableCards(
            card,
            source
        );


    if (
        newMovable.length > 0
    ) {

        clearSelection();


        selectedCards =
            newMovable;

        selectedSource =
            source;


        highlightSelectedCards();

        vibrate(20);

        return;

    }


    /*
       INVALID
    */

    showMoveFeedback(
        false,
        element
    );

}


/* =========================================================
   GET MOVABLE CARDS
========================================================= */

function getMovableCards(
    card,
    source
) {

    /*
       TABLEAU
    */

    if (
        source.type === "tableau"
    ) {

        const column =
            tableau[
                source.column
            ];


        const index =
            column.indexOf(card);


        if (
            index === -1 ||
            !card.faceUp
        ) {

            return [];

        }


        /*
           Everything from selected card
           downward must be face-up.
        */

        for (
            let i = index;
            i < column.length;
            i++
        ) {

            if (
                !column[i].faceUp
            ) {

                return [];

            }

        }


        /*
           Check sequence itself.
        */

        for (
            let i = index;
            i < column.length - 1;
            i++
        ) {

            const current =
                column[i];

            const next =
                column[i + 1];


            if (
                isRed(current) ===
                isRed(next)
            ) {

                return [];

            }


            if (
                current.value !==
                next.value + 1
            ) {

                return [];

            }

        }


        return column.slice(
            index
        );

    }


    /*
       WASTE
    */

    if (
        source.type === "waste"
    ) {

        const top =
            waste[
                waste.length - 1
            ];


        if (
            top !== card
        ) {

            return [];

        }


        return [card];

    }


    /*
       FOUNDATION
    */

    if (
        source.type === "foundation"
    ) {

        const pile =
            foundations[
                source.suit
            ];


        const top =
            pile[
                pile.length - 1
            ];


        if (
            top !== card
        ) {

            return [];

        }


        return [card];

    }


    return [];

}


/* =========================================================
   CAN MOVE TO TABLEAU
========================================================= */

function canMoveToTableau(
    cards,
    source,
    destinationColumn
) {

    if (
        !cards ||
        cards.length === 0
    ) {

        return false;

    }


    if (
        gameWon ||
        gameOver
    ) {

        return false;

    }


    const movingCard =
        cards[0];


    /*
       Can't move onto same column.
    */

    if (
        source &&
        source.type === "tableau" &&
        source.column === destinationColumn
    ) {

        return false;

    }


    const destination =
        tableau[
            destinationColumn
        ];


    /*
       EMPTY COLUMN
       Only King.
    */

    if (
        destination.length === 0
    ) {

        return (
            movingCard.value === 13
        );

    }


    const target =
        destination[
            destination.length - 1
        ];


    if (
        !target.faceUp
    ) {

        return false;

    }


    /*
       Different colours.
    */

    if (
        isRed(movingCard) ===
        isRed(target)
    ) {

        return false;

    }


    /*
       One number lower.
    */

    if (
        movingCard.value !==
        target.value - 1
    ) {

        return false;

    }


    return true;

}


/* =========================================================
   CAN MOVE TO FOUNDATION
========================================================= */

function canMoveToFoundation(
    card,
    source
) {

    if (
        !card ||
        !card.faceUp ||
        gameWon ||
        gameOver
    ) {

        return false;

    }


    /*
       Foundation only receives one card.
    */

    const movable =
        getMovableCards(
            card,
            source
        );


    if (
        movable.length !== 1
    ) {

        return false;

    }


    const pile =
        foundations[
            card.suit
        ];


    /*
       Empty foundation = Ace.
    */

    if (
        pile.length === 0
    ) {

        return (
            card.value === 1
        );

    }


    const top =
        pile[
            pile.length - 1
        ];


    return (
        card.value ===
        top.value + 1
    );

}


/* =========================================================
   MOVE TO TABLEAU
========================================================= */

function moveToTableau(
    cards,
    source,
    destinationColumn
) {

    if (
        !canMoveToTableau(
            cards,
            source,
            destinationColumn
        )
    ) {

        return false;

    }


    const destination =
        tableau[
            destinationColumn
        ];


    removeCardsFromSource(
        cards,
        source
    );


    destination.push(
        ...cards
    );


    /*
       Turn over new top card.
    */

    if (
        source.type === "tableau"
    ) {

        flipTopCard(
            source.column
        );

    }


    addMove();

    clearSelection();

    render();

    checkWin();


    if (!gameWon) {

        checkNoMoreMoves();

    }


    return true;

}


/* =========================================================
   MOVE TO FOUNDATION
========================================================= */

function moveCardToFoundation(
    card,
    source
) {

    if (
        !canMoveToFoundation(
            card,
            source
        )
    ) {

        return false;

    }


    const pile =
        foundations[
            card.suit
        ];


    removeCardsFromSource(
        [card],
        source
    );


    pile.push(
        card
    );


    if (
        source.type === "tableau"
    ) {

        flipTopCard(
            source.column
        );

    }


    addMove();

    clearSelection();

    render();

    checkWin();


    if (!gameWon) {

        checkNoMoreMoves();

    }


    return true;

}


/* =========================================================
   REMOVE FROM SOURCE
========================================================= */

function removeCardsFromSource(
    cards,
    source
) {

    if (
        source.type === "tableau"
    ) {

        const column =
            tableau[
                source.column
            ];


        const index =
            column.indexOf(
                cards[0]
            );


        if (
            index === -1
        ) {

            return;

        }


        column.splice(
            index,
            cards.length
        );


        return;

    }


    if (
        source.type === "waste"
    ) {

        if (
            waste[
                waste.length - 1
            ] === cards[0]
        ) {

            waste.pop();

        }


        return;

    }


    if (
        source.type === "foundation"
    ) {

        const pile =
            foundations[
                source.suit
            ];


        if (
            pile[
                pile.length - 1
            ] === cards[0]
        ) {

            pile.pop();

        }

    }

}


/* =========================================================
   FLIP TOP CARD
========================================================= */

function flipTopCard(
    columnIndex
) {

    const column =
        tableau[
            columnIndex
        ];


    if (
        !column ||
        column.length === 0
    ) {

        return;

    }


    const top =
        column[
            column.length - 1
        ];


    if (
        !top.faceUp
    ) {

        top.faceUp = true;

    }

}


/* =========================================================
   IS RED
========================================================= */

function isRed(card) {

    return redSuits.has(
        card.suit
    );

}


/* =========================================================
   FIND CARD ELEMENT
========================================================= */

function findCardElement(card) {

    const elements =
        document.querySelectorAll(
            ".card"
        );


    for (
        const element of elements
    ) {

        if (
            element.alt ===
            `${card.rank} of ${card.suit}`
        ) {

            return element;

        }

    }


    return null;

}


/* =========================================================
   HIGHLIGHT SELECTED CARDS
========================================================= */

function highlightSelectedCards() {

    document
        .querySelectorAll(
            ".card"
        )
        .forEach(
            element => {

                element.classList.remove(
                    "moving"
                );

            }
        );


    if (!selectedCards) {
        return;
    }


    selectedCards.forEach(
        card => {

            const element =
                findCardElement(card);


            if (element) {

                element.classList.add(
                    "moving"
                );

            }

        }
    );

}


/* =========================================================
   CLEAR SELECTION
========================================================= */

function clearSelection() {

    selectedCards = null;
    selectedSource = null;

    draggedCards = null;
    draggedSource = null;


    document
        .querySelectorAll(
            ".card"
        )
        .forEach(
            element => {

                element.classList.remove(
                    "moving"
                );

            }
        );


    document
        .querySelectorAll(
            ".valid-drop, .invalid-drop"
        )
        .forEach(
            element => {

                element.classList.remove(
                    "valid-drop",
                    "invalid-drop"
                );

            }
        );

}


/* =========================================================
   FEEDBACK
========================================================= */

function showMoveFeedback(
    valid,
    element
) {

    if (!element) {

        vibrate(
            valid
                ? [25, 30, 25]
                : 80
        );

        return;

    }


    element.classList.remove(
        "move-correct",
        "move-wrong"
    );


    void element.offsetWidth;


    if (valid) {

        element.classList.add(
            "move-correct"
        );


        vibrate(
            [25, 30, 25]
        );

    } else {

        element.classList.add(
            "move-wrong"
        );


        vibrate(80);

    }


    setTimeout(
        () => {

            element.classList.remove(
                "move-correct",
                "move-wrong"
            );

        },
        600
    );

}


/* =========================================================
   VIBRATION
========================================================= */

function vibrate(pattern) {

    if (
        "vibrate" in navigator
    ) {

        try {

            navigator.vibrate(
                pattern
            );

        } catch (error) {

            // Vibration unsupported.

        }

    }

}


/* =========================================================
   NO MORE MOVES CHECK
========================================================= */

/*
   This checks whether the current position
   has any legal moves left.

   IMPORTANT:

   Stock cards are treated as potential moves.
   If stock still exists, the player can still
   draw cards.

   If waste exists while stock is empty,
   the waste can be recycled.

   Therefore the game is only declared dead when:

   - Stock is empty
   - Waste is empty
   - No face-down tableau card can be flipped
   - No tableau card can move
   - No tableau card can move to foundation
*/

function checkNoMoreMoves() {

    if (
        gameWon ||
        gameOver
    ) {

        return;

    }


    /*
       WIN ALWAYS HAS PRIORITY.
    */

    if (
        isGameComplete()
    ) {

        return;

    }


    /*
       STOCK STILL HAS CARDS.

       Player can still draw.
    */

    if (
        stock.length > 0
    ) {

        return;

    }


    /*
       WASTE STILL EXISTS.

       With the current unlimited-recycle
       Klondike system, the player can
       recycle it back into the stock.
    */

    if (
        waste.length > 0
    ) {

        /*
           First check whether the waste
           top card has a direct move.
        */

        const wasteCard =
            waste[
                waste.length - 1
            ];


        const wasteSource = {
            type: "waste"
        };


        /*
           Waste → Foundation
        */

        if (
            canMoveToFoundation(
                wasteCard,
                wasteSource
            )
        ) {

            return;

        }


        /*
           Waste → Tableau
        */

        for (
            let column = 0;
            column < 7;
            column++
        ) {

            if (
                canMoveToTableau(
                    [wasteCard],
                    wasteSource,
                    column
                )
            ) {

                return;

            }

        }


        /*
           Even if the waste cannot move,
           it can still be recycled.
        */

        return;

    }


    /*
       =====================================================
       CHECK TABLEAU
       =====================================================
    */

    for (
        let column = 0;
        column < 7;
        column++
    ) {

        const cards =
            tableau[column];


        /*
           IMPORTANT:
           A face-down TOP CARD can be flipped.

           This is a legal move, so don't declare
           Game Over while one exists.
        */

        if (
            cards.length > 0
        ) {

            const top =
                cards[
                    cards.length - 1
                ];


            if (
                !top.faceUp
            ) {

                return;

            }

        }


        /*
           Check every face-up card.
        */

        for (
            let index = 0;
            index < cards.length;
            index++
        ) {

            const card =
                cards[index];


            if (
                !card.faceUp
            ) {

                continue;

            }


            const source = {

                type: "tableau",

                column: column,

                index: index

            };


            /*
               Tableau → Foundation
            */

            if (
                canMoveToFoundation(
                    card,
                    source
                )
            ) {

                return;

            }


            /*
               Get complete movable sequence.
            */

            const movable =
                getMovableCards(
                    card,
                    source
                );


            if (
                movable.length === 0
            ) {

                continue;

            }


            /*
               Tableau → Tableau
            */

            for (
                let destination = 0;
                destination < 7;
                destination++
            ) {

                if (
                    destination === column
                ) {

                    continue;

                }


                if (
                    canMoveToTableau(
                        movable,
                        source,
                        destination
                    )
                ) {

                    return;

                }

            }

        }

    }


    /*
       =====================================================
       NOTHING LEFT
       =====================================================
    */

    triggerNoMoreMoves();

}


/* =========================================================
   GAME COMPLETE CHECK
========================================================= */

function isGameComplete() {

    let totalCards = 0;


    suits.forEach(
        suit => {

            totalCards +=
                foundations[
                    suit
                ].length;

        }
    );


    return totalCards === 52;

}


/* =========================================================
   NO MORE MOVES GAME OVER
========================================================= */

function triggerNoMoreMoves() {

    if (
        gameWon ||
        gameOver
    ) {

        return;

    }


    gameOver = true;

    stopTimer();

    clearSelection();


    updateMessage(
        "No more moves! 😵 Game Over!"
    );


    vibrate(
        [100, 50, 100, 50, 150]
    );


    if (restartButton) {

        restartButton.textContent =
            "😵";

    }

}


/* =========================================================
   WIN CHECK
========================================================= */

function checkWin() {

    if (
        gameWon ||
        gameOver
    ) {

        return;

    }


    let totalCards =
        0;


    suits.forEach(
        suit => {

            totalCards +=
                foundations[
                    suit
                ].length;

        }
    );


    if (
        totalCards === 52
    ) {

        winGame();

    }

}


/* =========================================================
   WIN
========================================================= */

function winGame() {

    if (gameWon) {
        return;
    }


    gameWon = true;

    stopTimer();

    clearSelection();


    updateMessage(
        `You won! 🎉 ${moves} moves • ${elapsedTime}s`
    );


    showWinOverlay();

}


/* =========================================================
   WIN OVERLAY
========================================================= */

function showWinOverlay() {

    if (!winOverlay) {
        return;
    }


    winOverlay.classList.add(
        "show"
    );


    winOverlay.setAttribute(
        "aria-hidden",
        "false"
    );

}


function hideWinOverlay() {

    if (!winOverlay) {
        return;
    }


    winOverlay.classList.remove(
        "show"
    );


    winOverlay.setAttribute(
        "aria-hidden",
        "true"
    );

}


/* =========================================================
   RESTART
========================================================= */

if (restartButton) {

    restartButton.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            newGame();

        }
    );

}


if (winRestartButton) {

    winRestartButton.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            newGame();

        }
    );

}


/* =========================================================
   MUSIC
========================================================= */

function startMusic() {

    if (!musicEnabled) {
        return;
    }


    backgroundMusic
        .play()
        .catch(
            () => {}
        );

}


if (musicButton) {

    musicButton.addEventListener(
        "click",
        event => {

            event.stopPropagation();


            musicEnabled =
                !musicEnabled;


            if (
                musicEnabled
            ) {

                startMusic();


                musicButton.textContent =
                    "🎵 Music On";

            } else {

                backgroundMusic.pause();


                musicButton.textContent =
                    "🔇 Music Off";

            }

        }
    );

}


/* =========================================================
   START MUSIC AFTER USER ACTION
========================================================= */

document.addEventListener(
    "click",
    () => {

        if (
            musicEnabled &&
            backgroundMusic.paused
        ) {

            startMusic();

        }

    },
    {
        once: true
    }
);


/* =========================================================
   START GAME
========================================================= */

newGame();
