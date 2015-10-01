package frank;

interface Controller
{
  /**
   * Called by `App` on hash change when visiting the attached route.
   * @param   hash    String, current hash matching the controlled route
   */
  public function enter(hash : String) : Void;
}