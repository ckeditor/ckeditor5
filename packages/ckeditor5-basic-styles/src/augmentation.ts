/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import type Superscript from './superscript';
import type Subscript from './subscript';
import type Bold from './bold';
import type Code from './code';
import type AttributeCommand from './attributecommand';
import type BoldUI from './bold/boldui';
import type CodeEditing from './code/codeediting';
import type CodeUI from './code/codeui';
import type Italic from './italic';
import type ItalicEditing from './italic/italicediting';
import type ItalicUI from './italic/italicui';
import type Strikethrough from './strikethrough';
import type StrikethroughEditing from './strikethrough/strikethroughediting';
import type StrikethroughUI from './strikethrough/strikethroughui';
import type SubscriptEditing from './subscript/subscriptediting';
import type SubscriptUI from './subscript/subscriptui';
import type SuperscriptEditing from './superscript/superscriptediting';
import type SuperscriptUI from './superscript/superscriptui';
import type Underline from './underline';
import type UnderlineEditing from './underline/underlineediting';
import type UnderlineUI from './underline/underlineui';

declare module '@ckeditor/ckeditor5-core' {
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
