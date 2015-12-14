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
	self._move		= function(id, self) {
		var object	= self._objects[id];
		if (!object) return;
		if (self._stat === 0 || object.stat === 0) {
			self._stack[id] = object;
			return;
		}
		if (!(Math.abs(object.vector.w) > self._round || Math.abs(object.vector.h) > self._round)) {
			object.stat	= 0;
			return;
		}
		var w		= self._rmUnit(object.element.style.left);
		var h		= self._rmUnit(object.element.style.top);
		if (w >= 0 && w <= object.limit.w && h >= 0 && h <= object.limit.h) {
			w		+= Number(object.vector.w);
			h		+= Number(object.vector.h);
			object.vector.w	+= Number(object.accel.w);
			object.vector.h	+= Number(object.accel.h);
			if (object.accel.w > Math.abs(object.vector.w)) object.accel.w *= 0.9;
			if (object.accel.h > Math.abs(object.vector.h)) object.accel.h *= 0.9;
			if (object.brake.w > Math.abs(object.vector.w)) object.vector.w = 0; 
			if (object.brake.h > Math.abs(object.vector.h)) object.vector.h = 0; 
			if (object.brake.w && object.vector.w > 0) object.vector.w -= Number(object.brake.w); 
			if (object.brake.w && object.vector.w < 0) object.vector.w += Number(object.brake.w); 
			if (object.brake.h && object.vector.h > 0) object.vector.h -= Number(object.brake.h); 
			if (object.brake.h && object.vector.h < 0) object.vector.h += Number(object.brake.h); 
			if (object.isBound && ((object.vector.w < 0 && object.accel.w <= 0 && w <= 0) || (object.vector.w > 0 && w >= object.limit.w))) {
				offset	= (((object.vector.w < 0) ? 0 : object.limit.w) - w);
				w	= (offset / 2) + ((object.vector.w < 0) ? 0 : object.limit.w);
				object.vector.w	*= -1;
				if (object.accel.w) object.vector.w *= object.accel.w;
			}
			if (object.isBound && ((object.vector.h < 0 && object.accel.h <= 0 && h <= 0) || (object.vector.h > 0 && h >= object.limit.h))) {
				offset	= (((object.vector.h < 0) ? 0 : object.limit.h) - h);
				h	= (offset / 2) + ((object.vector.h < 0) ? 0 : object.limit.h);
				object.vector.h	*= -1;
				if (object.accel.h) object.vector.h *= object.accel.h;
			}
			if (w < 0) w = 0;
			if (w > object.limit.w) w = object.limit.w;
			if (!object.isBound && (w === 0 || w === object.limit.w)) object.vector.w = 0;
			if (h < 0) h = 0;
			if (h > object.limit.h) h = object.limit.h;
			if (!object.isBound && (h === 0 || h === object.limit.h)) object.vector.h = 0;
			object.element.style.top	= self._setUnit(h);
			object.element.style.left	= self._setUnit(w);
			setTimeout(self._move, self.reflesh, id, self);
		}
		for (var i in self._checkTouch) {
			if (i !== id && self._objects[i]) self._checkTouch[i](object, self._objects[i]);
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
		var object		= {id: id, element: null, w: 0, h: 0, limit: {w: 0, h: 0}, vector: {w: 0, h: 0}, accel: {w: 0, h: 0}, brake: {w: 0, h: 0}, isBound: null, stat: 0};
		object.element		= document.getElementById(id);
		object.w		= this._getWidth(id);
		object.h		= this._getHeight(id);
		object.limit.w		= Math.max(0, this.max.width - object.w);
		object.limit.h		= Math.max(0, this.max.height - object.h);
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
		var start1		= this._rmUnit((type === "w") ? object1.element.style.left : object1.element.style.top);
		var start2		= this._rmUnit((type === "w") ? object2.element.style.left : object2.element.style.top);
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
		var wEnd1		= wStart1 + object1.w - (range * 2);
		var hStart1		= this._rmUnit(object1.element.style.top) + range;
		var hEnd1		= hStart1 + object1.h - (range * 2);
		var wStart2		= this._rmUnit(object2.element.style.left) + range;
		var wEnd2		= wStart2 + object2.w - (range * 2);
		var hStart2		= this._rmUnit(object2.element.style.top) + range;
		var hEnd2		= hStart2 + object2.h - (range * 2);
		if ((wStart1 < wEnd2 && wStart2 < wEnd1) && (hStart1 < hEnd2 && hStart2 < hEnd1)) return true;
		return false;
	};
	self.move			= function(id, wVector, hVector, wAccel, hAccel, wBrake, hBrake, isBound) {
		var object		= this._objects[id];
		if (!object) return;
		object.isBound		= isBound;
		object.vector.w		+= Number(wVector);
		object.vector.h		+= Number(hVector);
		object.accel.w		+= Number(wAccel);
		object.accel.h		+= Number(hAccel);
		object.brake.w		+= Number(wBrake);
		object.brake.h		+= Number(hBrake);
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
