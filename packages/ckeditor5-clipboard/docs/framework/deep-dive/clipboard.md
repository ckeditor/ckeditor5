---
category: framework-deep-dive
---

# Clipboard

The clipboard feature (implemented by the {@link module:clipboard/clipboard~Clipboard} plugin) is responsible for the integration with the native clipboard &mdash; a feature of the operating system and the browser used when the user copies, cuts, pastes, or drags and drops content within the editor or from/to the "outside".

CKEditor 5 intercepts all native events like `copy`, `cut` or `drop` and handles them on its side. The goal is to not allow the browser to touch the content in the rich text editor which would lead to the browser messing it up.

There are two directions in which the content is processed:

* When the content is being pasted or dropped into the editor, it goes through the [input pipeline](#input-pipeline).
* When the content is being copied, cut or dragged from the editor, it goes through the [output pipeline](#output-pipeline).

Both pipelines allow the features to process the content to be inserted or set to the clipboard as well as override the default mechanisms at different stages of these processes.

## Input pipeline

When the user pastes or drops content into the editor, the browser fires an event which is intercepted by the clipboard feature and which kickstarts the following mechanism:

1. {@link module:clipboard/clipboardobserver~ClipboardObserver} turns this event into a synthetic {@link module:engine/view/document~Document#event:paste `view.Document#paste`} or {@link module:engine/view/document~Document#event:drop `view.Document#drop`}.
1. Since the content to be inserted by both actions (paste and drop) should usually be processed in the same way and both actions have a very similar effect, both events are turned into a single {@link module:engine/view/document~Document#event:clipboardInput `view.Document#clipboardInput`} event for easier handling.
1. Next, the clipboard feature listens to the `view.Document#clipboardInput` event, retrieves and pre-processes the `text/html` or `text/plain` content which it finds in the {@link module:engine/view/datatransfer~DataTransfer event's `dataTransfer`} and fires the {@link module:clipboard/clipboardpipeline~ClipboardPipeline#event:inputTransformation `ClipboardPipeline#inputTransformation`} event with the retrieved content in the event data `content` property as a {@link module:engine/view/documentfragment~DocumentFragment `view.DocumentFragment`}.
1. Then, the clipboard feature listens to the `ClipboardPipeline#inputTransformation` event, takes the processed content, transforms it to the {@link module:engine/model/documentfragment~DocumentFragment `model.DocumentFragment`} and fires the {@link module:clipboard/clipboardpipeline~ClipboardPipeline#event:contentInsertion `ClipboardPipeline#contentInsertion`} event with the transformed content in the event data `content` property as a {@link module:engine/model/documentfragment~DocumentFragment `model.DocumentFragment`}.
1. Finally, the clipboard feature listens to the `ClipboardPipeline#contentInsertion` event, takes the model fragment, {@link module:engine/model/model~Model#insertContent inserts} it into the editor and stores the range which contains all the performed changes in the `resultRange` property of the event data.

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

By default, the clipboard feature retrieves `text/html` or `text/plain` from the clipboard, normalizes the data a bit (for example, cleans up the [mess with whitespaces](https://github.com/ckeditor/ckeditor5-clipboard/issues/2)), converts it to a {@link module:engine/view/documentfragment~DocumentFragment view `DocumentFragment`} and fires the `ClipboardPipeline#inputTransformation` event with the document fragment for further processing.

The {@link module:engine/view/document~Document#event:clipboardInput `view.Document#clipboardInput`} event can be used to override this behavior. For example, you can use it to:

* Handle pasted or dropped files (that you can retrieve from the `dataTransfer`).

	Handling file upload requires, however, a lot more than reading {@link module:engine/view/datatransfer~DataTransfer#files `dataTransfer.files`} so for a complete code example, check the source code of plugins like [`ImageUploadEditing`](https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-image/src/imageupload/imageuploadediting.js).
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

The default action is to fire a {@link module:clipboard/clipboardpipeline~ClipboardPipeline#event:contentInsertion `ClipboardPipeline#contentInsertion`} event that will {@link module:engine/model/model~Model#insertContent insert} the content (`data.content`, represented by a {@link module:engine/view/documentfragment~DocumentFragment}) to the editor if the data is not empty.

At this stage the pasted content can be processed by the features. For example, a feature that wants to transform the pasted text into a link can be implemented in the following way:

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

The default action (inserting the content into the editor) is performed by a low priority listener, so it can be overridden by a normal one. With the `lowest` priority you can also execute actions after the content has already been inserted.

```js
editor.plugins.get( 'ClipboardPipeline' ).on( 'contentInsertion', ( evt, data ) => {
	console.log( 'Content was inserted.' );
}, { priority: 'lowest' } );
```

<info-box>
	Check out the {@link framework/deep-dive/event-system#listener-priorities event system deep dive} guide to learn more about event listener priorities.
</info-box>

### Paste as plain text plugin example

You can use the knowledge from the previous sections to create a complete plugin that will allow users to paste the content as plain text while the feature is toggled on.

If you are not familiar with creating plugins in CKEditor 5, it is recommended to start from reading the {@link framework/creating-simple-plugin-timestamp Creating a simple plugin} guide to get a better understanding of what happens in the code below.

```js
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Command from '@ckeditor/ckeditor5-core/src/command';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

import plainTextToHtml from '@ckeditor/ckeditor5-clipboard/src/utils/plaintexttohtml';

class PastePlainText extends Plugin {
	static get pluginName() {
		return 'PastePlainText'
	}

	static get requires() {
		return [ PastePlainTextUI, PastePlainTextCommand ]
	}

	init() {
		const editor = this.editor;

		editor.commands.add( 'pastePlainText', new PastePlainTextCommand( editor ) );

		// The logic responsible for converting HTML to plain text.
		const clipboardPlugin = editor.plugins.get( 'ClipboardPipeline' );
		const command = editor.commands.get( 'pastePlainText' );
		const editingView = editor.editing.view;

		editingView.document.on( 'clipboardInput', ( evt, data ) => {
			if ( editor.isReadOnly || !command.value ) {
				return;
			}

			const dataTransfer = data.dataTransfer;
			let content = plainTextToHtml( dataTransfer.getData( 'text/plain' ) );

			data.content = this.editor.data.htmlProcessor.toView( content );
		} );
	}
};

class PastePlainTextUI extends Plugin {
	init() {
		const editor = this.editor;

		editor.ui.componentFactory.add( 'pastePlainText', locale => {
			const view = new ButtonView( locale );
			const command = editor.commands.get( 'pastePlainText' );

			view.set( {
				label: 'Paste as plain text',
				withText: true,
				tooltip: true,
				isToggleable: true
			} );

			// A callback executed once the button is clicked.
			view.on( 'execute', () => {
				editor.execute( 'pastePlainText' );
			} );

			view.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );

			return view;
		} );
	}
};

class PastePlainTextCommand extends Command {
	refresh() {
		// Disable the command if the editor is in read-only mode.
		this.isEnabled = !this.editor.isReadOnly;
	}

	execute() {
		// Activate pasting plain text.
		this.value = !this.value;
	}
}

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Essentials, Paragraph, Bold, Italic, PastePlainText ],
		toolbar: [ 'bold', 'italic', 'pastePlainText' ],
		// More of the editor's configuration.
		// ...
	} )
	.catch( error => {
    	console.log( error );
	} );
```

## Output pipeline

The output pipeline is the equivalent of the input pipeline but for the copy and cut operations. It allows to process the content that will be then put into the clipboard or to override the whole process.

### Output pipeline events overview

```plaintext
 ┌──────────────────────┐          ┌──────────────────────┐   Retrieves the selected
 │     view.Document    │          │     view.Document    │   model.DocumentFragment
 │         copy         │          │          cut         │   and converts it to
 └───────────┬──────────┘          └───────────┬──────────┘   view.DocumentFragment.
             │                                 │
             └────────────────┌────────────────┘
                              │
                    ┌─────────V────────┐   Processes view.DocumentFragment
                    │   view.Document  │   to text/html and text/plain
                    │  clipboardOutput │   and stores results in data.dataTransfer.
                    └──────────────────┘
```

### 1. On {@link module:engine/view/document~Document#event:copy `view.Document#copy`} and {@link module:engine/view/document~Document#event:cut `view.Document#cut`}

The default action is to:

1. {@link module:engine/model/model~Model#getSelectedContent Get the selected content} from the editor.
1. Prevent the default action of the native `copy` or `cut` event.
1. Fire {@link module:engine/view/document~Document#event:clipboardOutput `view.Document#clipboardOutput`} with a clone of the selected content converted to a {@link module:engine/view/documentfragment~DocumentFragment view document fragment}.

### 2. On {@link module:engine/view/document~Document#event:clipboardOutput `view.Document#clipboardOutput`}

The default action is to put the content (`data.content`, represented by a {@link module:engine/view/documentfragment~DocumentFragment}) to the clipboard as HTML. In case of the cut operation, the selected content is also deleted from the editor.

This action is performed by a low priority listener, so it can be overridden by a normal one.

At this stage the copied or cut content can be processed by other features.
