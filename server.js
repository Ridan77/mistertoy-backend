import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'

import { toyService } from './services/toyService.js'
import { userService } from './services/user.service.js'
import { loggerService } from './services/logger.service.js'
import cors from 'cors'

const app = express()

const corsOptions = {
    origin: [
        'http://127.0.0.1:5173',
        'http://localhost:5173',
        'http://127.0.0.1:5174',
        'http://localhost:5174'
    ],
    credentials: true
}
// Express Config:
app.use(cors(corsOptions))



//* Express Config:
app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())
app.set('query parser', 'extended')


//* Read All

app.get('/api/toy', (req, res) => {
    const filterBy = {
        txt: req.query.txt || '',
        labels: req.query.labels || [],
        status: req.query.status || 'all',
        sort: req.query.sort || ''
    }
    toyService.query(filterBy)
        .then(toys => res.send(toys))
        .catch(err => {
            loggerService.error('Cannot get toys', err)
            res.status(500).send('Cannot get toys')
        })
})

// Read by ID
app.get('/api/toy/:toyId', (req, res) => {
    const { toyId } = req.params
    toyService.getById(toyId)
        .then(toy => { res.send(toy) })
        .catch(err => {
            loggerService.error('Cannot get toy', err)
            res.status(500).send('Cannot load toy')
        })
})

//* Remove/Delete

app.delete('/api/toy/:toyId/', (req, res) => {
    // const loggedinUser = authService.validateToken(req.cookies.loginToken)
    // if (!loggedinUser) return res.status(401).send('Not authenticated')
    const { toyId } = req.params

    toyService.remove(toyId)
        .then(() => res.send(`Toy removed! ${toyId} `))
        .catch(err => {
            loggerService.error('Cannot remove toy', err)
            res.status(500).send('Cannot remove toy')
        })

})

// Add
app.post('/api/toy/', (req, res) => {

    // const loggedinUser = authService.validateToken(req.cookies.loginToken)
    // if (!loggedinUser) return res.status(401).send('Not authenticated')

    const toyToSave = {
        name: req.body.name,
        price: +req.body.price,
        imgUrl: req.body.imgUrl,
        labels: req.body.labels,
        inStock: req.body.inStock

    }

    toyService.save(toyToSave)
        .then(savedToy => res.send(savedToy))
        .catch(err => {
            loggerService.error('Cannot save toy', err)
            res.status(500).send('Cannot save toy')
        })
})

// Edit
app.put('/api/toy/:toyId', (req, res) => {
    // const loggedinUser = authService.validateToken(req.cookies.loginToken)
    // if (!loggedinUser) return res.status(401).send('Not authenticated')
    const toyToSave = {
        _id: req.body._id,
        name: req.body.name,
        price: +req.body.price,
        imgUrl: req.body.imgUrl,
        labels: req.body.labels,
        inStock: req.body.inStock

    }
    console.log(toyToSave);

    toyService.save(toyToSave)
        .then(savedToy => res.send(savedToy))
        .catch(err => {
            loggerService.error('Cannot save toy', err)
            res.status(500).send('Cannot save toy')
        })
})



// Fallback route
app.get('/*all', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})


const PORT = process.env.PORT || 3030
app.listen(PORT, () => {
    console.log(`Server listening on port http://127.0.0.1:${PORT}/`)
    loggerService.info(`Server listening on port http://127.0.0.1:${PORT}/`)
}
)