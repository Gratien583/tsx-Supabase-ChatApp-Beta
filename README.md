## 実行結果のメモ
![React Native](https://img.shields.io/badge/React%20Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![AsyncStorage](https://img.shields.io/badge/AsyncStorage-404D59?style=for-the-badge&logo=react&logoColor=white)
![Day.js](https://img.shields.io/badge/Day.js-292A2D?style=for-the-badge&logo=javascript&logoColor=F7DF1E)


### ユーザー名入力画面
<img src="https://github.com/Gratien583/tsx-Supabase-ChatApp/assets/167043636/b2943c4b-acf2-41de-ab39-ef9b9b90722d" alt="ユーザー名入力画面" width="300">

### チャットルーム画面
<table>
    <tr>
    <td>iOS</td>
    <td>Android</td>
    <td>Web</td>
  </tr>
<tr>
  <td><img src="https://github.com/Gratien583/tsx-Supabase-ChatApp/assets/167043636/9f16a44e-712b-4dd8-8dc2-e22413d29de7" alt="チャットルーム画面 iOS" width="300"></td>
  <td><img src="https://github.com/Gratien583/tsx-Supabase-ChatApp/assets/167043636/48c63387-3810-4f82-9113-590c4e08fad8" alt="チャットルーム画面 Android" width="300"></td>
  <td><img src="https://github.com/Gratien583/tsx-Supabase-ChatApp/assets/167043636/2ea7417e-5369-45f9-b76f-419fc012e9b2" alt="チャットルーム画面 Web" width="400"></td>
 </tr>
</table>

## テーブル構造

Supabaseの`messages`テーブル

### `messages` テーブル

```sql
CREATE TABLE messages (
  id serial PRIMARY KEY,
  username text NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc', now())
);
```
この時Enable Realtimeを有効を忘れずに。

## プロジェクトの実行

### Supabase設定

動作させるには、`supabaseClient.ts`に自分のSupabaseプロジェクトのURLとキーを設定する。

1. Supabaseのプロジェクトを作成し、URLとAPIキーを取得する。
2. `supabaseClient.ts`ファイルを開き、以下のコードスニペットの`YOUR-SUPABASE-URL`と`YOUR-SUPABASE-KEY`を自分のプロジェクトの値に置き換える。

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'YOUR-SUPABASE-URL';
const supabaseKey = 'YOUR-SUPABASE-KEY';

export const supabase = createClient(supabaseUrl, supabaseKey);
```

### 依存関係のインストール
```sh
npm install
```

### Expoにて実行
```sh
npx expo start
```
