/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Widget from '@ckeditor/ckeditor5-widget/src/widget.js';

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard.js';
import UndoEditing from '@ckeditor/ckeditor5-undo/src/undoediting.js';
import LegacyListEditing from '@ckeditor/ckeditor5-list/src/legacylist/legacylistediting.js';
import BlockQuoteEditing from '@ckeditor/ckeditor5-block-quote/src/blockquoteediting.js';
import Typing from '@ckeditor/ckeditor5-typing/src/typing.js';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import {
	getData as getModelData,
	setData as setModelData
} from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { parse as parseView } from '@ckeditor/ckeditor5-engine/src/dev-utils/view.js';

import TableEditing from '../src/tableediting.js';
import { modelTable, viewTable } from './_utils/utils.js';

describe( 'Table feature – integration', () => {
	describe( 'with clipboard', () => {
		let editor, clipboard;

		beforeEach( () => {
			return ClassicTestEditor
				.create( '', { plugins: [ Paragraph, TableEditing, LegacyListEditing, BlockQuoteEditing, Widget, Clipboard ] } )
				.then( newEditor => {
					editor = newEditor;
					clipboard = editor.plugins.get( 'ClipboardPipeline' );
				} );
		} );

		afterEach( () => {
			editor.destroy();
		} );

		it( 'pastes td as p when pasting into the table', () => {
			setModelData( editor.model, modelTable( [ [ 'foo[]' ] ] ) );

			clipboard.fire( 'inputTransformation', {
				content: parseView( '<td>bar</td>' )
			} );

			expect( getModelData( editor.model ) ).to.equalMarkup( modelTable( [
				[ 'foobar[]' ]
			] ) );
		} );

		it( 'pastes td as p when pasting into the p', () => {
			setModelData( editor.model, '<paragraph>foo[]</paragraph>' );

			clipboard.fire( 'inputTransformation', {
				content: parseView( '<td>bar</td>' )
			} );

			expect( getModelData( editor.model ) ).to.equalMarkup( '<paragraph>foobar[]</paragraph>' );
		} );

		it( 'pastes list into the td', () => {
			setModelData( editor.model, modelTable( [ [ '[]' ] ] ) );

			clipboard.fire( 'inputTransformation', {
				content: parseView( '<li>bar</li>' )
			} );

			expect( getModelData( editor.model ) ).to.equalMarkup( modelTable( [
				[ '<listItem listIndent="0" listType="bulleted">bar[]</listItem>' ]
			] ) );
		} );

		it( 'pastes blockquote into the td', () => {
			setModelData( editor.model, modelTable( [ [ '[]' ] ] ) );

			clipboard.fire( 'inputTransformation', {
				content: parseView( '<blockquote>bar</blockquote>' )
			} );

			expect( getModelData( editor.model ) ).to.equalMarkup( modelTable( [
				[ '<blockQuote><paragraph>bar[]</paragraph></blockQuote>' ]
			] ) );
		} );
	} );

	describe( 'with undo', () => {
		let editor, doc, root;

		beforeEach( () => {
			return ClassicTestEditor
				.create( '', { plugins: [ Paragraph, TableEditing, Widget, UndoEditing ] } )
				.then( newEditor => {
					editor = newEditor;
					doc = editor.model.document;
					root = doc.getRoot();
				} );
		} );

		afterEach( () => {
			editor.destroy();
		} );

		it( 'fixing empty roots should be transparent to undo', () => {
			expect( editor.getData( { trim: 'none' } ) ).to.equal( '<p>&nbsp;</p>' );
			expect( editor.commands.get( 'undo' ).isEnabled ).to.be.false;

			editor.data.set( viewTable( [ [ 'foo' ] ] ) );

			expect( editor.getData( { trim: 'none' } ) ).to.equal( viewTable( [ [ 'foo' ] ] ) );

			editor.model.change( writer => {
				writer.remove( root.getChild( 0 ) );
			} );

			expect( editor.getData( { trim: 'none' } ) ).to.equal( '<p>&nbsp;</p>' );

			editor.execute( 'undo' );

			expect( editor.getData( { trim: 'none' } ) ).to.equal( viewTable( [ [ 'foo' ] ] ) );

			editor.execute( 'redo' );

			expect( editor.getData( { trim: 'none' } ) ).to.equal( '<p>&nbsp;</p>' );

			editor.execute( 'undo' );

			expect( editor.getData( { trim: 'none' } ) ).to.equal( viewTable( [ [ 'foo' ] ] ) );
		} );

		it( 'fixing empty roots should be transparent to undo - multiple roots', () => {
			const otherRoot = doc.createRoot( '$root', 'otherRoot' );

			editor.data.set( { main: viewTable( [ [ 'foo' ] ] ) } );
			editor.data.set( { otherRoot: viewTable( [ [ 'foo' ] ] ) } );

			editor.model.change( writer => {
				writer.remove( root.getChild( 0 ) );
			} );

			editor.model.change( writer => {
				writer.remove( otherRoot.getChild( 0 ) );
			} );

			expect( editor.data.get( { trim: 'none', rootName: 'main' } ) ).to.equal( '<p>&nbsp;</p>' );
			expect( editor.data.get( { trim: 'none', rootName: 'otherRoot' } ) ).to.equal( '<p>&nbsp;</p>' );

			editor.execute( 'undo' );

			expect( editor.data.get( { trim: 'none', rootName: 'main' } ) ).to.equal( '<p>&nbsp;</p>' );
			expect( editor.data.get( { trim: 'none', rootName: 'otherRoot' } ) ).to.equal( viewTable( [ [ 'foo' ] ] ) );

			editor.execute( 'undo' );

			expect( editor.data.get( { trim: 'none', rootName: 'main' } ) ).to.equal( viewTable( [ [ 'foo' ] ] ) );
			expect( editor.data.get( { trim: 'none', rootName: 'otherRoot' } ) ).to.equal( viewTable( [ [ 'foo' ] ] ) );
		} );
	} );

	describe( 'other', () => {
		let editor;

		beforeEach( () => {
			return ClassicTestEditor
				.create( '', { plugins: [ Paragraph, TableEditing, LegacyListEditing, BlockQuoteEditing, Widget, Typing ] } )
				.then( newEditor => {
					editor = newEditor;
				} );
		} );

		afterEach( () => {
			editor.destroy();
		} );

		it( 'merges elements without throwing errors', () => {
			setModelData( editor.model, modelTable( [
				[ '<blockQuote><paragraph>Foo</paragraph></blockQuote><paragraph>[]Bar</paragraph>' ]
			] ) );

			editor.execute( 'delete' );

			expect( getModelData( editor.model ) ).to.equalMarkup( modelTable( [
				[ '<blockQuote><paragraph>Foo[]Bar</paragraph></blockQuote>' ]
			] ) );
		} );

		it( 'should not make the Model#hasContent() method return "true" when an empty table cell is selected', () => {
			setModelData( editor.model, (
				'<table>' +
					'<tableRow>' +
						'[<tableCell><paragraph></paragraph></tableCell>]' +
					'</tableRow>' +
				'</table>'
			) );

			expect( editor.model.hasContent( editor.model.document.selection.getFirstRange() ) ).to.be.false;
		} );
	} );
} );

describe( 'Table feature – integration with markers', () => {
	let editor;

	afterEach( () => {
		editor.destroy();
	} );

	// https://github.com/ckeditor/ckeditor5/pull/9780
	it( 'should work with the upcast marker to data conversion with table containing an empty cell', async () => {
		function CustomPlugin( editor ) {
			// Define the conversion in a plugin as this needs to be loaded before the Table plugin.
			editor.conversion.for( 'upcast' ).dataToMarker( {
				view: 'foo'
			} );
		}

		editor = await ClassicTestEditor
			.create( '', { plugins: [ CustomPlugin, Paragraph, TableEditing ] } );

		editor.setData( '<table><tbody><tr><td></td></tr></tbody></table>' );

		expect( getModelData( editor.model, { withoutSelection: true } ) )
			.to.equal( '<table><tableRow><tableCell><paragraph></paragraph></tableCell></tableRow></table>' );
	} );

	// https://github.com/ckeditor/ckeditor5/issues/10116
	describe( 'markers converted to UI elements and vice versa', () => {
		function CustomPlugin( editor ) {
			editor.conversion.for( 'upcast' ).elementToMarker( { view: 'foo', model: 'bar' } );
			editor.conversion.for( 'dataDowncast' ).markerToElement( { view: 'foo', model: 'bar' } );
		}

		beforeEach( async () => {
			editor = await ClassicTestEditor.create( '', { plugins: [ CustomPlugin, Paragraph, TableEditing ] } );
		} );

		it( 'should not throw if marker is inside an empty table cell', async () => {
			editor.setData( '<table><tr><td><foo></foo></td></tr></table>' );

			expect( () => editor.getData() ).to.not.throw();
		} );

		it( 'should adjust the model position mapping - table cell containing marker only', async () => {
			editor.setData( '<table><tr><td><foo></foo></td></tr></table>' );

			expect( editor.getData() ).to.equal(
				'<figure class="table"><table><tbody><tr><td><foo></foo>&nbsp;</td></tr></tbody></table></figure>'
			);
		} );

		it( 'should adjust the model position mapping - table cell containing marker preceded by an empty paragraph', async () => {
			editor.setData( '<table><tr><td><p></p><foo></foo></td></tr></table>' );

			expect( editor.getData() ).to.equal(
				'<figure class="table"><table><tbody><tr><td>&nbsp;<foo></foo></td></tr></tbody></table></figure>'
			);
		} );

		it( 'should adjust the model position mapping - table cell containing marker followed by an empty paragraph', async () => {
			editor.setData( '<table><tr><td><foo></foo><p></p></td></tr></table>' );

			expect( editor.getData() ).to.equal(
				'<figure class="table"><table><tbody><tr><td><foo></foo>&nbsp;</td></tr></tbody></table></figure>'
			);
		} );

		it( 'should adjust the model position mapping - table cell containing marker preceded by a non-empty paragraph', async () => {
			editor.setData( '<table><tr><td><p>foobar</p><foo></foo></td></tr></table>' );

			expect( editor.getData() ).to.equal(
				'<figure class="table"><table><tbody><tr><td>foobar<foo></foo></td></tr></tbody></table></figure>'
			);
		} );

		it( 'should adjust the model position mapping - table cell containing marker followed by a non-empty paragraph', async () => {
			editor.setData( '<table><tr><td><foo></foo><p>foobar</p></td></tr></table>' );

			expect( editor.getData() ).to.equal(
				'<figure class="table"><table><tbody><tr><td><foo></foo>foobar</td></tr></tbody></table></figure>'
			);
		} );
	} );

	describe( 'markers converted to data and vice versa', () => {
		beforeEach( async () => {
			editor = await ClassicTestEditor.create( '', { plugins: [ Paragraph, TableEditing ] } );

			editor.conversion.for( 'upcast' ).dataToMarker( { view: 'foo' } );
			editor.conversion.for( 'dataDowncast' ).markerToData( { model: 'foo' } );
		} );

		function addMarker( range ) {
			editor.model.change( writer => {
				writer.addMarker( 'foo:bar', {
					usingOperation: true,
					affectsData: true,
					range
				} );
			} );
		}

		function checkMarker( range ) {
			const marker = editor.model.markers.get( 'foo:bar' );

			expect( marker ).to.not.be.null;
			expect( marker.getRange().isEqual( range ) ).to.be.true;
		}

		describe( 'single empty paragraph', () => {
			let paragraph;

			beforeEach( async () => {
				setModelData( editor.model, modelTable( [ [ '' ] ] ) );

				paragraph = editor.model.document.getRoot().getNodeByPath( [ 0, 0, 0, 0 ] );
			} );

			it( 'marker beginning before a paragraph and ending inside', async () => {
				const range = editor.model.createRange(
					editor.model.createPositionBefore( paragraph ),
					editor.model.createPositionAt( paragraph, 'end' )
				);

				addMarker( range );

				const data = editor.getData();

				expect( data ).to.equal(
					'<figure class="table"><table><tbody><tr>' +
						'<td><p data-foo-start-before="bar"><foo-end name="bar"></foo-end>&nbsp;</p>' +
					'</td></tr></tbody></table></figure>'
				);

				editor.setData( data );

				checkMarker( range );
				expect( editor.getData() ).to.equal( data );
			} );

			it( 'marker beginning in a paragraph and ending after it', async () => {
				const range = editor.model.createRange(
					editor.model.createPositionAt( paragraph, 0 ),
					editor.model.createPositionAfter( paragraph )
				);

				addMarker( range );

				const data = editor.getData();

				expect( data ).to.equal(
					'<figure class="table"><table><tbody><tr>' +
						'<td><p data-foo-end-after="bar"><foo-start name="bar"></foo-start>&nbsp;</p></td>' +
					'</tr></tbody></table></figure>'
				);

				editor.setData( data );

				checkMarker( range );
				expect( editor.getData() ).to.equal( data );
			} );

			it( 'marker on the paragraph', async () => {
				const range = editor.model.createRangeOn( paragraph );

				addMarker( range );

				const data = editor.getData();

				expect( data ).to.equal(
					'<figure class="table"><table><tbody><tr>' +
						'<td><p data-foo-end-after="bar" data-foo-start-before="bar">&nbsp;</p></td>' +
					'</tr></tbody></table></figure>'
				);

				editor.setData( data );

				checkMarker( range );
				expect( editor.getData() ).to.equal( data );
			} );

			it( 'marker inside a paragraph', async () => {
				const range = editor.model.createRangeIn( paragraph );

				addMarker( range );

				const data = editor.getData();

				expect( data ).to.equal(
					'<figure class="table"><table><tbody><tr>' +
						'<td><foo-start name="bar"></foo-start><foo-end name="bar"></foo-end>&nbsp;</td>' +
					'</tr></tbody></table></figure>'
				);

				editor.setData( data );

				checkMarker( range );
				expect( editor.getData() ).to.equal( data );
			} );
		} );

		describe( 'single paragraph', () => {
			let paragraph;

			beforeEach( async () => {
				setModelData( editor.model, modelTable( [ [ 'text' ] ] ) );

				paragraph = editor.model.document.getRoot().getNodeByPath( [ 0, 0, 0, 0 ] );
			} );

			it( 'marker beginning before a paragraph and ending inside', async () => {
				const range = editor.model.createRange(
					editor.model.createPositionBefore( paragraph ),
					editor.model.createPositionAt( paragraph, 'end' )
				);

				addMarker( range );

				const data = editor.getData();

				expect( data ).to.equal(
					'<figure class="table"><table><tbody><tr>' +
						'<td><p data-foo-start-before="bar">text<foo-end name="bar"></foo-end></p>' +
					'</td></tr></tbody></table></figure>'
				);

				editor.setData( data );

				checkMarker( range );
				expect( editor.getData() ).to.equal( data );
			} );

			it( 'marker beginning in a paragraph and ending after it', async () => {
				const range = editor.model.createRange(
					editor.model.createPositionAt( paragraph, 0 ),
					editor.model.createPositionAfter( paragraph )
				);

				addMarker( range );

				const data = editor.getData();

				expect( data ).to.equal(
					'<figure class="table"><table><tbody><tr>' +
						'<td><p data-foo-end-after="bar"><foo-start name="bar"></foo-start>text</p></td>' +
					'</tr></tbody></table></figure>'
				);

				editor.setData( data );

				checkMarker( range );
				expect( editor.getData() ).to.equal( data );
			} );

			it( 'marker on the paragraph', async () => {
				const range = editor.model.createRangeOn( paragraph );

				addMarker( range );

				const data = editor.getData();

				expect( data ).to.equal(
					'<figure class="table"><table><tbody><tr>' +
						'<td><p data-foo-end-after="bar" data-foo-start-before="bar">text</p></td>' +
					'</tr></tbody></table></figure>'
				);

				editor.setData( data );

				checkMarker( range );
				expect( editor.getData() ).to.equal( data );
			} );

			it( 'marker inside a paragraph', async () => {
				const range = editor.model.createRangeIn( paragraph );

				addMarker( range );

				const data = editor.getData();

				expect( data ).to.equal(
					'<figure class="table"><table><tbody><tr>' +
						'<td><foo-start name="bar"></foo-start>text<foo-end name="bar"></foo-end></td>' +
					'</tr></tbody></table></figure>'
				);

				editor.setData( data );

				// We would expect such positions and data but due to a bug https://github.com/cksource/ckeditor5-commercial/issues/5287
				// we are accepting slightly off positions for now:
				//
				// checkMarker( range );
				// expect( editor.getData() ).to.equal( data );

				const currentRange = editor.model.createRange(
					editor.model.createPositionFromPath( range.root, [ 0, 0, 0, 0 ] ),
					editor.model.createPositionFromPath( range.root, [ 0, 0, 0, 0, 4 ] )
				);

				checkMarker( currentRange );
				expect( editor.getData() ).to.equal(
					'<figure class="table"><table><tbody><tr><td>' +
						'<p data-foo-start-before="bar">text<foo-end name="bar"></foo-end></p>' +
					'</td></tr></tbody></table></figure>'
				);
			} );
		} );

		describe( 'multiple paragraphs', () => {
			let paragraphA, paragraphB, tableCell;

			beforeEach( async () => {
				setModelData( editor.model, modelTable( [ [ '<paragraph>a</paragraph><paragraph>b</paragraph>' ] ] ) );

				tableCell = editor.model.document.getRoot().getNodeByPath( [ 0, 0, 0 ] );
				paragraphA = tableCell.getChild( 0 );
				paragraphB = tableCell.getChild( 1 );
			} );

			it( 'marker beginning before a paragraph and ending inside another paragraph', async () => {
				const range = editor.model.createRange(
					editor.model.createPositionBefore( paragraphA ),
					editor.model.createPositionAt( paragraphB, 'end' )
				);

				addMarker( range );

				const data = editor.getData();

				expect( data ).to.equal(
					'<figure class="table"><table><tbody><tr>' +
						'<td><p data-foo-start-before="bar">a</p><p>b<foo-end name="bar"></foo-end></p></td>' +
					'</tr></tbody></table></figure>'
				);

				editor.setData( data );

				checkMarker( range );
				expect( editor.getData() ).to.equal( data );
			} );

			it( 'marker beginning in a paragraph and ending after another paragraph', async () => {
				const range = editor.model.createRange(
					editor.model.createPositionAt( paragraphA, 0 ),
					editor.model.createPositionAfter( paragraphB )
				);

				addMarker( range );

				const data = editor.getData();

				expect( data ).to.equal(
					'<figure class="table"><table><tbody><tr>' +
						'<td><p><foo-start name="bar"></foo-start>a</p><p data-foo-end-after="bar">b</p></td>' +
					'</tr></tbody></table></figure>'
				);

				editor.setData( data );

				checkMarker( range );
				expect( editor.getData() ).to.equal( data );
			} );

			it( 'marker on multiple paragraphs', async () => {
				const range = editor.model.createRangeIn( tableCell );

				addMarker( range );

				const data = editor.getData();

				expect( data ).to.equal(
					'<figure class="table"><table><tbody><tr>' +
						'<td><p data-foo-start-before="bar">a</p><p data-foo-end-after="bar">b</p></td>' +
					'</tr></tbody></table></figure>'
				);

				editor.setData( data );

				checkMarker( range );
				expect( editor.getData() ).to.equal( data );
			} );

			it( 'marker inside starting in a paragraph and ending in an other paragraph', async () => {
				const range = editor.model.createRange(
					editor.model.createPositionAt( paragraphA, 'end' ),
					editor.model.createPositionAt( paragraphB, 0 )
				);

				addMarker( range );

				const data = editor.getData();

				expect( data ).to.equal(
					'<figure class="table"><table><tbody><tr>' +
						'<td><p>a<foo-start name="bar"></foo-start></p><p><foo-end name="bar"></foo-end>b</p></td>' +
					'</tr></tbody></table></figure>'
				);

				editor.setData( data );

				checkMarker( range );
				expect( editor.getData() ).to.equal( data );
			} );
		} );
	} );
} );
