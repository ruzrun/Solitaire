/* =========================================================
   SOLITAIRE 🃏
   Classic Klondike Solitaire
   Mobile + Desktop
========================================================= */


/* =========================================================
   DOM
========================================================= */

const stockElement =
    document.getElementById("stock");

const wasteElement =
    document.getElementById("waste");

const tableauElement =
    document.getElementById("tableau");

const foundationElements = {
    hearts: document.getElementById("foundation-hearts"),
    diamonds: document.getElementById("foundation-diamonds"),
    clubs: document.getElementById("foundation-clubs"),
    spades: document.getElementById("foundation-spades")
};

const movesDisplay =
    document.getElementById("moves");

const timerDisplay =
    document.getElementById("timer");

const restartButton =
    document.getElementById("restartButton");

const gameMessage =
    document.getElementById("gameMessage");

const musicButton =
    document.getElementById("musicButton");

const winOverlay =
    document.getElementById("winOverlay");

const winRestartButton =
    document.getElementById("winRestartButton");


/* =========================================================
   CARD SOURCE
========================================================= */

const CARD_BASE_URL =
    "https://webisso.github.io/playing-cards/png";


/* =========================================================
   CUSTOM CARD BACK
=========================================================

   Your image:

   https://github.com/ruzrun/Monthniversary/blob/main/photo1.png

   Raw image version:
========================================================= */

const CARD_BACK_IMAGE =
    "https://raw.githubusercontent.com/ruzrun/Monthniversary/main/photo1.png";


/* =========================================================
   CARD INFORMATION
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


/* =========================================================
   SELECTION
========================================================= */

let selectedCards = null;

let selectedSource = null;


/* =========================================================
   DRAGGING
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
   GET CARD IMAGE
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
   DEAL KLONDIKE
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


    /*
       7 columns:

       1
       2
       3
       4
       5
       6
       7
    */

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


    /*
       Remaining 24 cards
       go into the stock.
    */

    stock =
        deck.splice(0);

    stock.forEach(
        card => {

            card.faceUp =
                false;

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


    clearSelection();


    createDeck();

    dealCards();


    updateMoves();

    updateTimer();


    hideWinOverlay();


    updateMessage(
        "Move the cards and build your foundations 🃏"
    );


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

        /*
           YOUR CUSTOM CARD BACK
        */

        image.src =
            CARD_BACK_IMAGE;

        image.alt =
            "Face-down card";

        image.classList.add(
            "face-down"
        );

    }


    return image;

}


/* =========================================================
   RENDER STOCK
========================================================= */

function renderStock() {

    if (!stockElement) {
        return;
    }


    stockElement.innerHTML = "";

    stockElement.classList.remove(
        "empty"
    );


    /*
       Stock still has cards.
    */

    if (
        stock.length > 0
    ) {

        const card =
            {
                faceUp: false
            };


        const image =
            createCardElement(card);


        image.classList.add(
            "stock-card"
        );


        stockElement.appendChild(
            image
        );

    }


    /*
       Empty stock.

       Show recycle symbol if
       there are cards in waste.
    */

    else if (
        waste.length > 0
    ) {

        stockElement.classList.add(
            "empty"
        );

        stockElement.textContent =
            "↻";

    }


    stockElement.onclick =
        () => {

            drawFromStock();

        };

}


/* =========================================================
   DRAW STOCK
========================================================= */

function drawFromStock() {

    if (gameWon) {
        return;
    }


    ensureGameStarted();

    clearSelection();


    /*
       Draw one card.
    */

    if (
        stock.length > 0
    ) {

        const card =
            stock.pop();


        card.faceUp =
            true;


        waste.push(
            card
        );


        addMove();

    }


    /*
       Recycle waste.
    */

    else if (
        waste.length > 0
    ) {

        stock =
            waste.reverse();

        waste = [];


        stock.forEach(
            card => {

                card.faceUp =
                    false;

            }
        );


        addMove();

    }


    render();

}


/* =========================================================
   RENDER WASTE
========================================================= */

function renderWaste() {

    if (!wasteElement) {
        return;
    }


    wasteElement.innerHTML =
        "";


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
   RENDER FOUNDATIONS
========================================================= */

function renderFoundations() {

    suits.forEach(
        suit => {

            const element =
                foundationElements[suit];


            if (!element) {
                return;
            }


            element.innerHTML =
                "";


            const pile =
                foundations[suit];


            if (
                pile.length === 0
            ) {

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

        }
    );

}


/* =========================================================
   RENDER TABLEAU
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

            columnElement.innerHTML =
                "";


            const column =
                tableau[columnIndex];


            column.forEach(
                (
                    card,
                    cardIndex
                ) => {

                    const image =
                        createCardElement(card);


                    /*
                       Card overlap.
                    */

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


            /*
               Empty column tap.
            */

            columnElement.onclick =
                event => {

                    if (
                        event.target !==
                        columnElement
                    ) {

                        return;

                    }


                    if (
                        selectedCards
                    ) {

                        const moved =
                            moveToTableau(
                                selectedCards,
                                selectedSource,
                                columnIndex
                            );


                        if (!moved) {

                            clearSelection();

                            render();

                        }

                    }

                };


            /*
               Desktop drag.
            */

            columnElement.ondragover =
                event => {

                    event.preventDefault();

                    event.dataTransfer.dropEffect =
                        "move";

                };


            columnElement.ondrop =
                event => {

                    event.preventDefault();


                    if (
                        draggedCards
                    ) {

                        moveToTableau(
                            draggedCards,
                            draggedSource,
                            columnIndex
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
       TAP / CLICK
    */

    element.addEventListener(
        "click",
        event => {

            event.stopPropagation();


            /*
               Face-down card.
            */

            if (
                !card.faceUp
            ) {

                if (
                    source.type ===
                    "tableau"
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

                        card.faceUp =
                            true;

                        addMove();

                        render();

                    }

                }

                return;

            }


            handleCardClick(
                card,
                source
            );

        }
    );


    /*
       DOUBLE TAP / DOUBLE CLICK
    */

    element.addEventListener(
        "dblclick",
        event => {

            event.stopPropagation();


            if (
                !card.faceUp
            ) {
                return;
            }


            ensureGameStarted();


            moveCardToFoundation(
                card,
                source
            );

        }
    );


    /*
       DESKTOP DRAG
    */

    element.addEventListener(
        "dragstart",
        event => {

            if (
                !card.faceUp
            ) {

                event.preventDefault();

                return;

            }


            const cards =
                getMovableCards(
                    card,
                    source
                );


            if (
                cards.length === 0
            ) {

                event.preventDefault();

                return;

            }


            ensureGameStarted();


            draggedCards =
                cards;

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

        }
    );

}


/* =========================================================
   HANDLE CARD CLICK
========================================================= */

function handleCardClick(
    card,
    source
) {

    if (gameWon) {
        return;
    }


    ensureGameStarted();


    /*
       Something is already selected.
    */

    if (
        selectedCards
    ) {

        /*
           Tapping the selected card
           cancels selection.
        */

        if (
            selectedCards.includes(card)
        ) {

            clearSelection();

            render();

            return;

        }


        let moved =
            false;


        /*
           Move onto tableau.
        */

        if (
            source.type ===
            "tableau"
        ) {

            moved =
                moveToTableau(
                    selectedCards,
                    selectedSource,
                    source.column
                );

        }


        /*
           Move onto foundation.
        */

        else if (
            source.type ===
            "foundation"
        ) {

            if (
                selectedCards.length === 1
            ) {

                moved =
                    moveCardToFoundation(
                        selectedCards[0],
                        selectedSource
                    );

            }

        }


        /*
           Successful move.
        */

        if (moved) {
            return;
        }


        /*
           Invalid destination.

           Select the new card instead.
        */

        clearSelection();


        const movable =
            getMovableCards(
                card,
                source
            );


        if (
            movable.length > 0
        ) {

            selectedCards =
                movable;

            selectedSource =
                source;

            highlightSelectedCards();

        }


        return;

    }


    /*
       Nothing selected.
    */

    const movable =
        getMovableCards(
            card,
            source
        );


    if (
        movable.length === 0
    ) {

        return;

    }


    selectedCards =
        movable;

    selectedSource =
        source;


    highlightSelectedCards();

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
        source.type ===
        "tableau"
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
           Everything underneath
           must also be face-up.
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


        return column.slice(
            index
        );

    }


    /*
       WASTE
    */

    if (
        source.type ===
        "waste"
    ) {

        if (
            waste[
                waste.length - 1
            ] !== card
        ) {

            return [];

        }


        return [card];

    }


    /*
       FOUNDATION
    */

    if (
        source.type ===
        "foundation"
    ) {

        const pile =
            foundations[
                source.suit
            ];


        if (
            pile[
                pile.length - 1
            ] !== card
        ) {

            return [];

        }


        return [card];

    }


    return [];

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
        !cards ||
        cards.length === 0
    ) {

        return false;

    }


    const destination =
        tableau[
            destinationColumn
        ];


    const movingCard =
        cards[0];


    /*
       Can't move onto itself.
    */

    if (
        source.type ===
        "tableau" &&
        source.column ===
        destinationColumn
    ) {

        return false;

    }


    /*
       EMPTY COLUMN

       Only King.
    */

    if (
        destination.length === 0
    ) {

        if (
            movingCard.value !== 13
        ) {

            return false;

        }

    }


    /*
       NON-EMPTY COLUMN
    */

    else {

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
           Colours must alternate.
        */

        if (
            isRed(movingCard) ===
            isRed(target)
        ) {

            return false;

        }


        /*
           Must descend by one.
        */

        if (
            movingCard.value !==
            target.value - 1
        ) {

            return false;

        }

    }


    removeCardsFromSource(
        cards,
        source
    );


    destination.push(
        ...cards
    );


    /*
       Reveal card underneath.
    */

    if (
        source.type ===
        "tableau"
    ) {

        flipTopCard(
            source.column
        );

    }


    addMove();

    clearSelection();

    render();

    checkWin();

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
        !card ||
        !card.faceUp
    ) {

        return false;

    }


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


    const foundation =
        foundations[
            card.suit
        ];


    /*
       First card must be Ace.
    */

    if (
        foundation.length === 0
    ) {

        if (
            card.value !== 1
        ) {

            return false;

        }

    }


    /*
       Otherwise next number.
    */

    else {

        const top =
            foundation[
                foundation.length - 1
            ];


        if (
            card.value !==
            top.value + 1
        ) {

            return false;

        }

    }


    removeCardsFromSource(
        [card],
        source
    );


    foundation.push(
        card
    );


    if (
        source.type ===
        "tableau"
    ) {

        flipTopCard(
            source.column
        );

    }


    addMove();

    clearSelection();

    render();

    checkWin();

    return true;

}


/* =========================================================
   REMOVE FROM SOURCE
========================================================= */

function removeCardsFromSource(
    cards,
    source
) {

    /*
       TABLEAU
    */

    if (
        source.type ===
        "tableau"
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


    /*
       WASTE
    */

    if (
        source.type ===
        "waste"
    ) {

        waste.pop();

        return;

    }


    /*
       FOUNDATION
    */

    if (
        source.type ===
        "foundation"
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
   FLIP TOP TABLEAU CARD
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

        top.faceUp =
            true;

    }

}


/* =========================================================
   RED CARD?
========================================================= */

function isRed(card) {

    return redSuits.has(
        card.suit
    );

}


/* =========================================================
   HIGHLIGHT SELECTION
========================================================= */

function highlightSelectedCards() {

    document
        .querySelectorAll(".card")
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

            document
                .querySelectorAll(".card")
                .forEach(
                    element => {

                        if (
                            element.alt ===
                            `${card.rank} of ${card.suit}`
                        ) {

                            element.classList.add(
                                "moving"
                            );

                        }

                    }
                );

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
        .querySelectorAll(".card")
        .forEach(
            element => {

                element.classList.remove(
                    "moving"
                );

            }
        );

}


/* =========================================================
   FOUNDATION INTERACTION
========================================================= */

suits.forEach(
    suit => {

        const element =
            foundationElements[suit];


        if (!element) {
            return;
        }


        /*
           Desktop drag.
        */

        element.addEventListener(
            "dragover",
            event => {

                event.preventDefault();

                event.dataTransfer.dropEffect =
                    "move";

            }
        );


        element.addEventListener(
            "drop",
            event => {

                event.preventDefault();


                if (
                    draggedCards &&
                    draggedCards.length === 1
                ) {

                    moveCardToFoundation(
                        draggedCards[0],
                        draggedSource
                    );

                }


                clearSelection();

            }
        );


        /*
           Mobile tap.
        */

        element.addEventListener(
            "click",
            event => {

                event.stopPropagation();


                if (
                    selectedCards &&
                    selectedCards.length === 1
                ) {

                    moveCardToFoundation(
                        selectedCards[0],
                        selectedSource
                    );

                }

            }
        );

    }
);


/* =========================================================
   RESTART
========================================================= */

if (restartButton) {

    restartButton.addEventListener(
        "click",
        () => {

            newGame();

        }
    );

}


/* =========================================================
   WIN CHECK
========================================================= */

function checkWin() {

    let totalCards =
        0;


    suits.forEach(
        suit => {

            totalCards +=
                foundations[suit].length;

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
   WIN RESTART
========================================================= */

if (winRestartButton) {

    winRestartButton.addEventListener(
        "click",
        () => {

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
