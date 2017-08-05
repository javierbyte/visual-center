const path = require("path");
const webpack = require("webpack");

module.exports = {
  devtool: "cheap-module-eval-source-map",
  entry: [
    "eventsource-polyfill",
    "webpack-hot-middleware/client",
    "./src/index.js"
  ],
  output: {
    path: path.join(__dirname, "../dist"),
    filename: "bundle.js",
    publicPath: "/dist/"
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
  ],
  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: ["babel-loader"],
        include: path.join(__dirname, "../src")
      }
    ]
  }
};
