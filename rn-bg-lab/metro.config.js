// Metro config — Expo default + a Skia-specific exclusion.
//
// @shopify/react-native-skia ships with `canvaskit-wasm` for the web
// build, which references Node's `fs`. On iOS/Android bundles Metro
// must NOT try to resolve canvaskit-wasm or it 500s with
//   "Unable to resolve module fs from .../canvaskit-wasm/bin/full/canvaskit.js"
// We short-circuit the resolve for native platforms.

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

const originalResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform !== 'web' && moduleName === 'canvaskit-wasm') {
    return { type: 'empty' };
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

// Metro's dev-server doesn't tag .wasm files with `application/wasm`,
// which the browser requires for streaming WASM compile. Patch it.
const originalEnhanceMiddleware = config.server && config.server.enhanceMiddleware;
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware, serverInstance) => {
    const wrapped = (req, res, next) => {
      if (req.url && req.url.includes('.wasm')) {
        res.setHeader('Content-Type', 'application/wasm');
      }
      return middleware(req, res, next);
    };
    return originalEnhanceMiddleware
      ? originalEnhanceMiddleware(wrapped, serverInstance)
      : wrapped;
  },
};

module.exports = config;
