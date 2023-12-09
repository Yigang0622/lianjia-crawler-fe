import {DataTypes, Model, Op, Sequelize} from "sequelize";
import {
    HouseCompareRecordDo,
    HouseImageDo,
    HousePriceHistoryDo,
    HouseRecordDo, HouseSnapshotDo,
    SimpleHouseInfoDo
} from "@/lianjia-service/typeDef";
import mysql2 from "mysql2"

console.log('initializing sequelize ' + process.env.DB_HOST + ' ' + process.env.DB_PORT + ' ' + process.env.DB_USER + ' ' + process.env.DB_PASSWORD)

const sequelize =  new Sequelize('lianjia',
    process.env.DB_USER || '',
    process.env.DB_PASSWORD || '',
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        port: parseInt(process.env.DB_PORT || '3306', 10),
        dialectModule: mysql2,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    })


class LianjiaHouseRecord extends Model {}

LianjiaHouseRecord.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        dt: {
            type: DataTypes.INTEGER
        },
        house_id: {
            type: DataTypes.STRING
        },
        resblock_name: {
            type: DataTypes.STRING
        },
        title: {
            type: DataTypes.STRING
        },
        area: {
            type: DataTypes.DOUBLE
        },
        total_price: {
            type: DataTypes.DOUBLE
        },
        price: {
            type: DataTypes.DOUBLE
        },
        images: {
            type: DataTypes.STRING
        },
        is_unique: {
            type: DataTypes.STRING
        },
        register_time: {
            type: DataTypes.STRING
        }
    }, {
        sequelize,
        modelName: 'LianjiaHouseRecord',
        tableName: 'house_log',
        timestamps: false
    }

)
sequelize.authenticate().then(() => {
    console.log('Connection has been established successfully.');
}).catch((error) => {
    console.error('Unable to connect to the database: ', error);
});

export const queryHouseListByKeyWord = async (word: string, limit: number): Promise<HouseRecordDo[]> => {
    const latestDt = await fetchLatestHouseLogDate()
    const queryResult: LianjiaHouseRecord[] = await LianjiaHouseRecord.findAll({
        limit: limit > 0 ? limit : 9999,
        where: {
            dt: latestDt,
            [Op.or]: [
                { title: { [Op.like]: `%${word}%` } },
                { resblock_name: { [Op.like]: `%${word}%` } },
                { house_id: { [Op.like]: `%${word}%` } }
            ]
        }
    })

    return queryResult.map((x) => {
       return convertHouseDo(x)
    })
}

export const queryHouseRecordsByHouseIds = async (houseIds: string[]): Promise<HouseRecordDo[]> => {
    const queryResult: LianjiaHouseRecord[] = await LianjiaHouseRecord.findAll({
        where: {
            house_id: { [Op.in]: houseIds }
        },
        order: [
            ['dt', 'ASC']
        ]
    })
    return queryResult.map((x) => {
        return convertHouseDo(x)
    })
}

export const queryHouseHistoryPrice = async (houseId: string): Promise<HousePriceHistoryDo[]> => {
    const queryResult: LianjiaHouseRecord[] = await LianjiaHouseRecord.findAll({
        where: {
            house_id: houseId
        },
        order: [
            ['dt', 'DESC']
        ]
    })

    const result: HousePriceHistoryDo[] = queryResult.map(x => {
        return {
            dt: x.dataValues.dt,
            totalPrice: x.dataValues.total_price
        }
    })
    return result
}

export const queryHouseInfoById = async (houseId: string): Promise<HouseRecordDo> => {
    const queryResult: LianjiaHouseRecord[] = await LianjiaHouseRecord.findAll({
        limit: 1,
        where: {
            house_id: houseId
        }
    })
    return convertHouseDo(queryResult[0])
}

export const fetchLatestHouseLogDate = async (): Promise<number> => {
    const [results, metadata]= await sequelize.query('SELECT dt FROM house_log group by dt order by dt desc limit 1') as [any[], any]
    return results[0].dt
}

export const fetchHouseSnapshot = async (snapshotId: string):Promise<HouseSnapshotDo> => {

    const [rows, _] = await sequelize.query(`SELECT dt, house_id, snapshot, patch_ref, patch_content FROM house_snapshot A WHERE A.snapshot_identifier = '${snapshotId}'`)
    const result: HouseSnapshotDo[] = rows.map((x: any) => {
        return {
            dt: x.dt,
            houseId: x.house_id,
            snapshot: x.snapshot,
            patch_ref: x.patch_ref,
            patch_content: x.patch_content ? x.patch_content : ''
        }
    })
    if (result.length > 0) {
        return result[0]
    } else {
        return {
            dt: 0,
            houseId: '',
            snapshot: '',
            patch_content: '',
            patch_ref: ''
        }
    }
}

export const compareHouseLog = async (dt1: string, dt2: string) => {
    const sql = `
    SELECT A.title                       as \`title\`,
       A.house_id                    as \`house_id\`,
       A.resblock_name               as \`resblock_name\`,
       A.resblock_id                 as \`resblock_id\`,
       A.total_price                 as \`total_price_1\`,
       B.total_price                 as \`total_price_2\`,
       A.price                       as \`area_price_1\`,
       B.price                       as \`area_price_2\`,
       A.area                        as \`area\`,
       B.price - A.price             as \`area_price_diff\`,
       B.total_price - A.total_price as \`price_diff\`,
       A.block_area                 as \`block_area\`
    FROM lianjia.house_log A
    left join lianjia.house_log B
    on A.house_id = B.house_id
    WHERE A.dt = ${dt1}
      and B.dt = ${dt2}
    ORDER by \`price_diff\`;
    `
    const [rows, metadata] = await sequelize.query(sql)
    const result:HouseCompareRecordDo[] = rows.map((x: any) => {
        return {
            title: x.title,
            houseId: x.house_id,
            resblockName: x.resblock_name,
            resblockId: x.resblock_id,
            totalPrice1: Number(x.total_price_1),
            totalPrice2: Number(x.total_price_2),
            areaPrice1: Number(x.area_price_1),
            areaPrice2: Number(x.area_price_2),
            area: Number(x.area),
            areaPriceDiff: Number(x.area_price_diff),
            priceDiff: Number(x.price_diff),
            blockArea: x.block_area
        }
    })
    return result
}

export const houseLogDiff = async (inDt: string, notInDt: string): Promise<SimpleHouseInfoDo[]> => {
    const sql = `
       select
            title,
            total_price,
            price,
            area,
            resblock_name,
            house_id,
            block_area
            from house_log where dt = ${inDt}
        and house_id not in (
            select house_id from house_log where dt = ${notInDt}
        )
    `
    const [rows, metadata] = await sequelize.query(sql)
    return rows.map((x: any) => {
        return {
            title: x.title,
            houseId: x.house_id,
            resblockName: x.resblock_name,
            totalPrice: Number(x.total_price),
            areaPrice: Number(x.price),
            area: Number(x.area),
            blockArea: x.block_area
        }
    })

}


// collection
export const addHouseToCollection = async (params: {
    sid: string,
    sub: string,
    houseId: string
}): Promise<boolean> => {
    const time = Date.now()
    const sql = `
        REPLACE INTO user_house_collection(sid,sub,house_id,time) VALUES (\'${params.sid}\', \'${params.sub}\', \'${params.houseId}\', ${time}); 
    `
    await sequelize.query(sql)
    return true
}

export const removeHouseFromCollection = async (params: {
    sid: string,
    sub: string,
    houseId: string
}): Promise<boolean> => {
    const sql = `
    DELETE from user_house_collection WHERE sid = \'${params.sid}\' and sub = \'${params.sub}\' and house_id =  \'${params.houseId}\'
    `
    await sequelize.query(sql)
    return true
}

export const checkHouseCollectionStatus = async (params: {
    sid: string,
    sub: string,
    houseId: string
}): Promise<boolean> => {
    const sql = `
    SELECT 1 from user_house_collection WHERE sid = \'${params.sid}\' and sub = \'${params.sub}\' and house_id =  \'${params.houseId}\'
    `
    const [rows, _] = await sequelize.query(sql)
    return rows.length > 0
}

export const queryHouseCollectionList = async (params: {
    sub: string
}): Promise<string[]> => {
    const sql = `
    SELECT house_id from user_house_collection WHERE sub = \'${params.sub}\'
    `
    const [rows, _] = await sequelize.query(sql)
    return rows.map((x: any) => x.house_id)
}

const convertHouseDo = (x: LianjiaHouseRecord) => {
    return {
        dt: x.dataValues.dt,
        houseId: x.dataValues.house_id,
        resblockName: x.dataValues.resblock_name,
        title: x.dataValues.title,
        totalPrice: x.dataValues.total_price,
        price: x.dataValues.price,
        area: x.dataValues.area,
        images: extractHouseImages(x.dataValues.images),
        isUnique: x.dataValues.is_unique,
        registerTime: x.dataValues.register_time
    }
}

const extractHouseImages = (images: string) => {
    const objArr: any[] = JSON.parse(images)
    const imageArr: HouseImageDo[] = objArr.map(x => {
        return {
            roomName: x.roomName || '',
            roomType: x.type || '',
            url: x.url || ''
        }
    })

    // 户型图放首张
    imageArr.sort((a, b) => {
        if (a.roomType === '户型图') {
            return -1
        } else {
            return 1
        }
    })

    return imageArr

}