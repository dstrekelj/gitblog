(function () { "use strict";
function $extend(from, fields) {
	function Inherit() {} Inherit.prototype = from; var proto = new Inherit();
	for (var name in fields) proto[name] = fields[name];
	if( fields.toString !== Object.prototype.toString ) proto.toString = fields.toString;
	return proto;
}
var Lambda = function() { };
Lambda.exists = function(it,f) {
	var $it0 = it.iterator();
	while( $it0.hasNext() ) {
		var x = $it0.next();
		if(f(x)) return true;
	}
	return false;
};
var List = function() {
	this.length = 0;
};
List.prototype = {
	iterator: function() {
		return { h : this.h, hasNext : function() {
			return this.h != null;
		}, next : function() {
			if(this.h == null) return null;
			var x = this.h[0];
			this.h = this.h[1];
			return x;
		}};
	}
};
var gitblog = {};
gitblog.API = function() { };
gitblog.API.init = function() {
	gitblog.API.user = new gitblog.Connection("https://api.github.com/users/dstrekelj");
	gitblog.API.repos = new gitblog.Connection("https://api.github.com/users/dstrekelj/repos");
	gitblog.API.contents = new gitblog.Connection("https://api.github.com/repos/dstrekelj/ufront-example-HelloWorld/contents/wiki/");
};
var haxe = {};
haxe.Http = function(url) {
	this.url = url;
	this.headers = new List();
	this.params = new List();
	this.async = true;
};
haxe.Http.prototype = {
	request: function(post) {
		var me = this;
		me.responseData = null;
		var r = this.req = js.Browser.createXMLHttpRequest();
		var onreadystatechange = function(_) {
			if(r.readyState != 4) return;
			var s;
			try {
				s = r.status;
			} catch( e ) {
				s = null;
			}
			if(s == undefined) s = null;
			if(s != null) me.onStatus(s);
			if(s != null && s >= 200 && s < 400) {
				me.req = null;
				me.onData(me.responseData = r.responseText);
			} else if(s == null) {
				me.req = null;
				me.onError("Failed to connect or resolve host");
			} else switch(s) {
			case 12029:
				me.req = null;
				me.onError("Failed to connect to host");
				break;
			case 12007:
				me.req = null;
				me.onError("Unknown host");
				break;
			default:
				me.req = null;
				me.responseData = r.responseText;
				me.onError("Http Error #" + r.status);
			}
		};
		if(this.async) r.onreadystatechange = onreadystatechange;
		var uri = this.postData;
		if(uri != null) post = true; else {
			var $it0 = this.params.iterator();
			while( $it0.hasNext() ) {
				var p = $it0.next();
				if(uri == null) uri = ""; else uri += "&";
				uri += encodeURIComponent(p.param) + "=" + encodeURIComponent(p.value);
			}
		}
		try {
			if(post) r.open("POST",this.url,this.async); else if(uri != null) {
				var question = this.url.split("?").length <= 1;
				r.open("GET",this.url + (question?"?":"&") + uri,this.async);
				uri = null;
			} else r.open("GET",this.url,this.async);
		} catch( e1 ) {
			me.req = null;
			this.onError(e1.toString());
			return;
		}
		if(!Lambda.exists(this.headers,function(h) {
			return h.header == "Content-Type";
		}) && post && this.postData == null) r.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
		var $it1 = this.headers.iterator();
		while( $it1.hasNext() ) {
			var h1 = $it1.next();
			r.setRequestHeader(h1.header,h1.value);
		}
		r.send(uri);
		if(!this.async) onreadystatechange(null);
	}
	,onData: function(data) {
	}
	,onError: function(msg) {
	}
	,onStatus: function(status) {
	}
};
gitblog.Connection = function(URL) {
	haxe.Http.call(this,URL);
};
gitblog.Connection.__super__ = haxe.Http;
gitblog.Connection.prototype = $extend(haxe.Http.prototype,{
	get: function() {
		haxe.Http.prototype.request.call(this,false);
		return this;
	}
	,onSuccess: function(Callback) {
		this.onData = Callback;
		return this;
	}
	,onFailure: function(Callback) {
		this.onError = Callback;
		return this;
	}
	,onChange: function(Callback) {
		this.onStatus = Callback;
		return this;
	}
	,post: function() {
		haxe.Http.prototype.request.call(this,true);
		return this;
	}
});
gitblog.GitBlog = function() {
	gitblog.API.init();
};
gitblog.GitBlog.main = function() {
	new gitblog.GitBlog();
	gitblog.API.user.onSuccess(function(Data) {
		var user = JSON.parse(Data);
		console.log(user.name);
	}).onFailure(function(Message) {
		console.log(Message);
	}).onChange(function(Status) {
		console.log(Status);
	}).get();
	gitblog.API.repos.onSuccess(function(Data1) {
		var repos = JSON.parse(Data1);
		var _g = 0;
		while(_g < repos.length) {
			var repo = repos[_g];
			++_g;
			console.log(repo.name);
		}
	}).onFailure(function(Message1) {
		console.log(Message1);
	}).onChange(function(Status1) {
		console.log(Status1);
	}).get();
	gitblog.API.contents.onSuccess(function(Data2) {
		var contents = JSON.parse(Data2);
		var _g1 = 0;
		while(_g1 < contents.length) {
			var content = contents[_g1];
			++_g1;
			console.log(content.name);
		}
	}).onFailure(function(Message2) {
		console.log(Message2);
	}).onChange(function(Status2) {
		console.log(Status2);
	}).get();
};
gitblog.views = {};
gitblog.views.UserView = function(User) {
	var div;
	var _this = window.document;
	div = _this.createElement("div");
	div.innerText = "yo";
	window.document.body.appendChild(div);
};
haxe.io = {};
haxe.io.Eof = function() { };
haxe.io.Eof.prototype = {
	toString: function() {
		return "Eof";
	}
};
var js = {};
js.Browser = function() { };
js.Browser.createXMLHttpRequest = function() {
	if(typeof XMLHttpRequest != "undefined") return new XMLHttpRequest();
	if(typeof ActiveXObject != "undefined") return new ActiveXObject("Microsoft.XMLHTTP");
	throw "Unable to create XMLHttpRequest object.";
};
gitblog.GitBlog.main();
})();
