const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
/* 
 * __filename主要用以获取当前模块的文件名
 * __dirname主要用以获取当前模块的目录
*/
module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    devtool: 'cheap-source-map',
    resolve: {
        modules: [path.resolve(__dirname, ''), path.resolve(__dirname, 'node_modules')]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, 'public/index.html')
        })
    ]
}