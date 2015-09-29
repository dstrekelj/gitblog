package gitblog.views;

import frank.View;

import gitblog.models.ArticleModel;

class ArticleView extends View
{
  public function new() : Void
  {
    super('article', 'ArticleTemplate');
  }

  override public function update(article : ArticleModel) : Void
  {
    var date : String = article.timestamp.substr(0, 10);
    var time : String = article.timestamp.substr(11, 5).split('-').join(':');
    article.timestamp = date + ' @ ' + time;
    article.body = Markdown.markdownToHtml(js.Browser.window.atob(article.body));
    
    super.update({ article : article });
  }
}