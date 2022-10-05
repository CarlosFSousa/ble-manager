interface BleConnection {
  current_device: any;
  scanFilteredDevices(): Promise<void>;
  onDisconnected(): void;
  printLog(message: string): void;
}

class BleConnection {
  scanFilteredDevices = async () => {
    try {
      const options: any = {};
      // options.filters = [{ services: 0x1800 }];
      (options.optionalServices = ['00002a19-0000-1000-8000-00805f9b34fb']),
        (options.acceptAllDevices = true);
      this.printLog('Requesting BLE Device');
      this.printLog(`Options: ${JSON.stringify(options)}`);
      const device: any = await navigator.bluetooth.requestDevice(options);
      this.current_device = device;
      device.addEventListener('gattserverdisconnected', this.onDisconnected);
      const server = await device.gatt.connect();
      console.log(server);
      // const characteristics = await server.getCharacteristics();
      // console.log(characteristics);
      // this.printLog('Getting Service');
      // const service = await server.getPrimaryService(0x180f);
      // console.log(service);
      // this.printLog('Opening characteristic');
      // const characteristic = await service.getCharacteristic(0x2a19);
      // console.log(characteristic);
      // this.printLog(`Value: ${characteristic[0].value}`);
      // this.printLog('Writing gate open command');
      // const value = await characteristic.writeValue();
      // console.log(value);
      // this.printLog('Characteristic written');
      this.current_device.gatt.disconnect();
    } catch (error) {
      this.printLog(`Error: ${error}`);
    }
  };

  onDisconnect = (e: any) => {
    const device = e.target;
    console.log(`Device ${device.name} disconnected`);
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
