/* =========================================================
   SOLITAIRE 🃏
   Classic Klondike
   Tap-to-move + Drag-to-move
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
   CARD IMAGES
========================================================= */

const CARD_BASE_URL =
    "https://webisso.github.io/playing-cards/png";


/*
   Your custom card back.
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


/* =========================================================
   SELECTION
========================================================= */

let selectedCards = null;

let selectedSource = null;


/* =========================================================
   DRAG STATE
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
        "Tap a card, then tap where you want to move it 🃏"
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
   RENDER EVERYTHING
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


    /*
       Prevent mobile browser
       image dragging behaviour.
    */

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

    }

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
        event => {

            event.stopPropagation();

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
   WASTE
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

            columnElement.innerHTML =
                "";


            const column =
                tableau[columnIndex];


            columnElement.classList.toggle(
                "empty-tableau",
                column.length === 0
            );


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


            /*
               EMPTY COLUMN / COLUMN AREA TAP

               This is what lets you put a King
               into an empty slot.
            */

            columnElement.addEventListener(
                "click",
                event => {

                    if (
                        event.target !==
                        columnElement
                    ) {

                        return;

                    }


                    handleTableauDestination(
                        columnIndex,
                        columnElement
                    );

                }
            );


            /*
               Desktop drag.
            */

            columnElement.ondragover =
                event => {

                    event.preventDefault();


                    if (
                        !draggedCards
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
                        draggedCards
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
       CLICK / TAP
    */

    element.addEventListener(
        "click",
        event => {

            event.preventDefault();

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


                    if (
                        column[
                            column.length - 1
                        ] === card
                    ) {

                        ensureGameStarted();

                        card.faceUp =
                            true;

                        addMove();

                        render();

                        vibrate(
                            25
                        );

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
       DOUBLE CLICK / DOUBLE TAP
       automatically sends card
       to foundation.
    */

    element.addEventListener(
        "dblclick",
        event => {

            event.preventDefault();

            event.stopPropagation();


            if (
                !card.faceUp
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


            document
                .querySelectorAll(
                    ".valid-drop, .invalid-drop"
                )
                .forEach(
                    item => {

                        item.classList.remove(
                            "valid-drop",
                            "invalid-drop"
                        );

                    }
                );

        }
    );

}


/* =========================================================
   TAP CARD
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
       NOTHING SELECTED

       First tap selects card.
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
                findCardElement(card)
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
       TAP SAME CARD
       = deselect
    */

    if (
        selectedCards.includes(card)
    ) {

        clearSelection();

        render();

        return;

    }


    /*
       TAP TABLEAU CARD

       Try to move selected cards
       onto this card.
    */

    if (
        source.type === "tableau"
    ) {

        const valid =
            canMoveToTableau(
                selectedCards,
                selectedSource,
                source.column
            );


        if (valid) {

            moveToTableau(
                selectedCards,
                selectedSource,
                source.column
            );


            showMoveFeedback(
                true,
                findCardElement(card)
            );


            return;

        }


        /*
           If invalid, show red feedback.
        */

        showMoveFeedback(
            false,
            findCardElement(card)
        );


        return;

    }


    /*
       FOUNDATION

       Tap foundation itself is handled
       separately below.
    */

    if (
        source.type === "foundation"
    ) {

        if (
            selectedCards.length === 1
        ) {

            const valid =
                canMoveToFoundation(
                    selectedCards[0],
                    selectedSource
                );


            if (valid) {

                moveCardToFoundation(
                    selectedCards[0],
                    selectedSource
                );


                showMoveFeedback(
                    true,
                    findCardElement(card)
                );


                return;

            }

        }


        showMoveFeedback(
            false,
            findCardElement(card)
        );


        return;

    }


    /*
       Tap another movable card
       to change selection.
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


    showMoveFeedback(
        false,
        findCardElement(card)
    );

}


/* =========================================================
   TABLEAU DESTINATION
========================================================= */

function handleTableauDestination(
    columnIndex,
    element
) {

    if (
        !selectedCards
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
            element
        );

    } else {

        showMoveFeedback(
            false,
            element
        );

    }

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
           All cards underneath
           must be face-up.
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
        source.type === "waste"
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
        source.type === "foundation"
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


    const movingCard =
        cards[0];


    /*
       Don't move to same column.
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
       Descending by one.
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
        !card.faceUp
    ) {

        return false;

    }


    /*
       Only top card can move.
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


    const foundation =
        foundations[
            card.suit
        ];


    /*
       Empty foundation = Ace.
    */

    if (
        foundation.length === 0
    ) {

        return (
            card.value === 1
        );

    }


    const top =
        foundation[
            foundation.length - 1
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
       Flip card underneath.
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


    const foundation =
        foundations[
            card.suit
        ];


    removeCardsFromSource(
        [card],
        source
    );


    foundation.push(
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

        top.faceUp =
            true;

    }

}


/* =========================================================
   RED?
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

}


/* =========================================================
   FOUNDATION TAP TARGET
========================================================= */

suits.forEach(
    suit => {

        const element =
            foundationElements[suit];


        if (!element) {
            return;
        }


        /*
           TAP FOUNDATION

           This is important for mobile.
        */

        element.addEventListener(
            "click",
            event => {

                event.stopPropagation();


                if (
                    !selectedCards ||
                    selectedCards.length !== 1
                ) {

                    return;

                }


                const card =
                    selectedCards[0];


                const valid =
                    card.suit === suit &&
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

            }
        );


        /*
           DESKTOP DRAG
        */

        element.addEventListener(
            "dragover",
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

            }
        );


        element.addEventListener(
            "dragleave",
            () => {

                element.classList.remove(
                    "valid-drop",
                    "invalid-drop"
                );

            }
        );


        element.addEventListener(
            "drop",
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

            }
        );

    }
);


/* =========================================================
   FEEDBACK
========================================================= */

function showMoveFeedback(
    valid,
    element
) {

    if (!element) {
        return;
    }


    element.classList.remove(
        "move-correct",
        "move-wrong"
    );


    /*
       Restart animation.
    */

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


        vibrate(
            80
        );

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

            /*
               Some browsers don't allow
               vibration.
            */

        }

    }

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
   START MUSIC AFTER USER INTERACTION
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
   START
========================================================= */

newGame();
