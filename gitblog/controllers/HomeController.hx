package gitblog.controllers;

class HomeController implements frank.Controller
{
  public function new()
  {
    GitBlog.api.user
      .onSuccess(function(Data : String) {
        var user : gitblog.Responses.UserResponse = haxe.Json.parse(Data);
        var userModel = new gitblog.models.UserModel({
          name : user.name
          ,email : user.email
          ,login : user.login
          ,location : user.location
          ,url : user.url
        });
        gitblog.Views.userView.update({ user : userModel });
      })
      .onFailure(function(Message : String) { trace(Message); })
      .onChange(function(Status : Int) { trace(Status); })
      .get();

    GitBlog.api.repos
      .onSuccess(function(Data : String) {
        var repos : gitblog.Responses.ReposResponse = haxe.Json.parse(Data);
        // dce disabled because it messes with object array
        gitblog.Views.repositoriesView.update({ repositories : repos });
      })
      .onFailure(function(Message : String) { trace(Message); })
      .onChange(function(Status : Int) { trace(Status); })
      .get();

    GitBlog.api.contents
      .onSuccess(function(Data : String) {
        var contents : gitblog.Responses.ContentsResponse = haxe.Json.parse(Data);
        gitblog.Views.articlesView.update({ articles : contents });
      })
      .onFailure(function(Message : String) { trace(Message); })
      .onChange(function(Status : Int) { trace(Status); })
      .get();
  }

  public function onEnter(hash : String) : Void { trace(hash); }

  public function onExit(hash : String) : Void {}
}