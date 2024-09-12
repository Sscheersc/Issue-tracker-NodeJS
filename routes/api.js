'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

// Connect to MongoDB (update with your MongoDB URI)
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/issues_db')

// Define Issue schema
const issueSchema = new Schema({
  project: { type: String, required: true },
  issue_title: { type: String, required: true },
  issue_text: { type: String, required: true },
  created_by: { type: String, required: true },
  assigned_to: { type: String, default: '' },
  status_text: { type: String, default: '' },
  created_on: { type: Date, default: Date.now },
  updated_on: { type: Date, default: Date.now },
  open: { type: Boolean, default: true }
});

// Create Issue model
const Issue = mongoose.model('Issue', issueSchema);

module.exports = function (app) {

  app.route('/api/issues/:project')

    // GET route to view issues for a project
    .get(function (req, res) {
      let project = req.params.project;
      let filters = req.query;

      if (filters.open) {
        filters.open = filters.open === 'true'; // Convert 'true' or 'false' string to a boolean
      }

      // Fetch and filter issues from the database
      Issue.find({ project, ...filters }, function (err, issues) {
        if (err) return res.status(500).json({ error: 'Server error' });
        res.json(issues);
      });
    })

    // POST route to create a new issue
    .post(async function (req, res) {
      let project = req.params.project;
      const { issue_title, issue_text, created_by, assigned_to = '', status_text = '' } = req.body;
  
      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: 'required field(s) missing' });
      }
  
      try {
        const newIssue = new Issue({
          project,
          issue_title,
          issue_text,
          created_by,
          assigned_to,
          status_text
        });
  
        const issue = await newIssue.save(); // No callback needed
        res.json(issue);
      } catch (err) {
        res.status(500).json({ error: 'Server error' });
      }
    })

    // PUT route to update an issue
    .put(async function (req, res) {
      let { _id, issue_title, issue_text, created_by, assigned_to, status_text, open } = req.body;
  
      if (!_id) {
        return res.json({ error: 'missing _id' });
      }
  
      let updateFields = {};
      if (issue_title) updateFields.issue_title = issue_title;
      if (issue_text) updateFields.issue_text = issue_text;
      if (created_by) updateFields.created_by = created_by;
      if (assigned_to) updateFields.assigned_to = assigned_to;
      if (status_text) updateFields.status_text = status_text;
      if (open !== undefined) updateFields.open = open === 'true';
  
      updateFields.updated_on = new Date();
  
      try {
        const issue = await Issue.findByIdAndUpdate(_id, updateFields, { new: true });
  
        if (!issue) {
          return res.json({ error: 'could not update', _id });
        }
  
        res.json({ result: 'successfully updated', _id });
      } catch (err) {
        res.json({ error: 'could not update', _id });
      }
    })

    // DELETE route to delete an issue
    .delete(async function (req, res) {
      let { _id } = req.body;
  
      if (!_id) {
        return res.json({ error: 'missing _id' });
      }
  
      try {
        const issue = await Issue.findByIdAndDelete(_id);
  
        if (!issue) {
          return res.json({ result: 'could not delete', _id });
        }
  
        res.json({ result: 'successfully deleted', _id });
      } catch (err) {
        res.json({ result: 'could not delete', _id });
      }
    });

};
