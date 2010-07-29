
(function(window, undefined) {

var JetStream = function(expr, obj) {
  return new JetStream.fn.init(expr, obj);
}

JetStream.regex = {
  // Matches a simple table name
  TABLE: /^((?:[\w\u00c0-\uFFFF\*-]|\\.)+)/,

  // Matches a column expression
  COL: /\[\s*((?:[\w\u00c0-\uFFFF-]|\\.)+)\s*(?:(\S?=)\s*(['"]*)(.*?)\3|)\s*\]/,
  
  // Matches SQL queries
  SQL: /^\s*(select|insert|update|delete)/i
}

// Translate column expression operators to SQL
var WHERE = {
  '*=': ["LIKE", "%:value%"],
  '$=': ["LIKE", "%:value"],
  '=':  ["=", ":value"],
  '!=': ["!=", ":value"],
  '^=': ["LIKE", ":value%"]
};

// Cache table results
JetStream.CACHE = {};

JetStream.fn = JetStream.prototype = {
  
  init: function(expr, obj) {
    var match = JetStream.regex.TABLE.exec(expr);
    
    // Invalid expression
    if (!match) {
      this.dataset = [];
      this.length = 0;
      return this;
    }
    
    this.table = match[1];
    
    // Insert a new row
    if (typeof obj == "object") {
      JetStream.adaptor.save(this.table, obj);
      obj[JetStream.adaptor.primaryKey] = JetStream.adaptor.lastInsertID;
      this.dataset = [obj];
      
      if (this.table in JetStream.CACHE) {
        JetStream.CACHE[this.table].push(obj);
      }
    }
    
    // Test for a column expression
    else if (match = JetStream.regex.COL.exec(expr)) {
      var where = WHERE[match[2]];
      var query = "SELECT * FROM " + this.table + " WHERE " + match[1] + " " + where[0] + " ?";
      this.dataset = JetStream.adaptor.query(query, [where[1].replace(':value', match[4])]);
    }
    
    // Test for SQL
    else if (match = JetStream.regex.SQL.exec(expr)) {
      var params = (arguments.length > 1 && typeof arguments[1] != "undefined") ? Array.prototype.slice.call(arguments, 1) : [];
      this.dataset = JetStream.adaptor.query(expr, params);
    }
    
    // Get all data for table
    else {
      if (!JetStream.CACHE.hasOwnProperty(this.table)) {
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
    
    // Set
    if (typeof value !== "undefined") {
      for (var x = 0; x < this.length; x++) {
        this.dataset[x][name] = value;
        JetStream.adaptor.save(this.table, this.dataset[x]);
      }
      delete JetStream.CACHE[this.table];
			return this;
		
		// Get
    } else {
      return this.dataset[0][name];
    }
  },
  
  del: function() {
    for (var x = 0; x < this.length; x++) {
      JetStream.adaptor.del(this.dataset[x]);
    }
  }
};

JetStream.fn.init.prototype = JetStream.fn;
window.jet = window.JetStream = JetStream;

})(window);
