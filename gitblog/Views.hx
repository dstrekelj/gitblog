package gitblog;

class Views
{
  public static var userView : frank.View;
  public static var repositoriesView : frank.View;
  public static var articlesView : frank.View;
  public static var contentView : frank.View;

  public static function init() : Void
  {
    userView = new frank.View('user', 'UserTemplate');
    repositoriesView = new frank.View('repositories', 'RepositoriesTemplate');
    articlesView = new frank.View('articles', 'ArticlesTemplate');
    contentView = new frank.View('content', 'ContentTemplate');
  }
}