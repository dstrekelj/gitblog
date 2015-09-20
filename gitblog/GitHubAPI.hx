package gitblog;
import haxe.Http;
import haxe.remoting.HttpConnection;

/**
 * ...
 * @author Domagoj Štrekelj
 */
class GitHubAPI
{
  public var username : String;

  public var user(default, null) : Connection;
  public var repos(default, null) : Connection;
  public var contents(default, null) : Connection;
  
  public function new(username : String)
  {
    this.username = username;
    
    user = new Connection('https://api.github.com/users/${username}');
    repos = new Connection('https://api.github.com/users/${username}/repos');
    contents = new Connection('https://api.github.com/repos/${username}/gitblog-content/contents/other/');
  }
}