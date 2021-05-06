/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module utils/spy
 */

/**
 * Creates a spy function (ala Sinon.js) that can be used to inspect call to it.
 *
 * The following are the present features:
 *
 * * spy.called: property set to `true` if the function has been called at least once.
 *
 * @returns {Function} The spy function.
 */
function spy() {
	return function spy() {
		spy.called = true;
	};
}

export default spy;
