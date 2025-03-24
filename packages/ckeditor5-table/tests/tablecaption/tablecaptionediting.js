/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view.js';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin.js';

import TableCaptionEditing from '../../src/tablecaption/tablecaptionediting.js';
import TableEditing from '../../src/tableediting.js';

describe( 'TableCaptionEditing', () => {
	let editor, model, view;

	// FakePlugin helps check if the plugin under test extends existing schema correctly.
	class FakePlugin extends Plugin {
		init() {
			const schema = this.editor.model.schema;
			const conversion = this.editor.conversion;

			schema.register( 'foo', {
				isObject: true,
				isBlock: true,
				allowWhere: '$block'
			} );

			if ( schema.isRegistered( 'caption' ) ) {
				schema.extend( 'caption', {
					allowIn: 'foo'
				} );
			} else {
				schema.register( 'caption', {
					allowIn: 'foo',
					allowContentOf: '$block',
					isLimit: true
				} );
			}

			conversion.elementToElement( {
				view: 'foo',
				model: 'foo'
			} );
			conversion.elementToElement( {
				view: 'caption',
				model: 'caption'
			} );
		}
	}

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ TableEditing, TableCaptionEditing, Paragraph, TableCaptionEditing ]
			} )
			.then( newEditor => {
				editor = newEditor;
				view = editor.editing.view;
				model = editor.model;
			} );
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	it( 'should have pluginName', () => {
		expect( TableCaptionEditing.pluginName ).to.equal( 'TableCaptionEditing' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( TableCaptionEditing.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( TableCaptionEditing.isPremiumPlugin ).to.be.false;
	} );

	it( 'should set proper schema rules', () => {
		expect( model.schema.checkChild( [ '$root', 'table' ], 'caption' ) ).to.be.true;
		expect( model.schema.checkChild( [ '$root', 'table', 'caption' ], '$text' ) ).to.be.true;
		expect( model.schema.isLimit( 'caption' ) ).to.be.true;

		expect( model.schema.checkChild( [ '$root', 'table', 'caption' ], 'caption' ) ).to.be.false;
	} );

	it( 'should extend caption if schema for it is already registered', async () => {
		const { model } = await VirtualTestEditor
			.create( {
				plugins: [ FakePlugin, TableEditing, TableCaptionEditing, Paragraph, TableCaptionEditing ]
			} );

		expect( model.schema.isRegistered( 'caption' ) ).to.be.true;
		expect( model.schema.isLimit( 'caption' ) ).to.be.true;
		expect( model.schema.checkChild( [ 'table' ], 'caption' ) ).to.be.true;
	} );

	describe( 'data pipeline', () => {
		describe( 'model to view', () => {
			it( 'should not convert caption outside of the table', async () => {
				const editor = await VirtualTestEditor
					.create( {
						plugins: [ TableEditing, TableCaptionEditing, Paragraph, TableCaptionEditing, FakePlugin ]
					} );

				setModelData( editor.model,
					'<foo>' +
						'<caption>Foo caption</caption>' +
					'</foo>'
				);

				expect( editor.getData() ).to.equal(
					'<foo>' +
						'<caption>Foo caption</caption>' +
					'</foo>'
				);
			} );

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

			it( 'should merge many captions into one', () => {
				setModelData( model,
					'<table>' +
						'<tableRow>' +
							'<tableCell>' +
								'<paragraph>xyz</paragraph>' +
							'</tableCell>' +
						'</tableRow>' +
						'<caption>foo</caption>' +
						'<caption>bar</caption>' +
					'</table>'
				);

				expect( editor.getData() ).to.equal(
					'<figure class="table">' +
						'<table>' +
							'<tbody>' +
								'<tr>' +
									'<td>xyz</td>' +
								'</tr>' +
							'</tbody>' +
						'</table>' +
						'<figcaption>foobar</figcaption>' +
					'</figure>'
				);
			} );

			it( 'should place new caption at the end of the table model', () => {
				setModelData( model,
					'<table>' +
						'<tableRow>' +
							'<tableCell>' +
								'<paragraph>xyz</paragraph>' +
							'</tableCell>' +
						'</tableRow>' +
					'</table>'
				);

				model.change( writer => {
					const caption = writer.createElement( 'caption' );

					writer.insertText( 'foobar', caption, 'end' );

					// Insert new caption at the beginning of the table (before first row).
					writer.insert( caption, writer.createPositionFromPath( editor.model.document.getRoot(), [ 0, 0 ] ) );
				} );

				expect( editor.getData() ).to.equal(
					'<figure class="table">' +
						'<table>' +
							'<tbody>' +
								'<tr>' +
									'<td>xyz</td>' +
								'</tr>' +
							'</tbody>' +
						'</table>' +
						'<figcaption>foobar</figcaption>' +
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

			it( 'should not convert a <figcaption> inside <figure> that has no class="table"', () => {
				editor.setData(
					'<figure>' +
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
						'</table>' +
						'<paragraph>Foo caption</paragraph>'
					) );
			} );
		} );
	} );

	describe( 'editing pipeline', () => {
		describe( 'model to view', () => {
			it( 'should convert caption element to figcaption contenteditable', () => {
				setModelData( model,
					'<table><tableRow><tableCell><paragraph>xyz</paragraph></tableCell></tableRow><caption>Foo caption</caption></table>'
				);

				expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<figure class="ck-widget ck-widget_with-selection-handle table" contenteditable="false">' +
						'<div class="ck ck-widget__selection-handle"></div>' +
						'<table>' +
							'<tbody>' +
								'<tr>' +
									'<td class="ck-editor__editable ck-editor__nested-editable" contenteditable="true"' +
										' tabindex="-1">' +
										'<span class="ck-table-bogus-paragraph">xyz</span>' +
									'</td>' +
								'</tr>' +
							'</tbody>' +
						'</table>' +
						'<figcaption class="ck-editor__editable ck-editor__nested-editable" ' +
								'contenteditable="true" data-placeholder="Enter table caption" role="textbox" tabindex="-1">' +
							'Foo caption' +
						'</figcaption>' +
					'</figure>'
				);
			} );
		} );
	} );
} );
