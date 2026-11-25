/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { ModelTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';
import { _setModelData, _getModelData } from '@ckeditor/ckeditor5-engine';
import { FindAndReplaceEditing } from '../src/findandreplaceediting.js';
import { sortSearchResultsByMarkerPositions } from '../src/findandreplacestate.js';
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

		describe( 'when the replacement text contains the searched phrase', () => {
			let findAndReplaceEditing, state;

			beforeEach( () => {
				findAndReplaceEditing = editor.plugins.get( 'FindAndReplaceEditing' );
				state = findAndReplaceEditing.state;
			} );

			it( 'should not add results found in the replacement text', () => {
				_setModelData( model, '<paragraph>HelloWorld Hello[]</paragraph>' );

				findAndReplaceEditing.find( 'Hello' );
				editor.execute( 'replace', 'HelloHello', state.highlightedResult );

				expect( getResultPaths() ).toEqual( [ '0,16' ] );
			} );

			it( 'should highlight the next result instead of a match in the replacement text', () => {
				_setModelData( model, '<paragraph>HelloWorld Hello[]</paragraph>' );

				findAndReplaceEditing.find( 'Hello' );
				editor.execute( 'replace', 'HelloHello', state.highlightedResult );

				expect( state.highlightedResult.marker.getStart().path ).toEqual( [ 0, 16 ] );
				expect( state.highlightedOffset ).toBe( 1 );
			} );

			it( 'should not wrap around to the replacement text after replacing the last result', () => {
				_setModelData( model, '<paragraph>HelloWorld Hello[]</paragraph>' );

				findAndReplaceEditing.find( 'Hello' );
				editor.execute( 'replace', 'HelloHello', state.highlightedResult );
				editor.execute( 'replace', 'HelloHello', state.highlightedResult );

				expect( state.results.length ).toBe( 0 );
				expect( state.highlightedResult ).toBeNull();
				expect( _getModelData( model, { withoutSelection: true } ) ).toBe(
					'<paragraph>HelloHelloWorld HelloHello</paragraph>'
				);
			} );

			it( 'should replace each of the original results exactly once when replacing them one by one', () => {
				_setModelData( model, '<paragraph>HelloWorld Hello Hello</paragraph><paragraph>Hello[]</paragraph>' );

				findAndReplaceEditing.find( 'Hello' );

				let replacements = 0;

				// The limit guards the test against an infinite loop.
				while ( state.highlightedResult && replacements < 10 ) {
					editor.execute( 'replace', 'HelloHello', state.highlightedResult );
					replacements++;
				}

				expect( replacements ).toBe( 4 );
				expect( _getModelData( model, { withoutSelection: true } ) ).toBe(
					'<paragraph>HelloHelloWorld HelloHello HelloHello</paragraph><paragraph>HelloHello</paragraph>'
				);
			} );

			it( 'should not add a match spanning the replacement text and the text after it', () => {
				_setModelData( model, '<paragraph>Hellolo x Hellolo[]</paragraph>' );

				findAndReplaceEditing.find( 'Hello' );
				editor.execute( 'replace', 'Hel', state.highlightedResult );

				expect( _getModelData( model, { withoutSelection: true } ) ).toBe( '<paragraph>Hello x Hellolo</paragraph>' );
				expect( getResultPaths() ).toEqual( [ '0,8' ] );
			} );

			it( 'should keep the results from the same paragraph and from other paragraphs', () => {
				_setModelData( model, '<paragraph>Hello Hello Hello</paragraph><paragraph>Hello[]</paragraph>' );

				findAndReplaceEditing.find( 'Hello' );
				editor.execute( 'replace', 'HelloHello', state.results.get( 1 ) );

				expect( getResultPaths() ).toEqual( [ '0,0', '0,17', '1,0' ] );
			} );

			it( 'should keep the results from nested text containers of the changed paragraph', () => {
				registerInlineEditable();

				_setModelData( model,
					'<paragraph>Hello <inlineWidget><inlineEditable>Hello</inlineEditable></inlineWidget> Hello[]</paragraph>'
				);

				findAndReplaceEditing.find( 'Hello' );
				editor.execute( 'replace', 'HelloHello', state.highlightedResult );

				expect( getResultPaths() ).toEqual( [ '0,11,0,0', '0,13' ] );
				expect( state.highlightedResult.marker.getStart().path ).toEqual( [ 0, 11, 0, 0 ] );
			} );

			it( 'should keep the results around the replaced text inside a nested text container', () => {
				registerInlineEditable();

				_setModelData( model,
					'<paragraph>Hello <inlineWidget><inlineEditable>Hello Hello</inlineEditable></inlineWidget> Hello[]</paragraph>'
				);

				findAndReplaceEditing.find( 'Hello' );
				editor.execute( 'replace', 'HelloHello', state.results.get( 1 ) );

				expect( getResultPaths() ).toEqual( [ '0,0', '0,6,0,11', '0,8' ] );
			} );

			it( 'should keep a match typed by the user between replacements', () => {
				_setModelData( model, '<paragraph>HelloWorld Hello</paragraph><paragraph>Hello[]</paragraph>' );

				findAndReplaceEditing.find( 'Hello' );
				editor.execute( 'replace', 'HelloHello', state.highlightedResult );

				model.change( writer => {
					writer.insertText( ' Hello', model.document.getRoot().getChild( 1 ), 'end' );
				} );

				expect( getResultPaths() ).toEqual( [ '0,16', '1,0', '1,6' ] );

				editor.execute( 'replace', 'HelloHello', state.highlightedResult );

				expect( getResultPaths() ).toEqual( [ '1,0', '1,6' ] );
			} );

			it( 'should refresh the highlighted offset after removing the matches found in the replacement text', () => {
				_setModelData( model, '<paragraph>HelloWorld Hello</paragraph><paragraph>Hello[]</paragraph>' );

				findAndReplaceEditing.find( 'Hello' );
				editor.execute( 'replace', 'HelloHello', state.highlightedResult );

				model.change( writer => {
					writer.insertText( ' Hello', model.document.getRoot().getChild( 1 ), 'end' );
				} );

				editor.execute( 'replace', 'HelloHello', state.highlightedResult );

				expect( state.highlightedResult.marker.getStart().path ).toEqual( [ 1, 0 ] );
				expect( state.highlightedOffset ).toBe( 1 );
			} );

			it( 'should find the matches in the replacement text in a new search', () => {
				_setModelData( model, '<paragraph>HelloWorld Hello[]</paragraph>' );

				findAndReplaceEditing.find( 'Hello' );
				editor.execute( 'replace', 'HelloHello', state.highlightedResult );

				findAndReplaceEditing.find( 'Hello' );

				expect( getResultPaths() ).toEqual( [ '0,0', '0,5', '0,16' ] );
			} );

			it( 'should not throw if a result found by the search re-run was removed during the replacement', () => {
				_setModelData( model, '<paragraph>HelloWorld Hello[]</paragraph>' );

				findAndReplaceEditing.find( 'Hello' );

				// Simulates another feature removing a result right after the search re-run.
				model.document.on( 'change:data', () => {
					const resultInReplacement = [ ...state.results ].find( result => result.marker.getStart().offset === 5 );

					if ( resultInReplacement ) {
						state.results.remove( resultInReplacement );
					}
				} );

				expect( () => editor.execute( 'replace', 'HelloHello', state.highlightedResult ) ).not.toThrow();
				expect( getResultPaths() ).toEqual( [ '0,16' ] );
			} );

			it( 'should not throw if the search was stopped during the replacement', () => {
				_setModelData( model, '<paragraph>HelloWorld Hello[]</paragraph>' );

				findAndReplaceEditing.find( 'Hello' );

				// Clearing the state removes the markers of the results before removing the results.
				model.document.on( 'change:data', () => {
					findAndReplaceEditing.stop();
				} );

				expect( () => editor.execute( 'replace', 'HelloHello', state.highlightedResult ) ).not.toThrow();
				expect( state.results.length ).toBe( 0 );
				expect( _getModelData( model, { withoutSelection: true } ) ).toBe( '<paragraph>HelloHelloWorld Hello</paragraph>' );
			} );

			function getResultPaths() {
				return sortSearchResultsByMarkerPositions( model, [ ...state.results ] )
					.map( result => result.marker.getStart().path.join( ',' ) );
			}

			function registerInlineEditable() {
				model.schema.register( 'inlineWidget', { inheritAllFrom: '$inlineObject' } );
				model.schema.register( 'inlineEditable', { isLimit: true, allowIn: 'inlineWidget', allowContentOf: '$block' } );

				editor.conversion.elementToElement( { model: 'inlineWidget', view: 'span' } );
				editor.conversion.elementToElement( { model: 'inlineEditable', view: 'span' } );
			}
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
