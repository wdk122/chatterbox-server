// YOUR CODE HERE:
// https://api.parse.com/1/classes/chatterbox

var app = {
  server: 'https://api.parse.com/1/classes/chatterbox',
  friends: {},
  messages: [],
  currentRoom: 'all',
  roomList: {'all': 'all'},


  init: function(){
    $('#send').on('submit', function(ev){
      ev.preventDefault();
      app.handleSubmit();
    });
    $('#make-room').on('submit', function(ev){
      ev.preventDefault();
      var roomname = $('#room-name').val();
      $('#room-name').val('');
      app.addRoom(roomname);
      app.roomList[roomname] = roomname;
      app.currentRoom = roomname;
      app.addTab(roomname);
      app.filterRoom();
    });
    $('#main').on('click', '.username', function(ev){
      app.addFriend(ev);
    });
    $('#roomSelect').change(function(ev){
      app.currentRoom = $(ev.currentTarget).val();
      app.addTab(app.currentRoom);
      app.filterRoom();
    });
    $('#tabs').on('click', '.tab', function(ev){
      $('.selected').removeClass('selected');
      app.currentRoom = $(ev.currentTarget).html();
      app.filterRoom();
      $(ev.currentTarget).addClass('selected');

    });
    app.fetch();
    setInterval(function(){
      app.fetch();
    }, 10000);
  },

  deinit: function(){
    $('#send').off();
    $('#main').off();
  },

  send: function(message){
    $.ajax({
      url: app.server,
      type: 'POST',
      data: JSON.stringify(message),
      success: function(data){
        app.fetch();
      }
    });
  },

  fetch: function(){
    $.ajax({
      url: app.server,
      data: {order: '-createdAt'},
      type: 'GET',
      success: function(data){
        app.messages = data.results;
        app.filterRoom();
        app.boldFriends();
        app.createRoomList(app.messages);
      }
    });
  },

  clearMessages: function(){
    $('#chats').html('');
  },

  addMessage: function(message){
    var messageNode = $('<div>').attr('class', 'message');
    var username = '<span class="username" data-username="' + message.username + 
      '">' + message.username + ': </span>';
    var text = '<span class="text">' + _.escape(message.text) + '</span>';
    messageNode.html(username + text);
    $('#chats').append(messageNode);
  },

  addRoom: function(roomname){
    $('#roomSelect').append('<option value="' + roomname + '">' + roomname + '</option>');
  },

  createRoomList: function(msgs){
    var newRooms = [];
    msgs.forEach(function(msg){
      var room = _.escape(msg.roomname);
      if(!(room in app.roomList)){
        newRooms.push(room);
      }
      app.roomList[room] = room;
    });

    
    newRooms.forEach(function(room){
      app.addRoom(room);
    });
  },

  filterRoom: function(){
    app.clearMessages();
    app.messages.forEach(function(msg){
      if(msg.roomname === app.currentRoom ||
         app.currentRoom === 'all'){
        app.addMessage(msg);
      }
    });
  },

  addTab: function(rName){
    $('.selected').removeClass('selected');
    $('#tabs').append('<div class="tab selected">' + rName + '</div>');
  },

  addFriend: function(friend){
    var username = $(friend.target).data('username');
    app.friends[username] = username;
    app.boldFriends();
  },

  boldFriends: function(){
    $('#chats').children().each(function(i, msg){
      var username = $(msg).find('.username').data('username');
      if(username in app.friends){
        $(msg).addClass('friend');
      }
    });
  },

  handleSubmit: function(){
    var submittedMsg = {
      username: window.location.search.split('username=')[1],
      text: $('#message').val(),
      roomname: app.currentRoom
    };
    $('#message').val('');
    app.send(submittedMsg);
  }
};
