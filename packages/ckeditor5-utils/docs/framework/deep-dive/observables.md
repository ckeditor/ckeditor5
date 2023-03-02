---
category: framework-deep-dive
---

# Observables

{@link module:utils/observablemixin~Observable Observables} are objects which have properties that can be observed. That means when the value of such property changes, an event is fired by the observable and the change can be reflected in other pieces of the code that listen to that event.

Observables are common building blocks of the {@link framework/index CKEditor 5 Framework}. They are particularly popular in the UI, the {@link module:ui/view~View `View`} class and its subclasses  benefiting from the observable interface the most: it is the {@link framework/architecture/ui-library#interaction templates bound to the observables} what makes the user interface dynamic and interactive. Some of the basic classes like {@link module:core/editor/editor~Editor `Editor`} or {@link module:core/command~Command `Command`} are observables too.

Any class can become observable; all you need to do is mix the {@link module:utils/observablemixin~ObservableMixin} into it:

```js
import ObservableMixin from '@ckeditor/ckeditor5-utils/src/observablemixin';
import mix from '@ckeditor/ckeditor5-utils/src/mix';

class AnyClass {
	// Any class definition.
	// ...
}

mix( AnyClass, ObservableMixin );
```

Observables are useful when it comes to managing the state of the application, which can be dynamic and, more often than not, centralized and shared between components of the application. One observable can also propagate its state (or its part) to another using [property bindings](#property-bindings).

Observables can also [decorate their methods](#decorating-object-methods) which makes it possible to control their execution using event listeners, giving external code some control over their behavior.

<info-box>
	Since the observables are just another layer on top of the event {@link module:utils/emittermixin~EmitterMixin emitters}, check out the {@link framework/deep-dive/event-system event system deep dive guide} to learn more about the advanced usage of events with some additional examples.
</info-box>

## Making properties observable

Having mixed the {@link module:utils/observablemixin~ObservableMixin} into your class, you can define observable properties. To do that, use the {@link module:utils/observablemixin~ObservableMixin#set `set()` method}.

Let's create a simple UI view (component) named `Button` with a couple of properties and see what they look like:

```js
class Button extends View {
	constructor() {
		super();

		// This property is not observable.
		// Not all properties must be observable, it's always up to you!
		this.type = 'button';

		const bind = this.bindTemplate;

		// this.label is observable but undefined.
		this.set( 'label' );

		// this.isOn is observable and false.
		this.set( 'isOn', false );

		// this.isEnabled is observable and true.
		this.set( 'isEnabled', true );

		// More observable's properties.
		// ...
	}
}
```

Note that because `Button` extends the {@link module:ui/view~View `View`} class (which is already observable), you do not need to mix the `ObservableMixin`.

<info-box info>
	The `set()` method can accept an object of key/value pairs to shorten the code. Knowing that, making properties observable can be as simple as:

	```js
	this.set( {
		label: undefined,
		isOn: false,
		isEnabled: true
	} );
	```
</info-box>

Finally, let's create a new view and see how it communicates with the world.

Each time the `label` property changes, the view fires the `change:label` event containing information about its state in the past and the new value. The `change:isEnabled` and `change:isOn` events will be fired for changes of `isEnabled` and `isOn`, respectively.

```js
const view = new Button();

view.on( 'change:label', ( evt, propertyName, newValue, oldValue ) => {
    console.log(
        `#${ propertyName } has changed from "${ oldValue }" to "${ newValue }"`
    );
} )

view.label = 'Hello world!'; // -> #label has changed from "undefined" to "Hello world!"
view.label = 'Bold'; // -> #label has changed from "Hello world!" to "Bold"

view.type = 'submit'; // Changing a regular property fires no event.
```

The events fired by the view are used to update the DOM and make the component dynamic. Let's give our view some template and bind it to the observable properties we created.

<info-box>
	You can learn more about the UI of the editor and template system in the dedicated {@link framework/architecture/ui-library#templates guide}.
</info-box>

```js
class Button extends View {
	constructor() {
		super();

		// Previously defined properties.
		// ...

		// This template will have the following symbolic representation in DOM:
		//
		// 	<button class="[ck-disabled] ck-[on|off]" type="button">
		// 		{{ this.label }}
		// 	</button>
		//
		this.setTemplate( {
			tag: 'button',
			attributes: {
				class: [
					// The 'ck-on' and 'ck-off' classes toggle according to the #isOn property.
					bind.to( 'isOn', value => value ? 'ck-on' : 'ck-off' ),

					// The 'ck-enabled' class appears when the #isEnabled property is false.
					bind.if( 'isEnabled', 'ck-disabled', value => !value )
				],
				type: this.type
			},
			children: [
				{
					// The text of the button is bound to the #label property.
					text: bind.to( 'label' )
				}
			]
		} );
	}
}
```

Because `label`, `isOn`, and `isEnabled` are observables, any change will be immediately reflected in DOM:

```js
const button = new Button();

// Render the button to create its #element.
button.render();

button.label = 'Bold';     // <button class="ck-off" type="button">Bold</button>
button.isOn = true;        // <button class="ck-on" type="button">Bold</button>
button.label = 'B';        // <button class="ck-on" type="button">B</button>
button.isOff = false;      // <button class="ck-off" type="button">B</button>
button.isEnabled = false;  // <button class="ck-off ck-disabled" type="button">B</button>
```

## Property bindings

One observable can also propagate its state (or part of it) to another observable to simplify the code, e.g. to avoid numerous `change:property` event listeners. To start binding object properties, make sure both objects (classes) mix the {@link module:utils/observablemixin~ObservableMixin}, then use the {@link module:utils/observablemixin~ObservableMixin#bind `bind()`} method to create the binding.

### Simple bindings

Let's use our bold button instance from the previous chapter and bind it to the bold command. That will let the button use certain command properties and automate the user interface in just a couple of lines.

The bold command is an actual command of the editor (registered by the {@link module:basic-styles/bold/boldediting~BoldEditing `BoldEditing`}) and offers two observable properties: `value` and `isEnabled`. To get the command, use `editor.commands.get( 'bold' )`.

Note that both `Button` and {@link module:core/command~Command `Command`} classes are {@link module:utils/observablemixin~Observable observable}, which is why we can bind their properties.

```js
const button = new Button();
const command = editor.commands.get( 'bold' );
```

Any "decent" button must update its look when the command becomes disabled. A simple property binding doing that could look as follows:

```js
button.bind( 'isEnabled' ).to( command );
```

After that:

* `button.isEnabled` **instantly equals** `command.isEnabled`,
* whenever `command.isEnabled` changes, `button.isEnabled` will immediately reflect its value,
* because the template of the button has its class bound to `button.isEnabled`, the DOM element of the button will also be updated.

Note that `command.isEnabled` **must** be defined using the `set()` method for the binding to be dynamic. In this case we are lucky because {@link module:core/command~Command#isEnabled `isEnabled`} is a standard observable property of every command in the editor. But keep in mind that when you create your own observable class, using `set()` method is the only way to define observable properties.

#### Renaming properties

Now let's dive into the `bind( /* ... */ ).to( /* ... */ )` syntax for a minute. As a matter of fact, the last example corresponds to the following code:

```js
const button = new Button();
const command = editor.commands.get( 'bold' );

button.bind( 'isEnabled' ).to( command, 'isEnabled' );
```

You probably noticed the `to( /* ... */ )` interface which helps specify the name of the property (or just "rename" the property in the binding).

Both `Button` and `Command` class share the same `isEnabled` property, which allowed us to shorten the code. But if we decided to bind the `Button#isOn` to the `Command#value`, the code would be as follows:

```js
button.bind( 'isOn' ).to( command, 'value' );
```

The property has been "renamed" in the binding and from now on, whenever `command.value` changes, the value of `button.isOn` will reflect it.

#### Processing a property value

Another use case is processing the bound property value, for instance, when a button should be disabled only if certain conditions are met. Passing a callback as the third parameter allows implementing a custom logic.

In the example below, the `isEnabled` property will be set to `true` only when `command.value` equals `'heading1'`.

```js
const command = editor.commands.get( 'heading' );
button.bind( 'isOn' ).to( command, 'value', value => value === 'heading1' );
```

### Binding multiple properties

It is possible to bind more that one property at a time to simplify the code:

```js
const button = new Button();
const command = editor.commands.get( 'bold' );

button.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );
```

which is the same as:

```js
button.bind( 'isOn' ).to( command, 'value' );
button.bind( 'isEnabled' ).to( command, 'isEnabled' );
```

In the above binding, the value of `button.isEnabled` will reflect `command.isEnabled` and the value of `button.isOn` will reflect `command.value`.

Note that the `value` property of the command has also been "renamed" in the binding like in the [previous example](#renaming-properties).

### Binding with multiple observables

The binding can include more than one observable, combining multiple properties in a custom callback function. Let's create a button that gets enabled only when the `command` is enabled and the {@link module:engine/view/document~Document editing document} (also an `Observable`) is focused:

```js
const button = new Button();
const command = editor.commands.get( 'bold' );
const editingDocument = editor.editing.view.document;

button.bind( 'isEnabled' ).to( command, 'isEnabled', editingDocument, 'isFocused',
	( isCommandEnabled, isDocumentFocused ) => isCommandEnabled && isDocumentFocused );
```

The binding makes the value of `button.isEnabled` depend both on `command.isEnabled` and `editingDocument.isFocused` as specified by the function: both must be `true` for the button to become enabled.

### Binding with an array of observables

It is possible to bind the same property to an array of observables. Let's bind our button to multiple commands so that each and every one must be enabled for the button to become enabled:

```js
const button = new Button();
const commands =  [ commandA, commandB, commandC ];

button.bind( 'isEnabled' ).toMany( commands, 'isEnabled', ( isAEnabled, isBEnabled, isCEnabled ) => {
	return isAEnabled && isBEnabled && isCEnabled;
} );
```

The binding can be simplified using the spread operator (`...`) and the `Array.every()` method:

```js
const commands =  [ commandA, commandB, commandC ];

button.bind( 'isEnabled' ).toMany( commands, 'isEnabled', ( ...areEnabled ) => {
	return areEnabled.every( isCommandEnabled => isCommandEnabled );
} );
```

This kind of binding can be useful e.g. when a button opens a dropdown containing a number of other commands' buttons and it should be disabled when none of the commands is enabled.

### Releasing the bindings

If you don't want your object's properties to be bound any longer, you can use the {@link module:utils/observablemixin~ObservableMixin#unbind `unbind()`} method.

You can specify the names of the properties to selectively unbind them

```js
const button = new Button();
const command = editor.commands.get( 'bold' );

button.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );

// More bindings.
// ...

// From now on, button#isEnabled is no longer bound to the command.
button.unbind( 'isEnabled' );
```

or you can dismiss all bindings by calling the method without arguments

```js
const button = new Button();
const command = editor.commands.get( 'bold' );

button.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );

// More bindings.
// ...

// Both #isEnabled and #isOn properties are independent back again.
// They will retain the last values determined by the bindings, though.
button.unbind();
```

## Decorating object methods

Decorating object methods transforms them into event–driven ones without changing their original behavior.

When a method is decorated, an event of the same name is created and fired each time the method is executed. By listening to the event it is possible to cancel the execution, change the arguments or the value returned by the method. This offers an additional flexibility, e.g. giving a third–party code some way to interact with core classes that decorate their methods.

Decorating is possible using the {@link module:utils/observablemixin~ObservableMixin#decorate `decorate()`} method. Let's decorate a `focus` method of a `Button` class we created in the [previous chapters](#making-properties-observable) and see what if offers:

```js
class Button extends View {
	constructor() {
		// Setting the template and bindings.
		// ...

		this.decorate( 'focus' );
	}

	/**
	 * Focuses the button.
	 *
	 * @param {Boolean} force When `true`, the button will be focused again, even if already
	 * focused in DOM.
	 * @returns {Boolean} `true` when the DOM element was focused in DOM, `false` otherwise.
	 */
	focus( force ) {
		console.log( `Focusing button, force argument="${ force }"` );

		// Unless forced, the button will only focus when not already focused.
		if ( force || document.activeElement != this.element ) {
			this.element.focus();

			return true;
		}

		return false;
	}
}
```

### Cancelling the execution

Because the `focus()` method is now event–driven, it can be controlled externally. E.g. the focusing could be stopped for certain arguments. Note the `high` listener {@link module:utils/priorities~PriorityString priority} used to intercept the default action:

```js
const button = new Button();

// Render the button to create its #element.
button.render();

// The logic controlling the behavior of the button.
button.on( 'focus', ( evt, [ isForced ] ) => {
	// Disallow forcing the focus of this button.
	if ( isForced === true ) {
		evt.stop();
	}
}, { priority: 'high' } );

button.focus(); // -> 'Focusing button, force argument="undefined"'
button.focus( true ); // Nothing is logged, the execution has been stopped.
```

### Changing the returned value

It is possible to control the returned value of a decorated method using an event listener. The returned value is passed in the event data as a `return` property:

```js
const button = new Button();

// Render the button to create its #element.
button.render();

// The logic controlling the behavior of the button.
button.on( 'focus', ( evt, [ isForced ] ) => {
	// Pretend the button wasn't focused if the focus was forced.
	if ( isForced === true ) {
		evt.return = false;
	}
} );

console.log( button.focus() ); // -> true
console.log( button.focus( true ) ); // -> false
```

### Changing arguments on the fly

Just like the returned value, the arguments passed to the method can be changed in the event listener. Note the `high` listener {@link module:utils/priorities~PriorityString priority} of the used to intercept the default action:


```js
const button = new Button();

// Render the button to create its #element.
button.render();

// The logic controlling the behavior of the button.
button.on( 'focus', ( evt, args ) => {
	// Always force the focus.
	args[ 0 ] = true;
}, { priority: 'high' } );

button.focus(); // -> 'Focusing button, force="true"'
button.focus( true ); // -> 'Focusing button, force="true"'
```
