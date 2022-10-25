class BleConnection {
  SERVICE_ID: string = 'dbd00001-ff30-40a5-9ceb-a17358d31999';
  _device: any = null;
  _service: any = null;
  _characteristic: any = null;
  _buffer: Uint8Array = new Uint8Array(8);
  _logger: any = { info: console.log, error: console.error };
  _connectingCallback: any = null;
  _connectCallback: any = null;
  _disconnectCallback: any = null;
  _messageCallback: any = null;
  _imageUploadFinishedCallback: any = null;
  _imageUploadProgressCallback: any = null;
  _userRequestedDisconnect: boolean = false;
  _uploadIsInProgress: boolean = false;

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

  async connect(filters: any) {
    try {
      this._device = await this._requestDevice(filters);
      // this._logger.info(`Connecting to device ${this.name} !`)
      this._device.addEventListener(
        'gattserverdisconnected',
        async (event: any) => {
          this._logger.info(event);
          if (!this._userRequestedDisconnect) {
            this._logger.info('Trying to reconnect');
            this.connect(1000);
          } else {
            this._disconnected();
          }
        }
      );
      this._connect();
    } catch (e) {
      this._logger.error(e);
      await this._disconnected();
      return;
    }
  }

  _connect() {
    setTimeout(async () => {
      try {
        // @ts-ignore
        if (this._connectingCallback !== null) this._connectingCallback();
        const server = await this._device.gatt.connect();
        this._logger.info('Server connected.');
        this._service = await server.getPrimaryService(this.SERVICE_ID);
        this._logger.info('Service connected!');
        this._characteristic = await this._service.getCharacteristics();
        this._characteristic.addEventListener(
          'characteristicvaluechanged',
          this.handleNotifications
        );
        await this._characteristic.startNotifications();
        await this._connected();
        if (this._uploadIsInProgress) {
          this._uploadNext();
        }
      } catch (e) {
        this._logger.error(e);
        await this._disconnected();
      }
    }, 1000);
  }

  disconnect() {
    this._userRequestedDisconnect = true;
    return this._device.gatt.disconnect();
  }

  onConnecting(callback: any) {
    this._connectingCallback = callback;
    return this;
  }
  onConnect(callback: any) {
    this._connectCallback = callback;
    return this;
  }
  onDisconnect(callback: any) {
    this._disconnectCallback = callback;
    return this;
  }
  onMessage(callback: any) {
    this._messageCallback = callback;
    return this;
  }
  onImageUploadProgress(callback: any) {
    this._imageUploadProgressCallback = callback;
    return this;
  }
  onImageUploadFinished(callback: any) {
    this._imageUploadFinishedCallback = callback;
    return this;
  }

  async _connected() {
    if (this._connectCallback) this._connectCallback();
  }

  async _disconnected() {
    this._logger.info('Disconnected.');
    if (this._disconnectCallback) this._disconnectCallback();
    this._device = null;
    this._service = null;
    this._characteristic = null;
    this._uploadIsInProgress = false;
    this._userRequestedDisconnect = false;
  }
  handleNotifications(e: Event | any) {
    let value = e.target.value;
    let a = [];
    for (let i = 0; i < value.byteLength; i++) {
      a.push('0x' + ('00' + value.getUint8(i).toString(16)).slice(-2));
    }
    this._logger.info('> ' + a.join(' '));
  }
}
