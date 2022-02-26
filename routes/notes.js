const express = require("express");
const isLoggedIn = require("../middlewares/isLoggedIn");
const router = express.Router();
const Notes = require('../models/Notes');
const { body, validationResult } = require('express-validator');

// Show All Notes Route - Requires Authentication
router.get('/', isLoggedIn, async (req, res) => {
    try {
        const notes = await Notes.find({ user: req.user });
        res.json(notes);
    } catch (error) {
        res.json("Internal Server Error");
    }
})

// Add Note Route - Requires Authentication
router.post('/addnote',
    [
        // Checking if title length is min 5
        body('title').isLength({ min: 5 }).withMessage("Name length must be atleast 5 characters"),
        // Checking if desc length is min 5
        body('desc').isLength({ min: 5 }).withMessage("Name length must be atleast 5 characters"),

    ], isLoggedIn
    , async (req, res) => {
        // Check whether there are any errors in the input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const newNote = new Notes({
                title: req.body.title,
                desc: req.body.desc,
                tag: req.body.tag,
                user: req.user
            });
            await newNote.save();

            res.json(newNote);
        } catch (error) {
            res.json("Internal Server Error");
        }
    });

// Update Note Route - Requires Authentication
router.put('/updateNote/:id',
    [
        // Checking if title length is min 5
        body('title').isLength({ min: 5 }).withMessage("Name length must be atleast 5 characters"),
        // Checking if desc length is min 5
        body('desc').isLength({ min: 5 }).withMessage("Name length must be atleast 5 characters"),
    ], isLoggedIn
    , async (req, res) => {
        // Check whether there are any errors in the input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            let newNote = {};
            if (req.body.title) { newNote.title = req.body.title };
            if (req.body.desc) { newNote.desc = req.body.desc };
            if (req.body.tag) { newNote.tag = req.body.tag };

            // Find the note to be updated
            let note = await Notes.findById(req.params.id);
            if (!note) {
                return res.status(404).send("Not found");
            }

            if (note.user.toString() != req.user) {
                return res.status(401).send("Not Allowed");
            }

            note = await Notes.findByIdAndUpdate(req.params.id, newNote, { new: true });
            res.json(note);
        } catch (error) {
            res.json("Internal Server Error");
        }
    });


// Delete Note Route - Requires Authentication
router.delete('/deleteNote/:id', isLoggedIn, async (req, res) => {
    try {
        // Find the note to be updated
        let note = await Notes.findById(req.params.id);
        if (!note) {
            return res.status(404).send("Not found");
        }

        if (note.user.toString() != req.user) {
            return res.status(401).send("Not Allowed");
        }

        note = await Notes.findByIdAndDelete(req.params.id);
        res.json({ "Success": "Note deleted successfully", note });
    } catch (error) {
        res.json("Internal Server Error");
    }
});

module.exports = router;
