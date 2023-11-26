import {HouseRecordDo, HouseSnapshotDo} from "@/lianjia-service/typeDef";
import {fetchHouseSnapshot, queryHouseListByKeyWord} from "@/lianjia-service/LianjiaService";
import {Layout, Typography} from "antd";
import dynamic from 'next/dynamic'

export async function getServerSideProps(context: any) {
    const snapshotId = context.query.snapshotId || ''
    const snapshot:HouseSnapshotDo = await fetchHouseSnapshot(snapshotId)
    // snapshot.snapshot = snapshot.snapshot.replace('<img ','<img referrer_policy="no-referrer"')
    // Pass data to the page via props
    return { props: { snapshot } }
}


export default function Page({ snapshot } : {snapshot:HouseSnapshotDo }) {

    return (
        <Layout style={{}}>
            <Layout.Content style={{backgroundColor:'#FFFFFF', paddingLeft: 10, paddingRight: 10}}>
            <Typography.Title level={3}>{snapshot.dt === 0 ? `快照不存在` : `快照${snapshot.dt}` }  </Typography.Title>
                <div dangerouslySetInnerHTML={{__html: snapshot.snapshot}} suppressHydrationWarning={true}/>
            </Layout.Content>
        </Layout>

    )

}