/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Paragraph from '/ckeditor5/paragraph/paragraph.js';
import Editor from '/ckeditor5/editor.js';
import StandardCreator from '/ckeditor5/creator/standardcreator.js';

describe( 'Paragraph feature', () => {
	let editor;

	beforeEach( () => {
		editor = new Editor( null, {
			creator: StandardCreator,
			features: [ Paragraph ]
		} );

		return editor.init();
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( Paragraph ) ).to.be.instanceOf( Paragraph );
	} );
} );
