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
  if (file.type === 'image') {
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

    // Confidence als Balkendiagramm darstellen
    showConfidenceBar(confidence);
    
    // Restlicher Code...
  }
}

// Funktion zum Speichern einer Klassifizierung in der Datenbank
function saveClassification(isCorrect, resultDiv, img) {
  if (img) {
    let data = {
      label: resultDiv.elt.textContent.split(':')[1].trim(),
      confidence: parseFloat(resultDiv.elt.textContent.split(':')[3].trim()),
      thumbnailUrl: img.elt.src,
      isCorrect: isCorrect
    };

    let classificationsKey = isCorrect ? 'correctClassifications' : 'incorrectClassifications';
    let classifications = JSON.parse(localStorage.getItem(classificationsKey)) || [];
    classifications.push(data);
    localStorage.setItem(classificationsKey, JSON.stringify(classifications));

    // Aktualisiere die Tabellen mit den letzten Klassifizierungen
    loadLastClassifications();
  } else {
    console.log('Es wurde noch kein Bild hochgeladen.'); // Falls hier immer noch eine Fehlermeldung angezeigt wird, überprüfe deine Anwendung auf weitere Probleme.
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
  let confidenceBar = createDiv('');
  confidenceBar.size(400, 20);
  confidenceBar.style('border', '1px solid black');
  confidenceBar.style('background-color', 'lightgray');
  confidenceBar.position(dropZone.position().x, dropZone.position().y + dropZone.height + 10);
  confidenceBar.child(createDiv('').size(confidence * 4, 20).style('background-color', 'green'));
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
