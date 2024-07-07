import 'react-native-gesture-handler';
import * as React from 'react';
import { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import UsernameScreen from './screens/UsernameScreen';
import ChatRoomScreen from './screens/ChatRoomScreen';

// ナビゲーションスタックのパラメータの型を定義
type RootStackParamList = {
  Username: undefined;
  ChatRoom: { username: string };
};

// スタックナビゲーターを作成
const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  // 初期ルートの状態を設定
  const [initialRoute, setInitialRoute] = React.useState<'Username' | 'ChatRoom'>('Username');

  useEffect(() => {
    // 保存されたユーザー名を確認し、あれば初期ルートをChatRoomに設定
    const checkStoredUsername = async () => {
      const storedUsername = await AsyncStorage.getItem('username');
      if (storedUsername) {
        setInitialRoute('ChatRoom');
      }
    };

    checkStoredUsername();
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={initialRoute}>
          {/* UsernameScreenコンポーネントをナビゲーターに追加 */}
          <Stack.Screen name="Username" component={UsernameScreen} options={{ title: 'ユーザー名の設定' }}/>
          {/* ChatRoomScreenコンポーネントをナビゲーターに追加 */}
          <Stack.Screen
            name="ChatRoom"
            component={ChatRoomScreen}
            options={{ headerShown: false }} // ヘッダーを非表示に設定
            initialParams={{ username: '' }} // 初期パラメータを設定
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
