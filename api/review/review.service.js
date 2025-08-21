import { ObjectId } from 'mongodb'

import { asyncLocalStorage } from '../../services/als.service.js'
import { logger } from '../../services/logger.service.js'
import { dbService } from '../../services/db.service.js'

export const reviewService = { query, remove, add }
const collectionName = 'reviews'

async function query(filterBy = {}) {
    try {
        const criteria = _buildCriteria(filterBy)
        const collection = await dbService.getCollection(collectionName)

        // var reviews = await collection.find(criteria).toArray()
        var reviews = await collection.aggregate([
            {
                $match: criteria,
            },
            {
                $lookup: {
                    localField: 'userId',
                    from: 'user',
                    foreignField: '_id',
                    as: 'byUser',
                },
            },
            {
                $unwind: '$byUser',
            },
            {
                $lookup: {
                    localField: 'toyId',
                    from: 'toys',
                    foreignField: '_id',
                    as: 'toy',
                },
            },
            {
                $unwind: '$toy',
            },
            { 
                $project: {
                    'txt': true, 
                    'byUser._id': true, 'byUser.fullname': true,
                    'toy.price': true,'toy.name': true,"toy._id":true,

                } 
            }
            ]).toArray()

        return reviews
    } catch (err) {
        logger.error('cannot get reviews', err)
        throw err
    }
}

async function remove(reviewId) {
    try {
        const { loggedinUser } = asyncLocalStorage.getStore()
        const collection = await dbService.getCollection('review')

        const criteria = { _id: ObjectId.createFromHexString(reviewId) }

        // remove only if user is owner/admin
        if (!loggedinUser.isAdmin) {
            criteria.byUserId = ObjectId.createFromHexString(loggedinUser._id)
        }

        const { deletedCount } = await collection.deleteOne(criteria)
        return deletedCount
    } catch (err) {
        logger.error(`cannot remove review ${reviewId}`, err)
        throw err
    }
}

async function add(review) {
    try {
        const reviewToAdd = {
            userId: ObjectId.createFromHexString(review.userId),
            toyId: ObjectId.createFromHexString(review.toyId),
            txt: review.review,
        }
        const collection = await dbService.getCollection(collectionName)
        await collection.insertOne(reviewToAdd)
        console.log(reviewToAdd);

        return reviewToAdd
    } catch (err) {
        logger.error('cannot add review', err)
        throw err
    }
}

function _buildCriteria(filterBy) {
    const criteria = {}

    if (filterBy.toyId) {
        criteria.toyId = ObjectId.createFromHexString(filterBy.toyId)
    }
     if (filterBy.userId) {
        criteria.userId = ObjectId.createFromHexString(filterBy.userId)
    }
    return criteria
}