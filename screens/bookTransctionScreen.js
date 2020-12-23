import React from 'react';
import { Text,
   View,
   TouchableOpacity,
   TextInput,
   Image,
   StyleSheet,
  KeyboardAvoidingView ,
ToastAndroid,Alert, TouchableHighlightBase} from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as firebase from 'firebase'
import db from '../config.js'

export default class TransactionScreen extends React.Component {
    constructor(){
      super();
      this.state = {
        hasCameraPermissions: null,
        scanned: false,
        scannedBookId: '',
        scannedStudentId:'',
        buttonState: 'normal',
        transactionMessage: ''
      }
    }
    checkBookEligibility = async()=>{
      const bookref = await db.collection('books').where('Book_ID','===',this.state.scannedBookId).get()
      var transactionType=''
      if(bookref.docs.length===0){
        transactionType=false
      }
      else{
        bookref.docs.map((doc)=>{
          var book=doc.data()
          if(book.bookAvailability){
            transactionType='Issused'
          }
          else{
            transactionType='return'
          }
        })
      }
      return transactionType
    }
    checkStudentEligibilityForIssue = async()=>{
      const studentref=await db.collection('Students').where('Student_ID','===',this.state.scannedStudentId).get()
      var isStudentEligilible=''
      if(studentref.docs.lenght===0){
        this.setState({
          scannedStudentId:'',
          scannedBookId:''
        })
        isStudentEligilible=false
        Alert.alert("This Student Does NOt Exists")
      }
      else{
        studentref.docs.map((doc)=>{
          var student=doc.data()
          if(student.Numbers_of_books_issued<2){
            isStudentEligilible=true
          }
          else{
            isStudentEligilible=false
            Alert.alert("The Student Hass Already Taken 2 Books")
            this.setState({
              scannedStudentId:'',
              scannedBookId:''
            })
          }
        })
      }
      return isStudentEligilible 
    }
    checkStudentEligibilityForReturn = async()=>{
      const transactionref=await db.collection('transctions').where('Book_ID','===',this.state.scannedBookId).limit(1).get()
      var isStudentEligilible=''
      transactionref.docs.map((doc)=>{
        var lastBookTransction=doc.data()
        if(lastBookTransction.Student_ID===this.state.scannedStudentId){
          isStudentEligilible=true
        }
        else{
          isStudentEligilible=false
          Alert.alert('This Book Was Not Issued By This Student')
          this.setState({
            scannedBookId:'',
            scannedStudentId:''
          })
        }
      })
      return isStudentEligilible
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

    initiateBookIssue = async()=>{
      //add a transaction
      db.collection("transactions").add({
        'studentId': this.state.scannedStudentId,
        'bookId' : this.state.scannedBookId,
        'date' : firebase.firestore.Timestamp.now().toDate(),
        'transactionType': "Issue"
      })
      //change book status
      db.collection("books").doc(this.state.scannedBookId).update({
        'bookAvailability': false
      })
      //change number  of issued books for student
      db.collection("students").doc(this.state.scannedStudentId).update({
        'numberOfBooksIssued': firebase.firestore.FieldValue.increment(1)
      })
    }

    initiateBookReturn = async()=>{
      //add a transaction
      db.collection("transactions").add({
        'studentId': this.state.scannedStudentId,
        'bookId' : this.state.scannedBookId,
        'date' : firebase.firestore.Timestamp.now().toDate(),
        'transactionType': "Return"
      })
      //change book status
      db.collection("books").doc(this.state.scannedBookId).update({
        'bookAvailability': true
      })
      //change number  of issued books for student
      db.collection("students").doc(this.state.scannedStudentId).update({
        'numberOfBooksIssued': firebase.firestore.FieldValue.increment(-1)
      })
    }


    handleTransaction = async()=>{
      var transactionMessage
      var transactionType=await this.checkBookEligibility()
      if(!transactionType){
        Alert.alert("this book dosen't exit in the library")
        this.setState({
          scannedStudentId:'',
          scannedBookId:''
        })
      }
      else if(transactionType==="Issused"){
        var isStudentEligilible= await this.checkStudentEligibilityForIssue()
        if(isStudentEligilible){
          this.initiateBookIssue()
          Alert.alert("Book Issued ton the Student")
        }
      }
      else{
        var isStudentEligilible = await this.checkStudentEligibilityForReturn()
        if(isStudentEligilible){
          Alert.alert("Book Retured By The Student")
        }
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
          <KeyboardAvoidingView  style={styles.container} behavior="padding" enabled>
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
              onChangeText={text =>this.setState({scannedBookId:text})}
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
              onChangeText ={text => this.setState({scannedStudentId:text})}
              value={this.state.scannedStudentId}/>
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={()=>{
                this.getCameraPermissions("StudentId")
              }}>
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={async()=>{
                var transactionMessage = this.handleTransaction();
                this.setState(
                  {scannedBookId:'',
                   scannedStudentId:''})
              }}>
          <Text style={styles.submitButtonText}>Submit</Text>
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
    submitButton:{
      backgroundColor: '#FBC02D',
      width: 100,
      height:50
    },
    submitButtonText:{
      padding: 10,
      textAlign: 'center',
      fontSize: 20,
      fontWeight:"bold",
      color: 'white'
    }
  });