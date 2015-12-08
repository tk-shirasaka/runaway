var scoreUp	= null;
$(function() {
	var stat	= 0;
	var game	= Game;
	var player	= {id: 'player', maxSpeed: 0.5, accel: 0.2, object: null};
	var count	= 0;
	var prefix	= 'game_';
	var score	= 0;
	var high	= 0;

	game.init('bord');
	initGame(); 
	scoreUp = function() {
		if (stat !== 1) return;
		var id				= prefix + score;
		game.newObject(id, {className: 'game game-circle'});
		var element			= document.getElementById(id);
		element.style.top		= Math.random() * 200;
		element.style.left		= Math.random() * 800;
		$('#score').text(++score);
		game.moveSimple(id, Math.random() * 2, Math.random() * 2, true);
		setTimeout('scoreUp()', 1000);
	};

	function initGame() {
		game.newObject(player.id, {className: 'game game-circle game-color-primary'});
		game.setEvent(
			player.id,
			function(object1, object2) {
				var range	= 2;
				var wStart1	= game._rmUnit(object1.element.style.left) + range;
				var wEnd1	= wStart1 + object1.w - (range * 2);
				var hStart1	= game._rmUnit(object1.element.style.top) + range;
				var hEnd1	= hStart1 + object1.h - (range * 2);
				var wStart2	= game._rmUnit(object2.element.style.left) + range;
				var wEnd2	= wStart2 + object2.w - (range * 2);
				var hStart2	= game._rmUnit(object2.element.style.top) + range;
				var hEnd2	= hStart2 + object2.h - (range * 2);
				if ((wStart1 < wEnd2 && wStart2 < wEnd1) &&
				(hStart1 < hEnd2 && hStart2 < hEnd1)) {
					return true;
				}
				return false;
			},
			function(object1, object2) {
				stat	= -1;
				count++;
				game.stop();
				$('#message').modal('show');
				$('#start').addClass('disabled');
				$('#stop').addClass('disabled');
				$('#history tbody').append('<tr><td>' + count + '</td><td>' + score + '</td></tr>');
				if (score > high) {
					$("#hightscore").text(score);
					hight	= score;
				}
			}
		);
		var element			= document.getElementById(player.id);
		element.style.top		= game.range.max.height - 40;
		element.style.left		= game.range.max.width / 2;
		player.object			= game.getObject(player.id);
	};

	function left() {
		if (player.object.vector.w - player.accel >= player.maxSpeed * -1)
			game.moveLeft(player.id, player.accel, true);
	}
	function up() {
		if (player.object.vector.h - player.accel >= player.maxSpeed * -1)
			game.moveUp(player.id, player.accel, true);
	}
	function down() {
		if (player.object.vector.h + player.accel <= player.maxSpeed)
			game.moveDown(player.id, player.accel, true);
	}
	function right() {
		if (player.object.vector.w + player.accel <= player.maxSpeed)
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
	$('#reset').on('click', function() {
		for (var i = --score; i >= 0; i--) {
			var id	= prefix + i;
			game.delObject(id);
		}
		score	= 0;
		stat	= 0;
		$('#start').removeClass('disabled');
		$('#stop').removeClass('disabled');
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
