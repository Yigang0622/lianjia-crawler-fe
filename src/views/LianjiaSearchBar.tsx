import React from "react";
import {AutoComplete, Input} from "antd";
import "lodash"
import { debounce } from "lodash";
import axios from "axios";
import {HouseRecordDo} from "@/lianjia-service/typeDef";
export class LianjiaSearchBar extends React.Component<any , any> {

    constructor(props: any) {
        super(props);
        this.state = {
            searchOptions: []
        }
    }

    componentDidMount() {

    }

    timerId: any

   render():any {

       const handleSearch = async (value: string) => {

           clearTimeout(this.timerId)

           this.timerId = setTimeout(async () => {
               const response = await axios.get('/api/search', {
                   params: {
                       keyword: value
                   }
               })
               const houseList:HouseRecordDo[] =  response.data

               console.log(houseList)
               const searchOptions = houseList.map(x => {
                   return {
                       category: x.houseId,
                       label: (
                           <div>
                               <h4>{`${x.resblockName} ${x.totalPrice}万 ${x.area}平`}</h4>
                               <p>{x.title}</p>

                           </div>
                       )
                   }
               })

               this.setState({ searchOptions })

           }, 500)
           console.log(111)



       };

       const onSelect = (value: string) => {
           console.log('onSelect', value);
       };

       const onSearchClick = (value: string) => {
           alert(value)
       }



       return (
           <AutoComplete
               style={{ width: '100%' }}
               options={this.state.searchOptions}
               onSelect={onSelect}
               onSearch={handleSearch}
               size="large"
           >

               <Input.Search size="large" placeholder="房源Id/小区名字/房源标题..." enterButton onSearch={onSearchClick}/>
           </AutoComplete>
       )
   }



}