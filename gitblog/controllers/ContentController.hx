package github.controllers;

class ContentController implements frank.Controller
{
  public function new()
  {
    GitBlog.api.contents
      .onSuccess(function(Data : String) {
        var contents : gitblog.Responses.ContentsResponse = haxe.Json.parse(Data);
        for (content in contents)
        {
          trace(content.name);
        }
      })
      .onFailure(function(Message : String) { trace(Message); })
      .onChange(function(Status : Int) { trace(Status); })
      .get();
  }

  public function onEnter(hash : String) : Void {}

  public function onExit(hash : String) : Void {}
}