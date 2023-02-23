---
category: framework-deep-dive
---
# Event system

{@link module:utils/emittermixin~Emitter Emitters} are objects that can fire events. They also provide means to listen to other emitters' events.

Emitters are heavily used throughout the entire editor architecture. They are the building blocks for mechanisms such as the {@link framework/deep-dive/observables observables}, {@link framework/architecture/editing-engine#observers engine's view observers}, and {@link framework/architecture/editing-engine#conversion conversion}.

Any class can become an event emitter. All you need to do is mix the {@link module:utils/emittermixin~EmitterMixin} into it:

```js
import EmitterMixin from '@ckeditor/ckeditor5-utils/src/emittermixin';
import mix from '@ckeditor/ckeditor5-utils/src/mix';

class AnyClass {
	// Class's code.
	// ...
}

mix( AnyClass, EmitterMixin );
```

## Listening to events

Adding a callback to an event is simple. You can listen directly on the emitter object and use an anonymous function:

```js
emitter.on( 'eventName', ( eventInfo, ...args ) => { /* ... */ } );
```

However, a function object is needed if you want to be able to remove the event listener:

```js
emitter.off( 'eventName', handler );
```

There is also another way to add an event listener &mdash; by using {@link module:utils/emittermixin~Emitter#listenTo `listenTo()`}. This way one emitter can listen to events on another emitter:

```js
foo.listenTo( bar, 'eventName', ( eventInfo, ...args ) => { /* ... */ } );
```

Now you can easily detach the `foo` from `bar` simply by {@link module:utils/emittermixin~Emitter#stopListening `stopListening()`}.

```js
// Stop listening to a specific handler.
foo.stopListening( bar, 'eventName', handler );

// Stop listening to a specific event.
foo.stopListening( bar, 'eventName' );

// Stop listening to all events fired by a specific emitter.
foo.stopListening( bar );

// Stop listening to all events fired by all bound emitters.
foo.stopListening();
```

<info-box>
	The {@link module:utils/emittermixin~Emitter#on `on()`} and {@link module:utils/emittermixin~Emitter#off `off()`} methods are shorthands for {@link module:utils/emittermixin~Emitter#listenTo `listenTo( this, /* ... */ )`} and {@link module:utils/emittermixin~Emitter#stopListening `stopListening( this, /* ... */ )`} (the emitter is bound to itself).
</info-box>

### Listener priorities

By default, all listeners are bound on the {@link module:utils/priorities~PriorityString `normal`} priority, but you can specify the priority when registering a listener:

```js
this.on( 'eventName', () => { /* ... */ }, { priority: 'high' } );
this.listenTo( emitter, 'eventName', () => { /* ... */ }, { priority: 'high' } );
```

There are 5 named priorities:

* `highest`
* `high`
* `normal`
* `low`
* `lowest`

Listeners are triggered in the order of these priorities (first `highest`, then `high`, etc.). For multiple listeners attached on the same priority, they are fired in the order of the registration.

**Note**: If any listener {@link module:utils/eventinfo~EventInfo#stop stops} the event, no other listeners including those on lower priorities will be called.

It is possible to use relative priorities {@link module:utils/priorities~priorities#get `priorities.get( 'high' ) + 10`} but this is strongly discouraged.

### Stopping events and returned value

The first argument passed to an event handler is always an instance of the {@link module:utils/eventinfo~EventInfo}. There you can check the event {@link module:utils/eventinfo~EventInfo#name `name`}, the {@link module:utils/eventinfo~EventInfo#source `source` emitter} of the event, and you can {@link module:utils/eventinfo~EventInfo#stop `stop()`} the event from further processing.

```js
emitter.on( 'eventName', ( eventInfo, data ) => {
	console.log( 'foo' );
	eventInfo.stop();
} );

emitter.on( 'eventName', ( eventInfo, data ) => {
	console.log( 'bar' ); // This won't be called.
} );

emitter.fire( 'eventName' ); // Logs "foo" only.
```

Listeners can set the {@link module:utils/eventinfo~EventInfo#return `return`} value. This value will be returned by {@link module:utils/emittermixin~Emitter#fire `fire()`} after all callbacks are processed.

```js
emitter.on( 'eventName', ( eventInfo, data ) => {
	eventInfo.return = 123;
} );

emitter.fire( 'eventName' ); // -> 123
```

### Listening on namespaced events

The event system supports namespaced events to give you the possibility to build a structure of callbacks. Namespacing is achieved by using `:` in the event name:

```js
this.fire( 'foo:bar:baz', data );
```

Then the listeners can be bound to a specific event or the whole namespace:

```js
this.on( 'foo', () => { /* ... */ } );
this.on( 'foo:bar', () => { /* ... */ } );
this.on( 'foo:bar:baz', () => { /* ... */ } );
```

This way you can have more general events, listening to a broader event (`'foo'` in this case), or more detailed callbacks listening to specified events (`'foo:bar'` or `'foo:bar:baz'`).

This mechanism is used for instance in the conversion, where thanks to events named as `'insert:<elementName>'` you can listen to the insertion of a specific element (e.g. `'insert:p'`) or all elements insertion (`'insert'`).

**Note**: Listeners registered on the same priority will be fired in the order of the registration (no matter if listening to a whole namespace or to a specific event).

## Firing events

Once you mix the {@link module:utils/emittermixin~EmitterMixin} into your class, you can fire events the following way:

```js
this.fire( 'eventName', argA, argB, /* ... */ );
```

All passed arguments will be available in all listeners that are added to the event.

**Note**: Most base classes (like {@link module:core/command~Command} or {@link module:core/plugin~Plugin}) are {@link module:utils/emittermixin~Emitter emitters} already and fire their own events.

### Stopped events

It is sometimes useful to know if an event was stopped by any of the listeners. There is an alternative way of firing an event just for that:

```js
import EventInfo from '@ckeditor/ckeditor5-utils/src/eventinfo';

// Prepare the event info...
const eventInfo = new EventInfo( this, 'eventName' );

// ...and fire the event.
this.fire( eventInfo, argA, argB, /* ... */ );

// Here you can check if the event was stopped.
if ( eventInfo.stop.called ) {
	// The event was stopped.
}
```

Note that {@link module:utils/eventinfo~EventInfo} expects the source object in the first parameter as the origin of the event.

### Event return value

If any handler set the {@link module:utils/eventinfo~EventInfo#return `eventInfo.return`} field, this value will be returned by {@link module:utils/emittermixin~Emitter#fire `fire()`} after all callbacks are processed.

```js
emitter.on( 'eventName', ( eventInfo, ...args ) => {
	eventInfo.return = 123;
} );

const result = emitter.fire( 'eventName', argA, argB, /* ... */ );

console.log( result ); // -> 123
```

## Delegating events

The {@link module:utils/emittermixin~Emitter `Emitter`} interface also provides the {@link module:utils/emittermixin~Emitter#delegate event delegation} mechanism, so that selected events are fired by another {@link module:utils/emittermixin~Emitter}.

### Setting events delegation

Delegate specific events to another emitter:

```js
emitterA.delegate( 'foo' ).to( emitterB );
emitterA.delegate( 'foo', 'bar' ).to( emitterC );
```

You can delegate events with a different name:

```js
emitterA.delegate( 'foo' ).to( emitterB, 'bar' );
emitterA.delegate( 'foo' ).to( emitterB, name => `delegated:${ name }` );
```

It is also possible to delegate all the events:

```js
emitterA.delegate( '*' ).to( emitterB );
```

**Note**: Delegated events are fired from the target emitter no matter if they were stopped in any handler on the source emitter.

### Stopping delegation

You can stop delegation by calling the {@link module:utils/emittermixin~Emitter#stopDelegating `stopDelegating()`} method. It can be used at different levels:

```js
// Stop delegating all events.
emitterA.stopDelegating();

// Stop delegating a specific event to all emitters.
emitterA.stopDelegating( 'foo' );

// Stop delegating a specific event to a specific emitter.
emitterA.stopDelegating( 'foo', emitterB );
```

### Delegated event info

The delegated events provide the {@link module:utils/eventinfo~EventInfo#path} of emitters that this event met along the delegation path.

```js
emitterA.delegate( 'foo' ).to( emitterB, 'bar' );
emitterB.delegate( 'bar' ).to( emitterC, 'baz' );

emitterA.on( 'foo', eventInfo => console.log( 'event', eventInfo.name, 'emitted by A; source:', eventInfo.source, 'path:', eventInfo.path ) );
emitterB.on( 'bar', eventInfo => console.log( 'event', eventInfo.name, 'emitted by B; source:', eventInfo.source, 'path:', eventInfo.path ) );
emitterC.on( 'baz', eventInfo => console.log( 'event', eventInfo.name, 'emitted by C; source:', eventInfo.source, 'path:', eventInfo.path ) );

emitterA.fire( 'foo' );

// Outputs:
//   event "foo" emitted by A; source: emitterA; path: [ emitterA ]
//   event "bar" emitted by B; source: emitterA; path: [ emitterA, emitterB ]
//   event "baz" emitted by C; source: emitterA; path: [ emitterA, emitterB, emitterC ]
```

## View events bubbling

The {@link module:engine/view/document~Document `view.Document`} is not only an {@link module:utils/observablemixin~Observable Observable} and an {@link module:utils/emittermixin~Emitter emitter} but it also implements the special {@link module:engine/view/observer/bubblingemittermixin~BubblingEmitter} interface (implemented by {@link module:engine/view/observer/bubblingemittermixin~BubblingEmitterMixin}). It provides a mechanism for bubbling events over the virtual DOM tree.

It is different from the bubbling that you know from the DOM tree event bubbling. You do not register listeners on specific instances of the elements in the view document tree. Instead, you can register handlers for specific contexts. A context is either a name of an element, or one of the virtual contexts (`'$capture'`, `'$text'`, `'$root'`, `'$document'`), or a callback to match desired nodes.

### Listening to bubbling events

Listeners registered in the context of the view element names:

```js
this.listenTo( view.document, 'enter', ( evt, data ) => {
	// Listener's code.
	// ...
}, { context: 'blockquote' } );

this.listenTo( view.document, 'enter', ( evt, data ) => {
	// Listener's code.
	// ...
}, { context: 'li' } );
```

Listeners registered in the virtual contexts:

```js
this.listenTo( view.document, 'arrowKey', ( evt, data ) => {
	// Listener's code.
	// ...
}, { context: '$text', priority: 'high' } );

this.listenTo( view.document, 'arrowKey', ( evt, data ) => {
	// Listener's code.
	// ...
}, { context: '$root' } );

this.listenTo( view.document, 'arrowKey', ( evt, data ) => {
	// Listener's code.
	// ...
}, { context: '$capture' } );
```

Listeners registered in the context of a custom callback function:

```js
import { isWidget } from '@ckeditor/ckeditor5-widget/src/utils';

this.listenTo( view.document, 'arrowKey', ( evt, data ) => {
	// Listener's code.
	// ...
}, { context: isWidget } );

this.listenTo( view.document, 'arrowKey', ( evt, data ) => {
	// Listener's code.
	// ...
}, { context: isWidget, priority: 'high' } );
```

**Note**: Without specifying the `context`, events are bound to the `'$document'` context.

### Bubbling events flow

Bubbling always starts from the virtual `'$capture'` context. All listeners attached to this context are triggered first (and in the order of their priorities).

Then, the real bubbling starts from the selection position (either its anchor or focus &mdash; depending on what is deeper).

If text nodes are allowed at the selection position, then the first context is `'$text'`. Then the event bubbles through all elements up to the `'$root'` and finally `'$document'`.

In all contexts listeners can be registered at desired priorities. If a listener stops an event, this event is not fired for the remaining contexts.

### Examples

Assuming the given content and selection:

```html
<blockquote>
	<p>
		Foo[]bar
	</p>
</blockquote>
```

Events will be fired for the following contexts:

1. `'$capture'`
1. `'$text'`
1. `'p'`
1. `'blockquote'`
1. `'$root'`
1. `'$document'`

Assuming the given content and selection (on a widget):

```html
<blockquote>
	<p>
		Foo
		[<img />]	 // enhanced with toWidget()
		bar
	</p>
</blockquote>
```

Events will be fired for the following contexts:

1. `'$capture'`
1. `'img'`
1. *widget* (assuming a custom matcher was used)
1. `'p'`
1. `'blockquote'`
1. `'$root'`
1. `'$document'`

An even more complex example:

```html
<blockquote>
	<figure class="table">	 // enhanced with toWidget()
		<table>
			<tr>
				<td>
					<p>
						foo[]bar
					</p>
				</td>
			</tr>
		</table>
	</figure>
</blockquote>
```

Events that will be fired:

1. `'$capture'`
1. `'$text'`
1. `'p'`
1. `'td'`
1. `'tr'`
1. `'table'`
1. `'figure'`
1. *widget* (assuming a custom matcher was used)
1. `'blockquote'`
1. `'$root'`
1. `'$document'`

### `BubblingEventInfo`

In some events the first parameter is not the standard `EventInfo`, but {@link module:engine/view/observer/bubblingeventinfo~BubblingEventInfo `BubblingEventInfo`}. This is an extension that provides the current {@link module:engine/view/observer/bubblingeventinfo~BubblingEventInfo#eventPhase} and {@link module:engine/view/observer/bubblingeventinfo~BubblingEventInfo#currentTarget}.

Currently, this information is available for the following events:

* {@link module:engine/view/document~Document#event:enter `enter`},
* {@link module:engine/view/document~Document#event:delete `delete`},
* {@link module:engine/view/document~Document#event:arrowKey `arrowKey`}.

Hence the events from the above example would be extended with the following `eventPhase` data:

1. `'$capture'` - *capturing*
1. `'$text'` - *atTarget*
1. `'p'` - *bubbling*
1. `'td'` - *bubbling*
1. `'tr'` - *bubbling*
1. `'table'` - *bubbling*
1. `'figure'` - *bubbling*
1. *widget* - *bubbling*
1. `'blockquote'` - *bubbling*
1. `'$root'` - *bubbling*
1. `'$document'` - *bubbling*

And for the example with the widget selected:

```html
<blockquote>
	<p>
		Foo
		[<img />]	 // enhanced with toWidget()
		bar
	</p>
</blockquote>
```

Events that will be fired:

1. `'$capture'` - *capturing*
1. `'img'` - *atTarget*
1. *widget* - *atTarget* (assuming a custom matcher was used)
1. `'p'` - *bubbling*
1. `'blockquote'` - *bubbling*
1. `'$root'` - *bubbling*
1. `'$document'` - *bubbling*
