import * as React from 'react';
import { Text, View, Image, ScrollView, FlatList, TouchableHighlight } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { List, ActivityIndicator } from 'react-native-paper';
import request from '../../../redux/request'
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

var countup = (t) => (a, b) => {
  a[b[t]] = (a[b[t]] || 0) + 1;
  return a;
}

var count = (array, t) => {
  return Object.entries(array.reduce((a, b) => {
    a[b[t]] = (a[b[t]] || 0) + 1;
    return a;
  }, {})).sort((a, b) => b[1] - a[1])
}

var creatures = {
  'firepouchcreature': 'tuli',
  'waterpouchcreature': 'vesi',
  'earthpouchcreature': 'muru',
  'airpouchcreature': 'puffle',
  'mitmegupouchcreature': 'mitmegu',
  'unicorn': 'theunicorn',
  'fancyflatrob': 'coldflatrob',
  'fancy_flat_rob': 'coldflatrob',
  'fancyflatmatt': 'footyflatmatt',
  'fancy_flat_matt': 'footyflatmatt',
  'tempbouncer': 'expiring_specials_filter',
  'temp_bouncer': 'expiring_specials_filter'
}

var hostIcon = (icon) => {
  var host = icon.match(/\/([^\/\.]+?)_?(?:virtual|physical)?_?host\./)?.[1];
  if (!host) return null;
  return `https://munzee.global.ssl.fastly.net/images/pins/${creatures[host] ?? host}.png`;
}

export default function UserActivityDash({ user_id }) {
  var date = new Date(Date.now() - (5 * 60 * 60000));
  var dateString = `${date.getUTCFullYear()}-${(date.getUTCMonth() + 1).toString().padStart(2, '0')}-${(date.getUTCDate()).toString().padStart(2, '0')}`
  var dispatch = useDispatch();
  var { data } = useSelector(i => i.request_data[`user/activity?user_id=${user_id}&day=${dateString}`] ?? {})
  var { data: userdata } = useSelector(i => i.request_data[`user/details?user_id=${user_id}`] ?? {})
  useFocusEffect(
    React.useCallback(() => {
      dispatch(request.add(`user/activity?user_id=${user_id}&day=${dateString}`))
      dispatch(request.add(`user/details?user_id=${user_id}`))
      return () => {
        dispatch(request.remove(`user/activity?user_id=${user_id}&day=${dateString}`))
        dispatch(request.remove(`user/details?user_id=${user_id}`))
      };
    }, [user_id])
  );
  if (!data) return (
    <View style={{ flex: 1, alignContent: "center", backgroundColor: '#e6fcd9' }}>
      <ActivityIndicator size="large" color="#000" />
    </View>
  )
  return (
    <View style={{ flex: 1, alignItems: "stretch", flexDirection: "column", backgroundColor: "#e6fcd9", borderRadius: 8 }}>
      <View style={{ backgroundColor: "#016930", padding: 8, borderTopLeftRadius: 8, borderTopRightRadius: 8 }}>
        <Text style={{ color: "white", fontWeight: "bold", fontSize: 20 }}>{userdata?.data?.username ?? user_id}'s User Activity</Text>
      </View>
      <View key="total" style={{ flexDirection: "column", width: "100%", alignItems: "center" }}>
        <View><Text style={{ fontSize: 24, fontWeight: "bold" }}>{[...data.data.captures, ...data.data.deploys, ...data.data.captures_on].reduce((a, b) => a + Number(b.points_for_creator ?? b.points), 0)} Points</Text></View>
      </View>
      <View key="captures" style={{ flexDirection: "column", width: "100%", alignItems: "center", paddingLeft: 8, paddingRight: 8, backgroundColor: 'transparent' ?? '#aaffaa', borderRadius: 0 }}>
        <View><Text style={{ color: 'black' ?? '#004400', fontSize: 20, fontWeight: "bold" }}>{data.data.captures.length} Capture{data.data.captures.length !== 1 ? 's' : ''} - {data.data.captures.reduce((a, b) => a + Number(b.points), 0)} Points</Text></View>
        <View style={{ flexWrap: "wrap", flexDirection: "row", justifyContent: "center" }}>
          {
            count(data.data.captures, "pin").map(cap => <View key={cap[0]} style={{ padding: 2, alignItems: "center" }}>
              <Image style={{ height: 32, width: 32 }} source={{ uri: cap[0] }} />
              <Text style={{ color: 'black' ?? '#004400' }}>{cap[1]}</Text>
            </View>)
          }
        </View>
      </View>
      <View key="deploys" style={{ flexDirection: "column", width: "100%", alignItems: "center" }}>
        <View style={{ paddingLeft: 8, paddingRight: 8, backgroundColor: 'transparent' ?? '#a5fffc', borderRadius: 0 }}><Text style={{ color: 'black' ?? '#00403e', fontSize: 20, fontWeight: "bold" }}>{data.data.deploys.length} Deploy{data.data.deploys.length !== 1 ? 's' : ''} - {data.data.deploys.reduce((a, b) => a + Number(b.points), 0)} Points</Text></View>
        <View style={{ flexWrap: "wrap", flexDirection: "row", justifyContent: "center" }}>
          {
            count(data.data.deploys, "pin").map(dep => <View key={dep[0]} style={{ padding: 2, alignItems: "center" }}>
              <Image style={{ height: 32, width: 32 }} source={{ uri: dep[0] }} />
              <Text style={{ color: 'black' ?? '#00403e' }}>{dep[1]}</Text>
            </View>)
          }
        </View>
      </View>
      <View key="capons" style={{ flexDirection: "column", width: "100%", alignItems: "center" }}>
        <View style={{ paddingLeft: 8, paddingRight: 8, backgroundColor: 'transparent' ?? '#ffbcad', borderRadius: 8 }}><Text style={{ color: 'black' ?? `#401700`, fontSize: 20, fontWeight: "bold" }}>{data.data.captures_on.length} Capon{data.data.captures_on.length !== 1 ? 's' : ''} - {data.data.captures_on.reduce((a, b) => a + Number(b.points_for_creator), 0)} Points</Text></View>
        <View style={{ flexWrap: "wrap", flexDirection: "row", justifyContent: "center" }}>
          {
            count(data.data.captures_on, "pin").map(cap => <View key={cap[0]} style={{ padding: 2, alignItems: "center" }}>
              <Image style={{ height: 32, width: 32 }} source={{ uri: cap[0] }} />
              <Text style={{ color: 'black' ?? `#401700` }}>{cap[1]}</Text>
            </View>)
          }
        </View>
      </View>
    </View>
  );
}