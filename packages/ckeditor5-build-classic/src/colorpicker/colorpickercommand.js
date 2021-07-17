/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import FontCommand from '@ckeditor/ckeditor5-font/src/fontcommand';
import { FONT_COLOR } from '@ckeditor/ckeditor5-font/src/utils';

/**
 * The font color command. It is used to apply the font color.
 *
 *		editor.execute( 'fontColor', { value: 'rgb(250, 20, 20)' } );
 *
 * **Note**: Executing the command with the `null` value removes the attribute from the model.
 *
 * @extends module:font/fontcommand~FontCommand
 */
export default class ColorpickerCommand extends FontCommand {
	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor, FONT_COLOR );
	}
}
