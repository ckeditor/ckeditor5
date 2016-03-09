/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/**
 * A replacement for the {@link utils.Locale} class.
 *
 * @memberOf tests.utils._utils
 */
export default class Locale {
	constructor() {
		this.t = ( str ) => `t( ${ str } )`;
	}

	/**
	 * Injects instance of this class to the editor.
	 *
	 * @param {Editor} editor
	 */
	static inject( editor ) {
		editor.locale = new Locale();
		editor.t = editor.locale.t;
	}
}
