const path = require('path');

module.exports = {
    mode: 'production',
    entry: {
        main: './wwwroot/js/app.js',
        displayAllPrivateChats: './wwwroot/js/displayAllPrivateChats.js',
        displayChatRoom: './wwwroot/js/displayChatRoom.js',
        notifications: './wwwroot/js/notificationsScript.js',
        displayRooms: './wwwroot/js/displayRooms.js',
        listPendingFriendRequests: './wwwroot/js/listPendingFriendRequests.js',
        listAvailable: './wwwroot/js/listAvailable.js',
        displayAvailableRooms: './wwwroot/js/displayAvailableRooms.js',
        joinRoomRequests: './wwwroot/js/joinRoomRequests.js',
        displayRoomsCreatedByUser: './wwwroot/js/displayRoomsCreatedByUser.js',
        inviteUsers: './wwwroot/js/inviteUsers.js',
        displayRoomsContainingUser: './wwwroot/js/displayRoomsContainingUser.js',
        register: './wwwroot/js/register.js',
        login: './wwwroot/js/login.js',
        addImage: './wwwroot/js/addImage.js',
        uploadFile: './wwwroot/js/uploadFile.js',
        connection: './wwwroot/js/connection.js',
        createRole: './wwwroot/js/createRole.js',
        displayRoles: './wwwroot/js/displayRoles.js',
        editRole: './wwwroot/js/editRole.js',
        editUsersInRole: './wwwroot/js/editUsersInRole.js',
        displayUsers: './wwwroot/js/displayUsers.js',
        editUser: './wwwroot/js/editUser.js',
        editUserRoles: './wwwroot/js/editUserRoles.js',
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