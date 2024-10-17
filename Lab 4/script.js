function fetchDataSync() {
    resetTable();
    const referenceFile = 'reference.json';
    let files = [];

    // Fetch reference.json synchronously
    const xhrRef = new XMLHttpRequest();
    xhrRef.open('GET', referenceFile, false);
    xhrRef.send();
    if (xhrRef.status === 200) {
        const refData = JSON.parse(xhrRef.responseText);
        files.push(refData.data_location);
    }

    // Fetch data from files data1.json and data2.json synchronously
    files.push('data2.json', 'data3.json');
    files.forEach(file => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', file, false);
        xhr.send();
        if (xhr.status === 200) {
            processAndDisplayData(JSON.parse(xhr.responseText));
        }
    });
}

function fetchDataAsync() {
    resetTable();
    const referenceFile = 'reference.json';

    // Fetch reference.json asynchronously
    const xhrRef = new XMLHttpRequest();
    xhrRef.open('GET', referenceFile, true);
    xhrRef.onreadystatechange = function () {
        if (xhrRef.readyState === 4 && xhrRef.status === 200) {
            const refData = JSON.parse(xhrRef.responseText);
            const files = [refData.data_location, 'data2.json', 'data3.json'];
            fetchFilesAsync(files, 0);
        }
    };
    xhrRef.send();
}

function fetchFilesAsync(files, index) {
    if (index >= files.length) return;

    const xhr = new XMLHttpRequest();
    xhr.open('GET', files[index], true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            processAndDisplayData(JSON.parse(xhr.responseText));
            fetchFilesAsync(files, index + 1); // Fetch next file
        }
    };
    xhr.send();
}

function fetchDataWithFetch() {
    resetTable();
    const referenceFile = 'reference.json';

    fetch(referenceFile)
        .then(response => response.json())
        .then(refData => {
            const files = [refData.data_location, 'data2.json', 'data3.json'];
            return fetchFilesWithFetch(files);
        })
        .then(data => {
            data.forEach(fileData => processAndDisplayData(fileData));
        })
        .catch(error => console.error('Error:', error));
}

function fetchFilesWithFetch(files) {
    const fetchPromises = files.map(file => fetch(file).then(res => res.json()));
    return Promise.all(fetchPromises);
}

function resetTable() {
    const tableBody = document.querySelector('#data-table tbody');
    tableBody.innerHTML = '';
}

function processAndDisplayData(data) {
    const tableBody = document.querySelector('#data-table tbody');
    data.data.forEach(entry => {
        const row = document.createElement('tr');
        const name = entry.name.split(' ')[0];
        const surname = entry.name.split(' ')[1];
        const id = entry.id;

        row.innerHTML = `<td>${name}</td><td>${surname}</td><td>${id}</td>`;
        tableBody.appendChild(row);
    });
}
