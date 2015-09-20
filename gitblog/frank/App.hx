package gitblog.frank;

import gitblog.frank.Controller;

class App
{
  var routes : Map<String, Controller>;
  var context : Controller;

  public function new()
  {
    routes = new Map<String, Controller>();
    context = null;

    js.Browser.window.addEventListener('hashchange', router);
  }

  public function route(route : String, controller : Controller) : App
  {
    controller.route = route;
    routes.set(route, controller);

    return this;
  }

  private function router(event : js.html.EventListener) : Void
  {
    var hash : String = js.Browser.location.hash.substr(1);
    trace(hash);
    if (routes.exists(hash))
    {
      if (context != null)
        context.onExit();
      context = routes.get(hash);
      context.onEnter();
    }
    else
    {
      trace('ERROR: Route ${hash} is not registered with the application.');
    }
  }
}