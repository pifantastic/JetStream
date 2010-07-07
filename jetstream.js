
var JetStream = function(table) {
  return new JetStream.prototype.init(table);
}

JetStream.prototype = {
  
  init: function(table) {
    this.table = table;
    this.datasource = JetStream.adaptor.all(table);
    this.length = this.datasource.length;
    return this;
  },
  
  options: {},
  
  filter: function(callback) {
    this.datasource = this.datasource.filter(callback);
    this.length = this.datasource.length;
    return this;
  },
  
  each: function(callback) {
    for (var x = 0; x < this.length; x++) {
      var result = callback(x, this.datasource[x]);
      if (result === false) {
        break;
      }
    }
  },
  
  get: function(index) {
    return (index > -1 && index < this.length) ? this.datasource[index] : null;
  },
  
  attr: function(name, value) {
    if (this.length == 0 || !(name in this.datasource[0])) {
      return null;
    }
    
    if (typeof value !== "undefined") {
      for (var x = 0; x < this.length; x++) {
        this.datasource[x][name] = value;
        JetStream.adaptor.save(this.table, this.datasource[x]);
      }
    } else {
      return this.datasource[0][name];
    }
  }
};

JetStream.prototype.init.prototype = JetStream.prototype;
var jet = JetStream;
