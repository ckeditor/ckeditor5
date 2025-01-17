/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ModelTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';
import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import FindAndReplaceEditing from '../src/findandreplaceediting.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import BoldEditing from '@ckeditor/ckeditor5-basic-styles/src/bold/boldediting.js';
import ItalicEditing from '@ckeditor/ckeditor5-basic-styles/src/italic/italicediting.js';
import UndoEditing from '@ckeditor/ckeditor5-undo/src/undoediting.js';

describe( 'ReplaceCommand', () => {
	let editor, model, command;

	beforeEach( () => {
		return ModelTestEditor
			.create( {
				plugins: [ FindAndReplaceEditing, Paragraph, BoldEditing, ItalicEditing, UndoEditing ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				command = editor.commands.get( 'replace' );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( 'isEnabled', () => {
		it( 'should be enabled in empty document', () => {
			setData( model, '[]' );
			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be enabled by default', () => {
			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be enabled at the end of paragraph', () => {
			setData( model, '<paragraph>foo[]</paragraph>' );
			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be disabled in readonly editor', () => {
			editor.enableReadOnlyMode( 'unit-test' );

			expect( command.isEnabled ).to.be.false;
		} );
	} );

	describe( 'state', () => {
		it( 'is set to plugin\'s state', () => {
			expect( command._state ).to.equal( editor.plugins.get( 'FindAndReplaceEditing' ).state );
		} );
	} );

	describe( 'execute()', () => {
		it( 'should replace single search result using text', () => {
			setData( model, '<paragraph>Foo bar baz</paragraph><paragraph>Foo [bar] baz</paragraph>' );

			const range = editor.model.document.selection.getFirstRange();
			const markerId = 'my-marker-id';

			model.change( writer => {
				const marker = writer.addMarker( markerId, {
					usingOperation: false,
					affectsData: false,
					range
				} );

				editor.execute( 'replace', 'new', { marker } );
			} );

			expect( editor.getData() ).to.equal( '<p>Foo bar baz</p><p>Foo new baz</p>' );
		} );

		it( 'should replace all with text', () => {
			setData( model, '<paragraph>Foo bar baz</paragraph><paragraph>Foo bar baz</paragraph>' );

			const root = editor.model.document.getRoot();
			const markerId = 'my-marker-id';

			model.change( writer => {
				const marker = writer.addMarker( markerId, {
					usingOperation: false,
					affectsData: false,
					range: writer.createRangeIn( root )
				} );

				editor.execute( 'replace', 'new', { marker } );
			} );

			expect( editor.getData() ).to.equal( '<p>new</p>' );
		} );

		it( 'should highlight next match', () => {
			setData( model, '<paragraph>foo foo foo foo []</paragraph>' );

			const { results } = editor.execute( 'find', 'foo' );
			editor.execute( 'replace', 'bar', results.get( 0 ) );

			for ( let i = 0; i < results.length; i++ ) {
				const result = results.get( i );

				result.marker.name = `findResult:${ i }`;
			}

			for ( const marker of editor.model.markers ) {
				if ( marker.name.startsWith( 'findResultHighlighted:' ) ) {
					marker.name = 'findResultHighlighted:x';
				}
			}

			expect( getData( editor.model, { convertMarkers: true, withoutSelection: true } ) ).to.equal(
				'<paragraph>bar <findResult:1:start></findResult:1:start>' +
					'<findResultHighlighted:x:start></findResultHighlighted:x:start>foo<findResult:1:end></findResult:1:end>' +
					'<findResultHighlighted:x:end></findResultHighlighted:x:end> ' +
					'<findResult:2:start>' +
						'</findResult:2:start>foo<findResult:2:end></findResult:2:end> ' +
						'<findResult:3:start></findResult:3:start>foo<findResult:3:end></findResult:3:end> ' +
				'</paragraph>'
			);
		} );

		it( 'replacement should retain text attribute', () => {
			setData( model, '<paragraph><$text italic="true">foo bar foo</$text></paragraph>' );

			const { results } = editor.execute( 'find', 'bar' );
			editor.execute( 'replace', 'bom', results.get( 0 ) );

			expect( getData( editor.model, { withoutSelection: true } ) ).to.equal(
				'<paragraph><$text italic="true">foo bom foo</$text></paragraph>'
			);
		} );

		it( 'replacement should retain text multiple attributes', () => {
			setData( model, '<paragraph><$text bold="true" italic="true">foo bar foo</$text></paragraph>' );

			const { results } = editor.execute( 'find', 'bar' );
			editor.execute( 'replace', 'bom', results.get( 0 ) );

			expect( getData( editor.model, { withoutSelection: true } ) ).to.equal(
				'<paragraph><$text bold="true" italic="true">foo bom foo</$text></paragraph>'
			);
		} );

		it( 'replacement should retain replaced text formatting', () => {
			setData( model, '<paragraph>foo <$text bold="true">bar</$text> foo</paragraph>' );

			const { results } = editor.execute( 'find', 'bar' );
			editor.execute( 'replace', 'bom', results.get( 0 ) );

			expect( getData( editor.model, { withoutSelection: true } ) ).to.equal(
				'<paragraph>foo <$text bold="true">bom</$text> foo</paragraph>'
			);
		} );

		it( 'should not replace if selectable is not editable', () => {
			setData( model, '<paragraph>foo</paragraph>' );

			model.document.isReadOnly = true;
			const { results } = editor.execute( 'find', 'foo' );
			editor.execute( 'replace', 'bar', results.get( 0 ) );

			expect( getData( editor.model, { withoutSelection: true } ) ).to.equal(
				'<paragraph>foo</paragraph>'
			);
		} );

		it( 'doesn\'t pick attributes from sibling nodes', () => {
			setData( model, '<paragraph><$text italic="true">foo </$text>bar<$text italic="true"> foo</$text></paragraph>' );

			const { results } = editor.execute( 'find', 'bar' );
			editor.execute( 'replace', 'bom', results.get( 0 ) );

			expect( getData( editor.model, { withoutSelection: true } ) ).to.equal(
				'<paragraph><$text italic="true">foo </$text>bom<$text italic="true"> foo</$text></paragraph>'
			);
		} );
	} );
} );
