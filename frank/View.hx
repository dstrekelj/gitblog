package frank;

class View
{
  var parentElement : js.html.Element;
  var viewTemplate : haxe.Template;

  public function new(parentElementID : String, templateName : String) : Void
  {
    parentElement = js.Browser.document.getElementById(parentElementID);
    viewTemplate = new haxe.Template(haxe.Resource.getString(templateName));
  }

  /**
   * Updates the parent element inner HTML after executing view template
   * with new data. Override this to format data before displaying it
   * with a `super.update(viewData)` call.
   * @param   viewData    View data
   */
  public function update(viewData : Dynamic) : Void
  {
    parentElement.innerHTML = viewTemplate.execute(viewData);
  }
}