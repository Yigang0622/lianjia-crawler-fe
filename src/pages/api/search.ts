// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import {queryHouseListByKeyWord} from "@/lianjia-service/LianjiaService";
import {HouseRecordDo} from "@/lianjia-service/typeDef";

type Data = {
  name: string
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<HouseRecordDo[]>
) {
  const keyword = (req.query.keyword || '') as string
  const result = await queryHouseListByKeyWord(keyword, 10)

  res.status(200).json(result)
}
