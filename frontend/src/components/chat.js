import React, { useEffect, useState } from "react";
import io from "socket.io-client";
// import { UsernameContext } from "../UsernameContext";
import { useHistory } from "react-router-dom";
import { GoogleLogout } from "react-google-login";
import { Redirect } from "react-router-dom";
import Player from "./player.js";

const username = localStorage.getItem("username");

const socket = io("http://localhost:3001", { query: { username } });

const spotifyUrl =
  "https://accounts.spotify.com/authorize?client_id=62955f88544b49f787f8ce2859fe82d7&response_type=code&redirect_uri=http://localhost:3000/chat&scope=streaming%20user-read-email%20user-read-private%20user-library-read%20user-library-modify%20user-read-playback-state%20user-modify-playback-state";

function Chat() {
  let history = useHistory();
  const [accessToken, setAccessToken] = useState();
  const [refreshToken, setRefreshToken] = useState();
  const [expiresIn, setExpiresIn] = useState();
  const [contacts, setContacts] = useState([]);
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");
    if (!code) {
      getCode();
    } else {
      getAccessToken(code);
    }
    history.push("/chat");
    fetchingContactsAndConversations();
    socket.on("message", function (msg) {
      console.log(msg);
    });
  }, []);

  useEffect(() => {
    if (!expiresIn || !refreshToken) return;
    const refreshTokenInterval = setInterval(
      getNewAccessToken,
      expiresIn * 1000
    );
    return () => clearInterval(refreshTokenInterval);
  }, [refreshToken, expiresIn]);

  function getCode() {
    window.location.href = spotifyUrl;
  }

  function getAccessToken(code) {
    fetch("http://localhost:3001/spotify/getToken", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setAccessToken(data.access_token);
        setRefreshToken(data.refresh_token);
        setExpiresIn(data.expires_in);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function fetchingContactsAndConversations() {
    if (username != "Guest") {
      fetch("http://localhost:3001/backend/findOrCreateUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          setContacts(data.contacts);
          setConversations(data.conversations);
        })
        .catch((err) => console.log(err));
    }
  }

  function trackSearch() {
    fetch("https://api.spotify.com/v1/search?q=memories&type=track", {
      method: "GET",
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    })
      .then((res) => res.json())
      .then((data) => console.log(data))
      .catch((err) => console.log(err));
  }

  function logout(res) {
    localStorage.clear("username");
    history.push("/");
  }

  function click() {
    socket.emit("message", "this is from one");
  }

  function getNewAccessToken() {
    fetch("http://localhost:3001/spotify/getRefreshedToken", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refresh_token: refreshToken,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setAccessToken(data.access_token);
        setExpiresIn(data.expires_in);
      })
      .catch((err) => {
        console.log(err);
      });
  }
  if (!username) {
    return <Redirect to="/" />;
  } else {
    return (
      <div>
        <div className="anoter" onClick={click}>
          send
        </div>
        <GoogleLogout
          clientId="375271093414-45duj5fv8q2bbj5emkbvp04ju4cq09th.apps.googleusercontent.com"
          buttonText="Logout"
          onLogoutSuccess={logout}
        />
        {contacts.map((contact, index) => {
          return <h1 key={index}>{contact}</h1>;
        })}
        <button onClick={trackSearch}>search</button>
        <Player access_token={accessToken} />
      </div>
    );
  }
}

export default Chat;
