/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { ModelTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';
import { _setModelData, _getModelData } from '@ckeditor/ckeditor5-engine';
import { FindAndReplaceEditing } from '../src/findandreplaceediting.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { BoldEditing, ItalicEditing } from '@ckeditor/ckeditor5-basic-styles';
import { UndoEditing } from '@ckeditor/ckeditor5-undo';

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
			_setModelData( model, '[]' );
			expect( command.isEnabled ).toBe( true );
		} );

		it( 'should be enabled by default', () => {
			expect( command.isEnabled ).toBe( true );
		} );

		it( 'should be enabled at the end of paragraph', () => {
			_setModelData( model, '<paragraph>foo[]</paragraph>' );
			expect( command.isEnabled ).toBe( true );
		} );

		it( 'should be disabled in readonly editor', () => {
			editor.enableReadOnlyMode( 'unit-test' );

			expect( command.isEnabled ).toBe( false );
		} );
	} );

	describe( 'state', () => {
		it( 'is set to plugin\'s state', () => {
			expect( command._state ).toBe( editor.plugins.get( 'FindAndReplaceEditing' ).state );
		} );
	} );

	describe( 'execute()', () => {
		it( 'should replace single search result using text', () => {
			_setModelData( model, '<paragraph>Foo bar baz</paragraph><paragraph>Foo [bar] baz</paragraph>' );

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

			expect( editor.getData() ).toBe( '<p>Foo bar baz</p><p>Foo new baz</p>' );
		} );

		it( 'should replace all with text', () => {
			_setModelData( model, '<paragraph>Foo bar baz</paragraph><paragraph>Foo bar baz</paragraph>' );

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

			expect( editor.getData() ).toBe( '<p>new</p>' );
		} );

		it( 'should highlight next match', () => {
			_setModelData( model, '<paragraph>foo foo foo foo []</paragraph>' );

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

			expect( _getModelData( editor.model, { convertMarkers: true, withoutSelection: true } ) ).toBe(
				'<paragraph>bar <findResult:1:start></findResult:1:start>' +
					'<findResultHighlighted:x:start></findResultHighlighted:x:start>' +
						'foo' +
					'<findResultHighlighted:x:end></findResultHighlighted:x:end>' +
					'<findResult:1:end></findResult:1:end> ' +
					'<findResult:2:start>' +
						'</findResult:2:start>foo<findResult:2:end></findResult:2:end> ' +
						'<findResult:3:start></findResult:3:start>foo<findResult:3:end></findResult:3:end> ' +
				'</paragraph>'
			);
		} );

		it( 'replacement should retain text attribute', () => {
			_setModelData( model, '<paragraph><$text italic="true">foo bar foo</$text></paragraph>' );

			const { results } = editor.execute( 'find', 'bar' );
			editor.execute( 'replace', 'bom', results.get( 0 ) );

			expect( _getModelData( editor.model, { withoutSelection: true } ) ).toBe(
				'<paragraph><$text italic="true">foo bom foo</$text></paragraph>'
			);
		} );

		it( 'replacement should retain text multiple attributes', () => {
			_setModelData( model, '<paragraph><$text bold="true" italic="true">foo bar foo</$text></paragraph>' );

			const { results } = editor.execute( 'find', 'bar' );
			editor.execute( 'replace', 'bom', results.get( 0 ) );

			expect( _getModelData( editor.model, { withoutSelection: true } ) ).toBe(
				'<paragraph><$text bold="true" italic="true">foo bom foo</$text></paragraph>'
			);
		} );

		it( 'replacement should retain replaced text formatting', () => {
			_setModelData( model, '<paragraph>foo <$text bold="true">bar</$text> foo</paragraph>' );

			const { results } = editor.execute( 'find', 'bar' );
			editor.execute( 'replace', 'bom', results.get( 0 ) );

			expect( _getModelData( editor.model, { withoutSelection: true } ) ).toBe(
				'<paragraph>foo <$text bold="true">bom</$text> foo</paragraph>'
			);
		} );

		it( 'should not replace if selectable is not editable', () => {
			_setModelData( model, '<paragraph>foo</paragraph>' );

			model.document.isReadOnly = true;
			const { results } = editor.execute( 'find', 'foo' );
			editor.execute( 'replace', 'bar', results.get( 0 ) );

			expect( _getModelData( editor.model, { withoutSelection: true } ) ).toBe(
				'<paragraph>foo</paragraph>'
			);
		} );

		it( 'doesn\'t pick attributes from sibling nodes', () => {
			_setModelData( model, '<paragraph><$text italic="true">foo </$text>bar<$text italic="true"> foo</$text></paragraph>' );

			const { results } = editor.execute( 'find', 'bar' );
			editor.execute( 'replace', 'bom', results.get( 0 ) );

			expect( _getModelData( editor.model, { withoutSelection: true } ) ).toBe(
				'<paragraph><$text italic="true">foo </$text>bom<$text italic="true"> foo</$text></paragraph>'
			);
		} );

		describe( 'in inline root editor', () => {
			let inlineRootEditor, inlineRootModel;

			beforeEach( async () => {
				inlineRootEditor = await ModelTestEditor.create( {
					plugins: [ FindAndReplaceEditing ],
					root: { modelElement: '$inlineRoot' }
				} );

				inlineRootModel = inlineRootEditor.model;
			} );

			afterEach( async () => {
				await inlineRootEditor.destroy();
			} );

			it( 'should replace a single match', () => {
				_setModelData( inlineRootModel, 'foo bar baz' );

				const { results } = inlineRootEditor.execute( 'find', 'bar' );
				inlineRootEditor.execute( 'replace', 'new', results.get( 0 ) );

				expect( _getModelData( inlineRootModel, { withoutSelection: true } ) ).toBe( 'foo new baz' );
			} );

			it( 'should replace only the given result, leaving other occurrences intact', () => {
				_setModelData( inlineRootModel, 'bar foo bar baz bar' );

				const { results } = inlineRootEditor.execute( 'find', 'bar' );
				inlineRootEditor.execute( 'replace', 'new', results.get( 0 ) );

				expect( _getModelData( inlineRootModel, { withoutSelection: true } ) ).toBe( 'new foo bar baz bar' );
			} );

			it( 'should reduce the results count by one after replace', () => {
				_setModelData( inlineRootModel, 'foo foo foo' );

				const findAndReplaceEditing = inlineRootEditor.plugins.get( 'FindAndReplaceEditing' );
				const results = findAndReplaceEditing.find( 'foo' );

				inlineRootEditor.execute( 'replace', 'bar', findAndReplaceEditing.state.highlightedResult );

				expect( results.length ).toBe( 2 );
			} );

			it( 'should empty results after replacing the last match', () => {
				_setModelData( inlineRootModel, 'foo' );

				const findAndReplaceEditing = inlineRootEditor.plugins.get( 'FindAndReplaceEditing' );
				const results = findAndReplaceEditing.find( 'foo' );

				inlineRootEditor.execute( 'replace', 'bar', results.get( 0 ) );

				expect( results.length ).toBe( 0 );
			} );

			it( 'should highlight a different result after replacing the highlighted one', () => {
				_setModelData( inlineRootModel, 'foo foo foo' );

				const findAndReplaceEditing = inlineRootEditor.plugins.get( 'FindAndReplaceEditing' );
				findAndReplaceEditing.find( 'foo' );

				const highlightedBefore = findAndReplaceEditing.state.highlightedResult;

				inlineRootEditor.execute( 'replace', 'bar', highlightedBefore );

				expect( findAndReplaceEditing.state.highlightedResult ).not.toBe( highlightedBefore );
				expect( findAndReplaceEditing.state.highlightedResult ).not.toBeNull();
			} );

			it( 'should not accumulate orphan find result markers with successive replaces', () => {
				_setModelData( inlineRootModel, 'foo foo foo foo' );

				const findAndReplaceEditing = inlineRootEditor.plugins.get( 'FindAndReplaceEditing' );
				findAndReplaceEditing.find( 'foo' );

				const countFindResultMarkers = () => [ ...inlineRootModel.markers ]
					.filter( m => m.name.startsWith( 'findResult:' ) ).length;

				inlineRootEditor.execute( 'replace', 'bar', findAndReplaceEditing.state.highlightedResult );
				expect( countFindResultMarkers() ).toBe( 3 );

				inlineRootEditor.execute( 'replace', 'bar', findAndReplaceEditing.state.highlightedResult );
				expect( countFindResultMarkers() ).toBe( 2 );

				inlineRootEditor.execute( 'replace', 'bar', findAndReplaceEditing.state.highlightedResult );
				expect( countFindResultMarkers() ).toBe( 1 );
			} );
		} );
	} );
} );
