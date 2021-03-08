/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import TableCaptionEditing from '../../src/tablecaption/tablecaptionediting';
import TableEditing from '../../src/tableediting';

describe( 'TableCaptionEditing', () => {
	let editor, model;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ TableEditing, TableCaptionEditing, Paragraph, TableCaptionEditing ]
			} )
			.then( newEditor => {
				editor = newEditor;

				model = editor.model;
			} );
	} );

	afterEach( () => {
		editor.destroy();
	} );

	it( 'should have pluginName', () => {
		expect( TableCaptionEditing.pluginName ).to.equal( 'TableCaptionEditing' );
	} );

	it( 'should set proper schema rules', () => {
		// Table:
		expect( model.schema.isRegistered( 'table' ) ).to.be.true;
		expect( model.schema.isObject( 'table' ) ).to.be.true;
		expect( model.schema.isBlock( 'table' ) ).to.be.true;

		expect( model.schema.checkChild( [ '$root' ], 'table' ) ).to.be.true;
		expect( model.schema.checkAttribute( [ '$root', 'table' ], 'headingRows' ) ).to.be.true;
		expect( model.schema.checkAttribute( [ '$root', 'table' ], 'headingColumns' ) ).to.be.true;
	} );

	describe( 'conversion in data pipeline', () => {
		describe( 'model to view', () => {
			it( 'should convert to figure > table + figcaption', () => {
				setModelData( model,
					'<table>' +
						'<tableRow>' +
							'<tableCell>' +
								'<paragraph>foobar</paragraph>' +
							'</tableCell>' +
						'</tableRow>' +
						'<caption>Foo caption</caption>' +
					'</table>'
				);

				expect( editor.getData() ).to.equal(
					'<figure class="table">' +
						'<table>' +
							'<tbody>' +
								'<tr>' +
									'<td>foobar</td>' +
								'</tr>' +
							'</tbody>' +
						'</table>' +
						'<figcaption>Foo caption</figcaption>' +
					'</figure>'
				);
			} );
		} );

		describe( 'view to model', () => {
			it( 'should convert a table with <caption>', () => {
				editor.setData(
					'<table>' +
						'<caption>Foo caption</caption>' +
						'<tbody>' +
							'<tr>' +
								'<td>' +
									'foobar' +
								'</td>' +
							'</tr>' +
						'</tbody>' +
					'</table>'
				);

				expect( getModelData( model, { withoutSelection: true } ) )
					.to.equal( String(
						'<table>' +
							'<tableRow>' +
								'<tableCell>' +
									'<paragraph>foobar</paragraph>' +
								'</tableCell>' +
							'</tableRow>' +
							'<caption>Foo caption</caption>' +
						'</table>'
					)	);
			} );

			it( 'should convert a table inside <figure> with <figcaption> preceding the table', () => {
				editor.setData(
					'<figure class="table">' +
						'<table>' +
							'<tbody>' +
								'<tr>' +
									'<td>' +
										'foobar' +
									'</td>' +
								'</tr>' +
							'</tbody>' +
						'</table>' +
						'<figcaption>Foo caption</figcaption>' +
					'</figure>'
				);

				expect( getModelData( model, { withoutSelection: true } ) )
					.to.equal( String(
						'<table>' +
							'<tableRow>' +
								'<tableCell>' +
									'<paragraph>foobar</paragraph>' +
								'</tableCell>' +
							'</tableRow>' +
							'<caption>' +
								'Foo caption' +
							'</caption>' +
						'</table>'
					) );
			} );

			it( 'should convert a doubled captions', () => {
				editor.setData(
					'<figure class="table">' +
						'<table>' +
							'<caption>Bar caption</caption>' +
							'<tbody>' +
								'<tr>' +
									'<td>' +
										'foobar' +
									'</td>' +
								'</tr>' +
							'</tbody>' +
						'</table>' +
						'<figcaption>Foo caption</figcaption>' +
					'</figure>'
				);

				expect( getModelData( model, { withoutSelection: true } ) )
					.to.equal( String(
						'<table>' +
							'<tableRow>' +
								'<tableCell>' +
									'<paragraph>foobar</paragraph>' +
								'</tableCell>' +
							'</tableRow>' +
							'<caption>Bar caption</caption>' +
							'<caption>Foo caption</caption>' +
						'</table>'
					) );
			} );
		} );
	} );
} );
