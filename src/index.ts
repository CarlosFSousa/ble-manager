const connection = new Ble();
// connection.checkBluetoothAvailability(false);
// connectButton.addEventListener('click', connection.scanFilteredDevices);
// console.log('initiated');

const list_files: HTMLElement = document.getElementById('list_files');
const shortname: HTMLElement = document.getElementById('shortname');
const busy_info: HTMLElement = document.getElementById('busy-info');
const bluetoothIsAvailable: HTMLElement = document.getElementById('bluetooth-is-available');
const bluetoothIsAvailableMessage: HTMLElement = document.getElementById('bluetooth-is-available-message');
const connectBlock: HTMLElement = document.getElementById('connect-block');
const connectButton: HTMLElement = document.querySelector('#start_scan');
const disconnectButton: HTMLElement = document.querySelector('#disconnect');

const printLog = (message: string) => {
  console.log(message);
};

const files = [
  {
    name: '1',
    length: '1000',
  },
  {
    name: '2',
    length: '1000',
  },
  {
    name: '3',
    length: '1000',
  },
  {
    name: '4',
    length: '1000',
  },
];

const generateBoxes = (name: string, length: string) => {
  const card: HTMLElement = document.createElement('div');
  card.className = 'card';
  card.style.width = '18rem';

  const card_body: HTMLElement = document.createElement('div');
  card_body.className = 'card-body';

  const displayName: HTMLElement = document.createElement('div');
  displayName.textContent = name;
  displayName.className = 'card-title';

  const displayLength: HTMLElement = document.createElement('p');
  displayLength.textContent = `${length} bytes`;
  displayLength.className = 'card-text';

  const displayContent: HTMLElement = document.createElement('textarea');
  displayContent.style.width = '100%';
  displayContent.style.margin = '0';
  displayContent.style.padding = '0';

  const button_row: HTMLElement = document.createElement('div');
  button_row.style.margin = '5px';
  button_row.style.display = 'flex';
  button_row.style.justifyContent = 'space-around';

  const button_save: HTMLButtonElement = document.createElement('button');
  button_save.className = 'btn btn-dark';
  button_save.textContent = 'Save';

  const button_download: HTMLButtonElement = document.createElement('button');
  button_download.className = 'btn btn-dark';
  button_download.textContent = 'Download';
  button_download.setAttribute('name', name);

  const button_post: HTMLButtonElement = document.createElement('button');
  button_post.className = 'btn btn-dark';
  button_post.textContent = 'Post';

  button_download.addEventListener('click', connection.getFileContent);

  card_body.appendChild(displayName);
  card_body.appendChild(displayLength);
  card_body.appendChild(displayContent);
  button_row.appendChild(button_download);
  button_row.appendChild(button_post);
  card_body.appendChild(button_row);
  card.appendChild(card_body);
  list_files.appendChild(card);
};

files.map((file) => {
  generateBoxes(file.name, file.length);
});
