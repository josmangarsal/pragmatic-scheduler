// export const presets = ['@babel/preset-env', '@babel/preset-react'];
module.exports = {
  presets: [
    ['@babel/preset-env', {targets: {node: 'current'}}],
    ['@babel/preset-react', {runtime: 'automatic', importSource: '@emotion/react'}],
    '@babel/preset-typescript',
  ],
};
