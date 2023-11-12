import {DataTypes, Model, Op, Sequelize} from "sequelize";
import {HouseImageDo, HousePriceHistoryDo, HouseRecordDo} from "@/lianjia-service/typeDef";
import mysql2 from "mysql2"

console.log('initializing sequelize ' + process.env.DB_HOST + ' ' + process.env.DB_PORT)

const sequelize =  new Sequelize('lianjia',
    process.env.DB_USER || '',
    process.env.DB_PASSWORD || '',
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        port: parseInt(process.env.DB_PORT || '3306', 10),
        dialectModule: mysql2
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