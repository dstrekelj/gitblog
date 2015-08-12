package gitblog.views;
import gitblog.models.UserModel;
import js.Browser;
import js.html.DivElement;
import js.html.HeadingElement;

/**
 * ...
 * @author Domagoj Štrekelj
 */
class UserView
{	
	public function new(User : UserModel) 
	{
		var div : DivElement =  Browser.document.createDivElement();
		div.innerText = 'yo';
		Browser.document.body.appendChild(div);
	}
}