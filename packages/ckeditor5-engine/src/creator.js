/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/**
 * Basic creator class.
 *
 * @class Creator
 */

export default class Creator {
	constructor( editor ) {
		/**
		 * @readonly
		 * @property {core/Editor}
		 */
		this.editor = editor;
	}

	/**
	 * @returns {null/Promise}
	 */
	init() {}
}
