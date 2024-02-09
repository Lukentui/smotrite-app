import { Card, CardProps, List, ListItem, Switch, Title } from "@tremor/react";

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

          <ListItem>
            <span>CPU</span>
            <span>{props?.updatesHeap?.hardware?.cpu}</span>
          </ListItem>

          <ListItem>
            <span>GPU</span>
            <span>{props?.updatesHeap?.hardware?.gpu}</span>
          </ListItem>

          <ListItem>
            <span>Memory</span>
            <span>
              {props?.updatesHeap?.hardware?.memoryBanks
                ?.map((v: any) => `${v}GB`)
                .join(" + ")}{" "}
              = {totalMemoryGb}GB
            </span>
          </ListItem>

          <ListItem>
            <span>Serial</span>
            <span className="serialnumber">C12D90F3PN1A</span>
          </ListItem>
        </List>
      </Card>
    </div>
  );
};
