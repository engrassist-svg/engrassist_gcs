import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '@/constants/Colors';

/**
 * Root Layout
 * 
 * This is the entry point for the app's navigation structure.
 * It wraps everything in a Stack navigator and applies the
 * dark theme globally.
 */
export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="tools/[id]"
          options={{
            headerShown: true,
            headerStyle: { backgroundColor: Colors.surface },
            headerTintColor: Colors.textPrimary,
            headerTitleStyle: { color: Colors.textPrimary },
            presentation: 'card',
          }}
        />
      </Stack>
    </>
  );
}
