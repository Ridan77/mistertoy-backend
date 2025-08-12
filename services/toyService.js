import fs from 'fs'
import { makeId, readJsonFile, getRandomIntInclusive } from "./util.service.js";

const toys = readJsonFile('data/toys.json')

export const toyService = {
    query,
    getById,
    remove,
    save,
}


function query(filterBy = {}) {
    let toyToReturn = toys

    if (filterBy.txt) {
        const regExp = new RegExp(filterBy.txt, 'i')
        toyToReturn = toyToReturn.filter(toy => regExp.test(toy.txt))
    }
    if (filterBy.status !== 'all') {
        toyToReturn = toyToReturn.filter((toy) => {

            const sts = toy.inStock ? 'inStock' : 'notInStock'
            return (filterBy.status === sts)
        })
    }

    if (filterBy.labels.length > 0) {
        toyToReturn = toyToReturn.filter(toy => toy.labels.some(label => filterBy.labels.includes(label)))
    }

    if (filterBy.sort) {
        if (filterBy.sort === 'name') {

            console.log('inside')
            toyToReturn = toyToReturn.sort((a, b) => a.name.localeCompare(b.name));
        } else if (filterBy.sort === 'createdAt') {
            toyToReturn = toyToReturn.sort((a, b) => a.createdAt - b.createdAt);
        } else if (filterBy.sort === 'price') {
            toyToReturn = toyToReturn.sort((a, b) => a.price - b.price);
        }
    }
    return toyToReturn

}