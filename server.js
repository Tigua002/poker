// laster inn all node.js modulene
const express = require('express')
const app = express();
const bodyParser = require('body-parser');
// definerer porten jeg skal bruke
const PORT = 5000;
app.listen(PORT, () => console.log(`Server is running on this port: ${PORT}`));
const mysql = require('mysql');
// test databasen
const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'admin',
    database: 'poker'
});
// min andre database/ den offisielle databasen
// const connection = mysql.createConnection({
//     host: '172.104.241.199',
//     user: 'u2_oU6US3v3uE',
//     password: '9BTXU@6o=UvwZafXyxu6W6ff',
//     database: 's2_poker'
// });
// connecter til databasen
connection.connect();
// andre nødvendige kommandoer
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
const path = require("path");
const e = require('express');
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + "/public/index.html"))
})


// post "/create/user/"
app.post("/create/user/", function (req, res) {
    // skaffer user og passord fra data-en og gir dem en verdi
    let user = req.body.user
    let passord = req.body.passord
    // legger til brukeren i users "table"
    connection.query(`INSERT INTO users (username, password) VALUES ("${user}", "${passord}")`)
    // henter brukeren fra datasen for å så legge han til i stats tabellen
    connection.query(`SELECT * FROM users`, function (err, result, fields) {
        let info = JSON.parse(JSON.stringify(result))
        let user = req.body.user
        for (let i = 0; i < info.length; i++) {
            if (user == info[i].username) {
                connection.query(`INSERT INTO stats (playerID, username, balance, hand, currentbet, conditions, bestCombo, combined, folded) VALUES(${info[i].playerID}, "${user}", 1000, "[]", 0, "[]", "{}", "[]", 0)`)
            }
        }
    })

})
// lager et spill
app.post("/create/game/", function (req, res) {
    // henter all data-en fra scriptet
    let user = req.body.username
    let userID = req.body.userID
    let balance = req.body.balance
    let name = req.body.name
    let code = req.body.password
    let privacy = req.body.privacy
    // legger til spiller i alle sine tabeller
    connection.query(`CREATE TABLE ${name} (playerID INT, username VARCHAR (100), balance INT, status VARCHAR(50))`)
    connection.query(`INSERT INTO games VALUES ("${name}", "${user}", "${code}", "${privacy}", "waiting", "[]", 0)`)
    connection.query(`INSERT INTO ${name} VALUES (${userID}, "${user}", ${balance}, "waiting")`)
    connection.query(`UPDATE users SET gameName = "${code}" WHERE username = "${user}"`)
    res.send(name)

})
// blir med på et spill
app.post("/join/game/", function (req, res) {
    // får all information fra "body"
    let code = req.body.code
    let username = req.body.username
    let userID = req.body.userID
    let balance = req.body.balance
    // skjekker om brukeren har et brukerenavn hvis ikke logger han inn som gjest
    if (username == null) {
        username = "guest"
    }
    if (balance == null) {
        balance = 1000
    }
    // opdaterer databasen og legger til brukeren i de forskjellige tabellene
    connection.query(`INSERT INTO ${code} (playerID, username, balance, status) VALUES (${userID}, "${username}", ${balance}, "waiting")`)
    connection.query(`UPDATE users SET gameName = "${code}" WHERE username = "${username}"`)
})

// code for å forlate et spill
app.post("/leave/game/", function (req, res) {
    // henter data fra scriptet
    let code = req.body.code
    let username = req.body.username
    let host = req.body.host
    // skjekker om bruker er innlogget
    if (username == null) {
        username == "guest"
    }
    // henter alle brukerer fra spill tabellen
    connection.query(`SELECT * FROM ${code}`, function (err, result, fields) {
        let data = JSON.parse(JSON.stringify(result))
        // skjekker om siste person dro 
        if (data.length <= 1) {
            // hvis personen dro så slette vi spillet
            connection.query(`DROP TABLE ${code}`)
            connection.query(`DELETE FROM games WHERE gameName = "${code}"`)
        } else {
            // hvis ikke bare fjerner vi spilleren fra databasen
            connection.query(`DELETE FROM ${code} WHERE username = "${username}"`)
            if (host == true) {
                connection.query(`UPDATE games SET host = "${data[1].username}" WHERE gameName = "${code}"`)
            }
        }
        // oppdaterer brukeren
        connection.query(`UPDATE users SET gameName = "waiting" WHERE username = "${username}"`)
    })
})

// code for å lagre / dra kort
app.post("/draw/cards/", function (req, res) {
    // henter alle spillererene fra spillet
    let playerstats = JSON.parse(req.body.playerstats)
    // setter string = ""
    let string = ""
    // bygger på stringen med en for lokke
    for (let i = 0; i < playerstats.length; i++) {
        connection.query(`UPDATE stats SET hand = '${JSON.stringify(playerstats[i].hand)}' WHERE username = "${playerstats[i].username}"; `)

    }
})

app.post("/save/cards/", function (req, res) {
    let code = req.body.code
    let deck = req.body.deck
    let turn = req.body.turn
    connection.query(`UPDATE games SET deck = '${deck}', turn = "${turn}" WHERE gameName = "${code}"`)
})
app.post("/save/turn/", function (req, res) {
    let code = req.body.code
    let deck = req.body.deck
    let turn = req.body.turn
    connection.query(`UPDATE games SET  turn = "${turn}" WHERE gameName = "${code}"`)
})

app.post("/start/game/", function (req, res) {
    let code = req.body.code
    connection.query(`UPDATE games SET status = "playing" WHERE gameName = "${code}"`)
    connection.query(`UPDATE ${code} SET status = "playing" WHERE status = "waiting"`)
})


app.get("/tables", function (req, res) {
    connection.query(`show tables`, function (err, result, fields) {
        let data = JSON.parse(JSON.stringify(result))
        res.send(data)
    })
})

app.get("/users", function (req, res) {
    connection.query(`SELECT * FROM users`, function (err, result, fields) {
        let data = JSON.parse(JSON.stringify(result))
        res.send(data)
    })
})
app.get("/stats", function (req, res) {
    connection.query(`SELECT * FROM stats`, function (err, result, fields) {
        let data = JSON.parse(JSON.stringify(result))
        res.send(data)
    })
})
app.get("/games", function (req, res) {
    connection.query(`SELECT * FROM games`, function (err, result, fields) {
        let data = JSON.parse(JSON.stringify(result))
        res.send(data)
    })
})

app.get('/gameer/:a', (req, res) => {
    connection.query(`SELECT * FROM ${req.params.a}`, function (err, result, fields) {
        let data = JSON.parse(JSON.stringify(result))
        res.send(data)
    })
});

app.get('/single/games/:a', (req, res) => {
    connection.query(`SELECT * FROM games WHERE gameName = "${req.params.a}"`, function (err, result, fields) {
        let data = JSON.parse(JSON.stringify(result))
        res.send(data)
    })
});


app.use(express.static("public"))