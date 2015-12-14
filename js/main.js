var scoreUp	= null;
$(function() {
	var stat	= 0;
	var game	= Game('bord');
	var player	= {id: 'player', maxSpeed: 1.5, accel: 0.2, object: null};
	var count	= 0;
	var prefix	= 'game_';
	var score	= 0;
	var high	= 0;

	initGame(); 
	scoreUp = function() {
		if (stat !== 1) return;
		var id		= prefix + score;
		var top		= Math.random() * game.max.height;
		var left	= Math.random() * game.max.width;
		game.newObject(id, {className: 'game game-circle'});
		$("#" + id).css({top: top, left: left});
		$('#score').text(++score);
		game.moveSimple(id, Math.random() * 2, Math.random() * 2, true);
		setTimeout('scoreUp()', 1000);
	};

	function initGame() {
		game.newObject(player.id, {className: 'game game-circle game-color-primary'});
		game.setEvent(
			player.id,
			function(object1, object2) {
				return game.simpleCheck(object1, object2, 2);
			},
			function(object1, object2) {
				stat	= -1;
				count++;
				game.stop();
				$('#message').modal('show');
				$('#history tbody').append('<tr><td>' + count + '</td><td>' + score + '</td></tr>');
				if (score > high) {
					$("#hightscore").text(score);
					high	= score;
				}
			}
		);
		$('#' + player.id).css({top: game.max.height - 40, left: game.max.width / 2});
		player.object	= game.getObject(player.id);
	};

	/**
	 * title
	 */
	var title	= Game('title');
	title.start();
	titleView(9);
	function titleView(i) {
		var id	= 'title_' + i;
		$('#' + id).removeClass('invisible');
		title.setObject(id);
		title.setEvent(
			id,
			function(object1, object2) {
				return title.simpleCheck(object1, object2, 0);
			},
			function(object1, object2) {
				title.putBound(object1, object2, 'w');
			}
		);
		title.move(id, 10, 0, 0, 0, 0.02, 0, true);
		if (i > 0) setTimeout(titleView, 300, --i);
	}

	/**
	 * asobi
	 */
	var asobi	= Game('navigation');
	asobi.setObject('start');
	asobi.move('start', 0, 0, 0, 0, 0.2, 0.2, true);
	$('#start').on('mouseenter', function() {
		asobi.move('start', (Math.random() - 1) * 10, (Math.random() - 1) * 10, 0, 0, 0, 0, true);
		asobi.start();
	})

	function left() {
		if (stat && player.object.vector.w - player.accel >= player.maxSpeed * -1)
			game.moveLeft(player.id, player.accel, true);
	}
	function up() {
		if (stat && player.object.vector.h - player.accel >= player.maxSpeed * -1)
			game.moveUp(player.id, player.accel, true);
	}
	function down() {
		if (stat && player.object.vector.h + player.accel <= player.maxSpeed)
			game.moveDown(player.id, player.accel, true);
	}
	function right() {
		if (stat && player.object.vector.w + player.accel <= player.maxSpeed)
			game.moveRight(player.id, player.accel, true);
	}
	$('body').on('keydown', function(e) {
		switch (e.keyCode) {
			case 37 :
				left();
				break;
			case 38 :
				up();
				break;
			case 39 :
				right();
				break;
			case 40 :
				down();
				break;
		}
	});
	$('#left').on('click', function() {
		left();
	});
	$('#up').on('click', function() {
		up();
	});
	$('#down').on('click', function() {
		down();
	});
	$('#right').on('click', function() {
		right();
	});
	$('#message').on('click', function() {
		for (var i = --score; i >= 0; i--) {
			var id	= prefix + i;
			game.delObject(id);
		}
		score	= 0;
		stat	= 0;
		game.delObject(player.id);
		initGame();
	});
	$('#stop').on('click', function() {
		if (stat > 0) {
			stat	= 0;
			game.stop();
		}
	});
	$('#start').on('click', function() {
		if (!stat) {
			stat	= 1;
			game.start();
			scoreUp();
		}
	});
});
