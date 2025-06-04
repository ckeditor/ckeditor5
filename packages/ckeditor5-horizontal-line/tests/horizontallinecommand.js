/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import HorizontalLineEditing from '../src/horizontallineediting.js';

describe( 'HorizontalLineCommand', () => {
	let editor, model, editorElement, command;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Paragraph, HorizontalLineEditing ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				command = editor.commands.get( 'horizontalLine' );
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
			model.enqueueChange( { isUndoable: false }, () => {
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

		it( 'should be true when the selection is on another horizontal line element', () => {
			setModelData( model, '[<horizontalLine></horizontalLine>]' );

			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be true when the selection is on other object', () => {
			model.schema.register( 'object', { isObject: true, allowIn: '$root' } );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'object', view: 'object' } );

			setModelData( model, '[<object></object>]' );

			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be true when the selection is inside block element inside isLimit element which allows horizontal line', () => {
			model.schema.register( 'table', { allowWhere: '$block', isLimit: true, isObject: true, isBlock: true } );
			model.schema.register( 'tableRow', { allowIn: 'table', isLimit: true } );
			model.schema.register( 'tableCell', { allowIn: 'tableRow', isLimit: true, isSelectable: true } );
			model.schema.extend( '$block', { allowIn: 'tableCell' } );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'table', view: 'table' } );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'tableRow', view: 'tableRow' } );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'tableCell', view: 'tableCell' } );

			setModelData( model, '<table><tableRow><tableCell><paragraph>foo[]</paragraph></tableCell></tableRow></table>' );
		} );

		it( 'should be false when schema disallows horizontal line', () => {
			model.schema.register( 'block', { inheritAllFrom: '$block' } );
			model.schema.extend( 'paragraph', { allowIn: 'block' } );
			// Block horizontal line in block.
			model.schema.addChildCheck( ( context, childDefinition ) => {
				if ( childDefinition.name === 'horizontalLine' && context.last.name === 'block' ) {
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

		it( 'should insert a horizontal line in an empty root and select it (a paragraph cannot be inserted)', () => {
			// Block a paragraph in $root.
			model.schema.addChildCheck( ( context, childDefinition ) => {
				if ( childDefinition.name === 'paragraph' && context.last.name === '$root' ) {
					return false;
				}
			} );

			setModelData( model, '[]' );

			command.execute();

			expect( getModelData( model ) ).to.equal( '[<horizontalLine></horizontalLine>]' );
		} );

		it( 'should split an element where selection is placed and insert a horizontal line (non-collapsed selection)', () => {
			setModelData( model, '<paragraph>f[o]o</paragraph>' );

			command.execute();

			expect( getModelData( model ) ).to.equal(
				'<paragraph>f</paragraph><horizontalLine></horizontalLine><paragraph>[]o</paragraph>'
			);
		} );

		it( 'should split an element where selection is placed and insert a horizontal line (collapsed selection)', () => {
			setModelData( model, '<paragraph>fo[]o</paragraph>' );

			command.execute();

			expect( getModelData( model ) ).to.equal(
				'<paragraph>fo</paragraph><horizontalLine></horizontalLine><paragraph>[]o</paragraph>'
			);
		} );

		it( 'should create an empty paragraph after inserting a horizontal line after a paragraph and place selection inside', () => {
			setModelData( model, '<paragraph>foo[]</paragraph>' );

			command.execute();

			expect( getModelData( model ) ).to.equal(
				'<paragraph>foo</paragraph><horizontalLine></horizontalLine><paragraph>[]</paragraph>'
			);
		} );

		it( 'should create an empty paragraph after inserting a horizontal line after a heading and place selection inside', () => {
			setModelData( model, '<heading1>foo[]</heading1>' );

			command.execute();

			expect( getModelData( model ) ).to.equal(
				'<heading1>foo</heading1><horizontalLine></horizontalLine><paragraph>[]</paragraph>'
			);
		} );

		it( 'should create an empty paragraph after inserting a horizontal line and next element must not having text', () => {
			setModelData( model, '<paragraph>foo[]</paragraph><media></media>' );

			command.execute();

			expect( getModelData( model ) ).to.equal(
				'<paragraph>foo</paragraph><horizontalLine></horizontalLine><paragraph>[]</paragraph><media></media>'
			);
		} );

		it( 'should create an empty paragraph after inserting a horizontal line in heading and next element must not having text', () => {
			setModelData( model, '<heading1>foo[]</heading1><media></media>' );

			command.execute();

			expect( getModelData( model ) ).to.equal(
				'<heading1>foo</heading1><horizontalLine></horizontalLine><paragraph>[]</paragraph><media></media>'
			);
		} );

		it( 'should not create an empty paragraph if a horizontal line split an element with text', () => {
			setModelData( model, '<heading1>foo[]bar</heading1>' );

			command.execute();

			expect( getModelData( model ) ).to.equal(
				'<heading1>foo</heading1><horizontalLine></horizontalLine><heading1>[]bar</heading1>'
			);
		} );

		it( 'should replace an empty paragraph with a horizontal line and insert another paragraph next to', () => {
			setModelData( model, '<paragraph>[]</paragraph>' );

			command.execute();

			expect( getModelData( model ) ).to.equal(
				'<horizontalLine></horizontalLine><paragraph>[]</paragraph>'
			);
		} );

		it( 'should replace an empty paragraph with a horizontal line and move the selection to next paragraph', () => {
			setModelData( model, '<paragraph>foo</paragraph><paragraph>[]</paragraph><paragraph>bar</paragraph>' );

			command.execute();

			expect( getModelData( model ) ).to.equal(
				'<paragraph>foo</paragraph><horizontalLine></horizontalLine><paragraph>[]bar</paragraph>'
			);
		} );

		it( 'should replace an empty paragraph with a horizontal line and move the selection to next element that has text', () => {
			setModelData( model, '<paragraph>foo</paragraph><paragraph>[]</paragraph><heading1>bar</heading1>' );

			command.execute();

			expect( getModelData( model ) ).to.equal(
				'<paragraph>foo</paragraph><horizontalLine></horizontalLine><heading1>[]bar</heading1>'
			);
		} );

		it( 'should replace an empty block element with a horizontal line and insert a paragraph next to', () => {
			setModelData( model, '<heading1>[]</heading1>' );

			command.execute();

			expect( getModelData( model ) ).to.equal(
				'<horizontalLine></horizontalLine><paragraph>[]</paragraph>'
			);
		} );

		it( 'should move the selection to next element if it allows having text (paragraph + heading)', () => {
			setModelData( model, '<paragraph>foo[]</paragraph><heading1>bar</heading1>' );

			command.execute();

			expect( getModelData( model ) ).to.equal(
				'<paragraph>foo</paragraph><horizontalLine></horizontalLine><heading1>[]bar</heading1>'
			);
		} );

		it( 'should move the selection to next element if it allows having text (heading + paragraph)', () => {
			setModelData( model, '<heading1>foo[]</heading1><paragraph>bar</paragraph>' );

			command.execute();

			expect( getModelData( model ) ).to.equal(
				'<heading1>foo</heading1><horizontalLine></horizontalLine><paragraph>[]bar</paragraph>'
			);
		} );

		it( 'should replace an existing selected object with a horizontal line', () => {
			model.schema.register( 'object', { isObject: true, allowIn: '$root' } );
			editor.conversion.for( 'downcast' ).elementToElement( { model: 'object', view: 'object' } );

			setModelData( model, '<paragraph>foo</paragraph>[<object></object>]<paragraph>bar</paragraph>' );

			command.execute();

			expect( getModelData( model ) ).to.equal(
				'<paragraph>foo</paragraph><horizontalLine></horizontalLine><paragraph>[]bar</paragraph>'
			);
		} );

		it( 'should replace an existing horizontal line with another horizontal line', () => {
			setModelData( model, '<paragraph>foo</paragraph>[<horizontalLine></horizontalLine>]<paragraph>bar</paragraph>' );

			command.execute();

			expect( getModelData( model ) ).to.equal(
				'<paragraph>foo</paragraph><horizontalLine></horizontalLine><paragraph>[]bar</paragraph>'
			);
		} );

		describe( 'inheriting attributes', () => {
			beforeEach( () => {
				const attributes = [ 'smart', 'pretty' ];

				model.schema.extend( '$block', {
					allowAttributes: attributes
				} );

				model.schema.extend( '$blockObject', {
					allowAttributes: attributes
				} );

				for ( const attribute of attributes ) {
					model.schema.setAttributeProperties( attribute, {
						copyOnReplace: true
					} );
				}
			} );

			it( 'should copy $block attributes on a horizontal line element when inserting it in $block', () => {
				setModelData( model, '<paragraph pretty="true" smart="true">[]</paragraph>' );

				command.execute();

				expect( getModelData( model ) ).to.equalMarkup(
					'<horizontalLine pretty="true" smart="true"></horizontalLine>' +
					'<paragraph pretty="true" smart="true">[]</paragraph>'
				);
			} );

			it( 'should copy attributes from first selected element', () => {
				setModelData( model, '<paragraph pretty="true">[foo</paragraph><paragraph smart="true">bar]</paragraph>' );

				command.execute();

				expect( getModelData( model ) ).to.equalMarkup(
					'<horizontalLine pretty="true"></horizontalLine>' +
					'<paragraph pretty="true">[]</paragraph>'
				);
			} );

			it( 'should only copy $block attributes marked with copyOnReplace', () => {
				setModelData( model, '<paragraph pretty="true" smart="true" nice="true">[]</paragraph>' );

				command.execute();

				expect( getModelData( model ) ).to.equalMarkup(
					'<horizontalLine pretty="true" smart="true"></horizontalLine>' +
					'<paragraph pretty="true" smart="true">[]</paragraph>'
				);
			} );

			it( 'should copy attributes from object when it is selected during insertion', () => {
				model.schema.register( 'object', { isObject: true, inheritAllFrom: '$blockObject' } );
				editor.conversion.for( 'downcast' ).elementToElement( { model: 'object', view: 'object' } );

				setModelData( model, '[<object pretty="true" smart="true"></object>]' );

				command.execute();

				expect( getModelData( model ) ).to.equalMarkup(
					'<horizontalLine pretty="true" smart="true"></horizontalLine>' +
					'<paragraph pretty="true" smart="true">[]</paragraph>'
				);
			} );
		} );
	} );
} );
