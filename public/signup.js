// function for signing up
async function signup() {
    // getting all the users from the database
    const res = await fetch("/users",
        {
            method: "GET"
        })
    // assinging the variable users to the database responce
    const users = await res.json()
    // gets the user inputs
    let brukernavn = document.getElementById("brukernavn").value
    let password = document.getElementById("password").value
    // for loop going throug all the users
    for (let i = 0; i < users.length; i++) {
        // checking if the user picked a username which is already in use
        if (users[i].username == brukernavn) {
            // sending an error message
            alert("The username has alredy been taken")
            return
        }
    }
    // sets user and password the user inputs
    const data = {
        user: brukernavn,
        passord: password
    }
    // sends the data to the database
    fetch("/create/user", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    // sending the user to the login page
    window.location.assign("login.html")
}