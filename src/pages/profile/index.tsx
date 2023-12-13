import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import {useUser} from "@auth0/nextjs-auth0/client";
import React, {useEffect, useState} from "react";
import axios from "axios";
import {Button, Card, Col, FloatButton, Image, Input, Row, Skeleton, Space, Tag, Typography} from "antd";
import Link from "next/link";
import {UserHouseCollectionDo} from "@/lianjia-service/typeDef";
import {Line} from "react-chartjs-2";
import { Chart as ChartJS, registerables } from 'chart.js';
import {SearchOutlined} from "@ant-design/icons";
ChartJS.register(...registerables);


export const getServerSideProps = withPageAuthRequired();

export default function Home() {

    const [dataLoaded, setDataLoaded] = useState(false)
    const [loading, setLoading] = useState(false)

    const [collections, setCollections] = useState<UserHouseCollectionDo[]>([])
    const { user, error, isLoading } = useUser()
    const requestData = () => {
        if (!dataLoaded) {
            console.log('requesting data')
            setDataLoaded(true)
            setLoading(true)
            axios.get('/api/collection/list').then(result => {
                setCollections(result.data)
                setLoading(false)
            }).catch(x => {
                setLoading(false)
            })
        }
    }

    useEffect(() => {
       requestData()
    })

    return  <Col xs={{span:24, offset:0}} sm={{span:24, offset:0}} md={{span:18, offset:3}} lg={{span:10, offset:7}} xl={{span:8, offset:8}} >
        <Typography.Title level={4}>Welcome {user?.nickname}</Typography.Title>
        <Button style={{paddingLeft:0}} type={"link"} href={'/api/auth/logout'}>logout</Button>

        {
            loading ?  <Skeleton active/> :
                collections.map(x => {
                    const { houseId, houseInfo, priceHistory } = x;
                    return (
                        <Link href={`/housedetail/${x.houseId}`} key={x.houseId}>
                            <Card bodyStyle={{padding:0}} style={{marginTop:10}}>
                                <Row>
                                    <Col span={10} style={{backgroundColor:'#FFFFFF'}}>
                                        <Image src={houseInfo.images.length > 0 ? houseInfo.images[0].url : ''} alt={''} width={'100%'} referrerPolicy="no-referrer" preview={false}/>
                                    </Col>
                                    <Col span={14} style={{padding: 10}}>
                                        <Space direction={"vertical"}>
                                            <Typography.Text strong>{`${houseInfo.resblockName} ${houseInfo.area}平 ${houseInfo.totalPrice}万`}</Typography.Text>
                                            <Space direction={"horizontal"} size={5}>
                                                <Tag color="magenta" style={{marginRight:0}}>{houseInfo.isUnique}</Tag>
                                                <Tag color="magenta" style={{marginRight:0}}>{houseInfo.registerTime}</Tag>
                                            </Space>
                                            <Typography.Text type={'secondary'}>{houseInfo.title.slice(0,20)}...</Typography.Text>
                                        </Space>
                                    </Col>
                                </Row>
                                <Row style={{height: 200}}>
                                    <Line
                                        style={
                                            {width: '100%'}
                                        }
                                        data={
                                            {
                                                labels: priceHistory.map(x => x.dt),
                                                datasets: [{

                                                    label: '总价格',
                                                    data: priceHistory.map(x => x.price)
                                                }]
                                            }
                                        } options={{
                                        maintainAspectRatio:false,
                                        plugins: {
                                            legend: {
                                                display: false
                                            }
                                        }
                                    }}></Line>
                                </Row>
                            </Card>
                        </Link>

                    )
                })

        }

        <FloatButton.Group>
            <FloatButton href={"/"}  icon={<SearchOutlined/>}/>
        </FloatButton.Group>
    </Col>
}