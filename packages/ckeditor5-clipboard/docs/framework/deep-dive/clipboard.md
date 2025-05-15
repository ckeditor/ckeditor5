---
category: framework-deep-dive
meta-title: Clipboard | CKEditor 5 Framework Documentation
---

# Clipboard

The clipboard feature (implemented by the {@link module:clipboard/clipboard~Clipboard} plugin) is responsible for the integration with the native clipboard. The native clipboard is a feature of the operating system and the browser. It is used when the user copies, cuts, pastes, or drags and drops content within the editor or from/to the "outside."

CKEditor&nbsp;5 intercepts all native events like `copy`, `cut`, or `drop` and handles them on its side. The goal is to not allow the browser to touch the content in the rich text editor. This could lead to the browser messing it up.

There are two directions of content processing:

* When the content is being pasted or dropped into the editor, it goes through the [input pipeline](#input-pipeline).
* When the content is being copied, cut, or dragged from the editor, it goes through the [output pipeline](#output-pipeline).

Both pipelines allow the features to process the content to be inserted or set to the clipboard. They also allow to override the default mechanisms at different stages of these processes.

## Input pipeline

When the user pastes or drops content into the editor, the browser fires an event. The clipboard feature intercepts this event and starts the following mechanism:

1. {@link module:clipboard/clipboardobserver~ClipboardObserver} turns this event into a synthetic {@link module:engine/view/document~Document#event:paste `view.Document#paste`} or {@link module:engine/view/document~Document#event:drop `view.Document#drop`}.
2. The content to be inserted by both actions (paste and drop) should usually be processed in the same way and both actions have a similar effect. Both events are thus turned into a single {@link module:engine/view/document~Document#event:clipboardInput `view.Document#clipboardInput`} event for easier handling.
3. Next, the clipboard feature listens to the `view.Document#clipboardInput` event and retrieves and pre-processes the `text/html` or `text/plain` content which it finds in the {@link module:engine/view/datatransfer~DataTransfer event's `dataTransfer`}. It then fires the {@link module:clipboard/clipboardpipeline~ClipboardPipeline#event:inputTransformation `ClipboardPipeline#inputTransformation`} event with the retrieved content in the event data `content` property as a {@link module:engine/view/documentfragment~DocumentFragment `view.DocumentFragment`}.
4. Then, the clipboard feature listens to the `ClipboardPipeline#inputTransformation` event. It takes the processed content and transforms it to the {@link module:engine/model/documentfragment~DocumentFragment `model.DocumentFragment`}. It then fires the {@link module:clipboard/clipboardpipeline~ClipboardPipeline#event:contentInsertion `ClipboardPipeline#contentInsertion`} event with the transformed content in the event data `content` property as a {@link module:engine/model/documentfragment~DocumentFragment `model.DocumentFragment`}.
5. Finally, the clipboard feature listens to the `ClipboardPipeline#contentInsertion` event. It takes the model fragment and {@link module:engine/model/model~Model#insertContent inserts} it into the editor. Then it stores the range which contains all the performed changes in the `resultRange` property of the event data.

The clipboard feature listens to the `view.Document#clipboardInput`, `ClipboardPipeline#inputTransformation`, and `ClipboardPipeline#contentInsertion` events using {@link framework/deep-dive/event-system#listener-priorities low priority listeners}. This means that adding a normal listener and calling `evt.stop()` allows overriding the behavior implemented by the clipboard feature. It is a similar mechanism to the DOM's `evt.preventDefault()` that lets you override the default browser behavior.

### Input pipeline events overview

```plaintext
 ┌──────────────────────┐          ┌──────────────────────┐
 │     view.Document    │          │     view.Document    │
 │         paste        │          │         drop         │
 └───────────┬──────────┘          └───────────┬──────────┘
             │                                 │
             └────────────────┌────────────────┘
                              │
                    ┌─────────V────────┐
                    │   view.Document  │   Retrieves text/html from data.dataTransfer
                    │  clipboardInput  │   and processes it to view.DocumentFragment.
                    └─────────┬────────┘
                              │
                  ┌───────────V───────────┐
                  │   ClipboardPipeline   │   Converts view.DocumentFragment
                  │  inputTransformation  │   to model.DocumentFragment.
                  └───────────┬───────────┘
                              │
                   ┌──────────V──────────┐
                   │  ClipboardPipeline  │   Calls model.insertContent().
                   │   contentInsertion  │
                   └─────────────────────┘
```

### Handling clipboard input differently

By default, the clipboard feature retrieves `text/html` or `text/plain` from the clipboard. It normalizes the data a bit (for example, cleans up the [mess with whitespaces](https://github.com/ckeditor/ckeditor5-clipboard/issues/2)). It converts it to a {@link module:engine/view/documentfragment~DocumentFragment view `DocumentFragment`} and fires the `ClipboardPipeline#inputTransformation` event with the document fragment for further processing.

You can use the {@link module:engine/view/document~Document#event:clipboardInput `view.Document#clipboardInput`} event to override this behavior. For example, you can use it to:

* Handle pasted or dropped files. You can retrieve these from the `dataTransfer`.

	Handling file upload requires, however, a lot more than reading {@link module:engine/view/datatransfer~DataTransfer#files `dataTransfer.files`}. For a complete code example, check the source code of plugins like [`ImageUploadEditing`](https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-image/src/imageupload/imageuploadediting.ts).
* Change the type of data that the clipboard feature reads from the clipboard. For instance, you may want to use `application/rtf` if it is present in the `dataTransfer` (and ignore `text/html` in that case).

	```js
	editor.editing.view.document.on( 'clipboardInput', ( evt, data ) => {
		const dataTransfer = data.dataTransfer;
		const rtfContent = dataTransfer.getData( 'application/rtf' );

		// If no RTF was pasted, abort and let the clipboard feature handle the input.
		if ( !rtfContent ) {
			return;
		}

		// Convert an RTF raw string to a view document fragment.
		const viewContent = convertRtfStringToView( rtfContent );

		// Pass the view fragment to the default clipboard input handler
		// to allow further processing of the content.
		data.content = viewContent;
	} );
	```

### Processing input content

The {@link module:clipboard/clipboardpipeline~ClipboardPipeline#event:inputTransformation `ClipboardPipeline#inputTransformation`} event lets you process the content which is going to be inserted into the editor.

The default action is to fire a {@link module:clipboard/clipboardpipeline~ClipboardPipeline#event:contentInsertion `ClipboardPipeline#contentInsertion`} event. This event will {@link module:engine/model/model~Model#insertContent insert} the content (`data.content`, represented by a {@link module:engine/view/documentfragment~DocumentFragment}) to the editor if the data is not empty.

At this stage, features can process the pasted content. For example, you can implement a feature that wants to transform the pasted text into a link in the following way:

```js
const writer = new UpcastWriter( editor.editing.view.document );

editor.plugins.get( 'ClipboardPipeline' ).on( 'inputTransformation', ( evt, data ) => {
	if ( data.content.childCount == 1 && isUrlText( data.content.getChild( 0 ) ) ) {
		const linkUrl = data.content.getChild( 0 ).data;

		data.content = writer.createDocumentFragment( [
			writer.createElement(
				'a',
				{ href: linkUrl },
				[ writer.createText( linkUrl ) ]
			)
		] );
	}
} );
```

The default action (inserting the content into the editor) is performed by a low-priority listener, so it can be overridden by a normal one. With the `lowest` priority, you can also execute actions after the content has already been inserted.

```js
editor.plugins.get( 'ClipboardPipeline' ).on( 'contentInsertion', ( evt, data ) => {
	console.log( 'Content was inserted.' );
}, { priority: 'lowest' } );
```

<info-box>
	Check out the {@link framework/deep-dive/event-system#listener-priorities event system deep dive} guide to learn more about event listener priorities.
</info-box>

### Paste as plain text plugin example

You can use the knowledge from the earlier sections to create a complete plugin. A perfect example to follow is our [`PastePlainText`](https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-clipboard/src/pasteplaintext.ts) which pastes plain text when <kbd>Shift</kbd> is pressed. If you are not familiar with creating plugins in CKEditor&nbsp;5, start by reading the {@link tutorials/crash-course/editor Creating a simple plugin} guide.


## Output pipeline

The output pipeline is the equivalent of the input pipeline but for the copy and cut operations. It allows to process the content that will be then put into the clipboard or to override the whole process.

### Output pipeline events overview

```plaintext
 ┌──────────────────────┐          ┌──────────────────────┐   Retrieves the selected
 │     view.Document    │          │     view.Document    │   model.DocumentFragment
 │         copy         │          │          cut         │   and fires the `outputTransformation`
 └───────────┬──────────┘          └───────────┬──────────┘   event.
             │                                 │
             └────────────────┌────────────────┘
                              │
            	┌─────────────V────────────┐   Processes model.DocumentFragment
                │     ClipboardPipeline    │   and converts it to
                │    outputTransformation  │   view.DocumentFragment.
                └──────────────────────────┘
                              │
                ┌─────────────V────────────┐   Processes view.DocumentFragment
                │       view.Document      │   to text/html and text/plain
                │      clipboardOutput     │   and stores results in data.dataTransfer.
                └──────────────────────────┘
```

### 1. On {@link module:engine/view/document~Document#event:copy `view.Document#copy`} and {@link module:engine/view/document~Document#event:cut `view.Document#cut`}

The default action is to:

1. {@link module:engine/model/model~Model#getSelectedContent Get the selected content} from the editor.
1. Prevent the default action of the native `copy` or `cut` event.
1. Fire {@link module:clipboard/clipboardpipeline~ClipboardPipeline#event:outputTransformation `clipboard.ClipboardPipeline#outputTransformation`}` with a selected content represented by a {@link module:engine/model/documentfragment~DocumentFragment model document fragment}.

### 2. On {@link module:clipboard/clipboardpipeline~ClipboardPipeline#event:outputTransformation `clipboard.ClipboardPipeline#outputTransformation`}

The default action is to:

1. Processes `data.content` represented by a {@link module:engine/model/documentfragment~DocumentFragment model document fragment}.
1. Fire {@link module:engine/view/document~Document#event:clipboardOutput `view.Document#clipboardOutput`} with a processed `data.content` converted to a {@link module:engine/view/documentfragment~DocumentFragment view document fragment}.

### 3. On {@link module:engine/view/document~Document#event:clipboardOutput `view.Document#clipboardOutput`}

The default action is to put the content (`data.content`, represented by a {@link module:engine/view/documentfragment~DocumentFragment}) to the clipboard as HTML. In the case of the cut operation, the selected content is also deleted from the editor.

This action is performed by a low-priority listener, so it can be overridden by a normal one.

At this stage other features can process the copied or cut content.
