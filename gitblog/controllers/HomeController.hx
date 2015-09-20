package gitblog.controllers;

class HomeController implements frank.Controller
{
  var userView : frank.View;
  var repositoriesView : frank.View;

  public function new()
  {
    userView = new frank.View('user', 'UserTemplate');
    repositoriesView = new frank.View('repositories', 'RepositoriesTemplate');

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
        userView.update({ user : userModel });
      })
      .onFailure(function(Message : String) { trace(Message); })
      .onChange(function(Status : Int) { trace(Status); })
      .get();

    GitBlog.api.repos
      .onSuccess(function(Data : String) {
        var repos : gitblog.Responses.ReposResponse = haxe.Json.parse(Data);
        // dce disabled because it messes with object array
        repositoriesView.update({ repositories : repos });
      })
      .onFailure(function(Message : String) { trace(Message); })
      .onChange(function(Status : Int) { trace(Status); })
      .get();
  }

  public function onEnter(hash : String) : Void { trace(hash); }

  public function onExit(hash : String) : Void {}
}