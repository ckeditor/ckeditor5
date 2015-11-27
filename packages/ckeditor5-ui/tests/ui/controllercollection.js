/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: core, ui */

'use strict';

const modules = bender.amd.require( 'ckeditor', 'ui/controllercollection' );

bender.tools.createSinonSandbox();

describe( 'ControllerCollection', () => {
	describe( 'constructor', () => {
		it( 'should throw when no name is passed', () => {
			const ControllerCollection = modules[ 'ui/controllercollection' ];

			expect( () => {
				new ControllerCollection();
			} ).to.throw( /^ui-controllercollection-no-name/ );
		} );
	} );
} );
