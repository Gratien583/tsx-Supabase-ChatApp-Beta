import React, { useEffect, useState } from "react";
import { View, TextInput, Button, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage"; // ローカルストレージ用
import { useNavigation } from "@react-navigation/native"; // 画面遷移用
import { StackNavigationProp } from "@react-navigation/stack";

// ナビゲーションスタックで使う画面とパラメータの型を定義
type RootStackParamList = {
  Username: undefined; // ユーザー名入力画面（パラメータなし）
  ChatRoom: { username: string }; // チャットルーム画面（ユーザー名を渡す）
};

// UsernameScreen用のナビゲーションの型を指定
type UsernameScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Username"
>;

export default function UsernameScreen() {
  const [username, setUsername] = useState(""); // ユーザー名の状態管理
  const navigation = useNavigation<UsernameScreenNavigationProp>(); // ナビゲーションのフックを取得

  useEffect(() => {
    // アプリ起動時に、保存されたユーザー名があるか確認
    const checkStoredUsername = async () => {
      const storedUsername = await AsyncStorage.getItem("username");

      // 既に保存されていればチャット画面に自動で遷移
      if (storedUsername) {
        navigation.navigate("ChatRoom", { username: storedUsername });
      }
    };

    checkStoredUsername(); // 初回チェック
  }, [navigation]);

  // 「チャットルームに参加」ボタンが押されたときの処理
  const handleJoinChat = async () => {
    if (username.trim()) {
      // 空文字を防止したうえで、ローカルに保存して画面遷移
      await AsyncStorage.setItem("username", username);
      navigation.navigate("ChatRoom", { username });
    }
  };

  return (
    <View style={styles.container}>
      {/* ユーザー名入力欄 */}
      <TextInput
        style={styles.input}
        placeholder="ユーザー名を入力"
        value={username}
        onChangeText={setUsername}
      />
      {/* 参加ボタン */}
      <Button title="チャットルームに参加" onPress={handleJoinChat} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
});
