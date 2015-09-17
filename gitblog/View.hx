package gitblog;

class View
{
  var parentElement(default, null) : js.html.Element;
  var viewTemplate(default, null) : haxe.Template;

  public function new(parentElementID : String, templateName : String) : Void
  {
    parentElement = js.Browser.document.getElementById(parentElementID);
    viewTemplate = new haxe.Template(haxe.Resource.getString(templateName));
  }

  public function update(viewData : Dynamic) : Void
  {
    parentElement.innerHTML = viewTemplate.execute(viewData);
  }
}