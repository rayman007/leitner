let boxes = {
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
    7: []
};

// Charger les partitions sauvegardées depuis le localStorage
if (localStorage.getItem('leitnerBoxes')) {
    boxes = JSON.parse(localStorage.getItem('leitnerBoxes'));
}

// Intervalles de révision
const revisionIntervals = {
    1: 1,
    2: 2,
    3: 4,
    4: 7,
    5: 14,
    6: 30,
    7: 60
};

// Fonction pour ajouter des jours à une date
function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

// Fonction pour vérifier si une partition est due pour révision
function isDueForRevision(dueDate) {
    const today = new Date();
    return new Date(dueDate) <= today;
}

// Mettre à jour l'interface utilisateur
function updateUI() {
    for (let i = 1; i <= 7; i++) {
        const ul = document.getElementById(`box${i}`);
        ul.innerHTML = "";
        if (boxes[i] && boxes[i].length > 0) {
            boxes[i].forEach((partition, index) => {
                const li = document.createElement('li');
                li.innerHTML = `
                    ${partition.name} (Révision : ${partition.dueDate})
                    <span class="delete-cross" data-box="${i}" data-index="${index}">&times;</span>
                `;
                ul.appendChild(li);
            });
        }
    }
    localStorage.setItem('leitnerBoxes', JSON.stringify(boxes));

    document.querySelectorAll('.delete-cross').forEach(cross => {
        cross.addEventListener('click', (e) => {
            const boxNumber = e.target.getAttribute('data-box');
            const partitionIndex = e.target.getAttribute('data-index');
            confirmDeletePartition(boxNumber, partitionIndex);
        });
    });
}

// Navigation entre les pages
function showPage(sectionId) {
    const sections = document.querySelectorAll('.page-section');
    sections.forEach(section => section.style.display = 'none');
    document.getElementById(sectionId).style.display = 'block';
}

// Gestion des événements pour la navigation
document.getElementById('view-boxes').addEventListener('click', () => showPage('view-boxes-section'));
document.getElementById('add-partition').addEventListener('click', () => showPage('add-partition-section'));
document.getElementById('today-revisions').addEventListener('click', () => showPage('today-revisions-section'));

// Ajouter une partition
document.getElementById('add-button').addEventListener('click', () => {
    const partitionName = document.getElementById('partition-name').value;
    if (partitionName) {
        const dueDate = addDays(new Date(), revisionIntervals[1]);
        boxes[1].push({ name: partitionName, dueDate: dueDate.toISOString().split('T')[0] });
        updateUI();
        document.getElementById('partition-name').value = '';
    }
});

let currentPartition = null;
let currentBox = 1;

// Sélectionner une partition aléatoire due pour révision
function getRandomPartition() {
    currentPartition = null;
    for (let i = 1; i <= 7; i++) {
        const duePartitions = boxes[i].filter(partition => isDueForRevision(partition.dueDate));
        if (duePartitions.length > 0) {
            currentBox = i;
            const index = Math.floor(Math.random() * duePartitions.length);
            currentPartition = duePartitions[index];
            document.getElementById('partition-display').textContent = currentPartition.name;
            return;
        }
    }
    document.getElementById('partition-display').textContent = "Aucune partition due pour révision";
}

// Bouton "Correct"
document.getElementById('correct-button').addEventListener('click', () => {
    if (currentPartition && currentBox < 7) {
        boxes[currentBox] = boxes[currentBox].filter(p => p !== currentPartition);
        currentPartition.dueDate = addDays(new Date(), revisionIntervals[currentBox + 1]).toISOString().split('T')[0];
        boxes[currentBox + 1].push(currentPartition);
        updateUI();
        getRandomPartition();
    }
});

// Bouton "Incorrect"
document.getElementById('incorrect-button').addEventListener('click', () => {
    if (currentPartition && currentBox > 1) {
        boxes[currentBox] = boxes[currentBox].filter(p => p !== currentPartition);
        currentPartition.dueDate = addDays(new Date(), revisionIntervals[currentBox - 1]).toISOString().split('T')[0];
        boxes[currentBox - 1].push(currentPartition);
        updateUI();
        getRandomPartition();
    }
});

// Fonction pour confirmer la suppression
function confirmDeletePartition(boxNumber, partitionIndex) {
    const confirmation = confirm("Voulez-vous vraiment supprimer cette partition ?");
    if (confirmation) {
        deletePartition(boxNumber, partitionIndex);
    }
}

// Fonction pour supprimer une partition
function deletePartition(boxNumber, partitionIndex) {
    boxes[boxNumber].splice(partitionIndex, 1);
    updateUI();
}

// Recharger l'interface avec les données sauvegardées au chargement de la page
window.onload = function() {
    updateUI();
    getRandomPartition();
};
