import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/solid"
import { Badge, Card, CardProps, Flex, Title, Text, Metric } from "@tremor/react"
import { useMemo } from "react"

export default (props: CardProps & React.RefAttributes<HTMLDivElement> & { updatesHeap: any|undefined; layoutUpdate: number; settings?:boolean }) => {

  return <div {...props} style={{ position: 'relative' }}>        {props?.settings && <div className="widget-overlay">
  <div className="widget-overlay__buttons">
      Drag me
  </div>
</div>}<Card >
    <Flex alignItems="start">
      <Text>Memory</Text>
      <Badge>
        {props?.updatesHeap?.memory?.usedPercent}%
      </Badge>
    </Flex>
    <Flex justifyContent="start" alignItems="baseline" className="space-x-3 truncate">
      <Metric>{props?.updatesHeap?.memory?.used}<span className="metric-identifier-span">GB</span></Metric>
      <Text>out of {props?.updatesHeap?.memory?.total}GB</Text>
    </Flex>
  </Card></div>

}
