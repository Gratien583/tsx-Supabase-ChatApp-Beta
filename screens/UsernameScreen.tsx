import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// ナビゲーションスタックのパラメータの型を定義
type RootStackParamList = {
  Username: undefined;
  ChatRoom: { username: string };
};

// UsernameScreen用のナビゲーションプロップの型を定義
type UsernameScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Username'>;

export default function UsernameScreen() {
  const [username, setUsername] = useState('');
  const navigation = useNavigation<UsernameScreenNavigationProp>();

  useEffect(() => {
    // 保存されたユーザー名を取得し、あればチャットルームに遷移
    const checkStoredUsername = async () => {
      const storedUsername = await AsyncStorage.getItem('username');
      if (storedUsername) {
        navigation.navigate('ChatRoom', { username: storedUsername });
      }
    };

    checkStoredUsername();
  }, [navigation]);

  // チャットに参加するためのハンドラー
  const handleJoinChat = async () => {
    if (username.trim()) {
      await AsyncStorage.setItem('username', username);
      navigation.navigate('ChatRoom', { username });
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="ユーザー名を入力"
        value={username}
        onChangeText={setUsername}
      />
      <Button title="チャットルームに参加" onPress={handleJoinChat} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
});
