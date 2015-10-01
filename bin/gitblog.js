(function () { "use strict";
function $extend(from, fields) {
	function Inherit() {} Inherit.prototype = from; var proto = new Inherit();
	for (var name in fields) proto[name] = fields[name];
	if( fields.toString !== Object.prototype.toString ) proto.toString = fields.toString;
	return proto;
}
var EReg = function(r,opt) {
	opt = opt.split("u").join("");
	this.r = new RegExp(r,opt);
};
EReg.__name__ = true;
EReg.prototype = {
	match: function(s) {
		if(this.r.global) this.r.lastIndex = 0;
		this.r.m = this.r.exec(s);
		this.r.s = s;
		return this.r.m != null;
	}
	,matched: function(n) {
		if(this.r.m != null && n >= 0 && n < this.r.m.length) return this.r.m[n]; else throw "EReg::matched";
	}
	,matchedRight: function() {
		if(this.r.m == null) throw "No string matched";
		var sz = this.r.m.index + this.r.m[0].length;
		return this.r.s.substr(sz,this.r.s.length - sz);
	}
	,matchedPos: function() {
		if(this.r.m == null) throw "No string matched";
		return { pos : this.r.m.index, len : this.r.m[0].length};
	}
	,matchSub: function(s,pos,len) {
		if(len == null) len = -1;
		if(this.r.global) {
			this.r.lastIndex = pos;
			this.r.m = this.r.exec(len < 0?s:HxOverrides.substr(s,0,pos + len));
			var b = this.r.m != null;
			if(b) this.r.s = s;
			return b;
		} else {
			var b1 = this.match(len < 0?HxOverrides.substr(s,pos,null):HxOverrides.substr(s,pos,len));
			if(b1) {
				this.r.s = s;
				this.r.m.index += pos;
			}
			return b1;
		}
	}
	,replace: function(s,by) {
		return s.replace(this.r,by);
	}
	,map: function(s,f) {
		var offset = 0;
		var buf = new StringBuf();
		do {
			if(offset >= s.length) break; else if(!this.matchSub(s,offset)) {
				buf.add(HxOverrides.substr(s,offset,null));
				break;
			}
			var p = this.matchedPos();
			buf.add(HxOverrides.substr(s,offset,p.pos - offset));
			buf.add(f(this));
			if(p.len == 0) {
				buf.add(HxOverrides.substr(s,p.pos,1));
				offset = p.pos + 1;
			} else offset = p.pos + p.len;
		} while(this.r.global);
		if(!this.r.global && offset > 0 && offset < s.length) buf.add(HxOverrides.substr(s,offset,null));
		return buf.b;
	}
	,__class__: EReg
};
var HxOverrides = function() { };
HxOverrides.__name__ = true;
HxOverrides.cca = function(s,index) {
	var x = s.charCodeAt(index);
	if(x != x) return undefined;
	return x;
};
HxOverrides.substr = function(s,pos,len) {
	if(pos != null && pos != 0 && len != null && len < 0) return "";
	if(len == null) len = s.length;
	if(pos < 0) {
		pos = s.length + pos;
		if(pos < 0) pos = 0;
	} else if(len < 0) len = s.length + len - pos;
	return s.substr(pos,len);
};
HxOverrides.indexOf = function(a,obj,i) {
	var len = a.length;
	if(i < 0) {
		i += len;
		if(i < 0) i = 0;
	}
	while(i < len) {
		if(a[i] === obj) return i;
		i++;
	}
	return -1;
};
HxOverrides.iter = function(a) {
	return { cur : 0, arr : a, hasNext : function() {
		return this.cur < this.arr.length;
	}, next : function() {
		return this.arr[this.cur++];
	}};
};
var Lambda = function() { };
Lambda.__name__ = true;
Lambda.exists = function(it,f) {
	var $it0 = $iterator(it)();
	while( $it0.hasNext() ) {
		var x = $it0.next();
		if(f(x)) return true;
	}
	return false;
};
var List = function() {
	this.length = 0;
};
List.__name__ = true;
List.prototype = {
	add: function(item) {
		var x = [item];
		if(this.h == null) this.h = x; else this.q[1] = x;
		this.q = x;
		this.length++;
	}
	,push: function(item) {
		var x = [item,this.h];
		this.h = x;
		if(this.q == null) this.q = x;
		this.length++;
	}
	,first: function() {
		if(this.h == null) return null; else return this.h[0];
	}
	,pop: function() {
		if(this.h == null) return null;
		var x = this.h[0];
		this.h = this.h[1];
		if(this.h == null) this.q = null;
		this.length--;
		return x;
	}
	,isEmpty: function() {
		return this.h == null;
	}
	,iterator: function() {
		return { h : this.h, hasNext : function() {
			return this.h != null;
		}, next : function() {
			if(this.h == null) return null;
			var x = this.h[0];
			this.h = this.h[1];
			return x;
		}};
	}
	,__class__: List
};
var IMap = function() { };
IMap.__name__ = true;
var Markdown = function() { };
Markdown.__name__ = true;
Markdown.markdownToHtml = function(markdown) {
	var document = new Document();
	try {
		var lines = new EReg("(\r\n|\r)","g").replace(markdown,"\n").split("\n");
		document.parseRefLinks(lines);
		var blocks = document.parseLines(lines);
		return Markdown.renderHtml(blocks);
	} catch( e ) {
		return "<pre>" + Std.string(e) + "</pre>";
	}
};
Markdown.renderHtml = function(blocks) {
	return new markdown.HtmlRenderer().render(blocks);
};
var Document = function() {
	this.refLinks = new haxe.ds.StringMap();
	this.inlineSyntaxes = [];
};
Document.__name__ = true;
Document.prototype = {
	parseRefLinks: function(lines) {
		var indent = "^[ ]{0,3}";
		var id = "\\[([^\\]]+)\\]";
		var quote = "\"[^\"]+\"";
		var apos = "'[^']+'";
		var paren = "\\([^)]+\\)";
		var titles = new EReg("(" + quote + "|" + apos + "|" + paren + ")","");
		var link = new EReg("" + indent + id + ":\\s+(\\S+)\\s*(" + quote + "|" + apos + "|" + paren + "|)\\s*$","");
		var _g1 = 0;
		var _g = lines.length;
		while(_g1 < _g) {
			var i = _g1++;
			if(!link.match(lines[i])) continue;
			var id1 = link.matched(1);
			var url = link.matched(2);
			var title = link.matched(3);
			if(StringTools.startsWith(url,"<") && StringTools.endsWith(url,">")) url = HxOverrides.substr(url,1,url.length - 2);
			if(title == "" && lines[i + 1] != null && titles.match(lines[i + 1])) {
				title = titles.matched(1);
				lines[i + 1] = "";
			}
			if(title == "") title = null; else title = title.substring(1,title.length - 1);
			id1 = id1.toLowerCase();
			var value = new Link(id1,url,title);
			this.refLinks.set(id1,value);
			lines[i] = "";
		}
	}
	,parseLines: function(lines) {
		var parser = new markdown.BlockParser(lines,this);
		var blocks = [];
		while(!(parser.pos >= parser.lines.length)) {
			var _g = 0;
			var _g1 = markdown.BlockSyntax.get_syntaxes();
			while(_g < _g1.length) {
				var syntax = _g1[_g];
				++_g;
				if(syntax.canParse(parser)) {
					var block = syntax.parse(parser);
					if(block != null) blocks.push(block);
					break;
				}
			}
		}
		return blocks;
	}
	,parseInline: function(text) {
		return new markdown.InlineParser(text,this).parse();
	}
	,__class__: Document
};
var Link = function(id,url,title) {
	this.id = id;
	this.url = url;
	this.title = title;
};
Link.__name__ = true;
Link.prototype = {
	__class__: Link
};
var Reflect = function() { };
Reflect.__name__ = true;
Reflect.field = function(o,field) {
	try {
		return o[field];
	} catch( e ) {
		return null;
	}
};
Reflect.compare = function(a,b) {
	if(a == b) return 0; else if(a > b) return 1; else return -1;
};
var Std = function() { };
Std.__name__ = true;
Std.string = function(s) {
	return js.Boot.__string_rec(s,"");
};
Std.parseInt = function(x) {
	var v = parseInt(x,10);
	if(v == 0 && (HxOverrides.cca(x,1) == 120 || HxOverrides.cca(x,1) == 88)) v = parseInt(x);
	if(isNaN(v)) return null;
	return v;
};
Std.parseFloat = function(x) {
	return parseFloat(x);
};
var StringBuf = function() {
	this.b = "";
};
StringBuf.__name__ = true;
StringBuf.prototype = {
	add: function(x) {
		this.b += Std.string(x);
	}
	,__class__: StringBuf
};
var StringTools = function() { };
StringTools.__name__ = true;
StringTools.htmlEscape = function(s,quotes) {
	s = s.split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;");
	if(quotes) return s.split("\"").join("&quot;").split("'").join("&#039;"); else return s;
};
StringTools.startsWith = function(s,start) {
	return s.length >= start.length && HxOverrides.substr(s,0,start.length) == start;
};
StringTools.endsWith = function(s,end) {
	var elen = end.length;
	var slen = s.length;
	return slen >= elen && HxOverrides.substr(s,slen - elen,elen) == end;
};
StringTools.isSpace = function(s,pos) {
	var c = HxOverrides.cca(s,pos);
	return c > 8 && c < 14 || c == 32;
};
StringTools.ltrim = function(s) {
	var l = s.length;
	var r = 0;
	while(r < l && StringTools.isSpace(s,r)) r++;
	if(r > 0) return HxOverrides.substr(s,r,l - r); else return s;
};
StringTools.rtrim = function(s) {
	var l = s.length;
	var r = 0;
	while(r < l && StringTools.isSpace(s,l - r - 1)) r++;
	if(r > 0) return HxOverrides.substr(s,0,l - r); else return s;
};
StringTools.trim = function(s) {
	return StringTools.ltrim(StringTools.rtrim(s));
};
StringTools.replace = function(s,sub,by) {
	return s.split(sub).join(by);
};
StringTools.fastCodeAt = function(s,index) {
	return s.charCodeAt(index);
};
var frank = {};
frank.App = function() {
	this.routes = new Array();
	window.addEventListener("hashchange",$bind(this,this.router));
};
frank.App.__name__ = true;
frank.App.prototype = {
	route: function(route) {
		this.routes.push(route);
		return this;
	}
	,router: function(event) {
		var hash = HxOverrides.substr(window.location.hash,1,null);
		var route = this.findRoute(hash);
		if(route != null) route.controller.enter(hash); else console.log("ERROR: Unmatched route.");
	}
	,findRoute: function(hash) {
		var _g = 0;
		var _g1 = this.routes;
		while(_g < _g1.length) {
			var route = _g1[_g];
			++_g;
			if(route.path.match(hash)) return route;
		}
		return null;
	}
	,__class__: frank.App
};
frank.Controller = function() { };
frank.Controller.__name__ = true;
frank.Controller.prototype = {
	__class__: frank.Controller
};
frank.View = function(parentElementID,templateName) {
	this.parentElement = window.document.getElementById(parentElementID);
	this.viewTemplate = new haxe.Template(haxe.Resource.getString(templateName));
};
frank.View.__name__ = true;
frank.View.prototype = {
	update: function(viewData) {
		this.parentElement.innerHTML = this.viewTemplate.execute(viewData);
	}
	,__class__: frank.View
};
var haxe = {};
haxe.Http = function(url) {
	this.url = url;
	this.headers = new List();
	this.params = new List();
	this.async = true;
};
haxe.Http.__name__ = true;
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
	,__class__: haxe.Http
};
var gitblog = {};
gitblog.Connection = function(baseURL) {
	this.baseURL = baseURL;
	haxe.Http.call(this,this.baseURL);
};
gitblog.Connection.__name__ = true;
gitblog.Connection.__super__ = haxe.Http;
gitblog.Connection.prototype = $extend(haxe.Http.prototype,{
	get: function() {
		haxe.Http.prototype.request.call(this,false);
		return this;
	}
	,onChange: function(callback) {
		this.onStatus = callback;
		return this;
	}
	,onFailure: function(callback) {
		this.onError = callback;
		return this;
	}
	,onSuccess: function(callback) {
		this.onData = callback;
		return this;
	}
	,parameters: function(params) {
		this.url = this.baseURL + params;
		return this;
	}
	,post: function() {
		haxe.Http.prototype.request.call(this,true);
		return this;
	}
	,__class__: gitblog.Connection
});
gitblog.GitBlog = function() {
	new frank.App().route({ path : new EReg("^/$",""), controller : new gitblog.controllers.HomeController()}).route({ path : new EReg("^/contents/(.*)$",""), controller : new gitblog.controllers.ContentsController()});
};
gitblog.GitBlog.__name__ = true;
gitblog.GitBlog.main = function() {
	new gitblog.GitBlog();
};
gitblog.GitBlog.prototype = {
	__class__: gitblog.GitBlog
};
gitblog.controllers = {};
gitblog.controllers.ContentsController = function() {
	this.content = new gitblog.Connection("https://api.github.com/repos/dstrekelj/dstrekelj.github.io");
	this.articleView = new gitblog.views.ArticleView();
};
gitblog.controllers.ContentsController.__name__ = true;
gitblog.controllers.ContentsController.__interfaces__ = [frank.Controller];
gitblog.controllers.ContentsController.prototype = {
	enter: function(hash) {
		var _g = this;
		this.content.parameters(hash).onSuccess(function(response) {
			var articleData = JSON.parse(response);
			var articleModel = new gitblog.models.ArticleModel({ body : articleData.content, timestamp : articleData.name});
			_g.articleView.update(articleModel);
		}).onFailure(function(response1) {
			console.log("FAILURE: " + response1);
		}).get();
	}
	,__class__: gitblog.controllers.ContentsController
};
gitblog.controllers.HomeController = function() {
	var userApi = new gitblog.Connection("https://api.github.com/users/dstrekelj");
	var userView = new gitblog.views.UserView();
	userApi.onSuccess(function(Data) {
		var userData = JSON.parse(Data);
		var userModel = new gitblog.models.UserModel({ avatar : userData.avatar_url, name : userData.name, email : userData.email, login : userData.login, location : userData.location, repos : userData.public_repos, url : userData.url});
		userView.update(userModel);
	}).onFailure(function(Message) {
		console.log(Message);
	}).onChange(function(Status) {
		console.log(Status);
	}).get();
	var articlesApi = new gitblog.Connection("https://api.github.com/repos/dstrekelj/dstrekelj.github.io/contents/content");
	var articlesView = new gitblog.views.ArticlesView();
	articlesApi.onSuccess(function(Data1) {
		var articlesData = JSON.parse(Data1);
		var articlesModels = new Array();
		var _g = 0;
		while(_g < articlesData.length) {
			var article = articlesData[_g];
			++_g;
			articlesModels.push(new gitblog.models.ArticlesModel({ timestamp : article.name, title : article.name, path : article.path}));
		}
		articlesView.update(articlesModels);
	}).onFailure(function(Message1) {
		console.log(Message1);
	}).onChange(function(Status1) {
		console.log(Status1);
	}).get();
};
gitblog.controllers.HomeController.__name__ = true;
gitblog.controllers.HomeController.__interfaces__ = [frank.Controller];
gitblog.controllers.HomeController.prototype = {
	enter: function(hash) {
	}
	,__class__: gitblog.controllers.HomeController
};
gitblog.models = {};
gitblog.models.ArticleModel = function(params) {
	this.body = params.body;
	this.timestamp = params.timestamp;
};
gitblog.models.ArticleModel.__name__ = true;
gitblog.models.ArticleModel.prototype = {
	__class__: gitblog.models.ArticleModel
};
gitblog.models.ArticlesModel = function(params) {
	this.timestamp = params.timestamp;
	this.title = params.title;
	this.path = params.path;
};
gitblog.models.ArticlesModel.__name__ = true;
gitblog.models.ArticlesModel.prototype = {
	__class__: gitblog.models.ArticlesModel
};
gitblog.models.UserModel = function(params) {
	this.avatar = params.avatar;
	this.email = params.email;
	this.location = params.location;
	this.login = params.login;
	this.name = params.name;
	this.repos = params.repos;
	this.url = params.url;
};
gitblog.models.UserModel.__name__ = true;
gitblog.models.UserModel.prototype = {
	__class__: gitblog.models.UserModel
};
gitblog.views = {};
gitblog.views.ArticleView = function() {
	frank.View.call(this,"article","ArticleTemplate");
};
gitblog.views.ArticleView.__name__ = true;
gitblog.views.ArticleView.__super__ = frank.View;
gitblog.views.ArticleView.prototype = $extend(frank.View.prototype,{
	update: function(article) {
		var date = HxOverrides.substr(article.timestamp,0,10);
		var time = HxOverrides.substr(article.timestamp,11,5).split("-").join(":");
		article.timestamp = date + " @ " + time;
		article.body = Markdown.markdownToHtml(window.atob(article.body));
		frank.View.prototype.update.call(this,{ article : article});
	}
	,__class__: gitblog.views.ArticleView
});
gitblog.views.ArticlesView = function() {
	frank.View.call(this,"articles","ArticlesTemplate");
};
gitblog.views.ArticlesView.__name__ = true;
gitblog.views.ArticlesView.__super__ = frank.View;
gitblog.views.ArticlesView.prototype = $extend(frank.View.prototype,{
	update: function(articles) {
		var _g = 0;
		while(_g < articles.length) {
			var article = articles[_g];
			++_g;
			var date = HxOverrides.substr(article.timestamp,0,10);
			var time = HxOverrides.substr(article.timestamp,11,5).split("-").join(":");
			article.timestamp = date + " @ " + time;
			article.title = article.title.substring(17,article.title.length - 3).split("-").join(" ");
		}
		frank.View.prototype.update.call(this,{ articles : articles});
	}
	,__class__: gitblog.views.ArticlesView
});
gitblog.views.UserView = function() {
	frank.View.call(this,"user","UserTemplate");
};
gitblog.views.UserView.__name__ = true;
gitblog.views.UserView.__super__ = frank.View;
gitblog.views.UserView.prototype = $extend(frank.View.prototype,{
	update: function(user) {
		frank.View.prototype.update.call(this,{ user : user});
	}
	,__class__: gitblog.views.UserView
});
haxe.Resource = function() { };
haxe.Resource.__name__ = true;
haxe.Resource.getString = function(name) {
	var _g = 0;
	var _g1 = haxe.Resource.content;
	while(_g < _g1.length) {
		var x = _g1[_g];
		++_g;
		if(x.name == name) {
			if(x.str != null) return x.str;
			var b = haxe.crypto.Base64.decode(x.data);
			return b.toString();
		}
	}
	return null;
};
haxe._Template = {};
haxe._Template.TemplateExpr = { __ename__ : true, __constructs__ : ["OpVar","OpExpr","OpIf","OpStr","OpBlock","OpForeach","OpMacro"] };
haxe._Template.TemplateExpr.OpVar = function(v) { var $x = ["OpVar",0,v]; $x.__enum__ = haxe._Template.TemplateExpr; return $x; };
haxe._Template.TemplateExpr.OpExpr = function(expr) { var $x = ["OpExpr",1,expr]; $x.__enum__ = haxe._Template.TemplateExpr; return $x; };
haxe._Template.TemplateExpr.OpIf = function(expr,eif,eelse) { var $x = ["OpIf",2,expr,eif,eelse]; $x.__enum__ = haxe._Template.TemplateExpr; return $x; };
haxe._Template.TemplateExpr.OpStr = function(str) { var $x = ["OpStr",3,str]; $x.__enum__ = haxe._Template.TemplateExpr; return $x; };
haxe._Template.TemplateExpr.OpBlock = function(l) { var $x = ["OpBlock",4,l]; $x.__enum__ = haxe._Template.TemplateExpr; return $x; };
haxe._Template.TemplateExpr.OpForeach = function(expr,loop) { var $x = ["OpForeach",5,expr,loop]; $x.__enum__ = haxe._Template.TemplateExpr; return $x; };
haxe._Template.TemplateExpr.OpMacro = function(name,params) { var $x = ["OpMacro",6,name,params]; $x.__enum__ = haxe._Template.TemplateExpr; return $x; };
haxe.Template = function(str) {
	var tokens = this.parseTokens(str);
	this.expr = this.parseBlock(tokens);
	if(!tokens.isEmpty()) throw "Unexpected '" + Std.string(tokens.first().s) + "'";
};
haxe.Template.__name__ = true;
haxe.Template.prototype = {
	execute: function(context,macros) {
		if(macros == null) this.macros = { }; else this.macros = macros;
		this.context = context;
		this.stack = new List();
		this.buf = new StringBuf();
		this.run(this.expr);
		return this.buf.b;
	}
	,resolve: function(v) {
		if(Object.prototype.hasOwnProperty.call(this.context,v)) return Reflect.field(this.context,v);
		var $it0 = this.stack.iterator();
		while( $it0.hasNext() ) {
			var ctx = $it0.next();
			if(Object.prototype.hasOwnProperty.call(ctx,v)) return Reflect.field(ctx,v);
		}
		if(v == "__current__") return this.context;
		return Reflect.field(haxe.Template.globals,v);
	}
	,parseTokens: function(data) {
		var tokens = new List();
		while(haxe.Template.splitter.match(data)) {
			var p = haxe.Template.splitter.matchedPos();
			if(p.pos > 0) tokens.add({ p : HxOverrides.substr(data,0,p.pos), s : true, l : null});
			if(HxOverrides.cca(data,p.pos) == 58) {
				tokens.add({ p : HxOverrides.substr(data,p.pos + 2,p.len - 4), s : false, l : null});
				data = haxe.Template.splitter.matchedRight();
				continue;
			}
			var parp = p.pos + p.len;
			var npar = 1;
			var params = [];
			var part = "";
			while(true) {
				var c = HxOverrides.cca(data,parp);
				parp++;
				if(c == 40) npar++; else if(c == 41) {
					npar--;
					if(npar <= 0) break;
				} else if(c == null) throw "Unclosed macro parenthesis";
				if(c == 44 && npar == 1) {
					params.push(part);
					part = "";
				} else part += String.fromCharCode(c);
			}
			params.push(part);
			tokens.add({ p : haxe.Template.splitter.matched(2), s : false, l : params});
			data = HxOverrides.substr(data,parp,data.length - parp);
		}
		if(data.length > 0) tokens.add({ p : data, s : true, l : null});
		return tokens;
	}
	,parseBlock: function(tokens) {
		var l = new List();
		while(true) {
			var t = tokens.first();
			if(t == null) break;
			if(!t.s && (t.p == "end" || t.p == "else" || HxOverrides.substr(t.p,0,7) == "elseif ")) break;
			l.add(this.parse(tokens));
		}
		if(l.length == 1) return l.first();
		return haxe._Template.TemplateExpr.OpBlock(l);
	}
	,parse: function(tokens) {
		var t = tokens.pop();
		var p = t.p;
		if(t.s) return haxe._Template.TemplateExpr.OpStr(p);
		if(t.l != null) {
			var pe = new List();
			var _g = 0;
			var _g1 = t.l;
			while(_g < _g1.length) {
				var p1 = _g1[_g];
				++_g;
				pe.add(this.parseBlock(this.parseTokens(p1)));
			}
			return haxe._Template.TemplateExpr.OpMacro(p,pe);
		}
		if(HxOverrides.substr(p,0,3) == "if ") {
			p = HxOverrides.substr(p,3,p.length - 3);
			var e = this.parseExpr(p);
			var eif = this.parseBlock(tokens);
			var t1 = tokens.first();
			var eelse;
			if(t1 == null) throw "Unclosed 'if'";
			if(t1.p == "end") {
				tokens.pop();
				eelse = null;
			} else if(t1.p == "else") {
				tokens.pop();
				eelse = this.parseBlock(tokens);
				t1 = tokens.pop();
				if(t1 == null || t1.p != "end") throw "Unclosed 'else'";
			} else {
				t1.p = HxOverrides.substr(t1.p,4,t1.p.length - 4);
				eelse = this.parse(tokens);
			}
			return haxe._Template.TemplateExpr.OpIf(e,eif,eelse);
		}
		if(HxOverrides.substr(p,0,8) == "foreach ") {
			p = HxOverrides.substr(p,8,p.length - 8);
			var e1 = this.parseExpr(p);
			var efor = this.parseBlock(tokens);
			var t2 = tokens.pop();
			if(t2 == null || t2.p != "end") throw "Unclosed 'foreach'";
			return haxe._Template.TemplateExpr.OpForeach(e1,efor);
		}
		if(haxe.Template.expr_splitter.match(p)) return haxe._Template.TemplateExpr.OpExpr(this.parseExpr(p));
		return haxe._Template.TemplateExpr.OpVar(p);
	}
	,parseExpr: function(data) {
		var l = new List();
		var expr = data;
		while(haxe.Template.expr_splitter.match(data)) {
			var p = haxe.Template.expr_splitter.matchedPos();
			var k = p.pos + p.len;
			if(p.pos != 0) l.add({ p : HxOverrides.substr(data,0,p.pos), s : true});
			var p1 = haxe.Template.expr_splitter.matched(0);
			l.add({ p : p1, s : p1.indexOf("\"") >= 0});
			data = haxe.Template.expr_splitter.matchedRight();
		}
		if(data.length != 0) l.add({ p : data, s : true});
		var e;
		try {
			e = this.makeExpr(l);
			if(!l.isEmpty()) throw l.first().p;
		} catch( s ) {
			if( js.Boot.__instanceof(s,String) ) {
				throw "Unexpected '" + s + "' in " + expr;
			} else throw(s);
		}
		return function() {
			try {
				return e();
			} catch( exc ) {
				throw "Error : " + Std.string(exc) + " in " + expr;
			}
		};
	}
	,makeConst: function(v) {
		haxe.Template.expr_trim.match(v);
		v = haxe.Template.expr_trim.matched(1);
		if(HxOverrides.cca(v,0) == 34) {
			var str = HxOverrides.substr(v,1,v.length - 2);
			return function() {
				return str;
			};
		}
		if(haxe.Template.expr_int.match(v)) {
			var i = Std.parseInt(v);
			return function() {
				return i;
			};
		}
		if(haxe.Template.expr_float.match(v)) {
			var f = Std.parseFloat(v);
			return function() {
				return f;
			};
		}
		var me = this;
		return function() {
			return me.resolve(v);
		};
	}
	,makePath: function(e,l) {
		var p = l.first();
		if(p == null || p.p != ".") return e;
		l.pop();
		var field = l.pop();
		if(field == null || !field.s) throw field.p;
		var f = field.p;
		haxe.Template.expr_trim.match(f);
		f = haxe.Template.expr_trim.matched(1);
		return this.makePath(function() {
			return Reflect.field(e(),f);
		},l);
	}
	,makeExpr: function(l) {
		return this.makePath(this.makeExpr2(l),l);
	}
	,makeExpr2: function(l) {
		var p = l.pop();
		if(p == null) throw "<eof>";
		if(p.s) return this.makeConst(p.p);
		var _g = p.p;
		switch(_g) {
		case "(":
			var e1 = this.makeExpr(l);
			var p1 = l.pop();
			if(p1 == null || p1.s) throw p1.p;
			if(p1.p == ")") return e1;
			var e2 = this.makeExpr(l);
			var p2 = l.pop();
			if(p2 == null || p2.p != ")") throw p2.p;
			var _g1 = p1.p;
			switch(_g1) {
			case "+":
				return function() {
					return e1() + e2();
				};
			case "-":
				return function() {
					return e1() - e2();
				};
			case "*":
				return function() {
					return e1() * e2();
				};
			case "/":
				return function() {
					return e1() / e2();
				};
			case ">":
				return function() {
					return e1() > e2();
				};
			case "<":
				return function() {
					return e1() < e2();
				};
			case ">=":
				return function() {
					return e1() >= e2();
				};
			case "<=":
				return function() {
					return e1() <= e2();
				};
			case "==":
				return function() {
					return e1() == e2();
				};
			case "!=":
				return function() {
					return e1() != e2();
				};
			case "&&":
				return function() {
					return e1() && e2();
				};
			case "||":
				return function() {
					return e1() || e2();
				};
			default:
				throw "Unknown operation " + p1.p;
			}
			break;
		case "!":
			var e = this.makeExpr(l);
			return function() {
				var v = e();
				return v == null || v == false;
			};
		case "-":
			var e3 = this.makeExpr(l);
			return function() {
				return -e3();
			};
		}
		throw p.p;
	}
	,run: function(e) {
		switch(e[1]) {
		case 0:
			var v = e[2];
			this.buf.add(Std.string(this.resolve(v)));
			break;
		case 1:
			var e1 = e[2];
			this.buf.add(Std.string(e1()));
			break;
		case 2:
			var eelse = e[4];
			var eif = e[3];
			var e2 = e[2];
			var v1 = e2();
			if(v1 == null || v1 == false) {
				if(eelse != null) this.run(eelse);
			} else this.run(eif);
			break;
		case 3:
			var str = e[2];
			if(str == null) this.buf.b += "null"; else this.buf.b += "" + str;
			break;
		case 4:
			var l = e[2];
			var $it0 = l.iterator();
			while( $it0.hasNext() ) {
				var e3 = $it0.next();
				this.run(e3);
			}
			break;
		case 5:
			var loop = e[3];
			var e4 = e[2];
			var v2 = e4();
			try {
				var x = $iterator(v2)();
				if(x.hasNext == null) throw null;
				v2 = x;
			} catch( e5 ) {
				try {
					if(v2.hasNext == null) throw null;
				} catch( e6 ) {
					throw "Cannot iter on " + Std.string(v2);
				}
			}
			this.stack.push(this.context);
			var v3 = v2;
			while( v3.hasNext() ) {
				var ctx = v3.next();
				this.context = ctx;
				this.run(loop);
			}
			this.context = this.stack.pop();
			break;
		case 6:
			var params = e[3];
			var m = e[2];
			var v4 = Reflect.field(this.macros,m);
			var pl = new Array();
			var old = this.buf;
			pl.push($bind(this,this.resolve));
			var $it1 = params.iterator();
			while( $it1.hasNext() ) {
				var p = $it1.next();
				switch(p[1]) {
				case 0:
					var v5 = p[2];
					pl.push(this.resolve(v5));
					break;
				default:
					this.buf = new StringBuf();
					this.run(p);
					pl.push(this.buf.b);
				}
			}
			this.buf = old;
			try {
				this.buf.add(Std.string(v4.apply(this.macros,pl)));
			} catch( e7 ) {
				var plstr;
				try {
					plstr = pl.join(",");
				} catch( e8 ) {
					plstr = "???";
				}
				var msg = "Macro call " + m + "(" + plstr + ") failed (" + Std.string(e7) + ")";
				throw msg;
			}
			break;
		}
	}
	,__class__: haxe.Template
};
haxe.io = {};
haxe.io.Bytes = function(length,b) {
	this.length = length;
	this.b = b;
};
haxe.io.Bytes.__name__ = true;
haxe.io.Bytes.alloc = function(length) {
	var a = new Array();
	var _g = 0;
	while(_g < length) {
		var i = _g++;
		a.push(0);
	}
	return new haxe.io.Bytes(length,a);
};
haxe.io.Bytes.ofString = function(s) {
	var a = new Array();
	var i = 0;
	while(i < s.length) {
		var c = StringTools.fastCodeAt(s,i++);
		if(55296 <= c && c <= 56319) c = c - 55232 << 10 | StringTools.fastCodeAt(s,i++) & 1023;
		if(c <= 127) a.push(c); else if(c <= 2047) {
			a.push(192 | c >> 6);
			a.push(128 | c & 63);
		} else if(c <= 65535) {
			a.push(224 | c >> 12);
			a.push(128 | c >> 6 & 63);
			a.push(128 | c & 63);
		} else {
			a.push(240 | c >> 18);
			a.push(128 | c >> 12 & 63);
			a.push(128 | c >> 6 & 63);
			a.push(128 | c & 63);
		}
	}
	return new haxe.io.Bytes(a.length,a);
};
haxe.io.Bytes.prototype = {
	get: function(pos) {
		return this.b[pos];
	}
	,set: function(pos,v) {
		this.b[pos] = v & 255;
	}
	,getString: function(pos,len) {
		if(pos < 0 || len < 0 || pos + len > this.length) throw haxe.io.Error.OutsideBounds;
		var s = "";
		var b = this.b;
		var fcc = String.fromCharCode;
		var i = pos;
		var max = pos + len;
		while(i < max) {
			var c = b[i++];
			if(c < 128) {
				if(c == 0) break;
				s += fcc(c);
			} else if(c < 224) s += fcc((c & 63) << 6 | b[i++] & 127); else if(c < 240) {
				var c2 = b[i++];
				s += fcc((c & 31) << 12 | (c2 & 127) << 6 | b[i++] & 127);
			} else {
				var c21 = b[i++];
				var c3 = b[i++];
				var u = (c & 15) << 18 | (c21 & 127) << 12 | (c3 & 127) << 6 | b[i++] & 127;
				s += fcc((u >> 10) + 55232);
				s += fcc(u & 1023 | 56320);
			}
		}
		return s;
	}
	,toString: function() {
		return this.getString(0,this.length);
	}
	,__class__: haxe.io.Bytes
};
haxe.crypto = {};
haxe.crypto.Base64 = function() { };
haxe.crypto.Base64.__name__ = true;
haxe.crypto.Base64.decode = function(str,complement) {
	if(complement == null) complement = true;
	if(complement) while(HxOverrides.cca(str,str.length - 1) == 61) str = HxOverrides.substr(str,0,-1);
	return new haxe.crypto.BaseCode(haxe.crypto.Base64.BYTES).decodeBytes(haxe.io.Bytes.ofString(str));
};
haxe.crypto.BaseCode = function(base) {
	var len = base.length;
	var nbits = 1;
	while(len > 1 << nbits) nbits++;
	if(nbits > 8 || len != 1 << nbits) throw "BaseCode : base length must be a power of two.";
	this.base = base;
	this.nbits = nbits;
};
haxe.crypto.BaseCode.__name__ = true;
haxe.crypto.BaseCode.prototype = {
	initTable: function() {
		var tbl = new Array();
		var _g = 0;
		while(_g < 256) {
			var i = _g++;
			tbl[i] = -1;
		}
		var _g1 = 0;
		var _g2 = this.base.length;
		while(_g1 < _g2) {
			var i1 = _g1++;
			tbl[this.base.b[i1]] = i1;
		}
		this.tbl = tbl;
	}
	,decodeBytes: function(b) {
		var nbits = this.nbits;
		var base = this.base;
		if(this.tbl == null) this.initTable();
		var tbl = this.tbl;
		var size = b.length * nbits >> 3;
		var out = haxe.io.Bytes.alloc(size);
		var buf = 0;
		var curbits = 0;
		var pin = 0;
		var pout = 0;
		while(pout < size) {
			while(curbits < 8) {
				curbits += nbits;
				buf <<= nbits;
				var i = tbl[b.get(pin++)];
				if(i == -1) throw "BaseCode : invalid encoded char";
				buf |= i;
			}
			curbits -= 8;
			out.set(pout++,buf >> curbits & 255);
		}
		return out;
	}
	,__class__: haxe.crypto.BaseCode
};
haxe.ds = {};
haxe.ds.StringMap = function() {
	this.h = { };
};
haxe.ds.StringMap.__name__ = true;
haxe.ds.StringMap.__interfaces__ = [IMap];
haxe.ds.StringMap.prototype = {
	set: function(key,value) {
		this.h["$" + key] = value;
	}
	,get: function(key) {
		return this.h["$" + key];
	}
	,keys: function() {
		var a = [];
		for( var key in this.h ) {
		if(this.h.hasOwnProperty(key)) a.push(key.substr(1));
		}
		return HxOverrides.iter(a);
	}
	,__class__: haxe.ds.StringMap
};
haxe.io.Eof = function() { };
haxe.io.Eof.__name__ = true;
haxe.io.Eof.prototype = {
	toString: function() {
		return "Eof";
	}
	,__class__: haxe.io.Eof
};
haxe.io.Error = { __ename__ : true, __constructs__ : ["Blocked","Overflow","OutsideBounds","Custom"] };
haxe.io.Error.Blocked = ["Blocked",0];
haxe.io.Error.Blocked.__enum__ = haxe.io.Error;
haxe.io.Error.Overflow = ["Overflow",1];
haxe.io.Error.Overflow.__enum__ = haxe.io.Error;
haxe.io.Error.OutsideBounds = ["OutsideBounds",2];
haxe.io.Error.OutsideBounds.__enum__ = haxe.io.Error;
haxe.io.Error.Custom = function(e) { var $x = ["Custom",3,e]; $x.__enum__ = haxe.io.Error; return $x; };
var js = {};
js.Boot = function() { };
js.Boot.__name__ = true;
js.Boot.getClass = function(o) {
	if((o instanceof Array) && o.__enum__ == null) return Array; else return o.__class__;
};
js.Boot.__string_rec = function(o,s) {
	if(o == null) return "null";
	if(s.length >= 5) return "<...>";
	var t = typeof(o);
	if(t == "function" && (o.__name__ || o.__ename__)) t = "object";
	switch(t) {
	case "object":
		if(o instanceof Array) {
			if(o.__enum__) {
				if(o.length == 2) return o[0];
				var str = o[0] + "(";
				s += "\t";
				var _g1 = 2;
				var _g = o.length;
				while(_g1 < _g) {
					var i = _g1++;
					if(i != 2) str += "," + js.Boot.__string_rec(o[i],s); else str += js.Boot.__string_rec(o[i],s);
				}
				return str + ")";
			}
			var l = o.length;
			var i1;
			var str1 = "[";
			s += "\t";
			var _g2 = 0;
			while(_g2 < l) {
				var i2 = _g2++;
				str1 += (i2 > 0?",":"") + js.Boot.__string_rec(o[i2],s);
			}
			str1 += "]";
			return str1;
		}
		var tostr;
		try {
			tostr = o.toString;
		} catch( e ) {
			return "???";
		}
		if(tostr != null && tostr != Object.toString) {
			var s2 = o.toString();
			if(s2 != "[object Object]") return s2;
		}
		var k = null;
		var str2 = "{\n";
		s += "\t";
		var hasp = o.hasOwnProperty != null;
		for( var k in o ) {
		if(hasp && !o.hasOwnProperty(k)) {
			continue;
		}
		if(k == "prototype" || k == "__class__" || k == "__super__" || k == "__interfaces__" || k == "__properties__") {
			continue;
		}
		if(str2.length != 2) str2 += ", \n";
		str2 += s + k + " : " + js.Boot.__string_rec(o[k],s);
		}
		s = s.substring(1);
		str2 += "\n" + s + "}";
		return str2;
	case "function":
		return "<function>";
	case "string":
		return o;
	default:
		return String(o);
	}
};
js.Boot.__interfLoop = function(cc,cl) {
	if(cc == null) return false;
	if(cc == cl) return true;
	var intf = cc.__interfaces__;
	if(intf != null) {
		var _g1 = 0;
		var _g = intf.length;
		while(_g1 < _g) {
			var i = _g1++;
			var i1 = intf[i];
			if(i1 == cl || js.Boot.__interfLoop(i1,cl)) return true;
		}
	}
	return js.Boot.__interfLoop(cc.__super__,cl);
};
js.Boot.__instanceof = function(o,cl) {
	if(cl == null) return false;
	switch(cl) {
	case Int:
		return (o|0) === o;
	case Float:
		return typeof(o) == "number";
	case Bool:
		return typeof(o) == "boolean";
	case String:
		return typeof(o) == "string";
	case Array:
		return (o instanceof Array) && o.__enum__ == null;
	case Dynamic:
		return true;
	default:
		if(o != null) {
			if(typeof(cl) == "function") {
				if(o instanceof cl) return true;
				if(js.Boot.__interfLoop(js.Boot.getClass(o),cl)) return true;
			}
		} else return false;
		if(cl == Class && o.__name__ != null) return true;
		if(cl == Enum && o.__ename__ != null) return true;
		return o.__enum__ == cl;
	}
};
js.Browser = function() { };
js.Browser.__name__ = true;
js.Browser.createXMLHttpRequest = function() {
	if(typeof XMLHttpRequest != "undefined") return new XMLHttpRequest();
	if(typeof ActiveXObject != "undefined") return new ActiveXObject("Microsoft.XMLHTTP");
	throw "Unable to create XMLHttpRequest object.";
};
var markdown = {};
markdown.Node = function() { };
markdown.Node.__name__ = true;
markdown.Node.prototype = {
	__class__: markdown.Node
};
markdown.NodeVisitor = function() { };
markdown.NodeVisitor.__name__ = true;
markdown.NodeVisitor.prototype = {
	__class__: markdown.NodeVisitor
};
markdown.ElementNode = function(tag,children) {
	this.tag = tag;
	this.children = children;
	this.attributes = new haxe.ds.StringMap();
};
markdown.ElementNode.__name__ = true;
markdown.ElementNode.__interfaces__ = [markdown.Node];
markdown.ElementNode.empty = function(tag) {
	return new markdown.ElementNode(tag,null);
};
markdown.ElementNode.withTag = function(tag) {
	return new markdown.ElementNode(tag,[]);
};
markdown.ElementNode.text = function(tag,text) {
	return new markdown.ElementNode(tag,[new markdown.TextNode(text)]);
};
markdown.ElementNode.prototype = {
	isEmpty: function() {
		return this.children == null;
	}
	,accept: function(visitor) {
		if(visitor.visitElementBefore(this)) {
			var _g = 0;
			var _g1 = this.children;
			while(_g < _g1.length) {
				var child = _g1[_g];
				++_g;
				child.accept(visitor);
			}
			visitor.visitElementAfter(this);
		}
	}
	,__class__: markdown.ElementNode
};
markdown.TextNode = function(text) {
	this.text = text;
};
markdown.TextNode.__name__ = true;
markdown.TextNode.__interfaces__ = [markdown.Node];
markdown.TextNode.prototype = {
	accept: function(visitor) {
		visitor.visitText(this);
	}
	,__class__: markdown.TextNode
};
markdown.BlockParser = function(lines,document) {
	this.lines = lines;
	this.document = document;
	this.pos = 0;
};
markdown.BlockParser.__name__ = true;
markdown.BlockParser.prototype = {
	get_current: function() {
		return this.lines[this.pos];
	}
	,get_next: function() {
		if(this.pos >= this.lines.length - 1) return null;
		return this.lines[this.pos + 1];
	}
	,advance: function() {
		this.pos++;
	}
	,get_isDone: function() {
		return this.pos >= this.lines.length;
	}
	,matches: function(ereg) {
		if(this.pos >= this.lines.length) return false;
		return ereg.match(this.lines[this.pos]);
	}
	,matchesNext: function(ereg) {
		if(this.get_next() == null) return false;
		return ereg.match(this.get_next());
	}
	,__class__: markdown.BlockParser
};
markdown.BlockSyntax = function() {
};
markdown.BlockSyntax.__name__ = true;
markdown.BlockSyntax.get_syntaxes = function() {
	if(markdown.BlockSyntax.syntaxes == null) markdown.BlockSyntax.syntaxes = [new markdown.EmptyBlockSyntax(),new markdown.BlockHtmlSyntax(),new markdown.SetextHeaderSyntax(),new markdown.HeaderSyntax(),new markdown.CodeBlockSyntax(),new markdown.GitHubCodeBlockSyntax(),new markdown.BlockquoteSyntax(),new markdown.HorizontalRuleSyntax(),new markdown.UnorderedListSyntax(),new markdown.OrderedListSyntax(),new markdown.TableSyntax(),new markdown.ParagraphSyntax()];
	return markdown.BlockSyntax.syntaxes;
};
markdown.BlockSyntax.isAtBlockEnd = function(parser) {
	if(parser.pos >= parser.lines.length) return true;
	var _g = 0;
	var _g1 = markdown.BlockSyntax.get_syntaxes();
	while(_g < _g1.length) {
		var syntax = _g1[_g];
		++_g;
		if(syntax.canParse(parser) && syntax.get_canEndBlock()) return true;
	}
	return false;
};
markdown.BlockSyntax.prototype = {
	get_pattern: function() {
		return null;
	}
	,get_canEndBlock: function() {
		return true;
	}
	,canParse: function(parser) {
		return this.get_pattern().match(parser.lines[parser.pos]);
	}
	,parse: function(parser) {
		return null;
	}
	,parseChildLines: function(parser) {
		var childLines = [];
		while(!(parser.pos >= parser.lines.length)) {
			if(!this.get_pattern().match(parser.lines[parser.pos])) break;
			childLines.push(this.get_pattern().matched(1));
			parser.advance();
		}
		return childLines;
	}
	,__class__: markdown.BlockSyntax
};
markdown.EmptyBlockSyntax = function() {
	markdown.BlockSyntax.call(this);
};
markdown.EmptyBlockSyntax.__name__ = true;
markdown.EmptyBlockSyntax.__super__ = markdown.BlockSyntax;
markdown.EmptyBlockSyntax.prototype = $extend(markdown.BlockSyntax.prototype,{
	get_pattern: function() {
		return markdown.BlockSyntax.RE_EMPTY;
	}
	,parse: function(parser) {
		parser.advance();
		return null;
	}
	,__class__: markdown.EmptyBlockSyntax
});
markdown.SetextHeaderSyntax = function() {
	markdown.BlockSyntax.call(this);
};
markdown.SetextHeaderSyntax.__name__ = true;
markdown.SetextHeaderSyntax.__super__ = markdown.BlockSyntax;
markdown.SetextHeaderSyntax.prototype = $extend(markdown.BlockSyntax.prototype,{
	canParse: function(parser) {
		return parser.matchesNext(markdown.BlockSyntax.RE_SETEXT);
	}
	,parse: function(parser) {
		var re = markdown.BlockSyntax.RE_SETEXT;
		re.match(parser.get_next());
		var tag;
		if(re.matched(1).charAt(0) == "=") tag = "h1"; else tag = "h2";
		var contents = parser.document.parseInline(parser.lines[parser.pos]);
		parser.advance();
		parser.advance();
		return new markdown.ElementNode(tag,contents);
	}
	,__class__: markdown.SetextHeaderSyntax
});
markdown.HeaderSyntax = function() {
	markdown.BlockSyntax.call(this);
};
markdown.HeaderSyntax.__name__ = true;
markdown.HeaderSyntax.__super__ = markdown.BlockSyntax;
markdown.HeaderSyntax.prototype = $extend(markdown.BlockSyntax.prototype,{
	get_pattern: function() {
		return markdown.BlockSyntax.RE_HEADER;
	}
	,parse: function(parser) {
		this.get_pattern().match(parser.lines[parser.pos]);
		parser.advance();
		var level = this.get_pattern().matched(1).length;
		var contents = parser.document.parseInline(StringTools.trim(this.get_pattern().matched(2)));
		return new markdown.ElementNode("h" + level,contents);
	}
	,__class__: markdown.HeaderSyntax
});
markdown.BlockquoteSyntax = function() {
	markdown.BlockSyntax.call(this);
};
markdown.BlockquoteSyntax.__name__ = true;
markdown.BlockquoteSyntax.__super__ = markdown.BlockSyntax;
markdown.BlockquoteSyntax.prototype = $extend(markdown.BlockSyntax.prototype,{
	get_pattern: function() {
		return markdown.BlockSyntax.RE_BLOCKQUOTE;
	}
	,parseChildLines: function(parser) {
		var childLines = [];
		while(!(parser.pos >= parser.lines.length)) if(this.get_pattern().match(parser.lines[parser.pos])) {
			childLines.push(this.get_pattern().matched(1));
			parser.advance();
		} else {
			var nextMatch;
			if(parser.get_next() != null) nextMatch = this.get_pattern().match(parser.get_next()); else nextMatch = false;
			if(StringTools.trim(parser.lines[parser.pos]) == "" && nextMatch) {
				childLines.push("");
				childLines.push(this.get_pattern().matched(1));
				parser.advance();
				parser.advance();
			} else break;
		}
		return childLines;
	}
	,parse: function(parser) {
		var childLines = this.parseChildLines(parser);
		var children = parser.document.parseLines(childLines);
		return new markdown.ElementNode("blockquote",children);
	}
	,__class__: markdown.BlockquoteSyntax
});
markdown.CodeBlockSyntax = function() {
	markdown.BlockSyntax.call(this);
};
markdown.CodeBlockSyntax.__name__ = true;
markdown.CodeBlockSyntax.__super__ = markdown.BlockSyntax;
markdown.CodeBlockSyntax.prototype = $extend(markdown.BlockSyntax.prototype,{
	get_pattern: function() {
		return markdown.BlockSyntax.RE_INDENT;
	}
	,parseChildLines: function(parser) {
		var childLines = [];
		while(!(parser.pos >= parser.lines.length)) if(this.get_pattern().match(parser.lines[parser.pos])) {
			childLines.push(this.get_pattern().matched(1));
			parser.advance();
		} else {
			var nextMatch;
			if(parser.get_next() != null) nextMatch = this.get_pattern().match(parser.get_next()); else nextMatch = false;
			if(StringTools.trim(parser.lines[parser.pos]) == "" && nextMatch) {
				childLines.push("");
				childLines.push(this.get_pattern().matched(1));
				parser.advance();
				parser.advance();
			} else break;
		}
		return childLines;
	}
	,parse: function(parser) {
		var childLines = this.parseChildLines(parser);
		childLines.push("");
		var escaped = StringTools.htmlEscape(childLines.join("\n"));
		return new markdown.ElementNode("pre",[markdown.ElementNode.text("code",escaped)]);
	}
	,__class__: markdown.CodeBlockSyntax
});
markdown.GitHubCodeBlockSyntax = function() {
	markdown.BlockSyntax.call(this);
};
markdown.GitHubCodeBlockSyntax.__name__ = true;
markdown.GitHubCodeBlockSyntax.__super__ = markdown.BlockSyntax;
markdown.GitHubCodeBlockSyntax.prototype = $extend(markdown.BlockSyntax.prototype,{
	get_pattern: function() {
		return markdown.BlockSyntax.RE_CODE;
	}
	,parseChildLines: function(parser) {
		var childLines = [];
		parser.advance();
		while(!(parser.pos >= parser.lines.length)) if(!this.get_pattern().match(parser.lines[parser.pos])) {
			childLines.push(parser.lines[parser.pos]);
			parser.advance();
		} else {
			parser.advance();
			break;
		}
		return childLines;
	}
	,parse: function(parser) {
		var syntax = this.get_pattern().matched(1);
		var childLines = this.parseChildLines(parser);
		var code = markdown.ElementNode.text("code",StringTools.htmlEscape(childLines.join("\n")));
		if(syntax != null && syntax.length > 0) code.attributes.set("class","prettyprint " + syntax);
		return new markdown.ElementNode("pre",[code]);
	}
	,__class__: markdown.GitHubCodeBlockSyntax
});
markdown.HorizontalRuleSyntax = function() {
	markdown.BlockSyntax.call(this);
};
markdown.HorizontalRuleSyntax.__name__ = true;
markdown.HorizontalRuleSyntax.__super__ = markdown.BlockSyntax;
markdown.HorizontalRuleSyntax.prototype = $extend(markdown.BlockSyntax.prototype,{
	get_pattern: function() {
		return markdown.BlockSyntax.RE_HR;
	}
	,parse: function(parser) {
		parser.advance();
		return markdown.ElementNode.empty("hr");
	}
	,__class__: markdown.HorizontalRuleSyntax
});
markdown.BlockHtmlSyntax = function() {
	markdown.BlockSyntax.call(this);
};
markdown.BlockHtmlSyntax.__name__ = true;
markdown.BlockHtmlSyntax.__super__ = markdown.BlockSyntax;
markdown.BlockHtmlSyntax.prototype = $extend(markdown.BlockSyntax.prototype,{
	get_pattern: function() {
		return markdown.BlockSyntax.RE_HTML;
	}
	,get_canEndBlock: function() {
		return false;
	}
	,parse: function(parser) {
		var childLines = [];
		while(!(parser.pos >= parser.lines.length) && !parser.matches(markdown.BlockSyntax.RE_EMPTY)) {
			childLines.push(parser.lines[parser.pos]);
			parser.advance();
		}
		return new markdown.TextNode(childLines.join("\n"));
	}
	,__class__: markdown.BlockHtmlSyntax
});
markdown.ListItem = function(lines) {
	this.forceBlock = false;
	this.lines = lines;
};
markdown.ListItem.__name__ = true;
markdown.ListItem.prototype = {
	__class__: markdown.ListItem
};
markdown.ParagraphSyntax = function() {
	markdown.BlockSyntax.call(this);
};
markdown.ParagraphSyntax.__name__ = true;
markdown.ParagraphSyntax.__super__ = markdown.BlockSyntax;
markdown.ParagraphSyntax.prototype = $extend(markdown.BlockSyntax.prototype,{
	get_canEndBlock: function() {
		return false;
	}
	,canParse: function(parser) {
		return true;
	}
	,parse: function(parser) {
		var childLines = [];
		while(!markdown.BlockSyntax.isAtBlockEnd(parser)) {
			childLines.push(StringTools.ltrim(parser.lines[parser.pos]));
			parser.advance();
		}
		var contents = parser.document.parseInline(childLines.join("\n"));
		return new markdown.ElementNode("p",contents);
	}
	,__class__: markdown.ParagraphSyntax
});
markdown.ListSyntax = function(listTag) {
	markdown.BlockSyntax.call(this);
	this.listTag = listTag;
};
markdown.ListSyntax.__name__ = true;
markdown.ListSyntax.__super__ = markdown.BlockSyntax;
markdown.ListSyntax.prototype = $extend(markdown.BlockSyntax.prototype,{
	get_canEndBlock: function() {
		return false;
	}
	,parse: function(parser) {
		var items = [];
		var childLines = [];
		var endItem = function() {
			if(childLines.length > 0) {
				items.push(new markdown.ListItem(childLines));
				childLines = [];
			}
		};
		var match;
		var tryMatch = function(pattern) {
			match = pattern;
			return pattern.match(parser.lines[parser.pos]);
		};
		while(!(parser.pos >= parser.lines.length)) {
			if(tryMatch(markdown.BlockSyntax.RE_EMPTY)) childLines.push(""); else if(tryMatch(markdown.BlockSyntax.RE_UL) || tryMatch(markdown.BlockSyntax.RE_OL)) {
				endItem();
				childLines.push(match.matched(1));
			} else if(tryMatch(markdown.BlockSyntax.RE_INDENT)) childLines.push(match.matched(1)); else if(markdown.BlockSyntax.isAtBlockEnd(parser)) break; else {
				if(childLines.length > 0 && childLines[childLines.length - 1] == "") break;
				childLines.push(parser.lines[parser.pos]);
			}
			parser.advance();
		}
		endItem();
		var _g1 = 0;
		var _g = items.length;
		while(_g1 < _g) {
			var i = _g1++;
			var len = items[i].lines.length;
			var _g3 = 1;
			var _g2 = len + 1;
			while(_g3 < _g2) {
				var jj = _g3++;
				var j = len - jj;
				if(markdown.BlockSyntax.RE_EMPTY.match(items[i].lines[j])) {
					if(i < items.length - 1) {
						items[i].forceBlock = true;
						items[i + 1].forceBlock = true;
					}
					items[i].lines.pop();
				} else break;
			}
		}
		var itemNodes = [];
		var _g4 = 0;
		while(_g4 < items.length) {
			var item = items[_g4];
			++_g4;
			var blockItem = item.forceBlock || item.lines.length > 1;
			var blocksInList = [markdown.BlockSyntax.RE_BLOCKQUOTE,markdown.BlockSyntax.RE_HEADER,markdown.BlockSyntax.RE_HR,markdown.BlockSyntax.RE_INDENT,markdown.BlockSyntax.RE_UL,markdown.BlockSyntax.RE_OL];
			if(!blockItem) {
				var _g11 = 0;
				while(_g11 < blocksInList.length) {
					var pattern1 = blocksInList[_g11];
					++_g11;
					if(pattern1.match(item.lines[0])) {
						blockItem = true;
						break;
					}
				}
			}
			if(blockItem) {
				var children = parser.document.parseLines(item.lines);
				if(!item.forceBlock && children.length == 1) {
					if(js.Boot.__instanceof(children[0],markdown.ElementNode)) {
						var node = children[0];
						if(node.tag == "p") children = node.children;
					}
				}
				itemNodes.push(new markdown.ElementNode("li",children));
			} else {
				var contents = parser.document.parseInline(item.lines[0]);
				itemNodes.push(new markdown.ElementNode("li",contents));
			}
		}
		return new markdown.ElementNode(this.listTag,itemNodes);
	}
	,__class__: markdown.ListSyntax
});
markdown.UnorderedListSyntax = function() {
	markdown.ListSyntax.call(this,"ul");
};
markdown.UnorderedListSyntax.__name__ = true;
markdown.UnorderedListSyntax.__super__ = markdown.ListSyntax;
markdown.UnorderedListSyntax.prototype = $extend(markdown.ListSyntax.prototype,{
	get_pattern: function() {
		return markdown.BlockSyntax.RE_UL;
	}
	,__class__: markdown.UnorderedListSyntax
});
markdown.OrderedListSyntax = function() {
	markdown.ListSyntax.call(this,"ol");
};
markdown.OrderedListSyntax.__name__ = true;
markdown.OrderedListSyntax.__super__ = markdown.ListSyntax;
markdown.OrderedListSyntax.prototype = $extend(markdown.ListSyntax.prototype,{
	get_pattern: function() {
		return markdown.BlockSyntax.RE_OL;
	}
	,__class__: markdown.OrderedListSyntax
});
markdown.TableSyntax = function() {
	markdown.BlockSyntax.call(this);
};
markdown.TableSyntax.__name__ = true;
markdown.TableSyntax.__super__ = markdown.BlockSyntax;
markdown.TableSyntax.prototype = $extend(markdown.BlockSyntax.prototype,{
	get_pattern: function() {
		return markdown.TableSyntax.TABLE_PATTERN;
	}
	,get_canEndBlock: function() {
		return false;
	}
	,parse: function(parser) {
		var lines = [];
		while(!(parser.pos >= parser.lines.length) && parser.matches(markdown.TableSyntax.TABLE_PATTERN)) {
			lines.push(parser.lines[parser.pos]);
			parser.advance();
		}
		var heads = [];
		var rows = [];
		var align = [];
		var headLine = lines.shift();
		var alignLine = lines.shift();
		var aligns = [];
		if(alignLine != null) markdown.TableSyntax.CELL_PATTERN.map(alignLine,function(e) {
			var text = e.matched(2);
			var align1;
			if(text.charAt(0) == ":") {
				if(text.charAt(text.length - 1) == ":") align1 = "center"; else align1 = "left";
			} else if(text.charAt(text.length - 1) == ":") align1 = "right"; else align1 = "left";
			aligns.push(align1);
			return "";
		});
		var index = 0;
		markdown.TableSyntax.CELL_PATTERN.map(headLine,function(e1) {
			var text1 = StringTools.trim(e1.matched(2));
			var cell = new markdown.ElementNode("th",parser.document.parseInline(text1));
			if(aligns[index] != "left") cell.attributes.set("align",aligns[index]);
			heads.push(cell);
			index += 1;
			return "";
		});
		var _g = 0;
		while(_g < lines.length) {
			var line = lines[_g];
			++_g;
			var cols = [[]];
			rows.push(new markdown.ElementNode("tr",cols[0]));
			var index1 = [0];
			markdown.TableSyntax.CELL_PATTERN.map(line,(function(index1,cols) {
				return function(e2) {
					var text2 = StringTools.trim(e2.matched(2));
					var cell1 = new markdown.ElementNode("td",parser.document.parseInline(text2));
					if(aligns[index1[0]] != "left") cell1.attributes.set("align",aligns[index1[0]]);
					cols[0].push(cell1);
					index1[0] += 1;
					return "";
				};
			})(index1,cols));
		}
		return new markdown.ElementNode("table",[new markdown.ElementNode("thead",heads),new markdown.ElementNode("tbody",rows)]);
	}
	,__class__: markdown.TableSyntax
});
markdown.HtmlRenderer = function() {
};
markdown.HtmlRenderer.__name__ = true;
markdown.HtmlRenderer.__interfaces__ = [markdown.NodeVisitor];
markdown.HtmlRenderer.sortAttributes = function(a,b) {
	var ia = HxOverrides.indexOf(markdown.HtmlRenderer.attributeOrder,a,0);
	var ib = HxOverrides.indexOf(markdown.HtmlRenderer.attributeOrder,a,0);
	if(ia > -1 && ib > -1) return ia - ib;
	return Reflect.compare(a,b);
};
markdown.HtmlRenderer.prototype = {
	render: function(nodes) {
		this.buffer = new StringBuf();
		var _g = 0;
		while(_g < nodes.length) {
			var node = nodes[_g];
			++_g;
			node.accept(this);
		}
		return this.buffer.b;
	}
	,visitText: function(text) {
		if(text.text == null) this.buffer.b += "null"; else this.buffer.b += "" + text.text;
	}
	,visitElementBefore: function(element) {
		if(this.buffer.b != "" && markdown.HtmlRenderer.BLOCK_TAGS.match(element.tag)) this.buffer.b += "\n";
		this.buffer.b += Std.string("<" + element.tag);
		var attributeNames;
		var _g = [];
		var $it0 = element.attributes.keys();
		while( $it0.hasNext() ) {
			var k = $it0.next();
			_g.push(k);
		}
		attributeNames = _g;
		attributeNames.sort(markdown.HtmlRenderer.sortAttributes);
		var _g1 = 0;
		while(_g1 < attributeNames.length) {
			var name = attributeNames[_g1];
			++_g1;
			this.buffer.add(" " + name + "=\"" + element.attributes.get(name) + "\"");
		}
		if(element.children == null) {
			this.buffer.b += " />";
			return false;
		} else {
			this.buffer.b += ">";
			return true;
		}
	}
	,visitElementAfter: function(element) {
		this.buffer.b += Std.string("</" + element.tag + ">");
	}
	,__class__: markdown.HtmlRenderer
};
markdown.InlineSyntax = function(pattern) {
	this.pattern = new EReg(pattern,"m");
};
markdown.InlineSyntax.__name__ = true;
markdown.InlineSyntax.prototype = {
	tryMatch: function(parser) {
		if(this.pattern.match(parser.get_currentSource()) && this.pattern.matchedPos().pos == 0) {
			parser.writeText();
			if(this.onMatch(parser)) parser.consume(this.pattern.matched(0).length);
			return true;
		}
		return false;
	}
	,onMatch: function(parser) {
		return false;
	}
	,__class__: markdown.InlineSyntax
};
markdown.AutolinkSyntaxWithoutBrackets = function() {
	markdown.InlineSyntax.call(this,"\\b((http|https|ftp)://[^\\s]*)\\b");
};
markdown.AutolinkSyntaxWithoutBrackets.__name__ = true;
markdown.AutolinkSyntaxWithoutBrackets.__super__ = markdown.InlineSyntax;
markdown.AutolinkSyntaxWithoutBrackets.prototype = $extend(markdown.InlineSyntax.prototype,{
	tryMatch: function(parser) {
		return markdown.InlineSyntax.prototype.tryMatch.call(this,parser);
	}
	,onMatch: function(parser) {
		var url = this.pattern.matched(1);
		var anchor = markdown.ElementNode.text("a",StringTools.htmlEscape(url));
		anchor.attributes.set("href",url);
		parser.addNode(anchor);
		return true;
	}
	,__class__: markdown.AutolinkSyntaxWithoutBrackets
});
markdown.TextSyntax = function(pattern,substitute) {
	markdown.InlineSyntax.call(this,pattern);
	this.substitute = substitute;
};
markdown.TextSyntax.__name__ = true;
markdown.TextSyntax.__super__ = markdown.InlineSyntax;
markdown.TextSyntax.prototype = $extend(markdown.InlineSyntax.prototype,{
	onMatch: function(parser) {
		if(this.substitute == null) {
			parser.advanceBy(this.pattern.matched(0).length);
			return false;
		}
		parser.addNode(parser.createText(this.substitute));
		return true;
	}
	,__class__: markdown.TextSyntax
});
markdown.AutolinkSyntax = function() {
	markdown.InlineSyntax.call(this,"<((http|https|ftp)://[^>]*)>");
};
markdown.AutolinkSyntax.__name__ = true;
markdown.AutolinkSyntax.__super__ = markdown.InlineSyntax;
markdown.AutolinkSyntax.prototype = $extend(markdown.InlineSyntax.prototype,{
	onMatch: function(parser) {
		var url = this.pattern.matched(1);
		var anchor = markdown.ElementNode.text("a",StringTools.htmlEscape(url));
		anchor.attributes.set("href",url);
		parser.addNode(anchor);
		return true;
	}
	,__class__: markdown.AutolinkSyntax
});
markdown.TagSyntax = function(pattern,tag,end) {
	markdown.InlineSyntax.call(this,pattern);
	this.tag = tag;
	this.endPattern = new EReg(end == null?pattern:end,"m");
};
markdown.TagSyntax.__name__ = true;
markdown.TagSyntax.__super__ = markdown.InlineSyntax;
markdown.TagSyntax.prototype = $extend(markdown.InlineSyntax.prototype,{
	onMatch: function(parser) {
		parser.stack.push(new markdown.TagState(parser.pos,parser.pos + this.pattern.matched(0).length,this));
		return true;
	}
	,onMatchEnd: function(parser,state) {
		parser.addNode(new markdown.ElementNode(this.tag,state.children));
		return true;
	}
	,__class__: markdown.TagSyntax
});
markdown.LinkSyntax = function(linkResolver) {
	markdown.TagSyntax.call(this,"\\[",null,markdown.LinkSyntax.linkPattern);
	this.linkResolver = linkResolver;
};
markdown.LinkSyntax.__name__ = true;
markdown.LinkSyntax.__super__ = markdown.TagSyntax;
markdown.LinkSyntax.prototype = $extend(markdown.TagSyntax.prototype,{
	onMatchEnd: function(parser,state) {
		var url;
		var title;
		if(this.endPattern.matched(1) == null || this.endPattern.matched(1) == "") {
			if(this.linkResolver == null) return false;
			if(state.children.length != 1) return false;
			if(!js.Boot.__instanceof(state.children[0],markdown.TextNode)) return false;
			var link = state.children[0];
			var node = this.linkResolver(link.text);
			if(node == null) return false;
			parser.addNode(node);
			return true;
		}
		if(this.endPattern.matched(3) != null && this.endPattern.matched(3) != "") {
			url = this.endPattern.matched(3);
			title = this.endPattern.matched(4);
			if(StringTools.startsWith(url,"<") && StringTools.endsWith(url,">")) url = url.substring(1,url.length - 1);
		} else {
			var id = this.endPattern.matched(2);
			if(id == "") id = parser.source.substring(state.startPos + 1,parser.pos);
			id = id.toLowerCase();
			var link1 = parser.document.refLinks.get(id);
			if(link1 == null) return false;
			url = link1.url;
			title = link1.title;
		}
		var anchor = new markdown.ElementNode("a",state.children);
		var value = StringTools.htmlEscape(url);
		anchor.attributes.set("href",value);
		if(title != null && title != "") {
			var value1 = StringTools.htmlEscape(title);
			anchor.attributes.set("title",value1);
		}
		parser.addNode(anchor);
		return true;
	}
	,__class__: markdown.LinkSyntax
});
markdown.ImgSyntax = function(linkResolver) {
	markdown.TagSyntax.call(this,"!\\[",null,markdown.ImgSyntax.linkPattern);
	this.linkResolver = linkResolver;
};
markdown.ImgSyntax.__name__ = true;
markdown.ImgSyntax.__super__ = markdown.TagSyntax;
markdown.ImgSyntax.prototype = $extend(markdown.TagSyntax.prototype,{
	onMatchEnd: function(parser,state) {
		var url;
		var title;
		if(this.endPattern.matched(1) == null || this.endPattern.matched(1) == "") {
			if(this.linkResolver == null) return false;
			if(state.children.length != 1) return false;
			if(!js.Boot.__instanceof(state.children[0],markdown.TextNode)) return false;
			var link = state.children[0];
			var node = this.linkResolver(link.text);
			if(node == null) return false;
			parser.addNode(node);
			return true;
		}
		if(this.endPattern.matched(3) != null && this.endPattern.matched(3) != "") {
			url = this.endPattern.matched(3);
			title = this.endPattern.matched(4);
			if(StringTools.startsWith(url,"<") && StringTools.endsWith(url,">")) url = url.substring(1,url.length - 1);
		} else {
			var id = this.endPattern.matched(2);
			if(id == "") id = parser.source.substring(state.startPos + 1,parser.pos);
			id = id.toLowerCase();
			var link1 = parser.document.refLinks.get(id);
			if(link1 == null) return false;
			url = link1.url;
			title = link1.title;
		}
		var img = new markdown.ElementNode("img",null);
		var value = StringTools.htmlEscape(url);
		img.attributes.set("src",value);
		if(state.children.length == 1 && js.Boot.__instanceof(state.children[0],markdown.TextNode)) {
			var alt = state.children[0];
			img.attributes.set("alt",alt.text);
		}
		if(title != null && title != "") {
			var value1 = StringTools.htmlEscape(title);
			img.attributes.set("title",value1);
		}
		parser.addNode(img);
		return true;
	}
	,__class__: markdown.ImgSyntax
});
markdown.CodeSyntax = function(pattern) {
	markdown.InlineSyntax.call(this,pattern);
};
markdown.CodeSyntax.__name__ = true;
markdown.CodeSyntax.__super__ = markdown.InlineSyntax;
markdown.CodeSyntax.prototype = $extend(markdown.InlineSyntax.prototype,{
	onMatch: function(parser) {
		parser.addNode(markdown.ElementNode.text("code",StringTools.htmlEscape(this.pattern.matched(1))));
		return true;
	}
	,__class__: markdown.CodeSyntax
});
markdown.InlineParser = function(source,document) {
	this.start = 0;
	this.pos = 0;
	this.source = source;
	this.document = document;
	this.stack = [];
	if(document.inlineSyntaxes != null) {
		this.syntaxes = [];
		var _g = 0;
		var _g1 = document.inlineSyntaxes;
		while(_g < _g1.length) {
			var syntax = _g1[_g];
			++_g;
			this.syntaxes.push(syntax);
		}
		var _g2 = 0;
		var _g11 = markdown.InlineParser.defaultSyntaxes;
		while(_g2 < _g11.length) {
			var syntax1 = _g11[_g2];
			++_g2;
			this.syntaxes.push(syntax1);
		}
	} else this.syntaxes = markdown.InlineParser.defaultSyntaxes;
	var x = new markdown.LinkSyntax(document.linkResolver);
	this.syntaxes.splice(1,0,x);
};
markdown.InlineParser.__name__ = true;
markdown.InlineParser.prototype = {
	parse: function() {
		this.stack.push(new markdown.TagState(0,0,null));
		while(!this.get_isDone()) {
			var matched = false;
			var _g1 = 1;
			var _g = this.stack.length;
			while(_g1 < _g) {
				var i = _g1++;
				if(this.stack[this.stack.length - i].tryMatch(this)) {
					matched = true;
					break;
				}
			}
			if(matched) continue;
			var _g2 = 0;
			var _g11 = this.syntaxes;
			while(_g2 < _g11.length) {
				var syntax = _g11[_g2];
				++_g2;
				if(syntax.tryMatch(this)) {
					matched = true;
					break;
				}
			}
			if(matched) continue;
			this.advanceBy(1);
		}
		return this.stack[0].close(this);
	}
	,writeText: function() {
		this.writeTextRange(this.start,this.pos);
		this.start = this.pos;
	}
	,writeTextRange: function(start,end) {
		if(end > start) {
			var text = this.source.substring(start,end);
			var nodes = this.stack[this.stack.length - 1].children;
			if(nodes.length > 0 && js.Boot.__instanceof(nodes[nodes.length - 1],markdown.TextNode)) {
				var lastNode = nodes[nodes.length - 1];
				var newNode = this.createText("" + lastNode.text + text);
				nodes[nodes.length - 1] = newNode;
			} else nodes.push(this.createText(text));
		}
	}
	,createText: function(text) {
		return new markdown.TextNode(this.unescape(text));
	}
	,addNode: function(node) {
		this.stack[this.stack.length - 1].children.push(node);
	}
	,get_currentSource: function() {
		return this.source.substring(this.pos,this.source.length);
	}
	,get_isDone: function() {
		return this.pos == this.source.length;
	}
	,advanceBy: function(length) {
		this.pos += length;
	}
	,consume: function(length) {
		this.pos += length;
		this.start = this.pos;
	}
	,unescape: function(text) {
		text = new EReg("\\\\([\\\\`*_{}[\\]()#+-.!])","g").replace(text,"$1");
		text = StringTools.replace(text,"\t","    ");
		return text;
	}
	,__class__: markdown.InlineParser
};
markdown.TagState = function(startPos,endPos,syntax) {
	this.startPos = startPos;
	this.endPos = endPos;
	this.syntax = syntax;
	this.children = [];
};
markdown.TagState.__name__ = true;
markdown.TagState.prototype = {
	tryMatch: function(parser) {
		if(this.syntax.endPattern.match(parser.get_currentSource()) && this.syntax.endPattern.matchedPos().pos == 0) {
			this.close(parser);
			return true;
		}
		return false;
	}
	,close: function(parser) {
		var index = HxOverrides.indexOf(parser.stack,this,0);
		var unmatchedTags = parser.stack.splice(index + 1,parser.stack.length - index);
		var _g = 0;
		while(_g < unmatchedTags.length) {
			var unmatched = unmatchedTags[_g];
			++_g;
			parser.writeTextRange(unmatched.startPos,unmatched.endPos);
			var _g1 = 0;
			var _g2 = unmatched.children;
			while(_g1 < _g2.length) {
				var child = _g2[_g1];
				++_g1;
				this.children.push(child);
			}
		}
		parser.writeText();
		parser.stack.pop();
		if(parser.stack.length == 0) return this.children;
		if(this.syntax.onMatchEnd(parser,this)) parser.consume(this.syntax.endPattern.matched(0).length); else {
			parser.start = this.startPos;
			parser.advanceBy(this.syntax.endPattern.matched(0).length);
		}
		return null;
	}
	,__class__: markdown.TagState
};
function $iterator(o) { if( o instanceof Array ) return function() { return HxOverrides.iter(o); }; return typeof(o.iterator) == 'function' ? $bind(o,o.iterator) : o.iterator; }
var $_, $fid = 0;
function $bind(o,m) { if( m == null ) return null; if( m.__id__ == null ) m.__id__ = $fid++; var f; if( o.hx__closures__ == null ) o.hx__closures__ = {}; else f = o.hx__closures__[m.__id__]; if( f == null ) { f = function(){ return f.method.apply(f.scope, arguments); }; f.scope = o; f.method = m; o.hx__closures__[m.__id__] = f; } return f; }
if(Array.prototype.indexOf) HxOverrides.indexOf = function(a,o,i) {
	return Array.prototype.indexOf.call(a,o,i);
};
String.prototype.__class__ = String;
String.__name__ = true;
Array.__name__ = true;
var Int = { __name__ : ["Int"]};
var Dynamic = { __name__ : ["Dynamic"]};
var Float = Number;
Float.__name__ = ["Float"];
var Bool = Boolean;
Bool.__ename__ = ["Bool"];
var Class = { __name__ : ["Class"]};
var Enum = { };
haxe.Resource.content = [{ name : "ArticlesTemplate", data : "PHVsPg0KOjpmb3JlYWNoIGFydGljbGVzOjoNCiAgPGxpPjxhIGhyZWY9IiMvY29udGVudHMvOjpfX2N1cnJlbnRfXy5wYXRoOjoiPjo6X19jdXJyZW50X18udGl0bGU6OjwvYT48YnIvPjxzcGFuIGNsYXNzPSJ0aW1lc3RhbXAiPjo6X19jdXJyZW50X18udGltZXN0YW1wOjo8L3NwYW4+PC9saT4NCjo6ZW5kOjoNCjwvdWw+"},{ name : "UserTemplate", data : "PGltZyBzcmM9Ijo6dXNlci5hdmF0YXI6OiIvPg0KPHA+SGVsbG8hIE15IG5hbWUgaXMgPHNwYW4+Ojp1c2VyLm5hbWU6Ojwvc3Bhbj4gKDxzcGFuPjo6dXNlci5sb2dpbjo6PC9zcGFuPiksIGFuZCBJIGhhaWwgZnJvbSA8c3Bhbj46OnVzZXIubG9jYXRpb246Ojwvc3Bhbj4uIEkgaGF2ZSBjb250cmlidXRlZCB0byA8c3Bhbj46OnVzZXIucmVwb3M6Ojwvc3Bhbj4gcmVwb3NpdG9yaWVzIHNvIGZhciwgd2l0aCBtb3JlIHRvIGNvbWUhPC9wPg0KPHA+SW4gc2hvcnQsIEkgYW0gYSBnZW5lcmFsaXN0IHdobyBlbmpveXMgbWFraW5nIHRoaW5ncyB3aXRoIEhheGUuPC9wPg0KPHA+Q29udGFjdCBtZSBhdCA8c3Bhbj46OnVzZXIuZW1haWw6Ojwvc3Bhbj4sIG9yIHZpc2l0IG15IDxhIGhyZWY9Ijo6dXNlci51cmw6OiI+R2l0SHViIHBhZ2U8L2E+LjwvcD4"},{ name : "ArticleTemplate", data : "PGRpdiBjbGFzcz0idGltZXN0YW1wIj5Xcml0dGVuIG9uIDo6YXJ0aWNsZS50aW1lc3RhbXA6OjwvZGl2Pg0KOjphcnRpY2xlLmJvZHk6Og"}];
haxe.Template.splitter = new EReg("(::[A-Za-z0-9_ ()&|!+=/><*.\"-]+::|\\$\\$([A-Za-z0-9_-]+)\\()","");
haxe.Template.expr_splitter = new EReg("(\\(|\\)|[ \r\n\t]*\"[^\"]*\"[ \r\n\t]*|[!+=/><*.&|-]+)","");
haxe.Template.expr_trim = new EReg("^[ ]*([^ ]+)[ ]*$","");
haxe.Template.expr_int = new EReg("^[0-9]+$","");
haxe.Template.expr_float = new EReg("^([+-]?)(?=\\d|,\\d)\\d*(,\\d*)?([Ee]([+-]?\\d+))?$","");
haxe.Template.globals = { };
haxe.crypto.Base64.CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
haxe.crypto.Base64.BYTES = haxe.io.Bytes.ofString(haxe.crypto.Base64.CHARS);
markdown.BlockSyntax.RE_EMPTY = new EReg("^([ \\t]*)$","");
markdown.BlockSyntax.RE_SETEXT = new EReg("^((=+)|(-+))$","");
markdown.BlockSyntax.RE_HEADER = new EReg("^(#{1,6})(.*?)#*$","");
markdown.BlockSyntax.RE_BLOCKQUOTE = new EReg("^[ ]{0,3}>[ ]?(.*)$","");
markdown.BlockSyntax.RE_INDENT = new EReg("^(?:    |\t)(.*)$","");
markdown.BlockSyntax.RE_CODE = new EReg("^```(\\w*)\\s*$","");
markdown.BlockSyntax.RE_HR = new EReg("^[ ]{0,3}((-+[ ]{0,2}){3,}|(_+[ ]{0,2}){3,}|(\\*+[ ]{0,2}){3,})$","");
markdown.BlockSyntax.RE_HTML = new EReg("^<[ ]*\\w+[ >]","");
markdown.BlockSyntax.RE_UL = new EReg("^[ ]{0,3}[*+-][ \\t]+(.*)$","");
markdown.BlockSyntax.RE_OL = new EReg("^[ ]{0,3}\\d+\\.[ \\t]+(.*)$","");
markdown.TableSyntax.TABLE_PATTERN = new EReg("^(.+? +:?\\|:? +)+(.+)$","");
markdown.TableSyntax.CELL_PATTERN = new EReg("(\\|)?([^\\|]+)(\\|)?","g");
markdown.HtmlRenderer.BLOCK_TAGS = new EReg("blockquote|h1|h2|h3|h4|h5|h6|hr|p|pre","");
markdown.HtmlRenderer.attributeOrder = ["src","alt"];
markdown.LinkSyntax.linkPattern = "\\](?:(" + "\\s?\\[([^\\]]*)\\]" + "|" + "\\s?\\(([^ )]+)(?:[ ]*\"([^\"]+)\"|)\\)" + ")|)";
markdown.ImgSyntax.linkPattern = "\\](?:(" + "\\s?\\[([^\\]]*)\\]" + "|" + "\\s?\\(([^ )]+)(?:[ ]*\"([^\"]+)\"|)\\)" + ")|)";
markdown.InlineParser.defaultSyntaxes = [new markdown.AutolinkSyntaxWithoutBrackets(),new markdown.TextSyntax(" {2,}\n","<br />\n"),new markdown.TextSyntax("\\s*[A-Za-z0-9]+"),new markdown.AutolinkSyntax(),new markdown.LinkSyntax(),new markdown.ImgSyntax(),new markdown.TextSyntax(" \\* "),new markdown.TextSyntax(" _ "),new markdown.TextSyntax("&[#a-zA-Z0-9]*;"),new markdown.TextSyntax("&","&amp;"),new markdown.TextSyntax("</?\\w+.*?>"),new markdown.TextSyntax("<","&lt;"),new markdown.TagSyntax("\\*\\*","strong"),new markdown.TagSyntax("__","strong"),new markdown.TagSyntax("\\*","em"),new markdown.TagSyntax("\\b_","em","_\\b"),new markdown.CodeSyntax("``\\s?((?:.|\\n)*?)\\s?``"),new markdown.CodeSyntax("`([^`]*)`")];
gitblog.GitBlog.main();
})();
