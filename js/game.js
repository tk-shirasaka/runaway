var Game = {
	_objects	: {},
	_checkTouch	: {},
	_stack		: {},
	_stat		: 0,
	_round		: 0.0001,
	range		: {min: {width: 0, height: 0}, max: {width: window.innerWidth, height: window.innerHeight}},
	bord		: null,
	reflesh		: 10,
	unit		: "px",
	init		: function(id) {
		this.bord		= document.getElementById(id);
		this.range.min.width	= this._getLeft(id);
		this.range.min.height	= this._getTop(id);
		this.range.max.width	= this._getWidth(id) + this.range.min.width;
		this.range.max.height	= this._getHeight(id) + this.range.min.height;
	},
	_rmUnit		: function(value) {
		return Number(value.replace(this.unit, ""));
	},
	_setUnit	: function(value) {
		return value + this.unit;
	},
	_getLeft	: function(id) {
		var element	= document.getElementById(id);
		return element.offsetLeft;
	},
	_getTop		: function(id) {
		var element	= document.getElementById(id);
		return element.offsetTop;
	},
	_getWidth	: function(id) {
		var element	= document.getElementById(id);
		return element.offsetWidth;
	},
	_getHeight	: function(id) {
		var element	= document.getElementById(id);
		return element.offsetHeight;
	},
	_move		: function(id) {
		var object	= this._objects[id];
		if (!object) return;
		for (var i in this._checkTouch) {
			if (i === id) continue;
			if (this._objects[i]) this._checkTouch[i](object, this._objects[i]);
		}
		if (this._stat === 0 || object.stat === 0 ||
		    !(Math.abs(object.vector.w) > this._round || Math.abs(object.vector.h) > this._round || Math.abs(object.accel.w) > this._round || Math.abs(object.accel.h) > this._round)) {
			this._stack[id] = object;
			return;
		}
		var vector	= object.vector;
		var accel	= object.accel;
		var maxWidth	= this.range.max.width - object.w;
		var maxHeight	= this.range.max.height - object.h;
		var min		= this.range.min;
		var w		= this._rmUnit(object.element.style.left);
		var h		= this._rmUnit(object.element.style.top);
		var wCondition	= (vector.w < 0 && accel.w <= 0) ? (w >= this.range.min.width) : (w <= maxWidth);
		var hCondition	= (vector.h < 0 && accel.h <= 0) ? (h >= this.range.min.height) : (h <= maxHeight);
		if (wCondition && hCondition) {
			w		+= Number(vector.w);
			h		+= Number(vector.h);
			vector.w	+= Number(accel.w);
			vector.h	+= Number(accel.h);
			if (object.isBound && ((vector.w < 0 && accel.w <= 0 && w <= this.range.min.width) || (vector.w > 0 && w >= maxWidth))) {
				offset		= (((vector.w < 0) ? this.range.min.width : maxWidth) - w);
				w		= (offset / 2) + ((vector.w < 0) ? this.range.min.width : maxWidth);
				vector.w	*= -1;
				if (accel.w) vector.w *= accel.w;
			}
			if (object.isBound && ((vector.h < 0 && accel.h <= 0 && h <= this.range.min.height) || (vector.h > 0 && h >= maxHeight))) {
				offset		= (((vector.h < 0) ? this.range.min.height : maxHeight) - h);
				h		= (offset / 2) + ((vector.h < 0) ? this.range.min.height : maxHeight);
				vector.h	*= -1;
				if (accel.h) vector.h *= accel.h;
			}
			if (w < this.range.min.width) w = this.range.min.width;
			if (w > maxWidth) w = maxWidth;
			if (!object.isBound && (w === this.range.min.width || w === maxWidth)) vector.w = 0;
			if (h < this.range.min.height) h = this.range.min.height;
			if (h > maxHeight) h = maxHeight;
			if (!object.isBound && (h === this.range.min.height || h === maxHeight)) vector.h = 0;
			object.element.style.top	= this._setUnit(h);
			object.element.style.left	= this._setUnit(w);
			setTimeout("Game._move('" + id + "')", this.reflesh);
		}
	},
	newObject	: function(id, attr) {
		var element		= document.createElement("div");
		var key			= null;
		element.id		= id;
		if (typeof attr === "object") {
			for (key in attr) {
				element[key]	= attr[key];
			}
		}
		this.bord.appendChild(element);
		this.setObject(id);
	},
	delObject	: function(id) {
		var object		= this._objects[id];
		if (!object) return;
		object.element.parentNode.removeChild(object.element);
		this._objects[id]	= null;
		if (this._stack[id]) this._stack[id] = null;
	},
	setObject	: function(id) {
		var object		= {id: id, element: null, w: 0, h: 0, vector: {w: 0, h: 0}, accel: {w: 0, h: 0}, isBound: null, stat: 1};
		object.element		= document.getElementById(id);
		object.w		= this._getWidth(id);
		object.h		= this._getHeight(id);
		this._objects[id]	= object;
	},
	getObject	: function(id) {
		return this._objects[id];
	},
	setEvent	: function(id, check, callBack) {
		this._checkTouch[id] = function(object1, object2) {if (check(object1, object2)) callBack(object1, object2);};
	},
	move		: function(id, wVector, hVector, wAccel, hAccel, isBound) {
		var object		= this._objects[id];
		if (!object) return;
		object.isBound		= isBound;
		object.vector.w		+= Number(wVector);
		object.vector.h		+= Number(hVector);
		object.accel.w		+= Number(wAccel);
		object.accel.h		+= Number(hAccel);
		this._move(id);
	},
	moveSimple	: function(id, wVector, hVector, isBound) {
		this.move(id, wVector, hVector, 0, 0, isBound);
	},
	moveUp		: function(id, speed, isBound) {
		this.moveSimple(id, 0, speed * -1, isBound);
	},
	moveDown	: function(id, speed, isBound) {
		this.moveSimple(id, 0, speed, isBound);
	},
	moveLeft	: function(id, speed, isBound) {
		this.moveSimple(id, speed * -1, 0, isBound);
	},
	moveRight	: function(id, speed, isBound) {
		this.moveSimple(id, speed, 0, isBound);
	},
	moveFall	: function(id, wSpeed, hSpeed) {
		this.move(id, wSpeed, hSpeed, 0, 0.4, true);
	},
	stop		: function() {
		this._stat	= 0;
	},
	start		: function() {
		this._stat	= 1;
		for (var i in this._stack) {
			var object	= this._stack[i];
			if (object) this._move(object.id);
		}
		this._stack	= {};
	},
};
