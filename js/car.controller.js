'use strict'

const gQueryOptions = {
    filterBy: { txt: '', minSpeed: 0 },
    sortBy: {},
    page: { idx: 0, size: 3 }
}
var gCarToEdit = null

function onInit() {
    readQueryParams()
    renderCars()
}

function renderCars() {
    var cars = getCars(gQueryOptions)
    var strHtmls = cars.map(car => `
        <article class="car-preview">
            <button title="Delete car" class="btn-remove" onclick="onRemoveCar('${car.id}')">X</button>
            
            <h2>${car.vendor}</h2>
            <p>Up to <span>${car.maxSpeed}</span> KMH</p>
            
            <button onclick="onReadCar('${car.id}')">Details</button>
            <button onclick="onUpdateCar('${car.id}')">Update</button>

            <img title="Photo of ${car.vendor}" 
                src="img/${car.vendor}.png" 
                alt="Car by ${car.vendor}"
                onerror="this.src='img/default.png'">
        </article> 
    `)
    document.querySelector('.cars-container').innerHTML = strHtmls.join('')
    setQueryParams()
}

// CRUD

function onRemoveCar(carId) {
    removeCar(carId)
    renderCars()
    flashMsg(`Car Deleted`)
}

function onAddCar() {
    const elModal = document.querySelector('.car-edit-modal')
    const elHeading = elModal.querySelector('h2')

    elHeading.innerText = 'Add Car'
    elModal.showModal()
}

function onUpdateCar(carId) {
    const elModal = document.querySelector('.car-edit-modal')

    const elHeading = elModal.querySelector('h2')
    const elVendor = elModal.querySelector('select')
    const elMaxSpeed = elModal.querySelector('input')
    const elImg = elModal.querySelector('img')

    gCarToEdit = getCarById(carId)

    elHeading.innerText = 'Edit Car'
    elVendor.value = gCarToEdit.vendor
    elMaxSpeed.value = gCarToEdit.maxSpeed
    elImg.src = `img/${gCarToEdit.vendor}.png`

    elModal.showModal()
}

function onSaveCar() {
    const elForm = document.querySelector('.car-edit-modal form')

    const elVendor = elForm.querySelector('select')
    const elMaxSpeed = elForm.querySelector('input')
    
    const vendor = elVendor.value
    const maxSpeed = elMaxSpeed.value

    // TODO Save the car
    if(gCarToEdit) {
        var car = updateCar(gCarToEdit.id, vendor, maxSpeed)
        gCarToEdit = null
    } else {
        var car = addCar(vendor, maxSpeed)
    }

    renderCars()
    flashMsg(`Car Saved (id: ${car.id})`)
}

// Car Edit Dialog

function onSelectVendor(elVendor) {
    const elCarImg = document.querySelector('.car-edit-modal img')
    elCarImg.src = `img/${elVendor.value}.png`
}

function onCloseCarEdit() {
    resetCarEditModal()
    document.querySelector('.car-edit-modal').close()
}

function resetCarEditModal() {
    const elForm = document.querySelector('.car-edit-modal form')
    const elImg = elForm.querySelector('img')

    elForm.reset()
    elImg.src = ''

    gCarToEdit = null
}

// Details modal

function onReadCar(carId) {
    const car = getCarById(carId)
    const elModal = document.querySelector('.modal')

    elModal.querySelector('h3').innerText = car.vendor
    elModal.querySelector('h4 span').innerText = car.maxSpeed
    elModal.querySelector('p').innerText = car.desc
    elModal.querySelector('img').src = `img/${car.vendor}.png`

    elModal.showModal()
}

function onCloseModal() {
    document.querySelector('.modal').close()
}

// Filter, Sort & Pagination

function onSetFilterBy() {
    const elVendor = document.querySelector('.filter-by select')
    const elMinSpeed = document.querySelector('.filter-by input')

    gQueryOptions.filterBy.txt = elVendor.value
    gQueryOptions.filterBy.minSpeed = elMinSpeed.value

    gQueryOptions.page.idx = 0
    renderCars()
}

function onSetSortBy() {
    const elSortBy = document.querySelector('.sort-by select')
    const elDir = document.querySelector('.sort-by input')

    const dir = elDir.checked ? -1 : 1

    gQueryOptions.sortBy = {}

    if(elSortBy.value === 'vendor') {
        gQueryOptions.sortBy = { vendor: dir }
    } else if(elSortBy.value === 'maxSpeed') {
        gQueryOptions.sortBy = { maxSpeed: dir }
    }
    gQueryOptions.page.idx = 0
    renderCars()
}

function onNextPage() {
    const totalPageCount = getTotalPageCount(gQueryOptions)

    if(gQueryOptions.page.idx < totalPageCount - 1){
        gQueryOptions.page.idx++
    } else {
        gQueryOptions.page.idx = 0
    }
    renderCars()
}

// Query Params

function readQueryParams() {
    const queryParams = new URLSearchParams(window.location.search)
    gQueryOptions.filterBy = {
        txt: queryParams.get('vendor') || '',
        minSpeed: +queryParams.get('minSpeed') || 0
    }

    if(queryParams.get('sortBy')) {
        const prop = queryParams.get('sortBy')
        const dir = +queryParams.get('sortDir')
        gQueryOptions.sortBy[prop] = dir
    }

    if(queryParams.get('pageIdx')) {
        gQueryOptions.page.idx = +queryParams.get('pageIdx')
        gQueryOptions.page.size = +queryParams.get('pageSize')
    }
    renderQueryParams()
}

function renderQueryParams() {
    
    document.querySelector('.filter-by select').value = gQueryOptions.filterBy.txt
    document.querySelector('.filter-by input').value = gQueryOptions.filterBy.minSpeed
    
    const sortKeys = Object.keys(gQueryOptions.sortBy)
    const sortBy = sortKeys[0]
    const dir = gQueryOptions.sortBy[sortKeys[0]]

    document.querySelector('.sort-by select').value = sortBy || ''
    document.querySelector('.sort-by input').checked = (dir === -1) ? true : false
}

function setQueryParams() {
    const queryParams = new URLSearchParams()

    queryParams.set('vendor', gQueryOptions.filterBy.txt)
    queryParams.set('minSpeed', gQueryOptions.filterBy.minSpeed)

    const sortKeys = Object.keys(gQueryOptions.sortBy)
    if(sortKeys.length) {
        queryParams.set('sortBy', sortKeys[0])
        queryParams.set('sortDir', gQueryOptions.sortBy[sortKeys[0]])
    }

    if(gQueryOptions.page) {
        queryParams.set('pageIdx', gQueryOptions.page.idx)
        queryParams.set('pageSize', gQueryOptions.page.size)
    }

    const newUrl = 
        window.location.protocol + "//" + 
        window.location.host + 
        window.location.pathname + '?' + queryParams.toString()

    window.history.pushState({ path: newUrl }, '', newUrl)
}

// UI

function flashMsg(msg) {
    const el = document.querySelector('.user-msg')

    el.innerText = msg
    el.classList.add('open')
    setTimeout(() => el.classList.remove('open'), 3000)
}