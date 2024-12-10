import {
  Badge,
  Card,
  CardProps,
  Flex,
  Text,
  Metric,
  Title,
} from "@tremor/react";
import { useMemo } from "react";

export default (
  props: CardProps &
    React.RefAttributes<HTMLDivElement> & {
      updatesHeap: any;
      layoutUpdate: number;
      settings?: boolean;
    },
) => {
  const result = useMemo(() => {
    const v = props?.updatesHeap?.swapUpdate?.current;

    if (Number.isInteger(v) && v > 1100) {
      return (v / 1024).toFixed(2) + "GB";
    }

    if (Number.isInteger(v)) {
      return v + "MB";
    }

    return "?";
  }, props?.updatesHeap?.swapUpdate?.current);
  return (
    <div {...props} style={{ position: "relative" }}>
      <Card>
        <Flex justifyContent="between" className="space-x-2">
          <Title style={{ width: "300px" }}>Swap usage</Title>

          <Flex justifyContent="end" className="space-x-1 truncate">
            <Badge color={result === "?" ? "amber" : "blue"}>{result}</Badge>
          </Flex>
        </Flex>
      </Card>
    </div>
  );
};
