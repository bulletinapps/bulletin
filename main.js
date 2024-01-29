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
let board = document.getElementById("board")
let inputBox = document.getElementById("inputBox")
let colorBox = document.getElementById("colorBox")
let submitButton = document.getElementById("submitButton")
//-------------------------------Uploads Messages-------------------------------\\
function sendMessage(){
    if (inputBox.value != "" && auth.currentUser != null){
        const boardRef = ref(db, "users/" + auth.currentUser.uid + "/board")
        const pushBoardRef = push(boardRef)
        set(pushBoardRef,{ 
            text: inputBox.value,
            color: colorBox.value
        })
        inputBox.value = ""
    }
}
submitButton.addEventListener("click", sendMessage)
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
     //------------Append Note------------\\
    board.appendChild(note)
    //------------Remove Element------------\\
    note.addEventListener("click", function(){
        document.getElementById(id).remove()
    })
    //------------Return------------\\
    return note
}
setTimeout(function(){
    onChildAdded(ref(db, "users/" + auth.currentUser.uid + "/board"), (data) =>{
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
    })
}, 2000)