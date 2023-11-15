// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import {compareHouseLog, queryHouseListByKeyWord} from "@/lianjia-service/LianjiaService";
import {HouseCompareSummaryDo, HouseRecordDo} from "@/lianjia-service/typeDef";

type Data = {
    name: string
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<HouseCompareSummaryDo>
) {
    const dt1 = (req.query.dt1 || '') as string
    const dt2 = (req.query.dt2 || '') as string
    const houseCompareRecordDos = await compareHouseLog(dt1, dt2)
    res.status(200).json({
        compareResult:houseCompareRecordDos,
        newHouses: [],
        soldHouse: []
    })
}
