let boxes = {
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
    7: []
};

if (localStorage.getItem('leitnerBoxes')) {
    boxes = JSON.parse(localStorage.getItem('leitnerBoxes'));
}

const revisionIntervals = {
    1: 1,
    2: 2,
    3: 4,
    4: 7,
    5: 14,
    6: 30,
    7: 60
};

function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function isDueForRevision(dueDate) {
    const today = new Date();
    return new Date(dueDate) <= today;
}

function updateUI() {
    for (let i = 1; i <= 7; i++) {
        const ul = document.getElementById(`box${i}`);
        ul.innerHTML = "";
        boxes[i].forEach(partition => {
            const li = document.createElement('li');
            li.textContent = `${partition.name} (Révision : ${partition.dueDate})`;
            ul.appendChild(li);
        });
    }
    localStorage.setItem('leitnerBoxes', JSON.stringify(boxes));
}

document.getElementById('add-button').addEventListener('click', () => {
    const partitionName = document.getElementById('partition-name').value;
    if (partitionName) {
        const dueDate = addDays(new Date(), revisionIntervals[1]);
        boxes[1].push({name: partitionName, dueDate: dueDate.toISOString().split('T')[0]});
        updateUI();
        document.getElementById('partition-name').value = '';
    }
});

let currentPartition = null;
let currentBox = 1;

function getRandomPartition() {
    for (let i = 1; i <= 7; i++) {
        const duePartitions = boxes[i].filter(partition => isDueForRevision(partition.dueDate));
        if (duePartitions.length > 0) {
            currentBox = i;
            const index = Math.floor(Math.random() * duePartitions.length);
            currentPartition = duePartitions[index];
            document.getElementById('partition-display').textContent = currentPartition.name;
            break;
        }
    }
}

document.getElementById('correct-button').addEventListener('click', () => {
    if (currentPartition && currentBox < 7) {
        boxes[currentBox] = boxes[currentBox].filter(p => p !== currentPartition);
        currentPartition.dueDate = addDays(new Date(), revisionIntervals[currentBox + 1]).toISOString().split('T')[0];
        boxes[currentBox + 1].push(currentPartition);
        updateUI();
        getRandomPartition();
    }
});

document.getElementById('incorrect-button').addEventListener('click', () => {
    if (currentPartition && currentBox > 1) {
        boxes[currentBox] = boxes[currentBox].filter(p => p !== currentPartition);
        currentPartition.dueDate = addDays(new Date(), revisionIntervals[currentBox - 1]).toISOString().split('T')[0];
        boxes[currentBox - 1].push(currentPartition);
        updateUI();
        getRandomPartition();
    }
});

getRandomPartition();
