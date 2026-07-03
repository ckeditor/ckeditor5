/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ModelTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/modeltesteditor.js';
import { _setModelData, _stringifyModel } from '@ckeditor/ckeditor5-engine';
import { FindAndReplaceEditing } from '../src/findandreplaceediting.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';

describe( 'FindCommand', () => {
	let editor, model, command;

	beforeEach( () => {
		return ModelTestEditor
			.create( {
				plugins: [ FindAndReplaceEditing, Paragraph ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				command = editor.commands.get( 'find' );
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'sets public properties', () => {
			expect( command ).toHaveProperty( 'isEnabled', true );
			expect( command ).toHaveProperty( 'affectsData', false );
		} );

		it( 'sets state property', () => {
			expect( command ).toHaveProperty( '_state', editor.plugins.get( 'FindAndReplaceEditing' ).state );
		} );
	} );

	describe( 'isEnabled', () => {
		it( 'should be enabled in empty document', () => {
			_setModelData( model, '[]' );
			expect( command.isEnabled ).toBe( true );
		} );

		it( 'should be enabled by default', () => {
			_setModelData( model, '<paragraph>foo[]</paragraph>' );
			expect( command.isEnabled ).toBe( true );
		} );

		it( 'should be enabled in readonly mode editor', () => {
			_setModelData( model, '<paragraph>foo[]</paragraph>' );

			editor.enableReadOnlyMode( 'unit-test' );

			expect( command.isEnabled ).toBe( true );
		} );

		it( 'should be enabled after disabling readonly mode', () => {
			_setModelData( model, '<paragraph>foo[]</paragraph>' );

			editor.enableReadOnlyMode( 'unit-test' );
			editor.disableReadOnlyMode( 'unit-test' );

			expect( command.isEnabled ).toBe( true );
		} );
	} );

	describe( 'execute()', () => {
		describe( 'with string passed', () => {
			it( 'places markers correctly in the model', () => {
				_setModelData( model, '<paragraph>[]Foo bar baz. Bam bar bom.</paragraph>' );

				const { results } = command.execute( 'bar' );
				const markers = getSimplifiedMarkersFromResults( results );

				expect( _stringifyModel( model.document.getRoot(), null, markers ) ).toBe(
					'<paragraph>Foo <X:start></X:start>bar<X:end></X:end> baz. Bam <Y:start></Y:start>bar<Y:end></Y:end> bom.</paragraph>'
				);
			} );

			it( 'calls model.change() only once', () => {
				_setModelData( model, '<paragraph>[]Foo bar baz. Bam bar bar bar bar bom.</paragraph>' );
				const spy = vi.spyOn( model, 'change' );

				command.execute( 'bar' );

				// It's called two additional times
				// from 'change:highlightedResult' handler in FindAndReplaceEditing.
				expect( spy ).toHaveBeenCalledTimes( 3 );
			} );

			it( 'returns no result if nothing matched', () => {
				_setModelData( model, '<paragraph>[]Foo bar baz. Bam bar bom.</paragraph>' );

				const { results } = command.execute( 'missing' );

				expect( results.length ).toBe( 0 );
			} );

			it( 'assigns proper labels to matches', () => {
				_setModelData( model, '<paragraph>Foo bar b[]az. Bam bar bom.</paragraph>' );

				const { results } = command.execute( 'bar' );
				const labels = results.map( result => result.label );

				expect( labels ).toEqual( [ 'bar', 'bar' ] );
			} );

			it( 'assigns non-empty ids for each match', () => {
				_setModelData( model, '<paragraph>Foo bar b[]az. Bam bar bom.</paragraph>' );

				const { results } = command.execute( 'bar' );
				const ids = results.map( result => result.id );

				for ( let i = 0; i < ids.length; i++ ) {
					const currentId = ids[ i ];

					expect( currentId, `id #${ i }` ).toEqual( expect.any( String ) );
					expect( currentId.length, `id #${ i }` ).not.toBe( 0 );
				}
			} );

			it( 'assigns an unique ids for each match', () => {
				_setModelData( model, '<paragraph>Foo bar b[]az. Bam bar bom bar.</paragraph>' );

				const { results } = command.execute( 'bar' );
				const ids = results.map( result => result.id );

				expect( ids[ 0 ] ).not.toBe( ids[ 1 ] );
				expect( ids[ 1 ] ).not.toBe( ids[ 2 ] );
			} );

			it( 'properly searches for regexp special characters simple', () => {
				editor.setData( '<p>-[\\]{}()*+?.,^$|#\\s</p>' );

				const { results } = command.execute( ']{' );

				expect( results.length ).toBe( 1 );

				const markers = getSimplifiedMarkersFromResults( results );

				expect( _stringifyModel( model.document.getRoot(), null, markers ) ).toBe(
					'<paragraph>-[\\<X:start></X:start>]{<X:end></X:end>}()*+?.,^$|#\\s</paragraph>'
				);
			} );

			it( 'properly searches for regexp special characters', () => {
				editor.setData( '<p>-[\\]{}()*+?.,^$|#\\s</p>' );

				const { results } = command.execute( '-[\\]{}()*+?.,^$|#\\s' );

				expect( results.length ).toBe( 1 );

				const markers = getSimplifiedMarkersFromResults( results );

				expect( _stringifyModel( model.document.getRoot(), null, markers ) ).toBe(
					'<paragraph><X:start></X:start>' +
						'-[\\]{}()*+?.,^$|#\\s' +
					'<X:end></X:end></paragraph>'
				);
			} );

			it( 'matches emoji', () => {
				editor.setData( '<p>foo 🐛 bar</p>' );

				const { results } = command.execute( '🐛' );

				expect( results.length ).toBe( 1 );

				const markers = getSimplifiedMarkersFromResults( results );

				expect( _stringifyModel( model.document.getRoot(), null, markers ) ).toBe(
					'<paragraph>foo <X:start></X:start>🐛<X:end></X:end> bar</paragraph>'
				);
			} );

			it( 'sets proper searchText state value', () => {
				editor.setData( '<p>foo 🐛 bar</p>' );

				const { results } = command.execute( '🐛' );

				expect( results.length ).toBe( 1 );
				expect( command._state.searchText ).toBe( '🐛' );
			} );

			describe( 'options.matchCase', () => {
				it( 'set to true doesn\'t match differently cased string', () => {
					editor.setData( '<p>foo bAr</p>' );

					const { results } = command.execute( 'bar', { matchCase: true } );

					expect( results.length ).toBe( 0 );
				} );

				it( 'set to true matches identically cased string', () => {
					editor.setData( '<p>foo bAr</p>' );

					const { results } = command.execute( 'bAr', { matchCase: true } );

					expect( results.length ).toBe( 1 );

					const markers = getSimplifiedMarkersFromResults( results );

					expect( _stringifyModel( model.document.getRoot(), null, markers ) ).toBe(
						'<paragraph>foo <X:start></X:start>bAr<X:end></X:end></paragraph>'
					);
				} );

				it( 'is disabled by default', () => {
					editor.setData( '<p>foo bAr</p>' );

					const { results } = command.execute( 'bar' );

					expect( results.length ).toBe( 1 );

					const markers = getSimplifiedMarkersFromResults( results );

					expect( _stringifyModel( model.document.getRoot(), null, markers ) ).toBe(
						'<paragraph>foo <X:start></X:start>bAr<X:end></X:end></paragraph>'
					);
				} );
			} );

			describe( 'options.wholeWords', () => {
				it( 'set to true matches a boundary words', () => {
					editor.setData( '<p>bar foo bar</p><p>bar</p>' );

					const { results } = command.execute( 'bar', { wholeWords: true } );

					expect( results.length ).toBe( 3 );
				} );

				it( 'set to true matches a word followed by a dot', () => {
					editor.setData( '<p>foo bar.</p>' );

					const { results } = command.execute( 'bar', { wholeWords: true } );

					expect( results.length ).toBe( 1 );
				} );

				it( 'set to true makes a proper selection', () => {
					editor.setData( '<p>foo bar baz</p>' );

					const { results } = command.execute( 'bar', { wholeWords: true } );

					const markers = getSimplifiedMarkersFromResults( results );

					expect( _stringifyModel( model.document.getRoot(), null, markers ) ).toBe(
						'<paragraph>foo <X:start></X:start>bar<X:end></X:end> baz</paragraph>'
					);
				} );

				it( 'set to true matches a word followed by an underscore', () => {
					editor.setData( '<p>foo .bar_</p>' );

					const { results } = command.execute( 'bar', { wholeWords: true } );

					expect( results.length ).toBe( 1 );
				} );

				it( 'set to true matches a word separated by an emoji', () => {
					editor.setData( '<p>foo 🦄bar🦄baz</p>' );

					const { results } = command.execute( 'bar', { wholeWords: true } );

					expect( results.length ).toBe( 1 );
				} );

				it( 'set to true matches a text ending with a space ', () => {
					editor.setData( '<p>foo bar baz</p>' );

					const { results } = command.execute( 'bar ', { wholeWords: true } );

					expect( results.length ).toBe( 1 );
				} );

				it( 'set to true matches a text starting with a space ', () => {
					editor.setData( '<p>foo bar baz</p>' );

					const { results } = command.execute( ' bar', { wholeWords: true } );

					expect( results.length ).toBe( 1 );
				} );

				it( 'set to true matches a text starting and ending with a space ', () => {
					editor.setData( '<p>foo bar baz</p>' );

					const { results } = command.execute( ' bar ', { wholeWords: true } );

					expect( results.length ).toBe( 1 );
				} );

				it( 'set to true doesn\'t match a word including diacritic characters', () => {
					editor.setData( '<p>foo łbarę and Äbarè</p>' );

					const { results } = command.execute( 'bar', { wholeWords: true } );

					expect( results.length ).toBe( 0 );
				} );

				it( 'set to true doesn\'t match similar words with superfluous characters', () => {
					editor.setData( '<p>foo barr baz</p><p>aaabar</p>' );

					const { results } = command.execute( 'bar', { wholeWords: true } );

					expect( results.length ).toBe( 0 );
				} );

				it( 'set to true matches words separated by a single space', () => {
					editor.setData( '<p>bar bar</p>' );

					const { results } = command.execute( 'bar', { wholeWords: true } );

					expect( results.length ).toBe( 2 );
				} );

				it( 'is disabled by default', () => {
					editor.setData( '<p>foo aabaraa</p>' );

					const { results } = command.execute( 'bar' );

					expect( results.length ).toBe( 1 );
				} );
			} );

			describe( 'in multi-root editor', () => {
				let multiRootEditor, multiRootModel;

				class MultiRootEditor extends ModelTestEditor {
					constructor( config ) {
						super( config );

						this.model.document.createRoot( '$root', 'second' );
					}
				}

				beforeEach( async () => {
					multiRootEditor = await MultiRootEditor.create( { plugins: [ FindAndReplaceEditing, Paragraph ] } );
					multiRootModel = multiRootEditor.model;

					_setModelData( multiRootModel, '<paragraph>Foo bar baz</paragraph>' );
					_setModelData( multiRootModel, '<paragraph>Foo bar baz</paragraph>', { rootName: 'second' } );
				} );

				afterEach( async () => {
					await multiRootEditor.destroy();
				} );

				it( 'should place markers correctly in the model in every root', () => {
					const { results } = multiRootEditor.execute( 'find', 'z' );
					const [ markerMain, markerSecond ] = getSimplifiedMarkersFromResults( results );

					expect( _stringifyModel( multiRootModel.document.getRoot( 'main' ), null, [ markerMain ] ) ).toBe(
						'<paragraph>Foo bar ba<X:start></X:start>z<X:end></X:end></paragraph>'
					);

					expect( _stringifyModel( multiRootModel.document.getRoot( 'second' ), null, [ markerSecond ] ) ).toBe(
						'<paragraph>Foo bar ba<Y:start></Y:start>z<Y:end></Y:end></paragraph>'
					);
				} );

				it( 'should properly search for occurrences in every root', () => {
					const { results } = multiRootEditor.execute( 'find', 'z' );

					expect( results ).toHaveLength( 2 );
				} );

				it( 'should properly search for all occurrences if the first occurrence is not in the main root', () => {
					_setModelData( multiRootModel, '<paragraph>Foo bar bar</paragraph>' );

					const { results } = multiRootEditor.execute( 'find', 'z' );

					expect( results ).toHaveLength( 1 );
				} );
			} );
		} );

		describe( 'with callback passed', () => {
			it( 'sets returned searchText attribute to the object result', () => {
				const findAndReplaceUtils = editor.plugins.get( 'FindAndReplaceUtils' );

				_setModelData( model, '<paragraph>[]Foo bar baz. Bam bar bom.</paragraph>' );

				const searchText = 'bar';
				const { results } = command.execute( ( ...args ) => ( {
					results: findAndReplaceUtils.findByTextCallback( searchText, {} )( ...args ),
					searchText
				} ) );

				expect( results.length ).toBe( 2 );
				expect( command._state.searchText ).toBe( searchText );
			} );

			it( 'sets empty searchText if array is returned', () => {
				const findAndReplaceUtils = editor.plugins.get( 'FindAndReplaceUtils' );

				_setModelData( model, '<paragraph>[]Foo bar baz. Bam bar bom.</paragraph>' );

				const searchText = 'bar';
				const { results } = command.execute( findAndReplaceUtils.findByTextCallback( searchText, {} ) );

				expect( results.length ).toBe( 2 );
				expect( command._state.searchText ).toBe( '' );
			} );
		} );

		it( 'adds marker synchronously', () => {
			editor.setData( '<p>foo bar baz</p>' );

			const { results } = command.execute( 'bar' );

			expect( editor.model.markers.has( results.get( 0 ).marker.name ) ).toBe( true );
		} );

		/**
		 * Returns markers array from array. All markers have their name simplified to "X" as otherwise they're
		 * random and unique.
		 */
		function getSimplifiedMarkersFromResults( results ) {
			let letter = 'X';

			return results.map( item => {
				// Replace markers id to a predefined value, as originally these are unique random ids.
				item.marker.name = letter;

				letter = String.fromCharCode( letter.charCodeAt( 0 ) + 1 );

				return item.marker;
			} );
		}
	} );
} );
