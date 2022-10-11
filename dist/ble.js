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
        this.service = 'dbd00001-ff30-40a5-9ceb-a17358d31999';
        this.scanFilteredDevices = () => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                this.printLog('Requesting BLE connection');
                // Requests connection to ble device
                // filtered by name, optionalServices are needed in order to call in getPrimaryService()
                const device = yield navigator.bluetooth.requestDevice({
                    filters: [{ name: 'DVBdiver' }],
                    optionalServices: [this.service],
                });
                this.current_device = device;
                // Connects device
                const connection = yield ((_a = device.gatt) === null || _a === void 0 ? void 0 : _a.connect());
                this.printLog('Device connected');
                // Gets primary by uuid
                const service = yield connection.getPrimaryService(this.service);
                this.printLog(`Service UUID: ${service.uuid}`);
                console.log(service);
                // Lists all characteristics found in the service
                const characteristics = yield service.getCharacteristics();
                this.printLog(`Number of characteristics found: ${characteristics.length}`);
                console.log(characteristics);
                // Value from one of the characteristics
                const value = yield ((_b = characteristics[3]) === null || _b === void 0 ? void 0 : _b.readValue());
                console.log(value);
                // converted the value to uint8
                this.printLog(`Value: ${value.getUint8(0)}`);
                // Needs array buffer to write
                // await characteristic[3].writeValue(buffer);
                // Disconnects device
                this.current_device.gatt.disconnect();
                this.printLog('Device disconnected');
            }
            catch (error) {
                this.printLog(`Error - ${error}`);
            }
        });
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
