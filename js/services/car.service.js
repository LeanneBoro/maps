'use strict'

const STORAGE_KEY = 'carDB'

var gCars

_createCars()

function getCars(options) {
    const cars = _filterCars(options.filterBy)

    if(options.sortBy.maxSpeed) { // sortBy : { vendor: -1 }
        cars.sort((car1, car2) => (car1.maxSpeed - car2.maxSpeed) * options.sortBy.maxSpeed)
    } else if(options.sortBy.vendor) {
        cars.sort((car1, car2) => (car1.vendor.localeCompare(car2.vendor)) * options.sortBy.vendor)
    }

    const startIdx = options.page.idx * options.page.size
    return cars.slice(startIdx, startIdx + options.page.size)
}

function getTotalPageCount(options) {
    const cars = _filterCars(options.filterBy)
    return Math.ceil(cars.length / options.page.size)
}

function _filterCars(filterBy) {
    return gCars.filter(car => 
        car.vendor.includes(filterBy.txt) &&
        car.maxSpeed >= filterBy.minSpeed)
}

function removeCar(carId) {
    const carIdx = gCars.findIndex(car => carId === car.id)
    gCars.splice(carIdx, 1)
    
    _saveCarsToStorage()
}

function addCar(vendor, maxSpeed) {
    var car = _createCar(vendor, maxSpeed)
    gCars.unshift(car)

    _saveCarsToStorage()
    return car
}

function getCarById(carId) {
    return gCars.find(car => carId === car.id)
}

function updateCar(carId, vendor, maxSpeed) {
    const car = gCars.find(car => car.id === carId)

    car.vendor = vendor
    car.maxSpeed = maxSpeed

    _saveCarsToStorage()
    return car
}

function _createCar(vendor, maxSpeed) {
    return {
        id: makeId(),
        vendor,
        maxSpeed: maxSpeed || getRandomIntInclusive(50, 250),
        desc: makeLorem()
    }
}

function _createCars() {
    gCars = loadFromStorage(STORAGE_KEY)
    if (gCars && gCars.length) return
    
    // If no cars in storage - generate demo data

    gCars = []
    const vendors = ['audu', 'fiak', 'subali', 'mitsu']
    
    for (let i = 0; i < 12; i++) {
        var vendor = vendors[getRandomInt(0, vendors.length)]
        gCars.push(_createCar(vendor))
    }
    _saveCarsToStorage()
}

function _saveCarsToStorage() {
    saveToStorage(STORAGE_KEY, gCars)
}
