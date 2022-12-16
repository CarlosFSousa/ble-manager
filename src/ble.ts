class Ble {
  private device: any = null;
  private service: any = null;
  private SERVICE_UUID: string = 'dbd00001-ff30-40a5-9ceb-a17358d31999';
  private LIST_FILES_UUID: string = 'dbd00010-ff30-40a5-9ceb-a17358d31999';
  private GET_SHORTNAME_UUID: string = 'dbd00002-ff30-40a5-9ceb-a17358d31999';

  scan() {
    // this is the only function accessible from the outside
  }

  private async connect() {
    try {
      const params: RequestDeviceOptions = {
        optionalServices: [this.SERVICE_UUID],
        filters: [{ name: 'DVBdiver' }],
      };
      this.device = await navigator.bluetooth.requestDevice(params);

      this.device.addEventListener('gattserverdisconnected', async (event: BluetoothRemoteGATTServer) => {
        console.log(event);
      });
      const connection = await this.device.gatt.connect();
    } catch (error) {}
  }
}
