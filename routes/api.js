/*
*
*
*       Complete the API routing below
*
*
*/

const router = require('express').Router();
const boardHandler = require('../controllers/boardHandler');
const replyHandler = require('../controllers/replyHandler');
const threadHandler = require('../controllers/threadHandler');

/* /api/threads/{board}
*  I can POST a thread to a specific message board by passing form data text and delete_password. (Recomend res.redirect to board page /b/{board})
*  Saved will be: _id, text, created_on(date&time), bumped_on(date&time, starts same as created_on), reported(boolean), delete_password, replies(array)
*/
router.post('/threads/:board', (req, res, next) => {

  const { board } = req.params;
  const { text, delete_password } = req.body;

  boardHandler.findOrCreateBoard(board, (err, foundBoard) => {
    if(err) next(err);

    threadHandler.createThread({board: foundBoard, text, delete_password}, (err, createdThread) => {
      if(err) next(err);

      if (createdThread) {
        res.redirect(301, `/b/${foundBoard.name}/`);
      } else {
        next({status: 404, message:'bad request'});
      }
    });   
  })
});

/* /api/replies/{board}
*  I can POST a reply to a thead on a specific board by passing form data text, delete_password, & thread_id
*  and it will also update the bumped_on date to the comments date. (Recomend res.redirect to thread page /b/{board}/{thread_id})
*  In the thread's 'replies' array will be saved _id, text, created_on, delete_password, & reported.
*/
router.post('/replies/:board', (req, res, next) => {

  const { board } = req.params;
  const { text, delete_password, thread_id } = req.body;

  replyHandler.createReply({board, text, delete_password, thread_id}, (err, createdReply) => {
    if(err) next(err);
    if (createdReply) {
      res.redirect(`/b/${board}/${thread_id}`);
    } else {
      next({status: 404, message:'bad request'});
    }
  });
});

/* /api/threads/{board}
*  I can GET an array of the most recent 10 bumped threads on the board with only the most recent 3 replies.
* The reported and delete_passwords fields will not be sent.
*/

router.get('/threads/:board', (req, res, next) => {

  const { board } = req.params;

  threadHandler.getThreadList(board, (err, foundThreads) => {

    if(err) next(err);
    if (foundThreads) {
      res.json(foundThreads);
    } else {
      next({status: 404, message:'bad request'});
    }
  });
});


/* /api/replies/{board}?thread_id={thread_id}
*  I can GET an entire thread with all it's replies from . Also hiding the same fields.
*/
router.get('/replies/:board', (req, res, next) => {

  const { board } = req.params;
  const { thread_id } = req.query;

  threadHandler.getThread({board, thread_id}, (err, foundThread) => {
    if(err) next(err);
    if(foundThread) {
      res.json(foundThread);
    } else {
      next({status: 404, message:'bad request'});
    }
  });
});

/* /api/threads/{board}
*  I can delete a thread completely if I send a DELETE request and pass along the thread_id & delete_password. (Text response will be 'incorrect password' or 'success')
*/
router.delete('/threads/:board', (req, res, next) => {

  const { board } = req.params;
  const { thread_id, delete_password } = req.body;

  threadHandler.deleteThread({board, thread_id, delete_password}, (err, deleteMessage) => {
    if(err) next(err);
    if(deleteMessage) {
      res.send(deleteMessage);
    } else {
      next({status: 404, message:'bad request'});
    }
  });
});

/* /api/replies/{board}
* I can delete a post(just changing the text to '[deleted]') if I send a DELETE request and pass along the thread_id, reply_id, & delete_password.
* (Text response will be 'incorrect password' or 'success')
*/
router.delete('/replies/:board', (req, res, next) => {

  const { board } = req.params;
  const { thread_id, reply_id, delete_password } = req.body;

  replyHandler.deleteReply({board, thread_id, reply_id, delete_password}, (err, deleteMessage) => {
    if(err) next(err);
    if(deleteMessage) {
      res.send(deleteMessage);
    } else {
      next({status: 404, message:'bad request'});
    }
  })
});

/* /api/threads/{board}
*  I can report a thread and change it's reported value to true by sending a PUT request and pass along the thread_id. (Text response will be 'success')
*/

router.put('/threads/:board', (req, res, next) => {

  const { board } = req.params;
  const { thread_id } = req.body;

  threadHandler.reportThread({board, thread_id}, (err, reportMessage) => {
    if(err) next(err);
    if(reportMessage) {
      res.send(reportMessage);
    } else {
      next({status: 404, message:'bad request'});
    }
  });
});


/* /api/replies/{board}
*  I can report a reply and change it's reported value to true by sending a PUT request and pass along the thread_id & reply_id. (Text response will be 'success')
*/

router.put('/replies/:board', (req, res, next) => {

  const { board } = req.params;
  const { thread_id, reply_id } = req.body;

  threadHandler.reportThread({board, thread_id, reply_id}, (err, reportMessage) => {
    if(err) next(err);
    if(reportMessage) {
      res.send(reportMessage);
    } else {
      next({status: 404, message:'bad request'});
    }
  });
});

module.exports = router;
