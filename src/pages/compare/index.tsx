import {Button, DatePicker, Layout, Row, Space, Table, Typography} from "antd";
import React, {useState} from "react";
import moment from "moment";
import dayjs from "dayjs";
import axios, {AxiosResponse} from "axios";
import {HouseCompareRecordDo, HouseCompareSummaryDo} from "@/lianjia-service/typeDef";
import {ColumnsType} from "antd/es/table";
import {text} from "stream/consumers";
import Link from "next/link";

export default function Home() {

    const [dt1, setDt1] = useState(dayjs().subtract(1, 'days'))
    const [dt2, setDt2] = useState(dayjs())
    const [areaBlocks, setAreaBlocks] = useState<string[]>([])
    const [resblockNames, setResblockNames] = useState<string[]>([])
    const [loading, setLoading] = useState(false)


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
            width: 50,
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

    const [houseCompareResult, setHouseCompareResult] = useState<HouseCompareRecordDo[]>([])

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
        setAreaBlocks(areaBlocks)
        setResblockNames(resblockNames)
        setHouseCompareResult(result.data.compareResult)
        setLoading(false)
    }

    return (
        <Layout>
            <Layout.Content>
                <Typography.Title>价格比较</Typography.Title>
                <Space>
                    <DatePicker onChange={(date) => setDt1(date || dayjs())} defaultValue={dt1}/>
                    <DatePicker onChange={(date) => setDt2(date || dayjs())} defaultValue={dt2}/>
                    <Button type={"primary"} onClick={requestData}>比较</Button>
                </Space>
                <Row>
                    <Table dataSource={houseCompareResult} columns={houseCompareColumns} bordered={true} size={'small'}  scroll={{x:'100%'}} loading={loading}/>
                </Row>

            </Layout.Content>
        </Layout>
    )
}