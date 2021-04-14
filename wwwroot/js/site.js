// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.

//var connection = new signalR.HubConnectionBuilder()
//    .withUrl("/messages")
//    .build();

//$(document).ready(function () {

//    connection.start().then(function () {
//        console.log('connection started');
//    });

//    //if ($.connection.hub && $.connection.hub.state === $.signalR.connectionState.disconnected) {
//    //    $.connection.hub.start()
//    //}
//});

$(function () {

    var roomName = $('#roomName').text();

    var tmp = $(connection);
    console.log(connection);

    var myDefaultWhiteList = $.fn.tooltip.Constructor.Default.whiteList;

    myDefaultWhiteList.td = ['data-option'];
    myDefaultWhiteList.ul = ['data-option', 'data-notificationid'];
    myDefaultWhiteList.li = ['data-option', 'data-notificationid'];

    $('[data-toggle="popover"]').popover({
        container: 'body',
        content: function () {
            return $('#notification-content').html();
        },
        html: true
    });

    $(document).on('click', 'li.notification-text', function (event) {
        console.log('clicked from document');
        var target = event.target;
        var notificationId = $(target).attr('data-notificationId');

        readNotification(notificationId, target);
    })
});

const connection = new signalR.HubConnectionBuilder()
    .withUrl("/messages")
    .build();

var tmp = connection;
console.log(tmp);

//connection.start().then(function () {
//    console.log('connection started from site.js');
//});

connection.start().then(function () {
    var roomName = $('#roomName').text();

    connection.invoke('JoinGroup', roomName).catch(function (err) {
        return console.error(err.toString());
    });

    connection.invoke('JoinGroup', window.roomName).catch(function (err) {
        return console.error(err);
    });

    $('#messages').animate({ scrollTop: $('#messages')[0].scrollHeight }, 500);
});

var curr = connection;
console.log(curr);

$(function () {
    var myDefaultWhiteList = $.fn.tooltip.Constructor.Default.whiteList;

    myDefaultWhiteList.td = ['data-option'];
    myDefaultWhiteList.ul = ['data-option', 'data-notificationid'];
    myDefaultWhiteList.li = ['data-option', 'data-notificationid'];

    $('[data-toggle="popover"]').popover({
        container: 'body',
        content: function () {
            return $('#notification-content').html();
        },
        html: true
    });

    $(document).on('click', 'li.notification-text', function (event) {
        console.log('clicked from document');
        var target = event.target;
        var notificationId = $(target).attr('data-notificationId');

        readNotification(notificationId, target);
    })
});

function getNotifications() {
    var res = '<ul class="list-group">';

    $.get('/Notification/GetNotifications', function (data) {

        if (data.count == 0) {
            $('#notificationCount').fadeOut('fast');
            $('#notification').fadeOut('fast');
            $('#notificationBubble').fadeOut('fast');
            $('#notification').popover('hide');
        }
        else if (data.count == 1) {
            $('#notificationCount').fadeIn('fast');
            $('#notification').fadeIn('fast');
            $('#notificationBubble').fadeIn('fast');
        }
        var ul = document.createElement('ul');
        ul.classList.add('list-group');


        $('#notificationCount').html(data.count);
        var notifications = data.notifications;
        notifications.forEach(element => {
            res = res + '<li class="list-group-item notification-text" data-notificationId="' + element.id + '">' + element.text + '</li>';
        });
        res = res + '</ul>';
        $('#notification-content').html(res);

    });
}

$(document).ready(function () {
    $('[data-toggle="popover"]').popover({
        content: function () {
            return $('#notification-content').html();
        },
        html: true
    });

    $('body').append('<div id="notification-content" hidden></div>');
    getNotifications();
});

function readNotification(notificationId, target) {
    $.get('/Notification/ReadNotification', { notificationId: notificationId }, function (result) {
        getNotifications();
        $(target).fadeOut('slow');
    }).catch(function (error) {
        return console.error(error.toString());
    });
}

connection.on('ReceiveNotification', function () {
    getNotifications();
});