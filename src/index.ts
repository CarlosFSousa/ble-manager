const connectButton: HTMLElement = document.getElementById('connect');
const disconnectButton: HTMLElement = document.getElementById('disconnect');
const logButton: HTMLElement = document.getElementById('log');
const list_files: HTMLElement = document.getElementById('list_files');
const bluetoothIsAvailable: HTMLElement = document.getElementById('bluetooth-is-available');
const table: HTMLTableElement = <HTMLTableElement>document.getElementById('table');
const logInfo: HTMLElement = document.getElementById('log-info');
const table_rows = document.getElementById('table-rows');
const spinner = document.getElementById('spinner');

if (navigator && navigator.bluetooth && navigator.bluetooth.getAvailability()) {
  table.style.display = 'table';
  connectButton.style.display = 'block';
} else {
  bluetoothIsAvailable.style.display = 'block';
}

const connection = new Ble();
const scanDevices = async () => {
  try {
    spinner.style.display = 'block';
    await connection.connect();
    toggleButtons(true);
    const files = connection.getFiles();
    if (files.length > 0) {
      files.map((file) => {
        generateTableRows(file.name, file.length);
      });
    }

    spinner.style.display = 'none';
  } catch (error) {
    printLog(`Error: ${error}`);
    spinner.style.display = 'none';
  }
};

connectButton.addEventListener('click', scanDevices);

disconnectButton.addEventListener('click', () => {
  connection.disconnect();
  toggleButtons(false);
});

logButton.addEventListener('click', () => {
  logButton.style.color = 'white';
});
const toggleButtons = (connected: boolean) => {
  if (connected) {
    connectButton.style.display = 'none';
    disconnectButton.style.display = 'block';
  } else {
    connectButton.style.display = 'block';
    disconnectButton.style.display = 'none';
  }
};
const printLog = (message: string) => {
  const now: Date = new Date();
  const date: string = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  const time: string = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
  if (message.includes('Error')) {
    logInfo.innerHTML += `<p class="red">${date} ${time} - ${message}</p>`;
    logButton.style.color = 'red';
  } else {
    logInfo.innerHTML += `<p>${date} ${time} - ${message}</p>`;
  }
};

async function downloadFile(e: any) {
  const name = e.target.name;
  const content = await connection.getFileContent(name);
  console.log(content);
}

const generateTableRows = (name: string, length: string) => {
  const row = table.insertRow(-1);
  const cellName = row.insertCell(0);
  const cellLength = row.insertCell(1);
  const cellButtons = row.insertCell(2);
  cellName.textContent = name;
  cellLength.textContent = length;

  const buttonDownload = document.createElement('button');
  buttonDownload.className = 'btn btn-sm btn-dark table-button';
  buttonDownload.name = name;
  buttonDownload.innerHTML = '<i class="fa fa-download"></i><span style="font-size:smaller">Download</span>';
  buttonDownload.addEventListener('click', downloadFile);

  cellButtons.appendChild(buttonDownload);

  // const buttonDelete = document.createElement('button');
  // buttonDelete.className = 'btn btn-sm btn-danger table-button';
  // buttonDelete.name = name;
  // buttonDelete.innerHTML = '<i class="fa fa-trash"></i><span style="font-size:smaller">Delete</span>';
  // buttonDelete.addEventListener('click', deleteFile);

  // cellButtons.appendChild(buttonDelete);
};

// function deleteFile(e) {
//   const name = e.target.name;
//   console.log(connection.listOfFiles);
//   connection.listOfFiles = connection.listOfFiles.filter((file) => {
//     if (file.name === name) return false;
//     return true;
//   });
//   console.log(connection.listOfFiles);
// }
