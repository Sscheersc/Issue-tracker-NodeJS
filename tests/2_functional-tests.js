const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {
    let testId;

    suite('POST /api/issues/{project} => create issue', function () {

        test('Create an issue with every field', function (done) {
            chai.request(server)
                .post('/api/issues/test')
                .send({
                    issue_title: 'Test Issue',
                    issue_text: 'Functional Test',
                    created_by: 'Tester',
                    assigned_to: 'Dev',
                    status_text: 'In QA'
                })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.issue_title, 'Test Issue');
                    assert.equal(res.body.issue_text, 'Functional Test');
                    assert.equal(res.body.created_by, 'Tester');
                    assert.equal(res.body.assigned_to, 'Dev');
                    assert.equal(res.body.status_text, 'In QA');
                    assert.isTrue(res.body.open);
                    testId = res.body._id; // save for future tests
                    done();
                });
        });

        test('Create an issue with only required fields', function (done) {
            chai.request(server)
                .post('/api/issues/test')
                .send({
                    issue_title: 'Test Issue 2',
                    issue_text: 'Functional Test 2',
                    created_by: 'Tester'
                })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.issue_title, 'Test Issue 2');
                    assert.equal(res.body.issue_text, 'Functional Test 2');
                    assert.equal(res.body.created_by, 'Tester');
                    assert.equal(res.body.assigned_to, '');
                    assert.equal(res.body.status_text, '');
                    assert.isTrue(res.body.open);
                    done();
                });
        });

        test('Create an issue with missing required fields', function (done) {
            chai.request(server)
                .post('/api/issues/test')
                .send({
                    issue_title: '',
                    issue_text: '',
                    created_by: ''
                })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.error, 'required field(s) missing');
                    done();
                });
        });
    });

    suite('GET /api/issues/{project} => view issues', function () {

        test('View issues on a project', function (done) {
            chai.request(server)
                .get('/api/issues/test')
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.isArray(res.body);
                    done();
                });
        });

        test('View issues on a project with one filter', function (done) {
            chai.request(server)
                .get('/api/issues/test')
                .query({ open: true })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.isArray(res.body);
                    assert.property(res.body[0], 'open');
                    assert.isTrue(res.body[0].open);
                    done();
                });
        });

        test('View issues on a project with multiple filters', function (done) {
            chai.request(server)
                .get('/api/issues/test')
                .query({ open: true, created_by: 'Tester' })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.isArray(res.body);
                    assert.property(res.body[0], 'open');
                    assert.isTrue(res.body[0].open);
                    assert.property(res.body[0], 'created_by');
                    assert.equal(res.body[0].created_by, 'Tester');
                    done();
                });
        });

    });

    suite('PUT /api/issues/{project} => update issue', function () {

        test('Update one field on an issue', function (done) {
            chai.request(server)
                .put('/api/issues/test')
                .send({ _id: testId, issue_text: 'Updated text' })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.result, 'successfully updated');
                    assert.equal(res.body._id, testId);
                    done();
                });
        });

        test('Update multiple fields on an issue', function (done) {
            chai.request(server)
                .put('/api/issues/test')
                .send({
                    _id: testId,
                    issue_text: 'Updated text again',
                    status_text: 'In progress'
                })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.result, 'successfully updated');
                    assert.equal(res.body._id, testId);
                    done();
                });
        });

        test('Update an issue with missing _id', function (done) {
            chai.request(server)
                .put('/api/issues/test')
                .send({ issue_title: 'Missing ID' })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.error, 'missing _id');
                    done();
                });
        });

        test('Update an issue with no fields to update', function (done) {
            chai.request(server)
                .put('/api/issues/test')
                .send({ _id: testId })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.error, 'no update field(s) sent');
                    assert.equal(res.body._id, testId);
                    done();
                });
        });

    });

    suite('DELETE /api/issues/{project} => delete issue', function () {

        test('Delete an issue', function (done) {
            chai.request(server)
                .delete('/api/issues/test')
                .send({ _id: testId })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.result, 'successfully deleted');
                    assert.equal(res.body._id, testId);
                    done();
                });
        });

        test('Delete an issue with an invalid _id', function (done) {
            chai.request(server)
                .delete('/api/issues/test')
                .send({ _id: 'invalidid' })
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.error, 'could not delete');
                    assert.equal(res.body._id, 'invalidid');
                    done();
                });
        });

        test('Delete an issue with missing _id', function (done) {
            chai.request(server)
                .delete('/api/issues/test')
                .send({})
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.error, 'missing _id');
                    done();
                });
        });
    });
});
