'use strict';
class BleConnection {
  constructor(filters) {
    this.filters = filters;
  }
  connectToDevice(filters) {
    const options = { filters };
    navigator.bluetooth.requestDevice(options).then((device) => {
      var _a;
      console.log(device);
      return (_a = device.gatt) === null || _a === void 0
        ? void 0
        : _a.connect();
    });
  }
}
function ble(username, password) {
  let filters = [];
  var current_device = null;
  //filters.push({name: "Vjezd"});
  filters.push({ services: ['6a700001-6a73-6a73-6a73-5cc6bf746a73'] });
  let options = {};
  options.filters = filters;
  console.log('Requesting Bluetooth Device...');
  console.log('with ' + JSON.stringify(options));
  navigator.bluetooth
    .requestDevice(options)
    .then((device) => {
      console.log('> Name:             ' + device.name);
      console.log('> Id:               ' + device.id);
      console.log('> Connected:        ' + device.gatt.connected);
      current_device = device;
      device.addEventListener('gattserverdisconnected', onDisconnected);
      return device.gatt.connect();
    })
    .then((server) => {
      console.log('Getting Gate Service...');
      let ps = server.getPrimaryService('6a700001-6a73-6a73-6a73-5cc6bf746a73');
      return ps;
    })
    .then((service) => {
      console.log('Getting gate open Characteristic...');
      return service.getCharacteristic('6a700002-6a73-6a73-6a73-5cc6bf746a73');
    })
    .then((characteristic) => {
      let encoder = new TextEncoder();
      let suname = username;
      let spwd = password;
      let data = encoder.encode(suname + '\t' + spwd);
      console.log('Writing gate open command...');
      console.log(data);
      return characteristic.writeValue(data);
    })
    .then(() => {
      console.log('Written.');
      current_device.gatt.disconnect();
    })
    .catch((error) => {
      console.log('Argh! ' + error);
    });
}
function onDisconnected(event) {
  const device = event.target;
  console.log(`Device ${device.name} is disconnected.`);
}

// class BleConnection {
//   connectToDevice() {
//     navigator.bluetooth.requestDevice(options).then((device) => {
//       console.log(device);
//       return device.gatt.connect();
//     });
//   }
// }

// const bleConnection = new BleConnection();

function test() {
  let filters = [];
  var current_device = null;
  filters.push({ services: [0x180a, 0x1800, 0x180f] });
  let options = {};
  //   options.filters = filters;
  options.acceptAllDevices = true;
  console.log('Requesting Bluetooth Device...');
  console.log('with ' + JSON.stringify(options));
  navigator.bluetooth.requestDevice(options).then((device) => {
    console.log(device);
    console.log('> Name:             ' + device.name);
    console.log('> Id:               ' + device.id);
    console.log('> Connected:        ' + device.gatt.connected);
    // current_device = device;
    // device.addEventListener('gattserverdisconnected', onDisconnected);
    return device.gatt.connect();
  });
}

class BleConnection {
  constructor() {
    this.current_device = null;
  }
  async scanFilteredDevices() {
    const filters = [];
    filters.push({ services: [0x180a, 0x1800, 0x180f] });
    const options = {};
    //   options.filters = filters;
    options.acceptAllDevices = true;
    console.log('Requesting Bluetooth Device...');
    console.log('with ' + JSON.stringify(options));
    // navigator.bluetooth.requestDevice(options).then((device) => {
    //   console.log(device);
    //   console.log('> Name:             ' + device.name);
    //   console.log('> Id:               ' + device.id);
    //   console.log('> Connected:        ' + device.gatt.connected);
    //   this.current_device = device;
    //   // device.addEventListener('gattserverdisconnected', onDisconnected);
    //   return device.gatt.connect();
    // });
    const device = await navigator.bluetooth.requestDevice(options);
    const server = await device.gatt.connect();
    const service = await server.getPrimaryService();
    const characteristic = await service.getCharacteristic();
  }
}
