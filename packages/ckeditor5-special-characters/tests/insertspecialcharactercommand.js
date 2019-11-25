/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import SpecialCharacters from '../src/specialcharacters';

describe( 'InsertSpecialCharacterCommand', () => {
	let editor, model, editorElement, command;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Paragraph, SpecialCharacters ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				command = editor.commands.get( 'insertSpecialCharacter' );

				editor.plugins.get( 'SpecialCharacters' ).addItems( 'Arrows', [
					{ title: 'arrow left', character: '←' },
					{ title: 'arrow right', character: '→' }
				] );
			} );
	} );

	afterEach( () => {
		return editor.destroy()
			.then( () => {
				editorElement.remove();
			} );
	} );

	describe( 'isEnabled', () => {
		it( 'should be bound to InputCommand#isEnables', () => {
			const inputCommand = editor.commands.get( 'input' );

			inputCommand.isEnabled = true;
			expect( command.isEnabled ).to.equal( true );

			inputCommand.isEnabled = false;
			expect( command.isEnabled ).to.equal( false );
		} );
	} );

	describe( 'execute()', () => {
		it( 'should create a single batch', () => {
			setModelData( model, '<paragraph>foo[]</paragraph>' );

			const spy = sinon.spy();

			model.document.on( 'change', spy );

			command.execute( { item: 'arrow left' } );

			sinon.assert.calledOnce( spy );
		} );

		it( 'executes InputCommand#execute()', () => {
			const inputCommand = editor.commands.get( 'input' );

			setModelData( model, '<paragraph>foo[]</paragraph>' );

			const spy = sinon.stub( inputCommand, 'execute' );

			command.execute( { item: 'arrow left' } );

			sinon.assert.calledWithExactly( spy, { text: '←' } );

			spy.restore();
		} );

		it( 'does nothing if specified object is invalid', () => {
			setModelData( model, '<paragraph>foo[]</paragraph>' );

			const spy = sinon.spy();

			model.document.on( 'change', spy );

			command.execute( { foo: 'arrow left' } );

			sinon.assert.notCalled( spy );
		} );

		it( 'does nothing if specified item name does not exist', () => {
			setModelData( model, '<paragraph>foo[]</paragraph>' );

			const spy = sinon.spy();

			model.document.on( 'change', spy );

			command.execute( { item: 'arrow up' } );

			sinon.assert.notCalled( spy );
		} );
	} );
} );
