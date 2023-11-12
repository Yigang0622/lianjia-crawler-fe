import { useRouter } from 'next/router'
import {queryHouseHistoryPrice, queryHouseInfoById} from "@/lianjia-service/LianjiaService";
import {HousePriceHistoryDo, HouseRecordDo} from "@/lianjia-service/typeDef";
import {Button, Carousel, Descriptions, DescriptionsProps, Layout, Row, Table, Typography} from "antd";
import { Image } from 'antd';


export async function getServerSideProps(context: any) {
    const houseid = context.query.houseid || ''
    const houseInfo  = await queryHouseInfoById(houseid)
    const priceHistory = await queryHouseHistoryPrice(houseid)
    // Pass data to the page via props
    return { props: { houseInfo, priceHistory } }
}


export default function Page({ houseInfo,priceHistory } : {houseInfo: HouseRecordDo, priceHistory: HousePriceHistoryDo[]}) {


    const contentStyle: React.CSSProperties = {
        margin: 0,
        height: '200px',
        color: '#fff',
        lineHeight: '200px',
        textAlign: 'center',
        background: '#364d79',
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
            width: 200
        },
        {
            title: '售价',
            dataIndex: 'totalPrice',
            key: 'totalPrice',
        },
    ];


    return <Layout style={{backgroundColor:'#FFFFFF'}}>
        <Layout.Content>
            <Carousel>
                {
                    houseInfo.images.map(x => {
                        return (
                            <div key={x.roomType} style={contentStyle}>
                                <Typography.Text style={{position:'absolute', left:0, top:0, color:'#000000'}}>{x.roomName}</Typography.Text>
                                <Image src={x.url} alt={x.roomName} width={'100%'} referrerPolicy="no-referrer"/>
                            </div>
                        )
                    })
                }

            </Carousel>

            <Typography.Title level={5}>{houseInfo.title}</Typography.Title>

            <Button type={'primary'} onClick={() => {
                window.open(`https://m.lianjia.com/sh/ershoufang/${houseInfo.houseId}.html`, '_blank')
            }}>进入链家</Button>

            <Row style={{paddingTop:20}}>
                <Descriptions bordered items={items} style={{flex:1}}/>
            </Row>

            <Row style={{paddingTop:20, flex:1}}>

                <Table dataSource={priceHistory} columns={priceHistoryColumns} bordered={true} pagination={false} size={'small'} style={{flex:1}}/>;
            </Row>


        </Layout.Content>
    </Layout>

}