/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import moduleUtils from '/tests/ckeditor5/_utils/module.js';

/**
 * General test utils for CKEditor.
 */
const utils = {
	/**
	 * Creates Sinon sandbox in {@link bender#sinon} and plugs `afterEach()` callback which
	 * restores all spies and stubs created in this sandbox.
	 *
	 * See https://github.com/ckeditor/ckeditor5-design/issues/72 and http://sinonjs.org/docs/#sinon-sandbox
	 *
	 * Usage:
	 *
	 *		// Directly in the test file:
	 *		testUtils.createSinonSandbox();
	 *
	 *		// Then inside tests you can use bender.sinon:
	 *		it( 'does something', () => {
	 *			testUtils.sinon.spy( obj, 'method' );
	 *		} );
	 */
	createSinonSandbox() {
		before( () => {
			utils.sinon = sinon.sandbox.create();
		} );

		afterEach( () => {
			utils.sinon.restore();
		} );
	},

	/**
	 * Defines CKEditor plugin which is a mock of an editor creator.
	 *
	 * The mocked creator is available under:
	 *
	 *		editor.plugins.get( 'creator-thename' );
	 *
	 * @param {String} creatorName Name of the creator.
	 * @param {Object} [proto] Prototype of the creator. Properties from the proto param will
	 * be copied to the prototype of the creator.
	 */
	defineEditorCreatorMock( creatorName, proto ) {
		moduleUtils.define( `creator-${ creatorName }/creator-${ creatorName }`, [ 'creator' ], ( Creator ) => {
			class TestCreator extends Creator {}

			if ( proto ) {
				for ( let propName in proto ) {
					TestCreator.prototype[ propName ] = proto[ propName ];
				}
			}

			return TestCreator;
		} );
	}
};

export default utils;
