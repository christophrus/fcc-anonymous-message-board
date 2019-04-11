var mongoose = require('mongoose');
var Board = require('../models/board');
var Thread = require('../models/thread');
var Reply = require('../models/reply');

exports.createReply = (data, cb) => {

    const { text, delete_password, thread_id } = data;

    Thread.findOneAndUpdate({_id: thread_id}, { bumped_on: new Date() }, (err, foundThread) => {
        if(err) return cb(err);
        if (foundThread) {
            Reply.create({thread: foundThread, text, delete_password}, (err, createdReply) => {
                if(err) return cb(err, null);
                return cb(null, createdReply);
            });
        } else {
            cb();
        }
    });
}

exports.deleteReply = (data, cb) => {

    const { board, thread_id, reply_id, delete_password } = data;

    Board.findOne({name: board}, (err, foundBoard) => {
        if(err) return cb(err);

        if(foundBoard) {
            Reply.findOne({_id: reply_id, thread: thread_id}, (err, foundReply) => {
                if(err) return cb(err);
                if (foundReply) {
                    foundReply.verifyDelete_password(delete_password, (err, valid) => {
                        if(err) return cb(err);
                        if(valid) {
                            foundReply.text = "[deleted]";
                            foundReply.save((err, saved) => {
                                if(err) return cb(err);
                                if(saved) {
                                    return cb(null, "success");
                                }
                            });
                        } else {
                            return cb(null, "incorrect password");
                        }
                    });
                } else {
                    cb();
                }
            });
        } else {
            cb();
        }
    });
}

exports.reportReply = (data, cb) => {

    const { board, thread_id, reply_id } = data;

    Board.findOne({name: board}, (err, foundBoard) => {
        if(err) return cb(err);

        if(foundBoard) {
            Reply.findOneAndUpdate({_id: reply_id, thread: thread_id}, {reported: true}, {new: true}, (err, updatedReply) => {
                if(err) return cb(err);
                if(updatedReply) {
                    return cb(null, "success");
                } else {
                    cb();
                }
            });
        } else {
            cb();
        }
    });
}