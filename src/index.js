const elements = {
    connectButton: document.querySelector('#connect'),
    disconnectButton: document.querySelector('#disconnect'),
    logButton: document.querySelector('#log'),
    saveButton: document.querySelector('#save'),
    bluetoothIsAvailable: document.querySelector('#bluetooth-is-available'),
    table: document.querySelector('#table'),
    logInfo: document.querySelector('#log-info'),
    fileInfo: document.querySelector('#file-info'),
    fileTitle: document.querySelector('.file-title'),
    spinner: document.querySelector('#spinner'),
    shortname: document.querySelector('#set-shortname'),
    shortnameTitle: document.querySelector('#title-shortname'),
    formatButton: document.querySelector('#format-button'),
};

let hexString = '';
let content = null;
const connection = new DVBDeviceBLE();

const toggleButtons = (connected) => {
    elements.connectButton.style.display = connected ? 'none' : 'block';
    elements.disconnectButton.style.display = connected ? 'block' : 'none';
};

const clearTableRows = () => {
    while (elements.table.rows.length > 1) {
        elements.table.deleteRow(1);
    }
};

const scanDevices = async () => {
    try {
        elements.spinner.style.display = 'block';
        await connection.connect();
        const files = await connection.getFileList(); // Added await here
        files.forEach(file => generateTableRows(file.name, file.length)); // Populate table with files
    } catch (error) {
        console.error('Failed to scan devices:', error);
    } finally {
        elements.spinner.style.display = 'none';
    }
};

const saveFile = () => {
    const name = elements.fileTitle.textContent;
    const file = new Blob([content]);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(file);
    link.download = name;
    link.click();
    URL.revokeObjectURL(link.href);
};

const printLog = (message) => {
    const now = new Date();
    const date = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
    const time = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
    const logMessage = `<p${message.includes('Error') ? ' class="red"' : ''}>${date} ${time} - ${message}</p>`;
    elements.logInfo.innerHTML += logMessage;
    if (message.includes('Error')) elements.logButton.style.color = 'red';
};

const downloadFile = async (e) => {
    elements.fileInfo.textContent = '';
    try {
        const name = e.target.name;
        if (!name) {
            elements.fileTitle.textContent = 'Error. Please close and try again';
            return;
        }
        elements.fileTitle.textContent = `Loading Content for ${name}`;
        content = await connection.getFileContent(name);
        hexString = content.map(x => x.toString()).join('');
        elements.fileInfo.style.display = 'block';
        elements.fileInfo.textContent = hexString;
        elements.fileTitle.textContent = name;
    } catch (error) {
        printLog(`Error: ${error}`);
    }
};

const generateTableRows = (name, length) => {
    const row = elements.table.insertRow(-1);
    const cellName = row.insertCell(0);
    const cellLength = row.insertCell(1);
    const cellButtons = row.insertCell(2);

    cellName.textContent = name;
    cellLength.textContent = length;

    const buttonDownload = document.createElement('button');
    buttonDownload.className = 'btn btn-sm btn-dark table-button';
    buttonDownload.setAttribute('data-bs-toggle', 'modal');
    buttonDownload.setAttribute('data-bs-target', '#file-content');
    buttonDownload.name = name;
    buttonDownload.textContent = 'Download';
    buttonDownload.addEventListener('click', downloadFile);

    cellButtons.appendChild(buttonDownload);
};

const initialize = () => {
    if (navigator?.bluetooth?.getAvailability()) {
        toggleButtons(false);
    } else {
        elements.bluetoothIsAvailable.style.display = 'block';
    }

    elements.connectButton.addEventListener('click', scanDevices);
    elements.saveButton.addEventListener('click', saveFile);
    elements.disconnectButton.addEventListener('click', () => {
        connection.disconnect();
        console.log('Disconnected');
        toggleButtons(false);
    });
    elements.logButton.addEventListener('click', () => {
        elements.logButton.style.color = 'white';
    });
    elements.shortname.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter') {
            const value = e.target.value;
            await connection.setShortName(value);
            elements.shortnameTitle.innerText = value;
            elements.shortname.value = '';
            console.log(`New Shortname: ${value}`);
        }
    });
    elements.formatButton.addEventListener('click', async () => {
        if (confirm('Are you sure you want to format the device?')) {
            try {
                await connection.formatStorage();
                alert('Device formatted');
                connection.disconnect();
            } catch (error) {
                alert('There was an error formatting your device.');
                console.error('Format error:', error);
            }
        }
    });

    connection.onDisconnect(clearTableRows);
    connection.onConnect(async () => {
        const shortname = await connection.getShortName();
        elements.shortnameTitle.innerText = shortname;
        console.log('Serial Number', connection.serialNumber);
    });
};

document.addEventListener('DOMContentLoaded', initialize);
