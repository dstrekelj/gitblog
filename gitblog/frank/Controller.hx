package gitblog.frank;

interface Controller
{
  /**
   * The route attached to the controller.
   */
  public var route : String;
  /**
   * Called on hash change when visiting the attached route.
   */
  public function onEnter() : Void;
  /**
   * Called on hash change when leaving the attached route.
   */
  public function onExit() : Void;
}