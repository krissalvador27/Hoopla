$(document).ready(function() {

  var wait = false;
  var email;

  $('.warning').delay(6000).fadeOut();

  $('.login_button').on('click', function(){

    $('.login_button').hide();
    $('.loading_button').show();

  });

  if ($('.success').html() == 'Sign up was successful.') {
    $('.success').html('Sign up was successful.<br>Sending an access code to your email.');
    sendEmail();
  }

  function sendEmail() {
        var email = $('.email_enter').val();
         $.ajax({
           url: '/send_email',
           data: {email: email},  
           dataType: 'json',
           error: emailError,
           success: emailSuccess
        });
  }


  $('.enter').keyup(function(event){
      if(event.keyCode == 13){
          $('.send_email').click();
      }
  });

  function emailError(response) {

    if ($('div:hidden').length === 2) {
      $('.warn').html('Something went wrong with validating your email and password...sorry.').fadeIn().delay(3000).fadeOut();
      $('.loading').hide();
      $('.send_email').show();
    }
    wait = false;
  }

  function emailSuccess(response) {
    $('.loading').hide();
    $('.send_email').show();
    wait = false;
    if (!response.response) {
      if ($('div:hidden').length === 2) {
        $('.warn').html('Please provide a valid email address').fadeIn().delay(3000).fadeOut();
      }
    }
  }

  function parseEmailForDomain() {
    var email_copy = email;
    var emailSplit = email_copy.split('@');
    var afterAt = emailSplit[1];
    var domain = afterAt.split('.');
    return domain[0];
  }

  function domainError(response) {
    console.log('domainError');
  };

  function domainSuccess(response) {
    console.log('domainSuccess');
  };

  function emailValid(response) {
      var dname = parseEmailForDomain();
      $.ajax({
        url: '/domain',
        data: { domain_name: dname },
        dataType: 'json',
        type: 'POST',
        error: domainError,
        success: domainSuccess
      });

      console.log('res: '+response);
      var email = $('.email_enter').val();
      var password = $('.password').val();

      if (response.email && response.password) {
        // get the text in the email form
        var email = $('.email_enter').val();
        $('.loading').show();
        $('.send_email').hide();

        // create the new user
        $('.form').submit();
      }
      else if (!response.email){
        if ($('div:hidden').length === 2) {
          $('.warn').html('Please provide a valid email address').fadeIn().delay(3000).fadeOut(400, function() {wait = false;});
        }
      }
      else{
        if ($('div:hidden').length === 2) {
          $('.warn').html('Please provide a password that is only numbers and letters').fadeIn().delay(3000).fadeOut(400, function() {wait = false;});
        }
      }

  }

  $('.send_email').on('click', function() {

    if (!wait) {
      wait = true;
      // get the text in the email form
      email = $('.email_enter').val();
      var password = $('.password').val();

      if (email === '') {
        if ($('div:hidden').length === 2) {
          $('.warn').html('Please enter an email address').fadeIn().delay(3000).fadeOut(400, function() {wait = false;});
        }
      }
      else if (password === '') {
        if ($('div:hidden').length === 2) {
          $('.warn').html('Please enter a password').fadeIn().delay(3000).fadeOut(400, function() {wait = false;});
        }
      }
      else if (password.length < 6) {
        if ($('div:hidden').length === 2) {
          $('.warn').html('Password must be more than 6 characters long').fadeIn().delay(3000).fadeOut(400, function() {wait = false;});
        }
      }
      else if (password.indexOf(' ') !== -1) {
        if ($('div:hidden').length === 2) {
          $('.warn').html('Password must not contain white space').fadeIn().delay(3000).fadeOut(400, function() {wait = false;});
        }
      }
      else {
        $.ajax({
          url: '/validate_email',
          data: {email: email, password: password},
          dataType: 'json',
          error: emailError,
          success: emailValid
        });
      }
    }
  });

});