/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/imagetextalternative/imagetextalternativeengine
 */

import ImageTextAlternativeCommand from './imagetextalternativecommand';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

/**
 * The ImageTextAlternativeEngine plugin.
 * Registers `imageTextAlternative` command.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageTextAlternativeEngine extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		this.editor.commands.set( 'imageTextAlternative', new ImageTextAlternativeCommand( this.editor ) );
	}
}
