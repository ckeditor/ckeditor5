/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: ui, toolbar */

'use strict';

import Toolbar from '/ckeditor5/core/ui/toolbar/toolbar.js';
import ControllerCollection from '/ckeditor5/core/ui/controllercollection.js';

describe( 'Toolbar', () => {
	let toolbar;

	beforeEach( () => {
		toolbar = new Toolbar();
	} );

	describe( 'constructor', () => {
		it( 'creates buttons collection', () => {
			expect( toolbar.collections.get( 'buttons' ) ).to.be.instanceof( ControllerCollection );
		} );
	} );
} );
