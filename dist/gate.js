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
        this.filtersElement = document.getElementById('filters');
        this.current_device = null;
    }
    scanFilteredDevices(filters) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let options = {};
            const services = { services: filters };
            console.log(services);
            // options.filters = [services];
            options.acceptAllDevices = true;
            if (((_a = this.filtersElement) === null || _a === void 0 ? void 0 : _a.value) === '') {
                alert('Filters can not be empty');
                return;
            }
            return yield navigator.bluetooth.requestDevice(options);
        });
    }
    createTable() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.filtersElement === null)
                return;
            const filtersArray = this.filtersElement.value.split(',');
            const newAr = filtersArray.map((item) => parseInt(item) ? parseInt(item) : item);
            return yield this.scanFilteredDevices(newAr);
        });
    }
}
const scan = () => __awaiter(void 0, void 0, void 0, function* () {
    const bleConnection = new BleConnection();
    const device = yield bleConnection.createTable();
    bleConnection.current_device = device;
    toggle(device);
});
const toggle = (device) => {
    const inputGroup = document.getElementById('scan');
    const table = document.getElementById('table');
    inputGroup.style.display = 'none';
    table.style.display = 'block';
    table.console.log(device);
};
const button = document.querySelector('#start_scan');
button === null || button === void 0 ? void 0 : button.addEventListener('click', scan);
