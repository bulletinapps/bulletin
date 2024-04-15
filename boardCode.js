//-------------------------------Database-------------------------------\\
// Import functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js"
import { getDatabase, set, ref, push, remove, onChildAdded, update} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js"
import { getAuth, onAuthStateChanged, updateEmail, sendEmailVerification, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

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
//-------------------------------Security-------------------------------\\
onAuthStateChanged(auth, function(user){
    if(!user){
        window.location.href = "index.html"
    }
})
//-------------------------------Global Variables-------------------------------\\
let lastNote = null
let selectedNote = [null, null] // [0] = note id, [1] = note element
let editMode = false
let currentColor = "rgb(255, 238, 153)"
//-------------------------------Elements-------------------------------\\
const board = document.getElementById("board")

const addNoteButton = document.getElementById("addNoteButton")
const colorSchemePicker = document.getElementById("colorSchemePicker")
const fontPicker = document.getElementById("fontPicker")

const noteModalLabel = document.getElementById("noteModalLabel")
const noteInputBox = document.getElementById("noteInputBox")
const colorBox = document.getElementById("colorBox")
const noteButton = document.getElementById("noteButton")
const deleteNoteButton = document.getElementById("deleteNoteButton")

const autoScrollSwtich = document.getElementById("autoScrollCheck")
const signoutButton = document.getElementById("logoutButton")

const updateUsernameButton = document.getElementById("updateUsernameButton")
const updateEmailButton = document.getElementById("updateEmailButton")
const updatePasswordButton = document.getElementById("updatePasswordButton")
const usernameInput = document.getElementById("usernameInput")
const emailInput = document.getElementById("emailInput")
//-------------------------------Functions-------------------------------\\
function convertHexToDecimal(hexValue){
    let finalHexValue = 0
    let index = hexValue.length
    for(let i = 0; i < hexValue.length; i++){
        let componentToConvert = hexValue.substring(i, i+1)
        let convertedComponent = null
        if(Number.isNaN(Number(componentToConvert))){
            if(componentToConvert.toLowerCase() == "a"){
                convertedComponent = 10
            } else if(componentToConvert.toLowerCase() == "b"){
                convertedComponent = 11
            } else if(componentToConvert.toLowerCase() == "c"){
                convertedComponent = 12
            } else if(componentToConvert.toLowerCase() == "d"){
                convertedComponent = 13
            } else if(componentToConvert.toLowerCase() == "e"){
                convertedComponent = 14
            } else if(componentToConvert.toLowerCase() == "f"){
                convertedComponent = 15
            } else{
                return null
            }
        } else{
            convertedComponent = Number(componentToConvert)
        }
        index--;
        finalHexValue += convertedComponent*Math.pow(16, index)
    }
    return finalHexValue
}

function changeMode(edit){
    editMode = edit
    if(edit){
        deleteNoteButton.style.visibility = "visible"
        noteModalLabel.innerHTML = "<b>Edit Note</b>"
        noteButton.textContent = "Save"
    } else{
        deleteNoteButton.style.visibility = "hidden"
        noteModalLabel.innerHTML = "<b>Add Note</b>"
        noteButton.textContent = "Pin"
    }
}

function addNoteElement(id, text, color){
    //------------Note Creation------------\\
    let note = document.createElement("div")
    note.id = id
    note.innerHTML = text
    note.classList.add("note")
    note.style.rotate = parseInt((Math.random()*3 + 1)*Math.pow(-1, parseInt(Math.random()*2 + 1))) + "deg"
    note.style.setProperty("--fontSize", Math.max(30*Math.pow(0.96, Math.floor(text.length/5)), 9) + "px")
    //------------Pin Icon------------\\
    let pinIcon = document.createElement("img")
    pinIcon.classList.add("pinIcon")
    pinIcon.style.color = "yellow"
    pinIcon.src = "https://static.vecteezy.com/system/resources/thumbnails/012/419/385/small/red-notepaper-pin-ilustration-push-pin-isolated-on-the-white-background-free-png.png"
    note.appendChild(pinIcon)
    //------------Hover Icon------------\\
    let hoverIcon = document.createElement("i")
    hoverIcon.classList.add("bi-pencil-square")
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
    //------------Return------------\\
    return note
}

function editNote(id, noteElement, newText, newColor){
    const boardRef = ref(db, "users/" + auth.currentUser.uid + "/board/" + id)
    set(boardRef, {
        text: newText,
        color: newColor
    }).then(function(){
        //------------Text------------\\
        noteElement.innerHTML = newText
        noteElement.style.setProperty("--fontSize", Math.max(30*Math.pow(0.96, Math.floor(newText.length/5)), 9) + "px")
        //------------Color------------\\
        if(newColor != null){
            noteElement.style.backgroundColor = newColor
        } else{
            noteElement.style.backgroundColor = "rgb(238, 221, 70)"
        }
        if(customTextColors[newColor] != undefined){
            noteElement.style.color = customTextColors[newColor] 
        } else{
            noteElement.style.color = "rgb(0,0,0)"
        }
        //------------Pin Icon------------\\
        let pinIcon = document.createElement("img")
        pinIcon.classList.add("pinIcon")
        pinIcon.style.color = "yellow"
        pinIcon.src = "https://static.vecteezy.com/system/resources/thumbnails/012/419/385/small/red-notepaper-pin-ilustration-push-pin-isolated-on-the-white-background-free-png.png"
        noteElement.appendChild(pinIcon)
        //------------Hover Icon------------\\
        let hoverIcon = document.createElement("i")
        hoverIcon.classList.add("bi-pencil-square")
        hoverIcon.classList.add("hoverIcon")
        noteElement.appendChild(hoverIcon)
    }).catch(function(err){
        alert("An error has occurred trying to save your note. Try again. Error: " + err)
    })
}

function deleteNote(id, noteElement){
    const boardRef = ref(db, "users/" + auth.currentUser.uid + "/board/" + id)
    remove(boardRef).then(function(){
        if(noteElement != null){
            noteElement.remove()
        }
    }).catch(function(err){
        alert("An error has occured trying to delete your note. Try Again. Error: " + err)
    })
}

window.addEventListener("load", function(){
    setTimeout(function(){
        if(auth.currentUser == null){
            window.location.href = "index.html"
        }else{
            onChildAdded(ref(db, "users/" + auth.currentUser.uid + "/board"), (data) => {
                if(auth.currentUser != null){
                    //------------Data from firebase------------\\
                    let noteContents = data.val()
                    let key = data.key
                    let note = addNoteElement(key, noteContents.text, noteContents.color)
                    note.setAttribute("data-bs-toggle", "modal")
                    note.setAttribute("data-bs-target", "#noteModal")
                    lastNote = note
                    //------------Select Note------------\\
                    note.addEventListener("click", function(){
                        selectedNote = [key, note]
                        changeMode(true)
                        noteInputBox.value = note.textContent
                    })
                    if(autoScrollSwtich.checked == true){
                        note.scrollIntoView({behavior: "smooth"})
                    }
                }
            })
        }
    }, 500)
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
    "rgb(103, 43, 255)": "rgb(255, 255, 255)",
    "rgb(142, 108, 56)": "rgb(255, 255, 255)"
}

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
        currentColor = colors[i]
        if(selectedElement != null){
            selectedElement.childNodes[0].style.visibility = "hidden"
        }
        currentColor = colors[i]
        selectedElement = colorChoice
        selectedElement.childNodes[0].style.visibility = "visible"
    })
} 
//-------------------------------Buttons-------------------------------\\
addNoteButton.addEventListener("click", function(){
    noteInputBox.value = ""
    changeMode(false)
})

noteButton.addEventListener("click", function(){
    if(editMode == false){
        if (noteInputBox.value != "" && auth.currentUser != null){
            const boardRef = ref(db, "users/" + auth.currentUser.uid + "/board")
            const pushBoardRef = push(boardRef)
            set(pushBoardRef,{ 
                text: noteInputBox.value,
                color: currentColor
            }).then(function(){}).catch(function(err){
                alert("An error has occurred trying to save your note. Try again. Error: " + err)
            })
            noteInputBox.value = ""
        } 
    } else{
        if(selectedNote != [null, null]){
            editNote(selectedNote[0], selectedNote[1], noteInputBox.value, currentColor)
        }
    }
})

updateUsernameButton.addEventListener("click", function(){
    if(usernameInput.value != "" && auth.currentUser != null){
        update(ref(db, "users/" + auth.currentUser.uid),{
            username: usernameInput.value
        }).then(function(){
            alert("Your usename was successfully updated to '" + usernameInput.value + "'")
        }).catch(function(err){
            alert("There was an error updating your username. Try again. Error: " + err)
        })
    } else {
        alert("Your username cannot be empty.")
    }
})

updateEmailButton.addEventListener("click", function(){
    if(emailInput.value != "" && auth.currentUser != null){
        update(ref(db, "users/" + auth.currentUser.uid),{
            email: emailInput.value 
        }).then(function(){
            updateEmail(auth.currentUser, emailInput.value).then(function(){
                alert("Successfully updated user's email!")
            }).catch(function(err){
                alert("An error has occured updating the user's email in the authentication system. Try again. Error: " + err)
            })
        }).catch(function(err){
            alert("Error saving the user's email to the database. Try again. Error: " + err)
        })
    } else {
        alert("Invalid Email.")
    }
})

updatePasswordButton.addEventListener("click", function(){
    if(auth.currentUser != null){
        sendPasswordResetEmail(auth, auth.currentUser.email).then(function(){
            alert("Successfully sent password reset email. Check your email.")
        }).catch(function(err){
            alert("An error has occurred. Error: " + err)
        })
    }
})

signoutButton.addEventListener("click", function(){
    auth.signOut()
    window.location.href = "index.html"
})

autoScrollSwtich.addEventListener("click", function(){
    if(autoScrollSwtich.checked == true && lastNote != null){
        lastNote.scrollIntoView({behavior: "smooth"})
    }
})

colorSchemePicker.addEventListener("input", function(){
    document.body.style.setProperty("--color-scheme", colorSchemePicker.value)
    let hexString = colorSchemePicker.value
    let r = convertHexToDecimal(hexString.substring(1,3))
    let g = convertHexToDecimal(hexString.substring(3,5))
    let b = convertHexToDecimal(hexString.substring(5))
    if(r > 125 || g > 125 || b > 125){
        document.body.style.setProperty("--text-color-scheme", "rgb(0,0,0)")
    } else {
        document.body.style.setProperty("--text-color-scheme", "rgb(255, 255, 255)")
    }
})

fontPicker.addEventListener("change", function(){
    document.body.style.setProperty("--font", fontPicker.value)
})

deleteNoteButton.addEventListener("click", function(){
    if(selectedNote != [null, null] ){
        deleteNote(selectedNote[0], selectedNote[1])
    }
})