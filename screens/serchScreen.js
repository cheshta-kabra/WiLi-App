import React from 'react';
import { StyleSheet, Text, View,Button , ScrollView,FlatList} from 'react-native';
import db from '../config'
import TransactionScreen from './bookTransctionScreen';

export default class SerchScreen extends React.Component{
    constructor(){
        super()
        this.state={
            allTransctions:'',
            lastVisibleTransction:null
        }
    }
    componentDidMount = async()=>{
        const transctionref=await db.collection('transctions').get()
        transctionref.docs.map((doc)=>{
            this.setState({
                allTransctions:[...this.state.allTransctions,doc.data()]
            })
        })
    }
    render(){
        return(
            /*<ScrollView>
                {this.state.allTransctions.map((transaction,index)=>{
                    return(
                        <View key={index}style={{borderBottomWidth:2}}>
                             <Text>{'Book ID'+transaction.Book_ID}</Text>
                             <Text>{'Student ID'+transaction.Student_ID}</Text>
                             <Text>{'transctionType'+transaction.transctionType}</Text>
                             <Text>{'Date'+transaction.Date.toDate()}</Text>
                        </View>
                    )
                })}
            </ScrollView>*/
            <FlatList 
            data={this.state.allTransctions}
            renderItem={({item})=>{
                <View style={{borderBottomWidth:2}}>
                <Text>{'Book ID'+item.Book_ID}</Text>
                <Text>{'Student ID'+item.Student_ID}</Text>
                <Text>{'transctionType'+item.transctionType}</Text>
                <Text>{'Date'+item.Date.toDate()}</Text>
           </View>   
            }}
            keyExtractor={
                (item,index)=>{
                    index.toString()
                }
            }
            onEndReached={this.fetchMoreTransction}
            onEndReachedThreshold={0.8}
            />
        )
    }
}