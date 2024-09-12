'use strict';

module.exports = function (app) {
  let issues = {};

  app.route('/api/issues/:project')

    // GET route to view issues for a project
    .get(function (req, res) {
      let project = req.params.project;
      let filters = req.query;

      console.log('Project:', project);  // Debug: Log the project name
      console.log('Filters:', filters);  // Debug: Log the filters

      // Fetch project issues or an empty array if no issues exist for the project
      let projectIssues = issues[project] || [];

      // Convert "open" filter to a boolean if it exists
      if (filters.open) {
        filters.open = filters.open === 'true';  // Convert 'true' or 'false' string to a boolean
      }

      // Filter the issues based on the query parameters
      let filteredIssues = projectIssues.filter(issue => {
        return Object.keys(filters).every(key => {
          return issue[key] == filters[key];  // Ensure the issue property matches the filter
        });
      });

      console.log('Filtered Issues:', filteredIssues);  // Debug: Log the filtered results

      res.json(filteredIssues);
    })

    // POST route to create a new issue
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

    // PUT route to update an issue
    .put(function (req, res) {
      let project = req.params.project;
      let { _id, issue_title, issue_text, created_by, assigned_to, status_text, open } = req.body;
      
      if (!_id && !issue_title && !issue_text && !created_by && !assigned_to && !status_text && open === undefined) {
        return res.json({ error: 'no update field(s) sent', _id });
      }

      if (!_id) {
        return res.json({ error: 'missing _id' });
      }

      let projectIssues = issues[project] || [];
      let issue = projectIssues.find(issue => issue._id === _id);

      if (!issue) {
        return res.json({ error: 'could not update', _id });
      }

      // If no fields are provided to update, return an error
      

      // Update fields if they are provided
      issue.issue_title = issue_title || issue.issue_title;
      issue.issue_text = issue_text || issue.issue_text;
      issue.created_by = created_by || issue.created_by;
      issue.assigned_to = assigned_to || issue.assigned_to;
      issue.status_text = status_text || issue.status_text;
      if (open !== undefined) issue.open = open === 'true';
      issue.updated_on = new Date();

      res.json({ result: 'successfully updated', _id });
    })

    // DELETE route to delete an issue
    .delete(function (req, res) {
      let project = req.params.project;
      let { _id } = req.body;

      if (!_id) {
        return res.json({ error: 'missing _id' });
      }

      let projectIssues = issues[project] || [];
      let index = projectIssues.findIndex(issue => issue._id === _id);

      if (index === -1) {
        return res.json({ error: 'could not delete', _id });
      }

      projectIssues.splice(index, 1);

      res.json({ result: 'successfully deleted', _id });
    });

};
