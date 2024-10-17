
//*******************************************************************************//
//Synchronous

function synchronous() {
    reset();
    const ref = 'data/reference.json';
    let nextFile = ref;

    // Loop while there's another file with 'data_location' in JSON
    while (nextFile) {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', nextFile, false);
        xhr.send();
        if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);

            // If we're fetching reference.json, we can skip looking for 'data'
            if (nextFile === ref) {
                // Get the next file
                nextFile = 'data/' + data.data_location;
            } else {
                // Check if 'data' property exists and is an array for data1 and data2
                if (data && data.data && Array.isArray(data.data)) {
                    show(data); //send data object to show func
                } else {
                    console.error("Data incorrect") //console log that the data is incorrect
                    break;
                }

                // If 'data_location' exists, set nextFile to it, otherwise break the loop
                if (data.data_location) {
                    nextFile = 'data/' + data.data_location;
                } else {
                    nextFile = null; // Exit loop if no more files
                }
            }
        } else {
            console.error('Failed to fetch:', nextFile);
            break; // Stop the loop on failed request
        }
    }

    // Fetch the known data3.json
    xhr = new XMLHttpRequest();
    xhr.open('GET', 'data/data3.json', false);
    xhr.send();
    if (xhr.status === 200) {
        const data3 = JSON.parse(xhr.responseText);

        // Check if 'data' property exists and is an array for data3
        if (data3 && data3.data && Array.isArray(data3.data)) {
            show(data3);
        } else {
            console.error('Unexpected data format:', data3);
        }
    }
}

//*******************************************************************************//
//Asynchronous

function async() {
    reset();  // Clear the existing table data
    const ref = 'data/reference.json';

    // Fetch reference.json asynchronously
    const xhrRef = new XMLHttpRequest();
    xhrRef.open('GET', ref, true);
    xhrRef.onreadystatechange = function () {
        if (xhrRef.readyState === 4 && xhrRef.status === 200) {
            const refData = JSON.parse(xhrRef.responseText);
            // Start fetching the first dynamic data file
            asyncNext('data/' + refData.data_location);
        }
    };
    xhrRef.send();

    // Fetch data3.json after starting to fetch the first dynamic file
    asyncData3();
}

function asyncNext(nextFile) {
    if (!nextFile) return; // Exit if there are no more files

    const xhr = new XMLHttpRequest();
    xhr.open('GET', nextFile, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            show(data); // show the fetched data

            // Determine the next file to fetch based on 'data_location'
            if (data.data_location) {
                // Fetch the next file using its data_location
                fetchNext('data/' + data.data_location);
            }
        } else if (xhr.readyState === 4) {
            console.error('Failed to fetch', nextFile);
        }
    };
    xhr.send();
}

function asyncData3() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'data/data3.json', true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const data3 = JSON.parse(xhr.responseText);
            show(data3); // Process data3.json
        } else if (xhr.readyState === 4) {
            console.error('Failed to fetch data3.json');
        }
    };
    xhr.send();
}


//*******************************************************************************//
//Fetch and promises

function fetchAndPromise() {
    reset();  // Clear the existing table data
    const ref = 'data/reference.json';

    fetch(ref)
        .then(response => {
            return response.json();
        })
        .then(refData => {
            // Start fetching the first dynamic data file
            return fetchNext('data/' + refData.data_location);
        })
        .then(() => {
            // Finally fetch data3.json
            return fetchData3();
        })
        .catch(error => console.error('Error:', error));
}

function fetchNext(nextFile) {
    if (!nextFile) return; // Exit if there are no more files

    return fetch(nextFile)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch ${nextFile}`);
            }
            return response.json();
        })
        .then(data => {
            // Process the fetched data
            show(data);

            // Determine the next file to fetch based on 'data_location'
            if (data.data_location) {
                // Fetch the next file
                return fetchNext('data/' + data.data_location);
            }
        });
}

function fetchData3() {
    return fetch('data/data3.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to get data3.json');
            }
            return response.json();
        })
        .then(data3 => {
            show(data3); // Process data3.json
        });
}

//*******************************************************************************//
//Helper functions

function reset() {
    const tableBody = document.querySelector('#data-table tbody');
    tableBody.innerHTML = '';
}

function show(data) {
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
