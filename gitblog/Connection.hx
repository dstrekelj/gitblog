package gitblog;
import haxe.Http;

/**
 * `Http` wrapper for ease of use.
 * @author Domagoj Štrekelj
 */
class Connection extends Http
{
	/**
	 * Creates new connection to specified URL.
	 * @param	URL
	 */
	public function new(URL : String) 
	{
		super(URL);
	}
	
	/**
	 * GET request.
	 * @return
	 */
	public function get() : Connection
	{
		super.request(false);
		
		return this;
	}
	
	/**
	 * Called on successful request.
	 * @param	Callback
	 * @return
	 */
	public function onSuccess(Callback : String->Void) : Connection
	{
		this.onData = Callback;
		
		return this;
	}
	
	/**
	 * Called on failed request.
	 * @param	Callback
	 * @return
	 */
	public function onFailure(Callback : String->Void) : Connection
	{
		this.onError = Callback;
		
		return this;
	}
	
	/**
	 * Called on HTTP status change.
	 * @param	Callback
	 * @return
	 */
	public function onChange(Callback : Int->Void) : Connection
	{
		this.onStatus = Callback;
		
		return this;
	}
	
	/**
	 * POST request.
	 * @return
	 */
	public function post() : Connection
	{
		super.request(true);
		
		return this;
	}
}