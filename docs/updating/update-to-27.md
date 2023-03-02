---
category: update-guides
menu-title: Update to v27.x
order: 97
---

<info-box>
	When updating your CKEditor 5 installation, make sure **all the packages are the same version** to avoid errors.

	For custom builds, you may try removing the `package-lock.json` or `yarn.lock` files (if applicable) and reinstalling all packages before rebuilding the editor. For best results, make sure you use the most recent package versions.
</info-box>

# Update to CKEditor 5 v27.x

## Update to CKEditor 5 v27.1.0

For the entire list of changes introduced in version 27.1.0, see the [release notes for CKEditor 5 v27.1.0](https://github.com/ckeditor/ckeditor5/releases/tag/v27.1.0).

Listed below are the most important changes that require your attention when upgrading to CKEditor 5 v27.1.0.

### Disallowing nesting tables

Prior to version 27.1.0 inserting a table into another table was not allowed.

If you wish to bring back this restriction, see the {@link features/tables#disallow-nesting-tables#disallow-nesting-tables Disallow nesting tables} section of the table feature guide.

### Disallowing nesting block quotes

Prior to version 27.1.0 inserting a block quote into another block quote was not allowed.

If you wish to bring back this restriction, see the {@link features/block-quote#disallow-nesting-block-quotes Disallow nesting block quotes} section in the block quote feature guide.

## Update to CKEditor 5 v27.0.0

For the entire list of changes introduced in version 27.0.0, see the [release notes for CKEditor 5 v27.0.0](https://github.com/ckeditor/ckeditor5/releases/tag/v27.0.0).

Listed below are the most important changes that require your attention when upgrading to CKEditor 5 v27.0.0.

### Clipboard input pipeline integration

Starting from v27.0.0, the {@link module:clipboard/clipboard~Clipboard `Clipboard`} plugin is no longer firing the `inputTransformation` events. The code of this feature was refactored and split into:

* the {@link module:clipboard/clipboardpipeline~ClipboardPipeline `ClipboardPipeline`} plugin,
* the {@link module:clipboard/pasteplaintext~PastePlainText `PastePlainText`} plugin,
* the {@link module:clipboard/dragdrop~DragDrop `DragDrop`} plugin.

The {@link module:clipboard/clipboard~Clipboard `Clipboard`} plugin became a "glue" plugin that loads ones listed above.

From v27.0.0, the {@link module:clipboard/clipboardpipeline~ClipboardPipeline `ClipboardPipeline`} plugin is responsible for firing the {@link module:clipboard/clipboardpipeline~ClipboardPipeline#event:inputTransformation `ClipboardPipeline#inputTransformation`} event and also the new {@link module:clipboard/clipboardpipeline~ClipboardPipeline#event:contentInsertion `ClipboardPipeline#contentInsertion`} event.

The {@link module:engine/view/document~Document#event:clipboardInput `view.Document#clipboardInput`} and {@link module:clipboard/clipboardpipeline~ClipboardPipeline#event:inputTransformation `ClipboardPipeline#inputTransformation`} events should not be fired nor stopped in your feature code. The `data.content` property should be assigned to override the default content instead. You can stop this event only if you want to completely disable pasting/dropping of some specific content.

You can read about the whole input pipeline in details in the {@link framework/deep-dive/clipboard#input-pipeline Clipboard deep-dive guide}.

### The `view.Document` event bubbling

CKEditor v27.0.0 introduces bubbling of the {@link module:engine/view/document~Document `view.Document`} events, similar to how bubbling works in the DOM. This allowed us to re-prioritize many listeners that previously had to rely on the `priority` property. However, it means that existing listeners that use priorities may now be executed at a wrong time (in the different order). These listeners should be reviewed in terms of when they should be executed (in what context/element/phase).

Read more about bubbling events in the {@link framework/deep-dive/event-system#view-events-bubbling Event system guide}.

#### The `delete` event

Previously, the {@link module:engine/view/document~Document#event:delete `delete`} event was handled by different features on different priority levels to, for example, ensure the precedence of the list item over the block quote that is wrapping it. From v27.0.0 on, this precedence is handled by the events bubbling over the view document tree. Listeners registered for the view elements deeper in the view tree are now triggered before listeners for elements closer to the {@link module:engine/view/rooteditableelement~RootEditableElement root element}.

Take a look at the list of `delete` listeners across the core editor features and their {@link module:utils/priorities~PriorityString priorities}:

| **Feature**        | **Priority before v27** | **Event context from v27** |
| ---                | ---                     | ---                        |
| List               | High + 10               | `li` @ Normal              |
| BlockQuote         | High + 5                | `blockquote` @ Normal      |
| Widget type around | High + 1                | *isWidget* @ Normal        |
| Widget             | High                    | `$root` @ Normal           |
| Delete             | Normal                  | `$document` @ Low          |

Looking at this table, even if your listener was listening on the `highest` priority, it will be triggered just before the last handler that is listening on the `$document` at the `low` priority because the `$document` is the {@link framework/deep-dive/event-system#listening-to-bubbling-events default context} for registering listeners.

Here is an example of changes you may need for proper integration with the block quote feature:

```js
// Old code.
this.listenTo( view.document, 'delete', ( evt, data ) => {
	// ...
}, { priority: priorities.high + 5 } );

// New code.
this.listenTo( view.document, 'delete', ( evt, data ) => {
	// ...
}, { context: 'blockquote' } );
```

We recommend reviewing your integration if some of your listeners were attached to the `delete` event.

#### The `enter` event

The case for the {@link module:engine/view/document~Document#event:enter `enter`} event is similar to the `delete` event.

Here is an example of changes you may need for proper integration with the widget system:

```js
// Old code.
this.listenTo( view.document, 'enter', ( evt, data ) => {
	// ...
} );

// New code.
this.listenTo( view.document, 'enter', ( evt, data ) => {
	// This event could be triggered from inside the widget but we are interested
	// only when the widget itself is selected.
	if ( evt.eventPhase != 'atTarget' ) {
		return;
	}

	// ...

}, { context: isWidget } );
```

We recommend reviewing your integration if some of your listeners were attached to the `enter` event.

#### The `arrowKey` event

This is a new event type that is introduced by the {@link module:engine/view/observer/arrowkeysobserver~ArrowKeysObserver}. It listens to the `keydown` events at the `normal` priority and fires the {@link module:engine/view/document~Document#event:arrowKey `arrowKey`} events that bubble down the view document tree. This is similar behavior to the {@link module:enter/enterobserver~EnterObserver} and {@link module:typing/deleteobserver~DeleteObserver}.

You should review your integration if some of your listeners were attached to the `keydown` event to handle arrow key presses.
