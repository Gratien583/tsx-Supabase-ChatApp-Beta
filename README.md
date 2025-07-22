## Execution Result Notes
![React Native](https://img.shields.io/badge/React%20Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![AsyncStorage](https://img.shields.io/badge/AsyncStorage-404D59?style=for-the-badge&logo=react&logoColor=white)
![Day.js](https://img.shields.io/badge/Day.js-292A2D?style=for-the-badge&logo=javascript&logoColor=F7DF1E)

### Username Input Screen
<img src="https://github.com/Gratien583/tsx-Supabase-ChatApp/assets/167043636/b2943c4b-acf2-41de-ab39-ef9b9b90722d" alt="Username Input Screen" width="300">

### Chat Room Screen
<table>
  <tr>
    <td>iOS</td>
    <td>Android</td>
    <td>Web</td>
  </tr>
  <tr>
    <td><img src="https://github.com/Gratien583/tsx-Supabase-ChatApp/assets/167043636/9f16a44e-712b-4dd8-8dc2-e22413d29de7" alt="Chat Room iOS" width="300"></td>
    <td><img src="https://github.com/Gratien583/tsx-Supabase-ChatApp/assets/167043636/48c63387-3810-4f82-9113-590c4e08fad8" alt="Chat Room Android" width="300"></td>
    <td><img src="https://github.com/Gratien583/tsx-Supabase-ChatApp/assets/167043636/2ea7417e-5369-45f9-b76f-419fc012e9b2" alt="Chat Room Web" width="400"></td>
  </tr>
</table>

## Table Structure

Supabase `messages` table

### `messages` Table

```sql
CREATE TABLE messages (
  id serial PRIMARY KEY,
  username text NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc', now())
);
```

> ⚠️ Make sure to enable **Realtime**.

## Project Setup

### 🔧 Supabase Configuration

To run this app, you must set your Supabase project URL and API key in a `.env` file.

### 1. Create a Supabase Project and Get the Keys

- Visit [https://app.supabase.com/](https://app.supabase.com/) and create a new project.
- Copy the “Project URL” and “anon key”.

### 2. Create a `.env` File

In the root of your project, create a file named `.env` with the following contents:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=your-anon-key
```

> ⚠️ Be sure to include `.env` in your `.gitignore` to avoid exposing your credentials.

### 3. `supabaseClient.ts` Example

```ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase environment variables are not set.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
```

---

### Install Dependencies

```sh
npm install
```

### Run with Expo

```sh
npx expo start
```
