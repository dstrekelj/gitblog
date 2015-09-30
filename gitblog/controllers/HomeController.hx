package gitblog.controllers;

import frank.Controller;

import gitblog.Connection;
import gitblog.Responses;
import gitblog.models.ArticlesModel;
import gitblog.models.UserModel;
import gitblog.views.ArticlesView;
import gitblog.views.UserView;

/**
 * Populates homepage / index view.
 */
class HomeController implements Controller
{
  public function new()
  {
    var userApi = new Connection('https://api.github.com/users/dstrekelj');
    var userView = new UserView();
    
    userApi
      .onSuccess(function(Data : String) {
        var userData : Responses.UserResponse = haxe.Json.parse(Data);
        
        var userModel = new UserModel({
          avatar : userData.avatar_url,
          name : userData.name,
          email : userData.email,
          login : userData.login,
          location : userData.location,
          repos : userData.public_repos,
          url : userData.url
        });
        
        userView.update(userModel);
      })
      .onFailure(function(Message : String) { trace(Message); })
      .onChange(function(Status : Int) { trace(Status); })
      .get();

    var articlesApi = new Connection('https://api.github.com/repos/dstrekelj/dstrekelj.github.io/contents/content');
    var articlesView = new ArticlesView();
    
    articlesApi
      .onSuccess(function(Data : String) {
        var articlesData : Responses.ContentsResponse = haxe.Json.parse(Data);
        var articlesModels = new Array<ArticlesModel>();
        
        for (article in articlesData)
        {
          articlesModels.push(new ArticlesModel({
            timestamp : article.name,
            title : article.name,
            path : article.path
          }));
        }

        articlesView.update(articlesModels);
      })
      .onFailure(function(Message : String) { trace(Message); })
      .onChange(function(Status : Int) { trace(Status); })
      .get();
  }

  public function enter(hash : String) : Void {}
}