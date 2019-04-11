var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var boardSchema = new Schema({
    name: { type: String, required: true, index: true },
});

module.exports = mongoose.model('Board', boardSchema);