/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import ClipboardPipeline from '@ckeditor/ckeditor5-clipboard/src/clipboardpipeline.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import Table from '../src/table.js';
import PlainTableOutput from '../src/plaintableoutput.js';
import { modelTable } from './_utils/utils.js';
import TableCaption from '../src/tablecaption.js';
import TableProperties from '../src/tableproperties.js';

describe( 'PlainTableOutput', () => {
	let editor, editorElement, model;

	beforeEach( async () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		editor = await ClassicTestEditor.create( editorElement, {
			plugins: [ Paragraph, Table, TableCaption, TableProperties, PlainTableOutput, ClipboardPipeline ]
		} );

		model = editor.model;
	} );

	afterEach( async () => {
		editorElement.remove();
		await editor.destroy();
	} );

	it( 'requires Table', () => {
		expect( PlainTableOutput.requires ).to.deep.equal( [ Table ] );
	} );

	it( 'should have pluginName', () => {
		expect( PlainTableOutput.pluginName ).to.equal( 'PlainTableOutput' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( PlainTableOutput.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( PlainTableOutput.isPremiumPlugin ).to.be.false;
	} );

	describe( 'conversion in data pipeline', () => {
		describe( 'model to view', () => {
			it( 'should create tbody section', () => {
				setModelData( model, modelTable( [
					[ 'foo' ]
				] ) );

				expect( editor.getData() ).to.equal(
					'<table class="table">' +
						'<tbody>' +
							'<tr><td>foo</td></tr>' +
						'</tbody>' +
					'</table>'
				);
			} );

			it( 'should create heading rows', () => {
				setModelData( model, modelTable( [
					[ '1', '2' ],
					[ '3', '4' ],
					[ '5', '6' ]
				], { headingRows: 2 } ) );

				expect( editor.getData() ).to.equal(
					'<table class="table">' +
						'<thead>' +
							'<tr><th>1</th><th>2</th></tr>' +
							'<tr><th>3</th><th>4</th></tr>' +
						'</thead>' +
						'<tbody>' +
							'<tr><td>5</td><td>6</td></tr>' +
						'</tbody>' +
					'</table>'
				);
			} );

			it( 'should create heading columns', () => {
				setModelData( model, modelTable( [
					[ '1', '2' ],
					[ '3', '4' ],
					[ '5', '6' ]
				], { headingColumns: 1 } ) );

				expect( editor.getData() ).to.equal(
					'<table class="table">' +
						'<tbody>' +
							'<tr><th>1</th><td>2</td></tr>' +
							'<tr><th>3</th><td>4</td></tr>' +
							'<tr><th>5</th><td>6</td></tr>' +
						'</tbody>' +
					'</table>'
				);
			} );

			it( 'should create heading rows and columns', () => {
				setModelData( model, modelTable( [
					[ '1', '2' ],
					[ '3', '4' ],
					[ '5', '6' ]
				], { headingRows: 1, headingColumns: 1 } ) );

				expect( editor.getData() ).to.equal(
					'<table class="table">' +
						'<thead>' +
							'<tr><th>1</th><th>2</th></tr>' +
						'</thead>' +
						'<tbody>' +
							'<tr><th>3</th><td>4</td></tr>' +
							'<tr><th>5</th><td>6</td></tr>' +
						'</tbody>' +
					'</table>'
				);
			} );

			it( 'should work when heading rows number is bigger than number of rows', () => {
				setModelData( model, modelTable( [
					[ '1', '2' ],
					[ '3', '4' ]
				], { headingRows: 3 } ) );

				expect( editor.getData() ).to.equal(
					'<table class="table">' +
						'<thead>' +
							'<tr><th>1</th><th>2</th></tr>' +
							'<tr><th>3</th><th>4</th></tr>' +
						'</thead>' +
					'</table>'
				);
			} );

			it( 'should create caption element', () => {
				setModelData( model,
					'<table>' +
						'<tableRow>' +
							'<tableCell><paragraph>1</paragraph></tableCell>' +
							'<tableCell><paragraph>2</paragraph></tableCell>' +
						'</tableRow>' +
						'<caption>Foo</caption>' +
					'</table>'
				);

				expect( editor.getData() ).to.equal(
					'<table class="table">' +
						'<caption>Foo</caption>' +
						'<tbody>' +
							'<tr><td>1</td><td>2</td></tr>' +
						'</tbody>' +
					'</table>'
				);
			} );

			it( 'should not create caption element without TableCaption plugin', async () => {
				const testEditor = await ClassicTestEditor.create( editorElement, {
					plugins: [ Paragraph, Table, PlainTableOutput, ClipboardPipeline ]
				} );

				testEditor.setData(
					'<table>' +
						'<caption>Foo</caption>' +
						'<tbody>' +
							'<tr><td>1</td><td>2</td></tr>' +
						'</tbody>' +
					'</table>'
				);

				expect( testEditor.getData() ).to.equal(
					'<table class="table">' +
						'<tbody>' +
							'<tr><td>1</td><td>2</td></tr>' +
						'</tbody>' +
					'</table>'
				);

				await testEditor.destroy();
			} );

			it( 'should be overridable', () => {
				const table = createEmptyTable();

				editor.conversion.for( 'dataDowncast' ).add( dispatcher =>
					dispatcher.on( 'attribute:tableBorderColor:table', ( evt, data, conversionApi ) => {
						conversionApi.consumable.consume( data.item, evt.name );
					}, { priority: 'highest' } ) );

				model.change( writer => writer.setAttribute( 'tableBorderColor', '#f00', table ) );

				assertPlainTableStyle( editor, '' );
			} );

			describe( 'should create attribute', () => {
				let table;

				beforeEach( () => {
					table = createEmptyTable();
				} );

				it( 'tableBorderStyle', () => {
					model.change( writer => writer.setAttribute( 'tableBorderStyle', 'dotted', table ) );

					assertPlainTableStyle( editor, 'border-style:dotted;' );
				} );

				it( 'tableBorderColor', () => {
					model.change( writer => writer.setAttribute( 'tableBorderColor', 'red', table ) );

					assertPlainTableStyle( editor, 'border-color:red;' );
				} );

				it( 'tableBorderWidth', () => {
					model.change( writer => writer.setAttribute( 'tableBorderWidth', '1px', table ) );

					assertPlainTableStyle( editor, 'border-width:1px;' );
				} );

				it( 'border shorthand', () => {
					model.change( writer => writer.setAttribute( 'tableBorderStyle', 'dotted', table ) );
					model.change( writer => writer.setAttribute( 'tableBorderColor', 'red', table ) );
					model.change( writer => writer.setAttribute( 'tableBorderWidth', '1px', table ) );

					assertPlainTableStyle( editor, 'border:1px dotted red;' );
				} );

				it( 'tableAlignment', () => {
					model.change( writer => writer.setAttribute( 'tableAlignment', 'right', table ) );

					assertPlainTableStyle( editor, 'float:right;' );
				} );

				it( 'tableWidth', () => {
					model.change( writer => writer.setAttribute( 'tableWidth', '500px', table ) );

					assertPlainTableStyle( editor, 'width:500px;' );
				} );

				it( 'tableHeight', () => {
					model.change( writer => writer.setAttribute( 'tableHeight', '500px', table ) );

					assertPlainTableStyle( editor, 'height:500px;' );
				} );

				it( 'tableBackgroundColor', () => {
					model.change( writer => writer.setAttribute( 'tableBackgroundColor', 'red', table ) );

					assertPlainTableStyle( editor, 'background-color:red;' );
				} );
			} );

			describe( 'should remove attribute', () => {
				let table;

				beforeEach( () => {
					table = createEmptyTable();
				} );

				it( 'tableBorderStyle', () => {
					model.change( writer => writer.setAttribute( 'tableBorderStyle', 'dotted', table ) );
					model.change( writer => writer.setAttribute( 'tableBorderColor', 'red', table ) );

					assertPlainTableStyle( editor, 'border-color:red;border-style:dotted;' );

					model.change( writer => writer.setAttribute( 'tableBorderStyle', '', table ) );

					assertPlainTableStyle( editor, 'border-color:red;' );
				} );

				it( 'tableBorderColor', () => {
					model.change( writer => writer.setAttribute( 'tableBorderStyle', 'dotted', table ) );
					model.change( writer => writer.setAttribute( 'tableBorderColor', 'red', table ) );

					assertPlainTableStyle( editor, 'border-color:red;border-style:dotted;' );

					model.change( writer => writer.setAttribute( 'tableBorderColor', '', table ) );

					assertPlainTableStyle( editor, 'border-style:dotted;' );
				} );

				it( 'tableBorderWidth', () => {
					model.change( writer => writer.setAttribute( 'tableBorderStyle', 'dotted', table ) );
					model.change( writer => writer.setAttribute( 'tableBorderWidth', '1px', table ) );

					assertPlainTableStyle( editor, 'border-style:dotted;border-width:1px;' );

					model.change( writer => writer.setAttribute( 'tableBorderWidth', '', table ) );

					assertPlainTableStyle( editor, 'border-style:dotted;' );
				} );

				it( 'from border shorthand', () => {
					model.change( writer => writer.setAttribute( 'tableBorderStyle', 'dotted', table ) );
					model.change( writer => writer.setAttribute( 'tableBorderColor', 'red', table ) );
					model.change( writer => writer.setAttribute( 'tableBorderWidth', '1px', table ) );

					assertPlainTableStyle( editor, 'border:1px dotted red;' );

					model.change( writer => writer.setAttribute( 'tableBorderWidth', '', table ) );

					assertPlainTableStyle( editor, 'border-color:red;border-style:dotted;' );
				} );

				it( 'tableAlignment', () => {
					model.change( writer => writer.setAttribute( 'tableAlignment', 'right', table ) );

					assertPlainTableStyle( editor, 'float:right;' );

					model.change( writer => writer.removeAttribute( 'tableAlignment', table ) );

					assertPlainTableStyle( editor, '' );
				} );

				it( 'tableWidth', () => {
					model.change( writer => writer.setAttribute( 'tableWidth', '500px', table ) );

					assertPlainTableStyle( editor, 'width:500px;' );

					model.change( writer => writer.removeAttribute( 'tableWidth', table ) );

					assertPlainTableStyle( editor, '' );
				} );

				it( 'tableHeight', () => {
					model.change( writer => writer.setAttribute( 'tableHeight', '500px', table ) );

					assertPlainTableStyle( editor, 'height:500px;' );

					model.change( writer => writer.removeAttribute( 'tableHeight', table ) );

					assertPlainTableStyle( editor, '' );
				} );

				it( 'tableBackgroundColor', () => {
					model.change( writer => writer.setAttribute( 'tableBackgroundColor', 'red', table ) );

					assertPlainTableStyle( editor, 'background-color:red;' );

					model.change( writer => writer.removeAttribute( 'tableBackgroundColor', table ) );

					assertPlainTableStyle( editor, '' );
				} );
			} );

			describe( 'should not create attribute', () => {
				let table, testEditor;

				beforeEach( async () => {
					testEditor = await ClassicTestEditor.create( editorElement, {
						plugins: [ Paragraph, Table, PlainTableOutput, ClipboardPipeline ]
					} );

					model = testEditor.model;
					table = createEmptyTable();
				} );

				afterEach( async () => {
					await testEditor.destroy();
				} );

				it( 'tableBorderStyle without TableProperties plugin', () => {
					model.change( writer =>
						writer.setAttribute( 'tableBorderStyle', 'dotted', table )
					);

					assertPlainTableStyle( testEditor );
				} );

				it( 'tableBorderColor without TableProperties plugin', () => {
					model.change( writer =>
						writer.setAttribute( 'tableBorderColor', 'red', table )
					);

					assertPlainTableStyle( testEditor );
				} );

				it( 'tableBorderWidth without TableProperties plugin', () => {
					model.change( writer =>
						writer.setAttribute( 'tableBorderWidth', '1px', table )
					);

					assertPlainTableStyle( testEditor );
				} );

				it( 'border shorthand without TableProperties plugin', () => {
					model.change( writer =>
						writer.setAttribute( 'tableBorderStyle', 'dotted', table )
					);
					model.change( writer =>
						writer.setAttribute( 'tableBorderColor', 'red', table )
					);
					model.change( writer =>
						writer.setAttribute( 'tableBorderWidth', '1px', table )
					);

					assertPlainTableStyle( testEditor );
				} );

				it( 'tableAlignment without TableProperties plugin', () => {
					model.change( writer =>
						writer.setAttribute( 'tableAlignment', 'right', table )
					);

					assertPlainTableStyle( testEditor );
				} );

				it( 'tableWidth without TableProperties plugin', () => {
					model.change( writer =>
						writer.setAttribute( 'tableWidth', '500px', table )
					);

					assertPlainTableStyle( testEditor );
				} );

				it( 'tableHeight without TableProperties plugin', () => {
					model.change( writer =>
						writer.setAttribute( 'tableHeight', '500px', table )
					);

					assertPlainTableStyle( testEditor );
				} );

				it( 'tableBackgroundColor without TableProperties plugin', () => {
					model.change( writer =>
						writer.setAttribute( 'tableBackgroundColor', 'red', table )
					);

					assertPlainTableStyle( testEditor );
				} );
			} );

			it( 'should not convert image captions', async () => {
				const testEditor = await ClassicTestEditor.create( editorElement, {
					plugins: [ ArticlePluginSet, Table, TableCaption, PlainTableOutput, ClipboardPipeline ],
					image: { toolbar: [ '|' ] }
				} );

				testEditor.setData(
					'<figure class="image">' +
						'<img src="/assets/sample.png" />' +
						'<figcaption>Caption</figcaption>' +
					'</figure>'
				);

				expect( testEditor.getData() ).to.equal(
					'<figure class="image">' +
						'<img src="/assets/sample.png">' +
						'<figcaption>Caption</figcaption>' +
					'</figure>'
				);

				await testEditor.destroy();
			} );

			// See: https://github.com/ckeditor/ckeditor5/issues/11394
			it( 'should allow overriding image caption converters', async () => {
				const testEditor = await ClassicTestEditor.create( editorElement, {
					plugins: [ ArticlePluginSet, Table, TableCaption, PlainTableOutput, ClipboardPipeline ],
					image: { toolbar: [ '|' ] }
				} );

				testEditor.conversion.for( 'dataDowncast' ).elementToElement( {
					model: 'caption',
					view: ( modelElement, { writer } ) => {
						return writer.createContainerElement( 'foobar' );
					},
					converterPriority: 'high'
				} );

				testEditor.setData(
					'<figure class="image">' +
						'<img src="/assets/sample.png" />' +
						'<figcaption>Caption</figcaption>' +
					'</figure>'
				);

				expect( testEditor.getData() ).to.equal(
					'<figure class="image">' +
						'<img src="/assets/sample.png">' +
						'<foobar>Caption</foobar>' +
					'</figure>'
				);

				await testEditor.destroy();
			} );

			function createEmptyTable() {
				setModelData(
					model,
					'<table>' +
						'<tableRow>' +
							'<tableCell>' +
								'<paragraph>foo</paragraph>' +
							'</tableCell>' +
						'</tableRow>' +
					'</table>'
				);

				return model.document.getRoot().getNodeByPath( [ 0 ] );
			}

			function assertPlainTableStyle( editor, tableStyle ) {
				const tableStyleEntry = tableStyle ? ` style="${ tableStyle }"` : '';

				expect( editor.getData() ).to.equalMarkup(
					`<table class="table"${ tableStyleEntry }>` +
						'<tbody><tr><td>foo</td></tr></tbody>' +
					'</table>'
				);
			}
		} );
	} );

	describe( 'upcast', () => {
		it( 'should consume the `table` class', () => {
			editor.conversion.for( 'upcast' ).add( dispatcher => {
				dispatcher.on( 'element:table', ( evt, data, conversionApi ) => {
					expect( conversionApi.consumable.test( data.viewItem, { classes: [ 'table' ] } ) ).to.be.false;
				} );
			}, { priority: 'low' } );

			editor.setData(
				'<table class="table"><tr><td>foo</td></tr></table>'
			);
		} );
	} );
} );
