import React from 'react';
import { StyleSheet, Text, View,TouchableOpacity , Image} from 'react-native';
import {BarCodeScanner} from 'expo-barcode-scanner'
import * as Permissions from 'expo-permissions'
import { TextInput } from 'react-native-gesture-handler';

export default class BookTransctionScreen extends React.Component{
    constructor(){
        super();
        this.state={
            hasCameraPermissions:null,
            scaned:false,
           ScannedBookID:'',
           ScannedStudentID:'',
            buttonState : 'normal'
        }
    }
    getCameraPermissions = async(id)=>{
        const {status} = await Permissions.askAsync(Permissions.CAMERA)
        this.setState({
            hasCameraPermissions: status==='granted',buttonState:id,scaned:false
        })
    }
    handelBarcodeScaned=async({type,data}) =>{
        const {buttonState}=this.state
        if(buttonState === 'bookID'){
            this.setState({
                scaned:true,
                ScannedBookID:data,
                buttonState:'normal'
            })
        }
        else if (buttonState === 'studentID'){
            this.setState({
                scaned:true,
                ScannedStudentID:data,
                buttonState:'normal'
            })
        }
      
    }
    render(){
        const hasCameraPermissions = this.state.hasCameraPermissions
        const scaned = this.state.scaned
        const buttonState = this.state.buttonState
        if(buttonState !== 'normal' && hasCameraPermissions){
            return(
                <BarCodeScanner
                onBarCodeScanned = {scaned? undefined : this.handelBarcodeScaned}
                />
            )
        }
        else if(buttonState === 'normal'){
            return(
                <View style={styles.container}>
                    <View>
                        <Image source={require('../assets/booklogo.jpg')} style={{width:200,height:200}}/>
                        <Text style={{textAlign:"center",fontSize:30}}>WILI</Text>
                    </View>
                    <View style={styles.inputView}>
                        <TextInput style={styles.inputBox} placeholder="Book ID" value={this.state.ScannedBookID} />
                        <TouchableOpacity style={styles.scanButton} onPress={()=>{this.getCameraPermissions('BookId')}} >
                            <Text style={styles.buttonText}> Scan </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputView}>
                        <TextInput style={styles.inputBox} placeholder="Student ID" value={this.state.ScannedStudentID} />
                        <TouchableOpacity style={styles.scanButton} onPress={()=>{this.getCameraPermissions('StudentId')}} >
                            <Text style={styles.buttonText}> Scan </Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.scanButton}
                    onPress = {this.handelTransction}>
                        <Text style={styles.buttonText}>SUMBIT</Text>
                        </TouchableOpacity>
                </View>
            )
        }
        
    }
}
const styles = StyleSheet.create({ 
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
     displayText:{ fontSize: 15, textDecorationLine: 'underline' }, 
     scanButton:{ backgroundColor: '#2196F3', padding: 10, margin: 10 }, 
     buttonText:{ fontSize: 20, },
     inputView:{ flexDirection: 'row', margin: 20 }, 
     inputBox:{ width: 200, height: 40, borderWidth: 1.5, borderRightWidth: 0, fontSize: 20 },
     });