import fs from 'fs'
import { makeId, readJsonFile, getRandomIntInclusive } from "./util.service.js";

const toys = readJsonFile('data/toys.json')
const LABELS = ['On wheels', 'Box game', 'Art', 'Baby', 'Doll', 'Puzzle',
    'Outdoor', 'Battery Powered']

export const toyService = {
    query,
    getById,
    remove,
    save,
    getAllLabels,
    getDashboardData,

}


function query(filterBy = {}) {
    let toysToReturn = toys
    if (filterBy.txt) {
        const regExp = new RegExp(filterBy.txt, 'i')
        toysToReturn = toysToReturn.filter(toy => regExp.test(toy.name))
    }
    if (filterBy.status !== 'all') {
        toysToReturn = toysToReturn.filter((toy) => {

            const sts = toy.inStock ? 'inStock' : 'notInStock'
            return (filterBy.status === sts)
        })
    }

    if (filterBy.labels?.length > 0) {
        console.log('inside labels');

        toysToReturn = toysToReturn.filter(toy => toy.labels.some(label => filterBy.labels.includes(label)))
    }

    if (filterBy.sort) {
        if (filterBy.sort === 'name') {

            console.log('inside')
            toysToReturn = toysToReturn.sort((a, b) => a.name.localeCompare(b.name));
        } else if (filterBy.sort === 'createdAt') {
            toysToReturn = toysToReturn.sort((a, b) => a.createdAt - b.createdAt);
        } else if (filterBy.sort === 'price') {
            toysToReturn = toysToReturn.sort((a, b) => a.price - b.price);
        }
    }
    return Promise.resolve(toysToReturn)
}

function getById(toyId) {
    const toy = toys.find(toy => toy._id === toyId)
    if (!toy) return Promise.reject('Cannot find toy - ' + toyId)
    return Promise.resolve(toy)
}

function remove(toyId, loggedinUser) {
    const toyIdx = toys.findIndex(toy => toy._id === toyId)
    if (toyIdx === -1) return Promise.reject('Cannot find toy - ' + toyId)
    // // if (!loggedinUser.isAdmin && loggedinUser._id !== toys[toyIdx].creator._id) {
    //     return Promise.reject('Not your toy')
    // }
    toys.splice(toyIdx, 1)
    return _saveToysToFile()
}


function save(toyToSave) {
    if (toyToSave._id) {
        for (const key in toyToSave) {
            if (toyToSave[key] === undefined || Number.isNaN(toyToSave[key])) {
                delete toyToSave[key];
            }
        }
        const idx = toys.findIndex(toy => toy._id === toyToSave._id)
        if (idx === -1) return Promise.reject('Cannot find toy - ' + toyToSave._id)
     
        toyToSave = { ...toys[idx], ...toyToSave }
        console.log(toyToSave);
        toys[idx] = toyToSave
    } else {
        toyToSave._id = makeId()
        toyToSave.createdAt = Date.now()
        toys.unshift(toyToSave)
    }
    return _saveToysToFile().then(() => toyToSave)
        .catch(err => {
            loggerService.error('Cannot save toy', err)
            res.status(500).send('Cannot save toy')
            throw (err)
        })
}






function _saveToysToFile() {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(toys, null, 4)
        fs.writeFile('data/toys.json', data, (err) => {
            if (err) {
                return reject(err)
            }
            resolve()
        })
    })
}



function getLabels() {
    const nums = _getRandomThree()
    var lbls = []
    lbls.unshift(labels[nums[0]])
    lbls.unshift(labels[nums[1]])
    lbls.unshift(labels[nums[2]])
    return lbls
}

function _getRandomThree() {
    const numbers = [0, 1, 2, 3, 4, 5, 6, 7]
    const result = []
    for (let i = 0; i < 3; i++) {
        const randIndex = Math.floor(Math.random() * numbers.length)
        result.push(numbers.splice(randIndex, 1)[0])
    }
    return result
}
function getAllLabels() {
    return Promise.resolve(labels)
}

function getDashboardData() {
    const pricePerLabel = LABELS.map((label) => {
        const totalPrice = toys.reduce((acc, toy) => {
            if (toy.labels.includes(label)) {
                return acc + toy.price;
            }
            return acc;
        }, 0);

        const totalOccurrence = toys.reduce((acc, toy) => {
            if (toy.labels.includes(label)) {
                return acc + 1;
            }
            return acc;
        }, 0);

        return totalOccurrence > 0 ? totalPrice / totalOccurrence : 0;
    });

    const onStockPerLabel = LABELS.map((label) => {
        return toys.reduce((acc, toy) => {
            if (toy.inStock && toy.labels.includes(label)) {
                return acc + 1
            }
            return acc
        }, 0);
    });
    return Promise.resolve({ labels:LABELS, pricePerLabel, onStockPerLabel })
}
