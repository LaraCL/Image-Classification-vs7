let classifier;
let img;
let resultDiv;
let classifyButton;
let correctButton;
let incorrectButton;
let dropZone;

function setup() {
  createCanvas(400, 400);
  
  dropZone = select('#drop_zone');
  dropZone.dragOver(highlight);
  dropZone.dragLeave(unhighlight);
  dropZone.drop(gotFile);
  
  resultDiv = select('#result');

  classifyButton = select('#classifyButton');
  classifyButton.mousePressed(classifyImage);

  correctButton = select('#correctButton');
  correctButton.style('display', 'inline'); 
  correctButton.mousePressed(() => { saveClassification(true); });

  incorrectButton = select('#incorrectButton');
  incorrectButton.style('display', 'inline');
  incorrectButton.mousePressed(() => { saveClassification(false); });

  classifier = ml5.imageClassifier('MobileNet', () => {
    console.log('Image Classifier geladen.');
  });
}

function gotFile(file) {
  if (file && file.type === 'image') {
    img = createImg(file.data, 'Uploaded Image', '', () => {
      img.hide();
      let thumbnailSize = 200;
      let dropX = dropZone.position().x;
      let dropY = dropZone.position().y;
      let x = dropX + (dropZone.width - thumbnailSize) / 2;
      let y = dropY + (dropZone.height - thumbnailSize) / 2;
      img.size(thumbnailSize, thumbnailSize);
      img.position(x, y);
      // Anzeigen des Thumbnails vor der Klassifizierung
      showThumbnail(img);
    });
  } else {
    console.log('Es wurde keine Bilddatei hochgeladen.');
  }
}

function classifyImage() {
  if (img) {
    classifier.classify(img.elt, gotResult);
  } else {
    console.log('Es wurde noch kein Bild hochgeladen.');
  }
}

function gotResult(error, results) {
  if (error) {
    console.error(error);
  } else {
    let confidence = results[0].confidence * 100;
    resultDiv.html(`<strong>Label:</strong> ${results[0].label}<br><strong>Confidence:</strong> ${nf(confidence, 0, 2)}%`);

    // Anzeige des Balkendiagramms mit Prozentzahl
    showConfidenceBar(confidence);

    // Jetzt, wo die Klassifizierung abgeschlossen ist und das Ergebnisdiv und das Bildobjekt definiert sind,
    // rufen wir die Funktion saveClassification() auf.
    if (resultDiv && img) {
      saveClassification(true);
    }
  }
}

// Neue Funktion zur Anzeige des Thumbnails
function showThumbnail(img) {
  let thumbnailElement = select('#thumbnail');
  thumbnailElement.html('');
  img.show();
  img.size(200, 200);
  img.parent('thumbnail');
}

// Neue Funktion zur Darstellung der Confidence als Balkendiagramm
function showConfidenceBar(confidence) {
    // Berechne die Position direkt unter der Drop-Zone
    let dropZoneHeight = dropZone.height; // Höhe der Drop-Zone
    let dropZoneTop = dropZone.position().y; // Y-Position der Drop-Zone
    let newBarYPosition = dropZoneTop + dropZoneHeight + 10; // Positioniere die Bar 10px unter der Drop-Zone

    let confidenceBar = createDiv('');
    confidenceBar.style('position', 'absolute');
    confidenceBar.style('top', newBarYPosition + 'px'); // Setze die Y-Position
    confidenceBar.style('left', dropZone.position().x + 'px'); // Setze die X-Position auf die der Drop-Zone
    confidenceBar.style('width', '400px'); // Breite entsprechend Drop-Zone
    confidenceBar.style('height', '20px');
    confidenceBar.style('border', '1px solid black');
    confidenceBar.style('background-color', 'lightgray');
    confidenceBar.parent(dropZone.parent()); // Elternelement der Drop-Zone für relative Positionierung

    let progressBar = createDiv('');
    progressBar.style('width', confidence * 4 + 'px'); // Skalierung der Breite basierend auf Confidence
    progressBar.style('height', '20px');
    progressBar.style('background-color', 'green');
    confidenceBar.child(progressBar);
}

// Funktion zum Speichern einer Klassifizierung in der Datenbank
function saveClassification(isCorrect) {
  if (img && img.elt && resultDiv && resultDiv.elt && resultDiv.elt.textContent) { // Überprüfen, ob img und resultDiv definiert sind
    let label = resultDiv.elt.textContent.split(':')[1];
    let confidence = resultDiv.elt.textContent.split(':')[3];
    if (label && confidence) {
      let data = {
        label: label.trim(),
        confidence: parseFloat(confidence.trim()),
        thumbnailUrl: img.elt.src,
        isCorrect: isCorrect
      };

      let classificationsKey = isCorrect ? 'correctClassifications' : 'incorrectClassifications';
      let classifications = JSON.parse(localStorage.getItem(classificationsKey)) || [];
      classifications.push(data);
      localStorage.setItem(classificationsKey, JSON.stringify(classifications));

      loadLastClassifications(); // Lade die letzten Klassifizierungen neu
    } else {
      console.log('Fehler beim Lesen des Labels oder der Confidence.');
    }
  } else {
    console.log('Bild oder Ergebnisdiv wurde nicht gefunden.');
  }
}

// Funktion zum Laden der letzten Klassifizierungen in die Tabellen
function loadLastClassifications() {
  let correctClassifications = JSON.parse(localStorage.getItem('correctClassifications')) || [];
  let incorrectClassifications = JSON.parse(localStorage.getItem('incorrectClassifications')) || [];

  fillTable('correctBody', correctClassifications);
  fillTable('incorrectBody', incorrectClassifications);
}

// Hilfsfunktion zum Füllen einer Tabelle mit Klassifizierungsdaten
function fillTable(tableId, data) {
  let tableBody = document.getElementById(tableId);
  tableBody.innerHTML = ''; // Tabelle leeren

  data.slice(-3).forEach(item => {
    let row = tableBody.insertRow();
    let thumbnailCell = row.insertCell(0);
    let labelCell = row.insertCell(1);
    let confidenceCell = row.insertCell(2);

    thumbnailCell.innerHTML = `<img src="${item.thumbnailUrl}" width="100">`;
    labelCell.textContent = item.label;
    confidenceCell.textContent = item.confidence;
  });
}

// Drag-and-Drop-Stilfunktionen
function highlight() {
  select('#drop_zone').style('background-color', '#eee');
}

function unhighlight() {
  select('#drop_zone').style('background-color', '');
}

// Verhindern des Standardverhaltens beim Drag-and-Drop
window.ondragover = function (e) {
  e.preventDefault();
  return false;
};

window.ondrop = function (e) {
  e.preventDefault();
  return false;
};

// Laden der letzten Klassifizierungen beim Laden der Seite
window.onload = loadLastClassifications;
