package gitblog;

class GitBlog
{
  public static function main()
  {
    new GitBlog();
  }
  
  public function new()
  {
    new frank.App()
        .route({
          path : ~/^\/$/,
          controller : new gitblog.controllers.HomeController()
        })
        .route({
          path : ~/^\/contents\/(.*)$/,
          controller : new gitblog.controllers.ContentsController()
        });
  }
}