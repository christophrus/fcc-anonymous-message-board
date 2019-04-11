var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var replySchema = new Schema({
    thread: { type: Schema.Types.ObjectId, ref: 'Thread', index: true },
    text: { type: String, required: true },
    reported: {type: Boolean, default: false},
    delete_password: {type: String, bcrypt: true, required: true},
}, { timestamps: { createdAt: 'created_on', updatedAt: 'updated_on' } });

replySchema.set('toObject', {
    transform: function(doc, ret, options) {
        delete ret.__v;
        delete ret.delete_password;
        delete ret.reported;
    }
});

replySchema.plugin(require('mongoose-bcrypt'));

module.exports = mongoose.model('Reply', replySchema);