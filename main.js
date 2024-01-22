//-------------------------------Database-------------------------------\\
// Import functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js"
import { getDatabase, set, ref, push, onChildAdded} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js"

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
//-------------------------------Database-------------------------------\\
let board = document.getElementById("board")
let inputBox = document.getElementById("inputBox")
let submitButton = document.getElementById("submitButton")
//-------------------------------Uploads Messages-------------------------------\\
function sendMessage(){
    if (inputBox.value != ""){
        const boardRef = ref(db, "global")
        const pushBoardRef = push(boardRef)
        set(pushBoardRef,{ 
            text: inputBox.value
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
onChildAdded(ref(db, "global"), (data) =>{
    //------------Data from firebase------------\\
    let noteContents = data.val()
    //------------Note Creation------------\\
    let note = document.createElement("div")
    note.classList.add("note")
    note.innerHTML = noteContents.text
    note.style.rotate = parseInt((Math.random()*5 + 1)*Math.pow(-1, parseInt(Math.random()*2 + 1))) + "deg"
    //------------Append to board------------\\
    board.appendChild(note)
    //------------Remove Element------------\\
})