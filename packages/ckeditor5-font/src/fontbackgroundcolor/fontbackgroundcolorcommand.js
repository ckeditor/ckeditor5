/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module font/fontbackgroundcolor/fontbackgroundcolorcommand
 */

import FontCommand from '../fontcommand';
import { FONT_BACKGROUND_COLOR } from '../utils';
export default class FontBackgroundColorCommand extends FontCommand {
	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor, FONT_BACKGROUND_COLOR );
	}
}
