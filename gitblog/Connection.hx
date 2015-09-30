package gitblog;

/**
 * `Http` wrapper for easier use.
 */
class Connection extends haxe.Http
{
  var baseURL : String;

  /**
   * Creates new connection to specified base URL.
   * @param baseURL `String` base URL
   */
  public function new(baseURL : String) 
  {
    this.baseURL = baseURL;
    super(this.baseURL);
  }
  
  /**
   * GET request.
   * @return  `Connection` object for chaining
   */
  public function get() : Connection
  {
    super.request(false);
    
    return this;
  }

  /**
   * Called on HTTP status change. HTTP status is passed to callback.
   * @param   callback  `Int->Void` callback function
   * @return            `Connection` object for chaining
   */
  public function onChange(callback : Int->Void) : Connection
  {
    this.onStatus = callback;
    
    return this;
  }

  /**
   * Called on failed request. Response is passed to callback.
   * @param   callback  `String->Void` callback function
   * @return            `Connection` object for chaining
   */
  public function onFailure(callback : String->Void) : Connection
  {
    this.onError = callback;
    
    return this;
  }
  

  /**
   * Called on successful request. Response is passed to callback.
   * @param    callback   `String->Void` callback function
   * @return              `Connection` object for chaining
   */
  public function onSuccess(callback : String->Void) : Connection
  {
    this.onData = callback;
    
    return this;
  }

  /**
   * Appends a parameters string to the base URL.
   * @param  params `String` parameters
   * @return        `Connection` object for chaining
   */
  public function parameters(params : String) : Connection
  {
    this.url = baseURL + params;

    return this;
  }

  /**
   * POST request.
   * @return  `Connection` object for chaining
   */
  public function post() : Connection
  {
    super.request(true);
    
    return this;
  }
}