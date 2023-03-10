import React, { useState, useEffect } from "react";
import SpotifyPlayer from "react-spotify-web-playback";

function Player({
  access_token,
  uri,
  people,
  playingSongContactOrGroupName,
  setPlayingSongUri,
  setPlayingSongPeople,
  setPlayingSongContactOrGroupName,
}) {
  const [ms, setMs] = useState();
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (ms) {
      const time = setTimeout(clearingEverything, ms - 1000);
      if (!isPlaying) {
        clearTimeout(time);
      }
      return () => clearTimeout(time);
    }
  }, [ms, isPlaying]);

  function clearingEverything() {
    setPlayingSongUri();
    setPlayingSongPeople();
    setPlayingSongContactOrGroupName();
    localStorage.removeItem("playingSongUri");
    localStorage.removeItem("playingSongPeople");
    localStorage.removeItem("playingSongContactOrGroupName");
  }

  if (!access_token) return null;
  return (
    <div className="spotify-player">
      <SpotifyPlayer
        token={access_token}
        uris={[uri]}
        showSaveIcon
        autoPlay={true}
        callback={(state) => {
          setMs(state.track.durationMs - state.progressMs);
          setIsPlaying(state.isPlaying);
        }}
      />
      <div className="spotify-player-footer">
        <p>
          Played with <span>{playingSongContactOrGroupName}</span>
        </p>
        <button className="ms-3" onClick={clearingEverything}>
          Stop Playing
        </button>
      </div>
    </div>
  );
}

export default Player;
