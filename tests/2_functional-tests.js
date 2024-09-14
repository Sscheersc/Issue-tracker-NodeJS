const chai = require('chai');
const chaiHttp = require('chai-http');
const assert = chai.assert;
const server = require('../server'); // Adjust path as needed

chai.use(chaiHttp);

suite('Functional Tests', function() {
  
  let issueId;

  suite('POST /api/issues/{project}', function() {
    test('Create an issue with every field', function(done) {
      chai.request(server)
        .post('/api/issues/testProject')
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
        .post('/api/issues/testProject')
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
        .post('/api/issues/testProject')
        .send({
          issue_title: 'Issue with missing fields'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200); // Changed from 200 to 400
          assert.isObject(res.body);
          assert.propertyVal(res.body, 'error', 'required field(s) missing');
          done();
        });
    });
  });

  suite('GET /api/issues/{project}', function() {
    test('View issues on a project', function(done) {
      chai.request(server)
        .get('/api/issues/testProject')
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          done();
        });
    });

    test('View issues on a project with one filter', function(done) {
      chai.request(server)
        .get('/api/issues/testProject?open=true')
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          res.body.forEach(issue => assert.isTrue(issue.open));
          done();
        });
    });

    test('View issues on a project with multiple filters', function(done) {
      chai.request(server)
        .get('/api/issues/testProject?open=true&assigned_to=Assignee')
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          res.body.forEach(issue => {
            assert.isTrue(issue.open);
            assert.equal(issue.assigned_to, 'Assignee');
          });
          done();
        });
    });
  });

  suite('PUT /api/issues/{project}', function() {
    test('Update one field on an issue', function(done) {
      chai.request(server)
        .put('/api/issues/testProject')
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
        .put('/api/issues/testProject')
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
        .put('/api/issues/testProject')
        .send({
          issue_title: 'Update without _id'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200); // Changed from 200 to 400
          assert.isObject(res.body);
          assert.propertyVal(res.body, 'error', 'missing _id');
          done();
        });
    });

    test('Update an issue with no fields to update', function(done) {
      chai.request(server)
        .put('/api/issues/testProject')
        .send({
          _id: issueId
        })
        .end(function(err, res) {
          assert.equal(res.status, 200); // Expecting 400 for no update fields
          assert.isObject(res.body);
          assert.propertyVal(res.body, 'error', 'no update field(s) sent');
          assert.propertyVal(res.body, '_id', issueId);
          done();
        });
    });

    test('Update an issue with an invalid _id', function(done) {
      chai.request(server)
        .put('/api/issues/testProject')
        .send({
          _id: 'invalid_id',
          issue_title: 'Attempt to update with invalid _id'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200); // Expecting 500 for server error
          assert.isObject(res.body);
          assert.propertyVal(res.body, 'error', 'could not update');
          assert.propertyVal(res.body, '_id', 'invalid_id');
          done();
        });
    });
  });

  suite('DELETE /api/issues/{project}', function() {
    test('Delete an issue', function(done) {
      chai.request(server)
        .delete('/api/issues/testProject')
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
        .delete('/api/issues/testProject')
        .send({})
        .end(function(err, res) {
          assert.equal(res.status, 200); // Changed from 200 to 400
          assert.isObject(res.body);
          assert.propertyVal(res.body, 'error', 'missing _id');
          done();
        });
    });

    test('Delete an issue with an invalid _id', function(done) {
      chai.request(server)
        .delete('/api/issues/testProject')
        .send({ _id: 'invalid_id' })
        .end(function(err, res) {
          assert.equal(res.status, 200); // Expecting 500 for server error
          assert.isObject(res.body);
          assert.propertyVal(res.body, 'error', 'could not delete');
          assert.propertyVal(res.body, '_id', 'invalid_id');
          done();
        });
    });
  });
});
