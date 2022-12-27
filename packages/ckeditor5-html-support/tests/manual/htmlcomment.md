## HTML comment

1. Toggle the source editing mode and verify that all comments are present. There should be 10 comments: from `C1` to `C10`.
1. In source editing mode add and remove some comments. Please note that, currently, the comment support is on a basic level. See the **Known limitations** section below containing missing functionalities.
1. Copy & paste some content from Word and Google Docs. Content should be parsed without errors and displayed correctly.

### Known limitations

1. [Issue #10118](https://github.com/ckeditor/ckeditor5/issues/10118): comments located between some HTML tags are repositioned or lost.
1. [Issue #10119](https://github.com/ckeditor/ckeditor5/issues/10119): comments can be easily repositioned during editing the document.
1. [Issue #10127](https://github.com/ckeditor/ckeditor5/issues/10127): comments are not handled in copy & paste or drag & drop.