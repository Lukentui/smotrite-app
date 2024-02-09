import { Badge, Card, CardProps, Flex, Text, Metric } from "@tremor/react";
import { useEffect, useRef, useState } from "react";
import "./../App.css";
import { Grid } from "@tremor/react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

import moment from "moment";
import React from "react";
import { WidgetsComponents } from "./../widgets";

const defaultLayout = {
  right: ["hardware", "network", "cpuTemperature"],
  left: ["memory", "cpu", "drives"],
};

export default () => {
  const updatesHeap = useRef(
    localStorage.getItem("dashboardUpdatesHeap")
      ? JSON.parse(localStorage.getItem("dashboardUpdatesHeap"))
      : {},
  );

  const [layout, setLayout] = useState<typeof defaultLayout>(
    window.localStorage.getItem("layout")
      ? JSON.parse(window.localStorage.getItem("layout")!)
      : defaultLayout,
  );

  const [a] = useState(1);
  const [layoutUpdate, setLayoutUpdate] = useState(0);

  useEffect(() => {
    (window as any).api.on("memoryUpdate", (data: any) => {
      updatesHeap.current = {
        ...updatesHeap.current,
        memory: {
          total: (data.total / 1073741824).toFixed(2),
          used: (data.used / 1073741824).toFixed(2),
          available: ((data.total - data.used) / 1073741824).toFixed(2),
          usedPercent: data.usedPercent.toFixed(2),
        },
      };

      localStorage.setItem(
        "dashboardUpdatesHeap",
        JSON.stringify(updatesHeap.current),
      );
      setLayoutUpdate(+new Date());
    });

    (window as any).api.on("cpuTemperatureUpdate", (data: any) => {
      updatesHeap.current = {
        ...updatesHeap.current,
        cpuTemperature: {
          current: data.current,
        },
      };

      localStorage.setItem(
        "dashboardUpdatesHeap",
        JSON.stringify(updatesHeap.current),
      );
      setLayoutUpdate(+new Date());
    });

    (window as any).api.on("cpuUpdate", (data: any) => {
      updatesHeap.current = {
        ...updatesHeap.current,
        cpu: {
          ...data,

          loadPercent: data.load.currentLoad.toFixed(2),
          cpuName: data.cpu.manufacturer + " " + data.cpu.brand,

          loadByCores: data.loadByCores,

          time: moment().format("kk:mm:ss"),
        },
      };

      localStorage.setItem(
        "dashboardUpdatesHeap",
        JSON.stringify(updatesHeap.current),
      );
      setLayoutUpdate(+new Date());
    });

    (window as any).api.on("hwInfoUpdate", (data: any) => {
      updatesHeap.current = {
        ...updatesHeap.current,
        hardware: data,
      };

      localStorage.setItem(
        "dashboardUpdatesHeap",
        JSON.stringify(updatesHeap.current),
      );
      setLayoutUpdate(+new Date());
    });

    (window as any).api.on("networkUpdate", (data: any) => {
      updatesHeap.current = {
        ...updatesHeap.current,
        network: data,
      };

      localStorage.setItem(
        "dashboardUpdatesHeap",
        JSON.stringify(updatesHeap.current),
      );
      setLayoutUpdate(+new Date());
    });

    (window as any).api.on("drivesIOUpdate", (data: any) => {
      updatesHeap.current = {
        ...updatesHeap.current,
        drivesIO: data,
      };

      localStorage.setItem(
        "dashboardUpdatesHeap",
        JSON.stringify(updatesHeap.current),
      );
      setLayoutUpdate(+new Date());
    });

    (window as any).api.on("drivesLayoutUpdate", (data: any) => {
      updatesHeap.current = {
        ...updatesHeap.current,
        drivesLayout: data,
      };

      localStorage.setItem(
        "dashboardUpdatesHeap",
        JSON.stringify(updatesHeap.current),
      );
      setLayoutUpdate(+new Date());
    });

    (window as any).api.on("processListUpdate", (data: any) => {
      // console.info(data)
      updatesHeap.current = {
        ...updatesHeap.current,
        processList: data,
      };

      localStorage.setItem(
        "dashboardUpdatesHeap",
        JSON.stringify(updatesHeap.current),
      );
      setLayoutUpdate(+new Date());
    });

    console.warn("setup");
  }, [a]);

  const reorder = (
    list: any[],
    startIndex: number,
    endIndex: number,
  ): any[] => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  return (
    <Grid
      numItems={1}
      numItemsSm={2}
      numItemsLg={2}
      className="gap-6"
      style={{
        padding: "30px",
        paddingTop: 0,
        paddingBottom: 0,
        marginTop: 7,
      }}
    >
      <DragDropContext
        onDragEnd={(result) => {
          console.info(result);

          if (!result.destination) {
            return;
          }

          const source = result.source;
          const destination = result.destination;

          // @ts-ignore
          const current: any = [...layout[source.droppableId]];
          // @ts-ignore
          const next: any = [...layout[destination.droppableId]];
          const target: any = current[source.index];

          if (source.droppableId === destination.droppableId) {
            const reordered: any[] = reorder(
              current,
              source.index,
              destination.index,
            );
            const result: any = {
              ...layout,
              [source.droppableId]: reordered,
            };

            setLayout(result);
            window.localStorage.setItem("layout", JSON.stringify(result));
            return;
          }

          // remove from original
          current.splice(source.index, 1);
          // insert into next
          next.splice(destination.index, 0, target);

          const resultA: any = {
            ...layout,
            [source.droppableId]: current,
            [destination.droppableId]: next,
          };

          setLayout(resultA);
          window.localStorage.setItem("layout", JSON.stringify(resultA));
        }}
      >
        <Droppable droppableId="left">
          {(droppableProvided, droppableSnapshot) => (
            <div
              {...droppableProvided.droppableProps}
              ref={droppableProvided.innerRef}
              // style={{ display: 'grid', gap: '1.5rem', height: 'fit-content' }}
            >
              {layout["left"]
                // .sort((a, b) => entryAIndex - entryBIndex)
                .map((widget, index) => (
                  <Draggable
                    key={widget}
                    draggableId={widget}
                    index={index}
                    isDragDisabled={false}
                  >
                    {(draggableProvided, draggableSnapshot) => (
                      <div
                        {...{
                          ...draggableProvided.draggableProps,
                          ...draggableProvided.dragHandleProps,
                          ...draggableProvided.innerRef,
                          ref: draggableProvided.innerRef,
                          // className: "mt-6 mb-6"
                        }}
                      >
                        <div style={{ height: "1.5rem" }} />
                        {React.createElement(
                          WidgetsComponents[
                            widget as keyof typeof WidgetsComponents
                          ],
                          {
                            updatesHeap: updatesHeap.current,
                            layoutUpdate: layoutUpdate,
                            // settings: true,
                          },
                        )}
                      </div>
                    )}
                  </Draggable>
                ))}

              {/* {droppableSnapshot.isDraggingOver && (
            <div
              className="placeholder"
            >red</div>
          )} */}

              {droppableProvided.placeholder}
            </div>
          )}
        </Droppable>

        <Droppable droppableId="right">
          {(droppableProvided, droppableSnapshot) => (
            <div
              {...droppableProvided.droppableProps}
              ref={droppableProvided.innerRef}
              // style={{ display: 'grid', gap: '1.5rem', height: 'fit-content' }}
            >
              {layout["right"]
                // .sort((a, b) => entryAIndex - entryBIndex)
                .map((widget, index) => (
                  <Draggable
                    key={widget}
                    draggableId={widget}
                    index={index}
                    isDragDisabled={false}
                  >
                    {(draggableProvided, draggableSnapshot) => (
                      <div
                        {...{
                          ...draggableProvided.draggableProps,
                          ...draggableProvided.dragHandleProps,
                          ...draggableProvided.innerRef,
                          ref: draggableProvided.innerRef,
                          // className: "mt-6 mb-6"
                        }}
                      >
                        <div
                          style={{ height: "1.5rem" }}
                          className={index === 0 && "first-right-side-buffer"}
                        />
                        {React.createElement(
                          WidgetsComponents[
                            widget as keyof typeof WidgetsComponents
                          ],
                          {
                            updatesHeap: updatesHeap.current,
                            layoutUpdate: layoutUpdate,
                            // settings: true,
                            // className: 'max-w-md mx-auto',
                          },
                        )}
                        {index === layout["right"].length - 1 && (
                          <div
                            style={{ height: "1.5rem" }}
                            className={"last-right-side-buffer"}
                          />
                        )}
                      </div>
                    )}
                  </Draggable>
                ))}

              {droppableProvided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </Grid>
  );
};
