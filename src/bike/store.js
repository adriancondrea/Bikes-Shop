import dataStore from 'nedb-promise';

function validateBike(bike) {
  let bikeName = bike.name;
  let bikeCondition = bike.condition;
  let bikeWarranty = bike.warranty;
  let bikePrice = bike.price;
  if (!bikeName) {
    throw new Error('Missing name property')
  } else if (!bikeCondition) {
    throw new Error('Missing condition property')
  } else if (!bikeWarranty) {
    throw new Error('Missing warranty property')
  } else if (!bikePrice || isNaN(bikePrice) || bikePrice < 1) {
    throw new Error('Bike price property is missing or invalid')
  }
}

export class BikeStore {
  constructor({ filename, autoload }) {
    this.store = dataStore({ filename, autoload });
  }
  
  async find(props) {
    return this.store.find(props);
  }
  
  async findOne(props) {
    return this.store.findOne(props);
  }
  
  async insert(bike) {
    validateBike(bike)
    return this.store.insert(bike);
  };

  async update(props, bike) {
    return this.store.update(props, bike);
  }
  
  async remove(props) {
    return this.store.remove(props);
  }
}

export default new BikeStore({ filename: './db/bikes.json', autoload: true });