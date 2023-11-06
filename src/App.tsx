import { useEffect, useRef, useState } from 'react'
import './App.css'
import {
  Grid,
} from "@tremor/react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

import moment from 'moment';
import React from 'react';
import { WidgetsComponents } from './widgets';

const defaultLayout = {
  'right': ['hardware', 'network'],
  'left': ['memory', 'cpu', 'drives']
}


// export const reorderQuoteMap = ({
//   quoteMap,
//   source,
//   destination,
// }): ReorderQuoteMapResult => {
//   const current: Quote[] = [...quoteMap[source.droppableId]];
//   const next: Quote[] = [...quoteMap[destination.droppableId]];
//   const target: Quote = current[source.index];

//   // moving to same list
//   if (source.droppableId === destination.droppableId) {
//     const reordered: Quote[] = reorder(
//       current,
//       source.index,
//       destination.index,
//     );
//     const result: QuoteMap = {
//       ...quoteMap,
//       [source.droppableId]: reordered,
//     };
//     return {
//       quoteMap: result,
//     };
//   }

//   // moving to different list

//   // remove from original
//   current.splice(source.index, 1);
//   // insert into next
//   next.splice(destination.index, 0, target);

//   const result: QuoteMap = {
//     ...quoteMap,
//     [source.droppableId]: current,
//     [destination.droppableId]: next,
//   };

//   return {
//     quoteMap: result,
//   };
// };

function App() {
  const updatesHeap = useRef({});

  const [layout, setLayout] = useState<typeof defaultLayout>(
    window.localStorage.getItem('layout')
      ? JSON.parse(window.localStorage.getItem('layout')!)
      : defaultLayout
  );



  const [a,] = useState(1)
  const [layoutUpdate, setLayoutUpdate] = useState(0)

  useEffect(() => {
    (window as any).api.on("memoryUpdate", (data: any) => {
      updatesHeap.current = ({
        ...updatesHeap.current,
        memory: {
          total: (data.total / 1073741824).toFixed(2),
          used: (data.used / 1073741824).toFixed(2),
          available: ((data.total - data.used) / 1073741824).toFixed(2),
          usedPercent: (data.used / data.total * 100).toFixed(2),
        }
      })

      setLayoutUpdate(+new Date())
    });

    (window as any).api.on("cpuUpdate", (data: any) => {
      updatesHeap.current = ({
        ...updatesHeap.current,
        cpu: {
          ...data,

          loadPercent: data.load.currentLoad.toFixed(2),
          cpuName: data.cpu.manufacturer + ' ' + data.cpu.brand,

          loadByCores: data.loadByCores,

          time: moment().format('kk:mm:ss')
        },
      })

      setLayoutUpdate(+new Date())
    });

    (window as any).api.on("hwInfoUpdate", (data: any) => {
      updatesHeap.current = ({
        ...updatesHeap.current,
        hardware: data,
      })

      setLayoutUpdate(+new Date())
    });

    (window as any).api.on("networkUpdate", (data: any) => {
      updatesHeap.current = ({
        ...updatesHeap.current,
        network: data,
      })

      setLayoutUpdate(+new Date())
    });

    (window as any).api.on("drivesIOUpdate", (data: any) => {
      updatesHeap.current = ({
        ...updatesHeap.current,
        drivesIO: data,
      })

      setLayoutUpdate(+new Date())
    });

    (window as any).api.on("drivesLayoutUpdate", (data: any) => {
      updatesHeap.current = ({
        ...updatesHeap.current,
        drivesLayout: data,
      })

      setLayoutUpdate(+new Date())
    });

    console.warn('setup')
  }, [a]);

  const reorder = (list: any[], startIndex: number, endIndex: number): any[] => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };
  

  return (
    <Grid numItems={1} numItemsSm={2} numItemsLg={2} className="gap-6" style={{
      padding: '30px',
      paddingTop: 0,
      paddingBottom: 0,
    }}>
      <DragDropContext onDragEnd={(result) => {
        console.info(result)

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


          setLayout(result)
          window.localStorage.setItem('layout', JSON.stringify(result))
          return
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

        setLayout(resultA)
        window.localStorage.setItem('layout', JSON.stringify(resultA))

      }}>
        <Droppable droppableId="left">
          {(droppableProvided, droppableSnapshot) => (
            <div
              {...droppableProvided.droppableProps}
              ref={droppableProvided.innerRef}
            // style={{ display: 'grid', gap: '1.5rem', height: 'fit-content' }}
            >
              {
                (layout['left'])
                  // .sort((a, b) => entryAIndex - entryBIndex)
                  .map((widget, index) =>
                    <Draggable key={widget} draggableId={widget} index={index} isDragDisabled={true}>
                      {(draggableProvided, draggableSnapshot) => (
                        <div

                          {
                          ...{
                            ...draggableProvided.draggableProps,
                            ...draggableProvided.dragHandleProps,
                            ...draggableProvided.innerRef,
                            ref: draggableProvided.innerRef,
                            // className: "mt-6 mb-6"
                          }
                          }
                        >
                          <div style={{ height: "1.5rem" }} /> 
                          {
                            React.createElement(WidgetsComponents[widget as keyof typeof WidgetsComponents], {
                              updatesHeap: updatesHeap.current,
                              layoutUpdate: layoutUpdate,
                              settings: true,
                            })
                          }
                        </div>
                      )}
                    </Draggable>)
              }

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
              {
                (layout['right'])
                  // .sort((a, b) => entryAIndex - entryBIndex)
                  .map((widget, index) =>
                    <Draggable key={widget} draggableId={widget} index={index} isDragDisabled={true}>
                      {(draggableProvided, draggableSnapshot) => (
                        <div
                          {
                          ...{
                            ...draggableProvided.draggableProps,
                            ...draggableProvided.dragHandleProps,
                            ...draggableProvided.innerRef,
                            ref: draggableProvided.innerRef,
                            // className: "mt-6 mb-6"
                          }
                          }
                        >
                        <div style={{ height: "1.5rem" }} /> 
                          {
                            React.createElement(WidgetsComponents[widget as keyof typeof WidgetsComponents], {
                              updatesHeap: updatesHeap.current,
                              layoutUpdate: layoutUpdate,
                              settings: true,
                              // className: 'max-w-md mx-auto',
                            })
                          }
                        </div>
                      )}
                    </Draggable>)
              }

              {droppableProvided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </Grid>
  );
}

export default App
