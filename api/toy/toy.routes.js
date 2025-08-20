import express from 'express'
import { requireAuth, requireAdmin } from '../../middlewares/requireAuth.middleware.js'
import { log } from '../../middlewares/logger.middlewares.js'
import { getToys, getToyById, addToy, updateToy, removeToy, addToyMsg, removeToyMsg,getData } from './toy.controller.js'

export const toyRoutes = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)
// router.use(requireAdmin)


toyRoutes.get('/',log, getToys)
toyRoutes.get('/dashboard', getData)
toyRoutes.get('/:toyId', getToyById)
toyRoutes.post('/',requireAuth,requireAdmin ,addToy) 
toyRoutes.post('/:toyId/msg', requireAuth, addToyMsg)
toyRoutes.put('/:toyId',requireAuth,requireAdmin,  updateToy) 
toyRoutes.delete('/:toyId',requireAuth,requireAdmin,  removeToy) 

// toyRoutes.delete('/:toyId/msg/:msgId', requireAuth, removeToyMsg)