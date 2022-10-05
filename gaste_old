class BleConnection {
  filtersElement: HTMLInputElement | null;
  current_device: any;
  constructor() {
    this.filtersElement = document.getElementById(
      'filters'
    ) as HTMLInputElement | null;
    this.current_device = null;
  }
  async scanFilteredDevices(filters: string[]) {
    let options: any = {};
    const services = { services: filters };
    console.log(services);
    // options.filters = [services];
    options.acceptAllDevices = true;
    if (this.filtersElement?.value === '') {
      alert('Filters can not be empty');
      return;
    }
    return await navigator.bluetooth.requestDevice(options);
  }

  async createTable() {
    if (this.filtersElement === null) return;
    const filtersArray: any[] = this.filtersElement.value.split(',');
    const newAr = filtersArray.map((item) =>
      parseInt(item) ? parseInt(item) : item
    );
    return await this.scanFilteredDevices(newAr);
  }
}

const scan = async () => {
  const bleConnection = new BleConnection();
  const device = await bleConnection.createTable();
  bleConnection.current_device = device;
  toggle(device);
};

const toggle = (device: any) => {
  const inputGroup: any = document.getElementById('scan');
  const table: any = document.getElementById('table');
  inputGroup.style.display = 'none';
  table.style.display = 'block';
  table.console.log(device);
};
const button = document.querySelector('#start_scan');
button?.addEventListener('click', scan);
