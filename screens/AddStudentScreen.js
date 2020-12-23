import React from 'react';
import { Text, View, TouchableOpacity, TextInput, Image, StyleSheet, Alert,KeyboardAvoidingView , ToastAndroid} from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as firebase from 'firebase';
import db from '../config';

export default class AddStudentScreen extends React.Component {
    constructor(){
      super();
      this.state = {
        
        studentId:'',
        
      }
    }

    

    addStudent = async()=>{
        db.collection('Students').add({
            Numbers_of_books_issued: 0,
            student_id:this.state.studentId
        })
        
        Alert.alert('Student added')
        //ToastAndroid.show('Book Issued',ToastAndroid.SHORT)
        this.setState({scannedBookId:'',scannedStudentId:''})
    }

    

    

    render() {
      
        return(
          <KeyboardAvoidingView style={styles.container} behavior='padding' enabled>
            <View>
              <Image
                source={require("../assets/icon.png")}
                style={{width:200, height: 200}}/>
              <Text style={{textAlign: 'center', fontSize: 30}}>Add student</Text>
            </View>
            <View style={styles.inputView}>
            <TextInput 
              style={styles.inputBox}
              placeholder="Enter Student ID"
              onChangeText={(text)=>{this.setState({
                studentId:text
              })}}
              value={this.state.studentId}/>

            <TouchableOpacity 
              style={styles.scanButton}
              onPress={this.addStudent}>
              <Text style={styles.buttonText}>Add Student</Text>
            </TouchableOpacity>
            </View>
            
            
          </KeyboardAvoidingView>
        );
      
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