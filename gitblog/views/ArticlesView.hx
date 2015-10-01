package gitblog.views;

import frank.View;

import gitblog.models.ArticlesModel;

class ArticlesView extends View
{
  public function new()
  {
    super('articles', 'ArticlesTemplate');
  }

  override public function update(articles : Array<ArticlesModel>) : Void
  {
    for (article in articles)
    {
      var date : String = article.timestamp.substr(0, 10);
      var time : String = article.timestamp.substr(11, 5).split('-').join(':');
      article.timestamp = date + ' @ ' + time;
      article.title = article.title.substring(17, article.title.length - 3).split('-').join(' ');
    }

    super.update({ articles : articles });
  }
}