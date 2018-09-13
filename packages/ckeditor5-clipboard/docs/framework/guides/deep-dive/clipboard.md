---
category: framework-deep-dive
---

# Clipboard

The clipboard feature. Currently, it is responsible for intercepting the `paste` and `drop` events and passing the pasted content through the clipboard pipeline in order to insert it into the editor's content. It also handles the `cut` and `copy` events to fill the native clipboard with serialized editor's data.

## Input pipeline

The clipboard feature creates the clipboard input pipeline which allows to process clipboard content before it gets inserted into the editor. The pipeline consists of three events on which
a feature can listen in order to modify or totally override the default behavior.

### 1. On {@link module:engine/view/document~Document#event:paste `view.Document#paste`} and {@link module:engine/view/document~Document#event:drop `view.Document#drop`}

The default action is to:

1. get HTML or plain text from the clipboard,
2. prevent the default action of the native `paste` or `drop` event,
3. fire {@link module:engine/view/document~Document#event:clipboardInput `view.Document#clipboardInput`} with a {@link module:clipboard/datatransfer~DataTransfer `dataTransfer`} property.
4. fire {@link module:clipboard/clipboard~Clipboard#event:inputTransformation `view.Document#inputTransformation`} with a `data` containing the clipboard data parsed to a {@link module:engine/view/documentfragment~DocumentFragment view document fragment}.

These actions are performed by low priority listeners, so they can be overridden by normal ones
when a deeper change in pasting behavior is needed. For example, a feature which wants to differently read data from the clipboard (the {@link module:clipboard/datatransfer~DataTransfer `DataTransfer`}) should plug a listener at this stage.

### 2. On {@link module:engine/view/document~Document#event:clipboardInput `view.Document#clipboardInput`}

This action is performed by a low priority listener, so it can be overridden by a normal one. Typically, you will want to call {@link module:utils/eventinfo~EventInfo#stop `evt.stop()`} and implement your desired behavior:

```js
editor.editing.view.document.on( 'clipboardInput', ( evt, data ) => {
	const dataTransfer = data.dataTransfer;
	const htmlContent = dataTransfer.getData( 'text/html' );
	const viewContent = htmlDataProcessor.toView( htmlContent );

	this.fire( 'inputTransformation', { content: viewContent } );

	editor.editing.viewview.scrollToTheSelection();
	evt.stop();
} );
```

The above is a very raw implementation of handling incoming HTML. A complete HTML + plain text + quirks handling is implemented by the [clipboard plugin](https://github.com/ckeditor/ckeditor5-clipboard/blob/master/src/clipboard.js) and it is not recommended to override it, unless you really know what you do.

This event is useful, however, if you want to handle other kinds of files and ignore the HTML payload at all:

```js
editor.editing.view.document.on( 'clipboardInput', ( evt, data ) => {
	const dataTransfer = data.dataTransfer;

	if ( !hasOnlyFiles( dataTransfer ) ) {
		return;
	}

	for ( const file of dataTransfer.files ) {
		editor.model.change( writer => {
			// Do something with that file...
			// For instance, create a widget with a preview of it.
			// PS. For that you'll also need to upload that file.
			// See the FileRepository class.

			editor.model.insertContent( fileWidget, editor.model.document.selection );
		} );

	}

	evt.stop();
} );
```

In other cases, when you want to transform the pasted HTML, see the event described below.

### 3. On {@link module:clipboard/clipboard~Clipboard#event:inputTransformation `view.Document#inputTransformation`}

The default action is to insert the content (`data.content`, represented by a {@link module:engine/view/documentfragment~DocumentFragment}) to an editor if the data is not empty.

This action is performed by a low priority listener, so it can be overridden by a normal one.

At this stage the pasted content can be processed by the features. E.g. a feature which wants to transform a pasted text into a link can be implemented in this way:

```js
editor.plugins.get( 'Clipboard' ).on( 'inputTransformation', ( evt, data ) => {
	if ( data.content.childCount == 1 && isUrlText( data.content.getChild( 0 ) ) ) {
		const linkUrl = data.content.getChild( 0 ).data;

		// TODO use upcastwriter
		data.content = new ViewDocumentFragment( [
			ViewElement(
				'a',
				{ href: linkUrl },
				[ new ViewText( linkUrl ) ]
			)
		] );
	}
} );
```

## Output pipeline

The output pipeline is the equivalent of the input pipeline but for the copy and cut operations.
It allows to process the content which will be then put into the clipboard or to override the whole process.

### 1. On {@link module:engine/view/document~Document#event:copy `view.Document#copy`} and {@link module:engine/view/document~Document#event:cut `view.Document#cut`}

The default action is to:

1. {@link module:engine/model/model~Model#getSelectedContent get selected content} from the editor,
2. prevent the default action of the native `copy` or `cut` event,
3. fire {@link module:engine/view/document~Document#event:clipboardOutput `view.Document#clipboardInput`} with a clone of the selected content converted to a {@link module:engine/view/documentfragment~DocumentFragment view document fragment}.

### 2. On {@link module:engine/view/document~Document#event:clipboardOutput `view.Document#clipboardOutput`}

The default action is to put the content (`data.content`, represented by a {@link module:engine/view/documentfragment~DocumentFragment}) to the clipboard as HTML. In case of the cut operation, the selected content is also deleted from the editor.

This action is performed by a low priority listener, so it can be overridden by a normal one.

At this stage the copied/cut content can be processed by the features.
