---
category: features
order: 10
toc: false
feedback-widget: false
---

# Features

The number of features available for CKEditor 5 is constantly growing. You can find the most recent list of the available ones on the left. CKEditor 5 is in active development now and new features are added all the time, while the existing ones are being expanded and improved. Newly added or meaningfully updated feature guides are marked with a <span class="tree__item__badge tree__item__badge_new">NEW</span> icon for easy spotting. Premium features, which require an additional license to work, are marked with a <span class="tree__item__badge tree__item__badge_premium"><span class="tree__item__badge__text">Premium feature</span></span> icon.

## Using CKEditor 5 features

Most of the features are easily accessible from a {@link features/toolbar highly configurable toolbar} (in fact there are {@link features/blocktoolbar two of those}) offering buttons and dropdowns you may arrange the way you need. This is aided by dedicated feature toolbars in many cases. Plenty of actions can also be executed with {@link features/keyboard-support keyboard shortcuts}. And the whole user interface comes with a {@link features/ui-language multitude of translations} and it supports RTL languages.


## CKEditor 5 WYSIWYG editor features and functions

CKEditor 5 features cover several functional areas of application and use. Listed below are some of the most useful ones.

<info-box>
	Use the <span class="navigation-hint_desktop">**navigation tree on the left**</span><span class="navigation-hint_mobile">**main menu button in the upper-left corner**</span> to navigate through a full selection of CKEditor 5 features.
</info-box>

### Collaboration

The {@link framework/index CKEditor 5 Framework} was created with {@link features/collaboration collaboration} in mind.

The {@link features/users users API} is used by functions such as {@link features/track-changes track changes}, that allow the users to follow any changes made to the edited document in real time. Accepting or rejecting those changes is done with a single click from a convenient side panel.

Where tracking changes is not enough, the {@link features/comments comments} come in, offering perfect collaboration communication platform for writing and editing as a team.

Additionally, CKEditor 5 offers the {@link features/restricted-editing restricted editing mode} where only selected part of the content may be edited by selected users, based on permissions system. And when there is a need for even more control, there is the {@link features/read-only read-only editor mode} that lets the user access the content, but not edit it.

{@img assets/img/features-collaboration.png 800 CKEditor 5 collaboration features.}

You can also easily track the progress and changes done in the content with the {@link features/revision-history revision history} feature. This modern and robust document versioning tool lets you create named versions, compare changes and restore previous document versions at ease, tracking all progress &mdash; also when multiple editors work together.

{@img assets/img/features-revision-history.png 800 CKEditor 5 document versioning feature.}

### Output and exports

If you need to share the document outside your team, use the {@link features/export-pdf export to PDF} feature to produce industry standard, portable, cross-platform final files. If you need to work further on the document, choose the {@link features/export-word export to Word} feature instead &mdash; and keep your comments and changes in the resulting document, ready to be edited further. These two are accompanied by the {@link features/pagination pagination} feature, to ensure all produced documents will always look the way they should.

The CKEditor 5 WYSIWYG editor by default produces HTML output, that can be saved into a database. The default output can be also switched to {@link features/markdown Github-flavored Markdown} formatted text addressing the needs of software professionals.

{@img assets/img/features-output.png 800 CKEditor 5 output features.}

### Formatting features

{@link features/basic-styles Basic text styles} include essentials like bold, italics, super- and subscript as well as inline code formatting and more. The {@link features/font font feature} provides support for using different font families, controlling the font size as well as font and background colors.

{@link features/headings Headings} (with configurable levels and styles), as well as the {@link features/text-alignment text alignment feature} help organize the structure of the document.

Most of these formatting options can be applied from the {@link features/toolbar toolbar} or on the go, as you type, thanks to the {@link features/autoformat autoformatting feature} that employs Markdown syntax, and as easily removed with the {@link features/remove-format remove format feature}.

{@img assets/img/features-basic-formatting.png 800 CKEditor 5 formatting features.}

### Advanced content editing

Rich text would not be rich without images. You can upload them, caption them, style them, you can even paste them straight from the URL with the help of the {@link features/images-overview image feature} and create responsive design. If that is not enough, {@link features/media-embed embed media} into your content.

An essential feature for online content are {@link features/link links} - these can be easily pasted, changed and attributed.

Provide clear and accessible data using {@link features/table tables} (you can even nest them to create advanced layouts), ordered and unordered {@link features/lists lists} with various markers to choose from and {@link features/todo-lists to-do lists}. Use {@link features/indent indents and outdents} as well as {@link features/block-quote block quotes} to structure the content and draw reader's attention to it.

Enrich you content further by {@link features/html-embed embedding HTML code} - this one is especially useful for webmasters. If you need to present code instead of employing it - use the {@link features/code-blocks code block} that let you produce code listing with a syntax highlight, too!

{@img assets/img/features-images.png 800 CKEditor 5 image feature.}

### Productivity features

Keep full control of your work. Be safe and never lose anything thanks to the {@link features/real-time-collaboration-integration#the-autosave-plugin autosave plugin}. Configure {@link features/toolbar the toolbar} any way you like, use an additional {@link features/blocktoolbar block toolbar} and choose the right {@link builds/index editor build} to suit your needs.

The {@link features/word-count words and characters counter} will help you track progress and control the volume of the content.

Use {@link features/autoformat Markdown syntax} to format content on the go to speed the editing process, employ {@link features/text-transformation automatic text transformations} (also known as autocorrect) and the {@link features/spelling-and-grammar-checking spell checker} to ensure everything is correct. Create multi-language documents and correct them on the go with automatic language detection and {@link features/language text part language} feature.

{@img assets/img/features-spellcheck-multilanguage.png 800 CKEditor 5 spell-checking feature.}

### Customizable user experience

Work as you like it - choose user interface approach from {@link builds/guides/overview several predefined builds}, add or remove features easily to your build with the [online builder](https://ckeditor.com/ckeditor-5/online-builder/) or utilize the {@link builds/guides/development/dll-builds DLL builds}. Then taylor the user interface to your needs with our customizable {@link features/toolbar editor toolbar} arranging features buttons, dropdowns and other items whatever way you need them.

{@img assets/img/toolbar.png 800 CKEditor 5 customizable UI.}

### Cross-platform interoperability

Do not get stopped by technology differences - CKEditor 5 offers cross-platform interoperability. Being a {@link framework/index web-based JavaScript framework} it works in any and all environments. What is more, you can easily use documents from other editors: easily paste content {@link features/paste-from-word from MS Word}, paste from {@link features/paste-from-google-docs from Google Docs} and we even have extended support for {@link features/paste-plain-text pasting plain text} to inherit formatting for convenience.

{@img assets/img/features-paste.png 800 CKEditor 5 paste features.}

## Backwards feature compatibility

If you want to migrate from CKEditor 4 to CKEditor 5, please check the {@link builds/guides/migration/migration-from-ckeditor-4 migration guide} for all the features that are already covered by the modern version.

## Feature availability

Plenty of these features are included by default in the predefined {@link builds/guides/overview CKEditor 5 builds} and are available out-of-the-box, like {@link features/autoformat autoformatting} or {@link features/keyboard-support keyboard support}.

However, some of the presented features need to be manually included in a customized CKEditor 5 build, for example the {@link features/markdown Markdown processor} which outputs Markdown instead of HTML. These plugins can also be easily and conveniently added to a custom build with the [CKEditor 5 online builder](https://ckeditor.com/ckeditor-5/online-builder/).

We also offer the flexibility of the {@link builds/guides/development/dll-builds DLL builds}, enabling the addition of new plugins into an existing build without the need to rebuild the installation.

## Feature examples

Each rich-text editor feature is presented on a separate page, with one or more working demos showcasing a feature along with some customization ideas that you can use in your implementation.

<info-box>
	**In most feature demos the number of features enabled is limited** to make the currently highlighted piece of functionality stand out more, as shown in the screenshots above. However, in your CKEditor 5 WYSIWYG editor implementation you are free to choose and combine any features you like from those available. This can be easily and conveniently done in the [CKEditor 5 online builder](https://ckeditor.com/ckeditor-5/online-builder/).
</info-box>

## Looking for more?

The examples mentioned above do not present all features included in CKEditor 5, nor does the list on the left panel. For example, some end-user features like undo and redo are quite self-explanatory and therefore only mentioned in the keyboard shortcuts guide.

CKEditor 5 is in active development now and new features are added all the time, while the existing ones are being expanded and improved. If you are missing anything in particular, feel free to [suggest a new feature](https://github.com/ckeditor/ckeditor5/issues/new?labels=type%3Afeature&template=2-feature-request.md) and share your feedback with us. If it has already been reported by someone else, upvote it 👍&nbsp; to show your support.

## How about creating your own features?

Probably the most exciting features are the ones you can develop on top of CKEditor 5 Framework!
We are gradually enhancing the {@link framework/index CKEditor 5 Framework documentation} together with {@link api/index API documentation}, hoping to give you a solid base for {@link framework/guides/creating-simple-plugin creating custom features}.

The official add-ons repository for CKEditor 4 reached an impressive number of over 300 add-ons created and published by the community. Now it is time for you to add your contributions to the brand new CKEditor 5!
