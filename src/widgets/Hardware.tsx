import { Card, CardProps, List, ListItem, Switch, Title } from "@tremor/react";
import { useMemo } from "react";

export default (
  props: CardProps &
    React.RefAttributes<HTMLDivElement> & {
      updatesHeap: any;
      layoutUpdate: number;
      settings?: boolean;
    },
) => {
  const totalMemoryGb = props?.updatesHeap?.hardware?.memoryBanks?.reduce(
    (prev: any, curr: any) => prev + curr,
    0,
  );

  const memoryView = useMemo(() => {
    const size = `${totalMemoryGb}GB`;
    const banks =
      props?.updatesHeap?.hardware?.memoryBanks?.length &&
      props?.updatesHeap?.hardware?.memoryBanks?.length > 1 ?
        props?.updatesHeap?.hardware?.memoryBanks
        ?.map((v: any) => `${v}GB`)
        .join(" + ")
      : null;

      if(banks) {
        return <>{banks} = {size}</>
      }

      return size;
  }, [props?.updatesHeap])


  return (
    <div {...props} style={{ position: "relative" }}>
      {props?.settings && (
        <div className="widget-overlay">
          <div className="widget-overlay__buttons">Drag me</div>
        </div>
      )}

      <Card>
        <Title>Hardware</Title>

        <List>
          <ListItem>
            <span>OS</span>
            <span>{props?.updatesHeap?.hardware?.os}</span>
          </ListItem>

          {
            props?.updatesHeap?.hardware?.isAppleSilicon
            ?
              <ListItem>
                <span>SoC</span>
                <span>{props?.updatesHeap?.hardware?.cpu}</span>
              </ListItem>
            :
              <>
                <ListItem>
                  <span>CPU</span>
                  <span>{props?.updatesHeap?.hardware?.cpu}</span>
                </ListItem>

                <ListItem>
                  <span>GPU</span>
                  <span>{props?.updatesHeap?.hardware?.gpu}</span>
                </ListItem>
              </>
          }

          <ListItem>
            <span>Memory</span>
            <span>
              {memoryView}
            </span>
          </ListItem>

          <ListItem>
            <span>Serial</span>
            <span className="serialnumber">{props?.updatesHeap?.hardware?.serialNumber}</span>
          </ListItem>
        </List>
      </Card>
    </div>
  );
};
