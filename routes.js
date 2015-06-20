
// var gravatar = require('gravatar');

module.exports = function(app,io){

	app.get('/', function(req, res){

		res.render('widget');
	});

	app.get('/admin', function(req, res){

		var user = req.session.cred1st;
		var pass = req.session.cred2nd;

		if(user === 'bcuser' && pass === 'nihon2015')
		{
			res.render('admin');
		}
		else
		{
			res.redirect('/writecredentials');
		}
	});

	app.get('/writecredentials', function(req, res)
	{
		var user = req.session.cred1st;
		var pass = req.session.cred2nd;

		if(user === 'bcuser' && pass === 'nihon2015')
		{
			res.redirect('/admin');
		}
		else
		{
			res.render('login');
		}
	});

	app.get('/clearcredentials', function(req, res)
	{
		req.session.cred1st = '';
		req.session.cred2nd = '';

		res.redirect('/writecredentials');
	});

	app.post('/checkcredentials', function(req, res)
	{
		var user = req.body.user;
		var pass = req.body.pass;

		if(user === 'bcuser' && pass === 'nihon2015')
		{
			req.session.cred1st = req.body.user;
			req.session.cred2nd = req.body.pass;
			res.end('wordstorm:success');
		}
		else
		{
			res.end('wordstorm:error');
		}
	});

	app.get('/:token', function(req, res){
		
		if(req.params.token === 'rpauTLWBJOFbfv62o7aFjapVKiqbqXXDg')
		{
			res.redirect('/js/wordstormlauncher.js');
		}
		else
		{
			res.end('404 not found');
		}
	});

	//define application

	var rooms = [];
	var admins = [];
	var users = [];
	var waitingUsers = [];

	var maxRooms = 1;
	var maxRooms = 1000000;

	var chat = io.on('connection', function(socket)
	{
		function joinRoom(id)
		{
			if(socket.joinedRooms === undefined)
			{
				socket.joinedRooms = [];
			}

			socket.joinedRooms.push({roomID: id, user: 'user' + id});
			socket.join(id);
		}

		function hasRoom(id)
		{
			for(var i = 0; i < rooms.length; i++)
			{
				if(rooms[i] === id)
				{
					return true;
				}
			}

			return false;
		}

		function createRoom(socket)
		{
			var id = Math.round((Math.random() * maxRooms));
			// var room = getRoom(io, id);
			if(rooms.length >= maxRooms)
			{
				console.log('server full');
				socket.emit('serverIsFull');
				return undefined;
			}
			

			if(hasRoom(id)) 
			{
				console.log('retry create');
				createRoom(socket);
			}
			else
			{
				joinRoom(id);
				rooms.push(id);

				return id;
			}
		}

		function listRooms()
		{
			for(var i = 0; i < admins.length; i++)
			{
				admins[i].emit('listRooms', rooms);
			}

			// console.log('list', rooms);
		}

		function removeAdmin(adminID)
		{
			var index = -1;
			for(var i = 0; i < admins.length; i++)
			{
				if(adminID === admins[i].adminID)
				{
					index = i;
					break;
				}
			}
			if(index > -1)
			{
				admins.splice(index, 1);
			}
		}

		function leaveRoom(socket, roomObj, disconnected)
		{
			socket.broadcast.to(roomObj.roomID).emit('leave', roomObj);
			socket.leave(roomObj.roomID);
			arrRemove(rooms, roomObj.roomID);

			if(!disconnected)
			{
				removeJoinedRoom(socket, roomObj.roomID);
			}

			console.log('left: ' + roomObj.roomID);
		}

		function emitAdminStatus(socket)
		{
			if(admins.length <= 0)
			{
				socket.emit('adminIsOffline');
				waitingUsers.push(socket);
			}
			else
			{
				socket.emit('adminIsOnline');
			}
		}

		function notifyWaitingUsers()
		{
			if(admins.length > 1)
			{
				return;
			}

			for(var i = 0; i < waitingUsers.length; i++)
			{
				waitingUsers[i].emit('adminIsOnline');
			}

			waitingUsers.splice(0, waitingUsers.length);
		}

		function removeUserByRoomID(roomID)
		{
			var index = -1;
			for(var i = 0; i < users.length; i++)
			{
				if(users[i].joinedRooms[0].roomID === roomID)
				{
					index = i;
					break;
				}
			}
			if(index > -1)
			{
				users.splice(index, 1);
			}
		}



		socket.on('registerAdmin', function()
		{
			socket.adminID = admins.length;
			admins.push(socket);

			notifyWaitingUsers();
		});

		socket.on('createRoom', function()
		{
			var roomID = createRoom(socket);

			//if server is full
			if(roomID === undefined)
			{
				return;
			}

			users.push(socket);
			emitAdminStatus(socket);

			listRooms();
			console.log('create: ' + rooms[rooms.length-1]);
		});

		socket.on('listRooms', function()
		{
			socket.emit('listRooms', rooms);
			// console.log('list', rooms);
		});

		socket.on('sendMessage', function(data)
		{
			chat.in(data.roomID).emit('addMessage', data);
		});

		//from admin
		socket.on('startChat', function(roomID)
		{
			//if room.length > 0 : user already served by another admin
			//else
			joinRoom(roomID);
			console.log('join: ' + roomID);

			chat.in(roomID).emit('openChatWindow', roomID);
		});

		socket.on('endChat', function(roomObj)
		{
			leaveRoom(socket, roomObj, false);
			socket.emit('listRooms', rooms);
		});

		socket.on('leaveRoom', function(room)
		{
			socket.leave(room.roomID);
			removeJoinedRoom(socket, room.roomID);

			socket.emit('enableNewRoomCreation');
		});



		socket.on('disconnect', function()
		{
			var adminID = socket.adminID;
			var adminJoinedRooms = socket.joinedRooms;

			if(socket.joinedRooms !== undefined)
			{
				for(var i = 0; i < socket.joinedRooms.length; i++)
				{
					var room = socket.joinedRooms[i];
					var roomID = room.roomID;
					leaveRoom(socket, room, true);
				}
			}

			//if user
			if(adminID === undefined)
			{
				if(socket.joinedRooms !== undefined && socket.joinedRooms.length > 0)
				{
					removeUserByRoomID(socket.joinedRooms[0].roomID);
				}

				listRooms();
				// console.log('list', rooms);

				return;
			}

			removeAdmin(adminID);

			console.log('remove-admin: ' + adminID);

			if(admins.length <= 0)
			{
				for(var i = 0; i < users.length; i++)
				{
					waitingUsers.push(users[i]);
					users[i].emit('adminIsOffline');
				}
			}
		});
	});
};

function getRoom(io,roomId, namespace) 
{
	var res = [],
		ns = io.of(namespace || "/");    // the default namespace is "/"

	if (ns) 
	{
		for (var id in ns.connected) 
		{
			if(roomId) 
			{
				var index = ns.connected[id].rooms.indexOf(roomId) ;
				if(index !== -1) 
				{
					res.push(ns.connected[id]);
				}
			}
			else 
			{
				res.push(ns.connected[id]);
			}
		}
	}
	return res;
}

function arrRemove(arr, value)
{
	var index = -1;
	for(var i = 0; i < arr.length; i++)
	{
		if(arr[i] === value)
		{
			index = i;
			break;
		}
	}
	if(index > -1)
	{
		arr.splice(index, 1);
	}
}

function removeJoinedRoom(socket, roomID)
{
	if(socket === undefined)
	{
		return;
	}

	var joinedRooms = socket.joinedRooms;
	if(joinedRooms === undefined)
	{
		return;
	}

	var index = -1;
	for(var i = 0; i < joinedRooms.length; i++)
	{
		if(joinedRooms[i].roomID === roomID)
		{
			index = i;
			break;
		}
	}
	if(index > -1)
	{
		socket.joinedRooms.splice(index, 1);
	}
}


