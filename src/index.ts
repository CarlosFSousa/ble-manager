const connection = new BleConnection();
connection.checkBluetoothAvailability(false);
connectButton.addEventListener('click', connection.scanFilteredDevices);
