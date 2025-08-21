import { toyService } from './toy.service.js'
import { loggerService } from '../../services/logger.service.js'

export async function getToys(req, res) {
    try {
        const filterBy = {
            txt: req.query.txt || '',
            labels: req.query.labels || [],
            status: req.query.status || 'all',
            sort: req.query.sort || ''
        }
        const toys = await toyService.query(filterBy)
        res.json(toys)
    } catch (err) {
        loggerService.error('Failed to get toys', err)
        res.status(500).send({ err: 'Failed to get toys' })
    }
}

export async function getToyById(req, res) {
    try {
        const { toyId } = req.params
        const toy = await toyService.getById(toyId)
        res.json(toy)
    } catch (err) {
        loggerService.error('Failed to get toy', err)
        res.status(500).send({ err: 'Failed to get toy' })
    }
}

export async function addToy(req, res) {
    const { loggedinUser } = req
    const toyToSave = {
        name: req.body.name,
        price: +req.body.price,
        imgUrl: req.body.imgUrl,
        labels: req.body.labels,
        inStock: req.body.inStock
    }

    try {
        toyToSave.owner = loggedinUser
        const addedToy = await toyService.add(toyToSave)
        res.json(addedToy)
    } catch (err) {
        loggerService.error('Failed to add toy', err)
        res.status(500).send({ err: 'Failed to add toy' })
    }
}

export async function updateToy(req, res) {

    try {
        const toy = { ...req.body }
        const updatedToy = await toyService.update(toy)
        res.send(updatedToy)
    } catch (err) {
        loggerService.error('Failed to update toy', err)
        res.status(500).send({ err: 'Failed to update toy' })
    }
}

export async function removeToy(req, res) {
    try {
        const toyId = req.params.toyId
        const deletedCount = await toyService.remove(toyId)
        res.send(`${deletedCount} toys removed`)
    } catch (err) {
        loggerService.error('Failed to remove toy', err)
        res.status(500).send({ err: 'Failed to remove toy' })
    }
}

export async function addToyMsg(req, res) {
    const { loggedinUser } = req


    try {
        const toyId = req.params.toyId
        const msg = {
            txt: req.body.msg,
            by: loggedinUser,
            createdAt: Date.now(),
        }
        const savedMsg = await toyService.addToyMsg(toyId, msg)
        res.json(savedMsg)
    } catch (err) {
        loggerService.error('Failed to update toy', err)
        res.status(500).send({ err: 'Failed to update toy' })
    }
}

export async function removeToyMsg(req, res) {
    const { loggedinUser } = req
    try {
        // const toyId = req.params.id
        // const { msgId } = req.params

        const { id: toyId, msgId } = req.params

        const removedId = await toyService.removeToyMsg(toyId, msgId)
        res.send(removedId)
    } catch (err) {
        loggerService.error('Failed to remove toy msg', err)
        res.status(500).send({ err: 'Failed to remove toy msg' })
    }

}

export async function getData(req, res) {
    try {
        
        const data = await toyService.getDashboard()
        res.send(data)
    } catch (error) {
        loggerService.error('Failed to get dashboard', err)
        res.status(500).send({ err: 'Failed to get dashboard' })
    }
}