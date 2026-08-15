/* =========================================================
   SOLITAIRE 🃏
   Classic Klondike Solitaire
   Arcade Style
========================================================= */


/* =========================================================
   DOM
========================================================= */

const board = document.getElementById("solitaireBoard");

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
   WEBISSO CARDS
========================================================= */

const CARD_DATA_URL =
    "https://webisso.github.io/playing-cards/cards.json";

let cardData = null;

let cardBaseURL =
    "https://webisso.github.io/playing-cards";


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

let selectedCards = null;

let selectedSource = null;

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
   FETCH CARD DATA
========================================================= */

async function loadCardData() {

    try {

        const response =
            await fetch(
                CARD_DATA_URL
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load card data."
            );

        }


        cardData =
            await response.json();


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


        if (gameMessage) {

            gameMessage.textContent =
                "Could not load the cards. Please refresh the page.";

        }

    }

}


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
   CARD IMAGE URL
========================================================= */

function getCardImage(
    card
) {

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
   START NEW GAME
========================================================= */

function newGame() {

    if (!cardData) {
        return;
    }


    stopTimer();


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
   DEAL KLONDIKE
========================================================= */

function dealCards() {

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
        deck.splice(
            0
        );


    stock.forEach(
        card => {

            card.faceUp = false;

        }
    );

}


/* =========================================================
   START TIMER
========================================================= */

function startTimer() {

    if (timerInterval) {
        return;
    }


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


/* =========================================================
   STOP TIMER
========================================================= */

function stopTimer() {

    if (timerInterval) {

        clearInterval(
            timerInterval
        );

        timerInterval =
            null;

    }

}


/* =========================================================
   UPDATE TIMER
========================================================= */

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
   UPDATE MOVES
========================================================= */

function updateMoves() {

    if (movesDisplay) {

        movesDisplay.textContent =
            moves;

    }

}


/* =========================================================
   ADD MOVE
========================================================= */

function addMove() {

    moves++;

    updateMoves();

}


/* =========================================================
   UPDATE MESSAGE
========================================================= */

function updateMessage(
    message
) {

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
   CREATE IMAGE
========================================================= */

function createCardImage(
    card
) {

    const image =
        document.createElement("img");


    image.className =
        "card";


    image.alt =
        `${card.rank} of ${card.suit}`;


    image.draggable =
        card.faceUp;


    if (card.faceUp) {

        image.src =
            getCardImage(card);

    } else {

        /*
            Use the first card as
            the back image source.

            We flip it using CSS.
        */

        image.src =
            getCardImage(
                {
                    suit: "spades",
                    rank: "ace"
                }
            );

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

    stockElement.innerHTML =
        "";


    if (stock.length === 0) {

        stockElement.classList.add(
            "empty"
        );

        return;

    }


    stockElement.classList.remove(
        "empty"
    );


    const cardImage =
        createCardImage(
            {
                suit: "spades",
                rank: "ace",
                faceUp: false
            }
        );


    cardImage.classList.add(
        "stock-card"
    );

    cardImage.classList.add(
        "face-down"
    );


    stockElement.appendChild(
        cardImage
    );


    stockElement.onclick =
        drawFromStock;

}


/* =========================================================
   DRAW FROM STOCK
========================================================= */

function drawFromStock() {

    if (gameWon) {
        return;
    }


    ensureGameStarted();


    clearSelection();


    if (stock.length > 0) {

        const card =
            stock.pop();


        card.faceUp =
            true;


        waste.push(
            card
        );


        addMove();

    } else if (waste.length > 0) {

        /*
            Recycle waste back
            into the stock.
        */

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
        waste[waste.length - 1];


    const image =
        createCardImage(card);


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
                pile[pile.length - 1];


            const image =
                createCardImage(card);


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
                        createCardImage(card);


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

        }
    );

}


/* =========================================================
   CARD INTERACTIONS
========================================================= */

function addCardInteraction(
    element,
    card,
    source
) {

    /*
        CLICK
    */

    element.addEventListener(
        "click",
        event => {

            event.stopPropagation();


            if (
                !card.faceUp
            ) {

                if (
                    source.type ===
                    "tableau"
                ) {

                    flipTopCard(
                        source.column
                    );

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


            moveCardToFoundation(
                card,
                source
            );

        }
    );


    /*
        DRAG START
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

        }
    );


    /*
        TOUCH / POINTER
    */

    element.addEventListener(
        "pointerdown",
        event => {

            if (
                event.pointerType ===
                "mouse"
            ) {
                return;
            }


            if (
                !card.faceUp
            ) {
                return;
            }


            selectedCards =
                getMovableCards(
                    card,
                    source
                );


            if (
                selectedCards.length === 0
            ) {

                selectedCards = null;

                return;

            }


            selectedSource =
                source;


            ensureGameStarted();

        }
    );

}


/* =========================================================
   CARD CLICK LOGIC
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
        If another card is selected,
        attempt to move this card.
    */

    if (selectedCards) {

        const moved =
            tryMoveSelected(
                source
            );


        if (moved) {

            clearSelection();

            render();

            checkWin();

            return;

        }


        clearSelection();

    }


    /*
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
            Every card below the
            selected card must be face up.
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


    return [];

}


/* =========================================================
   TRY MOVE SELECTED
========================================================= */

function tryMoveSelected(
    destination
) {

    if (
        !selectedCards ||
        selectedCards.length === 0
    ) {

        return false;

    }


    const movingCard =
        selectedCards[0];


    /*
        Move to tableau
    */

    if (
        destination.type ===
        "tableau"
    ) {

        return moveToTableau(
            selectedCards,
            selectedSource,
            destination.column
        );

    }


    /*
        Move to foundation
    */

    if (
        destination.type ===
        "foundation"
    ) {

        if (
            selectedCards.length !== 1
        ) {

            return false;

        }


        return moveCardToFoundation(
            movingCard,
            selectedSource
        );

    }


    /*
        Clicking a card in waste
        that is not a destination
        should not move.
    */

    return false;

}


/* =========================================================
   MOVE TO TABLEAU
========================================================= */

function moveToTableau(
    cards,
    source,
    destinationColumn
) {

    const destination =
        tableau[
            destinationColumn
        ];


    const movingCard =
        cards[0];


    /*
        Cannot move onto itself.
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
        Check destination.
    */

    if (
        destination.length === 0
    ) {

        /*
            Only Kings can move
            to an empty column.
        */

        if (
            movingCard.value !== 13
        ) {

            return false;

        }

    } else {

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


    flipTopCard(
        source.column
    );


    addMove();

    clearSelection();

    render();

    checkWin();

    return true;

}


/* =========================================================
   MOVE CARD TO FOUNDATION
========================================================= */

function moveCardToFoundation(
    card,
    source
) {

    if (
        source.type !== "tableau" &&
        source.type !== "waste"
    ) {

        return false;

    }


    if (
        !card.faceUp
    ) {

        return false;

    }


    /*
        Make sure the card is
        actually movable.
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


    if (
        foundation.length === 0
    ) {

        /*
            Foundations must start
            with an Ace.
        */

        if (
            card.value !== 1
        ) {

            return false;

        }

    } else {

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


    if (
        source.type ===
        "waste"
    ) {

        waste.pop();

    }

}


/* =========================================================
   FLIP TOP TABLEAU CARD
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
   CHECK CARD COLOUR
========================================================= */

function isRed(card) {

    return redSuits.has(
        card.suit
    );

}


/* =========================================================
   HIGHLIGHT SELECTED
========================================================= */

function highlightSelectedCards() {

    const images =
        document.querySelectorAll(
            ".card"
        );


    images.forEach(
        image => {

            image.classList.remove(
                "moving"
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
            card => {

                card.classList.remove(
                    "moving"
                );

            }
        );

}


/* =========================================================
   CLICK TABLEAU EMPTY SPACE
========================================================= */

document
    .querySelectorAll(".tableau-column")
    .forEach(
        (columnElement, index) => {

            columnElement.addEventListener(
                "click",
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
                            tryMoveSelected(
                                {
                                    type: "tableau",
                                    column: index
                                }
                            );


                        if (
                            moved
                        ) {

                            clearSelection();

                            render();

                        } else {

                            clearSelection();

                        }

                    }

                }
            );

        }
    );


/* =========================================================
   DRAG AND DROP TABLEAU
========================================================= */

document
    .querySelectorAll(".tableau-column")
    .forEach(
        (columnElement, index) => {

            columnElement.addEventListener(
                "dragover",
                event => {

                    event.preventDefault();

                    event.dataTransfer.dropEffect =
                        "move";

                }
            );


            columnElement.addEventListener(
                "drop",
                event => {

                    event.preventDefault();


                    if (
                        !draggedCards
                    ) {

                        return;

                    }


                    const moved =
                        moveToTableau(
                            draggedCards,
                            draggedSource,
                            index
                        );


                    clearSelection();


                    if (
                        moved
                    ) {

                        render();

                    }

                }
            );

        }
    );


/* =========================================================
   DROP FOUNDATION
========================================================= */

suits.forEach(
    suit => {

        const element =
            foundationElements[suit];


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
                    !draggedCards ||
                    draggedCards.length !== 1
                ) {

                    clearSelection();

                    return;

                }


                moveCardToFoundation(
                    draggedCards[0],
                    draggedSource
                );


                clearSelection();

            }
        );


        element.addEventListener(
            "click",
            () => {

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
   WASTE DROP
========================================================= */

wasteElement.addEventListener(
    "click",
    () => {

        /*
            Clicking waste when another
            card is selected cancels selection.
        */

        if (
            selectedCards
        ) {

            clearSelection();

            render();

        }

    }
);


/* =========================================================
   RESTART
========================================================= */

restartButton.addEventListener(
    "click",
    () => {

        newGame();

    }
);


if (winRestartButton) {

    winRestartButton.addEventListener(
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

    let totalFoundationCards = 0;


    suits.forEach(
        suit => {

            totalFoundationCards +=
                foundations[suit].length;

        }
    );


    if (
        totalFoundationCards === 52
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


    updateMessage(
        `You won! 🎉 ${moves} moves • ${elapsedTime}s`
    );


    showWinOverlay();

}


/* =========================================================
   SHOW WIN
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


/* =========================================================
   HIDE WIN
========================================================= */

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
   INITIALISE
========================================================= */

loadCardData();
