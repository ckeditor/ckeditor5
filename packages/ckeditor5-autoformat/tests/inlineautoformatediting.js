/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Autoformat } from '../src/autoformat.js';
import { inlineAutoformatEditing } from '../src/inlineautoformatediting.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { VirtualTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { Enter } from '@ckeditor/ckeditor5-enter';
import { _setModelData, _getModelData } from '@ckeditor/ckeditor5-engine';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe( 'inlineAutoformatEditing', () => {
	let editor, model, doc, plugin, formatSpy;

	beforeEach( () => {
		formatSpy = vi.fn().mockName( 'formatCallback' );

		return VirtualTestEditor
			.create( {
				plugins: [ Enter, Paragraph, Autoformat ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				doc = model.document;
				plugin = editor.plugins.get( 'Autoformat' );

				model.schema.extend( '$text', { allowAttributes: 'testAttribute' } );
			} );
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	describe( 'regExp', () => {
		it( 'should not call the formatCallback if there are less than 3 capture groups', () => {
			inlineAutoformatEditing( editor, plugin, /(\*)(.+?)\*/g, formatSpy );

			_setModelData( model, '<paragraph>*foobar[]</paragraph>' );
			model.change( writer => {
				writer.insertText( '*', doc.selection.getFirstPosition() );
			} );

			expect( formatSpy ).not.toHaveBeenCalled();
		} );

		it( 'should call the formatCallback when the pattern is matched', () => {
			inlineAutoformatEditing( editor, plugin, /(\*)(.+?)(\*)/g, formatSpy );

			_setModelData( model, '<paragraph>*foobar[]</paragraph>' );
			model.change( writer => {
				writer.insertText( '*', doc.selection.getFirstPosition() );
			} );

			expect( formatSpy ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should not call the formatCallback if the selection is not collapsed', () => {
			inlineAutoformatEditing( editor, plugin, /(\*)(.+?)\*/g, formatSpy );

			_setModelData( model, '<paragraph>*foob[ar]</paragraph>' );
			model.change( writer => {
				writer.insertText( '*', doc.selection.getFirstPosition() );
			} );

			expect( formatSpy ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'callback', () => {
		it( 'should stop when there are no format ranges returned from testCallback', () => {
			const testStub = vi.fn().mockReturnValue( {
				format: [ [] ],
				remove: []
			} );

			inlineAutoformatEditing( editor, plugin, testStub, formatSpy );

			_setModelData( model, '<paragraph>*[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( formatSpy ).not.toHaveBeenCalled();
		} );

		it( 'should stop when there are no remove ranges returned from testCallback', () => {
			const testStub = vi.fn().mockReturnValue( {
				format: [],
				remove: [ [] ]
			} );

			inlineAutoformatEditing( editor, plugin, testStub, formatSpy );

			_setModelData( model, '<paragraph>*[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( formatSpy ).not.toHaveBeenCalled();
		} );

		it( 'should stop early when there is no text', () => {
			const testStub = vi.fn().mockReturnValue( {
				format: [],
				remove: [ [] ]
			} );

			inlineAutoformatEditing( editor, plugin, testStub, formatSpy );

			_setModelData( model, '<paragraph>[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( formatSpy ).not.toHaveBeenCalled();
		} );

		it( 'should not run the formatCallback when the pattern is matched but the plugin is disabled', () => {
			inlineAutoformatEditing( editor, plugin, /(\*)(.+?)(\*)/g, formatSpy );

			plugin.isEnabled = false;

			_setModelData( model, '<paragraph>*foobar[]</paragraph>' );
			model.change( writer => {
				writer.insertText( '*', doc.selection.getFirstPosition() );
			} );

			expect( formatSpy ).not.toHaveBeenCalled();
		} );

		it( 'should not autoformat if callback returned false', () => {
			_setModelData( model, '<paragraph>Foobar[]</paragraph>' );

			const p = model.document.getRoot().getChild( 0 );

			const testCallback = () => ( {
				format: [ model.createRange( model.createPositionAt( p, 0 ), model.createPositionAt( p, 3 ) ) ],
				remove: [ model.createRange( model.createPositionAt( p, 0 ), model.createPositionAt( p, 3 ) ) ]
			} );

			const formatCallback = () => false;

			inlineAutoformatEditing( editor, plugin, testCallback, formatCallback );

			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( _getModelData( model ) ).toBe( '<paragraph>Foobar []</paragraph>' );
		} );
	} );

	it( 'should ignore non-local batches', () => {
		inlineAutoformatEditing( editor, plugin, /(\*)(.+?)(\*)/g, formatSpy );

		_setModelData( model, '<paragraph>*foobar[]</paragraph>' );
		model.enqueueChange( { isLocal: false }, writer => {
			writer.insertText( '*', doc.selection.getFirstPosition() );
		} );

		expect( formatSpy ).not.toHaveBeenCalled();
		expect( _getModelData( model ) ).toBe( '<paragraph>*foobar*[]</paragraph>' );
	} );

	it( 'should ignore undo batches', () => {
		inlineAutoformatEditing( editor, plugin, /(\*)(.+?)(\*)/g, formatSpy );

		_setModelData( model, '<paragraph>*foobar[]</paragraph>' );
		model.enqueueChange( { isUndo: true }, writer => {
			writer.insertText( '*', doc.selection.getFirstPosition() );
		} );

		expect( formatSpy ).not.toHaveBeenCalled();
		expect( _getModelData( model ) ).toBe( '<paragraph>*foobar*[]</paragraph>' );
	} );
} );
