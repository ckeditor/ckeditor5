/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module font/fontcolor/fontcolorcommand
 */

import FontCommand from '../fontcommand';
import { FONT_COLOR } from '../utils';

/**
 * The font color command. It is used by {@link module:font/fontcolor/fontcolorediting~FontColorEditing}
 * to apply the font color.
 *
 *		editor.execute( 'fontColor', { value: 'rgb(250, 20, 20)' } );
 *
 * **Note**: Executing the command with the `null` value removes the attribute from the model.
 *
 * @extends module:font/fontcommand~FontCommand
 */
export default class FontColorCommand extends FontCommand {
	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor, FONT_COLOR );
	}
}
