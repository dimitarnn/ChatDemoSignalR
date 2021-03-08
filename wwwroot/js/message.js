'use strict';

var connection = new signalR.HubConnectionBuilder()
    .withUrl("/messages")
    .build();

connection.on('ReceiveMessage', function (message) {
    console.log('Message received: ' + message);
    var text = message.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    console.log('message sendTime: ' + message.sendTime);

    var currentDate = new Date();
    var displayDate = currentDate.getDate() + '.' + (currentDate.getMonth() + 1) + '.' + currentDate.getFullYear();
    displayDate += ' ' + currentDate.getHours() + ':' + currentDate.getMinutes() + ':' + currentDate.getSeconds();

    console.log('so far');

    var div = document.createElement('div');
    div.classList.add('message');

    console.log('div created');

    var header = document.createElement('header');
    header.appendChild(document.createTextNode(displayDate));

    console.log('header created');

    var p = document.createElement('p');
    var span = document.createElement('span');

    console.log('span created');

    span.appendChild(document.createTextNode(message.sender + ': '));
    p.appendChild(span);

    console.log('span appended');

    p.appendChild(document.createTextNode(text));

    console.log('testing message div: ');
    
    div.appendChild(header);
    div.appendChild(p);
    console.log(div);

    //var msg = message.sender + ': ' + text + '  - ' + displayDate;

    //div.innerHTML = msg;
    $('#messages').append(div);

    $('#messages').animate({ scrollTop: $('#messages')[0].scrollHeight}, 500);
    //$('#messages').scrollTop($('#messages')[0].scrollHeight);

    $('#message').val('');
});

connection.on('UserConnected', function (connectionId) {
    console.log('user connected: ' + connectionId);
    var group = $('#group');
    var option = document.createElement('option');
    option.text = connectionId;
    option.value = connectionId;
    group.append(option);
});

connection.on('UserDisconnected', function (connectionId) {
    console.log('user disconnected: ' + connectionId);
    var group = $('#group');
    $('#group option').each(function () {
        if ($(this).val() == connectionId) {
            $(this).remove();
        }
    });
});

connection.start().then(function () {
    var roomName = $('#roomName').text();
    console.log('roomName after start: '+ roomName);
    connection.invoke('JoinGroup', roomName).catch(function (err) {
        return console.error(err.toString());
    });
    $('#messages').animate({ scrollTop: $('#messages')[0].scrollHeight }, 500);
}).catch(function (err) {
    return console.error(err.toString());
});

$('#groupSendButton').on('click', function (event) {
    var text = $('#message').val();

    if (text.length == 0)
        return;

    var roomName = $('#roomName').text();
    var message;
    var sender = '';
    var sendTime = '';

    console.log('group send button gets clicked');

    var data = { text: text, roomName: roomName };
    $.post('/Chat/SendMessage', data)
        .done(function (response) {
            console.log(response.text + ' - ' + response.sender + ' - ' + response.sendTime);
            console.log('**7&** ' + typeof (response.sendTime));
            
            message = { text: text, sender: response.sender, sendTime: response.sendTime };
            sender = response.sender;
            sendTime = response.sendTime;
            console.log('Called send message: ' + response);

            console.log('to send: ' + text + ' ' + sender + ' ' + sendTime);

            connection.invoke('SendMessageToGroup', roomName, message).catch(function (err) {
                return console.error(err.toString());
            });

        });


});

$('#sendButton').on('click', function (event) {
    var message = $('#message').val();
    var group = $('#group').find(':selected').val();
    var method = 'SendMessageToAll';

    console.log('sendButton clicked: ' + group);

    //var message = { text: message, sender: 'Anonymous', };

    if (group === 'All' || group === 'Myself') {
        method = group === 'All' ? 'SendMessageToAll' : 'SendMessageToCaller';
        connection.invoke(method, message).catch(function (err) {
            return console.error(err.toString());
        });
    } else if (group === 'PrivateGroup') {
        connection.invoke('SendMessageToGroup', 'PrivateGroup', message).catch(function (err) {
            return console.error(err.toString());
        });
    } else {
        connection.invoke('SendMessageToUser', group, message).catch(function (err) {
            return console.error(err.toString());
        });
    }

    event.preventDefault();
});

$('#joinGroup').on('click', function (event) {

    connection.invoke('JoinGroup', 'PrivateGroup').catch(function (err) {
        return console.error(err.toString());
    });

    var option = document.createElement('option');
    option.value = 'PrivateGroup';
    option.text = 'Private Group';

    $('#group').prepend(option);

    event.preventDefault();
});


///

$('.joinRoomLink').on('click', function () {
    var roomName = $(this).text();
    console.log('Joining Room: ' + roomName);

    var data = { roomName: roomName };

    $.post('/Chat/JoinRoom', data)
        .done(function () {
            //console.log('Controller Called');
            $('#roomNameSpan').text(roomName);
        });

    connection.invoke('JoinGroup', roomName).catch(function (err) {
        return console.error(err.toString());
    });
});

////
$('#sendMessage').on('click', function (event) {
    var text = $('#message').val();
    var group = $('#roomNameSpan').text();
    var roomName = $('#roomNameSpan').text();
    var message = '';

    console.log(group);

    var data = { text: text, roomName: roomName };
    $.post('/Chat/SendMessage', data)
        .done(function (response) {
            message = { text: text, sender: response.sender, sendTime: response.sendTime };
            console.log('Called send message: ' + response);

            if (group === 'All') {
                connection.invoke('SendMessageToAll', message).catch(function (err) {
                    return console.error(err.toString());
                });
            }
            else {
                connection.invoke('SendMessageToGroup', group, message).catch(function (err) {
                    return console.error(err.toString());
                });
            }
        });

    event.preventDefault();
});