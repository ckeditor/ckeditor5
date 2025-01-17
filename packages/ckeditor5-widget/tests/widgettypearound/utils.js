/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Selection from '@ckeditor/ckeditor5-engine/src/model/selection.js';
import {
	TYPE_AROUND_SELECTION_ATTRIBUTE,
	getTypeAroundFakeCaretPosition
} from '../../src/widgettypearound/utils.js';

describe( 'widget type around utils', () => {
	let selection;

	beforeEach( () => {
		selection = new Selection();
	} );

	describe( 'TYPE_AROUND_SELECTION_ATTRIBUTE', () => {
		it( 'should be defined', () => {
			expect( TYPE_AROUND_SELECTION_ATTRIBUTE ).to.equal( 'widget-type-around' );
		} );
	} );

	describe( 'getTypeAroundFakeCaretPosition()', () => {
		it( 'should return "before" if the model selection attribute is "before"', () => {
			selection.setAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE, 'before' );

			expect( getTypeAroundFakeCaretPosition( selection ) ).to.equal( 'before' );
		} );

		it( 'should return "after" if the model selection attribute is "after"', () => {
			selection.setAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE, 'after' );

			expect( getTypeAroundFakeCaretPosition( selection ) ).to.equal( 'after' );
		} );

		it( 'should return undefined if the model selection attribute is not set', () => {
			expect( getTypeAroundFakeCaretPosition( selection ) ).to.be.undefined;
		} );
	} );
} );
