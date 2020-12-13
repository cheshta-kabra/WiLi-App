import React from 'react';
import { Text, View, TouchableOpacity, TextInput, Image, StyleSheet, Alert,KeyboardAvoidingView , ToastAndroid} from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as firebase from 'firebase';
import db from '../config';

export default class TransactionScreen extends React.Component {
    constructor(){
      super();
      this.state = {
        hasCameraPermissions: null,
        scanned: false,
        scannedBookId: '',
        scannedStudentId:'',
        buttonState: 'normal',
        transctionMessage:''
      }
    }

    getCameraPermissions = async (id) =>{
      const {status} = await Permissions.askAsync(Permissions.CAMERA);
      
      this.setState({
        /*status === "granted" is true when user has granted permission
          status === "granted" is false when user has not granted the permission
        */
        hasCameraPermissions: status === "granted",
        buttonState: id,
        scanned: false
      });
    }
    handelTransction = async()=>{
        var transctionMessage 
        db.collection('books').doc(this.state.scannedBookId).get()
        .then((doc)=>{
            var book = doc.data()
            if(book.Book_Availablity){
                this.initiateBookIssue()
                transctionMessage='Book Issued'
            }
            else {
                this.initiateBookReturn()
                transctionMessage='Book Returned' 
            }
        })
        this.setState({transctionMessage:transctionMessage})
    }

    initiateBookIssue = async()=>{
        db.collection('transctions').add({
            Student_ID: this.state.scannedStudentId,
            Book_ID: this.state.scannedBookId,
            Date:firebase.firestore.Timestamp.now().toDate(),
            transctionType: 'Issued'
        })
        db.collection('books').doc(this.state.scannedBookId).update({
            Book_Availablity:false
        })
        db.collection('Students').doc(this.state.scannedStudentId).update({
            Numbers_of_books_issued:firebase.firestore.FieldValue.increment(1)
        })
        //Alert.alert('Book Issued')
        ToastAndroid.show('Book Issued',ToastAndroid.SHORT)
        this.setState({scannedBookId:'',scannedStudentId:''})
    }

    initiateBookReturn = async()=>{
        db.collection('transctions').add({
            Student_ID: this.state.scannedStudentId,
            Book_ID: this.state.scannedBookId,
            Date:firebase.firestore.Timestamp.now().toDate(),
            transctionType: 'Returned'
        })
        db.collection('books').doc(this.state.scannedBookId).update({
            Book_Availablity:true
        })
        db.collection('Students').doc(this.state.scannedStudentId).update({
            Numbers_of_books_issued:firebase.firestore.FieldValue.increment(-1)
        })
       // Alert.alert('Book Returned')
       ToastAndroid.show('Book Returned',ToastAndroid.SHORT)
        this.setState({scannedBookId:'',scannedStudentId:''})
    }

    handleBarCodeScanned = async({type, data})=>{
      const {buttonState} = this.state

      if(buttonState==="BookId"){
        this.setState({
          scanned: true,
          scannedBookId: data,
          buttonState: 'normal'
        });
      }
      else if(buttonState==="StudentId"){
        this.setState({
          scanned: true,
          scannedStudentId: data,
          buttonState: 'normal'
        });
      }
      
    }

    render() {
      const hasCameraPermissions = this.state.hasCameraPermissions;
      const scanned = this.state.scanned;
      const buttonState = this.state.buttonState;

      if (buttonState !== "normal" && hasCameraPermissions){
        return(
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
        );
      }

      else if (buttonState === "normal"){
        return(
          <KeyboardAvoidingView style={styles.container} behavior='padding' enabled>
            <View>
              <Image
                source={require("../assets/booklogo.jpg")}
                style={{width:200, height: 200}}/>
              <Text style={{textAlign: 'center', fontSize: 30}}>Wily</Text>
            </View>
            <View style={styles.inputView}>
            <TextInput 
              style={styles.inputBox}
              placeholder="Book Id"
              onChangeText={(text)=>{this.setState({
                scannedBookId:text
              })}}
              value={this.state.scannedBookId}/>
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={()=>{
                this.getCameraPermissions("BookId")
              }}>
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
            </View>
            <View style={styles.inputView}>
            <TextInput 
              style={styles.inputBox}
              placeholder="Student Id"
              onChangeText={(text)=>{this.setState({
                scannedStudentId:text
              })}}
              value={this.state.scannedStudentId}/>
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={()=>{
                this.getCameraPermissions("StudentId")
              }}>
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.sumbitButton} 
            onPress={async()=>{var transctionMessage=this.handelTransction();
            //this.setState({scannedBookId:'',scannedStudentId:''})
          }}
              > 
            <Text>
                Sumbit
                </Text>
                </TouchableOpacity>
          </KeyboardAvoidingView>
        );
      }
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    displayText:{
      fontSize: 15,
      textDecorationLine: 'underline'
    },
    scanButton:{
      backgroundColor: '#2196F3',
      padding: 10,
      margin: 10
    },
    buttonText:{
      fontSize: 15,
      textAlign: 'center',
      marginTop: 10
    },
    inputView:{
      flexDirection: 'row',
      margin: 20
    },
    inputBox:{
      width: 200,
      height: 40,
      borderWidth: 1.5,
      borderRightWidth: 0,
      fontSize: 20
    },
    scanButton:{
      backgroundColor: '#66BB6A',
      width: 50,
      borderWidth: 1.5,
      borderLeftWidth: 0
    },
    sumbitButton:{
        padding: 10, 
        textAlign: 'center', 
        fontSize: 20,
        fontWeight:"bold",
        color: 'white'
    }
  });
