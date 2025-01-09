/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module font/fontsize/fontsizecommand
 */

import type { Editor } from 'ckeditor5/src/core.js';
import FontCommand from '../fontcommand.js';
import { FONT_SIZE } from '../utils.js';

/**
 * The font size command. It is used by {@link module:font/fontsize/fontsizeediting~FontSizeEditing}
 * to apply the font size.
 *
 * ```ts
 * editor.execute( 'fontSize', { value: 'small' } );
 * ```
 *
 * **Note**: Executing the command without the value removes the attribute from the model.
 */
export default class FontSizeCommand extends FontCommand {
	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		super( editor, FONT_SIZE );
	}
}
