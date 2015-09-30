package gitblog;

/**
 * Type definitions for select GitHub API responses.
 */

typedef ContentResponse =
{
	var name : String;
	var path : String;
	var sha : String;
	var size : Int;
	var url : String;
	var html_url : String;
	var git_url : String;
	var download_url : String;
	var type : String;
	var _links : LinksResponse;
}

typedef ContentsResponse = Array<ContentResponse>;

typedef FileResponse =
{
	var type : String;
	var encoding : String;
	var size : Int;
	var name : String;
	var path : String;
	var content : String;
	var sha : String;
	var url : String;
	var git_url : String;
	var html_url : String;
	var download_url : String;
	var _links : LinksResponse;
}

typedef LinksResponse =
{
	var self : String;
	var git : String;
	var html : String;
}

typedef MemberResponse =
{
	var login : String;
	var id : Int;
	var avatar_url : String;
	var gravatar_id : String;
	var url : String;
	var html_url : String;
	var followers_url : String;
	var following_url : String;
	var gists_url : String;
	var starred_url : String;
	var subscriptions_url : String;
	var organizations_url : String;
	var repos_url : String;
	var events_url : String;
	var received_events_url : String;
	var type : String;
	var site_admin : Bool;
}

typedef PermissionsResponse =
{
	var admin : Bool;
	var push : Bool;
	var pull : Bool;
}

typedef RepoResponse =
{
	var id : Int;
	var owner : MemberResponse;
	var name : String;
	var full_name : String;
	var description : String;
	var private_ : Bool;
	var fork : Bool;
	var url : String;
	var html_url : String;
	var clone_url : String;
	var git_url : String;
	var ssh_url : String;
	var svn_url : String;
	var mirror_url : String;
	var homepage : String;
	var language : String;
	var forks_count : Int;
	var stargazers_count : Int;
	var watchers_count : Int;
	var size : Int;
	var default_branch : String;
	var open_issues_count : Int;
	var has_issues : Bool;
	var has_wiki : Bool;
	var has_pages : Bool;
	var has_downloads : Bool;
	var pushed_at : String;
	var created_at : String;
	var updated_at : String;
	var permissions : PermissionsResponse;
}

typedef ReposResponse = Array<RepoResponse>;

typedef UserResponse =
{
	> MemberResponse,
	var name : String;
	var company : String;
	var blog : String;
	var location : String;
	var email : String;
	var hireable : Bool;
	var bio : String;
	var public_repos : Int;
	var public_gists : Int;
	var followers : Int;
	var following : Int;
	var created_at : String;
	var updated_at : String;
}
