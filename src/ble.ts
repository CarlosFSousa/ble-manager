// Carlos Fontes e Sousa 22

class BleConnection {
  current_device: any = null;
  _device: any = null;
  _service: any = null;
  _get_list_characteristic: any = null;
  _get_list_content: any = null;
  SERVICE_UUID: String = "dbd00001-ff30-40a5-9ceb-a17358d31999";
  GET_LIST_CHARACTERISTIC_UUID: String = "dbd00010-ff30-40a5-9ceb-a17358d31999";
  GET_CONTENT_CHARACTERISTIC_UUID: String = "dbd00011-ff30-40a5-9ceb-a17358d31999";

  scanFilteredDevices = async () => {
    try {
      this.printLog("Requesting BLE connection");
      await this.connect();
      this.current_device = this._device;
      await this.getListFiles();
      disconnectButton.addEventListener("click", () => {
        this.current_device.gatt.disconnect();
        this.printLog("Device disconnected");
      });
      this.connected();
    } catch (error) {
      this.printLog(`Error - ${error}`);
    }
  };

  connect = async () => {
    try {
      this._device = await this._requestDevice([{ name: "DVBdiver" }]);
      this.printLog("Device Connected");
      this._device.addEventListener("gattserverdisconnected", async (event: any) => {
        console.log(event);
        connectButton.style.display = "block";
        disconnectButton.style.display = "none";
      });
      const connection: any = await this._device.gatt.connect();
      this._service = await connection.getPrimaryService(this.SERVICE_UUID);
      this.printLog("Service Connected");
      this._get_list_characteristic = await this._service.getCharacteristic(
        this.GET_LIST_CHARACTERISTIC_UUID
      );
      this._get_list_content = await this._service.getCharacteristic(
        this.GET_CONTENT_CHARACTERISTIC_UUID
      );
    } catch (error) {
      this.printLog(`Error: ${error}`);
      this.disconnect();
    }
  };

  connected = () => {
    connectButton.style.display = "none";
    disconnectButton.style.display = "block";
  };

  disconnect = () => {
    this._device.gatt.disconnect();
    this._device = null;
    this._service = null;
    this._get_list_characteristic = null;
    this._get_list_content = null;
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
    while (true) {
      const value: any = await this._get_list_characteristic.readValue();
      const message: Uint8Array = new Uint8Array(value.buffer);
      if (message.byteLength === 0) return;
      const byteString: string = String.fromCharCode(...message);
      const split_string = byteString.split(";");
      const name = split_string[0];
      const length = split_string[1];
      this.generateBoxes(name, length, message);
    }
  };

  generateBoxes = (name: string, length: string, byteArray: any) => {
    const list_files: HTMLElement = document.getElementById("list_files");

    const card: HTMLElement = document.createElement("div");
    card.className = "card";
    card.style.width = "18rem";
    const card_body: HTMLElement = document.createElement("div");
    card_body.className = "card-body";

    const h6: HTMLElement = document.createElement("h6");
    h6.innerText = name;
    h6.className = "card-title";

    const p: HTMLElement = document.createElement("p");
    p.innerText = `File length: ${length}`;
    p.className = "card-text";

    const text_box: HTMLElement = document.createElement("textarea");
    text_box.id = byteArray;

    const button: HTMLElement = document.createElement("button");
    button.className = "btn btn-success";
    button.textContent = "Download";
    button.setAttribute("name", name);
    button.addEventListener("click", async (e: any) => {
      const id = e.srcElement.name;
      // const blob = new Blob([byteArray]);
      // const link = document.createElement('a');
      // link.href = window.URL.createObjectURL(blob);
      // link.download = id;
      // link.click();

      const uf8Encode = new TextEncoder();
      const name_bytes = uf8Encode.encode(id);
      await this._get_list_content.writeValueWithoutResponse(name_bytes);
      const display_info = await this._get_list_content.readValue();
      console.log(display_info);
      // const message: Uint8Array = new Uint8Array(display_info.buffer)
      const byteData = buf2hex(display_info.buffer);
      console.log(byteData);
    });

    card_body.appendChild(h6);
    card_body.appendChild(p);
    card_body.appendChild(button);
    card.appendChild(card_body);
    list_files.appendChild(card);
  };

  printLog = (message: string) => {
    const myDiv: any = document.getElementById("log");
    const p: any = document.createElement("p");
    if (message.includes("Error")) p.className = "red";
    const now = new Date();
    const date = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
    const time = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
    p.textContent = `${date} ${time} - ${message}`;
    myDiv.append(p);
    if (myDiv.textContent.trim() !== "") {
      myDiv.style.border = "1px solid black";
    }
  };
}
// ******************************* End of class ********************************

const bluetoothIsAvailable: any = document.getElementById("bluetooth-is-available");
const bluetoothIsAvailableMessage: any = document.getElementById("bluetooth-is-available-message");
const connectBlock: any = document.getElementById("connect-block");

const checkBluetoothAvailability = async () => {
  if (
    navigator &&
    //@ts-ignore
    navigator.bluetooth &&
    //@ts-ignore
    (await navigator.bluetooth.getAvailability())
  ) {
    bluetoothIsAvailableMessage.innerText = "Bluetooth is available in your browser.";
    bluetoothIsAvailable.className = "alert alert-success";
    connectBlock.style.display = "block";
  } else {
    bluetoothIsAvailable.className = "alert alert-danger";
    bluetoothIsAvailableMessage.innerText = "Bluetooth is not available in your browser.";
  }
};

checkBluetoothAvailability();
const connectButton: any = document.querySelector("#start_scan");
const disconnectButton: any = document.querySelector("#disconnect");
const connection = new BleConnection();
connectButton.addEventListener("click", connection.scanFilteredDevices);

function buf2hex(buffer) {
  // buffer is an ArrayBuffer
  return [...new Uint8Array(buffer)].map((x) => x.toString(16).padStart(2, "0")).join("");
}
