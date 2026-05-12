// Enables Fast Refresh + correct web entry for Expo SDK 52 Metro bundler.
// Must come before any other imports.
import '@expo/metro-runtime';

import React from 'react';
import { Platform, SafeAreaView, StyleSheet, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';

/**
 * On web, Skia needs CanvasKit (wasm) to load before any <Canvas/> mounts.
 * `WithSkiaWeb` handles the async load and renders a fallback in the meantime.
 * On native, Skia is available immediately so we mount Lab directly.
 */
let RootComponent: React.ComponentType;
if (Platform.OS === 'web') {
  const { WithSkiaWeb } = require('@shopify/react-native-skia/lib/module/web');
  RootComponent = () => (
    <WithSkiaWeb
      getComponent={() => import('./src/lab/Lab')}
      fallback={<Text style={styles.loading}>Loading Skia…</Text>}
      opts={{
        // Metro doesn't tag .wasm files with `application/wasm`, so the
        // browser refuses to stream-compile the local copy. Pull canvaskit
        // straight from a CDN that does set the MIME correctly.
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/canvaskit-wasm@0.40.0/bin/full/${file}`,
      }}
    />
  );
} else {
  const Lab = require('./src/lab/Lab').default;
  RootComponent = () => <Lab />;
}

export default function App() {
  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="light" />
      <RootComponent />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0f1a' },
  loading: { color: '#e8e4dc', padding: 24, fontSize: 14 },
});
