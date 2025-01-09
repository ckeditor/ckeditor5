/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type {
	Delete,
	DeleteCommand,
	Input,
	InsertTextCommand,
	TextTransformation,
	TwoStepCaretMovement,
	Typing,
	TypingConfig
} from './index.js';

declare module '@ckeditor/ckeditor5-core' {
	interface EditorConfig {

		/**
		 * The configuration of the typing features. Used by the features from the `@ckeditor/ckeditor5-typing` package.
		 *
		 * Read more in {@link module:typing/typingconfig~TypingConfig}.
		 */
		typing?: TypingConfig;
	}

	interface CommandsMap {
		deleteForward: DeleteCommand;
		delete: DeleteCommand;
		insertText: InsertTextCommand;
	}

	interface PluginsMap {
		[ Delete.pluginName ]: Delete;
		[ Input.pluginName ]: Input;
		[ TextTransformation.pluginName ]: TextTransformation;
		[ TwoStepCaretMovement.pluginName ]: TwoStepCaretMovement;
		[ Typing.pluginName ]: Typing;
	}
}
