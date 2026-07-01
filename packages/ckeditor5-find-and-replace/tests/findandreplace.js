/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { BoldEditing } from '@ckeditor/ckeditor5-basic-styles';
import { Collection } from '@ckeditor/ckeditor5-utils';
import { _getViewData, _stringifyModel } from '@ckeditor/ckeditor5-engine';

import { FindAndReplace } from '../src/findandreplace.js';
import { FindAndReplaceUI } from '../src/findandreplaceui.js';
import { FindAndReplaceEditing } from '../src/findandreplaceediting.js';

describe( 'FindAndReplace', () => {
	// Data with 8 blocks that can contain $text.
	const LONG_TEXT =
		'<p>Cupcake ipsum dolor sit amet biscuit icing bears candy. Liquorice biscuit brownie croissant.</p>' +
		'<p>Danish toffee chupa chups liquorice jujubes gummi bears bears candy icing chupa chups. Lemon drops tiramisu muffin.</p>' +
		'<p>Chocolate bar ice cream topping marzipan. Powder gingerbread bear claw tootsie roll lollipop marzipan icing bonbon.</p>' +
		'<p>Chupa chups jelly beans halvah ice cream gingerbread bears candy halvah gummi bears. Cake dragée dessert chocolate.</p>' +
		'<p>Candy canes lemon drops wafer gummi bears biscuit tiramisu candy canes toffee powder.</p>' +
		'<p>Dessert lemon drops lollipop caramels brownie jelly liquorice marshmallow powder. Dessert tart toffee.</p>' +
		'<p>Dragée soufflé sesame snaps lollipop bonbon ice cream gummies jelly beans tootsie roll.</p>' +
		'<p>Chocolate cake fruitcake lollipop. Lemon drops sweet sweet roll lollipop toffee lollipop marzipan.</p>';

	const FOO_BAR_PARAGRAPH = '<p>Foo bar baz</p>';
	const TWO_FOO_BAR_PARAGRAPHS = FOO_BAR_PARAGRAPH + FOO_BAR_PARAGRAPH;

	let editor;
	let model;
	let root;
	let findAndReplaceUI;
	let findAndReplaceEditing;
	let editorElement;

	beforeEach( async () => {
		editorElement = document.createElement( 'div' );

		document.body.appendChild( editorElement );

		editor = await ClassicEditor.create( editorElement, {
			plugins: [ Essentials, Paragraph, BoldEditing, FindAndReplace, FindAndReplaceUI, FindAndReplaceEditing ],
			toolbar: [ 'findAndReplace' ]
		} );

		model = editor.model;
		root = model.document.getRoot();

		findAndReplaceEditing = editor.plugins.get( 'FindAndReplaceEditing' );
		findAndReplaceUI = editor.plugins.get( 'FindAndReplaceUI' );
	} );

	afterEach( async () => {
		vi.restoreAllMocks();

		await editor.destroy();

		editorElement.remove();
	} );

	it( 'should be named', () => {
		expect( FindAndReplace.pluginName ).toBe( 'FindAndReplace' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( FindAndReplace.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( FindAndReplace.isPremiumPlugin ).toBe( false );
	} );

	it( 'should require other plugins', () => {
		expect( FindAndReplace.requires ).toEqual( [ FindAndReplaceEditing, FindAndReplaceUI ] );
	} );

	describe( 'UI listeners and bindings', () => {
		it( 'should execute the findNext command on the FindAndReplaceUI#findNext event (with data)', () => {
			const spy = vi.fn();

			findAndReplaceUI.on( 'findNext', spy );
			findAndReplaceUI.fire( 'findNext', { searchText: 'bar' } );

			expect( spy.mock.calls ).toEqual( [ [ expect.any( Object ), { searchText: 'bar' } ] ] );
		} );

		it( 'should execute the findNext command on the FindAndReplaceUI#findNext event (without data)', () => {
			const spy = vi.fn();

			findAndReplaceUI.on( 'findNext', spy );
			findAndReplaceUI.fire( 'findNext' );

			expect( spy.mock.calls ).toEqual( [ [ expect.any( Object ) ] ] );
		} );

		it( 'should execute the findPrevious command on the FindAndReplaceUI#findPrevious event', () => {
			const spy = vi.fn();

			findAndReplaceUI.on( 'findPrevious', spy );
			findAndReplaceUI.fire( 'findPrevious', { searchText: 'test' } );

			expect( spy ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should execute the replace command on the FindAndReplaceUI#replace event', () => {
			const replaceCommandSpy = vi.spyOn( editor.commands.get( 'replace' ), 'execute' );
			editor.setData( TWO_FOO_BAR_PARAGRAPHS );
			const [ firstResult ] = findAndReplaceEditing.find( 'bar' );

			findAndReplaceUI.fire( 'replace', { searchText: 'bar', replaceText: 'test' } );

			expect( replaceCommandSpy.mock.calls ).toEqual( [ [ 'test', firstResult ] ] );
		} );

		it( 'should execute the replaceAll command on the FindAndReplaceUI#replaceAll event', () => {
			const spy = vi.fn();

			findAndReplaceUI.on( 'replaceAll', spy );

			findAndReplaceUI.fire( 'replaceAll', { searchText: 'test', replaceText: 'find' } );

			expect( spy ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should clear the state upon FindAndReplaceUI#searchReseted event', () => {
			const stopSpy = vi.spyOn( findAndReplaceEditing, 'stop' );
			const stateClearSpy = vi.spyOn( findAndReplaceEditing.state, 'clear' );

			findAndReplaceUI.fire( 'searchReseted' );

			expect( stopSpy ).toHaveBeenCalled();
			expect( stateClearSpy ).toHaveBeenCalled();
		} );
	} );

	describe( 'integration', () => {
		describe( 'mocks', () => {
			describe( 'with dropdown UI', () => {
				let toolbarDropdownView, newEditorElement, newEditor;

				beforeEach( async () => {
					newEditorElement = document.createElement( 'div' );

					document.body.appendChild( newEditorElement );

					newEditor = await ClassicEditor.create( newEditorElement, {
						plugins: [ Essentials, Paragraph, BoldEditing, FindAndReplace, FindAndReplaceUI, FindAndReplaceEditing ],
						toolbar: [ 'findAndReplace' ],
						findAndReplace: {
							uiType: 'dropdown'
						}
					} );

					model = newEditor.model;
					root = model.document.getRoot();

					findAndReplaceEditing = newEditor.plugins.get( 'FindAndReplaceEditing' );
					findAndReplaceUI = newEditor.plugins.get( 'FindAndReplaceUI' );

					toolbarDropdownView = newEditor.ui.view.toolbar.items
						.find( item => item.buttonView && item.buttonView.label == 'Find and replace' );
				} );

				afterEach( async () => {
					await newEditor.destroy();

					newEditorElement.remove();
				} );

				// Verifying mocks from https://github.com/ckeditor/ckeditor5/issues/9719#issuecomment-857557024.
				it( 'has a proper initial state', () => {
					// "Initial state" mock.
					newEditor.setData( LONG_TEXT );

					toolbarDropdownView.buttonView.fire( 'execute' );

					expect( findAndReplaceUI.formView._findButtonView.isEnabled, 'findButtonView' ).toBe( true );
					expect( findAndReplaceUI.formView._replaceAllButtonView.isEnabled, 'replaceAllButtonView' ).toBe( false );
					expect( findAndReplaceUI.formView._replaceButtonView.isEnabled, 'replaceButtonView' ).toBe( false );
				} );

				it( 'retains text from previous search', () => {
					// "Initial state with parameters" mock.
					newEditor.setData( LONG_TEXT );

					// First search.
					toolbarDropdownView.buttonView.fire( 'execute' );
					findAndReplaceUI.formView._findInputView.fieldView.value = 'cake';
					findAndReplaceUI.formView._findButtonView.fire( 'execute' );
					// Close the panel.
					toolbarDropdownView.isOpen = false;

					// Second search, should retain search text.
					toolbarDropdownView.buttonView.fire( 'execute' );

					expect( findAndReplaceUI.formView._findInputView.fieldView.value ).toBe( 'cake' );
					expect( findAndReplaceUI.formView._findButtonView.isEnabled, 'findButtonView' ).toBe( true );
					expect( findAndReplaceUI.formView._replaceAllButtonView.isEnabled, 'replaceAllButtonView' ).toBe( false );
					expect( findAndReplaceUI.formView._replaceButtonView.isEnabled, 'replaceButtonView' ).toBe( false );
				} );

				it( 'has a proper state when no results were found', () => {
					// "No/one result found" mock.
					newEditor.setData( LONG_TEXT );

					// First search.
					toolbarDropdownView.buttonView.fire( 'execute' );
					findAndReplaceUI.formView._findInputView.fieldView.value = 'nothingtobefound';
					findAndReplaceUI.formView._findButtonView.fire( 'execute' );

					expect( findAndReplaceUI.formView._findNextButtonView.isEnabled, 'findNextButtonView' ).toBe( false );
					expect( findAndReplaceUI.formView._findPrevButtonView.isEnabled, 'findPrevButtonView' ).toBe( false );
					expect( findAndReplaceUI.formView._replaceAllButtonView.isEnabled, 'replaceAllButtonView' ).toBe( false );
					expect( findAndReplaceUI.formView._replaceButtonView.isEnabled, 'replaceButtonView' ).toBe( false );
				} );

				it( 'shows counter with 0 of 0 when no results were found', () => {
					// (https://github.com/ckeditor/ckeditor5/issues/10014).
					newEditor.setData( LONG_TEXT );

					toolbarDropdownView.buttonView.fire( 'execute' );
					findAndReplaceUI.formView._findInputView.fieldView.value = 'nothingtobefound';
					findAndReplaceUI.formView._findButtonView.fire( 'execute' );

					const domMatchCounter = findAndReplaceUI.formView.element.querySelector( '.ck-results-counter' );

					expect( domMatchCounter.classList.contains( 'ck-hidden' ), 'counter visibility' ).toBe( false );
					expect( domMatchCounter.innerText ).toBe( '0 of 0' );
				} );

				it( 'has a proper state when a single result was found', () => {
					// "No/one result found" mock.
					newEditor.setData( LONG_TEXT );

					// First search.
					toolbarDropdownView.buttonView.fire( 'execute' );
					findAndReplaceUI.formView._findInputView.fieldView.value = 'jujubes';
					findAndReplaceUI.formView._findButtonView.fire( 'execute' );

					expect( findAndReplaceUI.formView._findNextButtonView.isEnabled, 'findNextButtonView' ).toBe( false );
					expect( findAndReplaceUI.formView._findPrevButtonView.isEnabled, 'findPrevButtonView' ).toBe( false );
					expect( findAndReplaceUI.formView._replaceAllButtonView.isEnabled, 'replaceAllButtonView' ).toBe( true );
					expect( findAndReplaceUI.formView._replaceButtonView.isEnabled, 'replaceButtonView' ).toBe( true );
				} );

				it( 'has a proper state when a multiple results were found', () => {
					// "Found results" mock.
					newEditor.setData( LONG_TEXT );

					// First search.
					toolbarDropdownView.buttonView.fire( 'execute' );
					findAndReplaceUI.formView._findInputView.fieldView.value = 'cake';
					findAndReplaceUI.formView._findButtonView.fire( 'execute' );

					expect( findAndReplaceUI.formView._findNextButtonView.isEnabled, 'findNextButtonView' ).toBe( true );
					expect( findAndReplaceUI.formView._findPrevButtonView.isEnabled, 'findPrevButtonView' ).toBe( true );
					expect( findAndReplaceUI.formView._replaceAllButtonView.isEnabled, 'replaceAllButtonView' ).toBe( true );
					expect( findAndReplaceUI.formView._replaceButtonView.isEnabled, 'replaceButtonView' ).toBe( true );
				} );

				it( 'panel is visible after clicking button\'s action area', () => {
					newEditor.setData( LONG_TEXT );

					toolbarDropdownView.buttonView.fire( 'execute' );

					expect( toolbarDropdownView.panelView.isVisible ).toBe( true );
				} );
			} );

			describe( 'with dialog UI', () => {
				let toolbarButtonView;

				beforeEach( () => {
					toolbarButtonView = editor.ui.view.toolbar.items
						.find( item => item.label == 'Find and replace' );
				} );

				// Verifying mocks from https://github.com/ckeditor/ckeditor5/issues/9719#issuecomment-857557024.
				it( 'has a proper initial state', () => {
					// "Initial state" mock.
					editor.setData( LONG_TEXT );

					toolbarButtonView.fire( 'execute' );

					expect( findAndReplaceUI.formView._findButtonView.isEnabled, 'findButtonView' ).toBe( true );
					expect( findAndReplaceUI.formView._replaceAllButtonView.isEnabled, 'replaceAllButtonView' ).toBe( false );
					expect( findAndReplaceUI.formView._replaceButtonView.isEnabled, 'replaceButtonView' ).toBe( false );
				} );

				it( 'retains text from previous search', async () => {
					// "Initial state with parameters" mock.
					editor.setData( LONG_TEXT );

					// First search.
					toolbarButtonView.fire( 'execute' );

					await wait( 20 );
					findAndReplaceUI.formView._findInputView.fieldView.value = 'cake';
					findAndReplaceUI.formView._findButtonView.fire( 'execute' );
					// Close the panel.
					toolbarButtonView.fire( 'execute' );

					// Second search, should retain search text.
					toolbarButtonView.fire( 'execute' );

					await wait( 20 );

					expect( findAndReplaceUI.formView._findInputView.fieldView.value ).toBe( 'cake' );
					expect( findAndReplaceUI.formView._findButtonView.isEnabled, 'findButtonView' ).toBe( true );
					expect( findAndReplaceUI.formView._replaceAllButtonView.isEnabled, 'replaceAllButtonView' ).toBe( false );
					expect( findAndReplaceUI.formView._replaceButtonView.isEnabled, 'replaceButtonView' ).toBe( false );
				} );

				it( 'has a proper state when no results were found', () => {
					// "No/one result found" mock.
					editor.setData( LONG_TEXT );

					// First search.
					toolbarButtonView.fire( 'execute' );
					findAndReplaceUI.formView._findInputView.fieldView.value = 'nothingtobefound';
					findAndReplaceUI.formView._findButtonView.fire( 'execute' );

					expect( findAndReplaceUI.formView._findNextButtonView.isEnabled, 'findNextButtonView' ).toBe( false );
					expect( findAndReplaceUI.formView._findPrevButtonView.isEnabled, 'findPrevButtonView' ).toBe( false );
					expect( findAndReplaceUI.formView._replaceAllButtonView.isEnabled, 'replaceAllButtonView' ).toBe( false );
					expect( findAndReplaceUI.formView._replaceButtonView.isEnabled, 'replaceButtonView' ).toBe( false );
				} );

				it( 'shows counter with 0 of 0 when no results were found', async () => {
					// (https://github.com/ckeditor/ckeditor5/issues/10014).
					editor.setData( LONG_TEXT );

					toolbarButtonView.fire( 'execute' );

					await wait( 20 );

					findAndReplaceUI.formView._findInputView.fieldView.value = 'nothingtobefound';
					findAndReplaceUI.formView._findButtonView.fire( 'execute' );

					const domMatchCounter = findAndReplaceUI.formView.element.querySelector( '.ck-results-counter' );

					expect( domMatchCounter.classList.contains( 'ck-hidden' ), 'counter visibility' ).toBe( false );
					expect( domMatchCounter.innerText ).toBe( '0 of 0' );
				} );

				it( 'has a proper state when a single result was found', () => {
					// "No/one result found" mock.
					editor.setData( LONG_TEXT );

					// First search.
					toolbarButtonView.fire( 'execute' );
					findAndReplaceUI.formView._findInputView.fieldView.value = 'jujubes';
					findAndReplaceUI.formView._findButtonView.fire( 'execute' );

					expect( findAndReplaceUI.formView._findNextButtonView.isEnabled, 'findNextButtonView' ).toBe( false );
					expect( findAndReplaceUI.formView._findPrevButtonView.isEnabled, 'findPrevButtonView' ).toBe( false );
					expect( findAndReplaceUI.formView._replaceAllButtonView.isEnabled, 'replaceAllButtonView' ).toBe( true );
					expect( findAndReplaceUI.formView._replaceButtonView.isEnabled, 'replaceButtonView' ).toBe( true );
				} );

				it( 'has a proper state when a multiple results were found', () => {
					// "Found results" mock.
					editor.setData( LONG_TEXT );

					// First search.
					toolbarButtonView.fire( 'execute' );
					findAndReplaceUI.formView._findInputView.fieldView.value = 'cake';
					findAndReplaceUI.formView._findButtonView.fire( 'execute' );

					expect( findAndReplaceUI.formView._findNextButtonView.isEnabled, 'findNextButtonView' ).toBe( true );
					expect( findAndReplaceUI.formView._findPrevButtonView.isEnabled, 'findPrevButtonView' ).toBe( true );
					expect( findAndReplaceUI.formView._replaceAllButtonView.isEnabled, 'replaceAllButtonView' ).toBe( true );
					expect( findAndReplaceUI.formView._replaceButtonView.isEnabled, 'replaceButtonView' ).toBe( true );
				} );
			} );
		} );

		describe( 'subsequent findNext events', () => {
			it( 'causes just a findNext command call', () => {
				editor.setData( LONG_TEXT );

				// The first call, it will call different logic.
				findAndReplaceUI.fire( 'findNext', { searchText: 'cake' } );

				const findSpy = getCommandExecutionSpy( 'find' );
				const findNextSpy = getCommandExecutionSpy( 'findNext' );

				// Second call (only if the search text remains the same) should just move the highlight.
				findAndReplaceUI.fire( 'findNext', { searchText: 'cake' } );

				expect( findSpy ).toHaveBeenCalledTimes( 1 );
				expect( findNextSpy ).toHaveBeenCalledTimes( 0 );

				// Third call without passing any searchText should just move the highlight.
				findAndReplaceUI.fire( 'findNext' );

				expect( findNextSpy ).toHaveBeenCalledTimes( 1 );
			} );
		} );

		describe( 'subsequent findPrevious events', () => {
			it( 'causes just a findPrevious command call', () => {
				editor.setData( LONG_TEXT );

				// The first call, it will call different logic.
				findAndReplaceUI.fire( 'findPrevious', { searchText: 'cake' } );

				const findSpy = getCommandExecutionSpy( 'find' );
				const findPrevSpy = getCommandExecutionSpy( 'findPrevious' );

				// Second call (only if the search text remains the same) should just move the highlight.
				findAndReplaceUI.fire( 'findPrevious', { searchText: 'cake' } );

				expect( findSpy ).toHaveBeenCalledTimes( 0 );
				expect( findPrevSpy ).toHaveBeenCalledTimes( 1 );
			} );
		} );

		describe( 'replace', () => {
			it( 'works with in with the typical use case', () => {
				editor.setData( TWO_FOO_BAR_PARAGRAPHS );

				findAndReplaceUI.fire( 'replace', {
					searchText: 'bar',
					replaceText: 'new'
				} );

				expect( editor.getData() ).toBe(
					'<p>Foo new baz</p>' +
					'<p>Foo bar baz</p>'
				);
			} );

			it( 'doesn\'t crash when nothing was matched', () => {
				editor.setData( TWO_FOO_BAR_PARAGRAPHS );

				findAndReplaceUI.fire( 'replace', {
					searchText: 'baaar',
					replaceText: 'new'
				} );

				expect( editor.getData() ).toBe(
					'<p>Foo bar baz</p>' +
					'<p>Foo bar baz</p>'
				);
			} );

			it( 'skips extra search if same search has already been performed', () => {
				editor.setData( TWO_FOO_BAR_PARAGRAPHS );

				findAndReplaceUI.fire( 'findNext', {
					searchText: 'baz'
				} );

				findAndReplaceUI.fire( 'replace', {
					searchText: 'baz',
					replaceText: 'new'
				} );

				expect( editor.getData() ).toBe(
					'<p>Foo bar new</p>' +
					'<p>Foo bar baz</p>'
				);
			} );
		} );

		describe( 'replace all', () => {
			it( 'is performed based on event from UI', () => {
				editor.setData( TWO_FOO_BAR_PARAGRAPHS );

				findAndReplaceUI.fire( 'replaceAll', {
					searchText: 'bar',
					replaceText: 'new'
				} );

				expect( editor.getData() ).toBe(
					'<p>Foo new baz</p>' +
					'<p>Foo new baz</p>'
				);
			} );

			it( 'skips extra search if same search has already been performed', () => {
				editor.setData( TWO_FOO_BAR_PARAGRAPHS );

				findAndReplaceUI.fire( 'findNext', {
					searchText: 'baz'
				} );

				findAndReplaceUI.fire( 'replaceAll', {
					searchText: 'baz',
					replaceText: 'new'
				} );

				expect( editor.getData() ).toBe(
					'<p>Foo bar new</p>' +
					'<p>Foo bar new</p>'
				);
			} );
		} );

		it( 'doesn\'t break when searching, closing dropdown, opening again and replacing', () => {
			editor.setData( TWO_FOO_BAR_PARAGRAPHS );

			findAndReplaceUI.fire( 'findNext', { searchText: 'bar' } );

			findAndReplaceUI.fire( 'dropdown:closed' );

			findAndReplaceUI.fire( 'replace', {
				searchText: 'bar',
				replaceText: 'new'
			} );
		} );

		describe( 'undo', () => {
			it( 'doesn\'t bring back highlighted content', () => {
				// (https://github.com/ckeditor/ckeditor5/issues/9974)
				editor.setData( FOO_BAR_PARAGRAPH );

				const { results } = editor.execute( 'find', 'bar' );

				editor.execute( 'replace', 'new', results.get( 0 ) );

				editor.execute( 'undo' );

				expect( _stringifyModel( model.document.getRoot(), null, editor.model.markers ) ).toBe(
					'<paragraph>Foo bar baz</paragraph>'
				);
			} );
		} );
	} );

	describe( 'find()', () => {
		it( 'should return list of results', () => {
			editor.setData( LONG_TEXT );

			const findResults = findAndReplaceEditing.find( 'bears' );

			expect( findResults ).toBeInstanceOf( Collection );
			expect( findResults.length ).toBe( 6 );
		} );

		it( 'should return properly formatted result', () => {
			editor.setData( FOO_BAR_PARAGRAPH );

			const findResults = findAndReplaceEditing.find( 'bar' );

			const [ result ] = findResults;

			expect( result ).toHaveProperty( 'id' );
			expect( result.id ).toMatch( /^findResult:[a-f0-9]{33}$/ );
			expect( result ).toHaveProperty( 'label', 'bar' );
			expect( result ).toHaveProperty( 'marker' );

			const { marker } = result;

			const paragraph = root.getChild( 0 );
			const rangeOnBar = model.createRange( model.createPositionAt( paragraph, 4 ), model.createPositionAt( paragraph, 7 ) );

			expect( marker.getRange().isEqual( rangeOnBar ) ).toBe( true );
		} );

		it( 'should update list of results on editor change (text insert)', () => {
			editor.setData( LONG_TEXT );

			const findResults = findAndReplaceEditing.find( 'bears' );

			expect( findResults.length ).toBe( 6 );

			model.change( writer => {
				model.insertContent( writer.createText( 'Foo bears foo' ), root.getChild( 0 ), 0 );
			} );

			expect( findResults.length ).toBe( 7 );
		} );

		it( 'should update list of results on editor change (block with text insert)', () => {
			editor.setData( LONG_TEXT );

			const findResults = findAndReplaceEditing.find( 'bears' );

			expect( findResults.length ).toBe( 6 );

			model.change( writer => {
				const paragraph = writer.createElement( 'paragraph' );
				const text = writer.createText( 'Foo bears foo' );
				writer.insert( text, paragraph, 0 );

				model.insertContent( paragraph, root, 0 );
			} );

			expect( findResults.length ).toBe( 7 );
		} );

		it( 'should update list of results on editor change (removed block)', () => {
			editor.setData( LONG_TEXT );

			const findResults = findAndReplaceEditing.find( 'bears' );

			expect( findResults.length ).toBe( 6 );

			model.change( writer => {
				writer.remove( root.getChild( 0 ) );
			} );

			expect( findResults.length ).toBe( 5 );
		} );

		it( 'should update list of results on editor change (removed part of highlighted block)', () => {
			editor.setData( LONG_TEXT );

			const findResults = findAndReplaceEditing.find( 'CupCake' );

			expect( findResults.length ).toBe( 1 );

			model.change( writer => {
				const selection = writer.createSelection( writer.createRange(
					writer.createPositionAt( root.getChild( 0 ), 0 ),
					writer.createPositionAt( root.getChild( 0 ), 2 )
				) );

				model.deleteContent( selection );
			} );

			expect( findResults.length ).toBe( 0 );
		} );

		it( 'should update list of results on editor change (find, remove all blocks and type search phrase in editor)', () => {
			editor.setData( '' );

			const findResults = findAndReplaceEditing.find( 'CupCake' );

			expect( findResults.length ).toBe( 0 );

			editor.setData( LONG_TEXT );

			expect( findResults.length ).toBe( 1 );
		} );

		it( 'should update list of results on editor change (changed text in marker)', () => {
			editor.setData( FOO_BAR_PARAGRAPH );

			const findResults = findAndReplaceEditing.find( 'bar' );

			expect( findResults.length ).toBe( 1 );

			model.change( writer => {
				model.insertContent( writer.createText( 'x' ), root.getChild( 0 ), 5 );
			} );

			expect( findResults.length ).toBe( 0 );
			expect( _getViewData( editor.editing.view, { withoutSelection: true } ) ).toBe( '<p>Foo bxar baz</p>' );
		} );

		it( 'should find result in any element that allows $text inside', () => {
			model.schema.register( 'test', {
				inheritAllFrom: '$block'
			} );
			editor.conversion.elementToElement( { model: 'test', view: 'test' } );
			editor.setData( '<test>Foo bar baz</test>' );

			const findResults = findAndReplaceEditing.find( 'bar' );
			expect( findResults.length ).toBe( 1 );
		} );

		it( 'should insert marker for a find result', () => {
			editor.setData( FOO_BAR_PARAGRAPH );

			findAndReplaceEditing.find( 'bar' );

			const markers = [ ...model.markers.getMarkersGroup( 'findResult' ) ];

			expect( markers ).toHaveLength( 1 );

			const [ marker ] = markers;

			const paragraph = root.getChild( 0 );
			const rangeOnBar = model.createRange( model.createPositionAt( paragraph, 4 ), model.createPositionAt( paragraph, 7 ) );

			expect( marker.getRange().isEqual( rangeOnBar ) ).toBe( true );
		} );

		it( 'should call a callback for each block with text inside', () => {
			editor.setData( LONG_TEXT );

			const callbackSpy = vi.fn();

			findAndReplaceEditing.find( callbackSpy );

			expect( callbackSpy ).toHaveBeenCalledTimes( 8 );
		} );

		it( 'should call a callback only for blocks which allows text', () => {
			model.schema.register( 'test', {
				inheritAllFrom: '$block'
			} );
			model.schema.register( 'disallowed', {
				allowIn: '$root'
			} );
			editor.conversion.elementToElement( { model: 'test', view: 'test' } );
			editor.conversion.elementToElement( { model: 'disallowed', view: 'disallowed' } );

			editor.setData( '<p>Foo bar baz</p><test>Foo bar baz</test><disallowed></disallowed>' );

			const callbackSpy = vi.fn();

			findAndReplaceEditing.find( callbackSpy );

			expect( callbackSpy ).toHaveBeenCalledTimes( 2 );
		} );

		it( 'should call a callback for changed blocks when pass string to find', () => {
			editor.setData( LONG_TEXT );

			const callbackSpy = vi.fn( () => [] );

			findAndReplaceEditing.find( callbackSpy );
			callbackSpy.mockClear();

			model.change( writer => {
				model.insertContent( writer.createText( 'Foo bears foo' ), root.getChild( 0 ), 0 );
			} );

			expect( callbackSpy ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should call a callback for changed blocks when pass callback to find', () => {
			editor.setData( LONG_TEXT );

			const callbackSpy = vi.fn( () => [] );
			findAndReplaceEditing.find( callbackSpy );
			callbackSpy.mockClear();

			model.change( writer => {
				model.insertContent( writer.createText( 'Foo bears foo' ), root.getChild( 0 ), 0 );
			} );

			expect( callbackSpy ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should handle custom callback return value', () => {
			editor.setData( FOO_BAR_PARAGRAPH );

			const findResults = findAndReplaceEditing.find( () => {
				return [
					{
						label: 'XXX',
						start: 0,
						end: 7
					}
				];
			} );

			expect( findResults ).toHaveLength( 1 );
			const [ result ] = findResults;

			expect( result ).toHaveProperty( 'label', 'XXX' );
			expect( result ).toHaveProperty( 'marker' );

			const { marker } = result;

			const paragraph = root.getChild( 0 );
			const rangeOnBar = model.createRange( model.createPositionAt( paragraph, 0 ), model.createPositionAt( paragraph, 7 ) );

			expect( marker.getRange().isEqual( rangeOnBar ) ).toBe( true );
		} );

		it( 'should handle soft breaks in text', () => {
			editor.setData( '<p>Foo<br>bar<br>baz</p>' );

			const paragraph = root.getChild( 0 );
			const spy = vi.fn();

			findAndReplaceEditing.find( spy );

			expect( spy ).toHaveBeenCalledWith( expect.objectContaining( { text: 'Foo\nbar\nbaz' } ) );
			expect( spy ).toHaveBeenCalledWith( expect.objectContaining( { item: paragraph } ) );
		} );
	} );

	describe( 'stop()', () => {
		it( 'should not throw if no active results', () => {
			expect( () => findAndReplaceEditing.stop() ).not.toThrow();
		} );

		it( 'should remove all markers', () => {
			editor.setData( LONG_TEXT );

			findAndReplaceEditing.find( 'bears' );

			expect( [ ...model.markers.getMarkersGroup( 'findResult' ) ] ).toHaveLength( 6 );

			findAndReplaceEditing.stop();

			expect( [ ...model.markers.getMarkersGroup( 'findResult' ) ] ).toHaveLength( 0 );
		} );

		it( 'should stop listening to document changes', () => {
			editor.setData( LONG_TEXT );

			const callbackSpy = vi.fn();
			findAndReplaceEditing.find( callbackSpy );
			callbackSpy.mockClear();

			findAndReplaceEditing.stop();

			model.change( writer => {
				model.insertContent( writer.createText( 'Foo bears foo' ), root.getChild( 0 ), 0 );
			} );

			expect( callbackSpy ).toHaveBeenCalledTimes( 0 );
		} );
	} );

	function getCommandExecutionSpy( commandName ) {
		const spy = vi.fn();
		editor.commands.get( commandName ).on( 'execute', spy );
		return spy;
	}

	function wait( time ) {
		return new Promise( res => {
			window.setTimeout( res, time );
		} );
	}
} );
