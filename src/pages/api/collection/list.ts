import {NextApiRequest, NextApiResponse} from "next";
import {
    queryHouseCollectionList, queryHouseRecordsByHouseIds
} from "@/lianjia-service/LianjiaService";
import {getSession} from "@auth0/nextjs-auth0";
import {HouseRecordDo, UserHouseCollectionDo} from "@/lianjia-service/typeDef";


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<UserHouseCollectionDo[]>
) {
    let success = false

    const session = await getSession(req, res)
    if (session?.user) {
        const houseIds = await queryHouseCollectionList({sub: session.user.sub})
        console.log(houseIds)
        console.log('calling queryHouseRecordsByHouseIds')

        const houseCollectionMap = new Map<string, UserHouseCollectionDo>()

        const houseRecords = await queryHouseRecordsByHouseIds(houseIds)

        houseRecords.forEach(x => {
            const houseId = x.houseId
            if (houseCollectionMap.has(houseId)) {
                // @ts-ignore
                houseCollectionMap.get(houseId).priceHistory.push({
                    dt: x.dt, price: x.totalPrice
                })
            } else {
                const houseCollectionDo: UserHouseCollectionDo = {
                    houseId: houseId,
                    houseInfo: x,
                    priceHistory: [{
                        dt: x.dt,
                        price: x.totalPrice
                    }]
                }
                houseCollectionMap.set(houseId, houseCollectionDo)
            }
        })

        const result: UserHouseCollectionDo[] = []
        houseCollectionMap.forEach(x => {
            result.push(x)
        })
        console.log(houseCollectionMap)
        res.status(200).json(result)
    }
    res.status(200).json([])
}


