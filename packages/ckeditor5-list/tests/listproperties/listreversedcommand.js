/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Editor from '@ckeditor/ckeditor5-core/src/editor/editor.js';
import Model from '@ckeditor/ckeditor5-engine/src/model/model.js';
import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

import ListReversedCommand from '../../src/listproperties/listreversedcommand.js';
import { modelList } from '../list/_utils/utils.js';

describe( 'ListReversedCommand', () => {
	let editor, model, listReversedCommand;

	beforeEach( async () => {
		editor = new Editor();

		await editor.initPlugins();

		editor.model = new Model();

		model = editor.model;
		model.document.createRoot();

		model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );
		model.schema.register( 'blockQuote', { inheritAllFrom: '$container' } );
		model.schema.extend( '$container', { allowAttributes: [ 'listType', 'listIndent', 'listItemId', 'listReversed' ] } );
		model.schema.extend( '$block', { allowAttributes: [ 'listType', 'listIndent', 'listItemId', 'listReversed' ] } );
		model.schema.extend( '$blockObject', { allowAttributes: [ 'listType', 'listIndent', 'listItemId', 'listReversed' ] } );

		model.schema.register( 'blockWidget', {
			isObject: true,
			isBlock: true,
			allowIn: '$root',
			allowAttributesOf: '$container'
		} );

		listReversedCommand = new ListReversedCommand( editor );

		editor.commands.add( 'listReversed', listReversedCommand );
	} );

	describe( '#isEnabled', () => {
		it( 'should be false if selected a paragraph', () => {
			setData( model, modelList( [ 'Foo[]' ] ) );

			expect( listReversedCommand.isEnabled ).to.be.false;
		} );

		it( 'should be false if selection starts in a paragraph and ends in a list item', () => {
			setData( model, modelList( `
				Fo[o
				# Bar] {reversed:true}
			` ) );

			expect( listReversedCommand.isEnabled ).to.be.false;
		} );

		it( 'should be false if selection is inside a listItem (listType: bulleted)', () => {
			setData( model, modelList( [ '* Foo[]' ] ) );

			expect( listReversedCommand.isEnabled ).to.be.false;
		} );

		it( 'should be false if selection is inside a to-do list item', () => {
			setData( model, '<paragraph listType="todo" listItemId="a" listIndent="0">foo[]</paragraph>' );

			expect( listReversedCommand.isEnabled ).to.be.false;
		} );

		it( 'should be true if selection is inside a listItem (collapsed selection)', () => {
			setData( model, modelList( [ '# Foo[] {reversed:true}' ] ) );

			expect( listReversedCommand.isEnabled ).to.be.true;
		} );

		it( 'should be true if selection is inside a listItem (non-collapsed selection)', () => {
			setData( model, modelList( [ '# [Foo] {reversed:false}' ] ) );

			expect( listReversedCommand.isEnabled ).to.be.true;
		} );

		it( 'should be true attribute if selected more elements in the same list', () => {
			setData( model, modelList( `
				# [1. {reversed:true}
				# 2.]
				# 3.
			` ) );

			expect( listReversedCommand.isEnabled ).to.be.true;
		} );
	} );

	describe( '#value', () => {
		it( 'should return null if selected a paragraph', () => {
			setData( model, modelList( [ 'Foo' ] ) );

			expect( listReversedCommand.value ).to.equal( null );
		} );

		it( 'should return null if selection starts in a paragraph and ends in a list item', () => {
			setData( model, modelList( `
				Fo[o
				# Bar]
			` ) );

			expect( listReversedCommand.value ).to.equal( null );
		} );

		it( 'should return null if selection is inside a listItem (listType: bulleted)', () => {
			setData( model, modelList( [ '* Foo[]' ] ) );

			expect( listReversedCommand.value ).to.be.null;
		} );

		it( 'should return the value of `listReversed` attribute if selection is inside a list item (collapsed selection)', () => {
			setData( model, modelList( [ '# Foo[] {reversed:true}' ] ) );

			expect( listReversedCommand.value ).to.be.true;

			setData( model, modelList( [ '# Foo[] {reversed:false}' ] ) );

			expect( listReversedCommand.value ).to.be.false;
		} );

		it( 'should return the value of `listReversed` attribute if selection is inside a list item (non-collapsed selection)', () => {
			setData( model, modelList( [ '# [Foo] {reversed:false}' ] ) );

			expect( listReversedCommand.value ).to.be.false;

			setData( model, modelList( [ '# [Foo] {reversed:true}' ] ) );

			expect( listReversedCommand.value ).to.be.true;
		} );

		it( 'should return the value of `listReversed` attribute if selected more elements in the same list', () => {
			setData( model, modelList( `
				# [1. {reversed:true}
				# 2.]
				# 3.
			` ) );

			expect( listReversedCommand.value ).to.be.true;
		} );

		it( 'should return the value of `listReversed` attribute for the selection inside a nested list', () => {
			setData( model, modelList( `
				# 1. {reversed:false}
				  # 1.1.[] {reversed:true}
				# 2.
			` ) );

			expect( listReversedCommand.value ).to.be.true;
		} );

		it( 'should return the value of `listReversed` attribute from a list where the selection starts (selection over nested list)',
			() => {
				setData( model, modelList( `
					# 1. {reversed:false}
					# 1.1.[ {reversed:true}
					# 2.]
				` ) );

				expect( listReversedCommand.value ).to.be.true;
			}
		);
	} );

	describe( 'execute()', () => {
		it( 'should set the `listReversed` attribute for collapsed selection', () => {
			setData( model, modelList( [ '# 1.[] {reversed:false}' ] ) );

			listReversedCommand.execute( { reversed: true } );

			expect( getData( model ) ).to.equalMarkup( modelList( [ '# 1.[] {reversed:true}' ] ) );

			listReversedCommand.execute( { reversed: false } );

			expect( getData( model ) ).to.equalMarkup( modelList( [ '# 1.[] {reversed:false}' ] ) );
		} );

		it( 'should set the `listReversed` attribute for non-collapsed selection', () => {
			setData( model, modelList( [ '# [1.] {reversed:false}' ] ) );

			listReversedCommand.execute( { reversed: true } );

			expect( getData( model ) ).to.equalMarkup( modelList( [ '# [1.] {reversed:true}' ] ) );

			listReversedCommand.execute( { reversed: false } );

			expect( getData( model ) ).to.equalMarkup( modelList( [ '# [1.] {reversed:false}' ] ) );
		} );

		it( 'should set the `listReversed` attribute for all the same list items (collapsed selection)', () => {
			setData( model, modelList( `
				# 1. {reversed:false}
				# 2.[]
				# 3.
			` ) );

			listReversedCommand.execute( { reversed: true } );

			expect( getData( model ) ).to.equalMarkup( modelList( `
				# 1. {reversed:true}
				# 2.[]
				# 3.
			` ) );
		} );

		it( 'should set the `listReversed` attribute for all the same list items and ignores nested lists (collapsed selection)', () => {
			setData( model, modelList( `
				# 1.[] {reversed:false}
				# 2.
				  # 2.1. {reversed:false}
				  # 2.2
				# 3.
				  # 3.1. {reversed:true}
			` ) );

			listReversedCommand.execute( { reversed: true } );

			expect( getData( model ) ).to.equalMarkup( modelList( `
				# 1.[] {reversed:true}
				# 2.
				  # 2.1. {reversed:false}
				  # 2.2
				# 3.
				  # 3.1. {reversed:true}
			` ) );
		} );

		it( 'should set the `listReversed` attribute for all the same list items (block widget selected)', () => {
			setData( model, modelList( `
				# Foo. {reversed:false}
				# [<blockWidget></blockWidget>]
				# Bar.
			` ) );

			listReversedCommand.execute( { reversed: true } );

			expect( getData( model ) ).to.equalMarkup( modelList( `
				# Foo. {reversed:true}
				# [<blockWidget></blockWidget>]
				# Bar.
			` ) );
		} );

		it( 'should set the `listReversed` attribute for all the same list items and ignores "parent" list (selection in nested list)',
			() => {
				setData( model, modelList( `
					# 1. {reversed:true}
					# 2.
					  # 2.1.[] {reversed:true}
					  # 2.2.
					# 3.
					  # 3.1. {reversed:true}
				` ) );

				listReversedCommand.execute( { reversed: false } );

				expect( getData( model ) ).to.equalMarkup( modelList( `
					# 1. {reversed:true}
					# 2.
					  # 2.1.[] {reversed:false}
					  # 2.2.
					# 3.
					  # 3.1. {reversed:true}
				` ) );
			}
		);

		it( 'should stop searching for the list items when spotted non-listItem element', () => {
			setData( model, modelList( `
				Foo.
				# 1.[] {reversed:true}
				# 2.
				# 3.
			` ) );

			listReversedCommand.execute( { reversed: false } );

			expect( getData( model ) ).to.equalMarkup( modelList( `
				Foo.
				# 1.[] {reversed:false}
				# 2.
				# 3.
			` ) );
		} );

		it( 'should stop searching for the list items when spotted listItem with different `listType` attribute', () => {
			setData( model, modelList( `
				Foo.
				# 1.[] {reversed:false}
				# 2.
				* 1.
			` ) );

			listReversedCommand.execute( { reversed: true } );

			expect( getData( model ) ).to.equalMarkup( modelList( `
				Foo.
				# 1.[] {reversed:true}
				# 2.
				* 1.
			` ) );
		} );

		it( 'should set the `listReversed` attribute for selected items (non-collapsed selection)', () => {
			setData( model, modelList( `
				# 1. {reversed:false}
				# 2a.
				  [2b.
				  2c.
				# 3a].
				  3b.
				# 4.
			` ) );

			listReversedCommand.execute( { reversed: true } );

			expect( getData( model ) ).to.equalMarkup( modelList( `
				# 1. {reversed:true}
				# 2a.
				  [2b.
				  2c.
				# 3a].
				  3b.
				# 4.
			` ) );
		} );

		it( 'should set the `listReversed` attribute for all blocks in the list item (non-collapsed selection)', () => {
			setData( model, modelList( `
				# 1. {reversed:true}
				# 2.
				  [3].
				# 4.
			` ) );

			listReversedCommand.execute( { reversed: false } );

			expect( getData( model ) ).to.equalMarkup( modelList( `
				# 1. {reversed:false}
				# 2.
				  [3].
				# 4.
			` ) );
		} );

		it( 'should set the `listReversed` attribute for selected items including nested lists (non-collapsed selection)', () => {
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
				# 1. {reversed:false}
				# [2.
				  # 2.1. {reversed:false}
				    # 2.1.1.] {reversed:false}
					# 2.1.2.
				  # 2.2.
				# 3.
				  # 3.1. {reversed:false}
				    # 3.1.1. {reversed:false}
			` ) );

			listReversedCommand.execute( { reversed: true } );

			expect( getData( model ) ).to.equalMarkup( modelList( `
				# 1. {reversed:true}
				# [2.
				  # 2.1. {reversed:true}
				    # 2.1.1.] {reversed:true}
				    # 2.1.2.
				  # 2.2.
				# 3.
				  # 3.1. {reversed:false}
				    # 3.1.1. {reversed:false}
			` ) );
		} );

		it( 'should use `false` value if not specified (no options passed)', () => {
			setData( model, modelList( [ '# 1.[] {reversed:true}' ] ) );

			listReversedCommand.execute();

			expect( getData( model ) ).to.equalMarkup( modelList( [ '# 1.[] {reversed:false}' ] ) );
		} );

		it( 'should use `false` value if not specified (passed an empty object)', () => {
			setData( model, modelList( [ '# 1.[] {reversed:true}' ] ) );

			listReversedCommand.execute( {} );

			expect( getData( model ) ).to.equalMarkup( modelList( [ '# 1.[] {reversed:false}' ] ) );
		} );
	} );
} );
