var mongoose = require('mongoose');
var Board = require('../models/board');

exports.findOrCreateBoard = (name, cb) => {

    Board.findOne({name}, (err, foundBoard) => {
        if(err) return cb(err);
        if (foundBoard) {
            return cb(null, foundBoard);
        } else {
            Board.create({name}, (err, foundBoard) => {
                if(err) return cb(err, null);
                return cb(null, foundBoard);
            });
        }
    });
}