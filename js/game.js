function Game(id) {
	var self			= {};
	self._rmUnit		= function(value) {
		return Number(value.replace(this.unit, ""));
	};
	self._setUnit		= function(value) {
		return value + this.unit;
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
	self._move			= function(id, self) {
		var object	= self._objects[id];
		if (!object) return;
		for (var i in self._checkTouch) {
			if (i === id) continue;
			if (self._objects[i]) self._checkTouch[i](object, self._objects[i]);
		}
		if (self._stat === 0 || object.stat === 0) {
			self._stack[id] = object;
			return;
		}
		if (!(Math.abs(object.vector.w) > self._round || Math.abs(object.vector.h) > self._round || Math.abs(object.accel.w) > self._round || Math.abs(object.accel.h) > self._round)) {
			object.stat	= 0;
			return;
		}
		var vector	= object.vector;
		var accel	= object.accel;
		var w		= self._rmUnit(object.element.style.left);
		var h		= self._rmUnit(object.element.style.top);
		var wCondition	= (vector.w < 0 && accel.w <= 0) ? (w >= 0) : (w <= object.limit.w);
		var hCondition	= (vector.h < 0 && accel.h <= 0) ? (h >= 0) : (h <= object.limit.h);
		if (wCondition && hCondition) {
			w		+= Number(vector.w);
			h		+= Number(vector.h);
			vector.w	+= Number(accel.w);
			vector.h	+= Number(accel.h);
			if (object.isBound && ((vector.w < 0 && accel.w <= 0 && w <= 0) || (vector.w > 0 && w >= object.limit.w))) {
				offset		= (((vector.w < 0) ? 0 : object.limit.w) - w);
				w		= (offset / 2) + ((vector.w < 0) ? 0 : object.limit.w);
				vector.w	*= -1;
				if (accel.w) vector.w *= accel.w;
			}
			if (object.isBound && ((vector.h < 0 && accel.h <= 0 && h <= 0) || (vector.h > 0 && h >= object.limit.h))) {
				offset		= (((vector.h < 0) ? 0 : object.limit.h) - h);
				h		= (offset / 2) + ((vector.h < 0) ? 0 : object.limit.h);
				vector.h	*= -1;
				if (accel.h) vector.h *= accel.h;
			}
			if (w < 0) w = 0;
			if (w > object.limit.w) w = object.limit.w;
			if (!object.isBound && (w === 0 || w === object.limit.w)) vector.w = 0;
			if (h < 0) h = 0;
			if (h > object.limit.h) h = object.limit.h;
			if (!object.isBound && (h === 0 || h === object.limit.h)) vector.h = 0;
			object.element.style.top	= self._setUnit(h);
			object.element.style.left	= self._setUnit(w);
			setTimeout(self._move, self.reflesh, id, self);
		}
	};
	self.newObject		= function(id, attr) {
		var element		= document.createElement("div");
		var key			= null;
		element.id		= id;
		if (typeof attr === "object") {
			for (key in attr) {
				element[key]	= attr[key];
			}
		}
		this._bord.appendChild(element);
		this.setObject(id);
	};
	self.delObject		= function(id) {
		var object		= this._objects[id];
		if (!object) return;
		object.element.parentNode.removeChild(object.element);
		this._objects[id]	= null;
		if (this._stack[id]) this._stack[id] = null;
	};
	self.setObject		= function(id) {
		var object		= {id: id, element: null, w: 0, h: 0, limit: {w: 0, h: 0}, vector: {w: 0, h: 0}, accel: {w: 0, h: 0}, isBound: null, stat: 0};
		object.element		= document.getElementById(id);
		object.w		= this._getWidth(id);
		object.h		= this._getHeight(id);
		object.limit.w		= this.max.width - object.w;
		object.limit.h		= this.max.height - object.h;
		this._objects[id]	= object;
	};
	self.getObject		= function(id) {
		return this._objects[id];
	};
	self.setEvent		= function(id, check, callBack) {
		this._checkTouch[id] = function(object1, object2) {if (check(object1, object2)) callBack(object1, object2);};
	};
	self.move			= function(id, wVector, hVector, wAccel, hAccel, isBound) {
		var object		= this._objects[id];
		if (!object) return;
		object.isBound		= isBound;
		object.vector.w		+= Number(wVector);
		object.vector.h		+= Number(hVector);
		object.accel.w		+= Number(wAccel);
		object.accel.h		+= Number(hAccel);
		if (this._rmUnit(object.element.style.left) > object.limit.w) object.element.style.left = object.limit.w;
		if (this._rmUnit(object.element.style.left) < 0) object.element.style.left = 0;
		if (this._rmUnit(object.element.style.top) > object.limit.h) object.element.style.top = object.limit.h;
		if (this._rmUnit(object.element.style.top) < 0) object.element.style.top = 0;
		if (object.stat == 0) {
			object.stat	= 1;
			this._move(id, this);
		}
	};
	self.moveSimple		= function(id, wVector, hVector, isBound) {
		this.move(id, wVector, hVector, 0, 0, isBound);
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
		this.move(id, wSpeed, hSpeed, 0, 0.4, true);
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
	self._stack			= {};
	self._stat			= 0;
	self._round			= 0.0001;
	self._bord			= document.getElementById(id);
	self.max			= {width: self._getWidth(id), height: self._getHeight(id)};
	self.reflesh		= 10;
	self.unit			= "px";
	return self;
};
