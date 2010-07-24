var JetStreamAirAdaptor = function(options) {
  this.init(options);
}

JetStreamAirAdaptor.prototype = {
  lastInsertID: null,
  
  defaults: {
    primaryKey: 'rowid',
    database: null,
    schema: {}
  },
  
  init: function(options) {
		options = options || {};
    var opts = (typeof arguments[0] == 'string') ? {table: options} : options;
    this.primaryKey = opts.primaryKey || this.defaults.primaryKey;
    this.database = opts.database || this.defaults.database;
    this.schema = opts.schema || this.defaults.schema;

    this.connection = new air.SQLConnection();
    try {
      this.connection.open(this.database);
      
      for (table in this.schema) {
        var columns = [];
        for (column in this.schema[table]) {
          columns.push(column + " " + this.schema[table][column]);
        }
        this.query("CREATE TABLE IF NOT EXISTS " + table + " (" + columns.join(', ') + ")");
      }
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
      if (prop !== this.primaryKey) {
        cols.push(prop);
        vals.push(obj[prop]);
      }
    }
    
		if (!(this.primaryKey in obj)) {
			var sql = "INSERT INTO " + table + " (" + cols.join(', ') + ") " +
				"VALUES (" + vals.map(function() { return '?'; }).join(', ') + ')';

			this.query(sql, vals);

			return this.lastInsertID;
		} else {
			var sql = "UPDATE " + table + " " +
				"SET " + cols.join(' = ?, ') + " = ? " + 
				"WHERE " + this.primaryKey + " = ?";

			vals.push(obj[this.primaryKey]);
			return this.query(sql, vals);
		}
  },
  
  del: function(table, obj) {
    return this.query("DELETE FROM " + table + " WHERE " + this.primaryKey + " = ?", obj[this.primaryKey]);
  }
};

var JetStream = JetStream || {};
JetStream.adaptor = JetStream.adaptor || new JetStreamAirAdaptor();
