/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module font/fontfamily/fontfamilycommand
 */

import type { Editor } from 'ckeditor5/src/core.js';
import FontCommand from '../fontcommand.js';
import { FONT_FAMILY } from '../utils.js';

/**
 * The font family command. It is used by {@link module:font/fontfamily/fontfamilyediting~FontFamilyEditing}
 * to apply the font family.
 *
 * ```ts
 * editor.execute( 'fontFamily', { value: 'Arial' } );
 * ```
 *
 * **Note**: Executing the command without the value removes the attribute from the model.
 */
export default class FontFamilyCommand extends FontCommand {
	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		super( editor, FONT_FAMILY );
	}
}
