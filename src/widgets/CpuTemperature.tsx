import {
    Badge,
    Card,
    CardProps,
    Flex,
    Text,
    Metric,
    Title,
} from "@tremor/react";

export default (
    props: CardProps &
        React.RefAttributes<HTMLDivElement> & {
            updatesHeap: any;
            layoutUpdate: number;
            loading?: boolean;
        },
) => {
    console.info(91, props?.updatesHeap?.cpuTemperature);
    return (
        <div {...props} style={{ position: "relative" }}>
            <Card>
                <Flex justifyContent="between" className="space-x-2">
                    <Title style={{ width: "300px" }}>CPU Temperature</Title>

                    <Flex justifyContent="end" className="space-x-1 truncate">
                        <Badge>
                            {props?.updatesHeap?.cpuTemperature?.current}
                        </Badge>
                    </Flex>
                </Flex>
            </Card>
        </div>
    );
};
