import express from 'express'
import http from 'http'

import path from 'path'
import cookieParser from 'cookie-parser'
import { setupAsyncLocalStorage } from './middlewares/setupAls.middleware.js'
import { setupSocketAPI } from './services/socket.service.js'



import { loggerService } from './services/logger.service.js'
loggerService.info('server.js loaded...')

import cors from 'cors'

const app = express()
const server = http.createServer(app)
//* Express Config:

app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())
app.set('query parser', 'extended')

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve('public')))
} else {
    const corsOptions = {
        origin: [   'http://127.0.0.1:3000',
                    'http://localhost:3000',
                    'http://127.0.0.1:5173',
                    'http://localhost:5173'
                ],
        credentials: true
    }
    app.use(cors(corsOptions))
}
app.all('*all', setupAsyncLocalStorage)
setupSocketAPI(server)


import { authRoutes } from './api/auth/auth.routes.js'
import { toyRoutes } from './api/toy/toy.routes.js'
import { reviewRoutes } from './api/review/review.routes.js'


// routes
app.use('/api/auth', authRoutes)
app.use('/api/toy', toyRoutes)
app.use('/api/review', reviewRoutes)



// Fallback route
app.get('/*all', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})


const PORT = process.env.PORT || 3030
server.listen(PORT, () => {
    console.log(`Server listening on port http://127.0.0.1:${PORT}/`)
    loggerService.info(`Server listening on port http://127.0.0.1:${PORT}/`)
}
)

