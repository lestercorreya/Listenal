const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const ContactMessages = require("../models/contactMessages.js");
const GroupMessages = require("../models/groupMessages.js");

router.post("/findOrCreateUser", (req, res) => {
  User.findOrCreate(
    { username: req.body.username },
    { img: req.body.img },
    (err, result) => {
      res.send(result);
    }
  );
});

router.post("/addContact", (req, res) => {
  console.log(req.body.email_id);
  User.findOne({ username: req.body.email_id }, (err, result) => {
    if (!result) {
      res.send({ status: "username doesnt exist" });
    } else {
      var img = result.img;
      User.findOne({ username: req.body.username }, (err, result) => {
        var newContact = {
          name: req.body.name,
          email_id: req.body.email_id,
          img: img,
        };
        result.contacts.push(newContact);
        result.save();
      });
      peopleList = [req.body.username, req.body.email_id];
      peopleList.sort();
      ContactMessages.findOrCreate({ people: peopleList }, (err, result) => {
        res.send({ status: "success", img: img });
      });
    }
  });
});

router.post("/addContactMessage", (req, res) => {
  ContactMessages.findOne({ people: req.body.people }, (err, result) => {
    result.messages.push(req.body.message);
    result.save();
    res.send({ status: "success" });
  });
});

router.post("/getDisplayMessages", (req, res) => {
  ContactMessages.findOne(req.body, (err, result) => {
    res.send(result.messages);
  });
});

router.post("/getGroupDisplayMessages", (req, res) => {
  GroupMessages.findOne(req.body, (err, result) => {
    res.send(result.messages);
  });
});

router.post("/addGroup", (req, res) => {
  User.findOne({ username: req.body.username }, (err, result) => {
    var newGroup = {
      name: req.body.name,
      people: req.body.people,
      conversation_id: req.body.conversationId,
    };
    result.groups.push(newGroup);
    result.save();
  });
  for (var i = 0; i < req.body.people.length; i++) {
    if (req.body.people[i] !== req.body.username) {
      User.findOne({ username: req.body.people[i] }, (err, result) => {
        var newGroup = {
          name: req.body.name,
          people: req.body.people,
          conversation_id: req.body.conversationId,
        };
        result.groups.push(newGroup);
        result.save();
      });
    }
  }
  GroupMessages.findOrCreate(
    { conversationId: req.body.conversationId },
    (err, result) => {
      res.send({ status: "success" });
    }
  );
});

router.post("/addGroupMessage", (req, res) => {
  GroupMessages.findOne(
    { conversationId: req.body.conversationId },
    (err, result) => {
      result.messages.push(req.body.message);
      result.save();
      res.send({ status: "success" });
    }
  );
});

router.post("/changeName", async (req, res) => {
  const doc = await User.findOne({ username: req.body.username });
  for (var i = 0; i < doc.contacts.length; i++) {
    if (doc.contacts[i].email_id === req.body.email_id) {
      doc.contacts[i].name = req.body.name;
    }
  }
  doc.markModified("contacts");
  doc.save();
});

module.exports = router;
