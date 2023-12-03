const express = require('express')
const app = express();
const bodyParser = require('body-parser');
const PORT = 5000;
const md5 = require('md5')
app.listen(PORT, () => console.log(`Server is running on this port: ${PORT}`));

const mysql = require('mysql');
// const connection = mysql.createConnection({
//     host: '127.0.0.1',
//     user: 'root',
//     password: 'admin',
//     database: 'poker'
// });
const connection = mysql.createConnection({
    host: '172.104.241.199',
    user: 'u2_oU6US3v3uE',
    password: '9BTXU@6o=UvwZafXyxu6W6ff',
    database: 's2_poker'
});
connection.connect();
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
const path = require("path")
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + "/public/index.html"))
})



app.post("/create/user/", function (req, res) {
    let user = req.body.user
    let passord = req.body.passord
    connection.query(`INSERT INTO users (username, password) VALUES ("${user}", "${passord}")`)
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
app.post("/create/game/", function (req, res) {
    connection.query(`SELECT * FROM games`, function (err, result, fields) {
        let info = JSON.parse(JSON.stringify(result))
        let user = req.body.username
        let userID = req.body.userID
        let balance = req.body.balance
        let name = req.body.name
        let code = req.body.password
        let privacy = req.body.privacy
        connection.query(`CREATE TABLE ${name} (playerID INT, username VARCHAR (100), balance INT, status VARCHAR(50))`)
        connection.query(`INSERT INTO games VALUES ("${name}", "${user}", "${code}", "${privacy}", "waiting")`)
        connection.query(`INSERT INTO ${name} VALUES (${userID}, "${user}", ${balance}, "waiting")`)
        connection.query(`UPDATE users SET gameName = "${code}" WHERE username = "${user}"`)
        res.send(name)

    })

})

app.post("/join/game/", function (req, res) {
    let code = req.body.code
    let username = req.body.username
    let userID = req.body.userID
    let balance = req.body.balance
    connection.query(`INSERT INTO ${code} (playerID, username, balance, status) VALUES (${userID}, "${username}", ${balance}, "waiting")`)
    connection.query(`UPDATE users SET gameName = "${code}" WHERE username = "${username}"`)
})

app.post("/leave/game/", function (req, res) {
    let code = req.body.code
    let username = req.body.username
    let host = req.body.host
    connection.query(`SELECT * FROM ${code}`, function (err, result, fields) {
        let data = JSON.parse(JSON.stringify(result))
        if (data.length <= 1) {
            connection.query(`DROP TABLE ${code}`)
            connection.query(`DELETE FROM games WHERE gameName = "${code}"`)
        } else {
            connection.query(`DELETE FROM ${code} WHERE username = "${username}"`)
            if (host == true) {
                connection.query(`UPDATE games SET host = "${data[1].username}" WHERE gameName = "${code}"`)
            }
        }
        connection.query(`UPDATE users SET gameName = "waiting" WHERE username = "${username}"`)
    })
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

app.use(express.static("public"))