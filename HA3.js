var ha2 = {
    signal: {
	add: 'ADD',
	remove: 'REMOVE',
	setType: 'SET_TYPE',
	clear: 'CLEAR',
	edit: 'EDIT',
	redo: 'REDO'
    },
    todoType: {
	work: 'Work',
	school: 'School',
	play: 'Play'
    }
};


// This is the makeSignaller function as discussed in class
var makeSignaller = function() {
    var _subscribers = []; // Private member

    // Return the object that's created
    return {
	// Register a function with the notification system
	add: function(handlerFunction) { _subscribers.push(handlerFunction); },

	// Loop through all registered functions nad call them with passed
	// arguments
	notify: function(args) {
	    for (var i = 0; i < _subscribers.length; i++) {
		_subscribers[i](args);
	    }
	}
    };
}

// makes the model for the todo system
//
var makeModel = function() {
    var _todoWorkItems = [];
    var _todoSchoolItems = [];
    var _todoPlayItems = [];
    var _currentType = ha2.todoType.work 
    var _observers = makeSignaller();
    var _workStack = [];
    var _schoolStack = [];
    var _playStack = [];
 
    return {
	addItem: function(item) {
	    if (item.length > 0) {
	    	var _curItemList= this.getItems();
	    	var _curStack= this._getStack();
	    		_curItemList.unshift({
		   			"item": item,
		   			 "type": _currentType
				});
				_curStack.push({
		    		"cmd":'pop',
		    	});
		_observers.notify();
	    }
	},
	_getStack: function(){
		switch(_currentType){
			case ha2.todoType.work:
				return _workStack;
			case ha2.todoType.school:
				return _schoolStack;
			case ha2.todoType.play:
			return _playStack;
			default:
			console.log("Error, invalid type");
			break;
		}
	},
	removeItem: function(item) {
		var _todoItems= this.getItems();
		var _stack= this._getStack();
	    var idx = _todoItems.indexOf(item);
	    _stack.push({
		    "cmd":'add',
		    "obj": item,
		    "idx": _todoItems.indexOf(item)
		    });
	    _todoItems.splice(idx, 1);
	    _observers.notify();
	},
	setTask:function(task,txt){
		var _stack= this._getStack();
		_stack.push({
		    "cmd":'edit',
		    "obj":task,
		    "txt":task.item
		    });
		task.item=txt;
		_observers.notify();
	},
	setObjectType:function(task,typ){
		task.type=typ;
		_observers.notify();
	},
	getItems: function() {
		switch(_currentType){ 
			case ha2.todoType.work:
				return _todoWorkItems;
			case ha2.todoType.school:
				return _todoSchoolItems;
			case ha2.todoType.play:
				return _todoPlayItems;
			default:
				console.log("Error, invalid type");
			break;
		}
	},

	setType: function(newType) {
	    _currentType = newType;
	    _observers.notify();
	},
	clearItems: function() { 
		var _stack= this._getStack();
		if(_currentType== ha2.todoType.work){
			_stack.push({
		    "cmd":'refill',
		    "obj":_todoWorkItems
		    });
			_todoWorkItems=[];
		}
		else if(_currentType== ha2.todoType.play){
			_stack.push({
		    "cmd":'refill',
		    "obj":_todoPlayItems
		    });
	    	_todoPlayItems = [];
	    }
	    else if(_currentType== ha2.todoType.school){
	    	_stack.push({
		    "cmd":'refill',
		    "obj":_todoSchoolItems
		    });
	    	_todoSchoolItems = [];
	    }
	    _observers.notify();
	},
	redo: function(){
		var _stack= this._getStack();
		var _todoItems= this.getItems();
		if(_stack.length >0){
			var task= _stack.pop();
			if(task.cmd=='edit'){
				task.obj.item=task.txt;
			}
			else if(task.cmd=='add'){
				_todoItems.splice(task.idx,0,task.obj);
			}
			else if (task.cmd=='pop'){
				_todoItems.splice(0,1);
			}
			else if (task.cmd=='refill'){
				if(_currentType== ha2.todoType.work)
					_todoWorkItems=task.obj;
				else if(_currentType== ha2.todoType.play)
					_todoPlayItems=task.obj;
				else if(_currentType== ha2.todoType.school)
					_todoSchoolItems=task.obj;
			}
			_observers.notify();
		}
	},
	register: function(fxn) { _observers.add(fxn); }
    };
}


// Make a single category control button. Clicking this button
// should change the category for subsequent todo item additions
//
// btnId - the Id of the element of this button
// category - the category associated with this button
//
var makeCategoryControl = function(btnId, category) {
    var _btn = document.getElementById(btnId);
    var _observers = makeSignaller();
    
    _btn.addEventListener('click', function() {
	console.log(category);
	_observers.notify({
	    type: ha2.signal.setType,
	    value: category
	});
    });

    return {
	register: function(fxn) { _observers.add(fxn); }
    }
}

// Make a single clear items button. Clicking this button should 
// delete all items in the todo list.
//
// btnId - the Id of the element of this button
//
var makeClearControl = function(btnId) {
    var _btn = document.getElementById(btnId);
    var _observers = makeSignaller();
    
    _btn.addEventListener('click', function() {
	_observers.notify({
	    type: ha2.signal.clear
	});
    });

    return {
	register: function(fxn) { _observers.add(fxn); }
    }
}

// Make a set of controls to add items to the todo list.
//
// model - a reference to the model
// txtId - the Id of the element that takes the todo text
// btnId - the Id of the element that when clicked will add the text
//
var makeAddControls = function(model, txtId, btnId) {
    var _txt = document.getElementById(txtId);
    var _btn = document.getElementById(btnId);
    var _observers = makeSignaller();
    
    _btn.addEventListener('click', function() {
	_observers.notify({
	    type: ha2.signal.add,
	    value: _txt.value
	});
    });
 
    return {
	render: function() {
	    _txt.value = "";
	},

	register: function(fxn) { _observers.add(fxn); }
    };
    
}
var makeRedoControls = function(btnId) {
    var _btn = document.getElementById(btnId);
    var _observers = makeSignaller();
    
    _btn.addEventListener('click', function() {
	_observers.notify({
	    type: ha2.signal.redo
	});
    });
 
    return {

	register: function(fxn) { _observers.add(fxn); }
    };
    
}

// Make a view showing all items in the todo list and handling interactions
// directly with that list
//
// model - a reference to the model
// listId - the Id of the element holding the list, expected to be a div
//
var makeListView = function(model, listId) {
    var _list = document.getElementById(listId);
    var _observers = makeSignaller();
    
    var _addItem = function(item, num) {
   		if(item.item.length>0){
   			var newDiv = document.createElement('div');
			var newSpan = document.createElement('span');
			var btn = document.createElement("BUTTON");
			newSpan.setAttribute('class', 'listLabel');
			if (num % 2 === 0) {
	    		newDiv.setAttribute('class', 'listItem listWhite');
			} else {
	    		newDiv.setAttribute('class', 'listItem listGray');
			}
			newSpan.append(document.createTextNode(item.type + ": "));
			newDiv.append(newSpan);
			newDiv.append(document.createTextNode(item.item));
			btn.addEventListener('click', function() {
	    		_observers.notify({
				type: ha2.signal.remove,
				value: item
	    		});
			});
			newSpan.addEventListener('click', function() {
				var newText =prompt("edit task",item.item);
				if(newText.length > 0){
					_observers.notify({
					type: ha2.signal.edit,
					value: item,
					txt: newText
	    			});

				}
			});
			newDiv.append(btn);
			_list.append(newDiv);
   		}
    }

    return {
	render: function() {
	    while(_list.firstChild) {
		_list.removeChild(_list.firstChild);
	    }

	    var items = model.getItems();
	    for (var i = 0; i < items.length; i++) {
		_addItem(items[i], i);
	    }
	},

	register: function(fxn) { _observers.add(fxn); }
    };
}

// the controller for the MVC setup
//
// model - a reference to the model
//
var makeController = function(model) {
 
    return {
	dispatch: function(evt) {
	    switch(evt.type) {
		case ha2.signal.add:
		    model.addItem(evt.value);
		    break;
		case ha2.signal.remove:
		    model.removeItem(evt.value);
		    break;
		case ha2.signal.clear:
		    model.clearItems();
		    break;
		case ha2.signal.edit:
		    model.setTask(evt.value,evt.txt);
		    break;
		case ha2.signal.redo:
		    model.redo();
		    break;
		case ha2.signal.setType:
		    model.setType(evt.value);
		    break;
		default:
		    console.log('Unknown Event Type: ', evt);
	    }
	}
    };
}

// Create your MVC system here once the DOM Content is loaded
//
document.addEventListener("DOMContentLoaded", function(event) {
    var model = makeModel();
    var view = makeListView(model, 'listDiv');
    var controls1 = makeAddControls(model, 'addTxt', 'addBtn');
   
    var redoBtn =makeRedoControls('redoBtn');
    var workBtn = makeCategoryControl('workBtn', ha2.todoType.work);
    var schoolBtn = makeCategoryControl('schoolBtn', ha2.todoType.school);
    var playBtn = makeCategoryControl('playBtn', ha2.todoType.play);
    var clearBtn = makeClearControl('clearBtn');
    var controller = makeController(model);
    model.register(view.render);
    model.register(controls1.render);
    view.register(controller.dispatch);
    controls1.register(controller.dispatch);
    workBtn.register(controller.dispatch);
    playBtn.register(controller.dispatch);
    schoolBtn.register(controller.dispatch);
    clearBtn.register(controller.dispatch);
    redoBtn.register(controller.dispatch);
});
