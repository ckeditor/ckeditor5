/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor';
import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { upcastElementToElement } from '@ckeditor/ckeditor5-engine/src/conversion/upcast-converters';

import { downcastInsertTable } from '../../src/converters/downcast';
import upcastTable from '../../src/converters/upcasttable';
import { modelTable } from '../_utils/utils';
import { getColumns, getParentTable } from '../../src/commands/utils';

describe( 'commands utils', () => {
	let editor, model, root;

	beforeEach( () => {
		return ModelTestEditor.create()
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;

				root = model.document.getRoot( 'main' );

				const conversion = editor.conversion;
				const schema = model.schema;

				schema.register( 'table', {
					allowWhere: '$block',
					allowAttributes: [ 'headingRows' ],
					isBlock: true,
					isObject: true
				} );

				schema.register( 'tableRow', {
					allowIn: 'table',
					allowAttributes: [],
					isBlock: true,
					isLimit: true
				} );

				schema.register( 'tableCell', {
					allowIn: 'tableRow',
					allowContentOf: '$block',
					allowAttributes: [ 'colspan', 'rowspan' ],
					isBlock: true,
					isLimit: true
				} );

				model.schema.register( 'p', { inheritAllFrom: '$block' } );

				// Table conversion.
				conversion.for( 'upcast' ).add( upcastTable() );
				conversion.for( 'downcast' ).add( downcastInsertTable() );

				// Table row upcast only since downcast conversion is done in `downcastTable()`.
				conversion.for( 'upcast' ).add( upcastElementToElement( { model: 'tableRow', view: 'tr' } ) );

				// Table cell conversion.
				conversion.for( 'upcast' ).add( upcastElementToElement( { model: 'tableCell', view: 'td' } ) );
				conversion.for( 'upcast' ).add( upcastElementToElement( { model: 'tableCell', view: 'th' } ) );

				conversion.attributeToAttribute( { model: 'colspan', view: 'colspan' } );
				conversion.attributeToAttribute( { model: 'rowspan', view: 'rowspan' } );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( 'getParentTable()', () => {
		it( 'should return undefined if not in table', () => {
			setData( model, '<p>foo[]</p>' );

			expect( getParentTable( model.document.selection.focus ) ).to.be.undefined;
		} );

		it( 'should return table if position is in tableCell', () => {
			setData( model, modelTable( [ [ '[]' ] ] ) );

			const parentTable = getParentTable( model.document.selection.focus );

			expect( parentTable ).to.not.be.undefined;
			expect( parentTable.is( 'table' ) ).to.be.true;
		} );
	} );

	describe( 'getColumns()', () => {
		it( 'should return proper number of columns', () => {
			setData( model, modelTable( [
				[ '00', { colspan: 3, contents: '01' }, '04' ]
			] ) );

			expect( getColumns( root.getNodeByPath( [ 0 ] ) ) ).to.equal( 5 );
		} );
	} );
} );
