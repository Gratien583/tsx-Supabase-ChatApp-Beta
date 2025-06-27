import React, { useEffect, useState, useRef } from "react";
import {
  View,
  TextInput,
  FlatList,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  BackHandler,
  StyleSheet,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../supabaseClient";
import { StackScreenProps } from "@react-navigation/stack";
import dayjs from "dayjs";

// ナビゲーションスタックに渡すパラメータの型を定義
type RootStackParamList = {
  Username: undefined;
  ChatRoom: { username: string }; // チャットルームにはユーザー名を渡す
};

// 画面に渡ってくるプロップスの型を指定（ナビゲーションで使用）
type ChatRoomScreenProps = StackScreenProps<RootStackParamList, "ChatRoom">;

// メッセージ1件を表す型を定義
interface Message {
  id: string;
  username: string;
  content: string;
  created_at: string;
}

const ChatRoomScreen: React.FC<ChatRoomScreenProps> = ({ route, navigation }) => {
  const { username: initialUsername } = route.params;

  // ユーザー名・メッセージ一覧・入力中のテキスト・テキストエリアの高さを管理
  const [username, setUsername] = useState(initialUsername);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [inputHeight, setInputHeight] = useState(40); // 初期高さ：1行ぶん
  const flatListRef = useRef<FlatList>(null); // メッセージ一覧を操作するための参照

  // 保存されたユーザー名があればそれを使う（アプリ再起動時も継続的にログイン状態を維持）
  useEffect(() => {
    const loadUsername = async () => {
      const storedUsername = await AsyncStorage.getItem("username");
      if (storedUsername) {
        setUsername(storedUsername);
      } else {
        setUsername(initialUsername);
      }
    };
    loadUsername();
  }, [initialUsername]);

  // 初期メッセージの取得＋リアルタイム購読設定
  useEffect(() => {
    loadMessages(); // 既存のメッセージ一覧を取得

    // Supabaseの"messages"テーブルに新しい行が追加されたら反映
    const subscription = supabase
      .from("messages")
      .on("INSERT", (payload) => {
        const newMessage = payload.new as Message;
        setMessages((messages) => [...messages, newMessage]);
      })
      .subscribe();

    // クリーンアップ（コンポーネントがアンマウントされたとき購読解除）
    return () => {
      supabase.removeSubscription(subscription);
    };
  }, []);

  // Androidの物理バックボタンを押したときにユーザー名入力画面に戻るように設定
  useEffect(() => {
    const backAction = () => {
      handleResetToUsername();
      return true; // デフォルト動作（アプリ終了）をキャンセル
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove(); // イベントリスナーの解除
  }, []);

  // Supabaseからメッセージを取得する関数（古い順に並べる）
  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;

      if (data) {
        setMessages(data);
        // FlatListの描画完了後に自動スクロール
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    } catch (error) {
      console.error("Failed to load messages from storage", error);
    }
  };

  // メッセージ送信処理
  const handleSendMessage = async () => {
    if (message.trim()) {
      // Supabaseに新しいメッセージを挿入（created_atはクライアント時刻）
      const { error } = await supabase.from("messages").insert([
        {
          username,
          content: message,
          created_at: new Date().toISOString(),
        },
      ]);
      if (error) {
        console.error("Error sending message:", error);
      }

      // 入力欄をクリア＆スクロール
      setMessage("");
      setInputHeight(40);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  // テキスト入力エリアの高さを調整（8行まで）
  const handleContentSizeChange = (contentWidth: number, contentHeight: number) => {
    const maxHeight = 40 * 8;
    setInputHeight(Math.min(contentHeight, maxHeight));
  };

  // ユーザー名をリセットしてログアウトのような動作に（AsyncStorage削除 → Username画面へ戻る）
  const handleResetToUsername = async () => {
    await AsyncStorage.removeItem("username");
    navigation.reset({
      index: 0,
      routes: [{ name: "Username" as never }],
    });
  };

  // Web環境で文字列が横に長くなりすぎないように18文字ごとに改行を入れる
  const formatMessageContent = (content: string): string => {
    if (Platform.OS === "web") {
      return content.replace(/(.{18})/g, "$1\n");
    }
    return content;
  };

  // --- JSXの描画 ---
  return (
    <SafeAreaView style={styles.outerContainer}>
      {/* ヘッダー（戻るボタン＋タイトル） */}
      <View
        style={[
          styles.header,
          Platform.OS === "ios"
            ? styles.iosHeaderPadding
            : Platform.OS === "android"
            ? styles.androidHeaderPadding
            : styles.webHeaderPadding,
        ]}
      >
        <TouchableOpacity onPress={handleResetToUsername}>
          <Text style={styles.headerText}>戻る</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>チャットルーム</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* メッセージ一覧（FlatList） */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={[
                styles.messageWrapper,
                item.username === username
                  ? styles.myMessageWrapper
                  : styles.otherMessageWrapper,
              ]}
            >
              {/* 他人のメッセージの場合のみユーザー名を表示 */}
              {item.username !== username && (
                <Text style={styles.username}>{item.username}</Text>
              )}

              {/* メッセージ本体（テキスト＋時刻） */}
              <View
                style={[
                  styles.messageContainer,
                  item.username === username
                    ? styles.myMessage
                    : styles.otherMessage,
                ]}
              >
                {/* 自分のメッセージなら時刻を左に表示 */}
                {item.username === username && (
                  <Text style={[styles.timestamp, styles.myTimestamp]}>
                    {dayjs(item.created_at).format("HH:mm")}
                  </Text>
                )}

                <View
                  style={[
                    styles.messageBubble,
                    item.username === username
                      ? styles.myMessageBubble
                      : styles.otherMessageBubble,
                  ]}
                >
                  <Text style={styles.messageContent}>
                    {formatMessageContent(item.content)}
                  </Text>
                </View>

                {/* 他人のメッセージなら時刻を右に表示 */}
                {item.username !== username && (
                  <Text style={[styles.timestamp, styles.otherTimestamp]}>
                    {dayjs(item.created_at).format("HH:mm")}
                  </Text>
                )}
              </View>
            </View>
          )}
          contentContainerStyle={[
            styles.flatListContainer,
            Platform.OS === "web" ? styles.webFlatListContainer : {},
          ]}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          onLayout={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
        />

        {/* 入力欄と送信ボタン */}
        <View
          style={[
            styles.inputContainer,
            Platform.OS === "web" ? styles.webInputContainer : {},
          ]}
        >
          <TextInput
            style={[
              styles.input,
              Platform.OS === "web" && styles.webInput,
              {
                height: inputHeight,
                lineHeight: 20,
                maxWidth: "80%",
              },
            ]}
            value={message}
            onChangeText={setMessage}
            multiline // 複数行入力に対応
            textAlignVertical="center"
            onContentSizeChange={(e) =>
              handleContentSizeChange(
                e.nativeEvent.contentSize.width,
                e.nativeEvent.contentSize.height
              )
            }
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              Platform.OS === "web" ? styles.webSendButton : {},
            ]}
            onPress={handleSendMessage}
          >
            <Text style={styles.sendButtonText}>✈️</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// 画面の高さと幅を取得
const { height, width } = Dimensions.get("window");

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    width: "100%",
  },
  iosHeaderPadding: {
    paddingTop: 10,
  },
  androidHeaderPadding: {
    paddingTop: 50,
  },
  webHeaderPadding: {
    paddingTop: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    width: "100%",
  },
  webHeader: {
    position: "fixed" as any,
    top: 0,
    zIndex: 1000,
    width: "100%",
    maxWidth: 800,
    alignSelf: "center",
    backgroundColor: "#fff",
  },
  headerText: {
    color: "#000",
    marginLeft: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  flatListContainer: {
    flexGrow: 1,
    width: "100%",
  },
  webFlatListContainer: {
    maxWidth: 800,
    alignSelf: "center",
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    backgroundColor: "#fff",
    width: "100%",
  },
  webInputContainer: {
    position: "fixed" as any,
    width: "100%",
    maxWidth: 800,
    marginLeft: "auto",
    marginRight: "auto",
    bottom: 0,
    alignSelf: "center",
    backgroundColor: "#fff",
    padding: 10,
  },
  input: {
    flex: 1,
    minHeight: 30,
    maxHeight: 320,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    marginRight: 10,
    backgroundColor: "#fff",
    textAlignVertical: "center",
  },
  webInput: {
    paddingVertical: 10,
    overflow: "hidden",
  },
  sendButton: {
    backgroundColor: "#0b93f6",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  webSendButton: {
    marginLeft: 30,
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 20,
  },
  messageWrapper: {
    marginBottom: 10,
    maxWidth: "75%",
    marginHorizontal: "1%",
  },
  myMessageWrapper: {
    alignSelf: "flex-end",
  },
  otherMessageWrapper: {
    alignSelf: "flex-start",
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  messageBubble: {
    padding: 10,
    borderRadius: 20,
  },
  myMessage: {
    alignSelf: "flex-end",
  },
  otherMessage: {
    alignSelf: "flex-start",
  },
  myMessageBubble: {
    backgroundColor: "#dcf8c6",
    borderTopRightRadius: 0,
  },
  otherMessageBubble: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderTopLeftRadius: 0,
  },
  username: {
    fontWeight: "bold",
    marginBottom: 4,
    alignSelf: "flex-start",
  },
  messageContent: {
    fontSize: 16,
  },
  timestamp: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
    alignSelf: "flex-start",
  },
  myTimestamp: {
    alignSelf: "flex-end",
    marginRight: 10,
  },
  otherTimestamp: {
    alignSelf: "flex-end",
    marginLeft: 10,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
});

export default ChatRoomScreen;
