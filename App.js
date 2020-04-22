import * as React from 'react';
import { NavigationContainer, useLinking, useNavigation } from '@react-navigation/native';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Provider as ReduxProvider, useSelector, useDispatch } from 'react-redux';
import s from './redux/index'
import lang from './lang/index'
var { store, login, setCurrentRoute } = s;

// import DashScreen from './tabs/Dash';
import AllClansScreen from './tabs/AllClans';
import SettingsScreen from './tabs/Settings';
import ToolsScreen from './tabs/Tools';
import MapScreen from './tabs/Map';
import SearchScreen from './tabs/Search';

import UserActivityScreen from './pages/User/Activity';
import UserInventoryScreen from './pages/User/Inventory';

import MunzeeDetailsScreen from './pages/Munzee/Details/Page';

import { Platform, View, Text } from 'react-native';
import { IconButton, ActivityIndicator } from 'react-native-paper'
import LoadingButton from './LoadingButton';
import WebView from 'react-native-webview';
import { Linking } from 'expo';

import DrawerContent from './Drawer';
import { useDimensions } from '@react-native-community/hooks';

// const Tab = createMaterialBottomTabNavigator();
const Drawer = createDrawerNavigator();

const Stack = createStackNavigator();

function RedirectScreen() {
  var nav = useNavigation();
  var users = useSelector(i=>Object.keys(i.logins??{}));
  if(users && users[0]) nav.replace('UserActivity',{userid:Number(users[0])})
  return <Text>_redirect</Text>;
}

function AuthScreen() {
  var [auth,setAuth] = React.useState(false);
  var loggedIn = useSelector(i=>i.loggedIn);
  var dispatch = useDispatch();
  var nav = useNavigation();
  if(auth&&loggedIn) nav.replace('Home');
  function handleNavChange({url}) {
    if(url.includes('authsuccess')) {
      var x = {};
      var auth = url.match(/authsuccess\/([a-z0-9]+)\/([0-9]+)\/([^]+)/).slice(1,4);
      x[auth[1]] = {
        username: auth[2],
        code: auth[0]
      }
      setAuth(true);
      dispatch(login(x));
    }
  }
  if(Platform.OS=="web") {
    Linking.openURL('https://flame.cuppazee.uk/auth');
    return null;
  }
  if(auth) return <View style={{flex:1,alignContent:"center"}}><ActivityIndicator size="large" color="#000" /></View>
  return <WebView
    source={{ uri: 'https://flame.cuppazee.uk/auth' }}
    textZoom={200}
    style={{flex:1}}
    onNavigationStateChange={handleNavChange}
  />
}
function AuthSuccessScreen(props) {
  var [auth,setAuth] = React.useState(false);
  var loggedIn = useSelector(i=>i.loggedIn);
  var dispatch = useDispatch();
  var nav = useNavigation();
  if(auth&&loggedIn) nav.replace('Home');
  React.useEffect(()=>{
    if(!props.route?.params?.code) {
      nav.replace('Auth');
    } else {
      var authx = props.route?.params
      var x = {};
      x[authx.id] = {
        username: authx.name,
        code: authx.code
      }
      setAuth(true);
      dispatch(login(x));
    }
  },[])
  if(auth) return <View style={{flex:1,alignContent:"center"}}><ActivityIndicator size="large" color="#000" /></View>
  return <Text>...</Text>
}

function MainNav () {
  var { width } = useDimensions().window;
  const loggedIn = useSelector(i=>i.loggedIn);
  return <Stack.Navigator
    screenOptions={({ navigation, route }) => ({
      gestureEnabled: Platform.OS == 'ios',
      headerStyle: {
        backgroundColor: '#016930'
      },
      headerLeft: () => (
        width<=1000 || navigation.canGoBack()?<View style={{flexDirection:"row"}}>
          {width<=1000&&<IconButton
            onPress={() => navigation.toggleDrawer()}
            color="#fff"
            icon="menu"
          />}
          {/* {(route.name == "Home" || !loggedIn || !navigation.canGoBack()) ? null : <IconButton
            onPress={() => navigation.goBack()}
            color="#fff"
            icon="arrow-left"
          />} */}
        </View>:null
      ),
      headerRight: () => {
        return loggedIn && (
          <View style={{ flexDirection: "row" }}>
            {(route.name == "Home" || !loggedIn || !navigation.canGoBack()) ? null : <IconButton
              onPress={() => navigation.goBack()}
              color="#fff"
              icon="arrow-left"
            />}
            {/* {(route.name == "Home" || !navigation.canGoBack()) ? null : <IconButton
              onPress={() => navigation.replace('Home')}
              color="#fff"
              icon="home"
            />} */}
            <LoadingButton />
          </View>
        )
      },
      headerTintColor: '#fff',
    })}>
    {loggedIn && <>
      <Stack.Screen
        name="_redirect"
        component={RedirectScreen}
      />
      <Stack.Screen
        name="Search"
        component={SearchScreen}
      />
      <Stack.Screen
        name="Map"
        component={MapScreen}
      />
      <Stack.Screen
        name="Tools"
        component={ToolsScreen}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
      />
      <Stack.Screen
        name="AllClans"
        component={AllClansScreen}
      />
      {/* <Stack.Screen
        name="Home"
        options={{
          title: "Hello",
        }}
        // component={Tabs}
      /> */}
      <Stack.Screen
        name="UserActivity"
        options={{
          title: 'User Activity',
        }}
        component={UserActivityScreen}
      />
      <Stack.Screen
        name="UserInventory"
        options={{
          title: 'User Inventory',
        }}
        component={UserInventoryScreen}
      />
      <Stack.Screen
        name="MunzeeDetails"
        options={{
          title: 'Munzee Details',
        }}
        component={MunzeeDetailsScreen}
      />
    </>}
    <Stack.Screen
      name="Auth"
      options={{
        title: "Authenticate",
      }}
      component={AuthScreen}
    />
    <Stack.Screen
      name="AuthSuccess"
      options={{
        title: 'Authentication Successful',
      }}
      component={AuthSuccessScreen}
    />
  </Stack.Navigator>
}

function Tabs() {
  var { width } = useDimensions().window;
  return <Drawer.Navigator
    drawerStyle={{width:240}}
    drawerContent={props => <DrawerContent {...props} />}
    drawerType={width>1000?"permanent":"back"}
    initialRouteName="Home"
    barStyle={{ backgroundColor: '#016930' }}
    shifting={true}
    edgeWidth={100}
  >
    <Drawer.Screen
      name="__primary"
      component={MainNav}
    />
    {/* <Drawer.Screen
      name="Dash"
      component={DashScreen}
      options={{
        tabBarLabel: 'Home',
        tabBarIcon: ({ color }) => (
          <MaterialCommunityIcons name="home" color={color} size={24} />
        ),
      }}
    />
    <Drawer.Screen
      name="Search"
      component={SearchScreen}
      options={{
        tabBarLabel: "Search",
        tabBarIcon: ({ color }) => (
          <MaterialCommunityIcons name="magnify" color={color} size={24} />
        ),
      }}
    />
    <Drawer.Screen
      name="Map"
      component={MapScreen}
      options={{
        tabBarLabel: 'Map',
        tabBarIcon: ({ color }) => (
          <MaterialCommunityIcons name="map" color={color} size={24} />
        ),
      }}
    />
    <Drawer.Screen
      name="Tools"
      component={ToolsScreen}
      options={{
        tabBarLabel: 'Tools',
        tabBarIcon: ({ color }) => (
          <MaterialCommunityIcons name="wrench" color={color} size={24} />
        ),
      }}
    />
    <Drawer.Screen
      name="Settings"
      component={SettingsScreen}
      options={{
        tabBarLabel: "Settings",
        tabBarIcon: ({ color }) => (
          <MaterialCommunityIcons name="settings" color={color} size={24} />
        ),
      }}
    /> */}
  </Drawer.Navigator>
}

function App() {
  const loadingLogin = useSelector(i=>i.loadingLogin);
  const ref = React.useRef();
  const dispatch = useDispatch();

  const { getInitialState } = useLinking(ref, {
    prefixes: ['https://paper.cuppazee.uk', 'cuppazee://'],
    config: {
      __primary: '',
      Home: 'Home',
      UserActivity: {
        path: 'User/:userid/Activity',
        parse: {
          userid: Number
        }
      },
      MunzeeDetails: 'Munzee/:url',
      AuthSuccess: 'authsuccess/:code/:id/:name'
    },
  });
  var [isReady, setIsReady] = React.useState(false);
  var [initialState, setInitialState] = React.useState();

  React.useEffect(() => {
    Promise.race([
      getInitialState(),
      new Promise(resolve =>
        setTimeout(resolve, 150)
      )
    ])
      .catch(e => {
        console.error(e);
      })
      .then(state => {
        if (state !== undefined) {
          console.log(state);
          dispatch(setCurrentRoute(state?.routes?.[0]??{}))
          setInitialState(state);
        }

        setIsReady(true);
      });
  }, [getInitialState]);

  function handleStateChange(a,b,c) {
    dispatch(setCurrentRoute(a?.routes?.[0]?.state?.routes?.[0]??{}))
  }

  if (loadingLogin) {
    return <Text>Loading...</Text>;
  }
  if (!isReady) {
    return null;
  }
  return (
    <NavigationContainer onStateChange={handleStateChange} initialState={initialState} ref={ref}>
      <Tabs/>
    </NavigationContainer>
  );
}

export default function () {
  return <ReduxProvider store={store}>
    <App />
  </ReduxProvider>
}