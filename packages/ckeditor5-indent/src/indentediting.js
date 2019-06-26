/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module core/indent/indentediting
 */

import Plugin from '../plugin';
import MultiCommand from '../multicommand';

/**
 * The indent editing feature.
 *
 * This plugin registers the `'indent'` and `'outdent'` commands.
 *
 * **Note**: In order the commands to work at least one of compatible features is required. Read more in
 * {@link module:core/indent/indent~Indent indent feature} api docs.
 *
 * @extends module:core/plugin~Plugin
 */
export default class IndentEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'IndentEditing';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

		editor.commands.add( 'indent', new MultiCommand( editor ) );
		editor.commands.add( 'outdent', new MultiCommand( editor ) );
	}
}
