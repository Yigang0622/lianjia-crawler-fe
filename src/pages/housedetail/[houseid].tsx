import { useRouter } from 'next/router'
import {
    addHouseToCollection,
    checkHouseCollectionStatus,
    queryHouseHistoryPrice,
    queryHouseInfoById
} from "@/lianjia-service/LianjiaService";
import {HousePriceHistoryDo, HouseRecordDo} from "@/lianjia-service/typeDef";
import {
    Button, Card,
    Carousel, Col,
    Descriptions,
    DescriptionsProps,
    Divider,
    FloatButton,
    Layout, message,
    Row,
    Table,
    Typography
} from "antd";
import { Image } from 'antd';
import {ArrowLeftOutlined, SearchOutlined, UserOutlined} from "@ant-design/icons";
import React, {useEffect, useState} from "react";
import Link from "next/link";
import axios from "axios";
import {getSession} from "@auth0/nextjs-auth0";
import {useUser} from "@auth0/nextjs-auth0/client";

export async function getServerSideProps(context: any) {
    const houseId = context.query.houseid || ''
    const houseInfo  = await queryHouseInfoById(houseId)
    const priceHistory = await queryHouseHistoryPrice(houseId)

    let collected = false
    const session = await getSession(context.req, context.res)
    if (session && session.user) {
        const sub = session.user.sub || ''
         collected = await checkHouseCollectionStatus({
            sub, houseId
        })
        console.log(collected + '<--- collected')
    }
    return { props: { houseInfo, priceHistory, collected  } }
}




export default function Page({ houseInfo,priceHistory,collected } : {houseInfo: HouseRecordDo, priceHistory: HousePriceHistoryDo[],collected:boolean}) {

    const [messageApi, contextHolder] = message.useMessage();

    const [houseCollected, setHouseCollected] = useState<boolean>(collected)
    const [updateCollectionRequesting, setUpdateCollectionRequesting] = useState(false)
    const { user, error, isLoading } = useUser();

    const updateCollection = (addOrRemove: boolean) => {
        setUpdateCollectionRequesting(true)
        axios.get('/api/collection/update', {
            params: {
                houseId: houseInfo.houseId,
                operation: addOrRemove ? '1' : '2'
            }
        }).then((x) => {
            setUpdateCollectionRequesting(false)
            setHouseCollected(!houseCollected)
            messageApi.open({
                type: 'success',
                content: addOrRemove ? '收藏成功' : '取消收藏成功',
            });
        }).catch(x => {
            setUpdateCollectionRequesting(false)
            messageApi.open({
                type: 'error',
                content: JSON.stringify(x),
            });
        })
    }

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
        {contextHolder}
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
                    window.open(`lianjia://ershou/detail?houseCode=${houseInfo.houseId}`, '_blank')
                }}>跳转链家App</Button>

                 <Button style={{paddingLeft:0}} type={'link'} onClick={() => {
                    window.open(`https://sh.lianjia.com/ershoufang/${houseInfo.houseId}.html`, '_blank')
                }}>跳转链家PC</Button>

                 <Button style={{paddingLeft:0}} type={'link'} onClick={() => {
                    window.open(`https://m.lianjia.com/sh/ershoufang/${houseInfo.houseId}.html`, '_blank')
                }}>跳转链家m站</Button>
                
                <Button loading={updateCollectionRequesting} style={{paddingLeft:0}} type={'link'} onClick={() => {

                    if (!user) {
                        router.push(`/api/auth/login?returnTo=/housedetail/${houseInfo.houseId}`)
                        return
                    }

                    updateCollection(!houseCollected)

                }}> {houseCollected ? '取消收藏' : '收藏'} </Button>

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
