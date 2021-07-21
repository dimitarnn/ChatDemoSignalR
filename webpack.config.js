﻿const path = require('path');

module.exports = {
    mode: 'development',
    entry: {
        main: './wwwroot/js/app.js',
        displayAllPrivateChats: './wwwroot/js/displayAllPrivateChats.js',
        displayChatRoom: './wwwroot/js/displayChatRoom.js',
        notifications: './wwwroot/js/notificationsScript.js',
        displayRooms: './wwwroot/js/displayRooms.js'
    },
    output: {
        path: path.resolve(__dirname, './wwwroot/js/dist'),
        filename: '[name].bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        "presets": [
                            "@babel/preset-env",
                            "@babel/preset-react"
                        ]
                    }
                }
            }
        ]
    },
    resolve: {
        extensions: ['*', '.js', '.jsx']
    }
};