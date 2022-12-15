// Carlos Fontes e Sousa 22

class BleConnection {
  current_device: any = null;
  _device: any = null;
  _service: any = null;
  _get_list_characteristic: any = null;
  _get_list_content: any = null;
  _write_content: any = null;
  _get_shortname: any = null;
  _display_info: any = null;
  _listing_files_busy: boolean = false;
  _accum: number = 0;
  SERVICE_UUID: string = 'dbd00001-ff30-40a5-9ceb-a17358d31999';
  GET_LIST_CHARACTERISTIC_UUID: string = 'dbd00010-ff30-40a5-9ceb-a17358d31999';
  READ_CONTENT_CHARACTERISTIC_UUID: string = 'dbd00012-ff30-40a5-9ceb-a17358d31999';
  WRITE_CONTENT_CHARACTERISTIC_UUID: string = 'dbd00011-ff30-40a5-9ceb-a17358d31999';
  GET_SHORTNAME_CHARACTERISTIC_UUID: string = 'dbd00002-ff30-40a5-9ceb-a17358d31999';

  scanFilteredDevices = async () => {
    try {
      this.printLog('Requesting BLE connection');
      await this.connect();
      this.current_device = this._device;
      this._listing_files_busy = true;
      await this.getListFiles();
      this._listing_files_busy = false;
      this.busy_info();
      disconnectButton.addEventListener('click', () => {
        this.current_device.gatt.disconnect();
        this.printLog('Device disconnected');
      });
      this.connected();
    } catch (error) {
      this.printLog(`Error - ${error}`);
      this._listing_files_busy = false;
      this.busy_info();
    }
  };

  connect = async () => {
    try {
      this._device = await this._requestDevice([{ name: 'DVBdiver' }]);
      this.printLog('Device Connected');
      this._device.addEventListener('gattserverdisconnected', async (event: any) => {
        console.log(event);
        connectButton.style.display = 'block';
        disconnectButton.style.display = 'none';
      });
      const connection: any = await this._device.gatt.connect();
      this._service = await connection.getPrimaryService(this.SERVICE_UUID);
      this.printLog('Service Connected');
      this._get_list_characteristic = await this._service.getCharacteristic(this.GET_LIST_CHARACTERISTIC_UUID);
      this._write_content = await this._service.getCharacteristic(this.WRITE_CONTENT_CHARACTERISTIC_UUID);
      this._get_list_content = await this._service.getCharacteristic(this.READ_CONTENT_CHARACTERISTIC_UUID);
      this.displayShortName();
    } catch (error) {
      this.printLog(`Error: ${error}`);
      this.disconnect();
    }
  };

  connected = () => {
    connectButton.style.display = 'none';
    disconnectButton.style.display = 'block';
    bluetoothIsAvailable.display = 'none';
  };

  disconnect = () => {
    this._device.gatt.disconnect();
    this._device = null;
    this._service = null;
    this._get_list_characteristic = null;
    this._get_list_content = null;
    this._get_shortname = null;
    this.printLog('Device Disconnected');
    shortname.style.display = 'none';
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
    //@ts-ignore
    return navigator.bluetooth.requestDevice(params);
  };

  getListFiles = async () => {
    busy_info.textContent = 'Fetching Files';
    while (true) {
      this.busy_info();
      const value: any = await this._get_list_characteristic.readValue();
      const message: Uint8Array = new Uint8Array(value.buffer);
      if (message.byteLength === 0) break;
      const byteString: string = String.fromCharCode(...message);
      const split_string: string[] = byteString.split(';');
      const name: string = split_string[0];
      const length: string = split_string[1];
      this.generateBoxes(name, length);
    }
  };

  generateBoxes = (name: string, length: string) => {
    const list_files: HTMLElement = document.getElementById('list_files');

    const card: HTMLElement = document.createElement('div');
    card.className = 'card';
    card.style.width = '18rem';
    const card_body: HTMLElement = document.createElement('div');
    card_body.className = 'card-body';

    const h6: HTMLElement = document.createElement('h6');
    h6.innerText = name;
    h6.className = 'card-title';

    const p: HTMLElement = document.createElement('p');
    p.innerText = `File length: ${length}`;
    p.className = 'card-text';

    const text_box: HTMLElement = document.createElement('textarea');
    text_box.style.width = '100%';
    text_box.style.margin = '0';
    text_box.style.padding = '0';
    //    text_box.setAttribute('cols', '32');

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

    button_download.addEventListener('click', async (e: any) => {
      let hex_text = '';
      let offset = 0;
      const id = e.target.name;
      const uf8encode = new TextEncoder();
      const name_bytes = uf8encode.encode(`${id};${offset};`);

      await this._write_content.writeValueWithoutResponse(name_bytes);
      while (true) {
        this._display_info = await this._get_list_content.readValue();
        console.log(this._display_info);
        if (this._display_info.byteLength === 0) {
          break;
        } else {
          offset += this._display_info.byteLength;
          console.log(`Appending length to offset:  ${offset}`);
          const uf8encode = new TextEncoder();
          const name_bytes = uf8encode.encode(`${id};${offset};`);
          await this._write_content.writeValueWithoutResponse(name_bytes);
        }
        hex_text += this.buf2hex(this._display_info.buffer);
      }
      console.log(`Text: ${hex_text}`);
      text_box.innerText = hex_text;

      const blob = new Blob(this._display_info.buffer);
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = id;
      link.click();
    });

    const button_post: HTMLButtonElement = document.createElement('button');
    button_post.className = 'btn btn-dark';
    button_post.textContent = 'Post';

    button_post.addEventListener('click', async (e: any) => {
      console.log('clicked');
    });

    card_body.appendChild(h6);
    card_body.appendChild(p);
    card_body.appendChild(text_box);
    button_row.appendChild(button_download);
    button_row.appendChild(button_post);
    card_body.appendChild(button_row);
    card.appendChild(card_body);
    list_files.appendChild(card);
  };

  printLog = (message: string) => {
    const myDiv: HTMLElement = document.getElementById('log');
    const p: HTMLElement = document.createElement('p');
    if (message.includes('Error')) p.className = 'red';
    const now: Date = new Date();
    const date: string = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
    const time: string = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
    p.textContent = `${date} ${time} - ${message}`;
    myDiv.append(p);
    if (myDiv.textContent.trim() !== '') {
      myDiv.style.border = '1px solid black';
    }
  };

  checkBluetoothAvailability = (connected: boolean) => {
    if (
      navigator &&
      //@ts-ignore
      navigator.bluetooth &&
      //@ts-ignore
      navigator.bluetooth.getAvailability() &&
      connected == false
    ) {
      bluetoothIsAvailableMessage.innerText = 'Bluetooth is available in your browser.';
      bluetoothIsAvailable.className = 'alert alert-success';
      connectBlock.style.display = 'block';
    } else {
      bluetoothIsAvailable.className = 'alert alert-danger';
      bluetoothIsAvailableMessage.innerText = 'Bluetooth is not available in your browser.';
    }
  };

  buf2hex(buffer: ArrayBuffer) {
    return [...new Uint8Array(buffer)].map((x) => x.toString().padStart(2, '0')).join('');
  }

  busy_info() {
    if (this._listing_files_busy) {
      if (this._accum === 4) {
        busy_info.textContent = 'Fecthing Files';
        this._accum = 0;
      }
      busy_info.textContent += '.';
      this._accum++;
    } else {
      busy_info.textContent = '';
    }
  }

  async displayShortName() {
    shortname.style.display = 'block';
    this._get_shortname = await this._service.getCharacteristic(this.GET_SHORTNAME_CHARACTERISTIC_UUID);
    const value = await this._get_shortname.readValue();
    const message: Uint8Array = new Uint8Array(value.buffer);
    const byteString: string = String.fromCharCode(...message);
    console.log(byteString);
    shortname.textContent = byteString;
  }
}
