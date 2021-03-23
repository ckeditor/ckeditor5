---
category: framework-deep-dive
---

# Event system

{@link module:utils/emittermixin~Emitter Emitters} are objects that can fire events. They also provide means to listen to other emitters' events.

Emitters are heavily used in the {@link framework/guides/architecture/editing-engine#conversion conversion}, {@link framework/guides/architecture/editing-engine#observers Observers} and are a base for the {@link framework/guides/deep-dive/observables Observables}.  

Any class can become an event emitter; all you need to do is mix the {@link module:utils/emittermixin~EmitterMixin} into it:

```js
import EmitterMixin from '@ckeditor/ckeditor5-utils/src/emittermixin';
import mix from '@ckeditor/ckeditor5-utils/src/mix';

class AnyClass {
	// ...
}

mix( AnyClass, EmitterMixin );
```

<info-box>
	Check out the {@link framework/guides/deep-dive/custom-element-conversion custom element conversion} guide to learn more about the advanced usage of events in the conversion pipelines.
</info-box>

## Listening to events

Adding a callback to an event is simple. You can listen directly on the emitter object and use an anonyomous function:

```js
emitter.on( 'eventName', ( eventInfo, ...args ) => { ... } );
```

However, a function object will be needed if you would need to be able to remove the event listener:

```js
emitter.off( 'eventName', handler );
```

There is also another way to add an event listener - by using {@link module:utils/emittermixin~Emitter#listenTo `listenTo()`}. This way one emitter can listen to events on another emitter:

```js
foo.listenTo( bar, 'eventName', ( eventInfo, ...args ) => { ... } );
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
    The {@link module:utils/emittermixin~Emitter#on `on()`} and {@link module:utils/emittermixin~Emitter#off `off()`} methods are shorthands for {@link module:utils/emittermixin~Emitter#listenTo `listenTo( this, ... )`} and {@link module:utils/emittermixin~Emitter#stopListening `stopListening( this, ... )`} (emitter is bound to itself). 
</info-box>

### Listener priorities

By default, all listeners are bound on the {@link module:utils/priorities~PriorityString `normal`} priority, but you can specify the priority while registering a listener:

```js
this.on( 'eventName', () => { ... }, { priority: 'high' } );
this.listenTo( emitter, 'eventName', () => { ... }, { priority: 'high' } );
```

There are 5 named priorities:

* `highest`
* `high`
* `normal`
* `low`
* `lowest`

Listeners are triggered in the order of those priorities. For multiple listeners attached on the same priority, they are fired in the order of the registration.

**Note**: If any listener {@link module:utils/eventinfo~EventInfo#stop stops} the event, no other listeners including those on lower priorities will be called.

It is possible to use relative priorities {@link module:utils/priorities~priorities#get `priorities.get( 'high' ) + 10`} but this is strongly discouraged.

### Stopping events and returned value

The first argument passed to an event handler is always an instance of the {@link module:utils/eventinfo~EventInfo}. There you can check the event {@link module:utils/eventinfo~EventInfo#name `name`}, {@link module:utils/eventinfo~EventInfo#source `source` emitter} of the event, and you could {@link module:utils/eventinfo~EventInfo#stop `stop()`} the event from further processing. 

```js
emitter.on( 'eventName', ( eventInfo, data ) => {
	eventInfo.stop();
} );
```

Listeners can set the {@link module:utils/eventinfo~EventInfo#return `return`} field. This value will be returned by {@link module:utils/emittermixin~Emitter#fire `fire()`} after all callbacks are processed.

```js
emitter.on( 'eventName', ( eventInfo, data ) => {
	eventInfo.return = 123;
} );
```

### Listening on namespaced events

Event system supports namespaced events to give you a possibility to build a structure of callbacks. Namespacing is achieved by using `:` in the event name:

```js
this.fire( 'foo:bar:baz', data );
```

Then listeners can be bound to a specific event or the whole namespace:

```js
this.on( 'foo', () => { ... } );
this.on( 'foo:bar', () => { ... } );
this.on( 'foo:bar:baz', () => { ... } );
```

This way you can have more general events, listening to a broader event ("`foo`" in this case), or more detailed callbacks listening to specified events (`"foo:bar"` or "`foo:bar:baz`").

**Note**: Listeners registered on the same priority will be fired in the order of the registration (no matter if listening to a whole namespace or to the specific event).

## Firing events

Once you mix the {@link module:utils/emittermixin~EmitterMixin} into your class you can fire events in the following way:

```js
this.fire( 'eventName', argA, argB, ... );
```

All passed arguments will be available in all listeners that are added to that event.

**Note**: Most base classes (like the {@link module:core/command~Command} or the {@link module:core/plugin~Plugin}) already are {@link module:utils/emittermixin~Emitter emitters} and fire their own events.

### Stopped events

It is sometimes useful to know if an event was stopped by any of the listeners. There is an alternative way of firing event just for that:

```js
import EventInfo from '@ckeditor/ckeditor5-utils/src/eventinfo';

// Prepare the event info...
const eventInfo = new EventInfo( this, 'eventName' );

// ...and fire the event.
this.fire( eventInfo, argA, argB, ... );

// Here we can check if this event was stopped.
if ( eventInfo.stop.called ) {
	// Event was stopped.
}
```

Note that {@link module:utils/eventinfo~EventInfo} expects source object in the first parameter as an origin of the event.

### Event return value
 
If any handler set the {@link module:utils/eventinfo~EventInfo#return `eventInfo.return`} field then this value will be returned by {@link module:utils/emittermixin~Emitter#fire `fire()`} after all callbacks are processed. 

```js
emitter.on( 'eventName', ( eventInfo, ...args ) => {
	eventInfo.return = 123;
} );

const result = emitter.fire( 'eventName', argA, argB, ... );

console.log( result ); // -> 123
```

## Delegating events

The {@link module:utils/emittermixin~Emitter Emitter} interface also provides the events {@link module:utils/emittermixin~Emitter#delegate delegation} so that selected events are fired by another {@link module:utils/emittermixin~Emitter}.

### Setting events delegation

Delegate a specific events to another emitter:
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

You can stop delegation by calling {@link module:utils/emittermixin~Emitter#stopDelegating `stopDelegating()`}. It can be used at different levels:

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

## Bubbling events

The {@link module:engine/view/document~Document `view.Document`} is not only the {@link module:utils/observablemixin~Observable Observable} (and {@link module:utils/emittermixin~Emitter Emitter}) but it also implements {@link module:engine/view/observer/bubblingemittermixin~BubblingEmitter} interface. This is the special interface that is implemented by the {@link module:engine/view/observer/bubblingemittermixin~BubblingEmitterMixin}. It provides a bubbling of the events over the virtual DOM tree. It is different from the bubbling that you know from the browser's DOM tree events bubbling. You don't register listeners on the exact instances of the elements in the view document tree, instead you can register handlers for the `context` (for example the {@link module:engine/view/element~Element view element} name, the virtual `'$capture'`, `'$text'`, `'$root'`, `'$document'` contexts, or by providing a callback that matches some view nodes).

### Listening to bubbling events

Listeners registered in the context of the view element names:
```js
this.listenTo( view.document, 'enter', ( evt, data ) => {
	// ...
}, { context: 'blockquote' } );

this.listenTo( view.document, 'enter', ( evt, data ) => {
	// ...
}, { context: 'li' } );
```

Listeners registered in the virtual contexts:
```js
this.listenTo( view.document, 'arrowKey', ( evt, data ) => {
	// ...
}, { context: '$text', priority: 'high' } );

this.listenTo( view.document, 'arrowKey', ( evt, data ) => {
	// ...
}, { context: '$root' } );

this.listenTo( view.document, 'arrowKey', ( evt, data ) => {
	// ...
}, { context: '$capture' } );
```

Listeners registered in the context of custom callback function:
```js
import { isWidget } from '@ckeditor/ckeditor5-widget/src/utils';

this.listenTo( view.document, 'arrowKey', ( evt, data ) => {
	// ...
}, { context: isWidget } );

this.listenTo( view.document, 'arrowKey', ( evt, data ) => {
	// ...
}, { context: isWidget, priority: 'high' } );
```

**Note**: Without specifying `context`, events are bound to the `'$document'` context.

### Bubbling event flow

Bubbling always starts from the virtual `'$capture'` context, all listeners attached for that context are triggered in the order of their priorities. Then the real bubbling starts from the deeper selection position end (either anchor or focus). If the first node accepts `'$text'` then all listeners for that context are triggered. If selected element matches the custom matcher callback, then those listeners are triggered. After calling listeners, and if an event was not stopped, events for its parent are triggered. This is continued until some listener stops the event or the `'$root'` element is reached. At the end the `'$document'` handlers are triggered. In all contexts listeners can be registered at desired priorities.

Example flow for selection in text:
```
<blockquote>
    <p>
        Foo[]bar
    </p>
</blockquote>
```
Fired events on contexts:
1. `'$capture'`
2. `'$text'`
3. `'p'`
4. `'blockquote'`
5. `'$root'`
6. `'$document'`

Example flow for selection on an element (i.e., Widget):
```
<blockquote>
    <p>
        Foo
        [<widget/>]
        bar
    </p>
</blockquote>
```

Fired events on contexts:
1. `'$capture'`
2. *widget* (custom matcher)
3. `'p'`
4. `'blockquote'`
5. `'$root'`
6. `'$document'`

Complex example:
```
<blockquote>
    <figure class="table">
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

Fired events on contexts:
1. `'$capture'`
2. `'$text'`
3. `'p'`
4. `'td'`
5. `'tr'`
6. `'table'`
7. `'figure'`
8. *widget* (custom matcher)
9. `'blockquote'`
10. `'$root'`
11. `'$document'`

### `BubblingEventInfo`

Some events are triggered not as a standard `EventInfo` but as a {@link module:engine/view/observer/bubblingeventinfo~BubblingEventInfo `BubblingEventInfo`} that is an extension that provides current {@link module:engine/view/observer/bubblingeventinfo~BubblingEventInfo#eventPhase} and {@link module:engine/view/observer/bubblingeventinfo~BubblingEventInfo#currentTarget}.

Currently, that information is available for following events:
* {@link module:engine/view/document~Document#event:enter `enter`},
* {@link module:engine/view/document~Document#event:delete `delete`},
* {@link module:engine/view/document~Document#event:arrowKey `arrowKey`}.

So the events from the above example would be extended with the following `eventPhase` data:
1. `'$capture'` - *capturing*
2. `'$text'` - *atTarget*
3. `'p'` - *bubbling*
4. `'td'` - *bubbling*
5. `'tr'` - *bubbling*
6. `'table'` - *bubbling*
7. `'figure'` - *bubbling*
8. *widget* - *bubbling*
9. `'blockquote'` - *bubbling*
10. `'$root'` - *bubbling*
11. `'$document'` - *bubbling*

For the example with widget selected:
```
<blockquote>
    <p>
        Foo
        [<widget/>]
        bar
    </p>
</blockquote>
```

1. `'$capture'` - *capturing*
2. *widget* - *atTarget*
3. `'p'` - *bubbling*
4. `'blockquote'` - *bubbling*
5. `'$root'` - *bubbling*
6. `'$document'` - *bubbling*
