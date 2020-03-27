/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module code-block/codeblock
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import CodeBlockEditing from './codeblockediting';
import CodeBlockUI from './codeblockui';

/**
 * The code block plugin.
 *
 * For more information about this feature check the {@glink api/code-block package page} and the
 * {@glink features/code-blocks code block feature guide}.
 *
 * This is a "glue" plugin that loads the {@link module:code-block/codeblockediting~CodeBlockEditing code block editing feature}
 * and the {@link module:code-block/codeblockui~CodeBlockUI code block UI feature}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class CodeBlock extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ CodeBlockEditing, CodeBlockUI ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'CodeBlock';
	}
}

/**
 * The configuration of the {@link module:code-block/codeblock~CodeBlock} feature.
 *
 * Read more in {@link module:code-block/codeblock~CodeBlockConfig}.
 *
 * @member {module:code-block/codeblock~CodeBlockConfig} module:core/editor/editorconfig~EditorConfig#codeBlock
 */

/**
 * The configuration of the {@link module:code-block/codeblock~CodeBlock code block feature}.
 *
 *		ClassicEditor
 *			.create( editorElement, {
 *				codeBlock:  ... // The code block feature configuration.
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 *
 * @interface CodeBlockConfig
 */

/**
 * The code block language descriptor. See {@link module:code-block/codeblock~CodeBlockConfig#languages} to learn more.
 *
 *		{
 *			 language: 'javascript',
 *			 label: 'JavaScript'
 *		}
 *
 * @typedef {Object} module:code-block/codeblock~CodeBlockLanguageDefinition
 * @property {String} language The name of the language that will be stored in the model attribute. Also, when `class`
 * is not specified, it will be used to create the CSS class associated with the language (prefixed by "language-").
 * @property {String} label The human–readable label associated with the language and displayed in the UI.
 * @property {String} [class] The CSS class associated with the language. When not specified the `language`
 * property is used to create a class prefixed by "language-".
 */

/**
 * The list of code languages available in the user interface to choose for a particular code block.
 *
 * The language of the code block is represented as a CSS class (by default prefixed by "language-") set on the
 * `<code>` element, both when editing and in the editor data. The CSS class associated with the language
 * can be used by third–party code syntax highlighters to detect and apply the correct highlighting.
 *
 * For instance, this language configuration:
 *
 *		ClassicEditor
 *			.create( document.querySelector( '#editor' ), {
 *				codeBlock: {
 *					languages: [
 *						// ...
 *						{ language: 'javascript', label: 'JavaScript' },
 *						// ...
 *					]
 *				}
 *		} )
 *		.then( ... )
 *		.catch( ... );
 *
 * will result in the following structure of JavaScript code blocks in the editor editing and data:
 *
 *		<pre><code class="language-javascript">window.alert( 'Hello world!' )</code></pre>
 *
 * You can customize the CSS class by specifying an optional `class` property in the language definition.
 * You can set **multiple classes** but **only the first one** will be used as defining language class:
 *
 *		ClassicEditor
 *			.create( document.querySelector( '#editor' ), {
 *				codeBlock: {
 *					languages: [
 *						// Do not render the CSS class for the plain text code blocks.
 *						{ language: 'plaintext', label: 'Plain text', class: '' },
 *
 *						// Use the "php-code" class for PHP code blocks.
 *						{ language: 'php', label: 'PHP', class: 'php-code' },
 *
 *						// Use the "js" class for JavaScript code blocks.
 *						// Note that only the first ("js") class will determine the language of the block when loading data.
 *						{ language: 'javascript', label: 'JavaScript', class: 'js javascript js-code' },
 *
 *						// Python code blocks will have the default "language-python" CSS class.
 *						{ language: 'python', label: 'Python' }
 *					]
 *				}
 *		} )
 *		.then( ... )
 *		.catch( ... );
 *
 * The default value of the language configuration is as follows:
 *
 *		languages: [
 *			{ language: 'plaintext', label: 'Plain text' }, // The default language.
 *			{ language: 'c', label: 'C' },
 *			{ language: 'cs', label: 'C#' },
 *			{ language: 'cpp', label: 'C++' },
 *			{ language: 'css', label: 'CSS' },
 *			{ language: 'diff', label: 'Diff' },
 *			{ language: 'html', label: 'HTML' },
 *			{ language: 'java', label: 'Java' },
 *			{ language: 'javascript', label: 'JavaScript' },
 *			{ language: 'php', label: 'PHP' },
 *			{ language: 'python', label: 'Python' },
 *			{ language: 'ruby', label: 'Ruby' },
 *			{ language: 'typescript', label: 'TypeScript' },
 *			{ language: 'xml', label: 'XML' }
 *		]
 *
 * **Note**: The first language defined in the configuration is considered the default one. This means it will be
 * applied to code blocks loaded from the data that have no CSS `class` specified (or no matching `class` in the configuration).
 * It will also be used when creating new code blocks using the main UI button. By default it is "Plain text".
 *
 * @member {Array.<module:code-block/codeblock~CodeBlockLanguageDefinition>} module:code-block/codeblock~CodeBlockConfig#languages
 */

/**
 * A sequence of characters inserted or removed from the code block lines when its indentation
 * is changed by the user, for instance, using <kbd>Tab</kbd> and <kbd>Shift</kbd>+<kbd>Tab</kbd> keys.
 *
 * The default value is a single tab character ("	", `\u0009` in Unicode).
 *
 * This configuration is used by `indentCodeBlock` and `outdentCodeBlock` commands (instances of
 * {@link module:code-block/indentcodeblockcommand~IndentCodeBlockCommand}).
 *
 * **Note**: Setting this configuration to `false` will disable the code block indentation commands
 * and associated keystrokes.
 *
 * @member {String} module:code-block/codeblock~CodeBlockConfig#indentSequence
 */
