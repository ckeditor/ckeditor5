/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import TablesEditing from '../src/tablesediting';

import Paragraph from '../../ckeditor5-paragraph/src/paragraph';

import VirtualTestEditor from '../../ckeditor5-core/tests/_utils/virtualtesteditor';
import { getData as getModelData, setData as setModelData } from '../../ckeditor5-engine/src/dev-utils/model';

describe( 'TablesEditing', () => {
	let editor, model;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ TablesEditing, Paragraph ]
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

			it( 'should create tfoot section', () => {
				setModelData( model, '<table><tableRow isFooter="true"><tableCell>foo[]</tableCell></tableRow></table>' );

				expect( editor.getData() ).to.equal( '<table><tfoot><tr><td>foo</td></tr></tfoot></table>' );
			} );

			it( 'should create thead section', () => {
				setModelData( model, '<table><tableRow isHeading="true"><tableCell>foo[]</tableCell></tableRow></table>' );

				expect( editor.getData() ).to.equal( '<table><thead><tr><td>foo</td></tr></thead></table>' );
			} );

			it( 'should create thead, tbody and tfoot sections in proper order', () => {
				setModelData( model, '<table>' +
					'<tableRow><tableCell>foo[]</tableCell></tableRow>' +
					'<tableRow isFooter="true"><tableCell>foo[]</tableCell></tableRow>' +
					'<tableRow isHeading="true"><tableCell>foo[]</tableCell></tableRow>' +
					'</table>'
				);

				expect( editor.getData() ).to.equal( '<table>' +
					'<thead><tr><td>foo</td></tr></thead>' +
					'<tbody><tr><td>foo</td></tr></tbody>' +
					'<tfoot><tr><td>foo</td></tr></tfoot>' +
					'</table>'
				);
			} );

			it( 'should create th element for tableCell with attribute isHeading=true', () => {
				setModelData( model, '<table><tableRow isHeading="true"><tableCell isHeading="true">foo[]</tableCell></tableRow></table>' );

				expect( editor.getData() ).to.equal( '<table><thead><tr><th>foo</th></tr></thead></table>' );
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
			it( 'should convert image figure', () => {
				editor.setData( '<table><tbody><tr><td>foo</td></tr></tbody></table>' );

				expect( getModelData( model, { withoutSelection: true } ) )
					.to.equal( '<table><tableRow><tableCell>foo</tableCell></tableRow></table>' );
			} );
		} );
	} );
} );
