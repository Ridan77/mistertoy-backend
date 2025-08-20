import configProd from './prod.js'
import configDev from './dev.js'

export var config

if (process.env.NODE_ENV === 'production') {
    console.log('config prod');
    config = configProd
} else {
    console.log('config dev');
    config = configDev
}
config.isGuestMode = true
