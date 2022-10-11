interface BleConnection {
  current_device: any;
  scanFilteredDevices(): Promise<void>;
  onDisconnected(): void;
  printLog(message: string): void;
}

class BleConnection {
  service = 'dbd00001-ff30-40a5-9ceb-a17358d31999';

  scanFilteredDevices = async () => {
    try {
      this.printLog('Requesting BLE connection');
      // Requests connection to ble device
      // filtered by name, optionalServices are needed in order to call in getPrimaryService()
      const device: BluetoothDevice = await navigator.bluetooth.requestDevice({
        filters: [{ name: 'DVBdiver' }],
        optionalServices: [this.service],
      });
      this.current_device = device;
      // Connects device
      const connection: any = await device.gatt?.connect();
      this.printLog('Device connected');
      // Gets primary by uuid
      const service: BluetoothRemoteGATTService =
        await connection.getPrimaryService(this.service);
      this.printLog(`Service UUID: ${service.uuid}`);
      console.log(service);
      // Lists all characteristics found in the service
      const characteristics: BluetoothRemoteGATTCharacteristic[] =
        await service.getCharacteristics();
      this.printLog(
        `Number of characteristics found: ${characteristics.length}`
      );
      console.log(characteristics);
      // Value from one of the characteristics
      const value: DataView | any = await characteristics[3]?.readValue();
      console.log(value);
      // converted the value to uint8
      this.printLog(`Value: ${value.getUint8(0)}`);
      // Needs array buffer to write
      // await characteristic[3].writeValue(buffer);
      // Disconnects device
      this.current_device.gatt.disconnect();
      this.printLog('Device disconnected');
    } catch (error) {
      this.printLog(`Error - ${error}`);
    }
  };

  printLog = (message: string) => {
    var myDiv = document.getElementById('log');
    var p = document.createElement('p');
    if (message.includes('Error')) p.className = 'red';
    p.textContent = message;
    myDiv?.append(p);
  };
}

const connection = new BleConnection();
const button = document.getElementById('start_scan');
button?.addEventListener('click', connection.scanFilteredDevices);
