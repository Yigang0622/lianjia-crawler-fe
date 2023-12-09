import { useRouter } from 'next/router'
import {checkHouseCollectionStatus, queryHouseHistoryPrice, queryHouseInfoById} from "@/lianjia-service/LianjiaService";
import {HousePriceHistoryDo, HouseRecordDo} from "@/lianjia-service/typeDef";
import {
    Button, Card,
    Carousel, Col,
    Descriptions,
    DescriptionsProps,
    Divider,
    FloatButton,
    Layout,
    Row,
    Table,
    Typography
} from "antd";
import { Image } from 'antd';
import {ArrowLeftOutlined, SearchOutlined, UserOutlined} from "@ant-design/icons";
import React, {useEffect} from "react";
import Link from "next/link";
import axios from "axios";
import {getSession} from "@auth0/nextjs-auth0";

export async function getServerSideProps(context: any) {
    const houseId = context.query.houseid || ''
    const houseInfo  = await queryHouseInfoById(houseId)
    const priceHistory = await queryHouseHistoryPrice(houseId)

    const session = await getSession(context.req, context.res)
    if (session && session.user) {
        const sub = session.user.sub || ''
        const sid = session.user.sid || ''
        const collected = await checkHouseCollectionStatus({
            sid, sub, houseId
        })
        console.log(collected + '<--- collected')
    }
    return { props: { houseInfo, priceHistory } }
}




export default function Page({ houseInfo,priceHistory } : {houseInfo: HouseRecordDo, priceHistory: HousePriceHistoryDo[]}) {



    // useEffect(() => {
    //     axios.get('/api/collection/update', {
    //         params: {
    //             houseId: houseInfo.houseId,
    //             operation: '1'
    //         }
    //     }).then((x) => {
    //
    //     }).catch(x => {
    //
    //     })
    // })

    const contentStyle: React.CSSProperties = {
        margin: 0,
        height: '200px',
        color: '#fff',
        lineHeight: '200px',
        textAlign: 'center',
        background: '#364d79',
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        alignContent: "center"
    };

    const items: DescriptionsProps['items'] = [
        {
            key: '1',
            label: '售价',
            children: `${houseInfo.totalPrice}万`,
        },
        {
            key: '2',
            label: '建筑面积',
            children: `${houseInfo.area}平米`,
        },
        {
            key: '3',
            label: '平米售价',
            children: `${houseInfo.price}元`,
        },
        {
            key: '4',
            label: '小区',
            children: `${houseInfo.resblockName}`,
        },
        {
            key: '5',
            label: '其他',
            children: `${houseInfo.registerTime}, ${houseInfo.isUnique}`,
        },
    ];

    const priceHistoryColumns = [
        {
            title: '日期',
            dataIndex: 'dt',
            key: 'dt',
            width: 200,
            render: (e:any) => {
                return <Link target={'_blank'} href={`/snapshot/${houseInfo.houseId}_${e}`}>{e}</Link>
            }
        },
        {
            title: '售价',
            dataIndex: 'totalPrice',
            key: 'totalPrice',
        },
    ];

    const router = useRouter()

    return <Layout style={{}}>
        <Layout.Content style={{backgroundColor:'#FFFFFF', paddingLeft: 10, paddingRight: 10}}>


            <Col xs={{span:24, offset:0}} sm={{span:24, offset:0}} md={{span:18, offset:3}} lg={{span:14, offset:5}} xl={{span:8, offset:8}} >

                <Carousel dotPosition={"top"}>
                    {
                        houseInfo.images.map(x => {
                            return (
                                <div key={x.roomType} style={contentStyle}>
                                    <Image src={x.url} alt={x.roomName} width={'100%'} referrerPolicy="no-referrer"/>
                                    <Typography.Text type={"secondary"}>{x.roomName}</Typography.Text>
                                </div>
                            )
                        })
                    }

                </Carousel>

                <Typography.Title level={5}>{houseInfo.title}</Typography.Title>

                <Button style={{paddingLeft:0}} type={'link'} onClick={() => {
                    window.open(`https://m.lianjia.com/sh/ershoufang/${houseInfo.houseId}.html`, '_blank')
                }}>跳转链家</Button>


                <Button style={{paddingLeft:0}} type={'link'} onClick={() => {
                    window.open(`https://m.lianjia.com/sh/ershoufang/${houseInfo.houseId}.html`, '_blank')
                }}>收藏</Button>

                <Row style={{paddingTop:20}}>
                    <Divider>基础信息</Divider>
                    <Descriptions bordered items={items} style={{flex:1}}/>
                </Row>

                <Row style={{paddingTop:20, flex:1}}>
                    <Divider>历史价格</Divider>
                    <Table dataSource={priceHistory} columns={priceHistoryColumns} bordered={true} pagination={false} size={'small'} style={{flex:1}}/>
                </Row>


            </Col>



            <FloatButton.Group>
                <FloatButton onClick={() => router.push('/profile')}  icon={<UserOutlined/>}/>
                <FloatButton onClick={() => router.push('/')}  icon={<SearchOutlined/>}/>
                <FloatButton onClick={() => router.back()}  icon={<ArrowLeftOutlined/>}/>
            </FloatButton.Group>
        </Layout.Content>
    </Layout>

}