package frank;

import frank.Controller;

/**
 * Application entry point.
 */
class App
{
  /**
   * Stores all defined routes. Using an array makes it possible to iterate
   * through routes in the order they were set.
   */
  var routes : Array<Route>;

  public function new()
  {
    routes = new Array<Route>();
    js.Browser.window.addEventListener('hashchange', router);
  }

  /**
   * Registers a new route with the application.
   * @param   route   Route (path-controller pair) to register
   * @return  This object for chaining
   */
  public function route(route : Route) : App
  {
    routes.push(route);
    return this;
  }

  /**
   * Checks if current fragment identifier (hash) matches a route.
   * @param   event   The event 'onhashchange' event that called this function
   */
  private function router(event : js.html.EventListener) : Void
  {
    var hash : String = js.Browser.location.hash.substr(1);
    var route : Route = findRoute(hash);

    if (route != null)
    {
      route.controller.enter(hash);
    }
    else
    {
      trace('ERROR: Unmatched route.');
    }
  }

  /**
   * Attempts to find route among registered routes.
   * @param   Current fragment identifier (hash)
   * @return  Route if found, `null` if not
   */
  private function findRoute(hash : String) : Route
  {
    for (route in routes)
    {
      if (route.path.match(hash))
      {
        return route;
      }
    }
    return null;
  }
}

/**
 * Defines a route as a path-controller pair.
 */
private typedef Route = {
  var path : EReg;
  var controller : frank.Controller;
}