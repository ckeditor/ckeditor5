---
category: features
---

# Code block

{@snippet features/build-code-block-source}

The {@link module:code-block/codeblock~CodeBlock} feature allows inserting and editing blocks of pre–formatted code into the editor. Code blocks have their [specific languages](#configuring-code-block-languages) (e.g. "Java" or "CSS") and support basic editing tools, for instance, [changing the line indentation](#changing-line-indentation) using the keyboard.

## Demo

{@snippet features/code-block}

## Configuring code block languages

Each code block can have its language. The language of the code block is represented as a CSS class set on the `<code>` element, both when editing and in the editor data:

```html
<pre><code class="language-javascript">window.alert( 'Hello world!' )</code></pre>
```

It is possible to configure which languages are available in the editor. You can use the {@link module:code-block/codeblock~CodeBlockConfig#languages `codeBlock.languages`} configuration and define your own languages. For example, the following editor supports only two languages (CSS and XML/HTML):

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		codeBlock: {
			languages: [
				{ class: 'language-css', label: 'CSS' },
				{ class: 'language-xml', label: 'HTML/XML' }
			]
		}
	} )
	.then( ... )
	.catch( ... );
```

{@snippet features/code-block-custom-languages}

<info-box>
	**Note**: The first language defined in the configuration is considered the default one. This means it will be applied to code blocks loaded from data that have no CSS `class` specified (or no  `class` matching the {@link module:code-block/codeblock~CodeBlockConfig#languages configuration}). It will also be used when creating new code blocks using the toolbar button. By default it is "Plain text" (`plaintext` CSS class).
</info-box>

### Integration with code highlighters

Although the live code block highlighting is impossible when editing in CKEditor 5 ([learn more](https://github.com/ckeditor/ckeditor5/issues/436#issuecomment-548399675)), the content can be highlighted when displayed in the frontend (e.g. in blog posts, messages, etc.).

The code language {@link module:code-block/codeblock~CodeBlockConfig#languages configuration} helps to integrate with external code highlighters (e.g. [highlight.js](https://highlightjs.org/) or [Prism](https://prismjs.com/)). Please refer to the documentation of the highlighter of your choice and make sure CSS classes configured in `codeBlock.languages` correspond with the code syntax auto–detection feature of the highlighter.

## Tips and tweaks

### Editing text around code blocks

There could be situations when there is no obvious way to set the caret before or after a block of code and type. This can happen when the code block is preceded or followed by a widget (e.g. a table) or when the code block is the first or the last child of the document (or both).

* To type **before the code block**: Put the selection at the beginning of the first line of the code block and press <kbd>Enter</kbd>. Move the selection to the empty line that has been created and press <kbd>Enter</kbd> again. A new paragraph will be created before the code block you can type in.
* To type **after the code block**: Put the selection at the end of the last line of the code block and press <kbd>Enter</kbd> twice. A new paragraph will be created after the code block you can type in.

### Changing line indentation

You can change the indentation of the code using keyboard shortcuts and toolbar buttons:

* To **increase** indentation: Select the line (or lines) you want to indent. Hit the <kbd>Tab</kbd> key or press the "Increase indent" button in the toolbar.
* To **decrease** indentation: Select the line (or lines) the indent should decrease. Hit the <kbd>Shift</kbd>+<kbd>Tab</kbd> keys or press the "Decrease indent" button in the toolbar.

<info-box>
	The indentation created this way can be changed. Use the {@link module:code-block/codeblock~CodeBlockConfig#indentSequence `codeBlock.indentSequence`} configuration to choose some other character (or characters) of your preference (e.g. four spaces). By default, the indentation changes by a single tab (`\t`) character.
</info-box>

<info-box>
	You can disable the indentation tools and their associated keystrokes altogether by setting the {@link module:code-block/codeblock~CodeBlockConfig#indentSequence `codeBlock.indentSequence`}  configuration `false`.
</info-box>

### Preserving line indentation

To speed up the editing, when typing in a code block, the indentation of the current line is preserved when you hit <kbd>Enter</kbd> and create a new line. If you want to change the indentation of the new line, take a look at [some easy ways to do that](#changing-line-indentation).

## Installation

To add this feature to your editor install the [`@ckeditor/ckeditor5-code-block`](https://www.npmjs.com/package/@ckeditor/ckeditor5-code-block) package:

```bash
npm install --save @ckeditor/ckeditor5-code-block
```

And add it to your plugin list and the toolbar configuration:

```js
import CodeBlock from '@ckeditor/ckeditor5-code-block/src/codeblock';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ CodeBlock, ... ],
		toolbar: [ 'codeBlock', ... ]
	} )
	.then( ... )
	.catch( ... );
```

<info-box info>
	Read more about {@link builds/guides/integration/installing-plugins installing plugins}.
</info-box>

## Common API

The {@link module:code-block/codeblock~CodeBlock} plugin registers:

* The `'codeBlock'` split button with a dropdown allowing to choose the language of the block,
* The {@link module:code-block/codeblockcommand~CodeBlockCommand `'codeBlock'`} command.

	The command converts selected editor content into a code block. If no content is selected, it creates a new code block at the place of the selection.

	You can choose which language the code block is written in when executing the command. The language will be set in the editor model and reflected as a CSS class visible in the editing view and the editor (data) output:

	```js
	editor.execute( 'codeBlock', { language: 'css' } );
	```

	When executing the command, you can use languages defined by the {@link module:code-block/codeblock~CodeBlockConfig#languages `codeBlock.languages`} configuration. Make sure the `language` you use corresponds to the `class` property in the configuration object.

	The default list of languages is as follows:

	```js
	codeBlock.languages: [
		{ class: 'language-plaintext', label: 'Plain text' }, // The default language.
		{ class: 'language-c', label: 'C' },
		{ class: 'language-cs', label: 'C#' },
		{ class: 'language-cpp', label: 'C++' },
		{ class: 'language-css', label: 'CSS' },
		{ class: 'language-diff', label: 'Diff' },
		{ class: 'language-xml', label: 'HTML/XML' },
		{ class: 'language-java', label: 'Java' },
		{ class: 'language-javascript', label: 'JavaScript' },
		{ class: 'language-php', label: 'PHP' },
		{ class: 'language-python', label: 'Python' },
		{ class: 'language-ruby', label: 'Ruby' },
		{ class: 'language-typescript', label: 'TypeScript' },
	]
	```

	**Note**: If you execute a command with a specific `language` when the selection is anchored in a code block and use the additional `forceValue: true` parameter, it will update the language of this particular block.

	```js
	editor.execute( 'codeBlock', { language: 'java', forceValue: true } );
	```

	**Note**: If the selection is already in a code block, executing the command will convert the block back into plain paragraphs.
* The {@link module:code-block/indentcodeblockcommand~IndentCodeBlockCommand `'indentCodeBlock'`} and {@link module:code-block/outdentcodeblockcommand~OutdentCodeBlockCommand `'outdentCodeBlock'`} commands.

	Both commands are used by the <kbd>Tab</kbd> and <kbd>Shift</kbd>+<kbd>Tab</kbd> keystrokes as described in [one of the chapters](#changing-line-indentation):

	* The former is enabled when the selection is anchored anywhere in the code block and allows increasing the indentation of the lines of code. The indentation character (sequence) is configurable using the {@link module:code-block/codeblock~CodeBlockConfig#indentSequence `codeBlock.indentSequence`} configuration.
	* The later is enabled when the indentation of any code lines within the selection can be decreased. Executing it will remove the indentation character (sequence) from those lines, as configured by {@link module:code-block/codeblock~CodeBlockConfig#indentSequence `codeBlock.indentSequence`}.

<info-box>
	We recommend using the official {@link framework/guides/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5-code-block.
