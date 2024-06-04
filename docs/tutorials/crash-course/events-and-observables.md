---
category: crash-course
order: 70
meta-title: CKEditor 5 crash course - Events and observables | CKEditor 5 Documentation
modified_at: 2023-08-16
---

# Events and observables

## Reactivity

In the previous chapter of this tutorial, we wrote the following code to bind selected properties between the button and command objects:

```js
button.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );
```

This line allowed us to make the button reactive and reflect the state of the command. For example, if the command is not allowed to run, the corresponding button should not be clickable.

The reactivity described above is enabled by the {@link framework/deep-dive/observables observables} used in the CKEditor framework. Observables are objects that fire an event when their properties change. These changes can be observed and acted upon, which is exactly what we did with the `highlight` button.

Under the hood, observables use an even more powerful {@link framework/deep-dive/event-system event system} similar to the one in the DOM.

## Observables

Let's analyze the code we wrote to create the reactive button.

### Creating an observable

Many classes in the editor are already observables. This includes the {@link module:core/editor/editor~Editor `Editor`} class, the {@link module:core/command~Command `Command`} class, all UI elements that extend the {@link module:ui/view~View `View`} class and many more.

Since the `ButtonView` class is already an observable, we did not have to do anything other than create a new instance.

```js
const button = new ButtonView( locale );
```

Then, we called the `.set()` method to update a few button properties.

```js
button.set( {
	label: t( 'Highlight' ),
	withText: true,
	tooltip: true,
	isToggleable: true
} );
```

If you want to make a custom class an observable, see the {@link framework/deep-dive/observables Observables} guide.

### Reacting to user input

Next, we registered a callback that will be called whenever the `execute` event (bound to the `click` event in the DOM) is fired:

```js
button.on( 'execute', () => {
	editor.execute( 'highlight' );
	editor.editing.view.focus();
} );
```

Clicking the button sets the focus on that button, making it impossible for the user to continue typing without clicking the editing view. The `editor.editing.view.focus()` line returns the focus to the editing view, allowing the user to continue typing without interruption.

To learn more about focus, see the {@link framework/deep-dive/focus-tracking Focus tracking} document.

### Binding properties

Finally, because the button and the command are both observables, we can bind selected properties between them:

```js
button.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );
```

The above line will attach listeners that listen for changes of the `value` and `isEnabled` properties of the command, and update the `isOn` and`isEnabled` button properties accordingly.

This is what the code would look like if you used the event system directly, without using the `bind(...).to(...)` abstraction provided by the observables:

```js
command.on( 'change:value', ( event, propName, newValue, oldValue ) => {
	button.isOn = newValue;
} );

command.on( 'change:isEnabled', ( event, propName, newValue, oldValue ) => {
	button.isEnabled = newValue;
} );
```

## What's next

If you want to learn more about events and observables, see the {@link framework/deep-dive/observables Observables} and {@link framework/deep-dive/event-system Event system} documents.

Otherwise, go to the next chapter where you will {@link tutorials/crash-course/keystrokes learn more about handling keystrokes}, which also uses the CKEditor's event system.
