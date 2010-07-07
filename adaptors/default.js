var JetStreamDefaultAdaptor = function(options) {
  this.data = {
    'users': [
      {name: "Aaron Forsander", age: 24},
      {name: "Aaron Aaronson", age: 27},
      {name: "Megablast Coolson", age: 26},
      {name: "Awesomeo Jones", age: 18},
      {name: "Wonder Onethreeone", age: 131},
      {name: "Wonder Onethreeone Killer", age: 200},
      {name: "Reginald Vel Johnson", age: 54},
      {name: "Harriet Tubman", age: 14}
    ]
  };
};

JetStreamDefaultAdaptor.prototype = {
  
  data: {},
  next: 1,
  
  all: function(table) {
    return this.data[table];
  },
  
  save: function(table, obj) {
    if (!(table in this.data)) {
      this.data[table] = [];
    }
    
    if (obj.id) {
      for (var x = 0; x < this.data[table].length; x++) {
        if (this.data[table][x].id == obj.id) {
          this.data[table][x] = obj;
        }
      }
    } else {
      obj.id = this.next;
      this.data[table].push(obj);
      this.next++;
    }
  },
  
  del: function(table, obj) {
    if (obj.id) {
      for (var x = 0; x < this.data[table].length; x++) {
        if (this.data[table][x].id == obj.id) {
          this.data[table].splice(x, 1);
        }
      }
    }
  }
};

var JetStream = JetStream || {};
JetStream.adaptor = JetStream.adaptor || new JetStreamDefaultAdaptor();
