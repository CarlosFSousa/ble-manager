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
      // options.filters = [{services:0x180a}]
      options.acceptAllDevices = true;
      this.printLog('Requesting BLE Device');
      this.printLog(`Options: ${JSON.stringify(options)}`);
      const device: any = await navigator.bluetooth.requestDevice(options);
      this.current_device = device;
      device.addEventListener('gattserverdisconnected', this.onDisconnected);
      this.printLog('Getting Service');
      const server = await device.getPrimaryService('');
      this.printLog('Getting gate on open characteritic');
      const service = await server.getCharacteristic();
      this.printLog('Writing gate open command');
      await service.writeValue();
      this.printLog('Characteristic written');
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
