// Carlos Fontes e Sousa 22

class Ble {
  public listOfFiles: any[] = null;

  private device: BluetoothDevice = null;
  private service: BluetoothRemoteGATTService = null;
  private SERVICE_UUID: BluetoothServiceUUID = 'dbd00001-ff30-40a5-9ceb-a17358d31999';
  private LIST_FILES_UUID: BluetoothCharacteristicUUID = 'dbd00010-ff30-40a5-9ceb-a17358d31999';
  private GET_SHORTNAME_UUID: BluetoothCharacteristicUUID = 'dbd00002-ff30-40a5-9ceb-a17358d31999';
  private WRITE_TO_DEVICE_UUID: BluetoothCharacteristicUUID = 'dbd00011-ff30-40a5-9ceb-a17358d31999';
  private READ_FROM_DEVICE_UUID: BluetoothCharacteristicUUID = 'dbd00012-ff30-40a5-9ceb-a17358d31999';

  public scan() {
    this.connect();
    this.getFileList();
  }

  private async connect() {
    try {
      const params: RequestDeviceOptions = {
        optionalServices: [this.SERVICE_UUID],
        filters: [{ name: 'DVBdiver' }],
      };
      this.device = await navigator.bluetooth.requestDevice(params);

      this.device.addEventListener('gattserverdisconnected', async function (event: any) {
        console.log(event);
      });

      const connection: BluetoothRemoteGATTServer = await this.device.gatt.connect();
      this.service = await connection.getPrimaryService(this.SERVICE_UUID);
      printLog('Connected');
    } catch (error) {
      console.log(error);
    }
  }

  public disconnect() {
    printLog('Disconnected');
    this.device = null;
    this.service = null;
    this.listOfFiles = null;
  }

  public async getShortName() {
    const characteristic: BluetoothRemoteGATTCharacteristic = await this.service.getCharacteristic(
      this.GET_SHORTNAME_UUID
    );
    const value: DataView = await characteristic.readValue();
    const message: Uint8Array = new Uint8Array(value.buffer);
    const result: String = String.fromCharCode(...message);
    return result;
  }

  private async setShortname() {}

  private async getSerialNumber() {}

  private async getFileList() {
    while (true) {
      const characteristic: BluetoothRemoteGATTCharacteristic = await this.service.getCharacteristic(
        this.LIST_FILES_UUID
      );
      const value: DataView = await characteristic.readValue();
      const message: Uint8Array = new Uint8Array(value.buffer);
      if (message.byteLength === 0) return;
      const byteString: string = String.fromCharCode(...message);
      const split_string: string[] = byteString.split(';');
      const name: string = split_string[0];
      const length: string = split_string[1];
      this.listOfFiles.push({ name, length });
    }
  }

  public async getFileContent(e: any) {
    let hex_text = '';
    let offset = 0;
    const name = e.target.name;
    const uf8encode = new TextEncoder();
    const name_bytes = uf8encode.encode(`${name};${offset};`);

    const write_characteristic: BluetoothRemoteGATTCharacteristic = await this.service.getCharacteristic(
      this.WRITE_TO_DEVICE_UUID
    );

    const read_characteristic: BluetoothRemoteGATTCharacteristic = await this.service.getCharacteristic(
      this.READ_FROM_DEVICE_UUID
    );

    await write_characteristic.writeValue(name_bytes);

    while (true) {
      const display_info = await read_characteristic.readValue();
      if (display_info.byteLength !== 0) {
        offset += display_info.byteLength;
        printLog(`Appending length to offset: ${offset}`);
        const uf8encode = new TextEncoder();
        const name_bytes = uf8encode.encode(`${name};${offset};`);
        await write_characteristic.writeValue(name_bytes);
        const byteArray = [...new Uint8Array(display_info.buffer)].map((x) => x.toString().padStart(2, '0')).join('');
        hex_text += byteArray;
      } else {
        break;
      }
    }
    return hex_text;
  }

  private formatStorage() {}
}
