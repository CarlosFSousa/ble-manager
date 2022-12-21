const list_files: HTMLElement = document.getElementById('list_files');
const bluetoothIsAvailable: HTMLElement = document.getElementById('bluetooth-is-available');
const connectButton: HTMLElement = document.querySelector('#connect');
const disconnectButton: HTMLElement = document.querySelector('#disconnect');
const table: HTMLTableElement = <HTMLTableElement>document.getElementById('table');
const logInfo: HTMLElement = document.getElementById('log-info');
const table_rows = document.getElementById('table-rows');

const checkAvailability = (() => {
  if (navigator && navigator.bluetooth && navigator.bluetooth.getAvailability()) {
    table.style.display = 'table';
    connectButton.style.display = 'block';
  } else {
    bluetoothIsAvailable.style.display = 'block';
  }
})();

const connection = new Ble();
const scanDevices = () => {};

connectButton.addEventListener('click', scanDevices);

const printLog = (message: string) => {
  const now: Date = new Date();
  const date: string = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  const time: string = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
  if (message.includes('Error')) {
    logInfo.innerHTML += `<p class="red">${date} ${time} - ${message}</p>`;
  } else {
    logInfo.innerHTML += `<p>${date} ${time} - ${message}</p>`;
  }
};

// printLog('testing');
// printLog('Error: this is an error');
// printLog('Seems to work');

// connection.listOfFiles = [
//   {
//     name: '1000-0001.dvb',
//     length: '1000',
//   },
//   {
//     name: '1000-0002.dvb',
//     length: '1000',
//   },
//   {
//     name: '1000-0003.dvb',
//     length: '1000',
//   },
//   {
//     name: '1000-0004.dvb',
//     length: '1000',
//   },
// ];

function downloadFile(e) {
  var i = e;
  console.log(i);
  console.log(e.target.name);
}
function deleteFile(e) {
  const name = e.target.name;
  console.log(connection.listOfFiles);
  connection.listOfFiles = connection.listOfFiles.filter((file) => {
    if (file.name === name) return false;
    return true;
  });
  console.log(connection.listOfFiles);
}

const generateBoxes = (name: string, length: string) => {
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

  const buttonDelete = document.createElement('button');
  buttonDelete.className = 'btn btn-sm btn-danger table-button';
  buttonDelete.name = name;
  buttonDelete.innerHTML = '<i class="fa fa-trash"></i><span style="font-size:smaller">Delete</span>';
  buttonDelete.addEventListener('click', deleteFile);

  cellButtons.appendChild(buttonDelete);
};

connection.listOfFiles.map((file) => {
  generateBoxes(file.name, file.length);
});
