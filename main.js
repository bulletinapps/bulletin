//-------------------------------Database-------------------------------\\
// Import functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js"
import { getDatabase, set, ref, push, remove, onChildAdded, update} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js"
import { getAuth, onAuthStateChanged, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

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
//-------------------------------Elements-------------------------------\\
const board = document.getElementById("board")
const signoutButton = document.getElementById("logoutButton")
const inputBox = document.getElementById("inputBox")
const colorBox = document.getElementById("colorBox")
const pinButton = document.getElementById("pinButton")
const darkModeSwitch = document.getElementById("darkModeCheck")
const autoScrollSwtich = document.getElementById("autoScrollCheck")
const updateUsernameButton = document.getElementById("updateUsernameButton")
const updateEmailButton = document.getElementById("updateEmailButton")
const updatePasswordButton = document.getElementById("updatePasswordButton")
const usernameInput = document.getElementById("usernameInput")
const emailInput = document.getElementById("emailInput")
//-------------------------------Update Information-------------------------------\\
updateUsernameButton.addEventListener("click", function(){
    if(usernameInput.value != "" && auth.currentUser != null){
        update(ref(db, "users/" + auth.currentUser.uid),{
            username: usernameInput.value
        })
    }
})

updateEmailButton.addEventListener("click", function(){
    if(emailInput.value != "" && auth.currentUser != null){
        update(ref(db, "users/" + auth.currentUser.uid),{
            email: emailInput.value
        })
        // Stopped here
    }
})

updatePasswordButton.addEventListener("click", function(){
    if(auth.currentUser != null){
        sendPasswordResetEmail(auth, auth.currentUser.email)
    }
})
//---------------------Logout---------------------\\
signoutButton.addEventListener("click", function(){
    auth.signOut()
    window.location.href = "index.html"
})
//---------------------DarkMode---------------------\\
darkModeSwitch.addEventListener("click", function(){
    if(darkModeSwitch.checked == true){
        document.querySelector("html").setAttribute("data-bs-theme", "dark")
    } else{
        document.querySelector("html").setAttribute("data-bs-theme", "light")
    }
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
    "rgb(142, 108, 56)",
    "rgb(255, 229, 180)"
]

const customTextColors = {
    "rgb(48, 42, 42)": "rgb(255, 255, 255)",
    "rgb(103, 43, 255)": "rgb(255, 255, 255)"
}

let currentColor = "rgb(255, 238, 153)"
let selectedElement = null
for(let i = 0; i < colors.length; i++){
    let colorChoice = document.createElement("div")
    colorChoice.classList.add("colorChoice")
    colorChoice.style.backgroundColor = colors[i]
    colorChoice.id = colors[i]
    colorBox.appendChild(colorChoice)

    let selectedIcon = document.createElement("i")
    selectedIcon.classList.add("bi-check2")
    selectedIcon.classList.add("selectedIcon")

    if(colors[i] == currentColor){
        selectedIcon.style.visibility = "visible"
        selectedElement = colorChoice
    } else{
        selectedIcon.style.visibility = "hidden"
    }
    if(customTextColors[colors[i]] != undefined){
        selectedIcon.style.color = customTextColors[colors[i]]
    } else{
        selectedIcon.style.color = "rgb(0,0,0)"
    }
    colorChoice.appendChild(selectedIcon)

    colorChoice.addEventListener("click", function(){
        if(selectedElement != null){
            selectedElement.childNodes[0].style.visibility = "hidden"
        }
        currentColor = colors[i]
        selectedElement = colorChoice
        selectedElement.childNodes[0].style.visibility = "visible"
    })
} 
//-------------------------------Adds Notes-------------------------------\\
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
    //------------Scale Text------------\\
    note.style.setProperty("--fontSize", Math.min(35, Math.max((7/text.length)*105, 9)) + "px")
     //------------Append Note------------\\
    board.appendChild(note)
    //------------Remove Element------------\\
    note.addEventListener("click", function(){
        document.getElementById(id).remove()
    })
    //------------Return------------\\
    return note
}
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
let lastNote = null
window.addEventListener("load", function(){
    setTimeout(function(){
        if(auth.currentUser == null){
            window.location.href = "index.html"
        }else{
            onChildAdded(ref(db, "users/" + auth.currentUser.uid + "/board"), (data) =>{
                if(auth.currentUser != null){
                    //------------Data from firebase------------\\
                    let noteContents = data.val()
                    let key = data.key
                    let note = addNote(key, noteContents.text, noteContents.color)
                    lastNote = note
                    //------------Remove Element------------\\
                    note.addEventListener("click", function(){
                        if(auth.currentUser != null){
                            remove(ref(db, "users/" + auth.currentUser.uid + "/board/"+ key))
                        }
                    })
                    if(autoScrollSwtich.checked == true){
                        note.scrollIntoView({behavior: "smooth"})
                    }
                }
            })
        }
    }, 1000)
})

autoScrollSwtich.addEventListener("click", function(){
    if(autoScrollSwtich.checked == true && lastNote != null){
        lastNote.scrollIntoView({behavior: "smooth"})
    }
})