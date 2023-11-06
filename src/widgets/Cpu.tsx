import { Badge, Card, CardProps, Flex, Text, Metric } from "@tremor/react"

export default (props: CardProps & React.RefAttributes<HTMLDivElement> & { updatesHeap: any; layoutUpdate: number; settings?:boolean }) => {
  return <div {...props} style={{ position: 'relative' }}>        {props?.settings && <div className="widget-overlay">
  <div className="widget-overlay__buttons">
      Drag me
  </div>
</div>}<Card >

    <Flex alignItems="start">
      <Text>{props?.updatesHeap?.cpu?.cpu?.manufacturer} {props?.updatesHeap?.cpu?.cpu?.brand} x {props?.updatesHeap?.cpu?.cpu?.cores}</Text>
    </Flex>
    <Flex justifyContent="between" alignItems="center" className="space-x-3 truncate">
      <Metric style={{ width: '130px' }}>{props?.updatesHeap?.cpu?.load?.currentLoad?.toFixed(2)}%</Metric>

      <div className="cpu-cores-grid">
        {
          (Object.keys(props?.updatesHeap?.cpu ?? {}).filter(v => v.includes('core'))).map(v => <div className="core">
            <div className="core-fill" style={{ height: Math.ceil(props?.updatesHeap?.cpu[v]) + '%' }}></div>
          </div>)
        }

      </div>
    </Flex>

  </Card></div>
}