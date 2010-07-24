
(function(window, undefined) {

var JetStream = function(expr, obj) {
  return new JetStream.prototype.init(expr, obj);
}

JetStream.TABLE = /^((?:[\w\u00c0-\uFFFF\*-]|\\.)+)/;
JetStream.COL = /\[\s*((?:[\w\u00c0-\uFFFF-]|\\.)+)\s*(?:(\S?=)\s*(['"]*)(.*?)\3|)\s*\]/;
JetStream.WHERE = {
  '*=': ["LIKE", "%:value%"],
  '$=': ["LIKE", "%:value"],
  '=':  ["=", ":value"],
  '!=': ["!=", ":value"],
  '^=': ["LIKE", ":value%"]
};
JetStream.CACHE = {};

JetStream.prototype = {
  
  init: function(expr, obj) {
    var match = JetStream.TABLE.exec(expr);
    
    // Invalid expression
    if (!match) {
      this.dataset = [];
      this.length = 0;
      return this;
    }
    
    this.table = match[1];
    
    // Insert a new row
    if (typeof obj != "undefined") {
      JetStream.adaptor.save(this.table, obj);
      obj[JetStream.adaptor.primaryKey] = JetStream.adaptor.lastInsertID;
      this.dataset = [obj];
      
      if (this.table in JetStream.CACHE) {
        JetStream.CACHE[this.table].push(obj);
      }
    }
    
    // Test for a column expression
    else if (match = JetStream.COL.exec(expr)) {
      var where = JetStream.WHERE[match[2]];
      var query = "SELECT * FROM " + this.table + " WHERE " + match[1] + " " + where[0] + " ?";
      this.dataset = JetStream.adaptor.query(query, [where[1].replace(':value', match[4])]);

    // Get all data for table
    } else {
      if (!(this.table in JetStream.CACHE)) {
        JetStream.CACHE[this.table] = JetStream.adaptor.all(this.table);
      }
      this.dataset = JetStream.CACHE[this.table].slice(0);
    }
    
    this.length = this.dataset.length;
    return this;
  },
  
  filter: function(callback) {
    this.dataset = this.dataset.filter(callback, this);
    this.length = this.dataset.length;
    return this;
  },
  
  each: function(callback) {
    for (var value = this.dataset[0], i = 0;
      i < this.length && callback.call(value, i, value) !== false; value = this.dataset[++i]) {}
    return this;
  },
  
  get: function(index) {
    return index == null ? this.dataset : (index < 0 ? this.dataset.slice(index)[0] : this.dataset[index]);
  },
  
  attr: function(name, value) {
    if (this.length == 0 || !(name in this.dataset[0])) {
      return null;
    }
    
    if (typeof value !== "undefined") {
      for (var x = 0; x < this.length; x++) {
        this.dataset[x][name] = value;
        JetStream.adaptor.save(this.table, this.dataset[x]);
      }
      delete JetStream.CACHE[this.table];
			return this;
    } else {
      return this.dataset[0][name];
    }
  },
  
  del: function() {
    for (var x = 0; x < this.length; x++) {
      JetStream.del(this.dataset[x]);
    }
  }
};

JetStream.prototype.init.prototype = JetStream.prototype;
window.jet = window.JetStream = JetStream;

})(window);

