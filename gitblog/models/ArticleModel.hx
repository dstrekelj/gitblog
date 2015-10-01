package gitblog.models;

class ArticleModel
{
  public var body : String;
  public var timestamp : String;

  public function new(params : ArticleModelParams)
  {
    body = params.body;
    timestamp = params.timestamp;
  }
}

typedef ArticleModelParams =
{
  var body : String;
  var timestamp : String;
}