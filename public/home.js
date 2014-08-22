
$(document).ready( function () {

	$('#create_hoop').on('click', function() {
		var modalButtons = {
				"Let's Hoop!" : function () {

					$.ajax({
					  url: '/hoop',
					  data: {
					  	domain_name: $('#domain_name').html(),
					  	image_link: 'fu_this_link.jpg',
					  	hoop_title: $(this).find('#create_hoop_title').val(),
					  	hoop_body: $(this).find('#create_hoop_content').val()
					  },
					  type: 'POST',
					  dataType: 'json',
					  error: function () {
					  	alert('Fatal error');
					  },
					  success: function () {
					  	modal.remove();
					  	var modal_success = $('#modal_success').clone();
					  	modal_success.dialog({
					  		title: "Hoopla!",
					  		width: 440,
					  		height: 350,
					  		modal: true,
					  		resizable: true,
							close: function(){window.location.reload(true);}
					  	});
					  }
					});


				}
			},
			modalTitle = "What's Your Hoop?",
			modal = $('#modal_form').clone();

		modal.dialog({
			title: modalTitle,
			modal: true,
			resizeable: true,
			buttons: modalButtons
		});
	});
	
	$('.star-holder').on('click', function(ev){
	console.log($(ev.target).data('id'));
		$.ajax({
		  url: '/plus_one_hoop',
		  data: {
			hoop_id: $(ev.target).data('id')
		  },
		  type: 'POST',
		  dataType: 'json',
		  success: function () {
			console.log('successfully plused 1');
		  }
		});
	});

});