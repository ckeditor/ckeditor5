/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* jshint node: false, browser: true, globalstrict: true */
/* globals bender, before, afterEach, sinon */

'use strict';

( () => {
	/**
	 * Test tools for CKEditor.
	 *
	 * This is a main namespace for the test tools.
	 *
	 * * General tools go directly to `bender.tools.*`.
	 * * Core tools (introduced by `ckeditor5-core`) go to `bender.tools.core.*`.
	 * * Plugin tools (introduced by plugins) go to `bender.tools.plugin.<plugin-name>.*`.
	 *
	 * Tools for specific plugins or the core should be kept in `tests/_tools/tools.js` file
	 * of the respective repository. They can be loaded using Bender's `bender-include` directive.
	 * Their tests should be kept in `tests/bender/*` directory.
	 */
	bender.tools = {
		/**
		 * Creates Sinon sandbox in {@link bender#sinon} and plugs `afterEach()` callback which
		 * restores all spies and stubs created in this sandbox.
		 *
		 * See https://github.com/ckeditor/ckeditor5-design/issues/72 and http://sinonjs.org/docs/#sinon-sandbox
		 *
		 * Usage:
		 *
		 *		// Directly in the test file:
		 *		bender.tools.createSinonSandbox();
		 *
		 *		// Then inside tests you can use bender.sinon:
		 *		it( 'does something', () => {
		 *			bender.sinon.spy( obj, 'method' );
		 *		} );
		 */
		createSinonSandbox() {
			before( () => {
				bender.sinon = sinon.sandbox.create();
			} );

			afterEach( () => {
				bender.sinon.restore();
			} );
		}
	};
} )();
