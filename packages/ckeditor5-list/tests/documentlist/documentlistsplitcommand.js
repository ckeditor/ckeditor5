/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import DocumentListSplitCommand from '../../src/documentlist/documentlistsplitcommand';
import stubUid from './_utils/uid';
import { modelList } from './_utils/utils';

import Editor from '@ckeditor/ckeditor5-core/src/editor/editor';
import Model from '@ckeditor/ckeditor5-engine/src/model/model';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'DocumentListSplitCommand', () => {
	let editor, command, model, doc;
	// let changedBlocks;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editor = new Editor();
		editor.model = new Model();

		model = editor.model;
		doc = model.document;

		doc.createRoot();

		model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );
		model.schema.register( 'blockQuote', { inheritAllFrom: '$container' } );
		model.schema.extend( '$container', { allowAttributes: [ 'listType', 'listIndent', 'listItemId' ] } );

		command = new DocumentListSplitCommand( editor );
		// command.on( 'afterExecute', ( evt, data ) => {
		// 	changedBlocks = data;
		// } );

		stubUid();
	} );

	afterEach( () => {
		command.destroy();
	} );

	describe( 'isEnabled', () => {
		// TODO
	} );

	describe( 'execute()', () => {
		it( 'should use parent batch', () => {
			setData( model, '<paragraph>[0]</paragraph>' );

			model.change( writer => {
				expect( writer.batch.operations.length, 'before' ).to.equal( 0 );

				command.execute();

				expect( writer.batch.operations.length, 'after' ).to.be.above( 0 );
			} );
		} );

		it( '0', () => {
			setData( model, modelList( [
				'* a[]'
			] ) );

			command.execute();

			expect( getData( model ) ).to.equalMarkup( modelList( [
				'* a',
				'* []'
			] ) );

			// TODO changed blocks
		} );

		it( '1.-1', () => {
			setData( model, modelList( [
				'* a[]',
				'  b',
				'  c'
			] ) );

			command.execute();

			expect( getData( model ) ).to.equalMarkup( modelList( [
				'* a',
				'  []',
				'  b',
				'  c'
			] ) );

			// TODO changed blocks
		} );

		it( '1.0', () => {
			setData( model, modelList( [
				'* []a',
				'  b',
				'  c'
			] ) );

			command.execute();

			expect( getData( model ) ).to.equalMarkup( modelList( [
				'* ',
				'* []a',
				'  b',
				'  c'
			] ) );

			// TODO changed blocks
		} );

		it( '1.1', () => {
			setData( model, modelList( [
				'* a',
				'  b',
				'  []c'
			] ) );

			command.execute();

			expect( getData( model ) ).to.equalMarkup( modelList( [
				'* a',
				'  b',
				'  ',
				'  []c'
			] ) );

			// TODO
			// expect( changedBlocks.length ).to.equal( ... );
			// expect( changedBlocks ).to.deep.equal( [
			// ] );
		} );

		it( '1.2', () => {
			setData( model, modelList( [
				'* a',
				'  b',
				'  c[]'
			] ) );

			command.execute();

			expect( getData( model ) ).to.equalMarkup( modelList( [
				'* a',
				'  b',
				'  c',
				'  []'
			] ) );

			// TODO changed blocks
		} );

		it( '3', () => {
			setData( model, modelList( [
				'* a',
				'  []',
				'  c'
			] ) );

			command.execute();

			expect( getData( model ) ).to.equalMarkup( modelList( [
				'* a',
				'  ',
				'  []',
				'  c'
			] ) );

			// TODO changed blocks
		} );

		it( '4', () => {
			setData( model, modelList( [
				'* a',
				'  []'
			] ) );

			command.execute();

			expect( getData( model ) ).to.equalMarkup( modelList( [
				'* a',
				'* []'
			] ) );

			// TODO changed blocks
		} );

		it( '5', () => {
			setData( model, modelList( [
				'* a',
				'  b',
				'  []'
			] ) );

			command.execute();

			expect( getData( model ) ).to.equalMarkup( modelList( [
				'* a',
				'  b',
				'* []'
			] ) );

			// TODO changed blocks
		} );

		it( '6', () => {
			setData( model, modelList( [
				'* a',
				'  b',
				'  []',
				'*'
			] ) );

			command.execute();

			expect( getData( model ) ).to.equalMarkup( modelList( [
				'* a',
				'  b',
				'* []',
				'*'
			] ) );

			// TODO changed blocks
		} );
	} );
} );
