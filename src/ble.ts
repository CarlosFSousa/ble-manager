// Carlos Fontes e Sousa 22

class Ble {
  public listOfFiles: any[] = null;

  private device: BluetoothDevice = null;
  private service: BluetoothRemoteGATTService = null;
  private SERVICE_UUID: BluetoothServiceUUID = 'dbd00001-ff30-40a5-9ceb-a17358d31999';
  private LIST_FILES_UUID: BluetoothCharacteristicUUID = 'dbd00010-ff30-40a5-9ceb-a17358d31999';
  private GET_SHORTNAME_UUID: BluetoothCharacteristicUUID = 'dbd00002-ff30-40a5-9ceb-a17358d31999';

  // start connection after clicking the connect button
  public scan() {}

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

  private disconnect() {
    printLog('Disconnected');
    this.device = null;
    this.service = null;
    this.listOfFiles = null;
  }

  private async getShortName() {
    const characteristic: BluetoothRemoteGATTCharacteristic = await this.service.getCharacteristic(
      this.GET_SHORTNAME_UUID
    );
    const value: DataView = await characteristic.readValue();
    const message: Uint8Array = new Uint8Array(value.buffer);
    const result: String = String.fromCharCode(...message);
    return result;
  }

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

  private getFileContent(e: any) {
    console.log(e);
    if (this.listOfFiles.length > 0) {
      this.listOfFiles.map((file) => {});
    }
  }
}
