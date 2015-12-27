function Game(id) {
	var self			= {};
	self._rmUnit		= function(value, func, unit) {
		if (!unit) unit = this.unit;
		value		= value.replace(unit, "");
		if (func) value = value.replace(func + "(", "").replace(")", "");
		return Number(value);
	};
	self._setUnit		= function(value, func, unit) {
		if (!unit) unit = this.unit;
		value		+= unit;
		if (func) value = func + "(" + value + ")";
		return value;
	};
	self._getLeft		= function(id) {
		var element	= document.getElementById(id);
		return element.offsetLeft;
	};
	self._getTop		= function(id) {
		var element	= document.getElementById(id);
		return element.offsetTop;
	};
	self._getWidth		= function(id) {
		var element	= document.getElementById(id);
		return element.offsetWidth;
	};
	self._getHeight		= function(id) {
		var element	= document.getElementById(id);
		return element.offsetHeight;
	};
	self._move		= function(id, self) {
		var object	= self._objects[id];
		if (!object) return;
		if (self._stat === 0 || object.stat === 0) {
			self._stack[id] = object;
			return;
		}
		if (!(Math.abs(object.vector.x) > self._round || Math.abs(object.vector.y) > self._round)) {
			object.stat	= 0;
			return;
		}
		var x		= self._rmUnit(object.element.style.left);
		var y		= self._rmUnit(object.element.style.top);
		if (x >= 0 && x <= object.limit.x && y >= 0 && y <= object.limit.y) {
			x		+= Number(object.vector.x);
			y		+= Number(object.vector.y);
			object.vector.x	+= Number(object.accel.x);
			object.vector.y	+= Number(object.accel.y);
			if (object.accel.x > Math.abs(object.vector.x)) object.accel.x *= 0.9;
			if (object.accel.y > Math.abs(object.vector.y)) object.accel.y *= 0.9;
			if (object.brake.x > Math.abs(object.vector.x)) object.vector.x = 0; 
			if (object.brake.y > Math.abs(object.vector.y)) object.vector.y = 0; 
			if (object.brake.x && object.vector.x > 0) object.vector.x -= Number(object.brake.x); 
			if (object.brake.x && object.vector.x < 0) object.vector.x += Number(object.brake.x); 
			if (object.brake.y && object.vector.y > 0) object.vector.y -= Number(object.brake.y); 
			if (object.brake.y && object.vector.y < 0) object.vector.y += Number(object.brake.y); 
			if (object.isBound && ((object.vector.x < 0 && object.accel.x <= 0 && x <= 0) || (object.vector.x > 0 && x >= object.limit.x))) {
				offset	= (((object.vector.x < 0) ? 0 : object.limit.x) - x);
				x	= (offset / 2) + ((object.vector.x < 0) ? 0 : object.limit.x);
				object.vector.x	*= -1;
				if (object.accel.x) object.vector.x *= object.accel.x;
			}
			if (object.isBound && ((object.vector.y < 0 && object.accel.y <= 0 && y <= 0) || (object.vector.y > 0 && y >= object.limit.y))) {
				offset	= (((object.vector.y < 0) ? 0 : object.limit.y) - y);
				y	= (offset / 2) + ((object.vector.y < 0) ? 0 : object.limit.y);
				object.vector.y	*= -1;
				if (object.accel.y) object.vector.y *= object.accel.y;
			}
			if (x < 0) x = 0;
			if (x > object.limit.x) x = object.limit.x;
			if (!object.isBound && (x === 0 || x === object.limit.x)) object.vector.x = 0;
			if (y < 0) y = 0;
			if (y > object.limit.y) y = object.limit.y;
			if (!object.isBound && (y === 0 || y === object.limit.y)) object.vector.y = 0;
			object.element.style.top	= self._setUnit(y);
			object.element.style.left	= self._setUnit(x);
			setTimeout(self._move, self.reflesh, id, self);
		}
		if (!object.direction.fix && (object.vector.x || object.vector.y)) {
			var limit	= Math.atan2(object.vector.y, object.vector.x) / (Math.PI / 180);
			var now		= self._rmUnit(object.element.style.transform, "rotate", "deg");
			var sign	= 1;

			if (limit > 180) limit = (limit - 360);
			if (limit < -180) limit = (limit + 360);
			if (now > 180) now = (now - 360);
			if (now < -180) now = (now + 360);
			if (limit < 0 && now < 0 && limit < now) sign = -1;
			if (limit >= 0 && now >= 0 && limit < now) sign = -1;
			if (limit < 0 && now >= 0 && Math.abs(limit - now) < 180) sign = -1;
			if (limit >= 0 && now < 0 && Math.abs(limit - now) > 180) sign = -1;
			if (Math.abs(limit - now) > 0.001 && Math.abs(limit - now) < object.direction.span) now = limit - (object.direction.span * sign);
			if (Math.abs(limit - now) > 0.001)
				object.element.style.transform = self._setUnit(now + (object.direction.span * sign), "rotate", "deg");
		}
		for (var i in self._checkTouch) {
			if (i !== id && self._objects[i]) self._checkTouch[i](object, self._objects[i]);
		}
	};
	self.newObject		= function(id, attr, options) {
		var element		= document.createElement("div");
		var key			= null;
		element.id		= id;
		if (typeof attr === "object") {
			for (key in attr) {
				element[key]	= attr[key];
			}
		}
		this._bord.appendChild(element);
		this.setObject(id, options);
	};
	self.delObject		= function(id) {
		var object		= this._objects[id];
		if (!object) return;
		object.element.parentNode.removeChild(object.element);
		this._objects[id]	= null;
		if (this._stack[id]) this._stack[id] = null;
	};
	self.setObject		= function(id, options) {
		var object		= {
			id		: id,
			element		: null,
			x		: 0,
			y		: 0,
			limit		: {x: 0, y: 0},
			vector		: {x: 0, y: 0},
			accel		: {x: 0, y: 0},
			brake		: {x: 0, y: 0},
			isBound		: null,
			stat		: 0,
			direction	: {fix: 0, span: 2},
		};

		if (typeof options === "object") {
			for (var i in options) {
				object[i]	= options[i];
			}
		}

		object.element		= document.getElementById(id);
		object.x		= this._getWidth(id);
		object.y		= this._getHeight(id);
		object.limit.x		= Math.max(0, this.max.width - object.x);
		object.limit.y		= Math.max(0, this.max.height - object.y);
		this._objects[id]	= object;
	};
	self.getObject		= function(id) {
		return this._objects[id];
	};
	self.setEvent		= function(id, check, callBack) {
		this._checkTouch[id] = function(object1, object2) {if (check(object1, object2)) callBack(object1, object2);};
	};
	self.putBound		= function(object1, object2, type) {
		var v1			= Math.abs(object1.vector[type]);
		var v2			= Math.abs(object2.vector[type]);
		var diff		= Math.abs(v1 - v2);
		var sign1		= (object1.vector[type] === 0) ? 0 : (object1.vector[type] < 0) ? -1 : 1;
		var sign2		= (object2.vector[type] === 0) ? 0 : (object2.vector[type] < 0) ? -1 : 1;
		var start1		= this._rmUnit((type === "x") ? object1.element.style.left : object1.element.style.top);
		var start2		= this._rmUnit((type === "x") ? object2.element.style.left : object2.element.style.top);
		var end1		= start1 + object1[type];
		var end2		= start2 + object2[type];
		if (sign1 === 0 || sign2 === 0 || diff > v1 || diff > v2) diff *= 0.6;
		if (sign1 !== sign2) diff = Math.max(v1, v2, diff) * 0.6;
		if ((sign1 === 0 && ((sign2 > 0 && start1 > start2) || (sign2 < 0 && start1 < start2))) ||
			(sign2 === 0 && ((sign1 > 0 && start1 < start2) || (sign1 < 0 && start1 > start2))) ||
			(sign1 < 0 && sign2 < 0 && ((start1 < start2 && v1 < v2) || (start2 < start1 && v2 < v1))) ||
			(sign1 > 0 && sign2 > 0 && ((start1 < start2 && v1 > v2) || (start2 < start1 && v2 > v1))) ||
			(sign1 > 0 && sign2 < 0 && start1 < start2) || (sign1 < 0 && sign2 > 0 && start1 > start2)
		) {
			object1.vector[type]	= (sign1 !== sign2 || v1 > v2) ? Math.abs(v1 - diff) : v1 + diff;
			object2.vector[type]	= (sign1 !== sign2 || v1 < v2) ? Math.abs(v2 - diff) : v2 + diff;
			v1			= object1.vector[type]
			v2			= object2.vector[type]
		}
		object1.vector[type]	= ((sign1 < 0 && (sign1 === sign2 || start1 < start2)) || (sign1 !== sign2 && start1 < start2)) ? v1 * -1 : v1;
		object2.vector[type]	= ((sign2 < 0 && (sign1 === sign2 || start2 < start1)) || (sign1 !== sign2 && start2 < start1)) ? v2 * -1 : v2;
		this.move(object1.id, 0, 0, 0, 0, 0, 0, true);
		this.move(object2.id, 0, 0, 0, 0, 0, 0, true);
	};
	self.simpleCheck	= function(object1, object2, range) {
		var wStart1		= this._rmUnit(object1.element.style.left) + range;
		var wEnd1		= wStart1 + object1.x - (range * 2);
		var hStart1		= this._rmUnit(object1.element.style.top) + range;
		var hEnd1		= hStart1 + object1.y - (range * 2);
		var wStart2		= this._rmUnit(object2.element.style.left) + range;
		var wEnd2		= wStart2 + object2.x - (range * 2);
		var hStart2		= this._rmUnit(object2.element.style.top) + range;
		var hEnd2		= hStart2 + object2.y - (range * 2);
		if ((wStart1 < wEnd2 && wStart2 < wEnd1) && (hStart1 < hEnd2 && hStart2 < hEnd1)) return true;
		return false;
	};
	self.move			= function(id, wVector, hVector, wAccel, hAccel, wBrake, hBrake, isBound) {
		var object		= this._objects[id];
		if (!object) return;
		object.isBound		= isBound;
		object.vector.x		+= Number(wVector);
		object.vector.y		+= Number(hVector);
		if (wAccel) object.accel.x = Number(wAccel);
		if (hAccel) object.accel.y = Number(hAccel);
		if (wBrake) object.brake.x = Number(wBrake);
		if (hBrake) object.brake.y = Number(hBrake);
		if (this._rmUnit(object.element.style.left) > object.limit.x) object.element.style.left = object.limit.x;
		if (this._rmUnit(object.element.style.left) < 0) object.element.style.left = 0;
		if (this._rmUnit(object.element.style.top) > object.limit.y) object.element.style.top = object.limit.y;
		if (this._rmUnit(object.element.style.top) < 0) object.element.style.top = 0;
		if (object.stat == 0) {
			object.stat	= 1;
			this._move(id, this);
		}
	};
	self.moveSimple		= function(id, wVector, hVector, isBound) {
		this.move(id, wVector, hVector, 0, 0, 0, 0, isBound);
	};
	self.moveUp			= function(id, speed, isBound) {
		this.moveSimple(id, 0, speed * -1, isBound);
	};
	self.moveDown		= function(id, speed, isBound) {
		this.moveSimple(id, 0, speed, isBound);
	};
	self.moveLeft		= function(id, speed, isBound) {
		this.moveSimple(id, speed * -1, 0, isBound);
	};
	self.moveRight		= function(id, speed, isBound) {
		this.moveSimple(id, speed, 0, isBound);
	};
	self.moveFall		= function(id, wSpeed, hSpeed) {
		this.move(id, wSpeed, hSpeed, 0, 0.4, 0.03, 0, true);
	};
	self.stop			= function() {
		this._stat	= 0;
	};
	self.start			= function() {
		this._stat	= 1;
		for (var i in this._stack) {
			var object	= this._stack[i];
			if (object) this._move(object.id, this);
		}
		this._stack	= {};
	};
	self._objects		= {};
	self._checkTouch	= {};
	self._stack		= {};
	self._stat		= 0;
	self._round		= 0.0001;
	self._bord		= document.getElementById(id);
	self.max		= {width: self._getWidth(id), height: self._getHeight(id)};
	self.reflesh		= 10;
	self.unit		= "px";
	return self;
};
