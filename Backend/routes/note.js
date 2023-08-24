const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate");
const Notes = require("../database/models/notes");
const { body, validationResult } = require("express-validator");

// ROUTE 1: Get All the Notes using: GET "/api/note/fetchallnotes". Login required
router.route("/fetchallnotes").get(authenticate, async (req, res) => {
  try {
    const notes = await Notes.find({ user: req.payload._id });
    res.json(notes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

// ROUTE 2: Add a new Note using: POST "/api/note/addnote". Login required
router.route("/addnote").post(authenticate, [body("title", "Enter a valid title").isLength({ min: 3 }), body("description", "Description must be at least 5 characters").isLength({ min: 5 }), body("tag", "Tag must be max 10 characters").isLength({ max: 10 })], async (req, res) => {
  try {
    console.log("title: ", req.body.title, "\ndescription: ", req.body.description, "\ntag: ", req.body.title);
    // Return if inputs are invalid
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }
    const { title, description, tag } = req.body;
    const note = new Notes({
      title,
      description,
      tag,
      user: req.payload._id,
    });
    const savedNote = await note.save();
    res.json(savedNote);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

// ROUTE 3: Update an existing Note using: PUT "/api/note/updatenote". Login required
router.route("/updatenote/:id").put(authenticate, async (req, res) => {
  const { title, description, tag } = req.body;
  try {
    // Create a newNote object
    const newNote = {};
    if (title) {
      newNote.title = title;
    }
    if (description) {
      newNote.description = description;
    }
    if (tag) {
      newNote.tag = tag;
    }

    // Find the note to be updated and update it
    let note = await Notes.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Not Found");
    }
    if (note.user.toString() !== req.payload._id) {
      return res.status(401).send("Not Allowed");
    }
    note = await Notes.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true });
    res.json({ note });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

// ROUTE 4: Delete an existing Note using: DELETE "/api/note/deletenote". Login required
router.route("/deletenote/:id").delete(authenticate, async (req, res) => {
  try {
    // Find the note to be delete and delete it
    let note = await Notes.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Not Found");
    }

    // Allow deletion only if user owns this Note
    if (note.user.toString() !== req.payload._id) {
      return res.status(401).send("Not Allowed");
    }

    note = await Notes.findByIdAndDelete(req.params.id);
    res.json({ Success: "Note has been deleted", note: note });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});
module.exports = router;
