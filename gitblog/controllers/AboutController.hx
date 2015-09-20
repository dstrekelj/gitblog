package gitblog.controllers;

class AboutController implements frank.Controller
{
  public function new() : Void {}

  public function onEnter(hash : String) : Void
  {
    js.Browser.document.getElementById('about').innerHTML = "HELLO FROM ABOUTCONTROLLER!";
  }

  public function onExit(hash : String) : Void {}
}