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
    //console.log($(this));
    //console.log(form.children()[0]);
    //var roomName = form.attributes[2].val();
    //var roomName1 = $(this).children('button').attr('data-roomName');
    console.log(roomName);

    $.post('/Chat/JoinRoom', { roomName: roomName }, function () {
        console.log('success');
        //$.post('/Chat/ListRooms/', {}, function () {
        //    console.log('returned');
        //})
    }).done(function () {
        $(button).hide();
        var buttonId = '#' + roomId;
        console.log('buttonId: ' + buttonId);
        var btn = $(buttonId);

        $(buttonId).show(); 
        //var tmp = $('#r4');
        var curr = $(buttonId);
        //$('#r4').show();
        //$(button).parents().hide();
        console.log('done');
    }).catch(function (err) {
        return console.error(err.toString());
    });
}