const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const axios = require("axios");

const client_id = "62955f88544b49f787f8ce2859fe82d7";
const client_secret = "8c01ce8552d64d039ef8d3f045a196e7";

let string = `${client_id}:${client_secret}`;
let buff = Buffer.from(string);
let base64encoded = buff.toString("base64");

router.post("/getToken", (req, res) => {
  axios("https://accounts.spotify.com/api/token", {
    method: "post",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + base64encoded,
    },
    data: `grant_type=authorization_code&code=${req.body.code}&redirect_uri=http://localhost:3000/chat`,
  })
    .then((data) =>
      res.json({
        access_token: data.data.access_token,
        refresh_token: data.data.refresh_token,
        expires_in: data.data.expires_in,
      })
    )
    .catch((err) => console.log(err));
});

router.post("/getRefreshedToken", (req, res) => {
  axios("https://accounts.spotify.com/api/token", {
    method: "post",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + base64encoded,
    },
    data: `grant_type=refresh_token&refresh_token=${req.body.refresh_token}&redirect_uri=http://localhost:3000/chat`,
  })
    .then((data) =>
      res.json({
        access_token: data.data.access_token,
        expires_in: data.data.expires_in,
      })
    )
    .catch((err) => console.log(err));
});

module.exports = router;
