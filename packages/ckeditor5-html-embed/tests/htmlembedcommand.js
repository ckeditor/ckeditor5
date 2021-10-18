/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import HtmlEmbedEditing from '../src/htmlembedediting';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

describe( 'HtmlEmbedCommand', () => {
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
				command = editor.commands.get( 'htmlEmbed' );
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

		it( 'should be true when the selection is on another raw html element', () => {
			setModelData( model, '[<rawHtml></rawHtml>]' );
			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be true when the selection is on another object', () => {
			model.schema.register( 'object', { isObject: true, allowIn: '$root' } );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'object', view: 'object' } );

			setModelData( model, '[<object></object>]' );

			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be true when the selection is inside block element inside isLimit element which allows raw html', () => {
			model.schema.register( 'table', { allowWhere: '$block', isLimit: true, isObject: true, isBlock: true } );
			model.schema.register( 'tableRow', { allowIn: 'table', isLimit: true } );
			model.schema.register( 'tableCell', { allowIn: 'tableRow', isLimit: true, isSelectable: true } );
			model.schema.extend( '$block', { allowIn: 'tableCell' } );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'table', view: 'table' } );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'tableRow', view: 'tableRow' } );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'tableCell', view: 'tableCell' } );

			setModelData( model, '<table><tableRow><tableCell><paragraph>foo[]</paragraph></tableCell></tableRow></table>' );
		} );

		it( 'should be false when schema disallows raw html', () => {
			model.schema.register( 'block', { inheritAllFrom: '$block' } );
			model.schema.extend( 'paragraph', { allowIn: 'block' } );
			// Block raw html in block.
			model.schema.addChildCheck( ( context, childDefinition ) => {
				if ( childDefinition.name === 'rawHtml' && context.last.name === 'block' ) {
					return false;
				}
			} );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'block', view: 'block' } );

			setModelData( model, '<block><paragraph>[]</paragraph></block>' );

			expect( command.isEnabled ).to.be.false;
		} );
	} );

	describe( 'value', () => {
		it( 'should reflect the content of the selected embed', () => {
			setModelData( model, '[<rawHtml value="foo"></rawHtml>]' );

			expect( command.value ).to.equal( 'foo' );
		} );

		it( 'should be empty string when the selected embed has no content', () => {
			setModelData( model, '[<rawHtml></rawHtml>]' );

			expect( command.value ).to.equal( '' );
		} );

		it( 'should be null when no embed is selected', () => {
			setModelData( model, '<paragraph>fo[o]</paragraph>' );

			expect( command.value ).to.be.null;
		} );
	} );

	describe( 'execute()', () => {
		beforeEach( () => {
			model.schema.register( 'heading1', { inheritAllFrom: '$block' } );
			editor.conversion.elementToElement( { model: 'heading1', view: 'h1' } );

			model.schema.register( 'media', { allowWhere: '$block' } );
			editor.conversion.elementToElement( { model: 'media', view: 'div' } );
		} );

		describe( 'when creating a new embed', () => {
			it( 'should create a single batch', () => {
				setModelData( model, '<paragraph>foo[]</paragraph>' );

				const spy = sinon.spy();

				model.document.on( 'change', spy );

				command.execute();

				sinon.assert.calledOnce( spy );
			} );

			it( 'should insert a raw html in an empty root and select it (a paragraph cannot be inserted)', () => {
				// Block a paragraph in $root.
				model.schema.addChildCheck( ( context, childDefinition ) => {
					if ( childDefinition.name === 'paragraph' && context.last.name === '$root' ) {
						return false;
					}
				} );

				setModelData( model, '[]' );

				command.execute();

				expect( getModelData( model ) ).to.equal( '[<rawHtml></rawHtml>]' );
			} );

			it( 'should split an element where selection is placed and insert a raw html (non-collapsed selection)', () => {
				setModelData( model, '<paragraph>f[o]o</paragraph>' );

				command.execute();

				expect( getModelData( model ) ).to.equal(
					'<paragraph>f</paragraph>[<rawHtml></rawHtml>]<paragraph>o</paragraph>'
				);
			} );

			it( 'should split an element where selection is placed and insert a raw html (collapsed selection)', () => {
				setModelData( model, '<paragraph>fo[]o</paragraph>' );

				command.execute();

				expect( getModelData( model ) ).to.equal(
					'<paragraph>fo</paragraph>[<rawHtml></rawHtml>]<paragraph>o</paragraph>'
				);
			} );

			it( 'should replace an existing selected object with a raw HTML', () => {
				model.schema.register( 'object', { isObject: true, allowIn: '$root' } );
				editor.conversion.for( 'downcast' ).elementToElement( { model: 'object', view: 'object' } );

				setModelData( model, '<paragraph>foo</paragraph>[<object></object>]<paragraph>bar</paragraph>' );

				command.execute();

				expect( getModelData( model ) ).to.equal(
					'<paragraph>foo</paragraph>[<rawHtml></rawHtml>]<paragraph>bar</paragraph>'
				);
			} );

			it( 'should replace an existing raw HTML with another raw HTML', () => {
				setModelData( model, '<paragraph>foo</paragraph>[<rawHtml></rawHtml>]<paragraph>bar</paragraph>' );

				command.execute();

				expect( getModelData( model ) ).to.equal(
					'<paragraph>foo</paragraph>[<rawHtml></rawHtml>]<paragraph>bar</paragraph>'
				);
			} );

			it( 'should replace an existing block with a raw HTML', () => {
				setModelData( model, '[<paragraph></paragraph>]' );

				command.execute();

				expect( getModelData( model ) ).to.equal( '[<rawHtml></rawHtml>]' );
			} );

			it( 'should set the initial content of the HTML emebed', () => {
				setModelData( model, '[<paragraph></paragraph>]' );

				command.execute( 'foo' );

				expect( getModelData( model ) ).to.equal( '[<rawHtml value="foo"></rawHtml>]' );
			} );
		} );

		describe( 'when the selection is on an existing embed', () => {
			it( 'should create a single batch', () => {
				setModelData( model, '[<rawHtml></rawHtml>]' );

				const spy = sinon.spy();

				model.document.on( 'change', spy );

				command.execute( '<b>Foo.</b>' );

				sinon.assert.calledOnce( spy );
			} );

			it( 'should update the `value` attribute of selected the `rawHtml` element', () => {
				setModelData( model, '[<rawHtml></rawHtml>]' );

				const initialEmbedElement = model.document.getRoot().getChild( 0 );
				command.execute( '<b>Foo.</b>' );

				expect( getModelData( model ) ).to.equal( '[<rawHtml value="<b>Foo.</b>"></rawHtml>]' );

				// It's the same element but with a new value.
				expect( model.document.getRoot().getChild( 0 ) ).to.equal( initialEmbedElement );
			} );
		} );
	} );
} );
