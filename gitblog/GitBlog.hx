package gitblog;

import frank.App;

/**
 * Blog web-app entry point.
 */
class GitBlog
{
  public static function main()
  {
    new GitBlog();
  }
  
  public function new()
  {
    new App()
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