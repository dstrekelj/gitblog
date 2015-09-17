package gitblog;

/**
 * ...
 * @author Domagoj Štrekelj
 */
class GitBlog
{
  public static var userView : gitblog.View;
  public static var repositoriesView : gitblog.View;

  public static function main()
  {
    new GitBlog();
  }
  
  public function new()
  {
    userView = new gitblog.View('user', 'UserView');
    repositoriesView = new gitblog.View('repositories', 'RepositoriesView');

    new gitblog.Controller();
  }
}