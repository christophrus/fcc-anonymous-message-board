var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var threadSchema = new Schema({
    board: { type: Schema.Types.ObjectId, ref: 'Board', required: true, index: true},
    text: { type: String, required: true },
    reported: {type: Boolean, default: false},
    delete_password: {type: String, bcrypt: true, required: true},
}, { timestamps: { createdAt: 'created_on', updatedAt: 'bumped_on' } });

threadSchema.set('toObject', {
    transform: function(doc, ret, options) {
        delete ret.__v;
        delete ret.delete_password;
        delete ret.reported;
        delete ret.board;
    }
});

threadSchema.plugin(require('mongoose-bcrypt'));

module.exports = mongoose.model('Thread', threadSchema);