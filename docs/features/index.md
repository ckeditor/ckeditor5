---
category: features
order: 10
toc: false
feedback-widget: false
---

# Features

<info-box>
	Use the <span class="navigation-hint_desktop">**navigation tree on the left**</span><span class="navigation-hint_mobile">**main menu button in the upper-left corner**</span> to navigate through selected CKEditor 5 features.
</info-box>

## Feature availability

The number of features available for CKEditor 5 is constantly growing. Plenty of them are included by default in {@link builds/guides/overview CKEditor 5 Builds} and are available out-of-the-box, like for example {@link features/autoformat autoformatting} or {@link features/keyboard-support keyboard support}. However, some of the presented features need to be manually included in a customized CKEditor 5 build, for example the {@link features/markdown Markdown processor} which outputs Markdown instead of HTML, or easily and conveniently added to a custom build in the [CKEditor 5 online builder](https://ckeditor.com/ckeditor-5/online-builder/).

CKEditor 5 features cover several functional areas of application and use. Most of them are easily accessible from a {@link features/toolbar highly configurable toolbar} (if fact there are {@link features/blocktoolbar two of those}) offering buttons and dropdowns you may arrange the way you need. Many actions can also be executed with {@link features/keyboard-support keyboard shortcuts}. And the whole user interface comes with {@link features/ui-language multitude of translations} and it supports RTL languages.

### Formatting features

{@link features/basic-styles Basic text styles} include essentials like bold, italics, super- and subscript as well as inline code formatting and more. The {@link features/font font feature} provides support for using different font families, controlling the font size as well as font and background colors.

An essential feature for online content are {@link features/link links} - these can be easily pasted, changed and attributed.

{@link features/headings Headings} (with configurable levels and styles), as well as the {@link features/text-alignment text alignment feature} help organize the structure of the document.

Most of these formatting options can be applied from the {@link features/toolbar toolbar} or on the go, as you type, thanks to the {@link features/autoformat autoformatting feature} that employs Markdown syntax, and as easily removed with the {@link features/remove-format remove format feature}.

### Advanced content

Rich text would not be rich without images. You can upload them, caption them, style them, you can even paste them straight from the URL with the help of the {@link features/image image feature} and create responsive design. If that is not enough, {@link features/media-embed embed media} into your content.

Enrich you content further by {@link features/html-embed embedding HTML code} - this one is especially useful for webmasters. If you need to present code instead of employing it - use the {@link features/code-blocks code block} that let you produce code listing with a syntax highlight, too!

Provide clear and accessible data using {@link features/table tables}, ordered and unordered {@link features/lists lists} with various markers to choose from and {@link features/todo-lists to-do lists}. Use {@link features/indent indents and outdents} as well as {@link features/block-quote block quotes} to structure the content and draw reader's attention to it.

### Productivity features

Keep full control of your work. Be safe and never lose anything thanks to the {@link features/real-time-collaboration-integration#the-autosave-plugin autosave plugin}. Configure {@link features/toolbar the toolbar} any way you like, use an additional {@link features/blocktoolbar block toolbar} and choose the right {@link builds/index editor build} to suit your needs.

The {@link features/word-count words and characters counter} will help you track progress and control the volume of the content.

Use {@link features/autoformat Markdown syntax} to format content on the go to speed the editing process, employ {@link features/text-transformation automatic text transformations} (also known as autocorrect) and the {@link features/spelling-and-grammar-checking spell checker} to ensure everything is correct.

### Collaboration

Users, permissions, track changes, comments, ...

### Cross-platform operability

Do not get stopped by technology differences - CKEditor 5 offers cross-platform interoperability. Being a {@link framework/index web-based JavaScript framework} it works in any and all environments. What is more, you can easily use documents from other editors: easily paste content {@link features/paste-from-word from MS Word}, {@link features/paste-from-google-docs from Google Docs} and we even have extended support for {@link features/paste-plain-text pasting plain text}.

### Output and exports

Writing and editing content is one thing, sharing it is another. The CKEditor 5 WYSIWYG editor by default produces HTML output, that can be saved into a database. The default output can be also switched to {@lik features/markdown Github-flavored Markdown} formatted text.

If you need to share the document, use {@link features/export-pdf export to PDF feature} to produce industry standard, portable, cross-platform final files. If you need to work further on the document, choose the {@link features/export-word export to Word} instead - and keep your comment and changes in the resulting

## Feature examples

Each rich-text editor feature is presented on a separate page, with one or more working demos showcasing a feature along with some customization ideas that you can use in your implementation.

<info-box>
	**In most demos the number of features enabled is limited** to make the currently highlighted piece of functionality stand out more. However, in your CKEditor 5 WYSIWYG editor implementation you are free to choose and combine any features you like from those available. This can be easily and conveniently done in the [CKEditor 5 online builder](https://ckeditor.com/ckeditor-5/online-builder/).
</info-box>

## Looking for more?

The examples on the left do not present all features included in CKEditor 5. For example, some end-user features like bulleted and numbered lists or undo and redo are quite self-explanatory.

CKEditor 5 is in active development now and new features are added all the time, while the existing ones are being expanded and improved. If you are missing anything in particular, feel free to [suggest a new feature](https://github.com/ckeditor/ckeditor5/issues/new?labels=type%3Afeature&template=2-feature-request.md) and share your feedback with us. If it has already been reported by someone else, upvote it 👍 to show your support.

## How about creating your own features?

Probably the most exciting features are the ones you can develop on top of CKEditor 5 Framework!
We are gradually enhancing the {@link framework/index CKEditor 5 Framework documentation} together with {@link api/index API documentation}, hoping to give you a solid base for {@link framework/guides/creating-simple-plugin creating custom features}.

The official add-ons repository for CKEditor 4 reached an impressive number of over 300 add-ons created and published by the community. Now it is time for you to add your contributions to the brand new CKEditor 5!
