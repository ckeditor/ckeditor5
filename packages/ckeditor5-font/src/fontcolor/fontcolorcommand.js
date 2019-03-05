/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module font/fontcolor/fontcolorcommand
 */

import FontCommand from '../fontcommand';

export default class FontColorCommand extends FontCommand {
	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor, 'fontColor' );
	}
}
