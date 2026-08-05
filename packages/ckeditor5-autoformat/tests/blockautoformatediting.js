/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Autoformat } from '../src/autoformat.js';
import { blockAutoformatEditing } from '../src/blockautoformatediting.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { VirtualTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { Enter } from '@ckeditor/ckeditor5-enter';
import { _setModelData, _getModelData } from '@ckeditor/ckeditor5-engine';
import { Command } from '@ckeditor/ckeditor5-core';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe( 'blockAutoformatEditing', () => {
	let editor, model, doc, plugin;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ Enter, Paragraph, Autoformat ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				doc = model.document;
				plugin = editor.plugins.get( 'Autoformat' );
			} );
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	describe( 'command name', () => {
		it( 'should run a command when the pattern is matched', () => {
			const spy = vi.fn();
			const testCommand = new TestCommand( editor, spy );

			editor.commands.add( 'testCommand', testCommand );

			blockAutoformatEditing( editor, plugin, /^[*]\s$/, 'testCommand' );

			_setModelData( model, '<paragraph>*[]</paragraph>' );

			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( spy ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should remove found pattern', () => {
			const spy = vi.fn();
			const testCommand = new TestCommand( editor, spy );

			editor.commands.add( 'testCommand', testCommand );

			blockAutoformatEditing( editor, plugin, /^[*]\s$/, 'testCommand' );

			_setModelData( model, '<paragraph>*[]</paragraph>' );

			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( spy ).toHaveBeenCalledTimes( 1 );
			expect( _getModelData( model ) ).toBe( '<paragraph>[]</paragraph>' );
		} );

		it( 'should not autoformat if command is disabled', () => {
			const spy = vi.fn();
			const testCommand = new TestCommand( editor, spy );

			testCommand.refresh = function() {
				this.isEnabled = false;
			};

			editor.commands.add( 'testCommand', testCommand );

			blockAutoformatEditing( editor, plugin, /^[*]\s$/, 'testCommand' );

			_setModelData( model, '<paragraph>*[]</paragraph>' );

			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( spy ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'callback', () => {
		it( 'should run callback when the pattern is matched', () => {
			const spy = vi.fn();
			blockAutoformatEditing( editor, plugin, /^[*]\s$/, spy );

			_setModelData( model, '<paragraph>*[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( spy ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should not call the callback when the pattern is matched but the plugin is disabled', () => {
			const callbackSpy = vi.fn().mockName( 'callback' );
			blockAutoformatEditing( editor, plugin, /^[*]\s$/, callbackSpy );

			plugin.isEnabled = false;

			_setModelData( model, '<paragraph>*[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( callbackSpy ).not.toHaveBeenCalled();
		} );

		it( 'should ignore other delta operations', () => {
			const spy = vi.fn();
			blockAutoformatEditing( editor, plugin, /^[*]\s$/, spy );

			_setModelData( model, '<paragraph>*[]</paragraph>' );
			model.change( writer => {
				writer.remove( doc.selection.getFirstRange() );
			} );

			expect( spy ).not.toHaveBeenCalled();
		} );

		it( 'should ignore a ranged selection', () => {
			model.schema.extend( '$text', { allowAttributes: 'foo' } );

			const spy = vi.fn();
			blockAutoformatEditing( editor, plugin, /^[*]\s$/, spy );

			_setModelData( model, '<paragraph>[* ]foo</paragraph>' );
			model.change( writer => {
				writer.setAttribute( 'foo', true, model.document.selection.getFirstRange() );
			} );

			expect( spy ).not.toHaveBeenCalled();
		} );

		it( 'should stop if there is no text to run matching on', () => {
			const spy = vi.fn();
			blockAutoformatEditing( editor, plugin, /^[*]\s$/, spy );

			_setModelData( model, '<paragraph>[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( spy ).not.toHaveBeenCalled();
		} );

		it( 'should not call callback when after inline element', () => {
			// Configure the schema.
			model.schema.register( 'softBreak', {
				allowWhere: '$text',
				isInline: true
			} );
			editor.conversion.for( 'upcast' )
				.elementToElement( {
					model: 'softBreak',
					view: 'br'
				} );
			editor.conversion.for( 'downcast' )
				.elementToElement( {
					model: 'softBreak',
					view: ( modelElement, { writer } ) => writer.createEmptyElement( 'br' )
				} );

			const spy = vi.fn();
			blockAutoformatEditing( editor, plugin, /^[*]\s$/, spy );

			_setModelData( model, '<paragraph>*<softBreak></softBreak>[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( spy ).not.toHaveBeenCalled();
		} );

		it( 'should not call callback when typing in the middle of block text', () => {
			const spy = vi.fn();
			blockAutoformatEditing( editor, plugin, /^[*]\s$/, spy );

			_setModelData( model, '<paragraph>* foo[]bar</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( spy ).not.toHaveBeenCalled();
		} );

		it( 'should not call callback when after inline element (typing after softBreak in a "matching" paragraph)', () => {
			// Configure the schema.
			model.schema.register( 'softBreak', {
				allowWhere: '$text',
				isInline: true
			} );
			editor.conversion.for( 'upcast' )
				.elementToElement( {
					model: 'softBreak',
					view: 'br'
				} );
			editor.conversion.for( 'downcast' )
				.elementToElement( {
					model: 'softBreak',
					view: ( modelElement, { writer } ) => writer.createEmptyElement( 'br' )
				} );

			const spy = vi.fn();
			blockAutoformatEditing( editor, plugin, /^[*]\s$/, spy );

			_setModelData( model, '<paragraph>* <softBreak></softBreak>[]</paragraph>' );

			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( spy ).not.toHaveBeenCalled();
		} );

		it( 'should stop if callback returned false', () => {
			blockAutoformatEditing( editor, plugin, /^[*]\s$/, () => false );

			_setModelData( model, '<paragraph>*[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( _getModelData( model ) ).toBe( '<paragraph>* []</paragraph>' );
		} );

		it( 'should not restore selection attributes if text is not allowed at the new selection position', () => {
			model.schema.register( 'imageBlock', {
				allowIn: '$root',
				isObject: true
			} );
			editor.conversion.elementToElement( { model: 'imageBlock', view: 'img' } );

			blockAutoformatEditing( editor, plugin, /^[*]\s$/, () => {
				editor.model.change( writer => {
					const imageBlock = writer.createElement( 'imageBlock' );

					writer.append( imageBlock, doc.getRoot() );
					writer.setSelection( imageBlock, 'on' );
				} );
			} );

			_setModelData( model, '<paragraph>*[]</paragraph>' );
			model.change( writer => {
				writer.insertText( ' ', doc.selection.getFirstPosition() );
			} );

			expect( _getModelData( model ) ).toBe( '[<imageBlock></imageBlock>]' );
		} );
	} );

	it( 'should ignore non-local batches', () => {
		const spy = vi.fn();
		blockAutoformatEditing( editor, plugin, /^[*]\s$/, spy );

		_setModelData( model, '<paragraph>*[]</paragraph>' );
		model.enqueueChange( { isLocal: false }, writer => {
			writer.insertText( ' ', doc.selection.getFirstPosition() );
		} );

		expect( spy ).not.toHaveBeenCalled();
	} );

	it( 'should ignore undo batches', () => {
		const spy = vi.fn();
		blockAutoformatEditing( editor, plugin, /^[*]\s$/, spy );

		_setModelData( model, '<paragraph>*[]</paragraph>' );
		model.enqueueChange( { isUndo: true }, writer => {
			writer.insertText( ' ', doc.selection.getFirstPosition() );
		} );

		expect( spy ).not.toHaveBeenCalled();
	} );
} );

/**
 * Dummy command to execute.
 */
class TestCommand extends Command {
	/**
	 * Creates an instance of the command.
	 *
	 * @param {module:core/editor/editor~Editor} editor Editor instance.
	 * @param {Function} onExecuteCallback execute call hook
	 */
	constructor( editor, onExecuteCallback ) {
		super( editor );

		this.onExecute = onExecuteCallback;
	}

	/**
	 * Executes command.
	 *
	 * @protected
	 */
	execute() {
		this.onExecute();
	}
}
