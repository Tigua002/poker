// let cards = [{ suit: 'hearts', rank: `ace`, type: 14 }, { suit: 'hearts', rank: `7`, type: 7 }, { suit: 'hearts', rank: `9`, type: 9 }, { suit: 'hearts', rank: `queen`, type: 12 }, { suit: 'hearts', rank: `10`, type: 10 }]
if (!sessionStorage.getItem("gameID")) {
    window.location.assign("games.html")
}
let cards = []
// let playerHand = [{ suit: 'hearts', rank: `jack`, type: 11 }, { suit: 'hearts', rank: `king`, type: 13}]
//let opponent = [{ suit: 'spades', rank: `jack`, type: 11 }, { suit: 'hearts', rank: `8`, type: 8 }]
// define mixed variables
let playerHand = []
let opponent = []
let pot = 0
let playerbet = 0
let startingBet = 10
let playerBalance = sessionStorage.getItem("balance") || 1000
let turn = 0
let playerID = 2
// define all the possible ways to win
let winCon = [
    { name: "ROYAL FLUSH", rank: 1, combo: "", },
    { name: "STRAIGHT FLUSH", rank: 2, combo: "", },
    { name: "FOUR OF A KIND", rank: 3, combo: "", },
    { name: "FULL HOUSE", rank: 4, combo: "", },
    { name: "FLUSH", rank: 5, combo: "", },
    { name: "STRAIGHT", rank: 6, combo: "", },
    { name: "3 OF A KIND", rank: 7, combo: "", },
    { name: "2 PAIR", rank: 8, combo: "", },
    { name: "PAIR", rank: 9, combo: "", },
    { name: "HIGH CARD", rank: 10, combo: "", },
    { name: "LOW CARD", rank: 11, combo: "", }
]
// getting playerstats from the database with all userinfo 
var playerstats = []
// adding the conditions to the userinfo, don't wnat to take up a lot of space in the database

// setting the deck
let deck = createDeck()

let check = document.getElementById("check")
let raiseBtn = document.getElementById("raise")
let foldBtn = document.getElementById("fold")
// drawing cards for the players
loadPlayers()

// adding event listeners
check.addEventListener("click", call)
raiseBtn.addEventListener('click', raise)






async function loadPlayers() {
    let name = ""
    if (!sessionStorage.getItem("gameID")) {
        window.location.assign("games.html")
    } else {
        name = sessionStorage.getItem("gameID")

    }
    const responce = await fetch("/gameer/" + name,
        {
            method: "GET"
        })
    const game = await responce.json()
    const res = await fetch("/stats",
        {
            method: "GET"
        })
    const stats = await res.json()
    for (let i = 0; i < game.length; i++) {
        for (let x = 0; x < stats.length; x++) {
            if (stats[x].username == game[i].username) {
                playerstats.push(stats[x])
            }

        }
    }
    for (let i = 0; i < playerstats.length; i++) {
        playerstats[i].conditions = JSON.parse(JSON.stringify(winCon))
        playerstats[i].playerID = i
        playerstats[i].bestCombo = {}
        playerstats[i].combined = []
        playerstats[i].hand = []
        playerstats[i].folded = false
        if (sessionStorage.getItem("username") == JSON.parse(sessionStorage.getItem("game")).host) {
            drawHand(playerstats[i].hand)
        }
        if (playerstats[i].username == sessionStorage.getItem("username") && playerstats[i].playerID == turn) {
            enableBtns()
        }
    }
    if (sessionStorage.getItem("username") == JSON.parse(sessionStorage.getItem("game")).host) {
        // sets the data the server will need
        const data = {
            playerstats: JSON.stringify(playerstats)
        }
        // sends the data to the database
        fetch("/draw/cards", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
    }
    setTimeout(2000, loadCards)
}


async function loadCards() {
    // setter stares as the response from the stats table
    const stares = await fetch("/stats",
        {
            method: "GET"
        })
    // sets the variable stats = the stats of all players
    const stats = await stares.json()
    for (let i = 0; i < stats.length; i++) {
        for (let x = 0; x < playerstats.length; x++) {
            if (playerstats[x].username == sessionStorage.getItem("username") && sessionStorage.getItem("username") == stats[i].username) {
                playerstats[x].hand = JSON.parse(stats[i].hand)
                updateHand()
            }

        }


    }
}
// creating the deck
function createDeck() {
    // defining deck
    let deck = []
    // setting x
    let x = 1
    // for loop to add all the cards
    for (let i = 0; i < 13; i++) {
        x++
        if (x == 11) {
            deck.push({ suit: 'hearts', rank: `jack`, type: x },)
            deck.push({ suit: 'clubs', rank: `jack`, type: x },)
            deck.push({ suit: 'diamonds', rank: `jack`, type: x },)
            deck.push({ suit: 'spades', rank: `jack`, type: x },)
        } else if (x == 12) {
            deck.push({ suit: 'hearts', rank: `queen`, type: x },)
            deck.push({ suit: 'clubs', rank: `queen`, type: x },)
            deck.push({ suit: 'diamonds', rank: `queen`, type: x },)
            deck.push({ suit: 'spades', rank: `queen`, type: x },)
        } else if (x == 13) {
            deck.push({ suit: 'hearts', rank: `king`, type: x },)
            deck.push({ suit: 'clubs', rank: `king`, type: x },)
            deck.push({ suit: 'diamonds', rank: `king`, type: x },)
            deck.push({ suit: 'spades', rank: `king`, type: x },)
        } else if (x == 14) {
            deck.push({ suit: 'hearts', rank: `ace`, type: x },)
            deck.push({ suit: 'clubs', rank: `ace`, type: x },)
            deck.push({ suit: 'diamonds', rank: `ace`, type: x },)
            deck.push({ suit: 'spades', rank: `ace`, type: x },)
        } else {
            deck.push({ suit: 'hearts', rank: `${x}`, type: x },)
            deck.push({ suit: 'clubs', rank: `${x}`, type: x },)
            deck.push({ suit: 'diamonds', rank: `${x}`, type: x },)
            deck.push({ suit: 'spades', rank: `${x}`, type: x },)
        }
    }
    // returning the deck
    return deck
}




// draw card funcition
function drawCard() {
    // setting a random number
    let number = Math.floor(Math.random() * deck.length);
    // getting the card from the deck
    let card = deck[number]
    // removing the card from the deck
    deck.splice(number, 1)
    // returning the card
    return card
}
// drawing hand function
function drawHand(hand) {
    // checking if hand is empty
    if (hand.length == 0) {
        // drawing 2 cards
        hand.push(drawCard())
        hand.push(drawCard())
        // updating playerhand
    }
}

// function i need to remove / useless function
function updateHand() {
    console.log("e");
    for (let i = 0; i < playerstats.length; i++) {
        console.log(playerstats[i].username);
        console.log(playerstats[i]);
        if (playerstats[i].username == sessionStorage.getItem("username")) {
            document.getElementsByClassName("card")[playerstats[i].playerID * 2].src = "kort/" + playerstats[i].hand[0].rank + "_of_" + playerstats[i].hand[0].suit + ".svg"
            document.getElementsByClassName("card")[playerstats[i].playerID * 2 + 1].src = "kort/" + playerstats[i].hand[1].rank + "_of_" + playerstats[i].hand[1].suit + ".svg"
        }

    }
    // document.getElementsByClassName("card")[card1].src = "kort/" + hand[0].rank + "_of_" + hand[0].suit + ".svg"
    // document.getElementsByClassName("card")[card2].src = "kort/" + hand[1].rank + "_of_" + hand[1].suit + ".svg"
}
// shows all of the opponents hands
function showOpp() {
    // for loop which runs for each player in the game
    for (let i = 0; i < playerstats.length; i++) {
        // shows their cards
        document.getElementsByClassName("card")[playerstats[i].playerID * 2].src = "kort/" + playerstats[i].hand[0].rank + "_of_" + playerstats[i].hand[0].suit + ".svg"
        document.getElementsByClassName("card")[playerstats[i].playerID * 2 + 1].src = "kort/" + playerstats[i].hand[1].rank + "_of_" + playerstats[i].hand[1].suit + ".svg"
    }
}



// function to call
function call() {
    // disabling the button after use
    disableBtns()
    // updating the turn variable

    turn++
    // and resetting it if it is larger than the amount of players
    if (turn > playerstats.length - 1) {
        turn = 0
    }
    // updateing player balance
    document.getElementById("playerBalance").innerHTML = playerBalance
    if (cards.length < 5 && sessionStorage.getItem("username") == JSON.parse(sessionStorage.getItem("game")).host && cards.length != 0) {
        // checking the amount of cards on the table
        gameStart(cards.length)
    } else {
        // if all cards are on the table we show the cards
        showOpp()
        // we check the winner
        let winner = checkWinner()
        // decide from 
        if (winner == "draw") {
            return
        } else if (winner == "player") {

        }
    }
    if (sessionStorage.getItem("username") == JSON.parse(sessionStorage.getItem("game")).host) {
        const data = {
            deck: JSON.stringify(deck),
            code: sessionStorage.getItem("gameID"),
            turn: turn
        }
        // sends the data to the database

        fetch("/save/cards", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
    } else {
        const data = {
            code: sessionStorage.getItem("gameID"),
            turn: turn
        }
        // sends the data to the database

        fetch("/save/turn", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
    }

}


// updating game hand
function updateGameHand(slot) {
    document.getElementsByClassName("playcard")[slot].src = "kort/" + cards[slot].rank + "_of_" + cards[slot].suit + ".svg"
}
// staring the game and drawing a card
function gameStart(slot) {
    // adding the cards to the array
    cards.push(drawCard())
    // updateing the table
    updateGameHand(slot)
    // disabling the check button

    for (let i = 0; turn == playerstats[i].playerID; i += 0) {

    }

}
// raise function
function raise() {
    // alerts the user and asks the amount they want to raise by
    let amount = parseInt(prompt("How much would you like to raise by?"))
    // checks is it is a number
    if (isNaN(amount)) {
        // returns the error message to the user
        alert("The input is not a number")
        raise()
        return
        // check if the user can afford id
    } else if (amount > playerBalance) {
        // alert the error message
        alert("Amount too large you don't have enough money")
        raise()
        return
    }
    // updateing the pot
    pot += amount
    // reducing the playerbalance
    playerBalance -= amount
    // updateing the playerbet
    playerbet += amount
    // updateing the value the user sees
    document.getElementById("playerBalance").innerHTML = playerBalance
    // updates the values
    document.getElementById("pot").innerHTML = pot

}
// checking for flush taking the arguments which suit, hand, contidion
function checkSuits(argument, hand, con) {
    // defining the amount of the cards of the same suit
    let suit = 0
    // for loop going for each in the hand
    for (let i = 0; i < hand.length; i++) {
        // checking the suit of the card to the argument
        if (hand[i].suit == argument) {
            // incrementing the value
            suit++
        }
    }
    // if user has flush, then we update the combo
    if (suit >= 5) {
        con[4].combo = argument
    }
}
// the funksion combining the hand and the cards on the table
function combine(hand, combined) {
    // resetting the variable to prevent clogging
    combined = []
    // for loop adding "hand" to the combined array
    for (let i = 0; i < hand.length; i++) {
        combined.push(hand[i])
    }
    // for loop adding "cards" array to combined array
    for (let i = 0; i < cards.length; i++) {
        combined.push(cards[i])
    }
    // returning the combined array
    return combined
}
// checking for most combinations
function pairs(hand, con, combined) {
    // combining the hand and the cards arrays
    combined = combine(hand, combined)

    // setting the variables
    let pairs = 0
    let trees = 0
    let fours = 0

    // for loop going through all the cards
    for (let i = 0; i < combined.length; i++) {
        // for loop going through all the cards
        for (let x = 0; x < combined.length; x++) {
            // a skip to prevent the if to compare a card to itself 
            if (x != i) {
                // for loop going through all the cards
                for (let y = 0; y < combined.length; y++) {
                    // a skip to prevent the if to compare a card to itself
                    if (x != y && y != i) {
                        // for loop going through all the cards
                        for (let z = 0; z < combined.length; z++) {
                            // a skip to prevent the if to compare a card to itself
                            if (z != x && z != y && z != i) {
                                // checking if the player has 4 of a kind
                                if (combined[x].rank == combined[z].rank && combined[z].rank == combined[i].rank && combined[z].rank == combined[y].rank) {
                                    // incrementing the value
                                    fours += 1
                                    // updating the combo
                                    con[2].combo = combined[i].type
                                    // removing the card to prevent overlapping
                                    combined.splice(i, 1)
                                }
                            }
                        }
                        // checking if the player has 3 of a kind
                        if (combined[x].rank == combined[y].rank && combined[i].rank == combined[y].rank) {
                            // increments the value
                            trees += 1
                            // updates the combo
                            con[6].combo = combined[i].type
                            // removing the card to prevent overlapping
                            combined.splice(i, 1)
                        }
                    }
                }
                // checking if the card exists
                if (combined[i]) {
                    // checking if the player has pairs
                    if (combined[x].type == combined[i].type) {
                        // increments the value
                        pairs += 1
                        // checking if the player has more than 2 pairs
                        if (pairs >= 2) {
                            // update the  combo value
                            con[7].combo = combined[i].type
                        } else {
                            // update the combo value
                            con[8].combo = combined[i].type
                        }
                        // removes the card to prevent overlapping
                        combined.splice(i, 1)
                    }
                }
            }
        }
    }

    // resetting the combined value since i removed it earlier
    combined = combine(hand, combined)
    // sorting the funktion so the lowest is at the bottom and the highest is first
    combined.sort(function (a, b) { return b.type - a.type })
    // reversing the array so the lowerst values are first
    combined.reverse()
    // for loop going through every card in combined
    for (let i = 0; i < combined.length; i++) {
        // checking if combined i + 4 exists
        if (combined[i + 4]) {
            // checking if all the types the player has 5 
            if (combined[i].type + 1 == combined[i + 1].type && combined[i].type + 2 == combined[i + 2].type && combined[i].type + 3 == combined[i + 3].type && combined[i].type + 4 == combined[i + 4].type) {
                // setting the combo
                con[5].combo = combined[i + 4].type
            }
        } else {
            // if the number is too great we break the for loop to prevent extra time spend
            break
        }


    }

    // reversing the "combined array" to sort the highest card to the top
    combined.reverse()


    // updateing the "high cards" and "low cards" values 
    con[9].combo = combined[0].type
    con[10].combo = combined[1].type


    // checking if the player has flush
    checkSuits("hearts", combined, con)
    checkSuits("clubs", combined, con)
    checkSuits("diamonds", combined, con)
    checkSuits("spades", combined, con)
    // returning the highest value of the cards
    if (con[4].combo != "" && con[5].combo == 14) {
        con[0].combo = con[4].combo
        return con[0]
    } else if (con[4].combo != "" && con[5].combo != "") {
        con[1].combo = con[4].combo + con[5].combo
        return con[1]
    } else if (fours >= 1) {
        return con[2]
    } else if (pairs > 1 && trees > 0) {
        con[3].combo = con[6].combo
        return con[3]
    } else if (con[4].combo != "") {
        return con[4]
    } else if (con[5].combo != "") {
        return con[5]
    } else if (trees > 0) {
        return con[6]
    } else if (pairs > 1) {
        return con[7]
    } else if (pairs > 0) {
        return con[8]
    } else {
        return con[9]
    }
}


function fold() {

}
// checking the winner
function checkWinner() {
    for (let i = 0; i < playerstats.length; i++) {
        playerstats[i].bestCombo = pairs(playerstats[i].hand, playerstats[i].conditions, playerstats[i].combined)

    }

    let winner = "draw"
    if (playerScore.rank < oppScore.rank) {
        alert("Player wins with a " + playerScore.name)
        winner = "player"

    } else if (playerScore.rank > oppScore.rank) {
        alert("Opponent wins with a " + oppScore.name)
        winner = "opponent"

    } else if (playerScore.rank == oppScore.rank && playerScore.rank == 8) {
        if (winCon[9].combo > oppCon[9].combo) {
            alert("Player wins with a " + playerScore.name)
            winner = "player"

        } else if (winCon[9].combo < oppCon[9].combo) {
            alert("Opponent wins with a " + oppScore.name)
            winner = "opponent"

        }
    } else {
        if (playerScore.combo > oppScore.combo) {
            alert("Player wins with a " + playerScore.name)
            winner = "player"

        } else if (playerScore.combo < oppScore.combo) {
            alert("Opponent wins with a " + oppScore.name)
            winner = "opponent"

        } else if (playerScore.combo == oppScore.combo) {
            if (winCon[10].combo > oppCon[10].combo) {
                alert("Player wins with a " + playerScore.name)
                winner = "player"

            } else if (winCon[10].combo < oppCon[10].combo) {
                alert("Opponent wins with a " + oppScore.name)
                winner = "opponent"

            } else if (winCon[10].combo == oppCon[10].combo) {
                if (winCon[11].combo > oppCon[11].combo) {
                    alert("Player wins with a " + playerScore.name)
                    winner = "player"

                } else if (winCon[11].combo < oppCon[11].combo) {
                    alert("Opponent wins with a " + oppScore.name)
                    winner = "opponent"
                } else {
                    alert("It is a tie")
                    winner = "draw"
                }
            }
        }
    }
    return winner

}

function checkTurns() {
    for (let i = 0; i < playerstats.length; i++) {
        if (turn == playerstats[i].playerID) {
            enableBtns()
            return
        }

    }
    disableBtns()
}
// disables the different button
function disableBtns() {
    check.disabled = true
    raiseBtn.disabled = true
    foldBtn.disabled = true
}
// enables the different button
function enableBtns() {
    check.disabled = false
    raiseBtn.disabled = false
    foldBtn.disabled = false
}

async function checkChanges() {
    // getting the unique game code from sessionstorage
    let name = sessionStorage.getItem("gameID")
    // requests the database for all info about the game    
    const responce = await fetch("/single/games/" + name,
        {
            method: "GET"
        })
    // sets game as the value we recieve from the database
    const game = await responce.json()
    console.log(game[0]);
    console.log(JSON.parse(sessionStorage.getItem("game")));
    if (JSON.stringify(game[0]) != sessionStorage.getItem("game")){
        sessionStorage.setItem("game", JSON.stringify(game[0]))

    } else{
        return
    }
    checkTurns()
}

