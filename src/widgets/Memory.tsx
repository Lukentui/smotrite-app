import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/solid";
import {
    Badge,
    Card,
    CardProps,
    Flex,
    Title,
    Text,
    Metric,
} from "@tremor/react";
import { useMemo } from "react";

export default (
    props: CardProps &
        React.RefAttributes<HTMLDivElement> & {
            updatesHeap: any | undefined;
            layoutUpdate: number;
            loading?: boolean;
        },
) => {
    return (
        <div {...props} style={{ position: "relative" }}>
            {" "}
            {props?.loading && (
                <div className="widget-overlay">
                    <svg
                        style={{ width: "20%" }}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 300 150"
                    >
                        <path
                            fill="none"
                            stroke="#FFFFFF"
                            stroke-width="18"
                            stroke-linecap="round"
                            stroke-dasharray="300 385"
                            stroke-dashoffset="0"
                            d="M275 75c0 31-27 50-50 50-58 0-92-100-150-100-28 0-50 22-50 50s23 50 50 50c58 0 92-100 150-100 24 0 50 19 50 50Z"
                        >
                            <animate
                                attributeName="stroke-dashoffset"
                                calcMode="spline"
                                dur="2"
                                values="685;-685"
                                keySplines="0 0 1 1"
                                repeatCount="indefinite"
                            ></animate>
                        </path>
                    </svg>
                </div>
            )}
            <Card>
                <Flex alignItems="start">
                    <Text>Memory used</Text>
                    <Badge>{props?.updatesHeap?.memory?.usedPercent}%</Badge>
                </Flex>
                <Flex
                    justifyContent="start"
                    alignItems="baseline"
                    className="space-x-3 truncate"
                >
                    <Metric>
                        {props?.updatesHeap?.memory?.used}
                        <span className="metric-identifier-span">GB</span>
                    </Metric>
                    <Text>out of {props?.updatesHeap?.memory?.total}GB</Text>
                </Flex>
            </Card>
        </div>
    );
};
