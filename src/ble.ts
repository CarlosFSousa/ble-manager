class BleConnection {
  SERVICE_ID = 'dbd00001-ff30-40a5-9ceb-a17358d31999';
  _device = null;
  _service = null;
  _buffer = new Uint8Array(8);

  async _requestDevice(filters: any) {
    const params: any = {
      acceptAllDevices: true,
      optionalServices: [this.SERVICE_ID],
    };
    if (filters) {
      params.filters = filters;
      params.acceptAllDevices = false;
    }
    // @ts-ignore
    return navigator.bluetooth.requestDevice();
  }

  async connect(filters:any) {
      this._device = await this._requestDevice(filters);
  }
}
