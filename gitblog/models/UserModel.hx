package gitblog.models;

class UserModel
{
  var avatar : String;
  var email : String;
  var location : String;
  var login : String;
  var name : String;
  var repos : Int;
  var url : String;

  public function new(params : UserModelParams):Void
  {
    avatar = params.avatar;
    email = params.email;
    location = params.location;
    login = params.login;
    name = params.name;
    repos = params.repos;
    url = params.url;
  }
}

typedef UserModelParams =
{
  var avatar : String;
  var email : String;
  var location : String;
  var login : String;
  var name : String;
  var url : String;
  var repos : Int;
}