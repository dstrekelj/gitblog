package gitblog.controllers;

class ContentsController implements frank.Controller
{
  var content : gitblog.Connection;

  public function new()
  {
    content = new Connection('https://api.github.com/repos/dstrekelj/gitblog-content');
  }

  public function onEnter(hash : String) : Void
  {
    content.parameters(hash)
      .onSuccess(function(response : String) {
        var data = haxe.Json.parse(response);
        var timestamp : String = data.name.substr(0, 16);
        var date : String = timestamp.substr(0, 10);
        var time : String = timestamp.substr(11).split('-').join(':');
        gitblog.Views.contentView.update({
          timestamp : [date, time].join(' @ ')
          ,body : Markdown.markdownToHtml(js.Browser.window.atob(data.content))
        });
      })
      .onFailure(function(response : String) {
        trace('FAILURE: ${response}');
      })
      .get();
  }

  public function onExit(hash : String) : Void {}
}