type RendererEventHandler<T = unknown> = (payload: T) => void;

export interface ElectronBridgeApi {
    on: <T = unknown>(event: string, handler: RendererEventHandler<T>) => void;
    send: (event: string, ...args: unknown[]) => void;
    allUpdatesProcessed: () => void;
}

let didWarnAboutMissingBridge = false;

const missingBridgeWarning = () => {
    if (didWarnAboutMissingBridge) {
        return;
    }

    didWarnAboutMissingBridge = true;
    console.warn(
        "[electron-api] window.api is unavailable. The renderer is running without the Electron preload bridge.",
    );
};

const fallbackApi: ElectronBridgeApi = {
    on: () => missingBridgeWarning(),
    send: () => missingBridgeWarning(),
    allUpdatesProcessed: () => missingBridgeWarning(),
};

export const electronApi: ElectronBridgeApi = window.api ?? fallbackApi;

export const hasElectronApi = () => window.api !== undefined;
