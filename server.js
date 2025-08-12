import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'

import { toyService } from './services/toyService.js'
import { userService } from './services/user.service.js'
import { loggerService } from './services/logger.service.js'


const app = express()


//* Express Config:
app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())
app.set('query parser', 'extended')


//* Read

app.get('/api/toy', (req, res) => {
    const filterBy = {
        txt: req.query.txt || '',
        labels: req.query.labels||[],
        status: req.query.status|| 'all',
        sort: req.query.sort || ''
    }

    console.log(filterBy);
    
    
    toyService.query(filterBy)
        .then(toys => res.send(toys))
        .catch(err => {
            loggerService.error('Cannot get toys', err)
            res.status(500).send('Cannot get toys')
        })
})


// Fallback route
app.get('/*all', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})


const PORT = process.env.PORT || 3030
app.listen(PORT, () =>{
    console.log(`Server listening on port http://127.0.0.1:${PORT}/`)
    loggerService.info(`Server listening on port http://127.0.0.1:${PORT}/`)
}
)