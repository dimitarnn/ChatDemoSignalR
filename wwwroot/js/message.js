'use strict';

var connection = new signalR.HubConnectionBuilder()
    .withUrl("/messages")
    .build();

var last = 1;

function EncryptCeaser(ciphertext, offset) {
    var plaintext = '';
    var code_a = 'a'.charCodeAt(0);
    var code_A = 'A'.charCodeAt(0);
    const regex_a = new RegExp('[a-z]');
    const regex_A = new RegExp('[A-Z]');

    offset = parseInt(offset) % 26;

    for (var i = 0; i < ciphertext.length; ++i) {
        if (regex_a.test(ciphertext[i])) {
            var code = ciphertext.charCodeAt(i);
            var tmp = String.fromCharCode(code_a + (code - code_a + offset + 26) % 26);
            plaintext += tmp;
        }
        else if (regex_A.test(ciphertext[i])) {
            var code = ciphertext.charCodeAt(i);
            var tmp = String.fromCharCode(code_A + (code - code_A + offset + 26) % 26);
            plaintext += tmp;
        }
        else {
            plaintext += ciphertext[i];
        }
    }
    
    console.log('outputed text: ' + plaintext);
    return plaintext;
}

function updateMessages(cypher) {
    $.each($('.message p .text'), function () {
        var text = $(this).text();
        text = EncryptCeaser(text, cypher);
        $(this).text(text);
    });
}

$(document).ready(function () {
    updateMessages(-last);
});

$('#cypher').on('change', function () {
    updateMessages(last);
    var cypher = parseInt($('#cypher').val());
    updateMessages(-cypher);
    last = cypher;
});

$('#cypher').keypress(function (event) {
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if (keycode == 13) {    // check for enter
        event.preventDefault();
    }
});

$('#key').keypress(function (event) {
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if (keycode == 13) {
        event.preventDefault();
    }
});


connection.on('ReceiveMessage', function (message) {

    var text = message.text;
    var cypher = $('#cypher').val();
    text = EncryptCeaser(text, -cypher);

    var currentDate = new Date();
    var displayDate = currentDate.getDate() + '.' + (currentDate.getMonth() + 1) + '.' + currentDate.getFullYear();
    displayDate += ' ' + currentDate.getHours() + ':' + currentDate.getMinutes() + ':' + currentDate.getSeconds();

    var div = document.createElement('div');
    div.classList.add('message');

    var header = document.createElement('header');
    header.appendChild(document.createTextNode(displayDate));

    var p = document.createElement('p');
    var spanSender = document.createElement('span');

    spanSender.classList.add('sender');
    console.log('>> ' + message.sender + ' - ' + $('#user').text());
    if (message.sender == $('#user').text()) {
        spanSender.style.color = '#e053b3';
    }
    console.log('Color setted');
    spanSender.appendChild(document.createTextNode(message.sender + ': '));

    var spanText = document.createElement('span');


    spanText.classList.add('text');
    spanText.appendChild(document.createTextNode(text));

    p.appendChild(spanSender);
    p.appendChild(spanText);
    
    div.appendChild(header);
    div.appendChild(p);

    $('#messages').append(div);

    $('#messages').animate({ scrollTop: $('#messages')[0].scrollHeight}, 500);

    $('#message').val('');
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

connection.start().then(function () {
    var roomName = $('#roomName').text();
    //console.log('roomName after start: '+ roomName);
    connection.invoke('JoinGroup', roomName).catch(function (err) {
        return console.error(err.toString());
    });
    /// animated scroll
    $('#messages').animate({ scrollTop: $('#messages')[0].scrollHeight }, 500);
    //}).catch(function (err) {
    //    return console.error(err.toString());
});

$('#groupSendButton').on('click', function (event) {
    var text = $('#message').val();

    if (text.length == 0)
        return;

    console.log('text: ' + text);
    var cypher = $('#key').val();
    text = EncryptCeaser(text, cypher);
    console.log('cypher: ' + cypher)
    console.log('encrypted text: ' + text);

    var roomName = $('#roomName').text();
    var message;
    var sender = '';
    var sendTime = '';

    var data = { text: text, roomName: roomName };
    console.log(data);

    $.post('/Chat/SendMessage', data)
        .done(function (response) {
            message = { text: text, sender: response.sender, sendTime: response.sendTime };
            sender = response.sender;
            sendTime = response.sendTime;

            console.log('response received');
            console.log(response);

            connection.invoke('SendMessageToGroup', roomName, message).catch(function (err) {
                return console.error(err.toString());
            });
        })
        .fail(function (response) {
            console.log('fail');
            console.log(response);
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