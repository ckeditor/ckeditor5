---
title: Watchdog
category: features
---

# Watchdog

The {@link module:watchdog/watchdog~Watchdog} feature allows you to create a wrapper for the editor that will ensure that the editor instance is running. If a {@link module:utils/ckeditorerror~CKEditorError `CKEditorError` error} is thrown by the editor, it tries to restart the editor to the state before the crash. All other errors are transparent to the watchdog. By looking at the error context, the Watchdog restarts only the editor which crashed.

**Note**: The watchdog does not handle errors during editor initialization (`Editor.create()`) and editor destruction (`editor.destroy()`). Errors at these stages mean that there is a serious problem in the code integrating the editor and such problem cannot be easily fixed restarting the editor.

## Basic implementation

```js
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Watchdog from '@ckeditor/ckeditor5-watchdog/src/watchdog';

import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';

const watchdog = Watchdog.for( ClassicEditor );

watchdog.create( document.querySelector( '#editor' ), {
	plugins: [ Essentials, Paragraph, Bold, Italic ],
	toolbar: [ 'bold', 'italic', 'alignment' ]
} )
	.then( () => {
		const editor = watchdog.editor;
	} );
```
