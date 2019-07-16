---
title: Watchdog
category: features
---

# Watchdog

Every non-trivial piece of software has bugs. Despite our high quality standards like 100% code coverage, regression testing and manual tests before every release, CKEditor 5 is not free of bugs. Neither is the browser used by the user, your application in which CKEditor 5 is integrated, or any third-party addons that you used.

In order to limit the effect of an editor crash on the user experience, you can automatically restart the WYSIWYG editor with the content saved just before the crash.

The {@link module:watchdog/watchdog~Watchdog} utility allows you to do exactly that. It ensures that an editor instance is running, despite a potential crash. It works by detecting that an editor crashed, destroying it, and automatically creating a new instance of that editor with the content of the previous editor.

## Usage

<info-box>
	Note: Watchdog can be used only with an {@link builds/guides/integration/advanced-setup#scenario-2-building-from-source editor built from source}.
</info-box>

Install the [`@ckeditor/ckeditor5-watchdog`](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog) package:

```bash
npm install --save @ckeditor/ckeditor5-watchdog
```

And then change your `ClassicEditor.create()` call to `watchdog.create()` as follows:

```js
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Watchdog from '@ckeditor/ckeditor5-watchdog/src/watchdog';

import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';

// Create a watchdog for the given editor type.
const watchdog = Watchdog.for( ClassicEditor );

// Create a new editor instance.
watchdog.create( document.querySelector( '#editor' ), {
	plugins: [ Essentials, Paragraph, Bold, Italic ],
	toolbar: [ 'bold', 'italic', 'alignment' ]
} );
```

In other words, your goal is to create a watchdog instance and make the watchdog create an instance of the editor you want to use. The watchdog will then create a new editor and if it ever crashes, restart it by creating a new editor.

<info-box>
	A new editor instance is created every time the watchdog detects a crash. Thus, the editor instance should not be kept in your application's state. Use the {@link module:watchdog/watchdog~Watchdog#editor `Watchdog#editor`} property instead.

	It also means that any code that should be executed for any new editor instance should be either loaded as an editor plugin or executed in the callbacks defined by {@link module:watchdog/watchdog~Watchdog#setCreator `Watchdog#setCreator()`} and {@link module:watchdog/watchdog~Watchdog#setDestructor `Watchdog#setDestructor()`}. Read more about controlling the editor creation and destruction in the next section.
</info-box>

### Controlling editor creation and destruction

For more control over the creation and destruction of editor instances, you can use the {@link module:watchdog/watchdog~Watchdog#setCreator `Watchdog#setCreator()`} and {@link module:watchdog/watchdog~Watchdog#setDestructor `Watchdog#setDestructor()`} methods:

```js
// Instantiate the watchdog manually (do not use the for() helper).
const watchdog = new Watchdog();

watchdog.setCreator( ( elementOrData, editorConfig ) => {
	return ClassicEditor
		.create( elementOrData, editorConfig )
		.then( editor => {
			// Do something with the new editor instance.
		} );
} );

watchdog.setDestructor( editor => {
	// Do something before the editor is destroyed.

	return editor
		.destroy()
		.then( () => {
			// Do something after the editor is destroyed.
		} );
 } );

watchdog.create( elementOrData, editorConfig );
```

### API

Other useful {@link module:watchdog/watchdog~Watchdog methods, properties and events}:

 ```js
watchdog.on( 'error', () => { console.log( 'Editor crashed.' ) } );
watchdog.on( 'restart', () => { console.log( 'Editor was restarted.' ) } );

// Destroy the watchdog and the current editor instance.
watchdog.destroy();

// The current editor instance.
watchdog.editor;

watchdog.crashes.forEach( crashInfo => console.log( crashInfo ) );
```

## Limitations

The CKEditor 5 watchdog listens to uncaught errors which can be associated with the editor instance created by that watchdog. Currently, these errors are {@link module:utils/ckeditorerror~CKEditorError `CKEditorError` errors} so those explicitly thrown by the editor (by its internal checks). This means that not every runtime error that crashed the editor can be caught which, in turn, means that not every crash can be detected.

However, with time, the most "dangerous" places in the API will be covered with checks and `try-catch` blocks (allowing detecting unknown errors).

<info-box>
	The watchdog does not handle errors thrown during the editor initialization (by `Editor.create()`) and editor destruction (`Editor#destroy()`). Errors thrown at these stages mean that there is a serious problem in the code integrating the editor with your application and such problem cannot be easily fixed by restarting the editor.
</info-box>
