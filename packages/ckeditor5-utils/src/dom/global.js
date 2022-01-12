/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window, document */

/**
 * @module utils/dom/global
 */

/**
 * A helper (module) giving an access to the global DOM objects such as `window` and
 * `document`. Accessing these objects using this helper allows easy and bulletproof
 * testing, i.e. stubbing native properties:
 *
 *		import global from 'ckeditor5/utils/dom/global.js';
 *
 *		// This stub will work for any code using global module.
 *		testUtils.sinon.stub( global, 'window', {
 *			innerWidth: 10000
 *		} );
 *
 *		console.log( global.window.innerWidth );
 */
export default { window, document };
