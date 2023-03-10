import React, { useState } from "react";
import { Button, OverlayTrigger, Popover } from "react-bootstrap";

export default function PopoverFun({
  contacts,
  setContacts,
  selectedPeople,
  username,
  setSelectedContactName,
}) {
  const [newName, setNewName] = useState("");

  function renameFun() {
    if (newName === "") return;
    var contactsCopy = [...contacts];
    for (var i = 0; i < contactsCopy.length; i++) {
      if (contactsCopy[i].email_id === selectedPeople) {
        contactsCopy[i].name = newName;
        break;
      }
    }
    setSelectedContactName(newName);
    changeNameOnBackend();
    setNewName("");
    setContacts(contactsCopy);
  }

  function changeNameOnBackend() {
    fetch("http://localhost:3001/backend/changeName", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        email_id: selectedPeople,
        name: newName,
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

  const popover = (
    <Popover id="popover-basic">
      <Popover.Title as="h3">Rename</Popover.Title>
      <Popover.Content>
        <input
          type="text"
          class="form-control mb-3"
          id="exampleInputEmail1"
          aria-describedby="emailHelp"
          placeholder="Type New Name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button type="button" class="btn btn-success" onClick={renameFun}>
          Rename
        </button>
      </Popover.Content>
    </Popover>
  );
  return (
    <OverlayTrigger
      trigger="click"
      placement="right"
      rootClose={true}
      overlay={popover}
    >
      <Button variant="primary" size="sm">
        Rename
      </Button>
    </OverlayTrigger>
  );
}
