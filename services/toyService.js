import fs from 'fs'
import { makeId, readJsonFile, getRandomIntInclusive } from "./util.service.js";

const toys = readJsonFile('data/toys.json')

export const toyService = {
    query,
    // getById,
    // remove,
    // save,
}


function query(filterBy = {}) {
    let toysToReturn = toys

    console.log(toysToReturn);
    if (filterBy.txt) {
        const regExp = new RegExp(filterBy.txt, 'i')
        toysToReturn = toysToReturn.filter(toy => regExp.test(toy.name))
    }
    console.log(toysToReturn);
    
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
    console.log(toysToReturn);
    
    return Promise.resolve(toysToReturn)

}