
var JetStream = function(table) {
  return new JetStream.prototype.init(table);
}

JetStream.prototype = {
  
  init: function(table) {
    this.table = table;
    this.dataset = JetStream.adaptor.all(table);
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
