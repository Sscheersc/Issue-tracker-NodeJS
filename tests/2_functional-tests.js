const chai = require('chai');
const chaiHttp = require('chai-http');
const assert = chai.assert;
const server = require('../server'); // Adjust path as needed

chai.use(chaiHttp);

suite('Functional Tests', function() {
  
  let issueId;

  suite('POST /apitest/issues/{project}', function() {
    test('Create an issue with every field', function(done) {
      chai.request(server)
        .post('/apitest/issues/testProject')
        .send({
          issue_title: 'Issue with every field',
          issue_text: 'Some issue text',
          created_by: 'Tester',
          assigned_to: 'Assignee',
          status_text: 'In Progress'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.property(res.body, '_id');
          issueId = res.body._id;
          done();
        });
    });

    test('Create an issue with only required fields', function(done) {
      chai.request(server)
        .post('/apitest/issues/testProject')
        .send({
          issue_title: 'Issue with required fields',
          issue_text: 'Some issue text',
          created_by: 'Tester'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.property(res.body, '_id');
          done();
        });
    });

    test('Create an issue with missing required fields', function(done) {
      chai.request(server)
        .post('/apitest/issues/testProject')
        .send({
          issue_title: 'Issue with missing fields'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.propertyVal(res.body, 'error', 'required field(s) missing');
          done();
        });
    });
  });

  suite('PUT /apitest/issues/{project}', function() {
    test('Update one field on an issue', function(done) {
      chai.request(server)
        .put('/apitest/issues/testProject')
        .send({
          _id: issueId,
          status_text: 'Resolved'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.propertyVal(res.body, 'result', 'successfully updated');
          assert.propertyVal(res.body, '_id', issueId);
          done();
        });
    });

    test('Update multiple fields on an issue', function(done) {
      chai.request(server)
        .put('/apitest/issues/testProject')
        .send({
          _id: issueId,
          issue_title: 'Updated title',
          assigned_to: 'New Assignee'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.propertyVal(res.body, 'result', 'successfully updated');
          assert.propertyVal(res.body, '_id', issueId);
          done();
        });
    });

    test('Update an issue with missing _id', function(done) {
      chai.request(server)
        .put('/apitest/issues/testProject')
        .send({
          issue_title: 'Update without _id'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.propertyVal(res.body, 'error', 'missing _id');
          done();
        });
    });
  });

  suite('DELETE /apitest/issues/{project}', function() {
    test('Delete an issue', function(done) {
      chai.request(server)
        .delete('/apitest/issues/testProject')
        .send({ _id: issueId })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.propertyVal(res.body, 'result', 'successfully deleted');
          assert.propertyVal(res.body, '_id', issueId);
          done();
        });
    });

    test('Delete an issue with missing _id', function(done) {
      chai.request(server)
        .delete('/apitest/issues/testProject')
        .send({})
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.propertyVal(res.body, 'error', 'missing _id');
          done();
        });
    });
  });
});
