import {
  Card,
} from "@tremor/react";
import { useEffect, useMemo, useRef, useState } from "react";
import "./../App.css";
import { Tooltip } from "react-tooltip";
import { VList } from "virtua";

import { Grid } from "@tremor/react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "../assets/task-manager.sass";

const iconPlaceHolder =
  "data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP89B8AAukB8/71MdcAAAAASUVORK5CYII=";

const sortDirections = {
  desc: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="w-4 h-4"
    >
      <path
        fill-rule="evenodd"
        d="M10 5a.75.75 0 01.75.75v6.638l1.96-2.158a.75.75 0 111.08 1.04l-3.25 3.5a.75.75 0 01-1.08 0l-3.25-3.5a.75.75 0 111.08-1.04l1.96 2.158V5.75A.75.75 0 0110 5z"
        clip-rule="evenodd"
      />
    </svg>
  ),
  asc: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="w-4 h-4"
    >
      <path
        fill-rule="evenodd"
        d="M10 15a.75.75 0 01-.75-.75V7.612L7.29 9.77a.75.75 0 01-1.08-1.04l3.25-3.5a.75.75 0 011.08 0l3.25 3.5a.75.75 0 11-1.08 1.04l-1.96-2.158v6.638A.75.75 0 0110 15z"
        clip-rule="evenodd"
      />
    </svg>
  ),
  unknown: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-4 h-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5"
      />
    </svg>
  ),
};

const deleteIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="w-4 h-4"
  >
    <path
      fill-rule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
      clip-rule="evenodd"
    />
  </svg>
);

const openIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="w-4 h-4"
  >
    <path d="M4.75 3A1.75 1.75 0 003 4.75v2.752l.104-.002h13.792c.035 0 .07 0 .104.002V6.75A1.75 1.75 0 0015.25 5h-3.836a.25.25 0 01-.177-.073L9.823 3.513A1.75 1.75 0 008.586 3H4.75zM3.104 9a1.75 1.75 0 00-1.673 2.265l1.385 4.5A1.75 1.75 0 004.488 17h11.023a1.75 1.75 0 001.673-1.235l1.384-4.5A1.75 1.75 0 0016.896 9H3.104z" />
  </svg>
);

const filterIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="w-4 h-4"
  >
    <path
      fill-rule="evenodd"
      d="M2.628 1.601C5.028 1.206 7.49 1 10 1s4.973.206 7.372.601a.75.75 0 01.628.74v2.288a2.25 2.25 0 01-.659 1.59l-4.682 4.683a2.25 2.25 0 00-.659 1.59v3.037c0 .684-.31 1.33-.844 1.757l-1.937 1.55A.75.75 0 018 18.25v-5.757a2.25 2.25 0 00-.659-1.591L2.659 6.22A2.25 2.25 0 012 4.629V2.34a.75.75 0 01.628-.74z"
      clip-rule="evenodd"
    />
  </svg>
);

const searchIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor"
    className="w-4 h-4"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
    />
  </svg>
);

function humanFileSize(bytes: any, si = true, dp = 2) {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return "0kB";
  }

  const units = si
    ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
    : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
  let u = -1;
  const r = 10 ** dp;

  do {
    bytes /= thresh;
    ++u;
  } while (
    Math.round(Math.abs(bytes) * r) / r >= thresh &&
    u < units.length - 1
  );

  return bytes.toFixed(dp) + "" + units[u];
}

const viseVersaDirection = (direction: "asc" | "desc") =>
  direction === "asc" ? "desc" : "asc";
export default () => {
  const [a] = useState(1);
  const [tasks, setTasks] = useState(
    localStorage.getItem("taskmanagerTasks")
      ? JSON.parse(localStorage.getItem("taskmanagerTasks"))
      : []
  );

  const [liveUpdates, setLiveUpdates] = useState(true);

  const [sort, setSort] = useState<{
    column: string;
    direction: "asc" | "desc";
  }>({ column: "cpuPercent", direction: "asc" });
  const [alternativeTooltipContent, setAlternativeTooltipContent] = useState(
    {}
  );

  useEffect(() => {
    (window as any).api.on("processListUpdate", (data: any) => {
      if (!liveUpdates) return;
      setTasks(data);
      localStorage.setItem("taskmanagerTasks", JSON.stringify(data));
    });

    (window as any).api.on("kill-process-error", (data: any) => {
      console.info(data);
      setAlternativeTooltipContent({
        ...alternativeTooltipContent,
        [data.appId]: data.error,
      });
    });
  }, [a, liveUpdates]);

  const lastProcessedTasks = useRef([]);
  const processedTasks = useMemo(() => {
    const res = (liveUpdates ? tasks : lastProcessedTasks.current).sort(
      (a, b) => {
        const realA = sort.direction === "asc" ? b : a;
        const realB = sort.direction === "asc" ? a : b;

        if (sort.column === "name") {
          return realA[sort.column].localeCompare(realB[sort.column]);
        }

        return realA[sort.column] - realB[sort.column];
      }
    );

    lastProcessedTasks.current = res;
    return res;
  }, [tasks, sort, liveUpdates]);

  const handleSort = (column: string) =>
    setSort({ column, direction: viseVersaDirection(sort.direction) });

  const handleOpenFolder = (item: any) => {
    (window as any).api.send("open-process-path", { processId: item.pid });
  };

  const handleKill = (item: any) => {
    const appId = `${item.pid}:${item.name}`;

    setAlternativeTooltipContent({
      ...alternativeTooltipContent,
      [appId]: "Signal sent, please wait...",
    });

    (window as any).api.send("kill-process", { processId: item.pid, appId });
  };

  return (
    <Grid
      numItems={1}
      numItemsSm={1}
      numItemsLg={1}
      className="gap-4"
      style={{
        padding: "30px",
        paddingTop: "15px",
        paddingBottom: 0,
      }}
    >
      <Card className="task-manager__primary-filters-card">
        <div className="suspend-switch flex items-center justify-end space-x-3"></div>
      </Card>

      <Card className="task-manager__primary-card" style={{ paddingBottom: 0 }}>
        <div className="task-manager__header">
          <div className="filters">
            <span
              className={`dd-button ${liveUpdates ? "" : "blinking"}`}
              onClick={() => setLiveUpdates((v) => !v)}
            >
              {liveUpdates ? "Pause" : "Resume"}
            </span>
          </div>

          <div className="pid clickable" onClick={() => handleSort("pid")}>
            <span className="pid-sort-lg">
              {sort.column === "pid" && sortDirections[sort.direction]}
            </span>
            PID
            <span className="pid-sort-sm">
              {sort.column === "pid" && sortDirections[sort.direction]}
            </span>
          </div>

          <div
            className="name clickable"
            onClick={() => handleSort("name")}
            style={{}}
          >
            {/* <span> */}
            Name
            {sort.column === "name" && sortDirections[sort.direction]}
            {/* </span> */}
            {/* 
          <span>
            {searchIcon}
          </span> */}
            {/* <input type="text" style={{ border: 'none', outline: 'none', marginLeft: 10 }} placeholder="Search..." /> */}
          </div>
          <div
            className="cpu clickable"
            onClick={() => handleSort("cpuPercent")}
          >
            {sort.column === "cpuPercent" && sortDirections[sort.direction]} CPU
          </div>

          <div className="mem clickable" onClick={() => handleSort("memBytes")}>
            {sort.column === "memBytes" && sortDirections[sort.direction]} RAM
          </div>
        </div>

        <VList className="task-manager__list">
          {processedTasks.map((item) => (
            <div key={item.pid} className="task-manager__task">
              <Tooltip
                isOpen={
                  alternativeTooltipContent[`${item.pid}:${item.name}`]
                    ? true
                    : undefined
                }
                anchorSelect={`#kill-${item.pid}`}
                content={
                  alternativeTooltipContent[`${item.pid}:${item.name}`] ??
                  "Kill the process"
                }
                place="left"
                style={{ padding: "5px 12px", borderRadius: 6 }}
              />
              <Tooltip
                anchorSelect={`#open-folder-${item.pid}`}
                content={"Open executable folder"}
                place="left"
                style={{ padding: "5px 12px", borderRadius: 6 }}
              />

              <div className="icon-picture">
                {item.icon && (
                  <LazyLoadImage
                    src={`local-fs://` + item.icon}
                    height={24}
                    width={24}
                  />
                )}

                {!item.icon && (
                  <img
                    src={iconPlaceHolder}
                    style={{ borderRadius: 8 }}
                    height={24}
                    width={24}
                  />
                )}
              </div>

              <div className="pid">{item.pid}</div>
              <div>
                <div className="process-name-and-actions">
                  <div className="name">{item.name}</div>

                  <div className="actions">
                    <div
                      className="action-button"
                      id={`open-folder-${item.pid}`}
                      onClick={() => handleOpenFolder(item)}
                    >
                      {openIcon}
                    </div>
                    <div
                      className="action-button"
                      id={`kill-${item.pid}`}
                      onClick={() => handleKill(item)}
                    >
                      {deleteIcon}
                    </div>
                  </div>
                </div>
              </div>
              <div className="cpu">{item.cpuPercent?.toFixed(2)}%</div>
              <div className="mem">{humanFileSize(item.memBytes)}</div>
            </div>
          ))}
        </VList>
      </Card>
    </Grid>
  );
};
