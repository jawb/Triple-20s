import React, { useCallback } from "react";

const App: React.FC = () => {
  const snooze = useCallback(() => {
    if (window.ipc) window.ipc.send("snooze");
  }, []);

  const skip = useCallback(() => {
    if (window.ipc) window.ipc.send("skip");
  }, []);

  return (
    <div className="container">
      <p>
        Take a break and focus your eyes on something 20 feet(6 meters) away for
        20 seconds
      </p>

      <div className="emoji-btns-container">
        <div className="emoji-btn-container" onClick={snooze}>
          <div className="emoji-btn">
            <span role="img" aria-label="Snooze">
              😴
            </span>
          </div>
          <div className="emoji-btn-title">Snooze for 5 minutes</div>
        </div>
        <div className="emoji-btn-container" onClick={skip}>
          <div className="emoji-btn">
            <span role="img" aria-label="Skip">
              😬
            </span>
          </div>
          <div className="emoji-btn-title">Skip break</div>
        </div>
      </div>
    </div>
  );
};

export default App;
