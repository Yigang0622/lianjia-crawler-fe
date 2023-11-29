import {HouseSnapshotDo} from "@/lianjia-service/typeDef";
import {fetchHouseSnapshot} from "@/lianjia-service/LianjiaService";
import {Layout, Typography} from "antd";
import DiffMatchPatch from 'diff-match-patch';

export async function getServerSideProps(context: any) {
    const snapshotId = context.query.snapshotId || ''
    console.log('rendering snapshot page snapshotId=',snapshotId)
    const snapshot:HouseSnapshotDo = await fetchHouseSnapshot(snapshotId)
    if (snapshot.patch_ref.length > 0) {
        console.log('snapshot snapshot patch_ref',snapshot.patch_ref)
        const fullSnapshot = await fetchHouseSnapshot(snapshot.patch_ref)
        if (fullSnapshot.snapshot.length > 0) {
            const dmp = new DiffMatchPatch()
            const patches = dmp.patch_fromText(snapshot.patch_content)
            const recovered =  dmp.patch_apply(patches, fullSnapshot.snapshot)
            snapshot.snapshot = recovered[0]
        }
    }
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