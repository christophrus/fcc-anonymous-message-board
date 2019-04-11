var mongoose = require('mongoose');
var Board = mongoose.model('Board');
var Thread = mongoose.model('Thread');
var Reply = mongoose.model('Reply');

exports.createThread = (thread, cb) => {

    Thread.create(thread, (err, createdThread) => {
        if(err) return cb(err);
        return cb(null, createdThread);
    });
}

// most recent 10 bumped threads on the board with only the most recent 3 replies
exports.getThreadList = async (board, cb) => {
    try {
        var foundBoard = await Board.findOne({name: board}).exec();
        if(foundBoard) {
            var foundThreads = await Thread.find({board: foundBoard}).sort('-bumped_on').limit(10).exec();
            foundThreads = await Promise.all(foundThreads.map(async thread => {
                thread = await thread.toObject();
                var replies = await Reply.find({thread: thread._id}).sort('-created_on').exec();
                thread.replycount = replies.length;
                thread.replies = replies.map(el => el.toObject()).slice(0, 3);
                return thread;
            }));
            return cb(null, foundThreads);
        } else {
            cb();
        }
    } catch(err) {
        return cb(err);
    }
}

exports.getThread = (data, cb) => {

    var { board, thread_id } = data;

    Board.findOne({name: board}, (err, foundBoard) => {

        if(err) return cb(err);
        if(foundBoard) {

            Thread.findOne({_id: thread_id}, (err, foundThread) => {
                if(err) return cb(err);
                if(foundThread) {

                    Reply.find({thread: foundThread}, (err, foundReplies) => {
                        if(err) return cb(err);

                        foundThread = foundThread.toObject();
                        foundThread.replies = foundReplies.map(el => el.toObject());

                        return cb(null, foundThread);              
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

exports.deleteThread = (data, cb) => {

    const { board, thread_id, delete_password } = data;

    Board.findOne({name: board}, (err, foundBoard) => {
        if(err) return cb(err);
        if(foundBoard) {
            Thread.findOne({_id: thread_id},(err, foundThread) => {
                if(err) return cb(err);
                foundThread.verifyDelete_password(delete_password, (err, valid) => {
                    if(err) return cb(err);
                    if(valid) {
                        Thread.findOneAndDelete({_id: thread_id}, (err, deletedThread) => {
                            if(err) return cb(err);
                            if(deletedThread) {
                                //cleanup associated replies
                                Reply.deleteMany({thread: thread_id}).exec();
                                return cb(null, "success");
                            } else {
                                cb();
                            }
                        });      
                    } else {
                        return cb(null, "incorrect password");
                    }
                });
            });
        } else {
            cb();
        }
    });
}

exports.reportThread = (data, cb) => {

    const { board, thread_id } = data;

    Board.findOne({name: board}, (err, foundBoard) => {
        if(err) return cb(err);
        if(foundBoard) {
            Thread.findOneAndUpdate({_id: thread_id}, {reported: true}, {new: true}, (err, updatedThread) => {
                if(err) return cb(err);
                if(updatedThread) {
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