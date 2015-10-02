package highlightly;

import js.html.HTMLCollection;
import js.Browser;

class Highlightly
{
  public static function highlight() : Void
  {
    var elements = Browser.document.getElementsByClassName('prettyprint');
    
    var regexHTML : EReg = ~/<\/{0,1}([A-Z][A-Z0-9]*)\b[^>]*>/gi;
    
    var regexHaxeKeywords : EReg = ~/^(?!(\s*\t*\/\/))(.*)\b(break|case|cast|catch|class|continue|default|do|dynamic|else|enum|extends|extern|false|for|function|if|implements|import|in|inline|interface|never|new|null|override|package|private|public|return|static|super|switch|this|throw|trace|true|try|typedef|untyped|using|var|while){1}\b/gim;
    // http://stackoverflow.com/a/16165598
    var regexHaxeComments : EReg = ~/(\/\/(.*))|(\/\*(\*(?!\/)|[^*])*\*\/)/igm;

    for (element in elements)
    {
      var classList : js.html.DOMTokenList = element.classList;
      var html : String = StringTools.htmlUnescape(element.innerHTML);

      if (classList.contains('html'))
      {
        element.innerHTML = regexHTML.map(html, matchKeyword);
      }
      else if (classList.contains('haxe'))
      {
        html = StringTools.htmlUnescape(regexHaxeKeywords.map(html, matchKeyword));
        element.innerHTML = regexHaxeComments.map(html, matchComment);
      }
    }
  }

  private static function matchKeyword(regex : EReg) : String
  {
    var match = regex.matched(0);
    return '<span class="keyword">' + StringTools.htmlEscape(match) + '</span>';
  }

  private static function matchComment(regex : EReg) : String
  {
    var match = regex.matched(0);
    return '<span class="comment">' + StringTools.htmlEscape(match) + '</span>';
  }
}