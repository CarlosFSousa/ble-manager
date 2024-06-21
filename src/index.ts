const connectButton = document.getElementById('connect') as HTMLButtonElement;
const disconnectButton = document.getElementById('disconnect') as HTMLButtonElement;
const logButton = document.getElementById('log') as HTMLButtonElement;
const saveButton = document.getElementById('save') as HTMLButtonElement;
const bluetoothIsAvailable = document.getElementById('bluetooth-is-available') as HTMLDivElement;
const table = document.getElementById('table') as HTMLTableElement;
const logInfo = document.getElementById('log-info') as HTMLDivElement;
const fileInfo = document.getElementById('file-info') as HTMLDivElement;
const fileTitle = document.querySelector('.file-title') as HTMLSpanElement;
const spinner = document.getElementById('spinner') as HTMLDivElement;
const shortname = document.getElementById('set-shortname') as HTMLInputElement;
const shortnameTitle = document.getElementById('title-shortname') as HTMLSpanElement;

if (navigator?.bluetooth?.getAvailability()) {
  table.style.display = 'table';
  connectButton.style.display = 'block';
} else {
  bluetoothIsAvailable.style.display = 'block';
}

let hexString = '';
let content: number[] | null = null;

const connection = new DVBDeviceBLE();

connection.onDisconnect(() => {
  table.innerHTML = '';
  connectButton.style.display = 'block';
  disconnectButton.style.display = 'none';
});

connection.onConnect(async () => {
  const shortname = await connection.getShortName();
  shortnameTitle.innerText = shortname;
});

const scanDevices = async (): Promise<void> => {
  try {
    spinner.style.display = 'block';
    await connection.connect();
    toggleButtons(true);
    const files = await connection.getFileList();
    if (files.length > 0) {
      console.log('files', files);
      files.forEach((file) => {
        generateTableRows(file.name, file.length);
      });
    }
    spinner.style.display = 'none';
  } catch (error) {
    printLog(`Error: ${error}`);
    spinner.style.display = 'none';
  }
};

const toggleButtons = (connected: boolean): void => {
  connectButton.style.display = connected ? 'none' : 'block';
  disconnectButton.style.display = connected ? 'block' : 'none';
};

const printLog = (message: string): void => {
  const now = new Date();
  const date = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  const time = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
  const logMessage = `<p${message.includes('Error') ? ' class="red"' : ''}>${date} ${time} - ${message}</p>`;
  logInfo.innerHTML += logMessage;
  if (message.includes('Error')) logButton.style.color = 'red';
};

const downloadFile = async (e: Event): Promise<void> => {
  fileInfo.textContent = '';
  try {
    const target = e.target as HTMLButtonElement;
    const name = target.name;
    if (!name) {
      fileTitle.textContent = 'Error. Please close and try again';
      return;
    }
    fileTitle.textContent = `Loading Content for ${name}`;
    content = await connection.getFileContent(name);
    hexString = content.map(x => x.toString(16)).join('');
    fileInfo.style.display = 'block';
    fileInfo.textContent = hexString;
    fileTitle.textContent = name;
  } catch (error) {
    printLog(`Error: ${error}`);
  }
};

const saveFile = (): void => {
  if (content) {
    const name = fileTitle.textContent || 'download';
    const file = new Blob([new Uint8Array(content)]);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(file);
    link.download = name;
    link.click();
    URL.revokeObjectURL(link.href);
  }
};

const generateTableRows = (name: string, length: number): void => {
  const row = table.insertRow(-1);
  const cellName = row.insertCell(0);
  const cellLength = row.insertCell(1);
  const cellButtons = row.insertCell(2);

  cellName.textContent = name;
  cellLength.textContent = length.toString();

  const buttonDownload = document.createElement('button');
  buttonDownload.className = 'btn btn-sm btn-dark table-button';
  buttonDownload.setAttribute('data-bs-toggle', 'modal');
  buttonDownload.setAttribute('data-bs-target', '#file-content');
  buttonDownload.name = name;
  buttonDownload.textContent = 'Download';
  buttonDownload.addEventListener('click', downloadFile);

  cellButtons.appendChild(buttonDownload);
};

connectButton.addEventListener('click', scanDevices);
disconnectButton.addEventListener('click', () => {
  connection.disconnect();
  toggleButtons(false);
});
logButton.addEventListener('click', () => {
  logButton.style.color = 'white';
});
saveButton.addEventListener('click', saveFile);

shortname.addEventListener('keydown', async (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    const target = e.target as HTMLInputElement;
    const value = target.value;
    await connection.setShortName(value);
    shortnameTitle.innerText = value;
    shortname.value = '';
    console.log(`New Shortname: ${value}`);
  }
});
