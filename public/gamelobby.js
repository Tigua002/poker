// function for loading the game
async function loadGame() {
    // getting all the games from the database
    const res = await fetch("/games",
        {
            method: "GET"
        })
    // setting games as the responce
    const games = await res.json()
    // getting the gameID which we set earlier either in gamecrate of games
    if (sessionStorage.getItem("gameID")) {
        // goes throgh each game in games
        for (let i = 0; i < games.length; i++) {
            // if the gameName of a certain game is the same we wish to find
            if (games[i].gameName == sessionStorage.getItem("gameID")) {
                // we set the game in sessionstorage as game for later use
                sessionStorage.setItem("game", JSON.stringify(games[i]))
                // updates the title to be the gamename
                document.getElementsByClassName("gameTitle")[0].innerHTML = "Game Name: " + games[i].gameName
                // asks the database for all info in this game
                let name = games[i].gameName
                const responce = await fetch("/gameer/" + name,
                    {
                        method: "GET"
                    })
                // sets the game as the responce
                const game = await responce.json()
                // sets game as gameStats in sessionstorage for later use
                sessionStorage.setItem("gameStats", JSON.stringify(game))
                // updates the title to fit the amount of players
                document.getElementById("gameAmount").innerHTML = "Players: " + game.length
                // for loop going though each player in the current game
                for (let x = 0; x < game.length; x++) {
                    // defines the parent Element
                    let element = document.getElementsByClassName("players")[0]
                    // creating elements
                    let holder = document.createElement("div")
                    let username = document.createElement("h1")
                    let rank = document.createElement("h1")
                    let balance = document.createElement("h1")

                    // setting classes
                    holder.setAttribute("class", "player")
                    username.setAttribute("class", "username")
                    rank.setAttribute("class", "rank")
                    balance.setAttribute("class", "balance")

                    // setting other values
                    username.innerHTML = game[x].username
                    if (games[i].host == game[x].username) {
                        rank.innerHTML = "host"
                    } else {
                        rank.innerHTML = "member"
                    }

                    balance.innerHTML = game[x].balance

                    // append the elements to other elements
                    holder.appendChild(username)
                    holder.appendChild(rank)
                    holder.appendChild(balance)

                    element.appendChild(holder)
                }
            }
            // checks if the player is the game host 
            if (games[i].host == sessionStorage.getItem("username")) {
                // creates a separate button for the host which startes the game
                let button = document.createElement("h1")
                button.setAttribute("class", "startGameBtn")
                button.innerHTML = "START GAME"
                document.getElementsByClassName("players")[0].appendChild(button)
                button.addEventListener("click", startGame)
            }
        }

    }

}

// function for leaving the game
async function leave() {
    // getting game from sessionstorage
    let game = JSON.parse(sessionStorage.getItem("game"))
    // setts host as false by defalut
    let host = false
    // checks if the player is the host
    if (game.host == sessionStorage.getItem("username")) {
        host = true
        console.log("the player is the host");
    } else {
        console.log("the player is not the host");
    }
    // prepares the data to be sent to the database
    const data = {
        code: sessionStorage.getItem("gameID"),
        username: sessionStorage.getItem("username"),
        host: host
    }
    // sends the data to the database
    fetch("/leave/game", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    // removes gameID from session storage
    sessionStorage.removeItem("gameID")
    // moves the player to games.html
    window.location.assign("games.html")
}

// function for starting the game
function startGame() {
    // getts the game from sessionstorage
    let games = JSON.parse(sessionStorage.getItem("game"))
    // checks if the player is the host, to prevent others from highjacking the game
    if (games.host == sessionStorage.getItem("username")) {
        // prepares the data to be sent to the database
        const data = {
            code: sessionStorage.getItem("gameID"),
        }
        // sending the data to the database
        fetch("/start/game", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
    }
}

// function for auto updating the lobby
async function updateData() {
    // getting the unique game code from sessionstorage
    let name = sessionStorage.getItem("gameID")
    // requests the database for all info about the game    
    const responce = await fetch("/gameer/" + name,
        {
            method: "GET"
        })
    // sets game as the value we recieve from the database
    const game = await responce.json()
    // getting the gameStats which we set earlier 
    let gameStats = JSON.parse(sessionStorage.getItem("gameStats"))
    // and comparing the new data to the old data
    if (JSON.stringify(game) === JSON.stringify(gameStats)) {
    } else {
        // if there has been any changes to the data we resett the playerHolder
        document.getElementsByClassName("players")[0].innerHTML = `
        <h1 class="gameTitle"></h1>
        <h1 id="gameAmount"></h1>`
        // and run loadGame over again
        loadGame()
    }
    // checks whether the game has started 
    for (let i = 0; i < game.length; i++) {
        // and if it has, we send the user to index.html
        if (sessionStorage.getItem("username") == game[i].username && game[i].status == "playing") {
            window.location.assign("index.html")
        }
        
    }

}
// checks if the player has joined a game to load
if (sessionStorage.getItem("gameID")) {
    // if so, we start everything
    document.getElementById("leave").addEventListener("click", leave)
    loadGame()

    setInterval(updateData, 2000)
    // if not, we move the player to games.html for him to join a game
} else { 
    window.location.assign("games.html")
}

