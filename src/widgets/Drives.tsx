import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/solid";
import {
  Badge,
  Card,
  CardProps,
  Text,
  Flex,
  List,
  ListItem,
  ProgressBar,
  Title,
} from "@tremor/react";
import { FixedSizeList as ListWindow } from "react-window";

function humanFileSize(bytes: any, si = true, dp = 1) {
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

export default (
  props: CardProps &
    React.RefAttributes<HTMLDivElement> & {
      updatesHeap: any;
      layoutUpdate: number;
      loading?: boolean;
    },
) => {
  return (
    <div {...props} style={{ position: "relative" }}>
      {props?.loading && (
        <div className="widget-overlay">
          <div className="widget-overlay__buttons">Drag me</div>
        </div>
      )}
      <Card>
        <Flex justifyContent="between">
          <Title style={{ width: "80px" }}>Drives</Title>

          <Flex justifyContent="end" className="space-x-1 truncate">
            <Badge icon={ArrowDownIcon}>
              {humanFileSize(props?.updatesHeap?.drivesIO?.wx_sec)}
            </Badge>
            <Badge icon={ArrowUpIcon}>
              {humanFileSize(props?.updatesHeap?.drivesIO?.rx_sec)}
            </Badge>
          </Flex>
        </Flex>

        <List className="mt-4">
          {props?.updatesHeap?.drivesLayout?.map((v: any) => (
            <ListItem>
              <Flex justifyContent="between" className="space-x-1 truncate">
                <Text>{v.name}</Text>
                <Text>{humanFileSize(v.size)}</Text>
              </Flex>
            </ListItem>
          ))}
        </List>

        {/* <List className="mt-4" style={{ maxHeight: 300 }}>

          <ListWindow
              className="List"
              height={150}
              itemCount={(props?.updatesHeap?.processList ?? []).length}
              itemSize={35}
            >
              {Row}
            </ListWindow>
              
          </List> */}
      </Card>
    </div>
  );
};
