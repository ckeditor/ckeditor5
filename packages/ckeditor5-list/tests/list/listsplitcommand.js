/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ListSplitCommand from '../../src/list/listsplitcommand.js';
import stubUid from './_utils/uid.js';
import { modelList } from './_utils/utils.js';

import Editor from '@ckeditor/ckeditor5-core/src/editor/editor.js';
import Model from '@ckeditor/ckeditor5-engine/src/model/model.js';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

describe( 'ListSplitCommand', () => {
	let editor, command, model, doc, root;
	let changedBlocks;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editor = new Editor();
		editor.model = new Model();

		model = editor.model;
		doc = model.document;
		root = doc.createRoot();

		model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );
		model.schema.register( 'blockQuote', { inheritAllFrom: '$container' } );
		model.schema.extend( '$container', { allowAttributes: [ 'listType', 'listIndent', 'listItemId' ] } );
		model.schema.extend( '$block', { allowAttributes: [ 'listType', 'listIndent', 'listItemId' ] } );
		model.schema.extend( '$blockObject', { allowAttributes: [ 'listType', 'listIndent', 'listItemId' ] } );

		stubUid();
	} );

	afterEach( () => {
		command.destroy();
	} );

	describe( 'split before', () => {
		beforeEach( () => {
			command = new ListSplitCommand( editor, 'before' );

			command.on( 'afterExecute', ( evt, data ) => {
				changedBlocks = data;
			} );
		} );

		describe( 'isEnabled', () => {
			it( 'should be false if selection is not in a list item', () => {
				setData( model, modelList( [
					'[]'
				] ) );

				expect( command.isEnabled ).to.be.false;
			} );

			it( 'should be false if selection is not collapsed in a list item', () => {
				setData( model, modelList( [
					'* a',
					'  [b]'
				] ) );

				expect( command.isEnabled ).to.be.false;
			} );

			it( 'should be false if selection is in the first block of a list item', () => {
				setData( model, modelList( [
					'* a[]'
				] ) );

				expect( command.isEnabled ).to.be.false;
			} );

			it( 'should be true if selection is collapsed in a non-first block of a list item', () => {
				setData( model, modelList( [
					'* a',
					'  []'
				] ) );

				expect( command.isEnabled ).to.be.true;

				setData( model, modelList( [
					'* a',
					'  b[]'
				] ) );

				expect( command.isEnabled ).to.be.true;

				setData( model, modelList( [
					'* a',
					'  []b'
				] ) );

				expect( command.isEnabled ).to.be.true;

				setData( model, modelList( [
					'* a',
					'  b[]c'
				] ) );

				expect( command.isEnabled ).to.be.true;

				setData( model, modelList( [
					'* a',
					'  b[]c',
					'  d'
				] ) );

				expect( command.isEnabled ).to.be.true;
			} );
		} );

		describe( 'execute()', () => {
			it( 'should use parent batch', () => {
				setData( model, modelList( [
					'* a',
					'  []'
				] ) );

				model.change( writer => {
					expect( writer.batch.operations.length, 'before' ).to.equal( 0 );

					command.execute();

					expect( writer.batch.operations.length, 'after' ).to.be.above( 0 );
				} );
			} );

			it( 'should create another list item when the selection in an empty last block (two blocks in total)', () => {
				setData( model, modelList( [
					'* a',
					'  []'
				] ) );

				command.execute();

				expect( getData( model ) ).to.equalMarkup( modelList( [
					'* a',
					'* [] {id:a00}'
				] ) );

				expect( changedBlocks ).to.deep.equal( [
					root.getChild( 1 )
				] );
			} );

			it( 'should create another list item when the selection in an empty last block (three blocks in total)', () => {
				setData( model, modelList( [
					'* a',
					'  b',
					'  []'
				] ) );

				command.execute();

				expect( getData( model ) ).to.equalMarkup( modelList( [
					'* a',
					'  b',
					'* [] {id:a00}'
				] ) );

				expect( changedBlocks ).to.deep.equal( [
					root.getChild( 2 )
				] );
			} );

			it( 'should create another list item when the selection in an empty last block (followed by a list item)', () => {
				setData( model, modelList( [
					'* a',
					'  b',
					'  []',
					'* '
				] ) );

				command.execute();

				expect( getData( model ) ).to.equalMarkup( modelList( [
					'* a',
					'  b',
					'* [] {id:a00}',
					'* '
				] ) );

				expect( changedBlocks ).to.deep.equal( [
					root.getChild( 2 )
				] );
			} );

			it( 'should create another list item in a nested structure (last block of the list item)', () => {
				setData( model, modelList( [
					'* a',
					'  b',
					'  * c',
					'    []'
				] ) );

				command.execute();

				expect( getData( model ) ).to.equalMarkup( modelList( [
					'* a',
					'  b',
					'  * c',
					'  * [] {id:a00}'
				] ) );

				expect( changedBlocks ).to.deep.equal( [
					root.getChild( 3 )
				] );
			} );

			it( 'should create another list item in a nested structure (middle block of the list item)', () => {
				setData( model, modelList( [
					'* a',
					'  b',
					'  * c',
					'    d[]',
					'    e'
				] ) );

				command.execute();

				expect( getData( model ) ).to.equalMarkup( modelList( [
					'* a',
					'  b',
					'  * c',
					'  * d[] {id:a00}',
					'    e'
				] ) );

				expect( changedBlocks ).to.deep.equal( [
					root.getChild( 3 ),
					root.getChild( 4 )
				] );
			} );

			it( 'should create another list item in a nested structure (middle block of the list item, followed by list items)', () => {
				setData( model, modelList( [
					'* a',
					'  b',
					'  * c',
					'    d[]',
					'    e',
					'  * f',
					'* g'
				] ) );

				command.execute();

				expect( getData( model ) ).to.equalMarkup( modelList( [
					'* a',
					'  b',
					'  * c',
					'  * d[] {id:a00}',
					'    e',
					'  * f',
					'* g'
				] ) );

				expect( changedBlocks ).to.deep.equal( [
					root.getChild( 3 ),
					root.getChild( 4 )
				] );
			} );
		} );
	} );

	describe( 'split after', () => {
		beforeEach( () => {
			command = new ListSplitCommand( editor, 'after' );

			command.on( 'afterExecute', ( evt, data ) => {
				changedBlocks = data;
			} );
		} );

		describe( 'isEnabled', () => {
			it( 'should be false if selection is not in a list item', () => {
				setData( model, modelList( [
					'[]'
				] ) );

				expect( command.isEnabled ).to.be.false;
			} );

			it( 'should be false if selection is not collapsed in a list item', () => {
				setData( model, modelList( [
					'* a',
					'  [b]'
				] ) );

				expect( command.isEnabled ).to.be.false;
			} );

			it( 'should be false if selection is in the first empty block of a list item not followed by another block', () => {
				setData( model, modelList( [
					'* []'
				] ) );

				expect( command.isEnabled ).to.be.false;
			} );

			it( 'should be false if selection is in the first block of a list item not followed by another block', () => {
				setData( model, modelList( [
					'* a[]'
				] ) );

				expect( command.isEnabled ).to.be.false;
			} );

			it( 'should be true if selection is collapsed in a block followed by another block in the same list item', () => {
				setData( model, modelList( [
					'* []',
					'  a'
				] ) );

				expect( command.isEnabled ).to.be.true;

				setData( model, modelList( [
					'* a',
					'  []',
					'  b'
				] ) );

				expect( command.isEnabled ).to.be.true;

				setData( model, modelList( [
					'* a',
					'  b[]c',
					'  d'
				] ) );

				expect( command.isEnabled ).to.be.true;
			} );
		} );

		describe( 'execute()', () => {
			it( 'should use parent batch', () => {
				setData( model, modelList( [
					'* []',
					'  a'
				] ) );

				model.change( writer => {
					expect( writer.batch.operations.length, 'before' ).to.equal( 0 );

					command.execute();

					expect( writer.batch.operations.length, 'after' ).to.be.above( 0 );
				} );
			} );

			it( 'should create another list item when the selection in an empty first block followed by another', () => {
				setData( model, modelList( [
					'* []',
					'  a'
				] ) );

				command.execute();

				expect( getData( model ) ).to.equalMarkup( modelList( [
					'* []',
					'* a {id:a00}'
				] ) );

				expect( changedBlocks ).to.deep.equal( [
					root.getChild( 1 )
				] );
			} );

			it( 'should create another list item when the selection in a middle block of the list item', () => {
				setData( model, modelList( [
					'* a',
					'  []',
					'  c'
				] ) );

				command.execute();

				expect( getData( model ) ).to.equalMarkup( modelList( [
					'* a',
					'  []',
					'* c {id:a00}'
				] ) );

				expect( changedBlocks ).to.deep.equal( [
					root.getChild( 2 )
				] );
			} );

			it( 'should create another list item when the selection in a middle block of the list item (followed by another)', () => {
				setData( model, modelList( [
					'* a',
					'  []',
					'  c',
					'* '
				] ) );

				command.execute();

				expect( getData( model ) ).to.equalMarkup( modelList( [
					'* a',
					'  []',
					'* c {id:a00}',
					'* '
				] ) );

				expect( changedBlocks ).to.deep.equal( [
					root.getChild( 2 )
				] );
			} );

			it( 'should create another list item in a nested structure', () => {
				setData( model, modelList( [
					'* a',
					'  b',
					'  * a[]',
					'    b'
				] ) );

				command.execute();

				expect( getData( model ) ).to.equalMarkup( modelList( [
					'* a',
					'  b',
					'  * a[]',
					'  * b {id:a00}'
				] ) );

				expect( changedBlocks ).to.deep.equal( [
					root.getChild( 3 )
				] );
			} );

			it( 'should create another list item in a nested structure (middle block of the list item)', () => {
				setData( model, modelList( [
					'* a',
					'  b',
					'  * c',
					'    d[]',
					'    e'
				] ) );

				command.execute();

				expect( getData( model ) ).to.equalMarkup( modelList( [
					'* a',
					'  b',
					'  * c',
					'    d[]',
					'  * e {id:a00}'
				] ) );

				expect( changedBlocks ).to.deep.equal( [
					root.getChild( 4 )
				] );
			} );

			it( 'should create another list item in a nested structure (middle block of the list item, followed by list items)', () => {
				setData( model, modelList( [
					'* a',
					'  b',
					'  * c',
					'    d[]',
					'    e',
					'  * f',
					'* g'
				] ) );

				command.execute();

				expect( getData( model ) ).to.equalMarkup( modelList( [
					'* a',
					'  b',
					'  * c',
					'    d[]',
					'  * e {id:a00}',
					'  * f',
					'* g'
				] ) );

				expect( changedBlocks ).to.deep.equal( [
					root.getChild( 4 )
				] );
			} );
		} );
	} );
} );
