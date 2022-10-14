/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module typing/typing
 */

import Plugin, { type PluginConstructor } from '@ckeditor/ckeditor5-core/src/plugin';
import Input from './input';
import Delete from './delete';

/**
 * The typing feature. It handles typing.
 *
 * This is a "glue" plugin which loads the {@link module:typing/input~Input} and {@link module:typing/delete~Delete}
 * plugins.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Typing extends Plugin {
	public static get requires(): Array<PluginConstructor> {
		return [ Input, Delete ];
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): string {
		return 'Typing';
	}
}

/**
 * The configuration of the typing features. Used by the features from the `@ckeditor/ckeditor5-typing` package.
 *
 * Read more in {@link module:typing/typing~TypingConfig}.
 *
 * @member {module:typing/typing~TypingConfig} module:core/editor/editorconfig~EditorConfig#typing
 */

/**
 * The configuration of the typing features. Used by the typing features in `@ckeditor/ckeditor5-typing` package.
 *
 *		ClassicEditor
 *			.create( editorElement, {
 * 				typing: ... // Typing feature options.
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 *
 * @interface TypingConfig
 */
declare module '@ckeditor/ckeditor5-core' {
	interface EditorConfig {
		typing?: TypingConfig;
	}
}

/**
 * The granularity of undo/redo for typing and deleting. The value `20` means (more or less) that a new undo step
 * is created every 20 characters are inserted or deleted.
 *
 * @member {Number} [module:typing/typing~TypingConfig#undoStep=20]
 */
export type TypingConfig = {
	undoStep?: number;
};
