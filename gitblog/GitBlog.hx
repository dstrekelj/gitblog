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

    new gitblog.frank.App()
      .route('/hello', new HelloController())
      .route('/goodbye', new GoodbyeController());
  }
  
  public function new()
  {
    userView = new gitblog.View('user', 'UserView');
    repositoriesView = new gitblog.View('repositories', 'RepositoriesView');

    new gitblog.Controller();
  }
}

class HelloController implements gitblog.frank.Controller
{
  public var route : String;

  public function new() {};

  public function onEnter() : Void
  {
    trace('entering ${route}');
  }

  public function onExit() : Void
  {
    trace('leaving ${route}');
  }
}

class GoodbyeController implements gitblog.frank.Controller
{
  public var route : String;

  public function new() {};

  public function onEnter() : Void
  {
    trace('entering ${route}');
  }

  public function onExit() : Void
  {
    trace('leaving ${route}');
  }
}