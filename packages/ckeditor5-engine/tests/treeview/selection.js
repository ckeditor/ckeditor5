/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treeview */

'use strict';

import Selection from '/ckeditor5/engine/treeview/selection.js';
import Range from '/ckeditor5/engine/treeview/range.js';
import Element from '/ckeditor5/engine/treeview/element.js';
import CKEditorError from '/ckeditor5/utils/ckeditorerror.js';

describe( 'Selection', () => {
	let selection;

	beforeEach( () => {
		selection = new Selection();
	} );

	describe( 'addRange', () => {
		it( 'should throw when range is intersecting with already added range', () => {
			const el = new Element( 'p' );
			const range1 = Range.createFromParentsAndOffsets( el, 5, el, 10 );
			const range2 = Range.createFromParentsAndOffsets( el, 7, el, 15 );
			selection.addRange( range1 );
			expect( () => {
				selection.addRange( range2 );
			} ).to.throw( CKEditorError, 'view-selection-range-intersects' );

			expect( () => {
				selection.addRange( range1 );
			} ).to.throw( CKEditorError, 'view-selection-range-intersects' );
		} );
	} );
} );