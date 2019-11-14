/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
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
 * For more information about this feature check the {@glink api/code-block package page}.
 *
 * This is a "glue" plugin which loads the {@link module:code-block/codeblockediting~CodeBlockEditing code block editing feature}
 * and {@link module:code-block/codeblockui~CodeBlockUI code block UI feature}.
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
 * 				codeBlock:  ... // Code block feature configuration.
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
 *			 class: 'javascript',
 *			 label: 'JavaScript'
 *		}
 *
 * @typedef {Object} module:code-block/codeblock~CodeBlockLanguageDefinition
 * @property {String} label The human–readable label associated with the language displayed in the UI.
 * @property {String} class The CSS class associated with the language.
 */

/**
 * The list of code languages available in the user interface to choose for a particular code block.
 * The language of the code block is represented as a CSS class set on the `<code>` element, both
 * when editing and in the editor data:
 *
 *		<pre><code class="javascript">window.alert( 'Hello world!' )</code></pre>
 *
 * The CSS class associated with the language can be then used by third–party code syntax
 * highlighters to detect and apply the correct highlighting. Use this configuration
 * to match requirements of your integration:
 *
 *		ClassicEditor
 *			.create( editorElement, {
 *				codeBlock: {
 *					languages: [
 * 						{ class: 'plaintext', label: 'Plain text' }, // The default language.
 *						{ class: 'php', label: 'PHP' },
 *						{ class: 'java', label: 'Java' },
 *						{ class: 'javascript', label: 'JavaScript' },
 *						{ class: 'python', label: 'Python' }
 *					]
 *				}
 *		} )
 *		.then( ... )
 *		.catch( ... );
 *
 * The default value is as follows:
 *
 *		languages: [
 *			{ class: 'plaintext', label: 'Plain text' }, // The default language.
 *			{ class: 'c', label: 'C' },
 *			{ class: 'cs', label: 'C#' },
 *			{ class: 'cpp', label: 'C++' },
 *			{ class: 'css', label: 'CSS' },
 *			{ class: 'diff', label: 'Diff' },
 *			{ class: 'xml', label: 'HTML/XML' },
 *			{ class: 'java', label: 'Java' },
 *			{ class: 'javascript', label: 'JavaScript' },
 *			{ class: 'php', label: 'PHP' },
 *			{ class: 'python', label: 'Python' },
 *			{ class: 'ruby', label: 'Ruby' },
 *			{ class: 'typescript', label: 'TypeScript' },
 *		]
 *
 * **Note**: The first language defined in the configuration is considered the default one. This means it will be
 * applied to code blocks loaded from data that have no CSS `class` specified (or no matching `class` in the config).
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
