# COSA NOSTRA Android APK

This project wraps the online COSA NOSTRA V8 game in a real Android app shell. The backend, accounts, tokens, chat, game logic and Stripe checkout remain online on the server.

## Important
The app currently opens:
`https://cosa-nostra.onrender.com`

If your final Render URL is different, edit `android/app/src/main/java/com/cosanostra/game/MainActivity.java` and change `START_URL` before building.

## Build from an iPhone using GitHub
1. Create a GitHub repository.
2. Upload this whole project folder.
3. Open the repository → Actions.
4. Choose **Build COSA NOSTRA APK**.
5. Tap **Run workflow**.
6. When it finishes, open the workflow run and download the **cosa-nostra-debug-apk** artifact.
7. The artifact contains `app-debug.apk`.

A debug APK is suitable for testing/direct installation. For Google Play, build a signed AAB and create a Google Play developer account.

## Stripe
Never put Stripe secret keys in the Android app. Stripe keys/webhooks belong on the server only. The app simply opens the online checkout flow.
