package gitblog;

class GitBlog
{
  public static var api : gitblog.GitHubAPI;

  public static function main()
  {
    api = new gitblog.GitHubAPI('dstrekelj');

    new GitBlog();
  }
  
  public function new()
  {
    new frank.App()
        .route(~/^\/$/, new gitblog.controllers.HomeController())
        .route(~/^\/about\/$/, new gitblog.controllers.AboutController());
  }
}