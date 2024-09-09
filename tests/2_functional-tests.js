const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    let issueId;

    // Test 1: Create an issue with every field
    test('Create an issue with every field', function(done) {
      chai.request(server)
        .post('/api/issues/apitest')
        .send({
          issue_title: 'Test Issue',
          issue_text: 'This is a test issue',
          created_by: 'Tester',
          assigned_to: 'Joe',
          status_text: 'In QA'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, 'Test Issue');
          assert.equal(res.body.issue_text, 'This is a test issue');
          assert.equal(res.body.created_by, 'Tester');
          assert.equal(res.body.assigned_to, 'Joe');
          assert.equal(res.body.status_text, 'In QA');
          assert.isTrue(res.body.open);
          assert.exists(res.body._id);
          issueId = res.body._id; // Store the ID for later tests
          done();
        });
    });
  
    // Test 2: Create an issue with only required fields
    test('Create an issue with only required fields', function(done) {
      chai.request(server)
        .post('/api/issues/apitest')
        .send({
          issue_title: 'Required Fields Issue',
          issue_text: 'Only required fields',
          created_by: 'Tester'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, 'Required Fields Issue');
          assert.equal(res.body.issue_text, 'Only required fields');
          assert.equal(res.body.created_by, 'Tester');
          assert.equal(res.body.assigned_to, '');
          assert.equal(res.body.status_text, '');
          assert.isTrue(res.body.open);
          assert.exists(res.body._id);
          done();
        });
    });
  
    // Test 3: Create an issue with missing required fields
    test('Create an issue with missing required fields', function(done) {
      chai.request(server)
        .post('/api/issues/apitest')
        .send({
          issue_text: 'Missing title and created_by'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'required field(s) missing');
          done();
        });
    });
  
    // Test 4: View issues on a project
    test('View issues on a project', function(done) {
      chai.request(server)
        .get('/api/issues/apitest')
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], '_id');
          done();
        });
    });
  
    // Test 5: View issues on a project with one filter
    test('View issues on a project with one filter', function(done) {
      chai.request(server)
        .get('/api/issues/apitest?open=true')
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          res.body.forEach(issue => {
            assert.isTrue(issue.open);
          });
          done();
        });
    });
  
    // Test 6: View issues on a project with multiple filters
    test('View issues on a project with multiple filters', function(done) {
      chai.request(server)
        .get('/api/issues/apitest?open=true&assigned_to=Joe')
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          res.body.forEach(issue => {
            assert.isTrue(issue.open);
            assert.equal(issue.assigned_to, 'Joe');
          });
          done();
        });
    });
  
    // Test 7: Update one field on an issue
    test('Update one field on an issue', function(done) {
      chai.request(server)
        .put('/api/issues/apitest')
        .send({
          _id: issueId,
          issue_text: 'Updated issue text'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, 'successfully updated');
          assert.equal(res.body._id, issueId);
          done();
        });
    });
  
    // Test 8: Update multiple fields on an issue
    test('Update multiple fields on an issue', function(done) {
      chai.request(server)
        .put('/api/issues/apitest')
        .send({
          _id: issueId,
          issue_title: 'Updated Title',
          issue_text: 'Updated text'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, 'successfully updated');
          assert.equal(res.body._id, issueId);
          done();
        });
    });
  
    // Test 9: Update an issue with missing _id
    test('Update an issue with missing _id', function(done) {
      chai.request(server)
        .put('/api/issues/apitest')
        .send({
          issue_title: 'Missing ID'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'missing _id');
          done();
        });
    });
  
    // Test 10: Update an issue with no fields to update
    test('Update an issue with no fields to update', function(done) {
      chai.request(server)
        .put('/api/issues/apitest')
        .send({
          _id: issueId
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'no update field(s) sent');
          assert.equal(res.body._id, issueId);
          done();
        });
    });
  
    // Test 11: Delete an issue
    test('Delete an issue', function(done) {
      chai.request(server)
        .delete('/api/issues/apitest')
        .send({
          _id: issueId
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, 'successfully deleted');
          assert.equal(res.body._id, issueId);
          done();
        });
    });
  
    // Test 12: Delete an issue with an invalid _id
    test('Delete an issue with an invalid _id', function(done) {
      chai.request(server)
        .delete('/api/issues/apitest')
        .send({
          _id: 'invalidid'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'could not delete');
          assert.equal(res.body._id, 'invalidid');
          done();
        });
    });
  
    // Test 13: Delete an issue with missing _id
    test('Delete an issue with missing _id', function(done) {
      chai.request(server)
        .delete('/api/issues/apitest')
        .send({})
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'missing _id');
          done();
        });
    });
});
