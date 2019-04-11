/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;
var server = require('../server');

chai.use(chaiHttp);

var testThread1;
var testThread2;
var testReply1;

suite('Functional Tests', function() {

  suite('API ROUTING FOR /api/threads/:board', function() {
    
    suite('POST', function() {

      test('Post a new thread on a board', function(done) {
        chai.request(server)
         .post('/api/threads/test')
         .send({
           text: 'Testmessage', delete_password: '12345'
         })
         .end(function(err, res){
           assert.include(res.redirects[0], "/b/test/", 'should redirect to /b/test/');
           assert.equal(res.status, 200);

           chai.request(server)
            .post('/api/threads/test')
            .send({
              text: 'Testmessage', delete_password: '12345'
            })
            .end(function(err, res){
              assert.include(res.redirects[0], "/b/test/", 'should redirect to /b/test/');
              assert.equal(res.status, 200);
              done();
            });
         });
       });
    });
    
    suite('GET', function() {

      test('Get an array of the most recent 10 bumped threads on the board with only the most recent 3 replies', function(done) {
        chai.request(server)
         .get('/api/threads/test')
         .end(function(err, res){
           assert.equal(res.status, 200);
           assert.isArray(res.body);
           assert.isBelow(res.body.length, 11);
           assert.property(res.body[0], "_id");
           assert.property(res.body[0], "text");
           assert.property(res.body[0], "created_on");
           assert.property(res.body[0], "bumped_on");
           assert.property(res.body[0], "replycount");
           assert.property(res.body[0], "replies");
           assert.notProperty(res.body[0], "delete_password");
           assert.notProperty(res.body[0], "reported");
           assert.isArray(res.body[0].replies);
           assert.equal(res.body[0].text, "Testmessage");
           assert.equal(res.body[0].replycount, res.body[0].replies.length);
           assert.equal(res.res.body[0].created_on, res.body[0].bumped_on);
           assert.isArray(res.body);
           res.body.forEach(el => {
              assert.isBelow(el.replies.length, 4, "Thread "+el._id+" has more than 3 replies");
           });
           testThread1 = {...res.body[0]}
           testThread2 = {...res.body[1]}
           done();
         });
       });
      
    });
    
    suite('DELETE', function() {

      test('Delete a thread with correct password should succeed', function(done) {
        chai.request(server)
         .delete('/api/threads/test')
         .send({
           thread_id: testThread1._id, delete_password: '12345'
         })
         .end(function(err, res){
           assert.equal(res.status, 200);
           assert.equal(res.text, "success");
           done();
         });
       });

       test('Delete a thread with incorrect password should fail', function(done) {
        chai.request(server)
         .delete('/api/threads/test')
         .send({
           thread_id: testThread2._id, delete_password: '54321'
         })
         .end(function(err, res){
           assert.equal(res.status, 200);
           assert.equal(res.text, "incorrect password");
           done();
         });
       });

       test('Deleted thread should be gone', function(done) {
        chai.request(server)
         .get('/api/replies/test')
         .query({
           thread_id: testThread1._id,
         })
         .end(function(err, res){
           assert.equal(res.status, 404);
           assert.property(res.body, "error");
           assert.equal(res.body.error, "bad request");
           done();
         });
       });
      
    });
    
    suite('PUT', function() {

      test('Reporting a thread should succeed', function(done) {
        chai.request(server)
         .put('/api/threads/test')
         .send({
           thread_id: testThread2._id
         })
         .end(function(err, res){
           assert.equal(res.status, 200);
           assert.equal(res.text, "success");
           done();
         });
       });
      
    });
    

  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    
    suite('POST', function() {

      test('Post a new reply in a thread', function(done) {
        chai.request(server)
         .post('/api/replies/test')
         .send({
           thread_id: testThread2._id, text: 'Testmessage: Reply', delete_password: '12345'
         })
         .end(function(err, res){
           assert.include(res.redirects[0], "/b/test/"+testThread2._id, 'should redirect to /b/test/'+testThread2._id);
           assert.equal(res.status, 200);
           done();
         });
       });
      
    });
    
    suite('GET', function() {

      test('Get a thread', function(done) {
        chai.request(server)
         .get('/api/replies/test')
         .query({
           thread_id: testThread2._id,
         })
         .end(function(err, res){
          assert.equal(res.status, 200);
          assert.property(res.body, "_id");
          assert.property(res.body, "text");
          assert.property(res.body, "created_on");
          assert.property(res.body, "bumped_on");
          assert.property(res.body, "replies");
          assert.notProperty(res.body, "delete_password");
          assert.notProperty(res.body, "reported");
          assert.equal(res.body.text, "Testmessage");
          assert.notEqual(res.res.body.created_on, res.body.bumped_on);
          assert.isArray(res.body.replies);
          res.body.replies.forEach(el => {
            assert.property(el, "_id");
            assert.property(el, "text");
            assert.property(el, "created_on");
            assert.notProperty(el, "delete_password");
            assert.notProperty(el, "reported");
            assert.equal(el.text, "Testmessage: Reply");
          });
          testReply1 = {...res.body.replies[0]}
          testReply2 = {...res.body.replies[1]}
          done();
         });
       });
      
    });
    
    suite('PUT', function() {

      test('Reporting a thread should succeed', function(done) {
        chai.request(server)
         .put('/api/replies/test')
         .send({
           reply_id: testReply1._id, thread_id: testThread2._id
         })
         .end(function(err, res){
           assert.equal(res.status, 200);
           assert.equal(res.text, "success");
           done();
         });
       });
      
    });
    
    suite('DELETE', function() {

      test('Delete a thread with correct password should succeed', function(done) {
        chai.request(server)
         .delete('/api/replies/test')
         .send({
          reply_id: testReply1._id, thread_id: testThread2._id, delete_password: '12345'
         })
         .end(function(err, res){
           assert.equal(res.status, 200);
           assert.equal(res.text, "success");
           done();
         });
       });

       test('Deleted reply should say [deleted]', function(done) {
        chai.request(server)
         .get('/api/replies/test')
         .query({
           thread_id: testThread2._id,
         })
         .end(function(err, res){
           assert.equal(res.status, 200);
           assert.equal(res.body.replies[0].text, "[deleted]");
           done();
         });
       });

       test('Delete a reply with incorrect password should fail', function(done) {
        chai.request(server)
         .delete('/api/replies/test')
         .send({
           reply_id: testReply1, thread_id: testThread2._id, delete_password: '54321'
         })
         .end(function(err, res){
           assert.equal(res.status, 200);
           assert.equal(res.text, "incorrect password");
           done();
         });
       });
      
    });

    suite('CLEANUP', function() {
      test('Cleanup', function(done) {
        chai.request(server)
         .delete('/api/threads/test')
         .send({
           thread_id: testThread2._id, delete_password: '12345'
         })
         .end(function(err, res){
           assert.equal(res.status, 200);
           assert.equal(res.text, "success");
           done();
         });
       });
    });
    
  });

});
