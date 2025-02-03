/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Editor from '@ckeditor/ckeditor5-core/src/editor/editor.js';
import Model from '@ckeditor/ckeditor5-engine/src/model/model.js';
import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

import ListStartCommand from '../../src/listproperties/liststartcommand.js';
import { modelList } from '../list/_utils/utils.js';

describe( 'ListStartCommand', () => {
	let editor, model, listStartCommand;

	beforeEach( async () => {
		editor = new Editor();

		await editor.initPlugins();

		editor.model = new Model();

		model = editor.model;
		model.document.createRoot();

		model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );
		model.schema.register( 'blockQuote', { inheritAllFrom: '$container' } );
		model.schema.extend( '$container', { allowAttributes: [ 'listType', 'listIndent', 'listItemId', 'listStart' ] } );
		model.schema.extend( '$block', { allowAttributes: [ 'listType', 'listIndent', 'listItemId', 'listStart' ] } );
		model.schema.extend( '$blockObject', { allowAttributes: [ 'listType', 'listIndent', 'listItemId', 'listStart' ] } );

		model.schema.register( 'blockWidget', {
			isObject: true,
			isBlock: true,
			allowIn: '$root',
			allowAttributesOf: '$container'
		} );

		listStartCommand = new ListStartCommand( editor );

		editor.commands.add( 'listStart', listStartCommand );
	} );

	describe( '#isEnabled', () => {
		it( 'should be false if selected a paragraph', () => {
			setData( model, modelList( [ 'Foo[]' ] ) );

			expect( listStartCommand.isEnabled ).to.be.false;
		} );

		it( 'should be false if selection starts in a paragraph and ends in a list item', () => {
			setData( model, modelList( `
				Fo[o
				# Bar] {start:1}
			` ) );

			expect( listStartCommand.isEnabled ).to.be.false;
		} );

		it( 'should be false if selection is inside a listItem (listType: bulleted)', () => {
			setData( model, modelList( [ '* Foo[]' ] ) );

			expect( listStartCommand.isEnabled ).to.be.false;
		} );

		it( 'should be false if selection is inside a listItem (listType: todo)', () => {
			setData( model, '<paragraph listType="todo" listItemId="a" listIndent="0">foo[]</paragraph>' );

			expect( listStartCommand.isEnabled ).to.be.false;
		} );

		it( 'should be false if selection is inside a listItem (listType: customBulleted)', () => {
			setData( model, '<paragraph listType="customBulleted" listStart="1" listItemId="a" listIndent="0">foo[]</paragraph>' );

			expect( listStartCommand.isEnabled ).to.be.false;
		} );

		it( 'should be true if selection is inside a listItem (listType: customNumbered)', () => {
			setData( model, '<paragraph listType="customNumbered" listStart="1" listItemId="a" listIndent="0">foo[]</paragraph>' );

			expect( listStartCommand.isEnabled ).to.be.true;
		} );

		it( 'should be true if selection is inside a listItem (collapsed selection)', () => {
			setData( model, modelList( [ '# Foo[] {start:2}' ] ) );

			expect( listStartCommand.isEnabled ).to.be.true;
		} );

		it( 'should be true if selection is inside a listItem (non-collapsed selection)', () => {
			setData( model, modelList( [ '# [Foo] {start:1}' ] ) );

			expect( listStartCommand.isEnabled ).to.be.true;
		} );

		it( 'should be true attribute if selected more elements in the same list', () => {
			setData( model, modelList( `
				# [1. {start:3}
				# 2.]
				# 3.
			` ) );

			expect( listStartCommand.isEnabled ).to.be.true;
		} );
	} );

	describe( '#value', () => {
		it( 'should return null if selected a paragraph', () => {
			setData( model, modelList( [ 'Foo' ] ) );

			expect( listStartCommand.value ).to.equal( null );
		} );

		it( 'should return null if selection starts in a paragraph and ends in a list item', () => {
			setData( model, modelList( `
				Fo[o
				* Bar]
			` ) );

			expect( listStartCommand.value ).to.equal( null );
		} );

		it( 'should return null if selection is inside a listItem (listType: bulleted)', () => {
			setData( model, modelList( [ '* Foo[]' ] ) );

			expect( listStartCommand.value ).to.be.null;
		} );

		it( 'should return null if selection is inside a listItem (listType: customBulleted)', () => {
			setData( model, '<paragraph listType="customBulleted" listStart="1" listItemId="a" listIndent="0">foo[]</paragraph>' );

			expect( listStartCommand.value ).to.be.null;
		} );

		it( 'should return the value if selection is inside a listItem (listType: customNumbered)', () => {
			setData( model,	'<paragraph listType="customNumbered" listStart="1" listItemId="a" listIndent="0">foo[]</paragraph>' );

			expect( listStartCommand.value ).to.equal( 1 );
		} );

		it( 'should return the value of `listStart` attribute if selection is inside a list item (collapsed selection)', () => {
			setData( model, modelList( [ '# Foo[] {start:2}' ] ) );

			expect( listStartCommand.value ).to.equal( 2 );
		} );

		it( 'should return the value of `listStart` attribute if selection is inside a list item (non-collapsed selection)', () => {
			setData( model, modelList( [ '# [Foo] {start:3}' ] ) );

			expect( listStartCommand.value ).to.equal( 3 );
		} );

		it( 'should return the value of `listStart` attribute if selected more elements in the same list', () => {
			setData( model, modelList( `
				# [1. {start:3}
				# 2.]
				# 3.
			` ) );

			expect( listStartCommand.value ).to.equal( 3 );
		} );

		it( 'should return the value of `listStart` attribute for the selection inside a nested list', () => {
			setData( model, modelList( `
				# 1. {start:2}
				  # 1.1.[] {start:3}
				# 2.
			` ) );

			expect( listStartCommand.value ).to.equal( 3 );
		} );

		it( 'should return the value of `listStart` attribute from a list where the selection starts (selection over nested list)', () => {
			setData( model, modelList( `
				# 1. First {start:2}
				  # 1.1. [Second {start:3}
				# 2. Third]
			` ) );

			expect( listStartCommand.value ).to.equal( 3 );
		} );
	} );

	describe( 'execute()', () => {
		it( 'should set the `listStart` attribute for collapsed selection', () => {
			setData( model, modelList( [ '# 1.[] {start:1}' ] ) );

			listStartCommand.execute( { startIndex: 5 } );

			expect( getData( model ) ).to.equalMarkup( modelList( [ '# 1.[] {start:5}' ] ) );
		} );

		it( 'should set the `listStart` attribute for non-collapsed selection', () => {
			setData( model, modelList( [ '# [1.] {start:2}' ] ) );

			listStartCommand.execute( { startIndex: 5 } );

			expect( getData( model ) ).to.equalMarkup( modelList( [ '# [1.] {start:5}' ] ) );
		} );

		it( 'should set the `listStart` attribute for all the same list items (collapsed selection)', () => {
			setData( model, modelList( `
				# 1. {start:7}
				# 2.[]
				# 3.
			` ) );

			listStartCommand.execute( { startIndex: 5 } );

			expect( getData( model ) ).to.equalMarkup( modelList( `
				# 1. {start:5}
				# 2.[]
				# 3.
			` ) );
		} );

		it( 'should set the `listStart` attribute for all the same list items and ignores nested lists (collapsed selection)', () => {
			setData( model, modelList( `
				# 1.[] {start:2}
				# 2.
				  # 2.1. {start:3}
				  # 2.2
				# 3.
				  # 3.1. {start:4}
			` ) );

			listStartCommand.execute( { startIndex: 5 } );

			expect( getData( model ) ).to.equalMarkup( modelList( `
				# 1.[] {start:5}
				# 2.
				  # 2.1. {start:3}
				  # 2.2
				# 3.
				  # 3.1. {start:4}
			` ) );
		} );

		it( 'should set the `listStart` attribute for all the same list items (block widget selected)', () => {
			setData( model, modelList( `
				# Foo. {start:1}
				# [<blockWidget></blockWidget>]
				# Bar.
			` ) );

			listStartCommand.execute( { startIndex: 5 } );

			expect( getData( model ) ).to.equalMarkup( modelList( `
				# Foo. {start:5}
				# [<blockWidget></blockWidget>]
				# Bar.
			` ) );
		} );

		it( 'should set the `listStart` attribute for all the same list items and ignores "parent" list (selection in nested list)', () => {
			setData( model, modelList( `
				# 1. {start:1}
				# 2.
				  # 2.1.[] {start:2}
				  # 2.2.
				# 3.
				  # 3.1. {start:3}
			` ) );

			listStartCommand.execute( { startIndex: 5 } );

			expect( getData( model ) ).to.equalMarkup( modelList( `
				# 1. {start:1}
				# 2.
				  # 2.1.[] {start:5}
				  # 2.2.
				# 3.
				  # 3.1. {start:3}
			` ) );
		} );

		it( 'should stop searching for the list items when spotted non-listItem element', () => {
			setData( model, modelList( `
				Foo.
				# 1.[] {start:2}
				# 2.
				# 3.
			` ) );

			listStartCommand.execute( { startIndex: 5 } );

			expect( getData( model ) ).to.equalMarkup( modelList( `
				Foo.
				# 1.[] {start:5}
				# 2.
				# 3.
			` ) );
		} );

		it( 'should stop searching for the list items when spotted listItem with different listType attribute', () => {
			setData( model, modelList( `
				Foo.
				# 1.[] {start:2}
				# 2.
				* 1.
			` ) );

			listStartCommand.execute( { startIndex: 5 } );

			expect( getData( model ) ).to.equalMarkup( modelList( `
				Foo.
				# 1.[] {start:5}
				# 2.
				* 1.
			` ) );
		} );

		it( 'should set the `listStart` attribute for selected items (non-collapsed selection)', () => {
			setData( model, modelList( `
				# 1. {start:7}
				# 2a.
				  [2b.
				  2c.
				# 3a].
				  3b.
				# 4.
			` ) );

			listStartCommand.execute( { startIndex: 5 } );

			expect( getData( model ) ).to.equalMarkup( modelList( `
				# 1. {start:5}
				# 2a.
				  [2b.
				  2c.
				# 3a].
				  3b.
				# 4.
			` ) );
		} );

		it( 'should set the `listStart` attribute for all blocks in the list item (non-collapsed selection)', () => {
			setData( model, modelList( `
				# 1. {start:2}
				# 2.
				  [3].
				# 4.
			` ) );

			listStartCommand.execute( { startIndex: 5 } );

			expect( getData( model ) ).to.equalMarkup( modelList( `
				# 1. {start:5}
				# 2.
				  [3].
				# 4.
			` ) );
		} );

		it( 'should set the `listStart` attribute for selected items including nested lists (non-collapsed selection)', () => {
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
			setData( model, modelList( `
				# 1. {start:1}
				# [2.
				  # 2.1. {start:2}
				    # 2.1.1.] {start:3}
					# 2.1.2.
				  # 2.2.
				# 3.
				  # 3.1. {start:4}
				    # 3.1.1. {start:5}
			` ) );

			listStartCommand.execute( { startIndex: 7 } );

			expect( getData( model ) ).to.equalMarkup( modelList( `
				# 1. {start:7}
				# [2.
				  # 2.1. {start:7}
				    # 2.1.1.] {start:7}
				    # 2.1.2.
				  # 2.2.
				# 3.
				  # 3.1. {start:4}
				    # 3.1.1. {start:5}
			` ) );
		} );

		it( 'should use `1` value if not specified (no options passed)', () => {
			setData( model, modelList( [ '# 1.[] {start:2}' ] ) );

			listStartCommand.execute();

			expect( getData( model ) ).to.equalMarkup( modelList( [ '# 1.[] {start:1}' ] ) );
		} );

		it( 'should use `1` value if not specified (passed an empty object)', () => {
			setData( model, modelList( [ '# 1.[] {start:2}' ] ) );

			listStartCommand.execute( {} );

			expect( getData( model ) ).to.equalMarkup( modelList( [ '# 1.[] {start:1}' ] ) );
		} );

		it( 'should allow 0 as start index', () => {
			setData( model, modelList( [ '# 1.[] {start:1}' ] ) );

			listStartCommand.execute( { startIndex: 0 } );

			expect( getData( model ) ).to.equalMarkup( modelList( [ '# 1.[] {start:0}' ] ) );
		} );

		it( 'should set start index to 1 if attempted to set a negative number', () => {
			setData( model, modelList( [ '# 1.[] {start:1}' ] ) );

			listStartCommand.execute( { startIndex: -2 } );

			expect( getData( model ) ).to.equalMarkup( modelList( [ '# 1.[] {start:1}' ] ) );
		} );

		it( 'should set the `listStart` attribute for collapsed selection (listType: customNumbered)', () => {
			setData( model, '<paragraph listType="customNumbered" listStart="1" listItemId="a" listIndent="0">foo[]</paragraph>' );

			listStartCommand.execute( { startIndex: 6 } );

			expect( getData( model ) ).to.equalMarkup(
				'<paragraph listIndent="0" listItemId="a" listStart="6" listType="customNumbered">foo[]</paragraph>'
			);
		} );
	} );
} );
