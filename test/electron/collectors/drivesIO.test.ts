import {
  describe,
  it,
  expect,
} from "vitest";
import drivesIO from "../../../electron/collectors/drivesIO";
import { app } from "electron";

describe("collector drivesIO", () => {
  it.concurrent.each(["rx", "tx", "wx", "rx_sec", "wx_sec", "tx_sec", "ms"])(
    "have property %s",
    async (property) => {
      expect(await drivesIO.collect(app)).toHaveProperty(property);
    },
  );
});
