$(document).ready(function() {

  var wait = false;
  var up   = true;

  $('.create_hoop').on('click', function() {
      if (!wait) {
        wait = true;

        if (up) {
        $('.create_hoop').html('Hide post');
        $('table').animate({ 
        top: "+=260px",
      }, 400 ,function(){
        up = false;
        wait = false;
        $('.new_post').fadeIn('fast');
      });
    
      }
      else {
        $('.create_hoop').html('<span class="fa fa-pencil"> New Post</span>');
        $('.new_post').fadeOut('fast');
        $('table').animate({ 
          top: "-=260px",
      }, 400 ,function(){
        up = true;
        wait = false;
        
      });
      }
    }


  });

  $('.star-holder').on('click', function() {

    var hoopid = $(this).data('hoopid');
    var score = parseInt($(this).children().eq(1).html());
    var thisObj = $(this);
    console.log(hoopid);
    console.log(score);
    console.log(thisObj);
    

    $.ajax({
      url: '/plus_one_hoop',
      data: {
        hoop_id: hoopid,
      },
      type: 'POST',
      dataType: 'json',
      error: function (err) {
        console.log(err);
      },
      success: function (data) {
        if (data.response == 200) {
          score += 1;
          thisObj.children().eq(1).html(' '+score);
          thisObj.css('color','rgb(72, 197, 182)');
          console.log('new plus');

        }
        if (data.response == 'already') {
          console.log('old');
          score -= 1;
          thisObj.children().eq(1).html(' '+score);
          thisObj.css('color', '#7c7c7c');
        }
      }

  });
  });


  $('.create_hoopla').on('click', function() {

        $('.loading_button').show();
        $('.create_hoopla').hide();
        var title = $('#create_hoop_title').val();
        var body = $('#create_hoop_content').val();
        var domain = $('.domain').html();
        domain = domain.slice(1);
        console.log(domain);
        console.log(title);
        console.log(body);

        if (title !== '' && body !== '') {
          $.ajax({
            url: '/hoop',
            data: {
              domain_name: domain,
              image_link: 'fu_this_link.jpg',
              hoop_title: title,
              hoop_body: body
            },
            type: 'POST',
            dataType: 'json',
            error: function () {
              window.location.href = '/home';
            },
            success: function () {
              window.location.href = '/home';
              }
          
          });
      }
      else{
        $('.loading_button').hide();
        $('.create_hoopla').show();
      }


  });










});