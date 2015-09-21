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
        gitblog.Views.contentView.update({
          title : data.name
          ,body : js.Browser.window.atob(data.content)
        });
      })
      .onFailure(function(response : String) {
        trace('FAILURE: ${response}');
      })
      .get();
  }

  public function onExit(hash : String) : Void {}
}