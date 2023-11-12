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