// code snippet to prevent the page from reloading 
var form = document.getElementsByClassName("form")[0];
function handleForm(event) { event.preventDefault(); }
form.addEventListener('submit', handleForm);
// create game function
async function game() {
    // setting name as tje random 15 character name 
    let name = makeid(15)
    // setting privacy varaible
    let privacy = ""
    // checks whether the user selected public or private game and assigns the respective value
    if (document.getElementsByClassName("privacyOptions")[0].selected == true) {
        privacy = "public"
    } else if (document.getElementsByClassName("privacyOptions")[1].selected == true){
        privacy = "private"
    }
    // sets the data the server will need
    const data = {
        username: sessionStorage.getItem("username"),
        userID: sessionStorage.getItem("userID"),
        balance: sessionStorage.getItem("balance"),
        name: name,
        password: document.getElementById("gamecode").value,
        privacy: privacy
    }
    // sends the data to the database
    fetch("/create/game", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    // saves the code in session storage for later use
    sessionStorage.setItem("gameID", name)
    // sends the user to gamelobby.hmtl
    window.location.assign("gamelobby.html")

}
// function for making a random string
function makeid(length) {
    let result = '';
    // these are the different characters which can be in the string
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let counter = 0;
    // while loop going for the amount of times requested
    while (counter < length) {
        // draws a random character and appends it to result
        result += characters.charAt(Math.floor(Math.random() * characters.length));
        // updates the counter value
        counter += 1;
    }
    // returns the result
    return result;
}
