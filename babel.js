module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './',
            '@/app': './app',
            '@/api': './api',
            '@/assets': './assets',
          },
        },
      ],
      'react-native-reanimated/plugin', // ✅ 반드시 plugins 마지막에 위치
    ],
  };
};
