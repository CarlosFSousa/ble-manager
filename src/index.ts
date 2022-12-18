// const connection = new Ble();
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
};
