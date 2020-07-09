---
category: framework-deep-dive-ui
menu-title: Widget internals
---

# Deep dive into widget internals

## Disabling the widget type around feature

The {@link module:widget/widgettypearound~WidgetTypeAround `WidgetTypeAround`} plugin allows users to type around widgets where normally it is impossible to place the caret due to limitations of web browsers. Although this feature boosts the productivity, some integrations may not want or need it, for instance:

* when the UI of the feature collides with the integration,
* when typing outside widgets should be impossible (content made exclusively of widgets),
* when certain widgets have a fixed location in the document that should never change.

In the sections that follows, you will learn how to configure the editor to address these specific cases.

### Hiding the buttons that insert paragraphs

{@img assets/img/framework-deep-dive-widget-type-around-buttons.gif A screenshot showing the location of the buttons that insert paragraphs around widgets.}

The easiest way to get rid of the type around buttons is to hide them using CSS. Put the following code snippet anywhere in your application and the buttons will no longer bother the users:

```css
.ck.ck-editor__editable .ck-widget .ck-widget__type-around__button {
	display: none;
}
```

If you only want to customize the type around buttons you can use the same CSS selector to modify their look or the position.

<info-box hint>
	Hiding the type around buttons does not disable the feature. Users will still be able to activate the caret before or after individual widgets using the keyboard and start typing. [Learn how to disable the entire feature](#disabling-the-entire-feature).
</info-box>

### Disabling the entire feature

Although the {@link module:widget/widgettypearound~WidgetTypeAround `WidgetTypeAround`} plugin is an integral part of the {@link module:widget/widget~Widget widget} sub–system and loaded by default whenever an editor feature uses widgets (for instance, {@link features/image images} or {@link features/table tables}), you can still disable on the fly. Disabling the feature will both hide the buttons in the widgets and disable other behaviors, for instance:

* the caret will not be rendered before or after a widget when a user navigates the document using arrow keys,
* the <kbd>Enter</kbd> and <kbd>Shift</kbd>+<kbd>Enter</kbd> keystrokes will no longer insert paragraphs if pressed when a widget is selected.

Use the {@link module:core/plugin~Plugin#forceDisabled `forceDisabled()`} method of the plugin to disable it on the fly like in the snippet below:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// ...
	} )
	.then( editor => {
		const widgetTypeAroundPlugin = editor.plugins.get( 'WidgetTypeAround' );

		// Disable the WidgetTypeAround plugin.
		widgetTypeAroundPlugin.forceDisabled( 'MyApplication' );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
```

<info-box hint>
	You can always re–enable the plugin using the following snippet
	```js
	widgetTypeAroundPlugin.clearForceDisabled( 'MyApplication' );
	```
	Please refer to the {@link module:core/plugin~Plugin#clearForceDisabled API documentation} to learn more.
</info-box>
