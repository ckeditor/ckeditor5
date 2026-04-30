/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type {
	Superscript,
	Subscript,
	Bold,
	Code,
	AttributeCommand,
	BoldUI,
	CodeEditing,
	CodeUI,
	Italic,
	ItalicEditing,
	ItalicUI,
	Strikethrough,
	StrikethroughEditing,
	StrikethroughUI,
	BasicStyleSubscriptConfig,
	SubscriptEditing,
	SubscriptUI,
	BasicStyleSuperscriptConfig,
	SuperscriptEditing,
	SuperscriptUI,
	Underline,
	UnderlineEditing,
	UnderlineUI
} from './index.js';

declare module '@ckeditor/ckeditor5-core' {
	interface EditorConfig {

		/**
		 * The configuration of the {@link module:basic-styles/superscript~Superscript superscript feature}.
		 *
		 * Read more in {@link module:basic-styles/superscriptconfig~BasicStyleSuperscriptConfig}.
		 */
		superscript?: BasicStyleSuperscriptConfig;

		/**
		 * The configuration of the {@link module:basic-styles/subscript~Subscript subscript feature}.
		 *
		 * Read more in {@link module:basic-styles/subscriptconfig~BasicStyleSubscriptConfig}.
		 */
		subscript?: BasicStyleSubscriptConfig;
	}

	interface PluginsMap {
		[ Superscript.pluginName ]: Superscript;
		[ Subscript.pluginName ]: Subscript;
		[ Bold.pluginName ]: Bold;
		[ Code.pluginName ]: Code;
		[ Code.pluginName ]: Code;
		[ Code.pluginName ]: Code;
		[ BoldUI.pluginName ]: BoldUI;
		[ CodeEditing.pluginName ]: CodeEditing;
		[ CodeUI.pluginName ]: CodeUI;
		[ Italic.pluginName ]: Italic;
		[ ItalicEditing.pluginName ]: ItalicEditing;
		[ ItalicUI.pluginName ]: ItalicUI;
		[ Strikethrough.pluginName ]: Strikethrough;
		[ StrikethroughEditing.pluginName ]: StrikethroughEditing;
		[ StrikethroughUI.pluginName ]: StrikethroughUI;
		[ SubscriptEditing.pluginName ]: SubscriptEditing;
		[ SubscriptUI.pluginName ]: SubscriptUI;
		[ SuperscriptEditing.pluginName ]: SuperscriptEditing;
		[ SuperscriptUI.pluginName ]: SuperscriptUI;
		[ Underline.pluginName ]: Underline;
		[ UnderlineEditing.pluginName ]: UnderlineEditing;
		[ UnderlineUI.pluginName ]: UnderlineUI;
	}

	interface CommandsMap {
		bold: AttributeCommand;
		code: AttributeCommand;
		italic: AttributeCommand;
		strikethrough: AttributeCommand;
		subscript: AttributeCommand;
		superscript: AttributeCommand;
		underline: AttributeCommand;
	}
}
