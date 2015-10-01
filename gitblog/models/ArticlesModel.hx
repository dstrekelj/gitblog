package gitblog.models;

class ArticlesModel
{
  public var timestamp : String;
  public var title : String;
  public var path : String;

  public function new(params : ArticlesModelParams)
  {
    timestamp = params.timestamp;
    title = params.title;
    path = params.path;
  }
}

typedef ArticlesModelParams =
{
  var timestamp : String;
  var title : String;
  var path : String;
}