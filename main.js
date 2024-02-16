//-------------------------------Database-------------------------------\\
// Import functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js"
import { getDatabase, set, ref, push, remove, onChildAdded} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js"
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAZNz1imxIyM1ABtgJWAhxCMjxxFo4-bHY",
    authDomain: "bulletin-65b15.firebaseapp.com",
    projectId: "bulletin-65b15",
    storageBucket: "bulletin-65b15.appspot.com",
    messagingSenderId: "959216470906",
    appId: "1:959216470906:web:87924987b3ab0e282864c3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase()
const auth = getAuth()
//-------------------------------Database-------------------------------\\
const board = document.getElementById("board")
const signoutButton = document.getElementById("logoutButton")
const inputBox = document.getElementById("inputBox")
const colorLabel = document.getElementById("colorSelector")
const colorBox = document.getElementById("colorBox")
const pinButton = document.getElementById("pinButton")
//---------------------Logout---------------------\\
signoutButton.addEventListener("click", function(){
    auth.signOut()
    window.location.href = "index.html"
})
//---------------------Colors---------------------\\
const colors = [
    "rgb(234, 31, 31)",
    "rgb(234, 153, 153)",
    "rgb(255, 147, 0)",
    "rgb(255, 213, 86)",
    "rgb(255, 238, 0)",
    "rgb(255, 238, 153)",
    "rgb(58, 190, 0)",
    "rgb(147, 196, 125)",
    "rgb(0, 134, 255)",
    "rgb(111, 168, 220)",
    "rgb(247, 51, 148)",
    "rgb(255, 162, 211)",
    "rgb(103, 43, 255)",
    "rgb(142, 124, 195)",
    "rgb(48, 42, 42)",
    "rgb(243, 246, 244)",
    "rgb(142, 108, 56)"
]

const customTextColors = {
    "rgb(48, 42, 42)": "rgb(255, 255, 255)",
    "rgb(103, 43, 255)": "rgb(255, 255, 255)"
}

let currentColor = "rgb(238, 221, 70)"
let selectedElement = null
for(let i = 0; i < colors.length; i++){
    let colorChoice = document.createElement("div")
    colorChoice.classList.add("colorChoice")
    colorChoice.style.backgroundColor = colors[i]
    colorChoice.id = colors[i]
    colorBox.appendChild(colorChoice)

    // Stopped here

    colorChoice.addEventListener("click", function(){
        if(selectedElement != null){
            selectedElement.style.border = "solid black 3px"
        }
        currentColor = colors[i]
        selectedElement = colorChoice
        colorChoice.style.border = "solid blue 3px"
    })
}
colorBox.addEventListener("change", function(){
    colorLabel.style.backgroundColor = colorBox.value
})
//-------------------------------Uploads Messages-------------------------------\\
function sendMessage(){
    if (inputBox.value != "" && auth.currentUser != null){
        const boardRef = ref(db, "users/" + auth.currentUser.uid + "/board")
        const pushBoardRef = push(boardRef)
        set(pushBoardRef,{ 
            text: inputBox.value,
            color: currentColor
        })
        inputBox.value = ""
    }
}

pinButton.addEventListener("click", function(){
    sendMessage()
})

inputBox.addEventListener("input", function(){
    if(inputBox.value != ""){
        submitButtonIcon.classList.replace("bi-x-circle-fill", "bi-pin-angle-fill")
    } else{
        submitButtonIcon.classList.replace("bi-pin-angle-fill", "bi-x-circle-fill")
    }
})

document.onkeyup = function(e){
    if(e.key == "Enter"){
        sendMessage()
    }
}
//---------------------Loads Messages---------------------\\
function addNote(id, text, color){
    //------------Note Creation------------\\
    let note = document.createElement("div")
    note.id = id
    note.classList.add("note")
    note.innerHTML = text
    note.style.rotate = parseInt((Math.random()*3 + 1)*Math.pow(-1, parseInt(Math.random()*2 + 1))) + "deg"
    //------------Pin Icon------------\\
    let pinIcon = document.createElement("img")
    pinIcon.classList.add("pinIcon")
    pinIcon.style.color = "yellow"
    pinIcon.src = "https://static.vecteezy.com/system/resources/thumbnails/012/419/385/small/red-notepaper-pin-ilustration-push-pin-isolated-on-the-white-background-free-png.png"
    note.appendChild(pinIcon)
    //------------Hover Icon------------\\
    let hoverIcon = document.createElement("i")
    hoverIcon.classList.add("bi-check-circle")
    hoverIcon.classList.add("hoverIcon")
    note.appendChild(hoverIcon)
    //------------Color------------\\
    if(color != null){
        note.style.backgroundColor = color
    } else{
        note.style.backgroundColor = "rgb(238, 221, 70)"
    }
    if(customTextColors[color] != undefined){
        note.style.color = customTextColors[color] 
    } else{
        note.style.color = "rgb(0,0,0)"
    }
     //------------Append Note------------\\
    board.appendChild(note)
    //------------Remove Element------------\\
    note.addEventListener("click", function(){
        document.getElementById(id).remove()
    })
    //------------Return------------\\
    return note
}
window.addEventListener("load", function(){
    setTimeout(function(){
        if(auth.currentUser == null){
            window.location.href = "login.html"
        }else{
            onChildAdded(ref(db, "users/" + auth.currentUser.uid + "/board"), (data) =>{
                if(auth.currentUser != null){
                    //------------Data from firebase------------\\
                    let noteContents = data.val()
                    let key = data.key
                    let note = addNote(key, noteContents.text, noteContents.color)
                    //------------Remove Element------------\\
                    note.addEventListener("click", function(){
                        if(auth.currentUser != null){
                            remove(ref(db, "users/" + auth.currentUser.uid + "/board/"+ key))
                        }
                    })
                    note.scrollIntoView({behavior: "smooth"})
                }
            })
        }
    }, 1000)
})