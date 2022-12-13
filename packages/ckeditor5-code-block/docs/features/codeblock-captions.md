---
category: features-codeblock
menu-title: Codeblock captions
---

# Codeblock captions

The plugin adds support for codeblock captions:

```html
<pre>
    <code>
        Some source code goes here
        <figcaption>
            A caption goes here...
        </figcaption>
    </code>
</pre>
```
By default, if the codeblock caption is empty, the `<figcaption>` element is not visible to the user. You can click the image to reveal the caption field and write ones.

## Common API

* The `'toggleCodeblockCaption'` button on codeblock toolbar.
* The {@link module:code-block/codeblockcaption/codeblockcaptioncommand~ToggleCodeblockCaptionCommand `'toggleCodeblockCaption'` command}

If you want to use codeblock-caption, you should add `CodeblockCaption` plugin and `CodeblockToolbar` plugin and specify configuration `codeblock.toolbar = [ 'toggleCodeblockCaption' ]`.

The example configuration script is following.

```
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import CodeBlock from '@ckeditor/ckeditor5-code-block/src/codeblock';
import CodeblockCaption from '@ckeditor/ckeditor5-code-block/src/codeblockcaption';
import CodeblockToolbar from '@ckeditor/ckeditor5-code-block/src/codeblocktoolbar.js';

ClassicEditor
    .create( document.querySelector( '#editor' ), {
        plugins: [
            CodeBlock,
            CodeblockToolbar
            CodeblockCaption
        ],
        toolbar: {
            items: [
                'codeBlock'
            ],
        },
        codeblock: {
            toolbar: [
                'toggleCodeblockCaption'
            ]
        },

    } )
    .then( editor => {
        window.editor = editor;
        // Prevent showing a warning notification when user is pasting a content from MS Word or Google Docs.
        window.preventPasteFromOfficeNotification = true;

        document.querySelector( '.ck.ck-editor__main' ).appendChild( editor.plugins.get( 'WordCount' ).wordCountContainer );
    } )
    .catch( err => {
        console.error( err );
    } );
```
