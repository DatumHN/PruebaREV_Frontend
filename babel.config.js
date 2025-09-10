module.exports = {
  // prettier-ignore
  presets: [
    "@babel/preset-typescript",
    ["@babel/preset-env", { targets: { node: "current" } }],
  ],
  // prettier-ignore
  plugins: [
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-proposal-class-properties'],
  ],
};
