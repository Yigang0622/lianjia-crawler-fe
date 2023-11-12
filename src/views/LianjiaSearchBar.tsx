import React from "react";
import {AutoComplete, Col, Image, Input, Row, Space, Typography} from "antd";
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
                           <div style={{height:100}}>
                               <Row>
                                   <Col span={8}>
                                       <Image src={x.images.length > 0 ? x.images[0].url : ''} alt={''} width={'100%'} referrerPolicy="no-referrer"/>
                                   </Col>
                                   <Col span={16}>
                                       <Space direction={"vertical"}>
                                           <Typography.Text>{`${x.resblockName} ${x.totalPrice}万 ${x.area}平`}</Typography.Text>

                                           <Typography.Text type={'secondary'}>{x.title}</Typography.Text>

                                       </Space>
                                   </Col>
                               </Row>
                                <div style={{height:1, backgroundColor:'#000000', opacity:0.1}}></div>

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
           if (this.props.onSearch) {
               this.props.onSearch(value)
           }
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