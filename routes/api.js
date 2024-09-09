'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = function (app) {
  let issues = {};

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      let project = req.params.project;
      const filter = req.query; // allows filtering by URL queries
      const projectIssues = issues[project] || [];
      let filteredIssues = projectIssues;

      // Apply filtering based on query parameters
      for (let key in filter) {
        filteredIssues = filteredIssues.filter(issue => issue[key] === filter[key]);
      }

      res.json(filteredIssues);
    })
    
    .post(function (req, res){
      let project = req.params.project;
      const { issue_title, issue_text, created_by, assigned_to = '', status_text = '' } = req.body;

      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: 'required field(s) missing' });
      }

      const newIssue = {
        _id: uuidv4(),
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
        created_on: new Date(),
        updated_on: new Date(),
        open: true
      };

      // Add the issue to the project in our in-memory store
      issues[project] = issues[project] || [];
      issues[project].push(newIssue);

      res.json(newIssue);
    })
    
    .put(function (req, res){
      let project = req.params.project;
      const { _id, issue_title, issue_text, created_by, assigned_to, status_text, open } = req.body;

      if (!_id) {
        return res.json({ error: 'missing _id' });
      }

      const projectIssues = issues[project] || [];
      const issueToUpdate = projectIssues.find(issue => issue._id === _id);

      if (!issueToUpdate) {
        return res.json({ error: 'could not update', _id });
      }

      let updated = false;

      // Update the fields if they are provided
      if (issue_title) {
        issueToUpdate.issue_title = issue_title;
        updated = true;
      }
      if (issue_text) {
        issueToUpdate.issue_text = issue_text;
        updated = true;
      }
      if (created_by) {
        issueToUpdate.created_by = created_by;
        updated = true;
      }
      if (assigned_to) {
        issueToUpdate.assigned_to = assigned_to;
        updated = true;
      }
      if (status_text) {
        issueToUpdate.status_text = status_text;
        updated = true;
      }
      if (open !== undefined) {
        issueToUpdate.open = open;
        updated = true;
      }

      if (!updated) {
        return res.json({ error: 'no update field(s) sent', _id });
      }

      issueToUpdate.updated_on = new Date();
      res.json({ result: 'successfully updated', _id });
    })
    
    .delete(function (req, res){
      let project = req.params.project;
      const { _id } = req.body;

      if (!_id) {
        return res.json({ error: 'missing _id' });
      }

      const projectIssues = issues[project] || [];
      const index = projectIssues.findIndex(issue => issue._id === _id);

      if (index === -1) {
        return res.json({ error: 'could not delete', _id });
      }

      projectIssues.splice(index, 1);
      res.json({ result: 'successfully deleted', _id });
    });
    
};
