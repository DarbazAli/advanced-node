$(document).ready(function () {

    let socket = io();
  
      // Form submittion with new message in field with id 'm'
      $('form').submit(function () {
          var messageToSend = $('#m').val();
          //send message to server here?
          $('#m').val('');
          return false; // prevent form submit from refreshing page
      });
  
  
  
  });
  