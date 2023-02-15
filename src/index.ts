const connectButton = document.getElementById('connect');
const disconnectButton = document.getElementById('disconnect');
const logButton = document.getElementById('log');
const saveButton = document.getElementById('save');
const bluetoothIsAvailable = document.getElementById('bluetooth-is-available');
const table: any = document.getElementById('table');
const logInfo = document.getElementById('log-info');
const fileInfo = document.getElementById('file-info');
const fileTitle = document.querySelector('.file-title');
const spinner = document.getElementById('spinner');
const shortname: any = document.getElementById('set-shortname');
const shortnameTitle = document.getElementById('title-shortname');

if (navigator && navigator.bluetooth && navigator.bluetooth.getAvailability()) {
  table.style.display = 'table';
  connectButton.style.display = 'block';
} else {
  bluetoothIsAvailable.style.display = 'block';
}
let hex_string = '';
let content = null;

const connection = new DVBDeviceBLE();

connection.onDisconnect(function () {
  table.innerHTML = '';
  connectButton.style.display = 'block';
  disconnectButton.style.display = 'none';
});

connection.onConnect(async function () {
  const shortname = await connection.getShortName();
  shortnameTitle.innerText = shortname;
});

const scanDevices = async () => {
  try {
    spinner.style.display = 'block';
    await connection.connect();
    toggleButtons(true);
    const files = connection.getFileList();
    if (files.length > 0) {
      console.log('files', files);
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

const toggleButtons = (connected) => {
  if (connected) {
    connectButton.style.display = 'none';
    disconnectButton.style.display = 'block';
  } else {
    connectButton.style.display = 'block';
    disconnectButton.style.display = 'none';
  }
};
const printLog = (message) => {
  const now = new Date();
  const date = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  const time = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
  if (message.includes('Error')) {
    logInfo.innerHTML += `<p class="red">${date} ${time} - ${message}</p>`;
    logButton.style.color = 'red';
  } else {
    logInfo.innerHTML += `<p>${date} ${time} - ${message}</p>`;
  }
};
async function downloadFile(e) {
  // console.log(e.target);
  fileInfo.textContent = '';
  try {
    const name = e.target.name;
    if (name === undefined) {
      fileTitle.textContent = `Error.Please close and try again`;
    } else {
      fileTitle.textContent = `Loading Content for ${name}`;
    }
    content = await connection.getFileContent(name);
    hex_string = content.map((x) => x.toString()).join('');
    fileInfo.style.display = 'block';
    fileInfo.textContent = hex_string;
    fileTitle.textContent = name;
  } catch (error) {
    printLog(`Error: ${error}`);
  }
}
const saveFile = () => {
  const name = fileTitle.textContent;
  const file = new Blob([content]);
  const link = document.createElement('a');
  link.href = URL.createObjectURL(file);
  link.download = name;
  link.click();
  URL.revokeObjectURL(link.href);
};
const generateTableRows = (name, length) => {
  const row = table.insertRow(-1);
  const cellName = row.insertCell(0);
  const cellLength = row.insertCell(1);
  const cellButtons = row.insertCell(2);
  cellName.textContent = name;
  cellLength.textContent = length;
  const icon = document.createElement('i');
  icon.className = 'fa fa-download';
  const span = document.createElement('span');
  span.style.fontSize = 'smaller';
  span.textContent = 'Download';
  const buttonDownload = document.createElement('button');
  buttonDownload.className = 'btn btn-sm btn-dark table-button';
  buttonDownload.setAttribute('data-bs-toggle', 'modal');
  buttonDownload.setAttribute('data-bs-target', '#file-content');
  buttonDownload.name = name;
  buttonDownload.textContent = 'Download';
  // buttonDownload.textContent = '<i class="fa fa-download"></i><span style="font-size:smaller">Download</span>';
  // buttonDownload.appendChild(icon);
  // buttonDownload.appendChild(span);
  cellButtons.appendChild(buttonDownload);
  buttonDownload.addEventListener('click', downloadFile);
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

connectButton.addEventListener('click', scanDevices);
disconnectButton.addEventListener('click', () => {
  connection.disconnect();
  toggleButtons(false);
});
logButton.addEventListener('click', () => {
  logButton.style.color = 'white';
});
saveButton.addEventListener('click', saveFile);

shortname.addEventListener('keydown', async (e: any) => {
  if (e.key === 'Enter') {
    let value = e.target.value;
    await connection.setShortName(value);
    shortnameTitle.innerText = value;
    shortname.value = '';
    console.log(`New Shortname: ${value}`);
  }
});
