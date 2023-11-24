import {Button, DatePicker, Layout, Row, Space, Table, TabPaneProps, Typography} from "antd";
import React, {useState} from "react";
import moment from "moment";
import dayjs from "dayjs";
import axios, {AxiosResponse} from "axios";
import {HouseCompareRecordDo, HouseCompareSummaryDo, SimpleHouseInfoDo} from "@/lianjia-service/typeDef";
import {ColumnsType} from "antd/es/table";
import Link from "next/link";
import { Tabs } from 'antd';

export default function Home() {

    const [dt1, setDt1] = useState(dayjs().subtract(1, 'days'))
    const [dt2, setDt2] = useState(dayjs())
    const [areaBlocks, setAreaBlocks] = useState<string[]>([])
    const [resblockNames, setResblockNames] = useState<string[]>([])
    const [loading, setLoading] = useState(false)

    const [areaBlocksSold, setAreaBlocksSold] = useState<string[]>([])
    const [resblockNamesSold, setResblockNamesSold] = useState<string[]>([])
    const [areaBlocksNew, setAreaBlocksNew] = useState<string[]>([])
    const [resblockNamesNew, setResblockNamesNew] = useState<string[]>([])


    const [houseCompareResult, setHouseCompareResult] = useState<HouseCompareRecordDo[]>([])
    const [newHouses, setNewHouses] = useState<SimpleHouseInfoDo[]>()
    const [soldHouses, setSoldHouses] = useState<SimpleHouseInfoDo[]>()

    const houseCompareColumns: ColumnsType<HouseCompareRecordDo> = [
        {
            title: '房源编号',
            dataIndex: 'houseId',
            key: 'houseId',
            width: 100,
            render: (e) => {
                return <Link target={'_blank'} href={`/housedetail/${e}`}>{e}</Link>
            }

        },
        {
            title: '地区',
            dataIndex: 'blockArea',
            key: 'blockArea',
            width: 100,
            filters: areaBlocks.map(x => {
                return {
                    text: x, value: x
                }
            }),
            filterSearch: true,
            onFilter: (value, record) => record.blockArea.startsWith(`${value}`)

        },
        {
            title: '小区',
            dataIndex: 'resblockName',
            key: 'resblockName',
            width: 100,
            filters: resblockNames.map(x => {
                return {
                    text: x, value: x
                }
            }),
            filterSearch: true,
            onFilter: (value, record) => record.resblockName.startsWith(`${value}`)
        },
        {
            title: '面积',
            dataIndex: 'area',
            width: 100,
            key: 'area',
            sorter: (a, b) => a.area - b.area,

        },
        {
            title: `平米价格${dt1.format('MM-DD')}`,
            dataIndex: 'areaPrice1',
            key: 'areaPrice1',
            width: 100,
            sorter: (a, b) => a.areaPrice1 - b.areaPrice1,


        },
        {
            title: `平米价格${dt2.format('MM-DD')}`,
            dataIndex: 'areaPrice2',
            key: 'areaPrice2',
            width: 100,
            sorter: (a, b) => a.areaPrice2 - b.areaPrice2,


        },
        {
            title: `平米价格差`,
            dataIndex: 'areaPriceDiff',
            key: 'areaPriceDiff',
            width: 100,
            sorter: (a, b) => a.areaPriceDiff - b.areaPriceDiff,
        },
        {
            title: `总价${dt1.format('MM-DD')}`,
            dataIndex: 'totalPrice1',
            key: 'totalPrice1',
            width: 100,
            sorter: (a, b) => a.totalPrice1 - b.totalPrice1,


        },
        {
            title: `总价${dt2.format('MM-DD')}`,
            dataIndex: 'totalPrice2',
            key: 'totalPrice2',
            width: 100,
            sorter: (a, b) => a.totalPrice2 - b.totalPrice2,


        },
        {
            title: `价格差`,
            dataIndex: 'priceDiff',
            key: 'priceDiff',
            // fixed: 'right',
            width: 80,
            sorter: (a, b) => a.priceDiff - b.priceDiff,
        },
        {
            title: '标题',
            dataIndex: 'title',
            key: 'title',
            width: 100,
            fixed: 'left',
            render: (e) => {
                return <p style={{ maxHeight:5, padding:0, margin:0}}>{e}</p>
            }
        },
    ];
    const soldHouseColumns: ColumnsType<SimpleHouseInfoDo> = [
        {
            title: '房源编号',
            dataIndex: 'houseId',
            key: 'houseId',
            width: 100,
            render: (e) => {
                return <Link target={'_blank'} href={`/housedetail/${e}`}>{e}</Link>
            }

        },
        {
            title: '地区',
            dataIndex: 'blockArea',
            key: 'blockArea',
            width: 100,
            filters: areaBlocksSold.map(x => {
                return {
                    text: x, value: x
                }
            }),
            filterSearch: true,
            onFilter: (value, record) => record.blockArea.startsWith(`${value}`)

        },
        {
            title: '小区',
            dataIndex: 'resblockName',
            key: 'resblockName',
            width: 100,
            filters: resblockNamesSold.map(x => {
                return {
                    text: x, value: x
                }
            }),
            filterSearch: true,
            onFilter: (value, record) => record.resblockName.startsWith(`${value}`)
        },
        {
            title: '面积',
            dataIndex: 'area',
            width: 100,
            key: 'area',
            sorter: (a, b) => a.area - b.area,

        },
        {
            title: `平米价格`,
            dataIndex: 'areaPrice',
            key: 'areaPrice',
            width: 100,
            sorter: (a, b) => a.areaPrice - b.areaPrice,


        },
        {
            title: `总价`,
            dataIndex: 'totalPrice',
            key: 'totalPrice',
            width: 100,
            sorter: (a, b) => a.totalPrice - b.totalPrice,


        },
        {
            title: '标题',
            dataIndex: 'title',
            key: 'title',
            width: 100,
            fixed: 'left',
            render: (e) => {
                return <p style={{ maxHeight:5, padding:0, margin:0}}>{e}</p>
            }
        }
    ];

    const newHouseColumns: ColumnsType<SimpleHouseInfoDo> = [
        {
            title: '房源编号',
            dataIndex: 'houseId',
            key: 'houseId',
            width: 100,
            render: (e) => {
                return <Link target={'_blank'} href={`/housedetail/${e}`}>{e}</Link>
            }

        },
        {
            title: '地区',
            dataIndex: 'blockArea',
            key: 'blockArea',
            width: 100,
            filters: areaBlocksNew.map(x => {
                return {
                    text: x, value: x
                }
            }),
            filterSearch: true,
            onFilter: (value, record) => record.blockArea.startsWith(`${value}`)

        },
        {
            title: '小区',
            dataIndex: 'resblockName',
            key: 'resblockName',
            width: 100,
            filters: resblockNamesNew.map(x => {
                return {
                    text: x, value: x
                }
            }),
            filterSearch: true,
            onFilter: (value, record) => record.resblockName.startsWith(`${value}`)
        },
        {
            title: '面积',
            dataIndex: 'area',
            width: 100,
            key: 'area',
            sorter: (a, b) => a.area - b.area,

        },
        {
            title: `平米价格`,
            dataIndex: 'areaPrice',
            key: 'areaPrice',
            width: 100,
            sorter: (a, b) => a.areaPrice - b.areaPrice,


        },
        {
            title: `总价`,
            dataIndex: 'totalPrice',
            key: 'totalPrice',
            width: 100,
            sorter: (a, b) => a.totalPrice - b.totalPrice,


        },
        {
            title: '标题',
            dataIndex: 'title',
            key: 'title',
            width: 100,
            fixed: 'left',
            render: (e) => {
                return <p style={{ maxHeight:5, padding:0, margin:0}}>{e}</p>
            }
        }
    ];


    const requestData = async () => {
        setLoading(true)
        const result:AxiosResponse<HouseCompareSummaryDo, any> = await axios.get('/api/compare', {
            params: {
                dt1: dt1.format('YYYYMMDD'),
                dt2: dt2.format('YYYYMMDD')
            }
        })
        console.log(result.data.compareResult[0])
        const areaBlocks = Array.from(new Set(result.data.compareResult.map(x => x.blockArea)))
        const resblockNames = Array.from(new Set(result.data.compareResult.map(x => x.resblockName)))
        const areaBlocksNew = Array.from(new Set(result.data.newHouses.map(x => x.blockArea)))
        const resblockNamesNew = Array.from(new Set(result.data.newHouses.map(x => x.resblockName)))
        const areaBlocksSold = Array.from(new Set(result.data.soldHouse.map(x => x.blockArea)))
        const resblockNamesSold = Array.from(new Set(result.data.soldHouse.map(x => x.resblockName)))

        setAreaBlocksSold(areaBlocksSold)
        setResblockNamesSold(resblockNamesSold)
        setAreaBlocksNew(areaBlocksNew)
        setResblockNamesNew(resblockNamesNew)
        setAreaBlocks(areaBlocks)
        setResblockNames(resblockNames)
        setHouseCompareResult(result.data.compareResult)
        setNewHouses(result.data.newHouses)
        setSoldHouses(result.data.soldHouse)
        setLoading(false)
    }

    const tabs= [
        {
            key: '1',
            label: '价格比较',
            children:
                <Row>
                    <Table dataSource={houseCompareResult} columns={houseCompareColumns} bordered={true} size={'small'}  scroll={{x:'100%'}} loading={loading}/>
                </Row>
        },
        {
            key: '2',
            label: `${dt1.format('MM-DD')}后新上架`,
            children:
                <Row>
                    <Table dataSource={newHouses} columns={newHouseColumns} bordered={true} size={'small'}  scroll={{x:'100%'}} loading={loading}/>
                </Row>
        },
        {
            key: '3',
            label: `${dt1.format('MM-DD')}后卖出`,
            children: <Row>
                        <Table dataSource={soldHouses} columns={soldHouseColumns} bordered={true} size={'small'}  scroll={{x:'100%'}} loading={loading}/>
                    </Row>
        },
    ];

    return (
        <Layout>
            <Layout.Content>
                <Space>
                    <DatePicker onChange={(date) => setDt1(date || dayjs())} defaultValue={dt1}/>
                    <DatePicker onChange={(date) => setDt2(date || dayjs())} defaultValue={dt2}/>
                    <Button type={"primary"} onClick={requestData}>比较</Button>
                </Space>

                <Tabs defaultActiveKey="1" items={tabs} onChange={() => {}} centered/>
            </Layout.Content>
        </Layout>
    )
}