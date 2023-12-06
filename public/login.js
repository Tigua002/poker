// a snippet of code to prevent the site from refreshing, userful when bug testing
var form = document.getElementsByClassName("signupForm")[0];
function handleForm(event) { event.preventDefault(); }
form.addEventListener('submit', handleForm);
// login function
async function login() {
    // getting the user input values
    let username = document.getElementById("brukernavn").value
    let password = document.getElementById("password").value
    // getting all the users from the database
    const res = await fetch("/users",
        {
            method: "GET"
        })
    // setting the users as the result of the answer
    const users = await res.json()

    // checks if the user inputted some special characters
    if (isValidString(username) && isValidString(password)) { } else {
        // gives an error message
        alert("No special characters please")
        return
    }
    // checks if the user logged in as admin
    if (username == "admin" && password == "password") {
        sessionStorage.setItem("username", username)
        window.location.assign("account.hmtl")
        return
    } else {
        // if none of the conditions are true then we run this
        // for loop going througj each user
        for (let i = 0; i < users.length; i++) {
            // checks if the username maches
            if (users[i].username == username) {
                // setter stares as the response from the stats table
                const stares = await fetch("/stats",
                    {
                        method: "GET"
                    })
                // sets the variable stats = the stats of all players
                const stats = await stares.json()
                // runs through all the stats
                for (let x = 0; x < stats.length; x++) {
                    // and compares then to the userID
                    if (users[i].playerID == stats[x].playerID){
                        // sets the balance, userID and username of the user in session for later use
                        sessionStorage.setItem("balance", stats[x].balance)
                        sessionStorage.setItem("userID", users[i].playerID)
                        sessionStorage.setItem("username", users[i].username)
                    }
                    
                }
                // sends the user to index.html
                window.location.assign("games.html")
                // ends the function to prevent extra resources being taken
                return
            }
        }
    }
    // if the code got this far then the user entered the wrong input and we send the user an error message
    alert("Something is wrong...")
    return
}
// here we check for special characters
function isValidString(inputString) {
    // Define the regex pattern
    var regexPattern = /^[a-zA-Z0-9_]+$/;
    // Test the input string against the pattern
    var isValid = regexPattern.test(inputString);
    return isValid;
}

