import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/solid";
import { Badge, Card, CardProps, Flex, Title } from "@tremor/react";
import { humanFileSize } from "../helpers";

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
            {" "}
            {props?.loading && (
                <div className="widget-overlay">
                    <div className="widget-overlay__buttons">Loading</div>
                </div>
            )}
            <Card>
                <Flex justifyContent="between" className="space-x-2">
                    <Title style={{ width: "100px" }}>Network</Title>

                    <Flex justifyContent="end" className="space-x-1 truncate">
                        <Badge icon={ArrowDownIcon}>
                            {humanFileSize(props?.updatesHeap?.network?.rx)}
                        </Badge>
                        <Badge icon={ArrowUpIcon}>
                            {humanFileSize(props?.updatesHeap?.network?.tx)}
                        </Badge>
                    </Flex>
                </Flex>
            </Card>
        </div>
    );
};
