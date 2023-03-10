import React, { useState, createContext } from "react";

export const UsernameContext = createContext();

export const UsernameProvider = (props) => {
  const [username, setUsername] = useState("Guest");
  const [code, setCode] = useState();
  const [accessToken, setAccessToken] = useState();
  const [refreshToken, setRefreshToken] = useState();
  const [expiresIn, setExpiresIn] = useState();

  return (
    <UsernameContext.Provider
      value={{
        value1: [username, setUsername],
        value2: [code, setCode],
        value3: [accessToken, setAccessToken],
        value4: [refreshToken, setRefreshToken],
        value5: [expiresIn, setExpiresIn],
      }}
    >
      {props.children}
    </UsernameContext.Provider>
  );
};
