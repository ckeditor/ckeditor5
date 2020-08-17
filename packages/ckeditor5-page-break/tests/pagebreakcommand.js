/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import PageBreakEditing from '../src/pagebreakediting';

describe( 'PageBreakCommand', () => {
	let editor, model, editorElement, command;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Paragraph, PageBreakEditing ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				command = editor.commands.get( 'pageBreak' );
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

		it( 'should be false when the selection is on other page break element', () => {
			setModelData( model, '[<pageBreak></pageBreak>]' );
			expect( command.isEnabled ).to.be.false;
		} );

		it( 'should be false when the selection is on other object', () => {
			model.schema.register( 'object', { isObject: true, allowIn: '$root' } );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'object', view: 'object' } );
			setModelData( model, '[<object></object>]' );

			expect( command.isEnabled ).to.be.false;
		} );

		it( 'should be true when the selection is inside block element inside isLimit element which allows page break', () => {
			model.schema.register( 'table', { allowWhere: '$block', isLimit: true, isObject: true, isBlock: true } );
			model.schema.register( 'tableRow', { allowIn: 'table', isLimit: true } );
			model.schema.register( 'tableCell', { allowIn: 'tableRow', isLimit: true, isSelectable: true } );
			model.schema.extend( '$block', { allowIn: 'tableCell' } );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'table', view: 'table' } );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'tableRow', view: 'tableRow' } );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'tableCell', view: 'tableCell' } );

			setModelData( model, '<table><tableRow><tableCell><paragraph>foo[]</paragraph></tableCell></tableRow></table>' );
		} );

		it( 'should be false when schema disallows page break', () => {
			model.schema.register( 'block', { inheritAllFrom: '$block' } );
			model.schema.extend( 'paragraph', { allowIn: 'block' } );
			// Block page break in block.
			model.schema.addChildCheck( ( context, childDefinition ) => {
				if ( childDefinition.name === 'pageBreak' && context.last.name === 'block' ) {
					return false;
				}
			} );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'block', view: 'block' } );

			setModelData( model, '<block><paragraph>[]</paragraph></block>' );

			expect( command.isEnabled ).to.be.false;
		} );
	} );

	describe( 'execute()', () => {
		beforeEach( () => {
			model.schema.register( 'heading1', { inheritAllFrom: '$block' } );
			editor.conversion.elementToElement( { model: 'heading1', view: 'h1' } );

			model.schema.register( 'media', { allowWhere: '$block' } );
			editor.conversion.elementToElement( { model: 'media', view: 'div' } );
		} );

		it( 'should create a single batch', () => {
			setModelData( model, '<paragraph>foo[]</paragraph>' );

			const spy = sinon.spy();

			model.document.on( 'change', spy );

			command.execute();

			sinon.assert.calledOnce( spy );
		} );

		it( 'should insert a page break in an empty root and select it (a paragraph cannot be inserted)', () => {
			// Block a paragraph in $root.
			model.schema.addChildCheck( ( context, childDefinition ) => {
				if ( childDefinition.name === 'paragraph' && context.last.name === '$root' ) {
					return false;
				}
			} );

			setModelData( model, '[]' );

			command.execute();

			expect( getModelData( model ) ).to.equal( '[<pageBreak></pageBreak>]' );
		} );

		it( 'should split an element where selection is placed and insert a page break (non-collapsed selection)', () => {
			setModelData( model, '<paragraph>f[o]o</paragraph>' );

			command.execute();

			expect( getModelData( model ) ).to.equal(
				'<paragraph>f</paragraph><pageBreak></pageBreak><paragraph>[]o</paragraph>'
			);
		} );

		it( 'should split an element where selection is placed and insert a page break (collapsed selection)', () => {
			setModelData( model, '<paragraph>fo[]o</paragraph>' );

			command.execute();

			expect( getModelData( model ) ).to.equal(
				'<paragraph>fo</paragraph><pageBreak></pageBreak><paragraph>[]o</paragraph>'
			);
		} );

		it( 'should create an empty paragraph after inserting a page break after a paragraph and place selection inside', () => {
			setModelData( model, '<paragraph>foo[]</paragraph>' );

			command.execute();

			expect( getModelData( model ) ).to.equal(
				'<paragraph>foo</paragraph><pageBreak></pageBreak><paragraph>[]</paragraph>'
			);
		} );

		it( 'should create an empty paragraph after inserting a page break after a heading and place selection inside', () => {
			setModelData( model, '<heading1>foo[]</heading1>' );

			command.execute();

			expect( getModelData( model ) ).to.equal(
				'<heading1>foo</heading1><pageBreak></pageBreak><paragraph>[]</paragraph>'
			);
		} );

		it( 'should create an empty paragraph after inserting a page break and next element must not having text', () => {
			setModelData( model, '<paragraph>foo[]</paragraph><media></media>' );

			command.execute();

			expect( getModelData( model ) ).to.equal(
				'<paragraph>foo</paragraph><pageBreak></pageBreak><paragraph>[]</paragraph><media></media>'
			);
		} );

		it( 'should create an empty paragraph after inserting a page break in heading and next element must not having text', () => {
			setModelData( model, '<heading1>foo[]</heading1><media></media>' );

			command.execute();

			expect( getModelData( model ) ).to.equal(
				'<heading1>foo</heading1><pageBreak></pageBreak><paragraph>[]</paragraph><media></media>'
			);
		} );

		it( 'should not create an empty paragraph if a page break split an element with text', () => {
			setModelData( model, '<heading1>foo[]bar</heading1>' );

			command.execute();

			expect( getModelData( model ) ).to.equal(
				'<heading1>foo</heading1><pageBreak></pageBreak><heading1>[]bar</heading1>'
			);
		} );

		it( 'should replace an empty paragraph with a page break and insert another paragraph next to', () => {
			setModelData( model, '<paragraph>[]</paragraph>' );

			command.execute();

			expect( getModelData( model ) ).to.equal(
				'<pageBreak></pageBreak><paragraph>[]</paragraph>'
			);
		} );

		it( 'should replace an empty paragraph with a page break and move the selection to next paragraph', () => {
			setModelData( model, '<paragraph>foo</paragraph><paragraph>[]</paragraph><paragraph>bar</paragraph>' );

			command.execute();

			expect( getModelData( model ) ).to.equal(
				'<paragraph>foo</paragraph><pageBreak></pageBreak><paragraph>[]bar</paragraph>'
			);
		} );

		it( 'should replace an empty paragraph with a page break and move the selection to next element that has text', () => {
			setModelData( model, '<paragraph>foo</paragraph><paragraph>[]</paragraph><heading1>bar</heading1>' );

			command.execute();

			expect( getModelData( model ) ).to.equal(
				'<paragraph>foo</paragraph><pageBreak></pageBreak><heading1>[]bar</heading1>'
			);
		} );

		it( 'should replace an empty block element with a page break and insert a paragraph next to', () => {
			setModelData( model, '<heading1>[]</heading1>' );

			command.execute();

			expect( getModelData( model ) ).to.equal(
				'<pageBreak></pageBreak><paragraph>[]</paragraph>'
			);
		} );

		it( 'should move the selection to next element if it allows having text (paragraph + heading)', () => {
			setModelData( model, '<paragraph>foo[]</paragraph><heading1>bar</heading1>' );

			command.execute();

			expect( getModelData( model ) ).to.equal(
				'<paragraph>foo</paragraph><pageBreak></pageBreak><heading1>[]bar</heading1>'
			);
		} );

		it( 'should move the selection to next element if it allows having text (heading + paragraph)', () => {
			setModelData( model, '<heading1>foo[]</heading1><paragraph>bar</paragraph>' );

			command.execute();

			expect( getModelData( model ) ).to.equal(
				'<heading1>foo</heading1><pageBreak></pageBreak><paragraph>[]bar</paragraph>'
			);
		} );
	} );
} );
