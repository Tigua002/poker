// function for loading all the different games
async function loadGames() {
    // getting the games from the database
    const res = await fetch("/games",
        {
            method: "GET"
        })
    // setting the variable games as the result
    const games = await res.json()
    // setting the games in sessionstorage for later use
    sessionStorage.setItem("allGames", JSON.stringify(games))
    // going through each game in games
    for (let i = 0; i < games.length; i++) {
        // checks if the privacy is pulic and whether the game has started
        if (games[i].privacy == "public" && games[i].status == "waiting") {
            // sets element as the game holder
            let element = document.getElementById("gameHolder")
            // setting name as the unique game name
            let name = games[i].gameName
            // sending a request to the server and asking for all data in the unique table
            const responce = await fetch("/gameer/" + name,
                {
                    method: "GET"
                })
            // setting game as the result (not games)
            const game = await responce.json()
            // making all the differnt elements
            let holder = document.createElement("div")
            let host = document.createElement("h1")
            let gameName = document.createElement("h1")
            let players = document.createElement("h1")
            let Button = document.createElement("h1")

            // assigning classes
            holder.setAttribute("class", "games")
            host.setAttribute("class", "host")
            gameName.setAttribute("class", "gameName")
            players.setAttribute("class", "playerAmount")
            Button.setAttribute("class", "joingame")

            // setting other values
            host.innerHTML = games[i].host
            gameName.innerHTML = name
            players.innerHTML = game.length
            Button.innerHTML = "JOIN"
            Button.addEventListener("click", joinGame)

            // appending the elements to the parent elements
            holder.appendChild(host)
            holder.appendChild(gameName)
            holder.appendChild(players)
            holder.appendChild(Button)
            element.appendChild(holder)

        }

    }
}

// the join game function
async function joinGame(event) {
    if (!sessionStorage.getItem("username")) {
        sessionStorage.setItem("username", "guest")
    }
    // sets gamecode as the unique code for the game the users wishes to join
    let gamecode = event.target.parentElement.getElementsByClassName("gameName")[0].innerHTML
    // getting all the games from the database
    const res = await fetch("/games",
        {
            method: "GET"
        })
    // assinging games as the database responce
    const games = await res.json()
    // going through each game in the table games
    for (let i = 0; i < games.length; i++) {
        // checks if the gameName of the table = gameCode the user wishes to joni
        if (games[i].gameName == gamecode) {
            // prepares the data to be sent
            const data = {
                code: gamecode,
                userID: sessionStorage.getItem("userID"),
                username: sessionStorage.getItem("username"),
                balance: sessionStorage.getItem("balance")
            }
            // sending all the different data to the database
            fetch("/join/game", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            // setting the gamecode in sessionstorage to be user later
            sessionStorage.setItem("gameID", gamecode)
            // sending the user to gamelobby.hmtl
            window.location.assign("gamelobby.html")
        }
    }

}
// function for updating data
async function updateData() {
    // asks the database for all the games
    const res = await fetch("/games",
        {
            method: "GET"
        })
    // setting games as the database responce
    const games = await res.json()
    // checking if the current table = the previous table (in loadGame function)
    if (JSON.stringify(games) == sessionStorage.getItem("allGames")) {
        // logs same if they are the same
        console.log("same");
    } else {
        console.log("updated");
        // if not then we resett the gameHolder element
        document.getElementById("gameHolder").innerHTML = `
        <div class="titleHolder">
            <h1 class="title">AVAILABLE GAMES</h1>
            <a href="gamecreate.html">
                <h1 class="gameBtn">CREATE GAME</h1>
            </a>
        </div>`
        // and call loadGames over again to refresh any updates
        loadGames()
    }
}
// calling loadGames
loadGames()
// setting intervals to periodicly check for updates
setInterval(updateData, 2000)