package gitblog.controllers;

import frank.Controller;

import gitblog.Connection;
import gitblog.models.ArticleModel;
import gitblog.views.ArticleView;

class ContentsController implements Controller
{
  var content : Connection;
  var articleView : ArticleView;

  public function new()
  {
    content = new Connection('https://api.github.com/repos/dstrekelj/dstrekelj.github.io');
    articleView = new ArticleView();
  }

  public function enter(hash : String) : Void
  {
    content.parameters(hash)
      .onSuccess(function(response : String) {
        var articleData = haxe.Json.parse(response);

        var articleModel = new ArticleModel({
          body : articleData.content,
          timestamp : articleData.name
        });

        articleView.update(articleModel);
      })
      .onFailure(function(response : String) {
        trace('FAILURE: ${response}');
      })
      .get();
  }
}