// Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAM_zUz3_95ARqx2fDKiyPa7unqaYIx944",
    authDomain: "my-anime-95afc.firebaseapp.com",
    projectId: "my-anime-95afc",
    storageBucket: "my-anime-95afc.appspot.com",
    messagingSenderId: "373666776715",
    appId: "1:373666776715:web:48e2759284c223f1cc368e",
    
  };

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

document.addEventListener('DOMContentLoaded', () => {
    populateAlphabetDropdown();
    showFolder('ongoing');
});

function populateAlphabetDropdown() {
    const dropdown = document.getElementById('alphabet-dropdown');
    for (let i = 65; i <= 90; i++) {
        const option = document.createElement('option');
        option.value = String.fromCharCode(i);
        option.innerText = String.fromCharCode(i);
        dropdown.appendChild(option);
    }
}

function showFolder(folder) {
    document.getElementById('folder-contents').style.display = 'block';
    document.getElementById('item-list').innerHTML = '';
    loadItems(folder);
}

function loadItems(folder) {
    const dropdownValue = document.getElementById('alphabet-dropdown').value;
    let query = db.collection(folder);
    if (dropdownValue) {
        query = query.where('firstLetter', '==', dropdownValue);
    }

    query.get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            displayItem(data);
        });
    });
}

function displayItem(data) {
    const itemList = document.getElementById('item-list');
    const itemDiv = document.createElement('div');
    itemDiv.classList.add('item');
    itemDiv.innerHTML = `<span>${data.text}</span>`;

    if (data.imageURL) {
        const img = document.createElement('img');
        img.src = data.imageURL;
        itemDiv.appendChild(img);
    }

    itemList.appendChild(itemDiv);
}

function addItem() {
    const folder = document.querySelector('.folders button[aria-selected=true]').innerText.toLowerCase();
    const text = document.getElementById('string-input').value;
    const fileInput = document.getElementById('file-input');
    const file = fileInput.files[0];
    const firstLetter = text.charAt(0).toUpperCase();
    
    if (file) {
        const storageRef = storage.ref(`${folder}/${file.name}`);
        storageRef.put(file).then(() => {
            storageRef.getDownloadURL().then((url) => {
                saveItem(folder, text, firstLetter, url);
            });
        });
    } else {
        saveItem(folder, text, firstLetter, null);
    }
}

function saveItem(folder, text, firstLetter, imageURL) {
    db.collection(folder).add({
        text: text,
        firstLetter: firstLetter,
        imageURL: imageURL,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        loadItems(folder);
    });
}

function searchItems() {
    const searchValue = document.getElementById('search-input').value.toLowerCase();
    const folder = document.querySelector('.folders button[aria-selected=true]').innerText.toLowerCase();
    document.getElementById('item-list').innerHTML = '';

    db.collection(folder).where('text', '>=', searchValue).where('text', '<=', searchValue + '\uf8ff').get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            displayItem(data);
        });
    });
}
