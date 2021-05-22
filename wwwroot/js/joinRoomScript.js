$(document).ready(function () {

});

//$('.joinRoomButton').on('click', function (event) {
//    var roomName = $(this).attr('data-roomName');
//    console.log(roomName);

//    $.post('/Chat/JoinRoom', { roomName: roomName }, function () {
//        console.log('success');
//    }).catch(function (err) {
//        return console.error(err.toString());
//    });
    
//    //event.preventDefault();
//});

function showButton(buttonId) {
    var id = '#' + id;
    $(id).hide();
}

function joinRoom(button) {
    console.log('function called');
    var roomName = $(button).attr('data-roomName');
    var roomId = $(button).attr('data-roomId');

    console.log(roomName);

    $.post('/Chat/JoinRoom', { roomName: roomName }, function () {
        console.log('success');

    }).done(function () {
        $(button).hide();
        var buttonId = '#' + roomId;
        console.log('buttonId: ' + buttonId);
        $(buttonId).show(); 
        var curr = $(buttonId);
        console.log('done');
    }).catch(function (err) {
        return console.error(err.toString());
    });
}