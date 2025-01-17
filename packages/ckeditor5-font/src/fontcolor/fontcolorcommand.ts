/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module font/fontcolor/fontcolorcommand
 */

import type { Editor } from 'ckeditor5/src/core.js';
import FontCommand from '../fontcommand.js';
import { FONT_COLOR } from '../utils.js';

/**
 * The font color command. It is used by {@link module:font/fontcolor/fontcolorediting~FontColorEditing}
 * to apply the font color.
 *
 * ```ts
 * editor.execute( 'fontColor', { value: 'rgb(250, 20, 20)' } );
 * ```
 *
 * **Note**: Executing the command with the `null` value removes the attribute from the model.
 */
export default class FontColorCommand extends FontCommand {
	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		super( editor, FONT_COLOR );
	}
}
