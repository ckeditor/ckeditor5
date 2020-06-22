/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Selection from '@ckeditor/ckeditor5-engine/src/model/selection';
import {
	TYPE_AROUND_SELECTION_ATTRIBUTE,
	getTypeAroundFakeCaretPosition
} from '../../src/widgettypearound/utils';

describe( 'widget type around utils', () => {
	let selection;

	beforeEach( () => {
		selection = new Selection();
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
