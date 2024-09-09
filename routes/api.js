'use strict';

module.exports = function (app) {
  let issues = {};

  app.route('/api/issues/:project')

    // GET route for viewing issues with optional filters
    .get(function (req, res) {
      let project = req.params.project;
      let filters = req.query;

      // Filter the issues based on the query parameters
      let projectIssues = issues[project] || [];
      let filteredIssues = projectIssues.filter(issue => {
        return Object.keys(filters).every(key => issue[key] == filters[key]);
      });

      // Return the filtered issues
      res.json(filteredIssues);
    })

    // POST route for creating a new issue
    .post(function (req, res) {
      let project = req.params.project;
      const { issue_title, issue_text, created_by, assigned_to = '', status_text = '' } = req.body;

      // Check for missing required fields
      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: 'required field(s) missing' });
      }

      // Generate a pseudo-unique ID using timestamp + random number
      let issueId = Date.now().toString() + Math.floor(Math.random() * 1000).toString();

      let newIssue = {
        _id: issueId,
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
        created_on: new Date(),
        updated_on: new Date(),
        open: true,
      };

      // Add issue to the project
      if (!issues[project]) {
        issues[project] = [];
      }
      issues[project].push(newIssue);

      res.json(newIssue);
    })

    // PUT route for updating an existing issue
    .put(function (req, res) {
      let project = req.params.project;
      let { _id, issue_title, issue_text, created_by, assigned_to, status_text, open } = req.body;

      // Check if _id is provided
      if (!_id) {
        return res.json({ error: 'missing _id' });
      }

      let projectIssues = issues[project] || [];
      let issue = projectIssues.find(issue => issue._id === _id);

      // If issue is not found, return an error
      if (!issue) {
        return res.json({ error: 'could not update', _id });
      }

      // Check if there are fields to update
      const fieldsToUpdate = { issue_title, issue_text, created_by, assigned_to, status_text, open };
      const hasUpdates = Object.keys(fieldsToUpdate).some(field => fieldsToUpdate[field] !== undefined && fieldsToUpdate[field] !== '');

      if (!hasUpdates) {
        return res.json({ error: 'no update field(s) sent', _id });
      }

      // Update the fields if they are provided
      issue.issue_title = issue_title || issue.issue_title;
      issue.issue_text = issue_text || issue.issue_text;
      issue.created_by = created_by || issue.created_by;
      issue.assigned_to = assigned_to || issue.assigned_to;
      issue.status_text = status_text || issue.status_text;
      if (open !== undefined) issue.open = open === 'true';
      issue.updated_on = new Date();

      res.json({ result: 'successfully updated', _id });
    })

    // DELETE route for deleting an issue
    .delete(function (req, res) {
      let project = req.params.project;
      let { _id } = req.body;

      // Check if _id is provided
      if (!_id) {
        return res.json({ error: 'missing _id' });
      }

      let projectIssues = issues[project] || [];
      let index = projectIssues.findIndex(issue => issue._id === _id);

      // If issue is not found, return an error
      if (index === -1) {
        return res.json({ error: 'could not delete', _id });
      }

      // Delete the issue
      projectIssues.splice(index, 1);

      res.json({ result: 'successfully deleted', _id });
    });
};
