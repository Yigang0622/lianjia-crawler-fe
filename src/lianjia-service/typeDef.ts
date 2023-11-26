export interface HouseRecordDo {
    dt: number,
    houseId: string,
    title: string,
    resblockName: string,
    area: number,
    totalPrice: number,
    price: number,
    images: HouseImageDo[],
    isUnique: string,
    registerTime: string
}

export interface HouseImageDo {
    roomName: string,
    roomType: string,
    url: string
}

export interface HousePriceHistoryDo {
    dt: number,
    totalPrice: number
}

export interface HouseCompareRecordDo {
    title: string,
    houseId: string,
    resblockName: string,
    resblockId: string,
    area: number,
    totalPrice1: number,
    totalPrice2: number,
    areaPrice1: number,
    areaPrice2:number,
    areaPriceDiff: number,
    priceDiff: number,
    blockArea: string
}

export interface HouseCompareSummaryDo {
    compareResult: HouseCompareRecordDo[],
    newHouses: SimpleHouseInfoDo[],
    soldHouse: SimpleHouseInfoDo[]
}

export interface SimpleHouseInfoDo {
    title: string,
    totalPrice: number,
    areaPrice: number,
    area: number
    blockArea: string,
    resblockName: string,
    houseId: string
}

export interface HouseSnapshotDo {
    dt: number,
    houseId: string,
    snapshot: string
}