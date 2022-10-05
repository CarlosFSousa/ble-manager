"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class BleConnection {
    constructor() {
        this.scanFilteredDevices = () => __awaiter(this, void 0, void 0, function* () {
            try {
                const options = {};
                // options.filters = [{services:0x180a}]
                options.acceptAllDevices = true;
                this.printLog('Requesting BLE Device');
                this.printLog(`Options: ${JSON.stringify(options)}`);
                const device = yield navigator.bluetooth.requestDevice(options);
                this.current_device = device;
                device.addEventListener('gattserverdisconnected', this.onDisconnected);
                this.printLog('Getting Service');
                const server = yield device.getPrimaryService('');
                this.printLog('Getting gate on open characteritic');
                const service = yield server.getCharacteristic();
                this.printLog('Writing gate open command');
                yield service.writeValue();
                this.printLog('Characteristic written');
                this.current_device.gatt.disconnect();
            }
            catch (error) {
                this.printLog(`Error: ${error}`);
            }
        });
        this.onDisconnect = (e) => {
            const device = e.target;
            console.log(`Device ${device.name} disconnected`);
        };
        this.printLog = (message) => {
            var myDiv = document.getElementById('log');
            var p = document.createElement('p');
            if (message.includes('Error'))
                p.className = 'red';
            p.textContent = message;
            myDiv === null || myDiv === void 0 ? void 0 : myDiv.append(p);
        };
    }
}
const connection = new BleConnection();
const button = document.getElementById('start_scan');
button === null || button === void 0 ? void 0 : button.addEventListener('click', connection.scanFilteredDevices);
