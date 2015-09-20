package frank;

import frank.Controller;

/**
 * Application entry point.
 */
class App
{
  var routes : Map<EReg, Controller>;
  var context : Controller;

  public function new()
  {
    routes = new Map<EReg, Controller>();
    context = null;

    js.Browser.window.addEventListener('hashchange', router);
  }

  public function route(route : EReg, controller : Controller) : App
  {
    routes.set(route, controller);

    return this;
  }

  private function router(event : js.html.EventListener) : Void
  {
    var hash : String = js.Browser.location.hash.substr(1);
    var route : EReg = findRoute(hash);

    if (route != null)
    {
      var controller : Controller = routes.get(route);
      
      if (context != null)
        context.onExit(hash);

      context = controller;
      context.onEnter(hash);
    }
    else
    {
      trace('ERROR: Unmatched route.');
    }
  }

  private function findRoute(hash : String) : EReg
  {
    for (route in routes.keys())
    {
      if (route.match(hash))
      {
        return route;
      }
    }
    return null;
  }
}