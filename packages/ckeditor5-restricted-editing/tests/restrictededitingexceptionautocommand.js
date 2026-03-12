/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { RestrictedEditingExceptionAutoCommand, StandardEditingModeEditing } from '../src/index.js';

import { VirtualTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { _setModelData } from '@ckeditor/ckeditor5-engine';
import { testUtils } from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

import { Command } from '@ckeditor/ckeditor5-core';

describe( 'RestrictedEditingExceptionAutoCommand', () => {
	let editor, model, command, blockCommand, inlineCommand, editorExecuteSpy;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ StandardEditingModeEditing ]
			} )
			.then( newEditor => {
				editor = newEditor;

				model = editor.model;

				model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );
				model.schema.register( 'heading', { inheritAllFrom: '$block' } );
				model.schema.register( 'blockQuote', { inheritAllFrom: '$container' } );
				model.schema.register( 'blockWidget', { inheritAllFrom: '$blockObject' } );
				model.schema.register( 'inlineWidget', { inheritAllFrom: '$inlineObject' } );

				editor.conversion.for( 'downcast' ).elementToElement( { model: 'paragraph', view: 'p' } );
				editor.conversion.for( 'downcast' ).elementToElement( { model: 'heading', view: 'h' } );
				editor.conversion.for( 'downcast' ).elementToElement( { model: 'blockQuote', view: 'blockquote' } );
				editor.conversion.for( 'downcast' ).elementToElement( { model: 'blockWidget', view: 'blockWidget' } );
				editor.conversion.for( 'downcast' ).elementToElement( { model: 'inlineWidget', view: 'inlineWidget' } );

				command = editor.commands.get( 'restrictedEditingExceptionAuto' );
				inlineCommand = editor.commands.get( 'restrictedEditingException' );
				blockCommand = editor.commands.get( 'restrictedEditingExceptionBlock' );

				editorExecuteSpy = sinon.stub( editor, 'execute' );
			} );
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	it( 'is a command', () => {
		expect( RestrictedEditingExceptionAutoCommand.prototype ).to.be.instanceOf( Command );
		expect( command ).to.be.instanceOf( Command );
	} );

	describe( 'value', () => {
		it( 'is false when both commands have value = false', () => {
			inlineCommand.value = false;
			blockCommand.value = false;

			command.refresh();

			expect( command ).to.have.property( 'value', false );
		} );

		it( 'is true when inline command have value = true and block command value = false', () => {
			inlineCommand.value = true;
			blockCommand.value = false;

			command.refresh();

			expect( command ).to.have.property( 'value', true );
		} );

		it( 'is true when inline command have value = false and block command value = true', () => {
			inlineCommand.value = false;
			blockCommand.value = true;

			command.refresh();

			expect( command ).to.have.property( 'value', true );
		} );

		it( 'is true when both commands have value = true', () => {
			inlineCommand.value = true;
			blockCommand.value = true;

			command.refresh();

			expect( command ).to.have.property( 'value', true );
		} );
	} );

	describe( 'isEnabled', () => {
		it( 'is false when both commands are disabled', () => {
			inlineCommand.isEnabled = false;
			blockCommand.isEnabled = false;

			command.refresh();

			expect( command ).to.have.property( 'isEnabled', false );
		} );

		it( 'is true when inline command is enabled and block command is disabled', () => {
			inlineCommand.isEnabled = true;
			blockCommand.isEnabled = false;

			command.refresh();

			expect( command ).to.have.property( 'isEnabled', true );
		} );

		it( 'is true when inline command is disabled and block command is enabled', () => {
			inlineCommand.isEnabled = false;
			blockCommand.isEnabled = true;

			command.refresh();

			expect( command ).to.have.property( 'isEnabled', true );
		} );

		it( 'is true when both commands are enabled', () => {
			inlineCommand.isEnabled = true;
			blockCommand.isEnabled = true;

			command.refresh();

			expect( command ).to.have.property( 'isEnabled', true );
		} );
	} );

	describe( 'execute()', () => {
		it( 'should execute inline exception command if it has value = true', () => {
			inlineCommand.value = true;
			blockCommand.value = false;

			command.refresh();
			command.execute( 'restrictedEditingExceptionAuto' );

			expect( editorExecuteSpy.calledOnceWithExactly( 'restrictedEditingException' ) ).to.be.true;
		} );

		it( 'should execute block exception command if it has value = true', () => {
			inlineCommand.value = false;
			blockCommand.value = true;

			command.refresh();
			command.execute( 'restrictedEditingExceptionAuto' );

			expect( editorExecuteSpy.calledOnceWithExactly( 'restrictedEditingExceptionBlock' ) ).to.be.true;
		} );

		it( 'should execute inline exception command if only it is enabled', () => {
			inlineCommand.isEnabled = true;
			blockCommand.isEnabled = false;

			command.refresh();
			command.execute( 'restrictedEditingExceptionAuto' );

			expect( editorExecuteSpy.calledOnceWithExactly( 'restrictedEditingException' ) ).to.be.true;
		} );

		it( 'should execute block exception command if only it is enabled', () => {
			inlineCommand.isEnabled = false;
			blockCommand.isEnabled = true;

			command.refresh();
			command.execute( 'restrictedEditingExceptionAuto' );

			expect( editorExecuteSpy.calledOnceWithExactly( 'restrictedEditingExceptionBlock' ) ).to.be.true;
		} );

		it( 'should execute block exception command when selection is collapsed', () => {
			_setModelData( model, '<paragraph>foo[]bar</paragraph>' );

			command.refresh();
			command.execute( 'restrictedEditingExceptionAuto' );

			expect( editorExecuteSpy.calledOnceWithExactly( 'restrictedEditingExceptionBlock' ) ).to.be.true;
		} );

		it( 'should execute block exception command when block widget is selected', () => {
			_setModelData( model, '<paragraph>foobar</paragraph>[<blockWidget></blockWidget>]' );

			command.refresh();
			command.execute( 'restrictedEditingExceptionAuto' );

			expect( editorExecuteSpy.calledOnceWithExactly( 'restrictedEditingExceptionBlock' ) ).to.be.true;
		} );

		it( 'should execute inline exception command when inline widget is selected', () => {
			_setModelData( model, '<paragraph>foobar[<inlineWidget></inlineWidget>]</paragraph>' );

			command.refresh();
			command.execute( 'restrictedEditingExceptionAuto' );

			expect( editorExecuteSpy.calledOnceWithExactly( 'restrictedEditingException' ) ).to.be.true;
		} );

		it( 'should execute block exception command when multiple blocks are selected', () => {
			_setModelData( model, '<paragraph>f[oo</paragraph><paragraph>ba]r</paragraph>' );

			command.refresh();
			command.execute( 'restrictedEditingExceptionAuto' );

			expect( editorExecuteSpy.calledOnceWithExactly( 'restrictedEditingExceptionBlock' ) ).to.be.true;
		} );

		it( 'should execute inline exception command when text is selected', () => {
			_setModelData( model, '<paragraph>f[oo]bar</paragraph>' );

			command.refresh();
			command.execute( 'restrictedEditingExceptionAuto' );

			expect( editorExecuteSpy.calledOnceWithExactly( 'restrictedEditingException' ) ).to.be.true;
		} );
	} );
} );
