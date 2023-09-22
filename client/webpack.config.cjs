const path = require('path');

module.exports = {
    mode: 'development',
    entry: {
        game: './frontend/scripts/game.ts',
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, './frontend/dist-scripts'),
        clean: true
    },
    resolve: {
        extensions: ['.ts', '.js']
    }
};
