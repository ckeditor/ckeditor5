/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import HtmlEmbedEditing from '../src/htmlembedediting';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

describe( 'UpdateHtmlEmbedCommand', () => {
	let editor, model, editorElement, command;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ HtmlEmbedEditing, Paragraph ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				command = editor.commands.get( 'updateHtmlEmbed' );
			} );
	} );

	afterEach( () => {
		return editor.destroy()
			.then( () => {
				editorElement.remove();
			} );
	} );

	describe( 'isEnabled', () => {
		it( 'should be true when the selection contains single the `rawHtml` element', () => {
			setModelData( model, '[<rawHtml></rawHtml>]' );

			command.refresh();

			expect( command.isEnabled ).to.equal( true );
		} );

		it( 'should be false when the selection contains more than single `rawHtml` element', () => {
			setModelData( model, '[<rawHtml></rawHtml><rawHtml></rawHtml>]' );

			command.refresh();

			expect( command.isEnabled ).to.equal( false );
		} );

		it( 'should be false when the selection contains other element than the `rawHtml` element', () => {
			setModelData( model, '[<paragraph></paragraph>]' );

			command.refresh();

			expect( command.isEnabled ).to.equal( false );
		} );
	} );

	describe( 'execute()', () => {
		it( 'should create a single batch', () => {
			setModelData( model, '[<rawHtml></rawHtml>]' );

			const spy = sinon.spy();

			model.document.on( 'change', spy );

			command.execute( '<b>Foo.</b>' );

			sinon.assert.calledOnce( spy );
		} );

		it( 'should update the `value` attribute of selected the `rawHtml` element', () => {
			setModelData( model, '[<rawHtml></rawHtml>]' );
			command.execute( '<b>Foo.</b>' );

			const rawHtml = model.document.getRoot().getChild( 0 );

			expect( rawHtml.getAttribute( 'value' ) ).to.equal( '<b>Foo.</b>' );
		} );

		it( 'should update nothing if selected other element than the `rawHtml` element', () => {
			setModelData( model, '[<paragraph></paragraph>]' );
			command.execute( '<b>Foo.</b>' );

			expect( getModelData( model ) ).to.equal( '<paragraph>[]</paragraph>' );
		} );
	} );
} );
