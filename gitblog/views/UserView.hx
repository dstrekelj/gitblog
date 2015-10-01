package gitblog.views;

import frank.View;

import gitblog.models.UserModel;

class UserView extends View
{
  public function new()
  {
    super('user', 'UserTemplate');
  }

  override public function update(user : UserModel) : Void
  {
    super.update({ user : user });
  }
}