/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import HorizontalRuleEditing from '../src/horizontalruleediting';

describe( 'HorizontalRuleCommand', () => {
	let editor, model, editorElement, command;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Paragraph, HorizontalRuleEditing ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				command = editor.commands.get( 'horizontalRule' );
			} );
	} );

	afterEach( () => {
		return editor.destroy()
			.then( () => {
				editorElement.remove();
			} );
	} );

	describe( 'isEnabled', () => {
		it( 'should be true when the selection directly in the root', () => {
			model.enqueueChange( 'transparent', () => {
				setModelData( model, '[]' );

				command.refresh();
				expect( command.isEnabled ).to.be.true;
			} );
		} );

		it( 'should be true when the selection is in empty block', () => {
			setModelData( model, '<paragraph>[]</paragraph>' );

			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be true when the selection directly in a paragraph', () => {
			setModelData( model, '<paragraph>foo[]</paragraph>' );
			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be true when the selection directly in a block', () => {
			model.schema.register( 'block', { inheritAllFrom: '$block' } );
			model.schema.extend( '$text', { allowIn: 'block' } );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'block', view: 'block' } );

			setModelData( model, '<block>foo[]</block>' );
			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be false when the selection is on other horizontal rule element', () => {
			setModelData( model, '[<horizontalRule></horizontalRule>]' );
			expect( command.isEnabled ).to.be.false;
		} );

		it( 'should be false when the selection is on other object', () => {
			model.schema.register( 'object', { isObject: true, allowIn: '$root' } );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'object', view: 'object' } );
			setModelData( model, '[<object></object>]' );

			expect( command.isEnabled ).to.be.false;
		} );

		it( 'should be true when the selection is inside block element inside isLimit element which allows horizontal rule', () => {
			model.schema.register( 'table', { allowWhere: '$block', isLimit: true, isObject: true, isBlock: true } );
			model.schema.register( 'tableRow', { allowIn: 'table', isLimit: true } );
			model.schema.register( 'tableCell', { allowIn: 'tableRow', isLimit: true } );
			model.schema.extend( '$block', { allowIn: 'tableCell' } );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'table', view: 'table' } );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'tableRow', view: 'tableRow' } );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'tableCell', view: 'tableCell' } );

			setModelData( model, '<table><tableRow><tableCell><paragraph>foo[]</paragraph></tableCell></tableRow></table>' );
		} );

		it( 'should be false when schema disallows horizontal rule', () => {
			model.schema.register( 'block', { inheritAllFrom: '$block' } );
			model.schema.extend( 'paragraph', { allowIn: 'block' } );
			// Block horizontal rule in block.
			model.schema.addChildCheck( ( context, childDefinition ) => {
				if ( childDefinition.name === 'horizontalRule' && context.last.name === 'block' ) {
					return false;
				}
			} );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'block', view: 'block' } );

			setModelData( model, '<block><paragraph>[]</paragraph></block>' );

			expect( command.isEnabled ).to.be.false;
		} );
	} );

	describe( 'execute()', () => {
		it( 'should create a single batch', () => {
			setModelData( model, '<paragraph>foo[]</paragraph>' );

			const spy = sinon.spy();

			model.document.on( 'change', spy );

			command.execute();

			sinon.assert.calledOnce( spy );
		} );

		it( 'should insert a horizontal rule in an empty root and select it', () => {
			setModelData( model, '[]' );

			command.execute();

			expect( getModelData( model ) ).to.equal( '[<horizontalRule></horizontalRule>]' );
		} );

		it( 'should split an element where selection is placed and insert a horizontal rule (non-collapsed selection)', () => {
			setModelData( model, '<paragraph>f[o]o</paragraph>' );

			command.execute();

			expect( getModelData( model ) ).to.equal(
				'<paragraph>f</paragraph>[<horizontalRule></horizontalRule>]<paragraph>o</paragraph>'
			);
		} );

		it( 'should split an element where selection is placed and insert a horizontal rule (collapsed selection)', () => {
			setModelData( model, '<paragraph>fo[]o</paragraph>' );

			command.execute();

			expect( getModelData( model ) ).to.equal(
				'<paragraph>fo</paragraph>[<horizontalRule></horizontalRule>]<paragraph>o</paragraph>'
			);
		} );
	} );
} );
