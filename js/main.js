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
				$('#history tbody').append('<tr><td>' + count + '</td><td>' + score + '</td></tr>');
				if (score > high) {
					$("#hightscore").text(score);
					high	= score;
				}
			}
		);
		$('#' + player.id).css({top: game.max.height - 40, left: game.max.width / 2});
		player.object			= game.getObject(player.id);
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
			function(object1, object2, self) {
				var start1	= game._rmUnit(object1.element.style.left);
				var end1	= start1 + object1.w;
				var start2	= game._rmUnit(object2.element.style.left);
				var end2	= start2 + object2.w;
				if (start1 <= end2 && start2 <= end1) return true;
				return false;
			},
			function(object1, object2, self) {
				var diff		= Math.abs(Math.abs(object1.vector.w) - Math.abs(object2.vector.w));
				var sign1		= (object1.vector.w > 0);
				var sign2		= (object2.vector.w > 0);
				var start1		= game._rmUnit(object1.element.style.left);
				var start2		= game._rmUnit(object2.element.style.left);
				if (object1.vector.w == 0 || object2.vector.w == 0) diff *= 0.6;
				object1.vector.w	= Math.abs(object1.vector.w);
				object2.vector.w	= Math.abs(object2.vector.w);
				object1.vector.w	= ((sign1 != sign2) || (sign1 && start1 < start2) || (!sign1 && start1 > start2)) ? Math.abs(object1.vector.w - diff) : object1.vector.w + diff;
				object2.vector.w	= ((sign1 != sign2) || (sign2 && start2 < start1) || (!sign2 && start2 > start1)) ? Math.abs(object2.vector.w - diff) : object2.vector.w + diff;
				if ((!sign1 && (sign1 == sign2 || start1 < start2)) || (sign1 && sign1 != sign2 && start1 < start2)) object1.vector.w *= -1;
				if ((!sign2 && (sign1 == sign2 || start2 < start1)) || (sign2 && sign1 != sign2 && start2 < start1)) object2.vector.w *= -1;
				self.move(object1.id, 0, 0, 0, 0, 0, 0, true);
				self.move(object2.id, 0, 0, 0, 0, 0, 0, true);
			}
		);
		title.move(id, 8, 0, 0, 0, 0.02, 0, true);
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
	$('#reset').on('click', function() {
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
