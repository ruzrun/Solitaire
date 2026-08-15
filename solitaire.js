/* =========================================================
   SOLITAIRE 🃏
   Classic Klondike Solitaire
   Mobile + Desktop
========================================================= */


/* =========================================================
   DOM
========================================================= */

const board =
    document.getElementById("solitaireBoard");

const stockElement =
    document.getElementById("stock");

const wasteElement =
    document.getElementById("waste");

const tableauElement =
    document.getElementById("tableau");

const foundationElements = {

    hearts:
        document.getElementById("foundation-hearts"),

    diamonds:
        document.getElementById("foundation-diamonds"),

    clubs:
        document.getElementById("foundation-clubs"),

    spades:
        document.getElementById("foundation-spades")

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
   WEBISSO CARD DATA
========================================================= */

const CARD_DATA_URL =
    "https://webisso.github.io/playing-cards/cards.json";


let cardData = null;

let cardBaseURL =
    "https://webisso.github.io/playing-cards";


/* =========================================================
   CUSTOM CARD BACK
=========================================================*/

   /*Leave this empty for a plain white card back.

   Later you can simply change it to:

   const CARD_BACK_IMAGE =
       "image/card-back.png";

   or:*/

   const CARD_BACK_IMAGE =
       "https://github.com/ruzrun/Monthniversary/blob/main/photo1.png";

/*========================================================= */

const CARD_BACK_IMAGE = "";


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


/*
   Currently selected cards.
   Used mainly for mobile tap-to-move.
*/

let selectedCards = null;

let selectedSource = null;


/*
   Used for desktop drag-and-drop.
*/

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
   RANDOMISE ARRAY
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

function createCard(
    suit,
    rank
) {

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

    if (
        !cardData ||
        !cardData.cards ||
        !cardData.cards[card.suit] ||
        !cardData.cards[card.suit][card.rank]
    ) {

        return "";

    }


    const path =
        cardData
            .cards[card.suit][card.rank]
            .png;


    return `${cardBaseURL}/${path}`;

}


/* =========================================================
   LOAD CARD DATA
========================================================= */

async function loadCardData() {

    try {

        const response =
            await fetch(
                CARD_DATA_URL
            );


        if (!response.ok) {

            throw new Error(
                "Could not load card data."
            );

        }


        cardData =
            await response.json();


        /*
           Some versions of the data may
           provide their own base URL.
        */

        if (cardData.baseUrl) {

            cardBaseURL =
                cardData.baseUrl;

        }


        newGame();


    } catch (error) {

        console.error(
            "Card data error:",
            error
        );


        updateMessage(
            "Could not load the cards. Please refresh the page."
        );

    }

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
   CREATE EMPTY TABLEAU
========================================================= */

function createEmptyTableau() {

    tableau = [
        [],
        [],
        [],
        [],
        [],
        [],
        []
    ];

}


/* =========================================================
   DEAL KLONDIKE
========================================================= */

function dealCards() {

    createEmptyTableau();


    /*
       Seven tableau columns.

       Column 1 = 1 card
       Column 2 = 2 cards
       ...
       Column 7 = 7 cards

       Only the final card in each
       column is face-up.
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
       become the stock.
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

    if (!cardData) {
        return;
    }


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


    selectedCards = null;

    selectedSource = null;

    draggedCards = null;

    draggedSource = null;


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

    if (!gameStarted) {

        gameStarted = true;

        startTimer();

        startMusic();

    }

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

    if (timerDisplay) {

        timerDisplay.textContent =
            String(
                elapsedTime
            ).padStart(
                3,
                "0"
            );

    }

}


/* =========================================================
   MOVES
========================================================= */

function addMove() {

    moves++;

    updateMoves();

}


function updateMoves() {

    if (movesDisplay) {

        movesDisplay.textContent =
            moves;

    }

}


/* =========================================================
   MESSAGE
========================================================= */

function updateMessage(message) {

    if (gameMessage) {

        gameMessage.textContent =
            message;

    }

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


    image.alt =
        card.faceUp
            ? `${card.rank} of ${card.suit}`
            : "Face-down card";


    /*
       FACE-UP CARD
    */

    if (card.faceUp) {

        image.src =
            getCardImage(card);


        image.draggable =
            true;

    }


    /*
       FACE-DOWN CARD
    */

    else {

        /*
           If the user provides a custom
           image, use it.
        */

        if (CARD_BACK_IMAGE) {

            image.src =
                CARD_BACK_IMAGE;

        }

        /*
           Otherwise use a transparent
           placeholder and let CSS create
           the white card back.
        */

        else {

            image.src =
                "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

            image.classList.add(
                "custom-card-back"
            );

        }


        image.draggable =
            false;

    }


    return image;

}


/* =========================================================
   RENDER STOCK
========================================================= */

function renderStock() {

    stockElement.innerHTML =
        "";


    stockElement.classList.remove(
        "empty"
    );


    if (
        stock.length === 0
    ) {

        stockElement.classList.add(
            "empty"
        );


        /*
           Show recycle symbol when
           stock is empty but waste exists.
        */

        if (
            waste.length > 0
        ) {

            stockElement.textContent =
                "↻";

        }

        return;

    }


    const card =
        {
            suit: "spades",
            rank: "ace",
            faceUp: false
        };


    const image =
        createCardElement(card);


    image.classList.add(
        "stock-card"
    );


    image.classList.add(
        "face-down"
    );


    stockElement.appendChild(
        image
    );


    stockElement.onclick =
        drawFromStock;

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
        (columnElement, columnIndex) => {

            columnElement.innerHTML =
                "";


            const column =
                tableau[columnIndex];


            column.forEach(
                (card, cardIndex) => {

                    const image =
                        createCardElement(card);


                    /*
                       Overlap cards vertically.
                    */

                    image.style.top =
                        `${cardIndex * 28}px`;


                    image.style.zIndex =
                        cardIndex + 1;


                    if (
                        !card.faceUp
                    ) {

                        image.classList.add(
                            "face-down"
                        );

                    }


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
               Allow tapping an empty
               tableau column.
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
               Desktop drag-and-drop.
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
                        !draggedCards
                    ) {

                        return;

                    }


                    moveToTableau(
                        draggedCards,
                        draggedSource,
                        columnIndex
                    );


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

            event.stopPropagation();


            /*
               Face-down tableau card:
               flip it if it is the top card.
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
       DOUBLE CLICK

       Automatically send a single
       card to its foundation.
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
       DESKTOP DRAG START
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
   HANDLE TAP
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
       A card is already selected.

       Try to move the selected cards
       onto this card.
    */

    if (
        selectedCards
    ) {

        /*
           Don't try to move onto
           the exact same card.
        */

        if (
            selectedCards.includes(card)
        ) {

            clearSelection();

            render();

            return;

        }


        let moved = false;


        /*
           A card can be placed onto
           a tableau card.
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
           Foundation.
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


        if (!moved) {

            /*
               The new card becomes
               the new selection.
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


        return;

    }


    /*
       Nothing selected yet.

       Select this card.
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
           All cards from this card
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

       Only the top foundation card
       can be moved back.
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
       Don't move a tableau stack
       onto itself.
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

       Only a King can be placed
       in an empty tableau column.
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
           Must alternate colours.
        */

        if (
            isRed(movingCard) ===
            isRed(target)
        ) {

            return false;

        }


        /*
           Must descend by exactly one.
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
       Reveal the new top card
       of the source column.
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


    /*
       Only a single card can
       enter a foundation.
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
       Foundation starts with Ace.
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
       Otherwise cards must increase
       by exactly one.
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
   REMOVE CARDS FROM SOURCE
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


        const firstIndex =
            column.indexOf(
                cards[0]
            );


        if (
            firstIndex === -1
        ) {

            return;

        }


        column.splice(
            firstIndex,
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
   FLIP TOP CARD
========================================================= */

function flipTopCard(
    columnIndex
) {

    if (
        columnIndex === undefined
    ) {

        return;

    }


    const column =
        tableau[
            columnIndex
        ];


    if (
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
   IS RED?
========================================================= */

function isRed(card) {

    return redSuits.has(
        card.suit
    );

}


/* =========================================================
   HIGHLIGHT SELECTED CARDS
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


    /*
       Find the card elements belonging
       to the selected cards.

       The visual highlight is kept subtle
       so it works with your current design.
    */

    selectedCards.forEach(
        card => {

            const elements =
                document.querySelectorAll(
                    ".card"
                );


            elements.forEach(
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
   FOUNDATION DROP
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

           Select a card first,
           then tap the foundation.
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


                moveCardToFoundation(
                    selectedCards[0],
                    selectedSource
                );

            }
        );

    }
);


/* =========================================================
   WASTE CLICK
========================================================= */

wasteElement.addEventListener(
    "click",
    event => {

        /*
           Clicking the empty waste area
           cancels selection.
        */

        if (
            event.target ===
            wasteElement
        ) {

            clearSelection();

            render();

        }

    }
);


/* =========================================================
   RESTART BUTTON
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

    let total =
        0;


    suits.forEach(
        suit => {

            total +=
                foundations[suit].length;

        }
    );


    if (
        total === 52
    ) {

        winGame();

    }

}


/* =========================================================
   WIN GAME
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

    if (
        !musicEnabled
    ) {

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
   CUSTOM CARD BACK DEFAULT STYLE
========================================================= */

if (
    !document.getElementById(
        "custom-card-back-style"
    )
) {

    const style =
        document.createElement("style");


    style.id =
        "custom-card-back-style";


    style.textContent = `

        .custom-card-back {
            background: white !important;
            object-fit: cover;
        }

    `;


    document.head.appendChild(
        style
    );

}


/* =========================================================
   START
========================================================= */

loadCardData();
