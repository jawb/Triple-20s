import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";

declare global {
  interface Window {
    ipc: {
      send: (msg: string) => {};
    };
  }
}

ReactDOM.render(<App />, document.getElementById("root"));
