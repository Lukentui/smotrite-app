import { trackEvent } from "@aptabase/electron/main";
import { contextBridge, ipcRenderer } from "electron";
import { ipcMain } from "electron/main";

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld("ipcRenderer", withPrototype(ipcRenderer));

// `exposeInMainWorld` can't detect attributes and methods of `prototype`, manually patching it.
function withPrototype(obj: Record<string, any>) {
    const protos = Object.getPrototypeOf(obj);

    for (const [key, value] of Object.entries(protos)) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) continue;

        if (typeof value === "function") {
            // Some native APIs, like `NodeJS.EventEmitter['on']`, don't work in the Renderer process. Wrapping them into a function.
            obj[key] = function (...args: any) {
                return value.call(obj, ...args);
            };
        } else {
            obj[key] = value;
        }
    }
    return obj;
}

// --------- Preload scripts loading ---------
function domReady(
    condition: DocumentReadyState[] = ["complete", "interactive"],
) {
    return new Promise((resolve) => {
        if (condition.includes(document.readyState)) {
            resolve(true);
        } else {
            document.addEventListener("readystatechange", () => {
                if (condition.includes(document.readyState)) {
                    resolve(true);
                }
            });
        }
    });
}

const safeDOM = {
    append(parent: HTMLElement, child: HTMLElement) {
        if (!Array.from(parent.children).find((e) => e === child)) {
            parent.appendChild(child);
        }
    },
    remove(parent: HTMLElement, child: HTMLElement) {
        if (Array.from(parent.children).find((e) => e === child)) {
            parent.removeChild(child);
        }
    },
};

/**
 * https://tobiasahlin.com/spinkit
 * https://connoratherton.com/loaders
 * https://projects.lukehaas.me/css-loaders
 * https://matejkustec.github.io/SpinThatShit
 */
function useLoading() {
    const className = `loaders-css__square-spin`;
    const styleContent = `
  .overlay {
    background: rgba(0, 0, 0, 0.8);
    height: 100vh; }
  
  .spinner {
    font-size: 48px;
    position: relative;
    display: inline-block;
    width: 1em;
    height: 1em; }
    .spinner.center {
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      margin: auto; }
    .spinner .spinner-blade {
      position: absolute;
      left: .4629em;
      bottom: 0;
      width: .074em;
      height: .2777em;
      border-radius: .0555em;
      background-color: transparent;
      transform-origin: center -.2222em;
      animation: spinner-fade 1s infinite linear; }
      .spinner .spinner-blade:nth-child(1) {
        animation-delay: 0s;
        transform: rotate(0deg); }
      .spinner .spinner-blade:nth-child(2) {
        animation-delay: 0.083s;
        transform: rotate(30deg); }
      .spinner .spinner-blade:nth-child(3) {
        animation-delay: 0.166s;
        transform: rotate(60deg); }
      .spinner .spinner-blade:nth-child(4) {
        animation-delay: 0.249s;
        transform: rotate(90deg); }
      .spinner .spinner-blade:nth-child(5) {
        animation-delay: 0.332s;
        transform: rotate(120deg); }
      .spinner .spinner-blade:nth-child(6) {
        animation-delay: 0.415s;
        transform: rotate(150deg); }
      .spinner .spinner-blade:nth-child(7) {
        animation-delay: 0.498s;
        transform: rotate(180deg); }
      .spinner .spinner-blade:nth-child(8) {
        animation-delay: 0.581s;
        transform: rotate(210deg); }
      .spinner .spinner-blade:nth-child(9) {
        animation-delay: 0.664s;
        transform: rotate(240deg); }
      .spinner .spinner-blade:nth-child(10) {
        animation-delay: 0.747s;
        transform: rotate(270deg); }
      .spinner .spinner-blade:nth-child(11) {
        animation-delay: 0.83s;
        transform: rotate(300deg); }
      .spinner .spinner-blade:nth-child(12) {
        animation-delay: 0.913s;
        transform: rotate(330deg); }
  
  @keyframes spinner-fade {
    0% {
      background-color: #69717d; }
    100% {
      background-color: transparent; } }
  
.app-loading-wrap {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eef1f4;
  z-index: 99999999999;
  -webkit-user-select: none;
  -webkit-app-region: drag;
}
    `;
    const oStyle = document.createElement("style");
    const oDiv = document.createElement("div");

    oStyle.id = "app-loading-style";
    oStyle.innerHTML = styleContent;
    oDiv.className = "app-loading-wrap";
    oDiv.innerHTML = `<div class="app-loading-wrap">
  <div>
    <div class="spinner center">
      <div class="spinner-blade"></div>
      <div class="spinner-blade"></div>
      <div class="spinner-blade"></div>
      <div class="spinner-blade"></div>
      <div class="spinner-blade"></div>
      <div class="spinner-blade"></div>
      <div class="spinner-blade"></div>
      <div class="spinner-blade"></div>
      <div class="spinner-blade"></div>
      <div class="spinner-blade"></div>
      <div class="spinner-blade"></div>
      <div class="spinner-blade"></div>
    </div>
    <div style="margin-top: 100px" id="loading-msg-0">Initializing...</div>
  </div>
  
</div>`;

    return {
        setMessageLoading(msg) {
            console.warn(msg);
            document.getElementById("loading-msg-0").textContent = msg;
        },
        appendLoading() {
            safeDOM.append(document.head, oStyle);
            safeDOM.append(document.body, oDiv);
        },
        removeLoading() {
            safeDOM.remove(document.head, oStyle);
            safeDOM.remove(document.body, oDiv);
        },
    };
}

// ----------------------------------------------------------------------

const { appendLoading, removeLoading, setMessageLoading } = useLoading();
domReady().then(appendLoading);

contextBridge.exposeInMainWorld("api", {
    on: (event: string, func: any) => {
        ipcRenderer.on(event, (_, v) => func(v));
    },
    send: (event: string, ...args: any[]) => {
        ipcRenderer.send(event, ...args);
    },
});

ipcRenderer.on("removeLoading", () => {
    trackEvent("app.loaded");
    removeLoading();
});
ipcRenderer.on("setLoadingMessage", (_, v) => {
    setMessageLoading(v);
    trackEvent("app.loading-message", {
        text: v,
    });
});

// window.onmessage = ev => {
// console.info(ev.data)
// ev.data.payload === 'removeLoading' && removeLoading()
// }

// setTimeout(removeLoading, 4999)
