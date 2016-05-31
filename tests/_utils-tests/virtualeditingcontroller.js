/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Editor from '/ckeditor5/editor/editor.js';
import VirtualEditingController from '/tests/ckeditor5/_utils/virtualeditingcontroller.js';

describe( 'VirtualEditingController', () => {
	describe( 'constructor', () => {
		it( 'sets necessary properties', () => {
			const editor = new Editor();
			const controller = new VirtualEditingController( editor.document );

			expect( controller ).to.have.property( 'model', editor.document );
			expect( controller ).to.have.property( 'view' );
			expect( controller ).to.have.property( 'modelToView' );
		} );
	} );
} );
