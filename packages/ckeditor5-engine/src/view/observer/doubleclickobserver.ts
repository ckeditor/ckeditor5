import Observer from './observer';
  import DomEventObserver from './domeventobserver'
  
  export default class DoubleClickObserver extends DomEventObserver<'dblclick'> {
  	// It can also be defined as a normal property in the constructor.
  	get domEventType(): 'dblclick' {
  		return 'dblclick';
  	}
 
  	onDomEvent( domEvent: MouseEvent ): void {
  		this.fire( 'dblclick', domEvent );
  	}
  }