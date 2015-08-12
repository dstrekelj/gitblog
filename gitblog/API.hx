package gitblog;
import haxe.Http;
import haxe.remoting.HttpConnection;

/**
 * ...
 * @author Domagoj Štrekelj
 */
class API
{
	public static var user : Connection;
	public static var repos : Connection;
	public static var contents : Connection;
	
	public static function init()
	{
		user = new Connection('https://api.github.com/users/dstrekelj');
		repos = new Connection('https://api.github.com/users/dstrekelj/repos');
		contents = new Connection('https://api.github.com/repos/dstrekelj/ufront-example-HelloWorld/contents/wiki/');
	}
}