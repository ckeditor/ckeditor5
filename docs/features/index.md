---
category: features
order: -999
feedback-widget: false
meta-title: CKEditor 5 features overview | CKEditor 5 Documentation
---

# CKEditor&nbsp;5 features overview

CKEditor&nbsp;5 has many features, and the number is constantly growing. You can find the most recent list of features on the left. In addition to working on new features, we also expand and improve the existing ones. Newly added or meaningfully updated feature guides are marked with a <span class="tree__item__badge tree__item__badge_new">NEW</span> icon. Premium features, which require an additional license to work, have a <span class="tree__item__badge tree__item__badge_premium"><span class="tree__item__badge__text">Premium feature</span></span> icon.

<span class="navigation-hint_mobile">
<info-box>
	Use the **main menu button in the upper-left corner** to navigate through the documentation.
</info-box>
</span>

## Using CKEditor&nbsp;5 features

Most of the editor features are accessible from a {@link features/toolbar highly configurable toolbar} (in fact, there are {@link features/blocktoolbar two of those}) offering buttons and dropdowns. Some features also have a dedicated contextual toolbar. You can also execute plenty of actions with {@link features/accessibility#keyboard-shortcuts keyboard shortcuts}.  CKEditor&nbsp;5 offers a dedicated {@link features/accessibility#displaying-keyboard-shortcuts-in-the-editor accessibility help dialog} that displays a list of all available keyboard shortcuts in a dialog. It can be opened by pressing <kbd>Alt</kbd> + <kbd>0</kbd> (on Windows) or <kbd>Option</kbd> + <kbd>0</kbd> (on macOS) or via toolbar. The entire user interface comes with a {@link features/ui-language multitude of translations} and it supports Right-to-Left (RTL) languages.

## CKEditor&nbsp;5 WYSIWYG editor features and functions

CKEditor&nbsp;5 features cover several functional areas. Listed below are some of the most useful ones.

### Formatting features

{@link features/basic-styles Basic text styles} include essentials like bold {@icon @ckeditor/ckeditor5-core/theme/icons/bold.svg Bold}, italics {@icon @ckeditor/ckeditor5-basic-styles/theme/icons/italic.svg Italic}, superscript {@icon @ckeditor/ckeditor5-basic-styles/theme/icons/superscript.svg Superscript}, and subscript {@icon @ckeditor/ckeditor5-basic-styles/theme/icons/subscript.svg Subscript} as well as inline code formatting and more.

The {@link features/font font feature} provides support for using different font families {@icon @ckeditor/ckeditor5-font/theme/icons/font-family.svg Font Family}, controlling the font size {@icon @ckeditor/ckeditor5-font/theme/icons/font-size.svg Font Size} as well as font {@icon @ckeditor/ckeditor5-font/theme/icons/font-color.svg Font Color} and background colors {@icon @ckeditor/ckeditor5-font/theme/icons/font-background.svg Background Colors}.

{@link features/headings Headings} {@icon @ckeditor/ckeditor5-core/theme/icons/heading1.svg Heading 1} (with configurable levels and styles) and the {@link features/text-alignment text alignment feature} {@icon @ckeditor/ckeditor5-core/theme/icons/align-left.svg Align Left} help organize the structure of the document.

You can apply most of these formatting options from the {@link features/toolbar toolbar} or on the go, as you type, thanks to the {@link features/autoformat autoformatting feature} that employs Markdown syntax. You can remove them with the {@link features/remove-format remove format feature} {@icon @ckeditor/ckeditor5-remove-format/theme/icons/remove-format.svg Remove Format}.

{@img assets/img/features-basic-formatting.png 800 CKEditor&nbsp;5 formatting features.}

### Advanced content editing

Rich text would not be rich without images. You can upload, caption, edit, or style them. You can even paste them straight from the URL with the help of the {@link features/images-overview image feature} {@icon @ckeditor/ckeditor5-core/theme/icons/image-upload.svg Image} and create a responsive design. If that is not enough, {@link features/media-embed embed media} {@icon @ckeditor/ckeditor5-media-embed/theme/icons/media.svg Media} into your content.

{@link features/link Links} {@icon @ckeditor/ckeditor5-link/theme/icons/link.svg Link} are an essential feature for online content. You can paste, change, or attribute them.

Provide clear and accessible data using {@link features/tables tables} {@icon @ckeditor/ckeditor5-core/theme/icons/table.svg Table} (you can even nest them to create advanced layouts), ordered {@icon @ckeditor/ckeditor5-core/theme/icons/numberedlist.svg Numbered List} and unordered {@link features/lists lists} {@icon @ckeditor/ckeditor5-core/theme/icons/bulletedlist.svg Bulleted List} with various markers to choose from, and {@link features/todo-lists to-do lists} {@icon @ckeditor/ckeditor5-core/theme/icons/todolist.svg To-do List}. Use {@link features/indent indents and outdents} {@icon @ckeditor/ckeditor5-core/theme/icons/indent.svg Indent} and {@link features/block-quote block quotes} {@icon @ckeditor/ckeditor5-core/theme/icons/quote.svg Quote} to structure the content and draw the reader's attention to it.

Enrich your content further by {@link features/html-embed embedding HTML code} {@icon @ckeditor/ckeditor5-core/theme/icons/html.svg HTML} &ndash; this one is useful for webmasters. If you need to present code instead of employing it, use the {@link features/code-blocks code block} {@icon @ckeditor/ckeditor5-core/theme/icons/codeblock.svg Code Block} that lets you produce code listing with a syntax highlight, too!

{@img assets/img/features-images.png 800 CKEditor&nbsp;5 image feature.}

### Collaboration

We created the {@link framework/index CKEditor&nbsp;5 Framework} with {@link features/collaboration collaboration} in mind.

All collaboration features manage user data and permissions with the {@link features/users users API}. {@link features/track-changes Track changes} {@icon @ckeditor/ckeditor5-track-changes/theme/icons/track-changes.svg Track changes} allows the users to follow any changes made to the edited document both asynchronously and in real time. The users accept or reject these changes with a single click from a convenient side panel.

Where tracking changes is not enough, the {@link features/comments comments} {@icon @ckeditor/ckeditor5-comments/theme/icons/add-comment.svg Comments} come in, offering a perfect collaborative communication platform for writing and editing as a team. When you resolve a discussion, it moves to the comments archive.

Additionally, CKEditor&nbsp;5 offers the {@link features/restricted-editing restricted editing mode} {@icon @ckeditor/ckeditor5-restricted-editing/theme/icons/contentunlock.svg Enable editing} where just the selected parts of the content may be edited by some users, based on a permissions system. And when there is a need for even more control, there are the {@link features/read-only read-only} and {@link features/comments-only-mode comments-only} modes that let the user access the content, but not edit it.

{@img assets/img/features-collaboration.png 800 CKEditor&nbsp;5 collaboration features.}

You can also track the progress and changes done in the content with the {@link features/revision-history revision history feature} {@icon @ckeditor/ckeditor5-core/theme/icons/history.svg Revision history}. This robust document versioning tool lets you create named versions, compare changes, and restore previous document versions. It tracks all progress &ndash; also when many editors work together.

{@img assets/img/features-revision-history.png 800 CKEditor&nbsp;5 document versioning feature.}

### Document conversion

If you need to share the document outside your team, use the {@link features/export-pdf export to PDF feature} {@icon @ckeditor/ckeditor5-export-pdf/theme/icons/exportpdf.svg Export to PDF} to produce industry-standard, portable, cross-platform files.

If you need to work further on the document, choose the {@link features/export-word export to Word feature} {@icon @ckeditor/ckeditor5-export-word/theme/icons/exportword.svg Export to Word} instead &ndash; and keep your comments and changes in the resulting document, ready to edit further.

The {@link features/pagination pagination feature} {@icon @ckeditor/ckeditor5-pagination/theme/icons/arrow-up.svg Previous page}{@icon @ckeditor/ckeditor5-pagination/theme/icons/arrow-down.svg Next page} complements the exports to ensure all produced documents will always look the way they should.

If you have any documents in the DOCX format, you can convert them into HTML with the {@link features/import-word import from Word feature} and then continue editing in CKEditor&nbsp;5.

### HTML and Markdown output

The CKEditor&nbsp;5 WYSIWYG editor by default produces HTML output that you can save into a database. The default output can be also switched to {@link features/markdown GitHub-flavored Markdown} formatted text.

{@img assets/img/features-output.png 800 CKEditor&nbsp;5 output features.}

### Productivity pack

The {@link features/productivity-pack productivity pack} is a set of exclusive premium features available to holders of a CKEditor&nbsp;5 commercial license.

The productivity pack provides tools that make the creation of content faster and more efficient, thanks to providing predefined {@link features/template templates} {@icon ckeditor5-collaboration/theme/icons/template.svg} and a new set of {@link features/slash-commands slash commands}.

{@link features/document-outline Document outline} {@icon ckeditor5-collaboration/theme/icons/table-of-contents.svg} and {@link features/table-of-contents table of contents} {@icon ckeditor5-collaboration/theme/icons/table-of-contents.svg} make navigating large documents much easier.

{@link features/format-painter Format painter} {@icon ckeditor5-collaboration/theme/icons/paint-roller.svg} lets the users style their content in a blaze while the {@link features/case-change case change feature} {@icon ckeditor5-collaboration/theme/icons/case-change.svg Case change} lets them apply the title case to selected sentences or turn whole paragraphs into uppercase.

Productivity pack also includes the {@link features/paste-from-office-enhanced enhanced paste from Office} plugin with far greater formatting support.

### Other productivity features

The {@link features/ai-assistant-overview AI Assistant} {@icon ckeditor5-collaboration/theme/icons/robot-pencil.svg AI Assistant} will help you rewrite, edit, or translate the existing content to match your needs, or even come up with a completely new one!

The {@link features/word-count word and character counter} will help you track progress and control the volume of the content.

Use {@link features/autoformat Markdown syntax} to format content on the go to speed up the editing process. Thanks to {@link features/text-transformation automatic text transformations} (also known as autocorrect) and the {@link features/spelling-and-grammar-checking spell checker} {@icon @webspellchecker/wproofreader-ckeditor5/theme/icons/wproofreader.svg Spell and grammar check} you can ensure everything is correct. Create multi-language documents and correct them on the go with automatic language detection and {@link features/language text part language} feature.

Keep full control of your work. Be safe and never lose anything thanks to the {@link features/real-time-collaboration-integration#the-autosave-plugin autosave plugin}.

{@img assets/img/features-ai-assistant.png 800 CKEditor&nbsp;5 AI Assistant feature.}

### Customizable user experience

Work as you like it &ndash; choose a user interface approach from {@link installation/getting-started/predefined-builds several predefined builds}, add features to your build or remove them with the [online builder](https://ckeditor.com/ckeditor-5/online-builder/), or use the {@link installation/advanced/dll-builds DLL builds}. Then tailor the user interface to your needs with a customizable {@link features/toolbar editor toolbar}, arranging feature buttons, dropdowns, and other items in whatever way you need.

{@img assets/img/full-toolbar.png 938 CKEditor&nbsp;5 customizable UI.}

### Cross-platform interoperability

Do not get stopped by technology differences &ndash; CKEditor&nbsp;5 offers cross-platform interoperability. As a {@link framework/index web-based JavaScript framework} it works in all environments. What is more, you can use documents from other tools: paste content {@link features/paste-from-office from Microsoft Office} or from {@link features/paste-from-google-docs from Google Docs} and preserve all formatting.

The editor supports {@link features/paste-plain-text pasting plain text} and {@link features/paste-markdown Markdown-formatted content} to inherit the original document structure.

{@img assets/img/features-paste.png 800 CKEditor&nbsp;5 paste features.}

## Backward feature compatibility

If you want to migrate from CKEditor 4 to CKEditor&nbsp;5, check the {@link updating/migration-from-ckeditor-4 migration guide}.

## Feature availability

Predefined {@link installation/getting-started/predefined-builds CKEditor&nbsp;5 builds} have plenty of these features available out-of-the-box, like {@link features/autoformat autoformatting} or {@link features/accessibility#keyboard-shortcuts keyboard support}.

However, you need to include some presented features manually in your CKEditor&nbsp;5 build, for example, the {@link features/markdown Markdown processor} which outputs Markdown instead of HTML. You can add these plugins to a custom build with the [CKEditor&nbsp;5 online builder](https://ckeditor.com/ckeditor-5/online-builder/).

You can refer to the {@link installation/getting-started/predefined-builds#list-of-plugins-included-in-the-ckeditor-5-predefined-builds full list of features available in each build} for details.

We also offer the flexibility of the {@link installation/advanced/dll-builds DLL builds}. They enable the addition of new plugins into an existing build without the need to rebuild the installation.

## Feature examples

We present each rich-text editor feature on a separate page. It includes one or more working demos showcasing a feature along with some customization ideas that you can use in your implementation.

<info-box>
	**In most feature demos the number of features enabled is limited** to make the exposed piece of functionality stand out more, as shown in the screenshots above. But in your CKEditor&nbsp;5 WYSIWYG editor implementation you are free to choose and combine any features you like from those available. You can achieve this by using the [CKEditor&nbsp;5 online builder](https://ckeditor.com/ckeditor-5/online-builder/).
</info-box>

## Why does the editor filter out content (styles, classes, elements)

CKEditor 5 implements a custom {@link framework/architecture/editing-engine data model}. This means that the editor needs to convert every piece of loaded content to that model and then render it back to the view.

Each kind of content must be handled by some feature. For example, the [`ckeditor5-basic-styles`](https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles) package handles HTML elements such as `<b>`, `<i>`, `<u>`, etc. along with their representation in the model. The feature defines the two–way conversion between the HTML (view) and the editor model.

If you load some content unknown to any editor feature, the editor will drop it. If you want the editor to handle all the HTML5 elements, you need to write plugins to support them or use the {@link features/general-html-support General HTML Support (GHS)} feature. Once you do that, CKEditor&nbsp;5 will not filter anything out.

## Looking for more

The examples mentioned here do not present all features included in CKEditor&nbsp;5, nor does the list on the left panel. For example, some end-user features like undo and redo are quite self-explanatory. They are mentioned, for example, in the keyboard shortcuts guide.

CKEditor&nbsp;5 is in active development and we add new features to it all the time. We also work on expanding and improving the existing ones. If you are missing anything in particular, feel free to [suggest a new feature](https://github.com/ckeditor/ckeditor5/issues/new?labels=type%3Afeature&template=2-feature-request.md) and share your feedback with us. If it has already been reported by someone else, upvote it 👍&nbsp; to show your support.

## Creating custom features

Probably the most exciting features are the ones you can develop on top of CKEditor&nbsp;5 Framework!

We are gradually enhancing the {@link framework/index CKEditor&nbsp;5 Framework documentation} together with the {@link api/index API documentation}, hoping to give you a solid base for {@link tutorials/crash-course/editor creating custom features}.

The official add-ons repository for CKEditor 4 reached an impressive number of over 300 add-ons created and published by the community. Now it is time for you to add your contributions to CKEditor&nbsp;5!
