---
category: framework-deep-dive
---

# Event system

{@link module:utils/emittermixin~Emitter Emitters} are objects that can fire events. They also provide means to bind into other emitters' events.

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

## Firing events

Once you mix the {@link module:utils/emittermixin~EmitterMixin} into your class you can fire events in the following way:

```js
this.fire( 'eventName', ...args );
```

All the listeners that are bound to that event will receive passed arguments by the reference.

**Note**: Most base classes (like the {@link module:core/command~Command} or the {@link module:core/plugin~Plugin}) already are {@link module:utils/emittermixin~Emitter emitters}.

### Event stopping

It is sometimes useful to know if an event was stopped by any of the listeners. There is an alternative way of firing event just for that:

```js
import EventInfo from '@ckeditor/ckeditor5-utils/src/eventinfo';

// Prepare the event info...
const eventInfo = new EventInfo( this, 'eventName' );

// ...and fire the event.
this.fire( eventInfo, ...args );

// Here we can check if this event was stopped.
if ( eventInfo.stop.called ) {
	// Event was stopped.
}
```

Note that {@link module:utils/eventinfo~EventInfo} expects source object in the first parameter as an origin of the event.

### Event return value

Listeners can set the {@link module:utils/eventinfo~EventInfo#return `eventInfo.return`} field, so the value is returned from the {@link module:utils/emittermixin~Emitter#fire `fire()`} call. 

```js
emitter.on( 'eventName', ( eventInfo, ...args ) => {
	eventInfo.return = 123;
} );

const result = emitter.fire( 'eventName', ...args );

console.log( result ); // -> 123
```

### Event namespaces

Event system supports namespaced events, so you could fire:

```js
this.fire( 'foo:bar:eventName', ...args );
```

Then listeners can be bound to a specific event or the whole namespace:

```js
this.on( 'foo', () => { ... } );
this.on( 'foo:bar', () => { ... } );
this.on( 'foo:bar:eventName', () => { ... } );
```

**Note**: Listeners registered on the same priority will be fired in the order of the registration (no matter if listening to a whole namespace or to the specific event).

## Listening to events

You could attach a listener directly on the emitter object:

```js
emitter.on( 'eventName', ( eventInfo, ...args ) => { ... } );
```

but this way you would need to keep the reference to the handler function to be able to unregister that listener:

```js
emitter.off( 'eventName', handler );
```

There is an easier way, you could use {@link module:utils/emittermixin~Emitter#listenTo `listenTo()`} method from one emitter and bind listener to the other emitter:

```js
foo.listenTo( bar, 'eventName', ( eventInfo, ...args ) => { ... } );
```

This way you could easily detach the `foo` from `bar` simply by {@link module:utils/emittermixin~Emitter#stopListening `stopListening()`}.  

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

**Note**: The above detaches only the listeners that were attached from `foo` on `bar`, all other listeners are not affected.

<info-box>
    The {@link module:utils/emittermixin~Emitter#on `on()`} and {@link module:utils/emittermixin~Emitter#off `off()`} methods are shorthands for {@link module:utils/emittermixin~Emitter#listenTo `listenTo( this, ... )`} and {@link module:utils/emittermixin~Emitter#stopListening `stopListening( this, ... )`} (emitter is bound on itself). 
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

## Bubbling events
