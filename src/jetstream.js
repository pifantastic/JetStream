
(function(window, undefined) {

var JetStream = function(table) {
  return new JetStream.prototype.init(table);
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
      var where = JetStream.WHERE[match[2]];
      var query = "SELECT * FROM " + table + " WHERE " + match[1] + " " + where[0] + " ?";
      this.dataset = JetStream.adaptor.query(query, [where[1].replace(':value', match[4])]);

    // Get all data for table
    } else {
      this.table = table;
      this.dataset = JetStream.adaptor.all(table);
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
			return this;
    } else {
      return this.dataset[0][name];
    }
  }
};

JetStream.prototype.init.prototype = JetStream.prototype;
window.jet = window.JetStream = JetStream;

})(window);

