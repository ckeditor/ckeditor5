---
category: builds-migration
order: 20
---

# Migration to CKEditor 5 v27.0.0

For the entire list of changes introduced in version 27.0.0, see the [changelog for CKEditor 5 v27.0.0](https://github.com/ckeditor/ckeditor5/blob/master/CHANGELOG.md). **TODO** update link to the exact version anchor.

Listed below are the most important changes that require your attention when upgrading to CKEditor 5 v27.0.0.

## Clipboard input pipeline integration

Starting from v27.0.0, the {@link module:clipboard/clipboard~Clipboard `Clipboard` plugin} is no longer firing the `inputTransformation` events. The code of this feature was refactored and split into:

* {@link module:clipboard/clipboardpipeline~ClipboardPipeline `ClipboardPipeline` plugin}, 
* {@link module:clipboard/pasteplaintext~PastePlainText `PastePlainText` plugin}, 
* {@link module:clipboard/dragdrop~DragDrop `DragDrop` plugin}. 
  
The {@link module:clipboard/clipboard~Clipboard `Clipboard` plugin} became a "glue" plugin that loads ones listed above. 

From v27.0.0 the {@link module:clipboard/clipboardpipeline~ClipboardPipeline `ClipboardPipeline` plugin} is responsible for firing the {@link module:clipboard/clipboardpipeline~ClipboardPipeline#event:inputTransformation `ClipboardPipeline#inputTransformation`} event and also the new {@link module:clipboard/clipboardpipeline~ClipboardPipeline#event:contentInsertion `ClipboardPipeline#contentInsertion`} event.

The {@link module:engine/view/document~Document#event:clipboardInput `view.Document#clipboardInput`} and {@link module:clipboard/clipboardpipeline~ClipboardPipeline#event:inputTransformation `ClipboardPipeline#inputTransformation`} events should not be fired or stopped in your feature code. The `data.content` property should be assigned to override the default content instead. You can stop this event only if you want to completely disable pasting/dropping of some specific content.

You can read about the whole input pipeline in details in {@link framework/guides/deep-dive/clipboard#input-pipeline clipboard pipeline guide}.

## The `view.Document` event bubbling

In v27.0.0 we introduced bubbling of the {@link module:engine/view/document~Document `view.Document`} events, similar to how bubbling works in the DOM. That allowed us to reprioritize many listeners that previously had to rely on the `priority` property. However, it means that existing listeners that use priorities may now be executed at a wrong time (in the different order). The listeners to such events should be reviewed in terms of when they should be executed (in what context/element/phase).

Read more about bubbling events in the {@link framework/guides/deep-dive/event-system#bubbling-events event system guide}.

### The `delete` event

Previously, the {@link module:engine/view/document~Document#event:delete `delete`} event was handled by different features on the different priority levels to ensure the precedence of for example list item over the block quote that is wrapping it. From v27.0.0 this precedence is handled by the events bubbling over the view document tree. Listeners registered for the deeper nested view elements are now triggered first, and then listeners for elements closer to the root element.     

The `delete` listeners:

| **Feature**        | **Priority before v27** | **Event context from v27** |
| ---                | ---                     | ---                        |
| List               | High + 10               | `li` @ Normal              |
| BlockQuote         | High + 5                | `blockquote` @ Normal      |
| Widget type around | High + 1                | *isWidget* @ Normal        |
| Widget             | High                    | `$root` @ Normal           |
| Delete             | Normal                  | `$document` @ Low          |

Looking at this table, even if your listener was listening on the `highest` priority it will be triggered just before the last handler that is listening on the `$document` at the `low` priority because the `$document` is the default context for registering listeners.

Example changes for block quote integration:
```js
// Old code.
this.listenTo( view.document, 'delete', ( evt, data ) => {
    ...
}, { priority: priorities.high + 5 } );

// New code.
this.listenTo( view.document, 'delete', ( evt, data ) => {
	...
}, { context: 'blockquote' } );
```

Example changes for widget:
```js
// Old code.
this.listenTo( view.document, 'enter', ( evt, domEventData ) => {
    ...
} );

// New code.
this.listenTo( view.document, 'enter', ( evt, domEventData ) => {
	// This event could be triggered from inside the widget but we are interested
	// only when the widget is selected itself.
	if ( evt.eventPhase != 'atTarget' ) {
		return;
	}
	
	...
    
}, { context: isWidget } );
```

You should review your integration if some of your listeners were attached to the `delete` event.

### The `enter` event

The case for the {@link module:engine/view/document~Document#event:enter `enter`} event is similar to the `delete` event. 

You should review your integration if some of your listeners were attached to the `enter` event.

### The `arrowKey` event

This is a new event type that is introduced by the {@link module:engine/view/observer/arrowkeysobserver~ArrowKeysObserver}. It listens to the `keydown` events at the `normal` priority and fires the {@link module:engine/view/document~Document#event:arrowKey `arrowKey`} events that bubble down the view document tree. This is similar behavior to the {@link module:enter/enterobserver~EnterObserver} and {@link module:typing/deleteobserver~DeleteObserver}.

You should review your integration if some of your listeners were attached to the `keydown` event to handle arrow key presses.

