'use strict';

var connection = new signalR.HubConnectionBuilder()
    .withUrl('/messages')
    .build();

connection.start().then(function () {
    connection.invoke('JoinGroup', window.roomName).catch(function (err) {
        return console.error(err);
    });
    $('#messages').animate({ scrollTop: $('#messages')[0].scrollHeight }, 500);
});

connection.on('ReceiveMessage', function (message) {

    var text = message.text;
    //var cypher = $('#cypher').val();
    //text = EncryptCeaser(text, -cypher);
    text = message.text;

    var currentDate = new Date();
    var displayDate = currentDate.getDate() + '.' + (currentDate.getMonth() + 1) + '.' + currentDate.getFullYear();
    displayDate += ' ' + currentDate.getHours() + ':' + currentDate.getMinutes() + ':' + currentDate.getSeconds();

    var div = document.createElement('div');
    div.classList.add('message');

    var header = document.createElement('header');
    header.appendChild(document.createTextNode(displayDate)); /// displayDate

    var p = document.createElement('p');
    var spanSender = document.createElement('span');

    spanSender.classList.add('sender');

    var username = '';
    $.get('/Home/GetUserName')
        .done(function (response) {
            console.log('received response from home controller:');
            console.log(response);
            username = response;
        });
    console.log('message sender ' + message.sender);


    spanSender.appendChild(document.createTextNode(message.sender + ': '));

    var spanText = document.createElement('span');


    spanText.classList.add('text');
    spanText.appendChild(document.createTextNode(text));

    p.appendChild(spanSender);
    p.appendChild(spanText);

    div.appendChild(header);
    div.appendChild(p);

    $('#messages').append(div);

    $('#messages').animate({ scrollTop: $('#messages')[0].scrollHeight }, 500);

    $('#message').val('');

    console.log('message sender ' + message.sender);
    var username = '';
    $.get('/Home/GetUserName')
        .done(function (response) {
            console.log('received response from home controller:');
            console.log(response);
            username = response;

            if (message.sender == username) {
                spanSender.style.color = '#e053b3';
            }
        });
});

connection.on('UserConnected', function (connectionId) {
    console.log('user connected: ' + connectionId);
    var group = $('#group');
    var option = document.createElement('option');
    option.text = connectionId;
    option.value = connectionId;
    group.append(option);
    //connection.invoke('SendMessageToCaller', { text: EncryptCeaser("Welcome to ChatDemo™", 1), sender: "ChatDemo™", sendTime: new Date() });
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

$('#sendButton').on('click', function (event) {
    var text = $('#message').val();

    if (text.length == 0)
        return;

    var text = $('#message').val();

    var data = { text: text, roomName: window.roomName };

    console.log('data:');
    console.log(data);

    console.log('sending .');

    $.post('/Chat/SendMessage', data)
        .done(function (response) {
            var message = { text: response.text, sender: response.sender, sendTime: response.sendTime };
            //console.log('received response from controller: ');
            //console.log(response);
            connection.invoke('SendMessageToGroup', roomName, message).catch(function (err) {
                return console.error(err.toString());
            });
            //connection.invoke('SendMessageToUser', );
        })
        .fail(function (response) {
            console.log("Error: " + response);
        });
});