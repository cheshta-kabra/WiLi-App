import React from 'react';
import {Image} from 'react-native'
import BookTransctionScreen from './screens/bookTransctionScreen'
import SearchScreen from './screens/serchScreen'
import AddStudentScreen from './screens/AddStudentScreen'
import {createAppContainer} from 'react-navigation'
import {createBottomTabNavigator} from 'react-navigation-tabs'
export default class App extends React.Component{
  render(){
    return (
      <AppContainer />
    );
  }
}
const TabNavigator = createBottomTabNavigator({
  BookTransctionScreen:{screen:BookTransctionScreen,
  navigationOptions : {
    tabBarIcon:<Image source={require('./assets/book.png')} style={{width:40,height:40}} />,
    tabBarLabel:'BookTransction'
  }},
  AddStudentScreen:{screen:AddStudentScreen,
    navigationOptions : {
      tabBarIcon:<Image source={require('./assets/icon.png')} style={{width:40,height:40}} />,
      tabBarLabel:'Add Student'
    }},
  SearchScreen:{screen:SearchScreen ,
    navigationOptions : {
      tabBarIcon:<Image source={require('./assets/searchingbook.png')} style={{width:40,height:40}} />,
      tabBarLabel:'Search'}
    }
})
const AppContainer = createAppContainer(TabNavigator)