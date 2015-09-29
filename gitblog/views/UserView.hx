package gitblog.views;

import frank.View;

class UserView extends View
{
  public function new() : Void
  {
    super('user', 'UserTemplate');
  }
}