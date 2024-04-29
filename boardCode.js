//-------------------------------Database-------------------------------\\
// Import functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js"
import { getDatabase, set, ref, push, remove, onChildAdded, update} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js"
import { getAuth, onAuthStateChanged, updateEmail, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

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
//-------------------------------Elements-------------------------------\\
const board = document.getElementById("board")

const addNoteButton = document.getElementById("addNoteButton")

const noteModalLabel = document.getElementById("noteModalLabel")
const noteInputBox = document.getElementById("noteInputBox")
const colorBox = document.getElementById("colorBox")
const customColorChoice = document.getElementById("customColorChoice")
const noteButton = document.getElementById("noteButton")
const deleteNoteButton = document.getElementById("deleteNoteButton")

const colorSchemePicker = document.getElementById("colorSchemePicker")
const fontPicker = document.getElementById("fontPicker")
const autoScrollSwtich = document.getElementById("autoScrollCheck")
const signoutButton = document.getElementById("logoutButton")

const updateUsernameButton = document.getElementById("updateUsernameButton")
const updateEmailButton = document.getElementById("updateEmailButton")
const updatePasswordButton = document.getElementById("updatePasswordButton")
const usernameInput = document.getElementById("usernameInput")
const emailInput = document.getElementById("emailInput")
//-------------------------------Saved Settings-------------------------------\\
if(sessionStorage.getItem("color-scheme") != null){
    document.body.style.setProperty("--color-scheme", sessionStorage.getItem("color-scheme"))
    colorSchemePicker.value = sessionStorage.getItem("color-scheme")
}
if(sessionStorage.getItem("font") != null){
    document.body.style.setProperty("--font", sessionStorage.getItem("font"))
    fontPicker.value = sessionStorage.getItem("font")
}
if(sessionStorage.getItem("auto-scroll") == "true"){
    autoScrollSwtich.checked = sessionStorage.getItem("auto-scroll")
}
//-------------------------------Functions-------------------------------\\
function convertRGBtoHex(rgbString){
    let parts = ["", "", ""]
    let index = 0
    let flag = false
    for (let i = 0; i < rgbString.length; i++) {
        if(!Number.isNaN(Number(rgbString[i]))){
            flag = true
            parts[index] += rgbString[i]
        }
        else if(flag){
            index += 1
            flag = false
        }
    }
    let finalHexValue = "#"
    for(let i = 0; i < parts.length; i++){
        let hexPart = parseInt(parts[i]).toString(16)
        if(hexPart.length == 1){
            hexPart = "0" + hexPart
        }
        finalHexValue += hexPart
    }
    return finalHexValue
}

convertRGBtoHex("rgb(200,100,0)")

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

function isColorTooBright(hexString){
    let r = convertHexToDecimal(hexString.substring(1,3))
    let g = convertHexToDecimal(hexString.substring(3,5))
    let b = convertHexToDecimal(hexString.substring(5))
    if(r > 125 || g > 125 || b > 125){
        return false
    } else {
        return true
    }
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
        note.style.backgroundColor = "#eedd46"
    }
    if(isColorTooBright(color)){
        note.style.color = "#ffffff"
    } else{
        note.style.color = "#000000"
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
            noteElement.style.backgroundColor = "#eedd46"
        }
        if(isColorTooBright(newColor)){
            noteElement.style.color = "#ffffff"
        } else{
            noteElement.style.color = "#000000"
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
                        customColorChoice.value = convertRGBtoHex(note.style.backgroundColor)
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
    "#ea1f1f",
    "#ea9999",
    "#ff9300",
    "#ffd556",
    "#ffee00",
    "#ffee99",
    "#3abe00",
    "#93c47d",
    "#0086ff",
    "#6fa8dc",
    "#f73394",
    "#ffa2d3",
    "#672bff",
    "#8e7cc3",
    "#302a2a",
    "#f3f6f4",
    "#8e6c38"
]

for(let i = 0; i < colors.length; i++){
    let colorChoice = document.createElement("div")
    colorChoice.classList.add("colorChoice")
    colorChoice.style.backgroundColor = colors[i]
    colorChoice.id = colors[i]
    colorBox.appendChild(colorChoice)

    colorChoice.addEventListener("click", function(){
        customColorChoice.value = colors[i]
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
                color: customColorChoice.value
            }).then(function(){}).catch(function(err){
                alert("An error has occurred trying to save your note. Try again. Error: " + err)
            })
            noteInputBox.value = ""
        } 
    } else{
        if(selectedNote != [null, null]){
            editNote(selectedNote[0], selectedNote[1], noteInputBox.value, customColorChoice.value)
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
    sessionStorage.setItem("auto-scroll", autoScrollSwtich.checked)
})

colorSchemePicker.addEventListener("input", function(){
    document.body.style.setProperty("--color-scheme", colorSchemePicker.value)
    sessionStorage.setItem("color-scheme", colorSchemePicker.value)
    if(!isColorTooBright(colorSchemePicker.value)){
        document.body.style.setProperty("--text-color-scheme", "#000000")
    } else {
        document.body.style.setProperty("--text-color-scheme", "#ffffff")
    }
})

fontPicker.addEventListener("change", function(){
    document.body.style.setProperty("--font", fontPicker.value)
    sessionStorage.setItem("font", fontPicker.value)
})

deleteNoteButton.addEventListener("click", function(){
    if(selectedNote != [null, null] ){
        deleteNote(selectedNote[0], selectedNote[1])
    }
})
