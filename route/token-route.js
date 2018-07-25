const token = require('../lib/token')

function init(app) {
    const path = '/token'

    app.post(path+'/sendToken', token.send)
    app.post(path+'/mintToken', token.mint)
    app.get(path+'/getBalance', token.balance)
}
module.exports = init;