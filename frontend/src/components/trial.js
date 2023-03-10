import React, { useState, useEffect, createRef, useMemo, useRef } from "react";
import "./trial.css";
import boy from "../images/boy.png";
import send from "../images/send.png";
import play from "../images/play-button.png";
import { Redirect } from "react-router-dom";
import { useHistory } from "react-router-dom";
import io from "socket.io-client";
import { GoogleLogout } from "react-google-login";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";
import PopoverFun from "./popover.js";
import Player from "./player.js";

const username = localStorage.getItem("username");
const userImageUrl = localStorage.getItem("imageUrl");
const socket = io("http://localhost:3001", { query: { username } });

const spotifyUrl =
  "https://accounts.spotify.com/authorize?client_id=62955f88544b49f787f8ce2859fe82d7&response_type=code&redirect_uri=http://localhost:3000/chat&scope=streaming%20user-read-email%20user-read-private%20user-library-read%20user-library-modify%20user-read-playback-state%20user-modify-playback-state";

function Trial() {
  const [leftPortionOpen, setLeftPortionOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("contact");
  const [contactModal, setContactModal] = useState(false);
  const [groupModal, setGroupModal] = useState(false);
  const [contactSavingName, setContactSavingName] = useState("");
  const [contactSavingId, setContactSavingId] = useState("");
  const [contactSavingError, setContactSavingError] = useState("");
  const [contacts, setContacts] = useState([]);
  const [groups, setGroups] = useState([]);
  let history = useHistory();
  const [accessToken, setAccessToken] = useState();
  const [refreshToken, setRefreshToken] = useState();
  const [expiresIn, setExpiresIn] = useState();
  const [selectedPeople, setSelectedPeople] = useState();
  const [selectedConversationId, setSelectedConversationId] = useState();
  const [message, setMessage] = useState("");
  const [displayMessages, setDisplayMessages] = useState([]);
  const [groupSavingName, setGroupSavingName] = useState("");
  const [groupSavingPeople, setGroupSavingPeople] = useState([username]);
  const groupSavingPeopleRef = createRef();
  const lastMessageRef = useRef();
  const [selectedContactOrGroupName, setSelectedContactOrGroupName] =
    useState("");
  const [selectedContactImg, setSelectedContactImg] = useState("");
  const [searchingSong, setSearchingSong] = useState(false);
  const [trackSearchQuery, setTrackSearchQuery] = useState("");
  const [trackSearchData, setTrackSearchData] = useState([]);
  const [playingSongContactOrGroupName, setPlayingSongContactOrGroupName] =
    useState(
      localStorage.getItem("playingSongContactOrGroupName")
        ? localStorage.getItem("playingSongContactOrGroupName")
        : ""
    );
  const [playingSongUri, setPlayingSongUri] = useState(
    localStorage.getItem("playingSongUri")
      ? localStorage.getItem("playingSongUri")
      : null
  );
  const [playingSongPeople, setPlayingSongPeople] = useState(
    localStorage.getItem("playingSongPeople")
      ? localStorage.getItem("playingSongPeople").split(",")
      : null
  );

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");
    if (!code) {
      getCode();
    } else {
      getAccessToken(code);
    }
    history.push("/chat");
    fetchingContactsAndGroups();
    socket.on("group-created", (msg) => receivingGroupCreatedMessage(msg));
    return () => socket.off("group-created");
  }, []);

  useEffect(() => {
    socket.on("contact-message", (msg) => receivingContactMessage(msg));

    return () => socket.off("contact-message");
  }, [contacts, selectedPeople]);

  useEffect(() => {
    socket.on("song-changed-outgoing", (msg) => receivingSongChanged(msg));

    return () => socket.off("song-changed-outgoing");
  }, [playingSongPeople, playingSongContactOrGroupName]);

  useEffect(() => {
    socket.on("group-message", (msg) => receivingGroupMessage(msg));

    return () => socket.off("group-message");
  }, [selectedConversationId]);

  useEffect(() => {
    socket.on("song-played", (msg) => receivingSongPlayed(msg));

    return () => socket.off("song-played");
  }, [playingSongUri, contacts]);

  useEffect(() => {
    if (!expiresIn || !refreshToken) return;
    const refreshTokenInterval = setInterval(
      getNewAccessToken,
      expiresIn * 1000
    );
    return () => clearInterval(refreshTokenInterval);
  }, [refreshToken, expiresIn]);

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ smooth: true });
    }
  }, [displayMessages]);

  useEffect(() => {
    if (trackSearchQuery === "") {
      setTrackSearchData([]);
      return;
    }
    if (accessToken) {
      const searchTimeout = setTimeout(trackSearch, 1000);
      return () => clearTimeout(searchTimeout);
    }
  }, [trackSearchQuery]);

  useMemo(() => {
    for (var i = 0; i < displayMessages.length; i++) {
      for (var j = 0; j < contacts.length; j++) {
        if (contacts[j].email_id == displayMessages[i].from) {
          displayMessages[i].from = contacts[j].name;
        }
      }
    }
  }, [displayMessages]);

  function receivingSongChanged(msg) {
    var people1 = msg.people.sort();
    var people2 = playingSongPeople.sort();
    if (JSON.stringify(people1) === JSON.stringify(people2)) {
      window.alert(
        "You have lost your partner " + playingSongContactOrGroupName
      );
    }
  }

  function trackSearch() {
    fetch(
      `https://api.spotify.com/v1/search?q=${trackSearchQuery}&type=track`,
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + accessToken,
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        setTrackSearchData(data.tracks.items);
        console.log(data.tracks.items);
      })
      .catch((err) => console.log(err));
  }

  function receivingSongPlayed(msg) {
    var selection = true;
    if (msg.groupName) {
      if (playingSongUri) {
        selection = window.confirm(
          "Song request from " +
            msg.groupName +
            ", do you want to change the song?"
        );
      }
      setPlayingSongContactOrGroupName(msg.groupName);
      console.log(msg.groupName);
      localStorage.setItem("playingSongUri", msg.uri);
      localStorage.setItem("playingSongPeople", msg.playedWith);
      setPlayingSongUri(msg.uri);
      setPlayingSongPeople(msg.playedWith);
    } else {
      var email_id;
      for (var i = 0; i < msg.playedWith.length; i++) {
        if (msg.playedWith[i] !== username) {
          email_id = msg.playedWith[i];
        }
      }
      var name = email_id;
      for (var i = 0; i < contacts.length; i++) {
        if (contacts[i].email_id === email_id) {
          name = contacts[i].name;
        }
      }

      if (playingSongUri) {
        selection = window.confirm(
          "song request from " + name + ", do you want to change the song?"
        );
      }
      if (selection) {
        localStorage.setItem("playingSongUri", msg.uri);
        localStorage.setItem("playingSongPeople", msg.playedWith);
        setPlayingSongUri(msg.uri);
        setPlayingSongPeople(msg.playedWith);
        setPlayingSongContactOrGroupName(name);
        localStorage.setItem("playingSongContactOrGroupName", name);
      }
    }
  }

  function trackItemClicked(uri) {
    if (
      playingSongContactOrGroupName !== selectedContactOrGroupName &&
      playingSongPeople
    ) {
      tellingOthersYouChanged();
    }
    setPlayingSongUri(uri);
    setPlayingSongContactOrGroupName(selectedContactOrGroupName);
    localStorage.setItem(
      "playingSongContactOrGroupName",
      selectedContactOrGroupName
    );
    if (selectedContactImg) {
      setPlayingSongPeople([selectedPeople, username]);
      localStorage.setItem("playingSongUri", uri);
      localStorage.setItem("playingSongPeople", [selectedPeople, username]);
    } else {
      setPlayingSongPeople(selectedPeople);
      localStorage.setItem("playingSongInfo", [uri, selectedPeople]);
    }
    socket.emit("song-played", {
      uri: uri,
      playedWith: username,
      contactOrGroup: selectedContactImg ? "contact" : "group",
      selectedPeople: selectedPeople,
      selectedContactOrGroupName: selectedContactOrGroupName,
    });
  }

  function tellingOthersYouChanged() {
    socket.emit("song-changed-outgoing", {
      people: playingSongPeople,
    });
  }

  function receivingContactMessage(msg) {
    var done = false;
    for (var i = 0; i < contacts.length; i++) {
      if (contacts[i].email_id === msg.from) {
        if (msg.from == selectedPeople) {
          setDisplayMessages((prevMessages) => {
            return [
              ...prevMessages,
              {
                from: msg.from,
                message: msg.message,
                time: msg.time,
                img: msg.img,
              },
            ];
          });
        }
        done = true;
        break;
      }
    }
    if (!done) {
      setContacts((prevContacts) => {
        return [
          ...prevContacts,
          { name: msg.from, email_id: msg.from, img: msg.img },
        ];
      });
      fetch("http://localhost:3001/backend/addContact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: msg.from,
          email_id: msg.from,
          username: username,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }

  function receivingGroupMessage(msg) {
    if (msg.conversationId === selectedConversationId) {
      setDisplayMessages((prevMessages) => {
        return [
          ...prevMessages,
          {
            from: msg.from,
            message: msg.message,
            time: msg.time,
            img: msg.img,
          },
        ];
      });
    }
  }

  function receivingGroupCreatedMessage(msg) {
    setGroups((prevGroups) => {
      return [
        ...prevGroups,
        {
          name: msg.name,
          people: msg.people,
          conversation_id: msg.conversationId,
        },
      ];
    });
  }

  function loadingDisplayMessages(selectedPeople) {
    var people = [username, selectedPeople];
    people.sort();
    fetch("http://localhost:3001/backend/getDisplayMessages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        people: people,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setDisplayMessages(data);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function loadingGroupDisplayMessages(conversationId) {
    fetch("http://localhost:3001/backend/getGroupDisplayMessages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        conversationId: conversationId,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setDisplayMessages(data);
      })
      .catch((err) => {
        console.log(err);
      });
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
        setAccessToken(data.access_token);
        setRefreshToken(data.refresh_token);
        setExpiresIn(data.expires_in);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function fetchingContactsAndGroups() {
    if (username != "Guest") {
      fetch("http://localhost:3001/backend/findOrCreateUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          img: userImageUrl,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          setContacts(data.contacts);
          setGroups(data.groups);
        })
        .catch((err) => console.log(err));
    }
  }
  function logout(res) {
    localStorage.clear("username");
    history.push("/");
  }

  function getCode() {
    window.location.href = spotifyUrl;
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

  function sendMessage() {
    var time = moment().format("MMMM Do YYYY, h:mm:ss a");
    setDisplayMessages((prevMessages) => {
      return [
        ...prevMessages,
        { from: username, message: message, time: time, img: userImageUrl },
      ];
    });
    if (selectedOption == "contact") {
      addContactMessageToBackend();
      socket.emit("contact-message", {
        from: username,
        message: message,
        to: selectedPeople,
        time: time,
        img: userImageUrl,
      });
    } else {
      addGroupMessageToBackend();
      socket.emit("group-message", {
        conversationId: selectedConversationId,
        from: username,
        message: message,
        people: selectedPeople,
        time: time,
        img: userImageUrl,
      });
    }
    setMessage("");
  }

  function addGroupMessageToBackend() {
    var time = moment().format("MMMM Do YYYY, h:mm:ss a");
    fetch("http://localhost:3001/backend/addGroupMessage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        conversationId: selectedConversationId,
        message: {
          from: username,
          message: message,
          time: time,
          img: userImageUrl,
        },
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function addContactMessageToBackend() {
    var time = moment().format("MMMM Do YYYY, h:mm:ss a");
    var people = [username, selectedPeople];
    people.sort();

    fetch("http://localhost:3001/backend/addContactMessage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        people: people,
        message: {
          from: username,
          message: message,
          time: time,
          img: userImageUrl,
        },
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function chatBurgerClicked() {
    setLeftPortionOpen(!leftPortionOpen);
  }
  function clickedContacts() {
    setSelectedOption("contact");
  }
  function clickedGroups() {
    setSelectedOption("group");
  }

  function addOptionButtonClicked() {
    if (selectedOption == "contact") {
      setContactModal(true);
    } else {
      setGroupModal(true);
    }
  }
  function contactModalClose() {
    setContactModal(false);
  }
  function groupModalClose() {
    setGroupModal(false);
  }

  function addPersonToGroup(e, email_id) {
    if (e.target.checked) {
      setGroupSavingPeople((prevPeople) => {
        return [...prevPeople, email_id];
      });
    } else {
      var index = groupSavingPeople.indexOf(email_id);
      setGroupSavingPeople(groupSavingPeople.splice(1, index + 1));
    }
  }

  function addContactToBackend() {
    return fetch("http://localhost:3001/backend/addContact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: contactSavingName,
        email_id: contactSavingId,
        username: username,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        return data;
      })
      .catch((err) => {
        console.log(err);
        return "an error occured";
      });
  }

  function addGroupClicked() {
    var conversationId = uuidv4();
    setGroups((prevGroups) => {
      return [
        ...prevGroups,
        {
          name: groupSavingName,
          people: groupSavingPeople,
          conversation_id: conversationId,
        },
      ];
    });
    socket.emit("group-created", {
      name: groupSavingName,
      people: groupSavingPeople,
      username: username,
      conversationId: conversationId,
    });
    addGroupToBackend(conversationId);
    setGroupSavingName("");
    setGroupModal(false);
    var allChildren = groupSavingPeopleRef.current.children;
    for (var i = 0; i < allChildren.length; i++) {
      allChildren[i].children[0].checked = false;
    }
  }
  function addGroupToBackend(conversationId) {
    return fetch("http://localhost:3001/backend/addGroup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: groupSavingName,
        people: groupSavingPeople,
        username: username,
        conversationId: conversationId,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        return data;
      })
      .catch((err) => {
        return "an error occured";
      });
  }

  async function addContactClicked() {
    for (var i = 0; i < contacts.length; i++) {
      if (
        contacts[i].name === contactSavingName ||
        contacts[i].email_id === contactSavingId
      ) {
        setContactSavingError("Name or Email_id already exists");
        return;
      }
    }

    var result = await addContactToBackend();
    if (result.status === "success") {
      setContacts((prevContacts) => {
        return [
          ...prevContacts,
          {
            name: contactSavingName,
            email_id: contactSavingId,
            img: result.img,
          },
        ];
      });
      setContactSavingName("");
      setContactSavingId("");
      setContactModal(false);
      setContactSavingError("");
    } else {
      setContactSavingError(result.status);
    }
  }
  if (!username) {
    return <Redirect to="/" />;
  } else {
    return (
      <div className="wholeChat">
        <div
          className="chat-Modal-outer"
          style={{ display: contactModal ? "block" : "none" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Contact</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={contactModalClose}
                ></button>
              </div>
              <div className="modal-body">
                <div className="form-floating mb-3">
                  <input
                    type="text"
                    className="form-control"
                    id="floatingInput"
                    placeholder="your name"
                    value={contactSavingName}
                    onChange={(e) => setContactSavingName(e.target.value)}
                  />
                  <label htmlFor="floatingInput">Name</label>
                </div>
                <div className="form-floating">
                  <input
                    type="email"
                    className="form-control"
                    id="floatingInput"
                    placeholder="name@example.com"
                    value={contactSavingId}
                    onChange={(e) => setContactSavingId(e.target.value)}
                  />
                  <label htmlFor="floatingPassword">Contact's Email-id</label>
                </div>
              </div>
              <div className="modal-footer">
                <p className="text-danger me-5">{contactSavingError}</p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={addContactClicked}
                >
                  Add Contact
                </button>
              </div>
            </div>
          </div>
        </div>
        <div
          className="chat-Modal-outer"
          style={{ display: groupModal ? "block" : "none" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Group</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={groupModalClose}
                ></button>
              </div>
              <div className="modal-body">
                <div className="form-floating mb-3">
                  <input
                    type="email"
                    className="form-control"
                    id="floatingInput"
                    placeholder="name@example.com"
                    value={groupSavingName}
                    onChange={(e) => setGroupSavingName(e.target.value)}
                  />
                  <label htmlFor="floatingInput">Name</label>
                </div>
                <div class="card">
                  <div class="card-header">People</div>
                  <div
                    class="card-body peopleInsideAddGroup"
                    ref={groupSavingPeopleRef}
                  >
                    {contacts.map((contact) => {
                      return (
                        <div class="form-check">
                          <input
                            class="form-check-input"
                            type="checkbox"
                            value=""
                            id="flexCheckDefault"
                            onClick={(e) =>
                              addPersonToGroup(e, contact.email_id)
                            }
                          />
                          <label
                            class="form-check-label"
                            for="flexCheckDefault"
                          >
                            {contact.name}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={addGroupClicked}
                >
                  Add Group
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="top">
          <div className="chat-burger" onClick={chatBurgerClicked}>
            <i className="fas fa-bars fs-4"></i>
          </div>
          <GoogleLogout
            clientId="375271093414-45duj5fv8q2bbj5emkbvp04ju4cq09th.apps.googleusercontent.com"
            buttonText="Logout"
            onLogoutSuccess={logout}
          />
          <div className="dropdown">
            <button
              className="btn dropdown-toggle d-flex justify-content-center align-items-center"
              type="button"
              id="dropdownMenuButton1"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <div className="person-img ms-3 me-3">
                <img src={userImageUrl} alt="" className="w-100" />
              </div>
              <p className="mb-0 me-3">Lester Correya</p>
            </button>
            <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
              <li>
                <a className="dropdown-item" href="#">
                  Action
                </a>
              </li>
              <li>
                <a className="dropdown-item" href="#">
                  Another action
                </a>
              </li>
              <li>
                <a className="dropdown-item" href="#">
                  Something else here
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="bottom">
          <div
            className="left"
            style={{
              transform: leftPortionOpen ? "translateX(0)" : null,
              transition: leftPortionOpen ? "transform 0.5s ease-in" : null,
            }}
          >
            <div className="leftOptions">
              <div
                className={
                  selectedOption === "contact"
                    ? "leftContacts active"
                    : "leftContacts"
                }
                onClick={clickedContacts}
              >
                Contacts
              </div>
              <div
                className={
                  selectedOption === "group"
                    ? "leftContacts active"
                    : "leftContacts"
                }
                onClick={clickedGroups}
              >
                Groups
              </div>
            </div>
            <div className="leftList">
              {selectedOption === "contact" &&
                contacts.map((contact, index) => {
                  return (
                    <div
                      className={
                        selectedPeople === contact.email_id
                          ? "eachItem active"
                          : "eachItem"
                      }
                      key={index}
                      onClick={() => {
                        setSelectedPeople(contact.email_id);
                        loadingDisplayMessages(contact.email_id);
                        setSelectedContactOrGroupName(contact.name);
                        setSelectedContactImg(contact.img);
                        setSearchingSong(false);
                      }}
                    >
                      <div className="person-img ms-3 me-3">
                        <img src={contact.img} alt="" className="w-100" />
                      </div>
                      <h5 className="optionName">{contact.name}</h5>
                    </div>
                  );
                })}
              {selectedOption === "group" &&
                groups.map((group, index) => {
                  return (
                    <div
                      className={
                        selectedPeople === group.people
                          ? "eachItem active"
                          : "eachItem"
                      }
                      key={index}
                      onClick={() => {
                        setSelectedPeople(group.people);
                        setSelectedConversationId(group.conversation_id);
                        loadingGroupDisplayMessages(group.conversation_id);
                        setSelectedContactOrGroupName(group.name);
                        setSelectedContactImg();
                        setSearchingSong(false);
                      }}
                    >
                      <h5 className="optionName">{group.name}</h5>
                    </div>
                  );
                })}
            </div>
            <div className="chat-select-option">
              <div
                className="chat-select-option-button"
                onClick={addOptionButtonClicked}
              >
                Add {selectedOption}
              </div>
            </div>
          </div>
          <div
            className="chat-alternate-react"
            style={{ display: selectedPeople ? "none" : "block" }}
          ></div>
          <div
            className="right"
            style={{ display: selectedPeople ? "block" : "none" }}
          >
            <div className="rightTitle">
              {selectedContactImg && (
                <div className="person-img me-3">
                  <img src={selectedContactImg} alt="" className="w-100" />
                </div>
              )}
              <h3 className="me-5">{selectedContactOrGroupName}</h3>
              {selectedContactImg && (
                <PopoverFun
                  selectedPeople={selectedPeople}
                  setContacts={setContacts}
                  contacts={contacts}
                  username={username}
                  setSelectedContactOrGroupName={setSelectedContactOrGroupName}
                />
              )}
              {playingSongUri && (
                <Player
                  access_token={accessToken}
                  uri={playingSongUri}
                  people={playingSongPeople}
                  playingSongContactOrGroupName={playingSongContactOrGroupName}
                  setPlayingSongUri={setPlayingSongUri}
                  setPlayingSongPeople={setPlayingSongPeople}
                  setPlayingSongContactOrGroupName={
                    setPlayingSongContactOrGroupName
                  }
                />
              )}
            </div>
            {searchingSong && (
              <div className="chatSection">
                <ul class="list-group list-group-flush position-absolute w-100 bottom-0 trackItem-ul">
                  {trackSearchData.map((track) => {
                    return (
                      <li
                        class="list-group-item trackItem"
                        onClick={() => trackItemClicked(track.uri)}
                      >
                        <div className="trackItem-img">
                          <img
                            src={track.album.images[2].url}
                            className="w-100"
                          />
                        </div>
                        <div className="trackItem-text ms-3">
                          <h5>{track.name}</h5>
                          {track.artists.map((artist) => {
                            return <span>{artist.name} </span>;
                          })}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            {!searchingSong && (
              <div className="chatSection">
                {displayMessages.map((singleMessage, index) => {
                  if (singleMessage.from === username) {
                    return (
                      <div
                        className="chatBox right-message"
                        ref={
                          index === displayMessages.length - 1
                            ? lastMessageRef
                            : null
                        }
                      >
                        <div className="chatBox-right">
                          <div className="inner-chatBox">
                            {singleMessage.message}
                          </div>
                          <div className="below-name">
                            {singleMessage.from === username
                              ? "You"
                              : singleMessage.from}{" "}
                            , {singleMessage.time}
                          </div>
                        </div>
                        <div className="person-img ms-2 me-2">
                          <img
                            src={singleMessage.img}
                            alt=""
                            className="w-100"
                          />
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div
                      className="chatBox"
                      ref={
                        index === displayMessages.length - 1
                          ? lastMessageRef
                          : null
                      }
                    >
                      <div className="person-img ms-2 me-2">
                        <img src={singleMessage.img} alt="" className="w-100" />
                      </div>
                      <div className="chatBox-right">
                        <div className="inner-chatBox">
                          {singleMessage.message}
                        </div>
                        <div className="below-name">
                          {singleMessage.from === username
                            ? "You"
                            : singleMessage.from}{" "}
                          , {singleMessage.time}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {!searchingSong && (
              <div className="rightType">
                <textarea
                  className="typeInput"
                  placeholder="Write a message..."
                  rows="1"
                  cols="50"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                ></textarea>
                <div className="sendDiv" onClick={sendMessage}>
                  <img src={send} alt="" />
                </div>
                <div className="playDiv" onClick={() => setSearchingSong(true)}>
                  <img src={play} alt="" />
                </div>
              </div>
            )}
            {searchingSong && (
              <div className="rightType">
                <textarea
                  className="typeInput"
                  placeholder="Search for a Song"
                  rows="1"
                  cols="50"
                  onChange={(e) => setTrackSearchQuery(e.target.value)}
                ></textarea>
                <button
                  type="button"
                  class="btn-close"
                  onClick={() => setSearchingSong(false)}
                ></button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default Trial;
