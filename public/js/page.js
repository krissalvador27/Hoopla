
$(document).ready( function () {

	function goToByScroll(id){
	    $('html,body').animate({
	        scrollTop: $("#"+id).offset().top},
	        'slow');
	}

	$('#la_scroller').on('click', function (e) {
		e.preventDefault();

		goToByScroll('la_input');
	});

	$('.hoopla_home').on('click', function() {
		window.location.href = "/home";
	});


	$('.star-holder').on('click', function() {

	  var hoopid = $(this).data('hoopid');
	  var score = parseInt($(this).children().eq(1).html());
	  var thisObj = $(this);
	  

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

	$('#la_submit').on('click', function () {
		$('.loading_button').show();
		$('#la_submit').hide();

		if ($('#la_input').val().length > 0) {

		$.ajax({
		  url: '/la',
		  data: {
		  	la_body : $('#la_input').val(),
		  	hoop_id : $('#hoop_title').data('id')
		  },
		  type: 'POST',
		  dataType: 'json',
		  error: function () {
		  	$('.loading_button').hide();
				$('#la_submit').show();
		  },
		  success: function () {
		  	window.location.reload(true);
		  }
		});
	}
	else{
		$('.loading_button').hide();
		$('#la_submit').show();
	}
	});
});