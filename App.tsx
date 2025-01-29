// App.tsx
import React from "react";
import RootNavigator from "./navigation/RootNavigator";
import { AuthProvider } from "./contexts/AuthContext";
import {LanguageProvider} from "./services/LanguageContext";
import {Buffer} from "buffer";
global.Buffer = Buffer;

export default function App() {
  return (
      <AuthProvider>
          <LanguageProvider>
            <RootNavigator />
          </LanguageProvider>
      </AuthProvider>
  );
}
