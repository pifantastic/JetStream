
var JetStream = function(table) {
  return new JetStream.prototype.init(table);
}

JetStream.TABLE = /^((?:[\w\u00c0-\uFFFF\*-]|\\.)+)/;
JetStream.COL = /\[\s*((?:[\w\u00c0-\uFFFF-]|\\.)+)\s*(?:(\S?=)\s*(['"]*)(.*?)\3|)\s*\]/;
JetStream.WHERE = {
  '*=': "WHERE %s LIKE '%%s%'",
  '$=': "WHERE %s LIKE '%%s'",
  '=':  "WHERE %s = '%s'",
  '!=': "WHERE %s != '%s'",
  '^=': "WHERE %s LIKE '%s%'"
};

JetStream.prototype = {
  
  init: function(expr) {
    var match = JetStream.TABLE.exec(expr);
    
    // Invalid expression
    if (!match) {
      this.dataset = [];
      this.length = 0;
      return this;
    }
    
    var table = match[1];
    
    // Test for a column expression
    if (match = JetStream.COL.exec(expr)) {
      this.table = match[0];
      var query = "SELECT * FROM " + table + " " + JetStream.WHERE[match[2]];
      this.dataset = JetStream.adaptor.query(query, [match[1], match[3]]);
    
    // Get all data for table
    } else {
      this.table = table;
      this.dataset = JetStream.adaptor.all(table);
    }
    
    this.length = this.dataset.length;
    return this;
  },
  
  options: {},
  
  filter: function(callback) {
    this.dataset = this.dataset.filter(callback);
    this.length = this.dataset.length;
    return this;
  },
  
  each: function(callback) {
    for (var value = this.dataset[0], i = 0;
				i < this.length && callback.call(value, i, value) !== false; value = this.dataset[++i]) {}
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
    } else {
      return this.dataset[0][name];
    }
  }
};

JetStream.prototype.init.prototype = JetStream.prototype;
var jet = JetStream;
