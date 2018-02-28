/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import TableEditing from '../src/tableediting';

describe( 'TableEditing', () => {
	let editor, model;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ TableEditing, Paragraph ]
			} )
			.then( newEditor => {
				editor = newEditor;

				model = editor.model;
			} );
	} );

	afterEach( () => {
		editor.destroy();
	} );

	it( 'should set proper schema rules', () => {
	} );

	describe( 'conversion in data pipeline', () => {
		describe( 'model to view', () => {
			it( 'should create tbody section', () => {
				setModelData( model, '<table><tableRow><tableCell>foo[]</tableCell></tableRow></table>' );

				expect( editor.getData() ).to.equal( '<table><tbody><tr><td>foo</td></tr></tbody></table>' );
			} );

			it( 'should create thead section', () => {
				setModelData( model, '<table headingRows="1"><tableRow><tableCell>foo[]</tableCell></tableRow></table>' );

				expect( editor.getData() ).to.equal( '<table><thead><tr><th>foo</th></tr></thead></table>' );
			} );

			it( 'should create thead and tbody sections in proper order', () => {
				setModelData( model, '<table headingRows="1">' +
					'<tableRow><tableCell>foo</tableCell></tableRow>' +
					'<tableRow><tableCell>bar</tableCell></tableRow>' +
					'<tableRow><tableCell>baz[]</tableCell></tableRow>' +
					'</table>'
				);

				expect( editor.getData() ).to.equal( '<table>' +
					'<thead><tr><th>foo</th></tr></thead>' +
					'<tbody><tr><td>bar</td></tr><tr><td>baz</td></tr></tbody>' +
					'</table>'
				);
			} );

			it( 'should convert rowspan on tableCell', () => {
				setModelData( model, '<table><tableRow><tableCell rowspan="2">foo[]</tableCell></tableRow></table>' );

				expect( editor.getData() ).to.equal( '<table><tbody><tr><td rowspan="2">foo</td></tr></tbody></table>' );
			} );

			it( 'should convert colspan on tableCell', () => {
				setModelData( model, '<table><tableRow><tableCell colspan="2">foo[]</tableCell></tableRow></table>' );

				expect( editor.getData() ).to.equal( '<table><tbody><tr><td colspan="2">foo</td></tr></tbody></table>' );
			} );
		} );

		describe( 'view to model', () => {
			it( 'should convert table', () => {
				editor.setData( '<table><tbody><tr><td>foo</td></tr></tbody></table>' );

				expect( getModelData( model, { withoutSelection: true } ) )
					.to.equal( '<table><tableRow><tableCell>foo</tableCell></tableRow></table>' );
			} );
		} );
	} );
} );
