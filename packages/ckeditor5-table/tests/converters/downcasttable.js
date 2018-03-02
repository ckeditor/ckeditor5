/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import downcastTable from '../../src/converters/downcasttable';

describe( 'downcastTable()', () => {
	let editor, model, viewDocument;

	beforeEach( () => {
		return VirtualTestEditor.create()
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				viewDocument = editor.editing.view;

				const conversion = editor.conversion;
				const schema = model.schema;

				schema.register( 'table', {
					allowWhere: '$block',
					allowAttributes: [ 'headingRows', 'headingColumns' ],
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

				conversion.for( 'downcast' ).add( downcastTable() );
				conversion.attributeToAttribute( { model: 'colspan', view: 'colspan' } );
				conversion.attributeToAttribute( { model: 'rowspan', view: 'rowspan' } );
			} );
	} );

	it( 'should create table with tbody', () => {
		setModelData( model,
			'<table>' +
			'<tableRow><tableCell></tableCell></tableRow>' +
			'</table>'
		);

		expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
			'<table>' +
			'<tbody>' +
			'<tr><td></td></tr>' +
			'</tbody>' +
			'</table>'
		);
	} );

	it( 'should create table with tbody and thead', () => {
		setModelData( model,
			'<table headingRows="1">' +
			'<tableRow><tableCell>1</tableCell></tableRow>' +
			'<tableRow><tableCell>2</tableCell></tableRow>' +
			'</table>'
		);

		expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
			'<table>' +
			'<thead>' +
			'<tr><th>1</th></tr>' +
			'</thead>' +
			'<tbody>' +
			'<tr><td>2</td></tr>' +
			'</tbody>' +
			'</table>'
		);
	} );

	it( 'should create table with thead', () => {
		setModelData( model,
			'<table headingRows="2">' +
			'<tableRow><tableCell>1</tableCell></tableRow>' +
			'<tableRow><tableCell>2</tableCell></tableRow>' +
			'</table>'
		);

		expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
			'<table>' +
			'<thead>' +
			'<tr><th>1</th></tr>' +
			'<tr><th>2</th></tr>' +
			'</thead>' +
			'</table>'
		);
	} );

	it( 'should create table with heading columns and rows', () => {
		setModelData( model,
			'<table headingColumns="3" headingRows="1">' +
			'<tableRow>' +
			'<tableCell>11</tableCell><tableCell>12</tableCell><tableCell>13</tableCell><tableCell>14</tableCell>' +
			'</tableRow>' +
			'<tableRow>' +
			'<tableCell>21</tableCell><tableCell>22</tableCell><tableCell>23</tableCell><tableCell>24</tableCell>' +
			'</tableRow>' +
			'</table>'
		);

		expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
			'<table>' +
			'<thead>' +
			'<tr><th>11</th><th>12</th><th>13</th><th>14</th></tr>' +
			'</thead>' +
			'<tbody>' +
			'<tr><th>21</th><th>22</th><th>23</th><td>24</td></tr>' +
			'</tbody>' +
			'</table>'
		);
	} );

	it( 'should be possible to overwrite', () => {
		editor.conversion.elementToElement( { model: 'tableRow', view: 'tr' } );
		editor.conversion.elementToElement( { model: 'tableCell', view: 'td' } );
		editor.conversion.for( 'downcast' ).add( dispatcher => {
			dispatcher.on( 'insert:table', ( evt, data, conversionApi ) => {
				conversionApi.consumable.consume( data.item, 'insert' );

				const tableElement = conversionApi.writer.createContainerElement( 'table', { foo: 'bar' } );
				const viewPosition = conversionApi.mapper.toViewPosition( data.range.start );

				conversionApi.mapper.bindElements( data.item, tableElement );
				conversionApi.writer.insert( viewPosition, tableElement );
			}, { priority: 'high' } );
		} );

		setModelData( model,
			'<table>' +
			'<tableRow><tableCell></tableCell></tableRow>' +
			'</table>'
		);

		expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
			'<table foo="bar">' +
			'<tr><td></td></tr>' +
			'</table>'
		);
	} );

	describe( 'headingColumns attribute', () => {
		it( 'should mark heading columns table cells', () => {
			setModelData( model,
				'<table headingColumns="2">' +
				'<tableRow><tableCell>11</tableCell><tableCell>12</tableCell><tableCell>13</tableCell></tableRow>' +
				'<tableRow><tableCell>21</tableCell><tableCell>22</tableCell><tableCell>23</tableCell></tableRow>' +
				'</table>'
			);

			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
				'<table>' +
				'<tbody>' +
				'<tr><th>11</th><th>12</th><td>13</td></tr>' +
				'<tr><th>21</th><th>22</th><td>23</td></tr>' +
				'</tbody>' +
				'</table>'
			);
		} );

		it( 'should mark heading columns table cells when one has colspan attribute', () => {
			setModelData( model,
				'<table headingColumns="3">' +
				'<tableRow>' +
				'<tableCell>11</tableCell><tableCell>12</tableCell><tableCell>13</tableCell><tableCell>14</tableCell>' +
				'</tableRow>' +
				'<tableRow><tableCell colspan="2">21</tableCell><tableCell>23</tableCell><tableCell>24</tableCell></tableRow>' +
				'</table>'
			);

			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
				'<table>' +
				'<tbody>' +
				'<tr><th>11</th><th>12</th><th>13</th><td>14</td></tr>' +
				'<tr><th colspan="2">21</th><th>23</th><td>24</td></tr>' +
				'</tbody>' +
				'</table>'
			);
		} );

		it( 'should work with colspan and rowspan attributes on table cells', () => {
			// The table in this test looks like a table below:
			//
			//   Row headings | Normal cells
			//                |
			// +----+----+----+----+
			// | 11 | 12 | 13 | 14 |
			// |    +----+    +----+
			// |    | 22 |    | 24 |
			// |----+----+    +----+
			// | 31      |    | 34 |
			// |         +----+----+
			// |         | 43 | 44 |
			// +----+----+----+----+

			setModelData( model,
				'<table headingColumns="3">' +
				'<tableRow>' +
				'<tableCell rowspan="2">11</tableCell>' +
				'<tableCell>12</tableCell>' +
				'<tableCell rowspan="3">13</tableCell>' +
				'<tableCell>14</tableCell>' +
				'</tableRow>' +
				'<tableRow><tableCell>22</tableCell><tableCell>24</tableCell></tableRow>' +
				'<tableRow><tableCell colspan="2" rowspan="2">31</tableCell><tableCell>34</tableCell></tableRow>' +
				'<tableRow><tableCell>43</tableCell><tableCell>44</tableCell></tableRow>' +
				'</table>'
			);

			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal(
				'<table>' +
				'<tbody>' +
				'<tr><th rowspan="2">11</th><th>12</th><th rowspan="3">13</th><td>14</td></tr>' +
				'<tr><th>22</th><td>24</td></tr>' +
				'<tr><th colspan="2" rowspan="2">31</th><td>34</td></tr>' +
				'<tr><th>43</th><td>44</td></tr>' +
				'</tbody>' +
				'</table>'
			);
		} );
	} );
} );
