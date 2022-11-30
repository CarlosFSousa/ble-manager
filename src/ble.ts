// Carlos Fontes e Sousa 22

class BleConnection {
  current_device: any = null;
  _device: any = null;
  _service: BluetoothRemoteGATTService | any = null;
  _characteristic: BluetoothRemoteGATTCharacteristic | any = null;
  SERVICE_UUID: String = 'dbd00001-ff30-40a5-9ceb-a17358d31999';
  CHARACTERISTIC_UUID: String = 'dbd00010-ff30-40a5-9ceb-a17358d31999';

  connect = async () => {
    try {
      this._device = await this._requestDevice([{ name: 'DVBdiver' }]);
      this.printLog('Device Connected');
      this._device.addEventListener(
        'gattserverdisconnected',
        async (event: any) => {
          console.log(event);
          connectButton.style.display = 'block';
          disconnectButton.style.display = 'none';
        }
      );
      const connection: any = await this._device.gatt.connect();
      this._service = await connection.getPrimaryService(this.SERVICE_UUID);
      this.printLog('Service Connected');
      this._characteristic = await this._service.getCharacteristic(
        this.CHARACTERISTIC_UUID
      );
    } catch (error) {
      this.printLog(`Error: ${error}`);
      this.disconnect();
    }
  };

  disconnect = () => {
    this._device.gatt.disconnect();
    this._device = null;
    this._service = null;
    this._characteristic = null;
  };

  _requestDevice = (filters: any) => {
    const params: any = {
      acceptAllDevices: true,
      optionalServices: [this.SERVICE_UUID],
    };
    if (filters) {
      params.filters = filters;
      params.acceptAllDevices = false;
    }
    return navigator.bluetooth.requestDevice(params);
  };

  displayFiles = async () => {
    while (true) {
      const value: any = await this._characteristic.readValue();
      const message: any = new Uint8Array(value.buffer);
      if (message.byteLength === 0) return;
      let str = '';
      for (let i = 0; i < message.byteLength; i++) {
        str += String.fromCharCode(message[i]);
      }
      generateBoxes(str);
    }
  };
  scanFilteredDevices = async () => {
    try {
      this.printLog('Requesting BLE connection');
      await this.connect();
      this.current_device = this._device;
      await this.displayFiles();
      disconnectButton.addEventListener('click', () => {
        this.current_device.gatt.disconnect();
        this.printLog('Device disconnected');
      });
      this.connected();
    } catch (error) {
      this.printLog(`Error - ${error}`);
    }
  };

  connected = () => {
    connectButton.style.display = 'none';
    disconnectButton.style.display = 'block';
  };

  printLog = (message: string) => {
    var myDiv: any = document.getElementById('log');
    var p: any = document.createElement('p');
    if (message.includes('Error')) p.className = 'red';
    const now = new Date();
    const date = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
    const time = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
    p.textContent = `${date} ${time} - ${message}`;
    myDiv.append(p);
    if (myDiv.textContent.trim() !== '') {
      myDiv.style.border = '1px solid black';
    }
  };
}
// ******************************* End of class ********************************

const bluetoothIsAvailable: any = document.getElementById(
  'bluetooth-is-available'
);
const bluetoothIsAvailableMessage: any = document.getElementById(
  'bluetooth-is-available-message'
);
const connectBlock: any = document.getElementById('connect-block');

const checkBluetoothAvailability = async () => {
  if (
    navigator &&
    navigator.bluetooth &&
    (await navigator.bluetooth.getAvailability())
  ) {
    bluetoothIsAvailableMessage.innerText =
      'Bluetooth is available in your browser.';
    bluetoothIsAvailable.className = 'alert alert-success';
    connectBlock.style.display = 'block';
  } else {
    bluetoothIsAvailable.className = 'alert alert-danger';
    bluetoothIsAvailableMessage.innerText =
      'Bluetooth is not available in your browser.';
  }
};

const generateBoxes = (name: string) => {
  console.log(name);
  const list_files: any = document.getElementById('list_files');
  const card: any = document.createElement('div');
  card.className = 'card';
  card.style.width = '18rem';
  // card.id = name;
  const card_body: any = document.createElement('div');
  card_body.className = 'card-body';
  const h6: any = document.createElement('h6');
  h6.innerText = name;
  h6.className = 'card-title';
  const text: any = document.createElement('p');
  text.style.display = 'none';
  text.className = 'card-text';
  const button: any = document.createElement('button');
  button.className = 'btn btn-success';
  button.textContent = 'Download';

  card_body.appendChild(h6);
  card_body.appendChild(text);
  card_body.appendChild(button);
  card.appendChild(card_body);
  list_files.appendChild(card);
};

checkBluetoothAvailability();
const connectButton: any = document.querySelector('#start_scan');
const disconnectButton: any = document.querySelector('#disconnect');
const connection = new BleConnection();
connectButton.addEventListener('click', connection.scanFilteredDevices);
