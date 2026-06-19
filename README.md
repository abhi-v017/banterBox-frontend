# Chattr Frontend

The mobile client for **Chattr**, a real-time chat and communication application. Built with React Native and Expo, this application delivers a seamless and highly responsive user experience across both iOS and Android platforms, featuring instant messaging, media sharing, and real-time audio/video capabilities.

## 🚀 Features

- **Cross-Platform**: Built with Expo and React Native to support iOS, Android, and Web.
- **Real-Time Chat**: Integrated with Socket.IO for instantaneous message delivery.
- **Audio & Video Calls**: Implemented using React Native WebRTC for high-quality peer-to-peer communication.
- **Media Sharing**: Seamless image and media selection via Expo Image Picker.
- **Authentication**: Secure OTP login flow and session management utilizing AsyncStorage.
- **Smooth Navigation**: Intuitive routing with React Navigation (Native Stack & Bottom Tabs).

## 🛠️ Tech Stack

- **Framework**: React Native, Expo
- **Navigation**: React Navigation
- **Real-time**: Socket.IO Client, React Native WebRTC
- **Networking**: Axios
- **Storage**: AsyncStorage
- **Media**: Expo AV, Expo Image Picker

## 📦 Installation

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone <repository-url>
   cd banterbox/banterbox-frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env` file in the root directory and provide the necessary variables:
   ```env
   EXPO_PUBLIC_API_URL=http://your-backend-api-url
   ```

4. **Run the Application**:
   - Start the Expo development server:
     ```bash
     npm start
     ```
   - To run on Android:
     ```bash
     npm run android
     ```
   - To run on iOS:
     ```bash
     npm run ios
     ```
   - To run on the Web:
     ```bash
     npm run web
     ```

## 🏗️ Build & Deployment

This project uses EAS (Expo Application Services) for building the application.
Ensure you have the EAS CLI installed and configured to generate production-ready APKs or IPAs.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.
