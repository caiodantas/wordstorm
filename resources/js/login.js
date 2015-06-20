$(function(){

var txtLogin = $('#txtLogin');
var txtPass = $('#txtPass');
var btnLogin = $('#btnLogin');

txtLogin.val('bcuser');
txtPass.val('nihon2015');

function blockLoginUI()
{
	btnLogin.off('click');
	txtLogin.prop('disabled', true);
	txtPass.prop('disabled', true);
}
function enableLoginUI()
{
	btnLogin.on('click', testCredentials);
	txtLogin.prop('disabled', false);
	txtPass.prop('disabled', false);
}

var testCredentials = function()
{
	//client-side validation

	// if(txtLogin.val().trim() === '' || )

	blockLoginUI();

	var credentials = {
			user: txtLogin.val(),
			pass: txtPass.val()
		};

	$.ajax(
	{
		url: '/checkcredentials',
		type: 'POST',
		data: credentials,
		success: function(data)
		{
			if(data === 'wordstorm:success')
			{
				window.location = '/admin';
			}
			else
			{
				// display error message
			}

			enableLoginUI();
		},
		error: function(data)
		{
			enableLoginUI();	
		},
		fail: function()
		{
			console.log('ajax failed');
			enableLoginUI();
		},
		timeout: 10000
	});
};

$(window).load(function()
{
	$('#loadingDiv').hide();
	$('#loginDiv').show();

	btnLogin.on('click', testCredentials);
});

});