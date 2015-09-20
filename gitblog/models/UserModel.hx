package gitblog.models;

class UserModel
{
  var email : String;
  var location : String;
  var login : String;
  var name : String;
  var url : String;

  public function new(params : UserModelParams):Void
  {
      email = params.email;
      location = params.location;
      login = params.login;
      name = params.name;
      url = params.url;
  }
}

typedef UserModelParams =
{
  var email : String;
  var location : String;
  var login : String;
  var name : String;
  var url : String;
}