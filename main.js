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
//-------------------------------Variables-------------------------------\\
const colorInput = document.getElementById("colorInput")
const colorSelector = document.getElementById("colorSelector")
const colorBox = document.getElementById("colorBox")
const board = document.getElementById("board")
const inputBox = document.getElementById("inputBox")
const submitButton = document.getElementById("submitButton")
const signoutButton = document.getElementById("logoutButton")
const submitButtonIcon = document.getElementById("submitButtonIcon")
//---------------------Logout---------------------\\
signoutButton.addEventListener("click", function(){
    auth.signOut()
    window.location.href = "index.html"
})
//-------------------------------Colors-------------------------------\\
const uniqueTextColors = {
    ["rgb(48, 42, 42)"]: "rgb(245, 245, 245)", // Black -> White text
    ["rgb(103, 43, 255)"]: "rgb(245, 245, 245)" // Purple -> White Text 
}
let choices = colorSelector.childNodes
for(let i = 0; i < choices.length; i++){
    if(choices[i].nodeType == 1){
        choices[i].style.backgroundColor = choices[i].value
    }
}
colorSelector.style.backgroundColor = colorSelector.value
colorSelector.addEventListener("change", function(){
    colorBox.style.backgroundColor = colorSelector.value
})
//-------------------------------Uploads Messages-------------------------------\\
function sendMessage(){
    if (inputBox.value != "" && auth.currentUser != null){
        const boardRef = ref(db, "users/" + auth.currentUser.uid + "/board")
        const pushBoardRef = push(boardRef)
        set(pushBoardRef,{ 
            text: inputBox.value,
            color: colorSelector.value
        })
        inputBox.value = ""
    }
}
submitButton.addEventListener("click", function(){
    if(submitButtonIcon.classList.contains("bi-x-circle-fill")){
        inputBox.style.visibility = "hidden"
        colorInput.style.visibility = "hidden"
        submitButtonIcon.classList.replace("bi-x-circle-fill", "bi-file-earmark-plus-fill")
    } else if(submitButtonIcon.classList.contains("bi-pin-angle-fill")){
        sendMessage()
        submitButtonIcon.classList.replace("bi-pin-angle-fill", "bi-x-circle-fill")
    } else{
        inputBox.style.visibility = "visible"
        colorInput.style.visibility = "visible"
        submitButtonIcon.classList.replace("bi-file-earmark-plus-fill", "bi-x-circle-fill")
    }
})
inputBox.style.visibility = "hidden"
colorInput.style.visibility = "hidden"

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
        submitButtonIcon.classList.replace("bi-pin-angle-fill", "bi-x-circle-fill")
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
        note.style.backgroundColor = "rgb(255, 238, 153)"
    }
    if(uniqueTextColors[note.style.backgroundColor] != undefined){
        note.style.color = uniqueTextColors[note.style.backgroundColor]
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