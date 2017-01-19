/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/imagealternatetext/imagealternatetextengine
 */

import ImageAlternateTextCommand from './imagealternatetextcommand';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

/**
 * The ImageAlternateTextEngine plugin.
 * Registers `imageAlternateText` command.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageAlternateTextEngine extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		this.editor.commands.set( 'imageAlternateText', new ImageAlternateTextCommand( this.editor ) );
	}
}
