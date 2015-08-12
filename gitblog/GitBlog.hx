package gitblog;
import gitblog.models.UserModel;
import gitblog.Responses.ContentsResponse;
import gitblog.Responses.ReposResponse;
import gitblog.Responses.UserResponse;
import gitblog.views.UserView;
import haxe.Json;

/**
 * ...
 * @author Domagoj Štrekelj
 */

class GitBlog
{
	public static function main()
	{
		new GitBlog();
		
		API.user
			.onSuccess(function(Data : String) {
				var user : UserResponse = Json.parse(Data);
				trace(user.name);
			})
			.onFailure(function(Message : String) { trace(Message);	})
			.onChange(function(Status : Int) { trace(Status); })
			.get();
		
		API.repos
			.onSuccess(function(Data : String) {
				var repos : ReposResponse = Json.parse(Data);
				for (repo in repos)
				{
					trace(repo.name);
				}
			})
			.onFailure(function(Message : String) {	trace(Message);	})
			.onChange(function(Status : Int) { trace(Status); })
			.get();
		
		API.contents
			.onSuccess(function(Data : String) {
				var contents : ContentsResponse = Json.parse(Data);
				for (content in contents)
				{
					trace(content.name);
				}
			})
			.onFailure(function(Message : String) { trace(Message); })
			.onChange(function(Status : Int) { trace(Status); })
			.get();
	}
	
	public function new()
	{
		API.init();
	}
}