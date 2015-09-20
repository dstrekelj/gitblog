package frank;

interface Controller
{
  /**
   * Called by `App` on hash change when visiting the attached route.
   * @param   hash    String, current hash matching the controlled route
   */
  public function onEnter(hash : String) : Void;
  /**
   * Called by `App` on hash change when leaving the attached route.
   * @param   hash    String, new hash that triggered the change
   */
  public function onExit(hash : String) : Void;
}