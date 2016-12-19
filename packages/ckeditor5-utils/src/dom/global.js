/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals window, document */

/**
 * @module utils/dom/global
 */

/**
 * A helper (module) giving an access to the global DOM objects such as `window` and
 * `document`. Accessing these objects using this helper allows easy and bulletproof
 * testing, i.e. stubbing native properties
 *
 *		import global from 'ckeditor5/utils/dom/global.js';
 *
 *		const window = global.window;
 *
 * 		// This stub will work for any code using global module in tests.
 *		testUtils.sinon.stub( window, 'innerWidth', 10000 );
 */
export default { document, window };
