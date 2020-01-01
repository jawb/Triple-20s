const settings = require("electron-settings");
const { ipcMain } = require("electron");

const lockTime = 20 * 1000;
const waitTime = 20 * 60 * 1000;
let state = {};
let show = null;
let hide = null;
let update = null;
let interval = null;

const init = (_show, _hide, _update) => {
  state = {
    ...settings.getAll(),
    goAt: new Date().getTime() + waitTime,
    locked: false
  };
  show = _show;
  hide = _hide;
  update = _update;

  interval = setInterval(check, 1000);
};

const secToTimer = sec => {
  let o = new Date(0);
  let p = new Date(sec * 1000);
  return new Date(p.getTime() - o.getTime())
    .toString()
    .split(" ")[4]
    .split(":")
    .slice(1)
    .join(":");
};

const check = () => {
  const now = new Date().getTime();
  const { locked, goAt, skip } = state;

  const diff = goAt - now > 0 ? secToTimer((goAt - now) / 1000) : "";
  update(diff);

  if (skip && now < skip) return;
  if (now >= goAt + lockTime && locked) {
    hide();
    state = { ...state, goAt: now + waitTime, locked: false };
  } else if (now >= goAt && !locked) {
    show();
    state = { ...state, locked: true };
  }
};

const skipFor = duration => () => {
  let till = null,
    now = new Date().getTime();
  if (duration === "30min") till = now + 30 * 60 * 1000;
  else if (duration === "1h") till = now + 60 * 60 * 1000;
  else if (duration === "2h") till = now + 2 * 60 * 60 * 1000;
  else if (duration === "4h") till = now + 4 * 60 * 60 * 1000;
  else if (duration === "tomorrow")
    till = new Date(new Date().setHours(0, 0, 0, 0) + 24 * 60 * 60 * 1000);
  state = { ...state, skip: till };
  if (duration === "noskip")
    state = { ...state, skip: null, goAt: now + waitTime };
  settings.setAll(state);
};

const close = () => {
  clearInterval(interval);
  interval = null;
};

ipcMain.on("snooze", () => {
  const now = new Date().getTime();
  hide();
  state = { ...state, skip: null, goAt: now + 5 * 60 * 1000, locked: false };
});

ipcMain.on("skip", () => {
  const now = new Date().getTime();
  hide();
  state = { ...state, skip: null, goAt: now + waitTime, locked: false };
});

module.exports = { init, skipFor, close };
