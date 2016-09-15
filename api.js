console.log("api.js");

const port = process.env.PORT || 9543;
const dataFilePath = __dirname + "/data/items.json";

const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, UPDATE, DELETE");
  next();
});

itemCounter = 0;

var Item = function(name, description) {
	this.name = name;
	this.description = description;
	this.id = itemCounter++;
	this.completed = false;
	this.created_at = Date.now();
	this.updated_at = null;
	this.deleted_at = null;
}
// main storage of items in memory
var items = [
	new Item("Welcome!", "Welcome to your todo list!"),
];

// fetch saved copy of list
fs.readFile(dataFilePath, 'utf8', function(err, data) {
	 // do this when the file comes back from the hard drive
	
	if (data) {
		try {
			var retrieved = JSON.parse(data);
			itemCounter = retrieved.itemCounter;
			items = retrieved.items;
		} catch(e) {
			console.warn("loaded JSON file with invalid JSON");
		}
	}
});

var saveToFile = function() {
	
	var toStore = {
		itemCounter: itemCounter,
		items: items
	}
	fs.writeFile(dataFilePath, JSON.stringify(toStore), function(err) {
		console.error(err);
	});
}



app.get('/about', function (req, res) {
	res.send('You\'re talking to the API for my Todo list!');
});

/* 
POST 							/items		create a new item
GET  							/items/1  	return item 1
GET  							/items		return all items
PUT/POST/UPDATE                 /items/1  	edit item 1
DELETE						    /items/1	delete item 1
*/

app.get('/items', function(req, res) {
	res.send( items );
});

app.get('/items/:item_id', function(req, res) {
	for (var i=0; i<items.length; i++) {
		if (items[i].id == req.params.item_id) {
			res.send(items[i]);
			return
		}
	}
	res.send("404");
});

app.post('/items', function(req, res) {
	
	if (req.body.name.trim()) {
		var newItem = new Item(req.body.name, req.body.description);

		items.push(newItem);
		res.send(newItem);
	} else {
		console.log("item creation error")
		res.status(400).send("You didn't enter anything, dummy!");
	}
	
	saveToFile();
})


app.put('/items/:item_id', function(req, res) {
	var id = req.params.item_id; 
	for (var i=0; i<items.length; i++) {
		if (items[i].id == id) {
			var item = items[i];
		}
	}
	
	if (item) {
		item.completed = !item.completed;
		item.updated_at = Date.now();
		res.send(item);
	} else {
		res.status(400).send("Item does not exist!");
	}
	
	saveToFile();
})

app.delete('/items/:item_id', function(req, res) {
	var id = req.params.item_id;
	for (var i=0; i<items.length; i++) {
		if (items[i].id == id) {
			var item = items[i];
		}
	}
	
	if (item) {
		item.deleted_at = Date.now();
		item.updated_at = Date.now();
		res.send(item);
	} else {
		res.status(400).send("Item does not exist!");
	}
	
	saveToFile();
});

app.post('/items/:item_id', function(req, res) {
	
	var id = req.params.item_id;
	for (var i=0; i<items.length; i++) {
		if(items[i].id == id) {
			var item = items[i];
		}
	};
	
	if (item) {
		item.name = req.body.name.trim();
		item.description = req.body.description;
		res.send("Success");
	} else {
		res.status(400).send("Item does not exist!");
	}
	
	saveToFile();
})

// app.use(express.static("public"));

app.listen(port, function () {
	console.log('Example app listening on port '+port+'!');
});