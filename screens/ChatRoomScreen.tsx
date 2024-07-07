import React, { useEffect, useState, useRef } from 'react';
import { View, TextInput, FlatList, Text, StyleSheet, SafeAreaView, TouchableOpacity, Platform, Dimensions, KeyboardAvoidingView, BackHandler } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../supabaseClient';
import { StackScreenProps } from '@react-navigation/stack';
import dayjs from 'dayjs';

// ナビゲーションスタックのパラメータの型を定義
type RootStackParamList = {
  Username: undefined;
  ChatRoom: { username: string };
};

// ChatRoomScreenのプロップスの型を定義
type ChatRoomScreenProps = StackScreenProps<RootStackParamList, 'ChatRoom'>;

// メッセージオブジェクトのインターフェースを定義
interface Message {
  id: string;
  username: string;
  content: string;
  created_at: string;
}

const ChatRoomScreen: React.FC<ChatRoomScreenProps> = ({ route, navigation }) => {
  const { username: initialUsername } = route.params;
  const [username, setUsername] = useState(initialUsername);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [inputHeight, setInputHeight] = useState(40); // 初期入力欄の高さを設定
  const flatListRef = useRef<FlatList>(null);

  // 初回レンダリング時にユーザー名をロード
  useEffect(() => {
    const loadUsername = async () => {
      const storedUsername = await AsyncStorage.getItem('username');
      if (storedUsername) {
        setUsername(storedUsername);
      } else {
        setUsername(initialUsername);
      }
    };
    loadUsername();
  }, [initialUsername]);

  // メッセージのロードとサブスクリプションの設定
  useEffect(() => {
    loadMessages();
    const subscription = supabase
      .from('messages')
      .on('INSERT', payload => {
        const newMessage = payload.new as Message;
        setMessages(messages => [...messages, newMessage]);
      })
      .subscribe();

    return () => {
      supabase.removeSubscription(subscription);
    };
  }, []);

  // ハードウェアのバックボタンのカスタムハンドラを設定
  useEffect(() => {
    const backAction = () => {
      handleResetToUsername();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, []);

  // メッセージをロードする関数
  const loadMessages = async (): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true }); // メッセージを昇順で取得

      if (error) throw error;

      if (data) {
        setMessages(data);
        setTimeout(() => {
          if (flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated: true });
          }
        }, 100); // 少し遅延を加えることで、FlatListのレンダリング完了後にスクロール
      }
    } catch (error) {
      console.error('Failed to load messages from storage', error);
    }
  };

  // メッセージを送信する関数
  const handleSendMessage = async (): Promise<void> => {
    if (message.trim()) {
      const { error } = await supabase.from('messages').insert([{ username, content: message, created_at: new Date().toISOString() }]);
      if (error) {
        console.error('Error sending message:', error);
      }
      setMessage('');
      setInputHeight(40); // メッセージ送信後に高さをリセット
      setTimeout(() => {
        if (flatListRef.current) {
          flatListRef.current.scrollToEnd({ animated: true });
        }
      }, 100); // メッセージ送信後に少し遅延を加えてスクロール
    }
  };

  // 入力欄の高さを調整する関数
  const handleContentSizeChange = (contentWidth: number, contentHeight: number) => {
    const maxHeight = 40 * 8; // 1行の高さ40px × 8行分
    setInputHeight(Math.min(contentHeight, maxHeight));
  };

  // ユーザー名のリセットを行う関数
  const handleResetToUsername = async () => {
    await AsyncStorage.removeItem('username');
    navigation.reset({
      index: 0,
      routes: [{ name: 'Username' as never }],  // 'Username' を 'never' にキャスト
    });
  };

  // メッセージの内容をフォーマットする関数（Web向け）
  const formatMessageContent = (content: string): string => {
    if (Platform.OS === 'web') {
      return content.replace(/(.{18})/g, '$1\n');
    }
    return content;
  };

  return (
    <SafeAreaView style={styles.outerContainer}>
      <View style={[styles.header, Platform.OS === 'ios' ? styles.iosHeaderPadding : Platform.OS === 'android' ? styles.androidHeaderPadding : styles.webHeaderPadding]}>
        <TouchableOpacity onPress={handleResetToUsername}>
          <Text style={styles.headerText}>戻る</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>チャットルーム</Text>
      </View>
      <KeyboardAvoidingView style={styles.keyboardAvoidingView} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={[
                styles.messageWrapper,
                item.username === username ? styles.myMessageWrapper : styles.otherMessageWrapper,
              ]}
            >
              {item.username !== username && (
                <Text style={styles.username}>{item.username}</Text>
              )}
              <View
                style={[
                  styles.messageContainer,
                  item.username === username ? styles.myMessage : styles.otherMessage,
                ]}
              >
                {item.username === username && (
                  <Text style={[styles.timestamp, styles.myTimestamp]}>{dayjs(item.created_at).format('HH:mm')}</Text>
                )}
                <View style={[
                  styles.messageBubble,
                  item.username === username ? styles.myMessageBubble : styles.otherMessageBubble,
                ]}>
                  <Text style={styles.messageContent}>{formatMessageContent(item.content)}</Text>
                </View>
                {item.username !== username && (
                  <Text style={[styles.timestamp, styles.otherTimestamp]}>{dayjs(item.created_at).format('HH:mm')}</Text>
                )}
              </View>
            </View>
          )}
          contentContainerStyle={[styles.flatListContainer, Platform.OS === 'web' ? styles.webFlatListContainer : {}]}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
        <View style={[styles.inputContainer, Platform.OS === 'web' ? styles.webInputContainer : {}]}>
          <TextInput
            style={[
              styles.input,
              Platform.OS === 'web' && styles.webInput,
              {
                height: inputHeight,
                lineHeight: 20, // 行間を調整
                maxWidth: '80%',
              }
            ]}
            value={message}
            onChangeText={setMessage}
            multiline // 複数行対応
            textAlignVertical="center" // カーソルを中央に配置
            onContentSizeChange={(e) => handleContentSizeChange(e.nativeEvent.contentSize.width, e.nativeEvent.contentSize.height)}
          />
          <TouchableOpacity style={[styles.sendButton, Platform.OS === 'web' ? styles.webSendButton : {}]} onPress={handleSendMessage}>
            <Text style={styles.sendButtonText}>✈️</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// 画面の高さと幅を取得
const { height, width } = Dimensions.get('window'); 

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    width: '100%',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    width: '100%',
  },
  webHeader: {
    position: 'fixed' as any,
    top: 0,
    zIndex: 1000,
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
    backgroundColor: '#fff',
  },
  headerText: {
    color: '#000',
    marginLeft: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  flatListContainer: {
    flexGrow: 1,
    width: '100%',
  },
  webFlatListContainer: {
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    backgroundColor: '#fff',
    width: '100%',
  },
  webInputContainer: {
    position: 'fixed' as any,
    width: '100%',
    maxWidth: 800,
    marginLeft: 'auto',
    marginRight: 'auto',
    bottom: 0,
    alignSelf: 'center',
    backgroundColor: '#fff',
    padding: 10,
  },
  input: {
    flex: 1,
    minHeight: 30,
    maxHeight: 320,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    marginRight: 10,
    backgroundColor: '#fff',
    textAlignVertical: 'center',
  },
  webInput: {
    paddingVertical: 10,
    overflow: 'hidden',
  },
  sendButton: {
    backgroundColor: '#0b93f6',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webSendButton: {
    marginLeft: 30,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 20,
  },
  messageWrapper: {
    marginBottom: 10,
    maxWidth: '75%',
    marginHorizontal: '1%',
  },
  myMessageWrapper: {
    alignSelf: 'flex-end',
  },
  otherMessageWrapper: {
    alignSelf: 'flex-start',
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  messageBubble: {
    padding: 10,
    borderRadius: 20,
  },
  myMessage: {
    alignSelf: 'flex-end',
  },
  otherMessage: {
    alignSelf: 'flex-start',
  },
  myMessageBubble: {
    backgroundColor: '#dcf8c6',
    borderTopRightRadius: 0,
  },
  otherMessageBubble: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderTopLeftRadius: 0,
  },
  username: {
    fontWeight: 'bold',
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  messageContent: {
    fontSize: 16,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
    alignSelf: 'flex-start',
  },
  myTimestamp: {
    alignSelf: 'flex-end',
    marginRight: 10,
  },
  otherTimestamp: {
    alignSelf: 'flex-end',
    marginLeft: 10,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
});

export default ChatRoomScreen;
