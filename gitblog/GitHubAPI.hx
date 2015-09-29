package gitblog;

import haxe.Http;
import haxe.remoting.HttpConnection;

class GitHubAPI
{
  public var username : String;

  public var user(default, null) : Connection;
  public var contents(default, null) : Connection;
  
  public function new(username : String)
  {
    this.username = username;
    
    user = new Connection('https://api.github.com/users/${username}');
    contents = new Connection('https://api.github.com/repos/${username}/dstrekelj.github.io/contents').parameters('/content');
  }
}