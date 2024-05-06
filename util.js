// Funktion zum Speichern einer Klassifizierung in der Datenbank
function saveClassification(isCorrect) {
    let label = resultDiv.elt.textContent.split(':')[1].trim();
    let confidence = parseFloat(resultDiv.elt.textContent.split(':')[3].trim());
    if (!label || isNaN(confidence)) {
        console.error('Fehler beim Lesen des Labels oder der Confidence.');
        return; // Beende die Funktion, wenn Daten ungültig sind
    }
    
    let data = {
        label: label,
        confidence: confidence,
        thumbnailUrl: img.elt.src,
        isCorrect: isCorrect
    };

    let classificationsKey = isCorrect ? 'correctClassifications' : 'incorrectClassifications';
    let classifications = JSON.parse(localStorage.getItem(classificationsKey)) || [];
    classifications.push(data);
    localStorage.setItem(classificationsKey, JSON.stringify(classifications));

    // Aktualisiere die Tabellen mit den letzten Klassifizierungen
    loadLastClassifications();
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

    data.forEach(item => {
        let row = tableBody.insertRow();
        let thumbnailCell = row.insertCell(0);
        let labelCell = row.insertCell(1);
        let confidenceCell = row.insertCell(2);

        thumbnailCell.innerHTML = `<img src="${item.thumbnailUrl}" width="100">`;
        labelCell.textContent = item.label;
        confidenceCell.textContent = item.confidence.toFixed(2) + '%'; // Formatiere Confidence als Prozentangabe
    });
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

