const  mongoose  = require("mongoose");

const messageSchema = mongoose.Schema({
    userName: {type: String, required: true},
    message: {type: String, required: true},
    time: {type: Date, default: Date.now()}
})

module.exports = mongoose.model('Message', messageSchema)