var Collector = function(storage) {

	this.storage = storage;
	var data = this.storage.get('records')
	if (!data)
		data = [];
	if (!data instanceof Array) {
		this.storage.set("_records", data)
		console.log("Broken records found. Old content stored under _records.")
		data = [];
		this.storage.set('records', data);
	}
	
	this.records = data;

	this.registerWithdrawal = function(amount, geoCallback) {
		amount = parseInt(amount);
		var now = new Date();
		var entry = {
			amount: amount,
			date: now.getTime(),
			geo: null
		};
		this.records.push(entry);
		var idx = this.count();

		var _collector = this;
		var opts = {
			enableHighAccuracy: false,
			timeout: 1000,
			maximumAge: 3000000
		};
		navigator.geolocation.getCurrentPosition(function(geo) {
			entry.geo = {
				latitude: geo.coords.latitude,
				longitude: geo.coords.longitude,
			};
			_collector.updateStorage();
			if (geoCallback)
				geoCallback(geo);
		}, function(){}, opts);
		
		return idx;
	}

	this.count = function() {
		return this.records.length;
	}

	this.clearHistory = function() {
		this.records = [];
		this.updateStorage();
	}

	this.getWithdrawal = function(idx) {
		if (idx <= this.records.length)
			return this.records[idx - 1];
		else
			throw new RangeError("Invalid withdrawal id: " + idx);
	}

	this.getWithdrawals = function() {
		return this.records;
	}

	this.updateStorage = function() {
		this.storage.set('records', this.records);
	}
}

var LocalStorage = function() {
	this.set = function(k, v) {
		window.localStorage.setItem(k, JSON.stringify(v));
	}

	this.get = function(k) {
		var data = window.localStorage.getItem('records');
		return data ? JSON.parse(data) : null;
	}
}

var MemStorage = function() {
	this.data = {};

	this.set = function(k, v) {
		this.data[k] = JSON.stringify(v);
	}

	this.get = function(k) {
		return this.data[k] ? JSON.parse(this.data[k]) : null;
	}
}