import {queryHouseHistoryPrice, queryHouseInfoById, queryHouseListByKeyWord} from "@/lianjia-service/LianjiaService";
import {HousePriceHistoryDo, HouseRecordDo} from "@/lianjia-service/typeDef";
import {Card, Col, Image, Input, Row, Space, Tag, Typography} from "antd";
import Link from "next/link";
import {useRouter} from "next/router";

export async function getServerSideProps(context: any) {
    const keyword = context.query.keyword || ''
    const houseList:HouseRecordDo[] = await queryHouseListByKeyWord(keyword, -1)
    // Pass data to the page via props
    return { props: { houseList, keyword } }
}


export default function Page({ houseList,keyword } : {houseList: HouseRecordDo[],keyword:string}) {

    const router = useRouter()

    const onSearchClick = (value:string) => {
        if (value.length > 0) {
            router.push(`/searchlist/${value}`)
        }
    }

    return (
        <div>
            <Input.Search size="large" placeholder="房源Id/小区名字/房源标题..." onSearch={onSearchClick} enterButton />
            <Typography.Title level={4}>搜索结果:{keyword}({houseList.length}条)</Typography.Title>
            {
                houseList.map(x => {
                    return (
                        <Link href={`/housedetail/${x.houseId}`} key={x.houseId}>
                            <Card bodyStyle={{padding:0}} style={{marginTop:10}}>
                                <Row>
                                    <Col span={10} style={{backgroundColor:'#FFFFFF'}}>
                                        <Image src={x.images.length > 0 ? x.images[0].url : ''} alt={''} width={'100%'} referrerPolicy="no-referrer"/>

                                    </Col>
                                    <Col span={14} style={{padding: 10}}>
                                        <Space direction={"vertical"}>
                                            <Typography.Text strong>{`${x.resblockName} ${x.area}平 ${x.totalPrice}万`}</Typography.Text>
                                            <Space direction={"horizontal"} size={5}>
                                                <Tag color="magenta" style={{marginRight:0}}>{x.isUnique}</Tag>
                                                <Tag color="magenta" style={{marginRight:0}}>{x.registerTime}</Tag>
                                            </Space>
                                            <Typography.Text type={'secondary'}>{x.title.slice(0,20)}...</Typography.Text>
                                        </Space>
                                    </Col>
                                </Row>
                            </Card>
                        </Link>

                    )
                })

            }

        </div>
    )
}