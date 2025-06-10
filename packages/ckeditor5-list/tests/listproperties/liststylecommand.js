/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Editor } from '@ckeditor/ckeditor5-core/src/editor/editor.js';
import { Model } from '@ckeditor/ckeditor5-engine/src/model/model.js';
import { testUtils } from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { _setModelData, _getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

import { ListCommand } from '../../src/list/listcommand.js';
import { ListStyleCommand } from '../../src/listproperties/liststylecommand.js';
import { stubUid } from '../list/_utils/uid.js';
import { modelList } from '../list/_utils/utils.js';

describe( 'ListStyleCommand', () => {
	let editor, model, bulletedListCommand, numberedListCommand, listStyleCommand;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		editor = new Editor();

		await editor.initPlugins();

		editor.model = new Model();

		model = editor.model;
		model.document.createRoot();

		model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );
		model.schema.register( 'blockQuote', { inheritAllFrom: '$container' } );
		model.schema.extend( '$container', { allowAttributes: [ 'listType', 'listIndent', 'listItemId', 'listStyle' ] } );
		model.schema.extend( '$block', { allowAttributes: [ 'listType', 'listIndent', 'listItemId', 'listStyle' ] } );
		model.schema.extend( '$blockObject', { allowAttributes: [ 'listType', 'listIndent', 'listItemId', 'listStyle' ] } );

		model.schema.register( 'blockWidget', {
			isObject: true,
			isBlock: true,
			allowIn: '$root',
			allowAttributesOf: '$container'
		} );

		bulletedListCommand = new ListCommand( editor, 'bulleted' );
		numberedListCommand = new ListCommand( editor, 'numbered' );
		listStyleCommand = new ListStyleCommand( editor, 'default' );

		editor.commands.add( 'numberedList', numberedListCommand );
		editor.commands.add( 'bulletedList', bulletedListCommand );
		editor.commands.add( 'listStyle', bulletedListCommand );

		stubUid();
	} );

	describe( '#isEnabled', () => {
		it( 'should be true if bulletedList or numberedList is enabled', () => {
			bulletedListCommand.isEnabled = true;
			numberedListCommand.isEnabled = false;
			listStyleCommand.refresh();

			expect( listStyleCommand.isEnabled ).to.equal( true );

			bulletedListCommand.isEnabled = false;
			numberedListCommand.isEnabled = true;
			listStyleCommand.refresh();

			expect( listStyleCommand.isEnabled ).to.equal( true );
		} );

		it( 'should be false if bulletedList and numberedList are disabled', () => {
			bulletedListCommand.isEnabled = false;
			numberedListCommand.isEnabled = false;

			listStyleCommand.refresh();

			expect( listStyleCommand.isEnabled ).to.equal( false );
		} );

		it( 'should be true if selection is inside a to-do list item', () => {
			_setModelData( model, '<paragraph listType="todo" listItemId="a" listIndent="0">foo[]</paragraph>' );

			listStyleCommand.refresh();

			expect( listStyleCommand.isEnabled ).to.be.true;
		} );
	} );

	describe( '#value', () => {
		it( 'should return null if selected a paragraph', () => {
			_setModelData( model, '<paragraph>Foo[]</paragraph>' );

			expect( listStyleCommand.value ).to.equal( null );
		} );

		it( 'should return null if selection starts in a paragraph and ends in a list item', () => {
			_setModelData( model, modelList( `
				Fo[o
				* Bar]
			` ) );

			expect( listStyleCommand.value ).to.equal( null );
		} );

		it( 'should return the value of `listStyle` attribute if selection is inside a list item (collapsed selection)', () => {
			_setModelData( model, modelList( [ '* Foo[] {style:circle}' ] ) );

			expect( listStyleCommand.value ).to.equal( 'circle' );
		} );

		it( 'should return the value of `listStyle` attribute if selection is inside a list item (non-collapsed selection)', () => {
			_setModelData( model, modelList( [ '* [Foo] {style:square}' ] ) );

			expect( listStyleCommand.value ).to.equal( 'square' );
		} );

		it( 'should return the value of `listStyle` attribute if selected more elements in the same list', () => {
			_setModelData( model, modelList( `
				* [1. {style:square}
				* 2.]
				* 3.
			` ) );

			expect( listStyleCommand.value ).to.equal( 'square' );
		} );

		it( 'should return the value of `listStyle` attribute for the selection inside a nested list', () => {
			_setModelData( model, modelList( `
				* 1. {style:square}
				  * 1.1.[] {style:disc}
				* 2.
			` ) );

			expect( listStyleCommand.value ).to.equal( 'disc' );
		} );

		it( 'should return the value of `listStyle` attribute from a list where the selection starts (selection over nested list)', () => {
			_setModelData( model, modelList( `
				* 1. First {style:square}
				  * 1.1. [Second {style:disc}
				* 2. Third]
			` ) );

			expect( listStyleCommand.value ).to.equal( 'disc' );
		} );
	} );

	describe( 'execute()', () => {
		it( 'should set the `listStyle` attribute for collapsed selection', () => {
			_setModelData( model, modelList( [ '* 1.[] {style:square}' ] ) );

			listStyleCommand.execute( { type: 'circle' } );

			expect( _getModelData( model ) ).to.equalMarkup( modelList( [ '* 1.[] {style:circle}' ] ) );
		} );

		it( 'should set the `listStyle` attribute for non-collapsed selection', () => {
			_setModelData( model, modelList( [ '* [1.] {style:disc}' ] ) );

			listStyleCommand.execute( { type: 'circle' } );

			expect( _getModelData( model ) ).to.equalMarkup( modelList( [ '* [1.] {style:circle}' ] ) );
		} );

		it( 'should set the `listStyle` attribute for all the same list items (collapsed selection)', () => {
			_setModelData( model, modelList( `
				* 1. {style:square}
				* 2.[]
				* 3.
			` ) );

			listStyleCommand.execute( { type: 'circle' } );

			expect( _getModelData( model ) ).to.equalMarkup( modelList( `
				* 1. {style:circle}
				* 2.[]
				* 3.
			` ) );
		} );

		it( 'should set the `listStyle` attribute for all the same list items and ignores nested lists (collapsed selection)', () => {
			_setModelData( model, modelList( `
				* 1.[] {style:square}
				* 2.
				  * 2.1. {style:disc}
				  * 2.2
				* 3.
				  * 3.1. {style:disc}
			` ) );

			listStyleCommand.execute( { type: 'circle' } );

			expect( _getModelData( model ) ).to.equalMarkup( modelList( `
				* 1.[] {style:circle}
				* 2.
				  * 2.1. {style:disc}
				  * 2.2
				* 3.
				  * 3.1. {style:disc}
			` ) );
		} );

		it( 'should set the `listStyle` attribute for all the same list items (block widget selected)', () => {
			_setModelData( model, modelList( `
				* Foo. {style:default}
				* [<blockWidget></blockWidget>]
				* Bar.
			` ) );

			listStyleCommand.execute( { type: 'circle' } );

			expect( _getModelData( model ) ).to.equalMarkup( modelList( `
				* Foo. {style:circle}
				* [<blockWidget></blockWidget>]
				* Bar.
			` ) );
		} );

		it( 'should set the `listStyle` attribute for all the same list items and ignores "parent" list (selection in nested list)', () => {
			_setModelData( model, modelList( `
				* 1. {style:square}
				* 2.
				  * 2.1.[] {style:square}
				  * 2.2.
				* 3.
				  * 3.1. {style:square}
			` ) );

			listStyleCommand.execute( { type: 'disc' } );

			expect( _getModelData( model ) ).to.equalMarkup( modelList( `
				* 1. {style:square}
				* 2.
				  * 2.1.[] {style:disc}
				  * 2.2.
				* 3.
				  * 3.1. {style:square}
			` ) );
		} );

		it( 'should stop searching for the list items when spotted non-listItem element', () => {
			_setModelData( model, modelList( `
				Foo.
				* 1.[] {style:default}
				* 2.
				* 3.
			` ) );

			listStyleCommand.execute( { type: 'circle' } );

			expect( _getModelData( model ) ).to.equalMarkup( modelList( `
				Foo.
				* 1.[] {style:circle}
				* 2.
				* 3.
			` ) );
		} );

		it( 'should stop searching for the list items when spotted listItem with different listType attribute', () => {
			_setModelData( model, modelList( `
				Foo.
				* 1.[] {style:default}
				* 2.
				# 1. {style:default}
			` ) );

			listStyleCommand.execute( { type: 'circle' } );

			expect( _getModelData( model ) ).to.equalMarkup( modelList( `
				Foo.
				* 1.[] {style:circle}
				* 2.
				# 1. {style:default}
			` ) );
		} );

		it( 'should set the `listStyle` attribute for selected items (non-collapsed selection)', () => {
			_setModelData( model, modelList( `
				* 1. {style:disc}
				* 2a.
				  [2b.
				  2c.
				* 3a].
				  3b.
				* 4.
			` ) );

			listStyleCommand.execute( { type: 'circle' } );

			expect( _getModelData( model ) ).to.equalMarkup( modelList( `
				* 1. {style:circle}
				* 2a.
				  [2b.
				  2c.
				* 3a].
				  3b.
				* 4.
			` ) );
		} );

		it( 'should set the `listStyle` attribute for all blocks in the list item (non-collapsed selection)', () => {
			_setModelData( model, modelList( `
				* 1. {style:disc}
				* [2.
				* 3].
				* 4.
			` ) );

			listStyleCommand.execute( { type: 'circle' } );

			expect( _getModelData( model ) ).to.equalMarkup( modelList( `
				* 1. {style:circle}
				* [2.
				* 3].
				* 4.
			` ) );
		} );

		it( 'should set the `listStyle` attribute for selected items including nested lists (non-collapsed selection)', () => {
			// [x] = items that should be updated.
			// All list items that belong to the same lists that selected items should be updated.
			// "2." is the most outer list (listIndent=0)
			// "2.1" a child list of the "2." element (listIndent=1)
			// "2.1.1" a child list of the "2.1" element (listIndent=2)
			//
			// [x] ■ 1.
			// [x] ■ [2.
			// [x]     ○ 2.1.
			// [X]         ▶ 2.1.1.]
			// [x]         ▶ 2.1.2.
			// [x]     ○ 2.2.
			// [x] ■ 3.
			// [ ]     ○ 3.1.
			// [ ]         ▶ 3.1.1.
			//
			// "3.1" is not selected and this list should not be updated.
			_setModelData( model, modelList( `
				* 1. {style:square}
				* [2.
				  * 2.1. {style:circle}
				    * 2.1.1.] {style:square}
					* 2.1.2.
				  * 2.2.
				* 3.
				  * 3.1. {style:square}
				    * 3.1.1. {style:square}
			` ) );

			listStyleCommand.execute( { type: 'disc' } );

			expect( _getModelData( model ) ).to.equalMarkup( modelList( `
				* 1. {style:disc}
				* [2.
				  * 2.1. {style:disc}
				    * 2.1.1.] {style:disc}
				    * 2.1.2.
				  * 2.2.
				* 3.
				  * 3.1. {style:square}
				    * 3.1.1. {style:square}
			` ) );
		} );

		it( 'should use default type if not specified (no options passed)', () => {
			_setModelData( model, modelList( [ '* 1.[] {style:circle}' ] ) );

			listStyleCommand.execute();

			expect( _getModelData( model ) ).to.equalMarkup( modelList( [ '* 1.[] {style:default}' ] ) );
		} );

		it( 'should use default type if not specified (passed an empty object)', () => {
			_setModelData( model, modelList( [ '* 1.[] {style:circle}' ] ) );

			listStyleCommand.execute( {} );

			expect( _getModelData( model ) ).to.equalMarkup( modelList( [ '* 1.[] {style:default}' ] ) );
		} );

		it( 'should use default type if not specified (passed null as value)', () => {
			_setModelData( model, modelList( [ '* 1.[] {style:circle}' ] ) );

			listStyleCommand.execute( { type: null } );

			expect( _getModelData( model ) ).to.equalMarkup( modelList( [ '* 1.[] {style:default}' ] ) );
		} );

		it( 'should create a list if no listItem found in the selection (circle, non-collapsed selection)', () => {
			_setModelData( model, modelList( `
				[Foo.
				Bar.]
			` ) );

			const listCommand = editor.commands.get( 'bulletedList' );
			const spy = sinon.spy( listCommand, 'execute' );
			const createdBatches = new Set();

			model.on( 'applyOperation', ( evt, args ) => {
				const operation = args[ 0 ];

				createdBatches.add( operation.batch );
			} );

			listStyleCommand.execute( { type: 'circle' } );

			expect( _getModelData( model ) ).to.equalMarkup( modelList( `
				* [Foo. {style:circle} {id:a00}
				* Bar.] {id:a01}
			` ) );

			expect( spy.called ).to.be.true;
			expect( createdBatches.size ).to.equal( 1 );

			spy.restore();
		} );

		it( 'should create a list if no listItem found in the selection (square, collapsed selection)', () => {
			_setModelData( model, modelList( `
				Fo[]o.
				Bar.
			` ) );

			const listCommand = editor.commands.get( 'bulletedList' );
			const spy = sinon.spy( listCommand, 'execute' );
			const createdBatches = new Set();

			model.on( 'applyOperation', ( evt, args ) => {
				const operation = args[ 0 ];

				createdBatches.add( operation.batch );
			} );

			listStyleCommand.execute( { type: 'circle' } );

			expect( _getModelData( model ) ).to.equalMarkup( modelList( `
				* Fo[]o. {id:a00} {style:circle}
				Bar.
			` ) );

			expect( spy.called ).to.be.true;
			expect( createdBatches.size ).to.equal( 1 );

			spy.restore();
		} );

		it( 'should create a list if no listItem found in the selection (decimal, non-collapsed selection)', () => {
			_setModelData( model, modelList( `
				[Foo.
				Bar.]
			` ) );

			const listCommand = editor.commands.get( 'numberedList' );
			const spy = sinon.spy( listCommand, 'execute' );
			const createdBatches = new Set();

			model.on( 'applyOperation', ( evt, args ) => {
				const operation = args[ 0 ];

				createdBatches.add( operation.batch );
			} );

			listStyleCommand.execute( { type: 'decimal' } );

			expect( _getModelData( model ) ).to.equalMarkup( modelList( `
				# [Foo. {id:a00} {style:decimal}
				# Bar.] {id:a01}
			` ) );

			expect( spy.called ).to.be.true;
			expect( createdBatches.size ).to.equal( 1 );

			spy.restore();
		} );

		it( 'should create a list if no listItem found in the selection (upper-roman, collapsed selection)', () => {
			_setModelData( model, modelList( `
				Fo[]o.
				Bar.
			` ) );

			const listCommand = editor.commands.get( 'numberedList' );
			const spy = sinon.spy( listCommand, 'execute' );
			const createdBatches = new Set();

			model.on( 'applyOperation', ( evt, args ) => {
				const operation = args[ 0 ];

				createdBatches.add( operation.batch );
			} );

			listStyleCommand.execute( { type: 'upper-roman' } );

			expect( _getModelData( model ) ).to.equalMarkup( modelList( `
				# Fo[]o. {id:a00} {style:upper-roman}
				Bar.
			` ) );

			expect( spy.called ).to.be.true;
			expect( createdBatches.size ).to.equal( 1 );

			spy.restore();
		} );

		it( 'should not update anything if no listItem found in the selection (default style)', () => {
			_setModelData( model, modelList( `
				Foo.[]
			` ) );

			listStyleCommand.execute( { type: 'default' } );

			expect( _getModelData( model ) ).to.equalMarkup( modelList( `
				Foo.[]
			` ) );
		} );

		it( 'should not update anything if no listItem found in the selection (style no specified)', () => {
			_setModelData( model, modelList( `
				Foo.[]
			` ) );

			listStyleCommand.execute();

			expect( _getModelData( model ) ).to.equalMarkup( modelList( `
				Foo.[]
			` ) );
		} );
	} );

	describe( 'isStyleTypeSupported()', () => {
		it( 'should return `true` for all styles provided in constructor', () => {
			const editor = new Editor();
			const listStyleCommand = new ListStyleCommand( editor, 'default', [
				'circle',
				'decimal',
				'upper-roman'
			] );

			expect( listStyleCommand.isStyleTypeSupported( 'circle' ) ).to.be.true;
			expect( listStyleCommand.isStyleTypeSupported( 'decimal' ) ).to.be.true;
			expect( listStyleCommand.isStyleTypeSupported( 'upper-roman' ) ).to.be.true;
		} );

		it( 'should return `false` for styles not provided in constructor', () => {
			const editor = new Editor();
			const listStyleCommand = new ListStyleCommand( editor, 'default', [
				'circle',
				'decimal',
				'upper-roman'
			] );

			expect( listStyleCommand.isStyleTypeSupported( 'disc' ) ).to.be.false;
			expect( listStyleCommand.isStyleTypeSupported( 'square' ) ).to.be.false;
			expect( listStyleCommand.isStyleTypeSupported( 'decimal-leading-zero' ) ).to.be.false;
			expect( listStyleCommand.isStyleTypeSupported( 'lower-roman' ) ).to.be.false;
			expect( listStyleCommand.isStyleTypeSupported( 'lower-alpha' ) ).to.be.false;
			expect( listStyleCommand.isStyleTypeSupported( 'upper-alpha' ) ).to.be.false;
			expect( listStyleCommand.isStyleTypeSupported( 'lower-latin' ) ).to.be.false;
			expect( listStyleCommand.isStyleTypeSupported( 'upper-latin' ) ).to.be.false;
		} );

		it( 'should return `true` for all the styles by default', () => {
			const editor = new Editor();
			const listStyleCommand = new ListStyleCommand( editor, 'default' );

			expect( listStyleCommand.isStyleTypeSupported( 'disc' ) ).to.be.true;
			expect( listStyleCommand.isStyleTypeSupported( 'circle' ) ).to.be.true;
			expect( listStyleCommand.isStyleTypeSupported( 'square' ) ).to.be.true;
			expect( listStyleCommand.isStyleTypeSupported( 'decimal' ) ).to.be.true;
			expect( listStyleCommand.isStyleTypeSupported( 'decimal-leading-zero' ) ).to.be.true;
			expect( listStyleCommand.isStyleTypeSupported( 'lower-roman' ) ).to.be.true;
			expect( listStyleCommand.isStyleTypeSupported( 'upper-roman' ) ).to.be.true;
			expect( listStyleCommand.isStyleTypeSupported( 'lower-alpha' ) ).to.be.true;
			expect( listStyleCommand.isStyleTypeSupported( 'upper-alpha' ) ).to.be.true;
			expect( listStyleCommand.isStyleTypeSupported( 'lower-latin' ) ).to.be.true;
			expect( listStyleCommand.isStyleTypeSupported( 'upper-latin' ) ).to.be.true;
		} );
	} );
} );
