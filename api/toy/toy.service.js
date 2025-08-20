import { ObjectId } from 'mongodb'

import { dbService } from '../../services/db.service.js'
import { loggerService } from '../../services/logger.service.js'
import { utilService } from '../../services/util.service.js'
const collectionName = 'toys'

const LABELS = ['On wheels', 'Box game', 'Art', 'Baby', 'Doll', 'Puzzle',
    'Outdoor', 'Battery Powered']

export const toyService = {
    query,
    getById,
    remove,
    add,
    update,
    addToyMsg,
    removeToyMsg,
    getDashboard,
}


async function query(filterBy={}) {
    try {
        const { filter, sort } = _buildCriteria(filterBy)
        const collection = await dbService.getCollection(collectionName)
        const filteredToys = await collection.find(filter, { sort }).toArray()
        return filteredToys
    } catch (err) {
        loggerService.error('cannot find toys', err)
        throw err
    }
}

async function getById(toyId) {
    try {
        const collection = await dbService.getCollection(collectionName)
        const toy = await collection.findOne({ _id: ObjectId.createFromHexString(toyId) })
        toy.createdAt = toy._id.getTimestamp()
        return toy
    } catch (err) {
        loggerService.error(`while finding toy ${toyId}`, err)
        throw err
    }
}

async function remove(toyId) {
    try {
        console.log(toyId);

        const collection = await dbService.getCollection(collectionName)
        const { deletedCount } = await collection.deleteOne({ _id: ObjectId.createFromHexString(toyId) })
        return deletedCount
    } catch (err) {
        loggerService.error(`cannot remove toy ${toyId}`, err)
        throw err
    }
}

async function add(toy) {
    try {
        toy.createdAt = Date.now()
        const collection = await dbService.getCollection(collectionName)
        await collection.insertOne(toy)
        return toy
    } catch (err) {
        loggerService.error('cannot insert toy', err)
        throw err
    }
}

async function update(toy) {
    try {
        const _id = toy._id
        delete toy._id
        const collection = await dbService.getCollection(collectionName)
        await collection.updateOne({ _id: ObjectId.createFromHexString(_id) }, { $set: toy })
        return toy
    } catch (err) {
        loggerService.error(`cannot update toy ${toy._id}`, err)
        throw err
    }
}

async function addToyMsg(toyId, msg) {
    try {
        msg.id = utilService.makeId()
        const collection = await dbService.getCollection(collectionName)
        await collection.updateOne({ _id: ObjectId.createFromHexString(toyId) }, { $push: { msgs: msg } })
        return msg
    } catch (err) {
        loggerService.error(`cannot add toy msg ${toyId}`, err)
        throw err
    }
}

async function removeToyMsg(toyId, msgId) {
    try {
        const collection = await dbService.getCollection(collectionName)
        await collection.updateOne({ _id: ObjectId.createFromHexString(toyId) }, { $pull: { msgs: { id: msgId } } })
        return msgId
    } catch (err) {
        loggerService.error(`cannot add toy msg ${toyId}`, err)
        throw err
    }
}

async function getDashboard() {
    try {
        const toys = await query()
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
        return ({ labels: LABELS, pricePerLabel, onStockPerLabel })
    } catch (error) {
        loggerService.error('cannot get toys for dashboard ', err)
        throw err
    }
}

function _buildCriteria(filterBy) {
    const filter = {}
    if (filterBy.txt) {
        filter.name = { $regex: filterBy.txt, $options: 'i' }
    }
    if (filterBy.status && filterBy.status !== 'all') {
        const b = filterBy.status === 'inStock'
        filter.inStock = b
    }
    if (filterBy.labels && filterBy.labels.length) {
        // filter.labels = { $all: filterBy.labels }
        filter.labels = { $in: filterBy.labels }
    }
    const sort = {}
    if (filterBy.sort) {
        sort[filterBy.sort] = 1
    } 
    return { filter, sort }
}
