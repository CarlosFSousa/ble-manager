class DVBDeviceBLE {
  listOfFiles: any = [];
  shortname: any = null;
  device: any = null;
  service: any = null;
  serialNumber: any = null;
  SERVICE_UUID: BluetoothCharacteristicUUID = 'dbd00001-ff30-40a5-9ceb-a17358d31999';
  LIST_FILES_UUID: BluetoothCharacteristicUUID = 'dbd00010-ff30-40a5-9ceb-a17358d31999';
  SHORTNAME_UUID: BluetoothCharacteristicUUID = 'dbd00002-ff30-40a5-9ceb-a17358d31999';
  WRITE_TO_DEVICE_UUID: BluetoothCharacteristicUUID = 'dbd00011-ff30-40a5-9ceb-a17358d31999';
  READ_FROM_DEVICE_UUID: BluetoothCharacteristicUUID = 'dbd00012-ff30-40a5-9ceb-a17358d31999';
  FORMAT_STORAGE_UUID: BluetoothCharacteristicUUID = 'dbd00013-ff30-40a5-9ceb-a17358d31999';
  SERIAL_NUMBER_UUID = '00002a25-0000-1000-8000-00805f9b34fb';

  public async connect() {
    try {
      const params = {
        optionalServices: [this.SERVICE_UUID, this.SERIAL_NUMBER_UUID],
        filters: [{ name: 'DVBdiver' }],
      };
      this.device = await navigator.bluetooth.requestDevice(params);
      this.device.addEventListener('gattserverdisconnected', (event) => {
        console.log(event);
        this.disconnect();
      });
      const connection = await this.device.gatt.connect();
      this.service = await connection.getPrimaryService(this.SERVICE_UUID);
      console.log(`Connected to service ${this.SERVICE_UUID}`);
      await this.initializeShortName();
      await this.initializeSerialNumber();
      console.log(this.serialNumber);
      await this.initializeFileList();
    } catch (error) {
      console.log(error);
      this.disconnect();
    }
  }

  public disconnect() {
    console.log('Disconnected');
    this.device.gatt.disconnect();
    this.device = null;
    this.service = null;
    this.serialNumber = null;
    this.listOfFiles = [];
  }

  private async initializeShortName() {
    try {
      const characteristic = await this.service.getCharacteristic(this.SHORTNAME_UUID);
      const value = await characteristic.readValue();
      const message = new Uint8Array(value.buffer);
      this.shortname = String.fromCharCode(...message);
    } catch (error) {
      console.log(error);
    }
  }

  private async initializeFileList() {
    try {
      while (true) {
        const characteristic = await this.service.getCharacteristic(this.LIST_FILES_UUID);
        const value = await characteristic.readValue();
        const message = new Uint8Array(value.buffer);
        if (message.byteLength === 0) return;
        const byteString = String.fromCharCode(...message);
        const split_string = byteString.split(';');
        const name = split_string[0];
        const length = split_string[1];
        this.listOfFiles.push({ name, length });
      }
    } catch (error) {
      console.log(error);
    }
  }

  private async initializeSerialNumber() {
    try {
      const characteristic = await this.service.getCharacteristic(this.SERIAL_NUMBER_UUID);
      this.serialNumber = await characteristic.readValue();
    } catch (error) {
      console.log(error);
    }
  }

  public async getShortName() {
    return this.shortname;
  }

  public async setShortName(shortname) {
    try {
      const characteristic = await this.service.getCharacteristic(this.SHORTNAME_UUID);
      const uf8encode = new TextEncoder();
      const newShortName = uf8encode.encode(shortname);
      await characteristic.writeValue(newShortName);
      this.shortname = newShortName;
    } catch (error) {}
  }

  public getFileList() {
    return this.listOfFiles;
  }

  public async getFileContent(name: any) {
    try {
      const write_characteristic = await this.service.getCharacteristic(this.WRITE_TO_DEVICE_UUID);
      const read_characteristic = await this.service.getCharacteristic(this.READ_FROM_DEVICE_UUID);
      const arrayBuffers = [];
      let offset = 0;
      const uf8encode = new TextEncoder();
      const name_bytes = uf8encode.encode(`${name};${offset};`);
      await write_characteristic.writeValue(name_bytes);
      while (true) {
        const display_info = await read_characteristic.readValue();
        if (display_info.byteLength !== 0) {
          offset += display_info.byteLength;
          console.log(`Appending length to offset: ${offset}`);
          const uf8encode = new TextEncoder();
          if (display_info.byteLength === offset) offset = 0;
          const name_bytes = uf8encode.encode(`${name};${offset};`);
          await write_characteristic.writeValue(name_bytes);
          const array: any = new Uint8Array(display_info.buffer);
          array.map((x) => {
            arrayBuffers.push(x);
          });
        } else {
          break;
        }
      }
      return new Uint8Array(arrayBuffers);
    } catch (error) {
      console.log(error);
    }
  }

  public getSerialNumber() {
    console.log(`Serial Number: ${this.serialNumber}`);
    return this.serialNumber;
  }

  private async setSerialNumber(serial) {
    try {
      const characteristic = await this.service.getCharacteristic(this.SERIAL_NUMBER_UUID);
      const uf8encode = new TextEncoder();
      const newSerial = uf8encode.encode(serial);
      await characteristic.writeValue(newSerial);
      this.serialNumber = newSerial;
    } catch (error) {
      console.log(error);
    }
  }

  public async formatStorage() {
    try {
      const characteristic = await this.service.getCharacteristic(this.FORMAT_STORAGE_UUID);
      const uf8encode = new TextEncoder();
      const char = uf8encode.encode(`1`);
      await characteristic.writeValue(char);
      console.log('Files erased');
    } catch (error) {
      console.log(error);
    }
  }
}
