import {NextApiRequest, NextApiResponse} from "next";
import {HouseCompareSummaryDo} from "@/lianjia-service/typeDef";
import {
    addHouseToCollection,
    compareHouseLog,
    houseLogDiff,
    removeHouseFromCollection
} from "@/lianjia-service/LianjiaService";
import {getSession, withApiAuthRequired} from "@auth0/nextjs-auth0";

interface CollectionOperationResult {
    success: boolean
}


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<CollectionOperationResult>
) {
    const operation = (req.query.operation || '') as string
    const houseId = (req.query.houseId || '') as string
    let success = false

    const session = await getSession(req, res)
    if (session?.user) {
        const user = session.user
        const sub = user.sub || ''
        const sid = user.sid || ''
        console.log(sub, sid)

        if (operation === '1') {
            success = await addHouseToCollection({
                sid, sub, houseId
            })

        } else if (operation === '2') {
            success = await removeHouseFromCollection({
                sid, sub, houseId
            })
        } else {
            success = false
        }
    }
    res.status(200).json({
        success
    })
}


