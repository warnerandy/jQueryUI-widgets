// JavaScript Document// JavaScript Document
// Andy Warner
//all events will be all lowercase to simplify events
	
Observable = {
	events: [],
	listeners:[],
	addEvent:function(eName,fn){
		var newEvent = true;
		var name = eName.toLowerCase()
		if (!this.events) this.events = [];
		for (var i=0; i<this.events.length; i++){
			if (this.events[i] == name){
				newEvent = false;
			}
		}
		if (newEvent){
			this.events.push(name);
			if (typeof fn !== "undefined"){
				this.addListener(name,fn);
			}
		}
	},
	addListener:function(eName,fn){
		this.listeners.push({name:eName,eventFn:fn});
	},
	removeEvent:function(event){
		var newEvents = [];
		var i = 0;
		while(e = this.events.pop()){
			if (this.events[i].name != event){
				newEvents.push(event);
			}
		}
		this.events = newEvents;
	},
	fireEvent: function(eventName,args){
		for (var i=0;i<this.listeners.length;i++){
			if (this.listeners[i].name === eventName){
				this.listeners[i].eventFn(args);
			}
		}
	}
};