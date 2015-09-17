package gitblog;

import gitblog.Responses.ContentsResponse;
import gitblog.Responses.ReposResponse;
import gitblog.Responses.UserResponse;

@:keep
class Controller
{
  public function new()
  {
    var API : GitHubAPI = new GitHubAPI('dstrekelj');

    API.user
      .onSuccess(function(Data : String) {
        var user : UserResponse = haxe.Json.parse(Data);
        gitblog.GitBlog.userView.update({user : user});
      })
      .onFailure(function(Message : String) { trace(Message); })
      .onChange(function(Status : Int) { trace(Status); })
      .get();
    
    API.repos
      .onSuccess(function(Data : String) {
        var repos : ReposResponse = haxe.Json.parse(Data);
        // dce disabled because it messes with object array
        gitblog.GitBlog.repositoriesView.update({ repositories : repos });
        /*
        for (repo in repos)
        {
          trace(repo.name);
        }
        */
      })
      .onFailure(function(Message : String) { trace(Message); })
      .onChange(function(Status : Int) { trace(Status); })
      .get();
    
    API.contents
      .onSuccess(function(Data : String) {
        var contents : ContentsResponse = haxe.Json.parse(Data);
        for (content in contents)
        {
          trace(content.name);
        }
      })
      .onFailure(function(Message : String) { trace(Message); })
      .onChange(function(Status : Int) { trace(Status); })
      .get();
  }
}