
$(function(){

	var idPrefix = 'wordstormWidget_';
	var systemName = 'SYSTEM';
	var systemRoom = 'systemMsg2012';
	var listenAdminStatus = false;

	var msgComponent = 0;
	var widgetDiv = undefined;
	var chatArea = undefined;
	var socket = undefined;
	var msgList = undefined;
	var msgAreaToScroll = undefined;

	if(typeof wordstorm_AS_ADMIN === "undefined")
	{
		wordstorm_AS_ADMIN = false;
	}


	
	if(wordstorm_AS_ADMIN !== true)
	{
		//render widget
		var body = $('body');
		widgetDiv = $("<div id='wordstormWidget'></div>");

		widgetDiv.css(
		{
			display: 'none',
			position: 'fixed',
			right: '5px',
			bottom: '0px'
		});


		widgetDiv.append("<div id='wordstormWidget_header'><span>Wordstorm Chat</span></div><div id='wordstormWidget_content'><div id='wordstormWidget_chatArea'></div></div><div id='wordstormWidget_footer'><div id='wordstormWidget_chatControls'><div id='wordstormWidget_divTextarea'><textarea id='wordstormWidget_txtMsg' maxlength='1000' placeholder='メッセージを入力ください。' disabled='true'></textarea></div><div id='wordstormWidget_divButtons'><div id='wordstormWidget_btnSend' class='wordstormWidget_btnDisabled'>送信</div><div id='wordstormWidget_btnAttach' class='wordstormWidget_btnDisabled'>添付</div></div></div><div id='wordstormWidget_chatReconnect'><div id='wordstormWidget_btnReconnect'>再接続</div></div></div>");
		body.append(widgetDiv);

		var originalHeight = widgetDiv.height();

		var chatHeader = $('#' + idPrefix + 'header');
		var chatContent = $('#' + idPrefix + 'content');
		var chatFooter = $('#' + idPrefix + 'footer');
		var chatControls = $('#' + idPrefix + 'chatControls');
		var chatReconnect = $('#' + idPrefix + 'chatReconnect');
		var btnReconnect = $('#' + idPrefix + 'btnReconnect');
		chatArea = $('#' + idPrefix + 'chatArea');

		chatHeader.data('isMinimized', true);
		chatHeader.data('firstOpen', true);

		function hideWidgetBody()
		{
			chatContent.hide();
			chatFooter.hide();
			widgetDiv.css('height', chatHeader.css('height'));

			chatHeader.data('isMinimized', true);
		}
		hideWidgetBody();

		function showWidgetBody()
		{
			chatContent.show();
			chatFooter.show();
			widgetDiv.css('height', originalHeight + 'px');

			chatHeader.data('isMinimized', false);
		}

		chatHeader.on('click', function()
		{
			var me = $(this);
			if(me.data('firstOpen'))
			{
				startSockets();
				me.data('firstOpen', false);

				showWidgetBody();
				return;
			}

			if(me.data('isMinimized'))
			{
				showWidgetBody();
				return;
			}

			hideWidgetBody();
		});
		
		msgComponent = $("<div id='wordstormWidget_msgComponent'><div class='wordstormWidget_msgBalloon'><h2>お客様</h2><span>テストメッセージ</span></div><span style='display: block;'></span></div>");
	}
	else
	{
		msgComponent = $('#' + idPrefix + 'msgComponent');
		chatArea = $('#' + idPrefix + 'chatArea');
	}


	var txtMsg = $('#' + idPrefix + 'txtMsg');
	var btnSend = $('#' + idPrefix + 'btnSend');
	var btnAttach = $('#' + idPrefix + 'btnAttach');
	var usernameDiv = undefined;

	var currentRoomID = -1;
	var wordstorm_USER = 'user';
	var buttonsEnabled = false;
	
	var joinedRooms = [];

	if(wordstorm_AS_ADMIN)
	{
		wordstorm_USER = 'admin';
	}

	if(wordstorm_USER === 'admin')
	{
		usernameDiv = $('#' + idPrefix + 'username');
	}
	

	function joinedRoom(roomID)
	{
		for(var room of joinedRooms)
		{
			if(room.roomID === roomID)
			{
				return true;
			}
		}

		return false;
	}

	function removeFromJoinedRooms(roomID)
	{
		var index = -1;
		for(var i = 0; i < joinedRooms.length; i++)
		{
			if(joinedRooms[i].roomID === roomID)
			{
				index = i;
			}
		}

		if(index >= 0)
		{
			joinedRooms.splice(index, 1);
		}
	}

	function getRoomObj(roomID)
	{
		for(var room of joinedRooms)
		{
			if(room.roomID === roomID)
			{
				return room;
			}
		}

		return undefined;
	}

	function scrollToBottom()
	{
	    var height = 0;
	    function scroll(height, ele) 
	    {
	        this.stop().animate({ scrollTop: height }, 250, function () {            
	            var dir = height ? "top" : "bottom";
	            $(ele).html("scroll to "+ dir).attr({ id: dir });
	        });
	    };

        height = height < msgAreaToScroll[0].scrollHeight ? msgAreaToScroll[0].scrollHeight : 0;
        scroll.call(msgAreaToScroll, height, this);
	}

	function disableChatButtons()
	{
		if(!buttonsEnabled)
		{
			return;
		}

		btnSend.off('click');
		// btnAttach.off('click');

		btnSend.addClass('wordstormWidget_btnDisabled');
		// btnSend.addClass('btnDisabled');

		buttonsEnabled = false;
	}

	function enableChatButtons()
	{
		if(buttonsEnabled)
		{
			return;
		}

		btnSend.on('click', sendMsgOnClick);
		// btnAttach.on('click', attachFile);

		btnSend.removeClass('wordstormWidget_btnDisabled');
		// btnAttach.removeClass('btnDisabled');

		buttonsEnabled = true;
	}

	function verifyEmptyMsg()
	{
		if(txtMsg.val().trim() === '')
		{
			disableChatButtons();
		}
	}

	function createMessage(roomID, header, text)
	{
		var msg = $( msgComponent.html() );

		msg.find('h2').text(header);
		var span = msg.find('span');
		span.text(text);

		//server is full or sudden server down
		if(roomID === systemRoom)
		{
			chatArea.append(msg);
			scrollToBottom();
			return;
		}

		if(wordstorm_USER === 'admin')
		{
			var roomObj = getRoomObj(roomID);

			//[TODO] standardize
			roomObj.html += msg[0].outerHTML;
			roomObj.html += msg[2].outerHTML;
			
			if(currentRoomID === roomID)
			{
				msgList.append(msg);
			}
		}
		else
		{
			chatArea.append(msg);
		}

		scrollToBottom();
	}

	function sendMsgOnClick()
	{
		var message = txtMsg.val().trim();
		
		txtMsg.val('');
		disableChatButtons();

		if(message === '')
		{
			return;
		}

		socket.emit('sendMessage', { user: 'user' + currentRoomID, msg: message, type: wordstorm_USER, roomID: currentRoomID });
	}

	function sendMsgOnEnter(e)
	{
		if(e.which === 8 && $(this).val().trim() === '')
		{
			// e.preventDefault();
			return;
		}

		if(currentRoomID < 0)
		{
			$(this).val('');
			disableChatButtons();
			return;
		}

		if(e.which === 13) //pressed [ENTER]
		{
			var textArea = $(this);
			var message = textArea.val().trim();
			
			e.preventDefault();
			textArea.val('');
			disableChatButtons();

			if(message === '')
			{
				return;
			}

			socket.emit('sendMessage', { user: 'user' + currentRoomID, msg: message, type: wordstorm_USER, roomID: currentRoomID });
		}
		else
		{
			enableChatButtons();
		}
	}

	function startSockets()
	{
		socket = io();

		function createRoom(socket)
		{
			socket.emit('createRoom');
			listenAdminStatus = true;
		}

		function restoreUIAndReconnect()
		{
			btnReconnect.off('click');

			chatReconnect.hide();
			chatControls.show();

			if(currentRoomID === -1)
			{
				socket.emit('createRoom');
			}
		}

		if(!wordstorm_AS_ADMIN)
		{
			socket.on('connect', function()
			{
				createRoom(socket);
			});
		}
		else
		{
			socket.on('connect', function()
			{
				
			});
		}

		if(!wordstorm_AS_ADMIN)
		{
			socket.on('enableNewRoomCreation', function()
			{
				chatControls.hide();
				chatReconnect.show();

				btnReconnect.on('click', restoreUIAndReconnect);
			});

			socket.on('adminIsOffline', function()
			{
				if(!listenAdminStatus)
				{
					return;
				}
				// chatArea.empty();

				createMessage(systemRoom, systemName, 'ただいま管理者はオフラインです。オンラインになりましたら、こちらで通知致します。');
			});

			socket.on('adminIsOnline', function()
			{
				createMessage(systemRoom, systemName, '対応できる管理者を探しています。少々お待ちください。');
			});
		}

		socket.on('openChatWindow', function(roomID)
		{
			listenAdminStatus = false;

			msgAreaToScroll.empty();

			currentRoomID = roomID;
			createMessage(roomID, systemName, 'チャットが開始しました');

			txtMsg.on('keydown', sendMsgOnEnter);
			txtMsg.on('keyup', verifyEmptyMsg);
			txtMsg.prop('disabled', false);
		});

		socket.on('leave', function(data)
		{
			listenAdminStatus = false;

			if(currentRoomID !== data.roomID)
			{
				return;
			}

			txtMsg.prop('disabled', true);
			disableChatButtons();
			txtMsg.val('');

			var systemMessage = 'adminがチャットを終了しました';

			if(wordstorm_USER === 'admin')
			{
				usernameDiv.text('');
				systemMessage = data.user + 'がチャットを終了しました';
			}

			createMessage(data.roomID, systemName, systemMessage);
			currentRoomID = -1;

			socket.emit('leaveRoom', data);
		});

		socket.on('addMessage', function(data)
		{
			var other = 'Admin';
			if(wordstorm_USER === 'admin')
			{
				other = 'お客様';
			}

			var you = 'あなた';
			var userType = data.type.toLowerCase();
			var sender = 'unknown-sender';

			if( userType === wordstorm_USER )
			{
				sender = you;
			}
			else
			{
				if(userType !== 'admin' && userType !== 'user')
				{
					console.log('WARNING: ' + sender + ' sent ' + data.msg);
					return;
				}

				sender = other;
			}

			createMessage(data.roomID, sender, data.msg);
		});

		socket.on('serverIsFull', function()
		{
			if(wordstorm_AS_ADMIN)
			{
				var msg = 'WARNING: server full for admin';
				console.log(msg);

				if (!window.location.origin) {
				  window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
				}

				socket.emit('serverMessage', msg + "\n at: " + window.location.origin);
				return;
			}

			chatArea.empty();
			createMessage(systemRoom, systemName, 'ただいまサーバーは混在しておりますので、少々お待ちください。');
		});
	}


	if(wordstorm_USER !== 'admin')
	{
		msgAreaToScroll = chatArea;

		$('#wordstormLoadingDiv').remove();
		widgetDiv.show();

		chatHeader.trigger('click');
		return;
	}


	//everything below is only for admin

	function startApplication()
	{
		var divComponent = $('#' + idPrefix + 'divComponent');
		var divUsersHeader = $('#' + idPrefix + 'divUsersHeader');
		var divUsers = $('#' + idPrefix + 'users');
		msgList = chatArea.find('#' + idPrefix + 'messages');

		msgAreaToScroll = msgList;


		function controlStateColors(control)
		{
			$('.chatRoomItemFix').each(function()
			{
				var element = $(this);
				element.removeClass('chatRoomItemFix');
				element.addClass('chatRoomItem');
				element.find('.' + idPrefix + 'cell').addClass('colorWhite');
			});

			control.removeClass('chatRoomItem');
			control.find('.' + idPrefix + 'cell').removeClass('colorWhite');
			control.addClass('chatRoomItemFix');
		}

		socket.on('listRooms', function(data)
		{
			divUsers.empty();
			divUsers.append( $(divUsersHeader.html()) );

			for(var i = 0; i < data.length; i++)
			{
				console.log();
				var userDiv = $(divComponent.html());
				var spanUser = userDiv.find('#' + idPrefix + 'spanUser');
				spanUser.text( 'user' + data[i] );
				var closeBtn = userDiv.find('#' + idPrefix + 'spanBtn');

				var roomID = data[i];
				userDiv.data('roomID', roomID);

				closeBtn.data('roomID', roomID);
				closeBtn.data('spanUser', spanUser.text);
				closeBtn.data('userDiv', userDiv);
				userDiv.data('closeBtn', closeBtn);

				userDiv.on('click', function()
				{
					var me = $(this);
					var prevRoom = currentRoomID;
					var roomID = me.data('roomID');
					var closeBtn = me.data('closeBtn');

					if(prevRoom === roomID)
					{
						return;
					}

					var lblUser = me.find('#' + idPrefix + 'spanUser');
					usernameDiv.text(lblUser.text());
					currentRoomID = roomID;

					if(!joinedRoom(roomID))
					{
						joinedRooms.push({roomID: roomID, html: ''});
						msgList.empty();
						socket.emit('startChat', roomID);
					}
					else
					{
						msgList.empty().html(getRoomObj(roomID).html);
					}

					txtMsg.prop('disabled', false);


					controlStateColors(me);

					//only delete if chat started
					closeBtn.on('click', function()
					{
						var me = $(this);
						me.off('click');
						var roomID = me.data('roomID');

						createMessage(roomID, systemName, 'チャットが終了しました');
						txtMsg.prop('disabled', true);

						if(!joinedRoom(roomID))
						{
							return;
						}
						removeFromJoinedRooms(roomID);

						if(currentRoomID === roomID)
						{
							currentRoomID = -1;
						}


						var userDiv = me.data('userDiv');				
						userDiv.off('click');

						var user = me.data('spanUser');
						socket.emit('endChat', { roomID: roomID, user: user });

						var element = userDiv.find('.chatRoomItem');
						element.removeClass('chatRoomItem');
						element.addClass('deletedItem');
					});
				});

				

				if(currentRoomID === roomID)
				{
					controlStateColors(userDiv);
				}

				divUsers.append(userDiv);
			}
		});

		socket.emit('registerAdmin');
		socket.emit('listRooms');
	}

	startSockets();
	startApplication();	
});