var JetStreamAirAdaptor = function(options) {
  this.init(options);
}

JetStreamAirAdaptor.prototype = {
  lastInsertID: null,
  
  defaults: {
    primary_key: 'rowid',
    database: null
  },
  
  init: function(options) {
		options = options || {};
    var opts = (typeof arguments[0] == 'string') ? {table: options} : options;
    this.primary_key = opts.primary_key || this.defaults.primary_key;
    this.database = opts.database || this.defaults.database;

    this.connection = new air.SQLConnection();
    try {
      this.connection.open(this.database);
    } catch(err) {
      air.trace('Error msg:' + err.message);
      air.trace('Error details:' + err.details);
    }
  },
  
  all: function(table) {
    return this.query("SELECT * FROM " + table);
  },
  
  query: function(query, params) {
    var statement = new air.SQLStatement();
		statement.sqlConnection = this.connection;
		statement.text = query;
		
		if (params) {
			for (var key in params) {
				statement.parameters[key] = params[key];
			}
		}

		try {
			log(query, params);
			statement.execute();
			var result = statement.getResult();
			this.lastInsertID = result.lastInsertRowID;
			return !result.data ? [] : result.data;
		} catch(err) {
			air.trace('Error:' + err.message);
			air.trace('Error details:' + err.details);
			return false;
		}
  },
  
  save: function(table, obj) {
		var self = this, cols = [], vals = [];
    
    for (var prop in obj) {
      if (prop !== this.primary_key) {
        cols.push(prop);
        vals.push(obj[prop]);
      }
    }
		
		if (!(this.primary_key in obj)) {
			var sql = "INSERT INTO " + table + " (" + cols.join(', ') + ") " +
				"VALUES (" + vals.map(function() { return '?'; }).join(', ') + ')';

			this.query(sql, vals);

			return this.lastInsertID;
		} else {
			var sql = "UPDATE " + table + " " +
				"SET " + cols.join(' = ?, ') + " = ? " + 
				"WHERE " + this.primary_key + " = ?";

			vals.push(obj[this.primary_key]);
			return this.query(sql, vals);
		}
  },
  
  del: function(table, obj) {
    return this.query("DELETE FROM " + table + " WHERE " + this.primary_key + " = ?", obj[this.primary_key]);
  }
};

var JetStream = JetStream || {};
JetStream.adaptor = JetStream.adaptor || new JetStreamAirAdaptor();
