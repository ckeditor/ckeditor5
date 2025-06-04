/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import DowncastWriter from '@ckeditor/ckeditor5-engine/src/view/downcastwriter.js';
import ViewText from '@ckeditor/ckeditor5-engine/src/view/text.js';
import ViewElement from '@ckeditor/ckeditor5-engine/src/view/element.js';
import ViewPosition from '@ckeditor/ckeditor5-engine/src/view/position.js';
import ViewEditableElement from '@ckeditor/ckeditor5-engine/src/view/editableelement.js';
import ViewDocument from '@ckeditor/ckeditor5-engine/src/view/document.js';
import {
	toWidget,
	isWidget,
	setLabel,
	getLabel,
	toWidgetEditable,
	setHighlightHandling,
	findOptimalInsertionRange,
	calculateResizeHostPercentageWidth,
	calculateResizeHostAncestorWidth,
	viewToModelPositionOutsideModelElement,
	WIDGET_CLASS_NAME
} from '../src/utils.js';
import UIElement from '@ckeditor/ckeditor5-engine/src/view/uielement.js';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import Model from '@ckeditor/ckeditor5-engine/src/model/model.js';
import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import Mapper from '@ckeditor/ckeditor5-engine/src/conversion/mapper.js';
import ModelElement from '@ckeditor/ckeditor5-engine/src/model/element.js';
import ModelText from '@ckeditor/ckeditor5-engine/src/model/text.js';

describe( 'widget utils', () => {
	let element, writer, viewDocument;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		viewDocument = new ViewDocument();
		writer = new DowncastWriter( viewDocument );

		element = writer.createContainerElement( 'div' );
		toWidget( element, writer );
	} );

	describe( 'toWidget()', () => {
		it( 'should set contenteditable to "false"', () => {
			expect( element.getAttribute( 'contenteditable' ) ).to.equal( 'false' );
		} );

		it( 'should define getFillerOffset method', () => {
			expect( element.getFillerOffset ).to.be.a( 'function' );
			expect( element.getFillerOffset() ).to.be.null;
		} );

		it( 'should add proper CSS class', () => {
			expect( element.hasClass( WIDGET_CLASS_NAME ) ).to.be.true;
		} );

		it( 'should add element\'s label if one is provided', () => {
			toWidget( element, writer, { label: 'foo bar baz label' } );

			expect( getLabel( element ) ).to.equal( 'foo bar baz label' );
		} );

		it( 'should add element\'s label if one is provided as function', () => {
			toWidget( element, writer, { label: () => 'foo bar baz label' } );

			expect( getLabel( element ) ).to.equal( 'foo bar baz label' );
		} );

		it( 'should set element\'s custom property \'widgetLabel\' as an array', () => {
			toWidget( element, writer );

			expect( element.getCustomProperty( 'widgetLabel' ) ).to.be.an( 'array' );
		} );

		it( 'should set default highlight handling methods - CSS class', () => {
			toWidget( element, writer );

			const set = element.getCustomProperty( 'addHighlight' );
			const remove = element.getCustomProperty( 'removeHighlight' );

			expect( typeof set ).to.equal( 'function' );
			expect( typeof remove ).to.equal( 'function' );

			set( element, { priority: 1, classes: 'highlight', id: 'highlight' }, writer );
			expect( element.hasClass( 'highlight' ) ).to.be.true;

			remove( element, 'highlight', writer );
			expect( element.hasClass( 'highlight' ) ).to.be.false;
		} );

		it( 'should set default highlight handling methods - CSS classes array', () => {
			toWidget( element, writer );

			const set = element.getCustomProperty( 'addHighlight' );
			const remove = element.getCustomProperty( 'removeHighlight' );

			expect( typeof set ).to.equal( 'function' );
			expect( typeof remove ).to.equal( 'function' );

			set( element, { priority: 1, classes: [ 'highlight', 'foo' ], id: 'highlight' }, writer );
			expect( element.hasClass( 'highlight' ) ).to.be.true;
			expect( element.hasClass( 'foo' ) ).to.be.true;

			remove( element, 'highlight', writer );
			expect( element.hasClass( 'highlight' ) ).to.be.false;
			expect( element.hasClass( 'foo' ) ).to.be.false;
		} );

		it( 'should set default highlight handling methods - attributes', () => {
			toWidget( element, writer );

			const set = element.getCustomProperty( 'addHighlight' );
			const remove = element.getCustomProperty( 'removeHighlight' );

			expect( typeof set ).to.equal( 'function' );
			expect( typeof remove ).to.equal( 'function' );

			set( element, { priority: 1, attributes: { foo: 'bar', abc: 'xyz' }, id: 'highlight' }, writer );
			expect( element.getAttribute( 'foo' ) ).to.equal( 'bar' );
			expect( element.getAttribute( 'abc' ) ).to.equal( 'xyz' );

			remove( element, 'highlight', writer );
			expect( element.hasAttribute( 'foo' ) ).to.be.false;
			expect( element.hasAttribute( 'abc' ) ).to.be.false;
		} );

		it( 'should add element a selection handle to widget if hasSelectionHandle=true is passed', () => {
			toWidget( element, writer, { hasSelectionHandle: true } );

			expect( element.hasClass( 'ck-widget_with-selection-handle' ) ).to.be.true;

			const selectionHandle = element.getChild( 0 );
			expect( selectionHandle ).to.be.instanceof( UIElement );

			const domSelectionHandle = selectionHandle.render( document );

			expect( domSelectionHandle.classList.contains( 'ck' ) ).to.be.true;
			expect( domSelectionHandle.classList.contains( 'ck-widget__selection-handle' ) ).to.be.true;

			const icon = domSelectionHandle.firstChild;

			expect( icon.nodeName ).to.equal( 'svg' );
			expect( icon.classList.contains( 'ck' ) ).to.be.true;
			expect( icon.classList.contains( 'ck-icon' ) ).to.be.true;
		} );

		it( 'should throw when attempting to create a widget out of anything but ContainerElement', () => {
			expect( () => {
				toWidget( writer.createRawElement( 'div' ), writer );
			}, 'raw element' ).to.throw( /^widget-to-widget-wrong-element-type/ );

			expect( () => {
				toWidget( writer.createEmptyElement( 'img' ), writer );
			}, 'empty element' ).to.throw( /^widget-to-widget-wrong-element-type/ );

			expect( () => {
				toWidget( writer.createAttributeElement( 'a' ), writer );
			}, 'attribute element' ).to.throw( /^widget-to-widget-wrong-element-type/ );

			expect( () => {
				toWidget( writer.createUIElement( 'span' ), writer );
			}, 'UI element' ).to.throw( /^widget-to-widget-wrong-element-type/ );
		} );
	} );

	describe( 'isWidget()', () => {
		it( 'should return true for widgetized elements', () => {
			expect( isWidget( element ) ).to.be.true;
		} );

		it( 'should return false for non-widgetized elements', () => {
			expect( isWidget( new ViewElement( viewDocument, 'p' ) ) ).to.be.false;
		} );

		it( 'should return false for text node', () => {
			expect( isWidget( new ViewText( viewDocument, 'p' ) ) ).to.be.false;
		} );
	} );

	describe( 'label utils', () => {
		it( 'should allow to set label for element', () => {
			toWidget( element, writer );
			setLabel( element, 'foo bar baz', writer );

			expect( getLabel( element ) ).to.equal( 'foo bar baz' );
		} );

		it( 'should return empty string for elements without label', () => {
			toWidget( element, writer );

			expect( getLabel( element ) ).to.equal( '' );
		} );

		it( 'should allow to use a function as label creator', () => {
			toWidget( element, writer );
			let caption = 'foo';
			setLabel( element, () => caption, writer );

			expect( getLabel( element ) ).to.equal( 'foo' );
			caption = 'bar';
			expect( getLabel( element ) ).to.equal( 'bar' );
		} );

		it( 'should concatenate a label from a function creator and a string', () => {
			toWidget( element, writer );
			setLabel( element, () => 'foo', writer );
			element.getCustomProperty( 'widgetLabel' ).push( 'bar' );

			expect( getLabel( element ) ).to.equal( 'foo. bar' );
		} );
	} );

	describe( 'toWidgetEditable()', () => {
		let viewDocument, element;

		beforeEach( () => {
			viewDocument = new ViewDocument();
			element = new ViewEditableElement( viewDocument, 'div' );
			toWidgetEditable( element, writer );
		} );

		it( 'should be created in context of proper document', () => {
			expect( element.document ).to.equal( viewDocument );
		} );

		it( 'should add proper class', () => {
			expect( element.hasClass( 'ck-editor__editable', 'ck-editor__nested-editable' ) ).to.be.true;
		} );

		it( 'should add proper role', () => {
			expect( element.getAttribute( 'role' ) ).to.equal( 'textbox' );
		} );

		it( 'should add proper tabindex', () => {
			expect( element.getAttribute( 'tabindex' ) ).to.equal( '-1' );
		} );

		it( 'should add role attribute by default for backward compatibility', () => {
			const element = new ViewEditableElement( viewDocument, 'div' );
			toWidgetEditable( element, writer );

			expect( element.getAttribute( 'role' ) ).to.equal( 'textbox' );
		} );

		it( 'should add role attribute when withAriaRole is set to true', () => {
			const element = new ViewEditableElement( viewDocument, 'div' );
			toWidgetEditable( element, writer, { withAriaRole: true } );

			expect( element.getAttribute( 'role' ) ).to.equal( 'textbox' );
		} );

		it( 'should not add role attribute when withAriaRole is set to false', () => {
			const element = new ViewEditableElement( viewDocument, 'div' );
			toWidgetEditable( element, writer, { withAriaRole: false } );

			expect( element.hasAttribute( 'role' ) ).to.be.false;
		} );

		it( 'should add label if it was passed through options', () => {
			toWidgetEditable( element, writer, { label: 'foo' } );
			expect( element.getAttribute( 'aria-label' ) ).to.equal( 'foo' );
		} );

		it( 'should not add label if it was not passed through options', () => {
			toWidgetEditable( element, writer );
			expect( element.hasAttribute( 'aria-label' ) ).to.be.false;
		} );

		it( 'should add proper contenteditable value when element is read-only - initialization', () => {
			const element = new ViewEditableElement( viewDocument, 'div' );
			element.isReadOnly = true;
			toWidgetEditable( element, writer );

			expect( element.getAttribute( 'contenteditable' ) ).to.equal( 'false' );
		} );

		it( 'should add proper contenteditable value when element is read-only - when changing', () => {
			element.isReadOnly = true;
			expect( element.getAttribute( 'contenteditable' ) ).to.equal( 'false' );

			element.isReadOnly = false;
			expect( element.getAttribute( 'contenteditable' ) ).to.equal( 'true' );
		} );

		it( 'should add proper class when element is focused', () => {
			element.isFocused = true;
			expect( element.hasClass( 'ck-editor__nested-editable_focused' ) ).to.be.true;

			element.isFocused = false;
			expect( element.hasClass( 'ck-editor__nested-editable_focused' ) ).to.be.false;
		} );

		it( 'should set default highlight handling methods - CSS class', () => {
			toWidgetEditable( element, writer );

			const set = element.getCustomProperty( 'addHighlight' );
			const remove = element.getCustomProperty( 'removeHighlight' );

			expect( typeof set ).to.equal( 'function' );
			expect( typeof remove ).to.equal( 'function' );

			set( element, { priority: 1, classes: 'highlight', id: 'highlight' }, writer );
			expect( element.hasClass( 'highlight' ) ).to.be.true;

			remove( element, 'highlight', writer );
			expect( element.hasClass( 'highlight' ) ).to.be.false;
		} );

		it( 'should set default highlight handling methods - CSS classes array', () => {
			toWidgetEditable( element, writer );

			const set = element.getCustomProperty( 'addHighlight' );
			const remove = element.getCustomProperty( 'removeHighlight' );

			expect( typeof set ).to.equal( 'function' );
			expect( typeof remove ).to.equal( 'function' );

			set( element, { priority: 1, classes: [ 'highlight', 'foo' ], id: 'highlight' }, writer );
			expect( element.hasClass( 'highlight' ) ).to.be.true;
			expect( element.hasClass( 'foo' ) ).to.be.true;

			remove( element, 'highlight', writer );
			expect( element.hasClass( 'highlight' ) ).to.be.false;
			expect( element.hasClass( 'foo' ) ).to.be.false;
		} );

		it( 'should set default highlight handling methods - attributes', () => {
			toWidgetEditable( element, writer );

			const set = element.getCustomProperty( 'addHighlight' );
			const remove = element.getCustomProperty( 'removeHighlight' );

			expect( typeof set ).to.equal( 'function' );
			expect( typeof remove ).to.equal( 'function' );

			set( element, { priority: 1, attributes: { foo: 'bar', abc: 'xyz' }, id: 'highlight' }, writer );
			expect( element.getAttribute( 'foo' ) ).to.equal( 'bar' );
			expect( element.getAttribute( 'abc' ) ).to.equal( 'xyz' );

			remove( element, 'highlight', writer );
			expect( element.hasAttribute( 'foo' ) ).to.be.false;
			expect( element.hasAttribute( 'abc' ) ).to.be.false;
		} );
	} );

	describe( 'setHighlightHandling()', () => {
		let element, addSpy, removeSpy, set, remove;

		describe( 'default highlight methods', () => {
			beforeEach( () => {
				element = new ViewElement( viewDocument, 'p' );

				setHighlightHandling( element, writer );
				set = element.getCustomProperty( 'addHighlight' );
				remove = element.getCustomProperty( 'removeHighlight' );
			} );

			it( 'should set classes', () => {
				const descriptor = { classes: [ 'foo', 'bar' ] };

				set( element, descriptor, writer );

				expect( element.hasClass( 'foo' ) ).to.be.true;
				expect( element.hasClass( 'bar' ) ).to.be.true;

				remove( element, descriptor.id, writer );

				expect( element.hasClass( 'foo' ) ).to.be.false;
				expect( element.hasClass( 'bar' ) ).to.be.false;
			} );

			it( 'should set attributes', () => {
				const descriptor = { attributes: { foo: 'bar', abc: 'xyz' } };

				set( element, descriptor, writer );

				expect( element.getAttribute( 'foo' ) ).to.equal( 'bar' );
				expect( element.getAttribute( 'abc' ) ).to.equal( 'xyz' );

				remove( element, descriptor.id, writer );

				expect( element.hasAttribute( 'foo' ) ).to.be.false;
				expect( element.hasAttribute( 'abc' ) ).to.be.false;
			} );
		} );

		describe( 'custom highlight method', () => {
			beforeEach( () => {
				element = new ViewElement( viewDocument, 'p' );
				addSpy = sinon.spy();
				removeSpy = sinon.spy();

				setHighlightHandling( element, writer, addSpy, removeSpy );
				set = element.getCustomProperty( 'addHighlight' );
				remove = element.getCustomProperty( 'removeHighlight' );
			} );

			it( 'should set highlight handling methods', () => {
				expect( typeof set ).to.equal( 'function' );
				expect( typeof remove ).to.equal( 'function' );
			} );

			it( 'should call highlight methods when descriptor is added and removed', () => {
				const descriptor = { priority: 10, classes: 'highlight', id: 'highlight' };

				set( element, descriptor, writer );
				remove( element, descriptor.id, writer );

				sinon.assert.calledOnce( addSpy );
				sinon.assert.calledWithExactly( addSpy, element, descriptor, writer );

				sinon.assert.calledOnce( removeSpy );
				sinon.assert.calledWithExactly( removeSpy, element, descriptor, writer );
			} );

			it( 'should call highlight methods when next descriptor is added', () => {
				const descriptor = { priority: 10, classes: 'highlight', id: 'highlight-1' };
				const secondDescriptor = { priority: 11, classes: 'highlight', id: 'highlight-2' };

				set( element, descriptor );
				set( element, secondDescriptor );

				sinon.assert.calledTwice( addSpy );
				expect( addSpy.firstCall.args[ 1 ] ).to.equal( descriptor );
				expect( addSpy.secondCall.args[ 1 ] ).to.equal( secondDescriptor );
			} );

			it( 'should not call highlight methods when descriptor with lower priority is added', () => {
				const descriptor = { priority: 10, classes: 'highlight', id: 'highlight-1' };
				const secondDescriptor = { priority: 9, classes: 'highlight', id: 'highlight-2' };

				set( element, descriptor );
				set( element, secondDescriptor );

				sinon.assert.calledOnce( addSpy );
				expect( addSpy.firstCall.args[ 1 ] ).to.equal( descriptor );
			} );

			it( 'should call highlight methods when descriptor is removed changing active descriptor', () => {
				const descriptor = { priority: 10, classes: 'highlight', id: 'highlight-1' };
				const secondDescriptor = { priority: 11, classes: 'highlight', id: 'highlight-2' };

				set( element, descriptor );
				set( element, secondDescriptor );
				remove( element, secondDescriptor.id );

				sinon.assert.calledThrice( addSpy );
				expect( addSpy.firstCall.args[ 1 ] ).to.equal( descriptor );
				expect( addSpy.secondCall.args[ 1 ] ).to.equal( secondDescriptor );
				expect( addSpy.thirdCall.args[ 1 ] ).to.equal( descriptor );

				sinon.assert.calledTwice( removeSpy );
				expect( removeSpy.firstCall.args[ 1 ] ).to.equal( descriptor );
				expect( removeSpy.secondCall.args[ 1 ] ).to.equal( secondDescriptor );
			} );

			it( 'should call highlight methods when descriptor is removed not changing active descriptor', () => {
				const descriptor = { priority: 10, classes: 'highlight', id: 'highlight-1' };
				const secondDescriptor = { priority: 9, classes: 'highlight', id: 'highlight-2' };

				set( element, descriptor );
				set( element, secondDescriptor );
				remove( element, secondDescriptor );

				sinon.assert.calledOnce( addSpy );
				expect( addSpy.firstCall.args[ 1 ] ).to.equal( descriptor );

				sinon.assert.notCalled( removeSpy );
			} );

			it( 'should call highlight methods - CSS class array', () => {
				const descriptor = { priority: 10, classes: [ 'highlight', 'a' ], id: 'highlight-1' };
				const secondDescriptor = { priority: 10, classes: [ 'highlight', 'b' ], id: 'highlight-2' };

				set( element, descriptor );
				set( element, secondDescriptor );

				sinon.assert.calledTwice( addSpy );
				expect( addSpy.firstCall.args[ 1 ] ).to.equal( descriptor );
				expect( addSpy.secondCall.args[ 1 ] ).to.equal( secondDescriptor );
			} );
		} );
	} );

	describe( 'findOptimalInsertionRange()', () => {
		let model, doc;

		beforeEach( () => {
			model = new Model();
			doc = model.document;

			doc.createRoot();

			model.schema.register( 'paragraph', { inheritAllFrom: '$block' } );
			model.schema.register( 'imageBlock' );
			model.schema.register( 'span' );

			model.schema.extend( 'imageBlock', {
				allowIn: '$root',
				isObject: true,
				isBlock: true
			} );

			model.schema.register( 'horizontalLine', {
				isObject: true,
				allowWhere: '$block'
			} );

			model.schema.extend( 'span', { allowIn: 'paragraph' } );
			model.schema.extend( '$text', { allowIn: 'span' } );
		} );

		it( 'returns a collapsed range after selected element', () => {
			setData( model, '<paragraph>x</paragraph>[<imageBlock></imageBlock>]<paragraph>y</paragraph>' );

			const range = findOptimalInsertionRange( doc.selection, model );

			expect( range.start.path ).to.deep.equal( [ 1 ] );
			expect( range.end.path ).to.deep.equal( [ 2 ] );
		} );

		it( 'returns a collapsed range before parent block if an inline object is selected', () => {
			model.schema.register( 'placeholder', {
				allowWhere: '$text',
				isInline: true,
				isObject: true
			} );

			setData( model, '<paragraph>x</paragraph><paragraph>f[<placeholder></placeholder>]oo</paragraph><paragraph>y</paragraph>' );

			const range = findOptimalInsertionRange( doc.selection, model );

			expect( range.start.path ).to.deep.equal( [ 1 ] );
			expect( range.end.path ).to.deep.equal( [ 1 ] );
		} );

		it( 'returns a collapsed range inside empty block', () => {
			setData( model, '<paragraph>x</paragraph><paragraph>[]</paragraph><paragraph>y</paragraph>' );

			const range = findOptimalInsertionRange( doc.selection, model );

			expect( range.start.path ).to.deep.equal( [ 1, 0 ] );
			expect( range.end.path ).to.deep.equal( [ 1, 0 ] );
		} );

		it( 'returns a collapsed range before block if at the beginning of that block', () => {
			setData( model, '<paragraph>x</paragraph><paragraph>[]foo</paragraph><paragraph>y</paragraph>' );

			const range = findOptimalInsertionRange( doc.selection, model );

			expect( range.start.path ).to.deep.equal( [ 1 ] );
			expect( range.end.path ).to.deep.equal( [ 1 ] );
		} );

		it( 'returns a collapsed range before block if in the middle of that block (collapsed selection)', () => {
			setData( model, '<paragraph>x</paragraph><paragraph>f[]oo</paragraph><paragraph>y</paragraph>' );

			const range = findOptimalInsertionRange( doc.selection, model );

			expect( range.start.path ).to.deep.equal( [ 1 ] );
			expect( range.end.path ).to.deep.equal( [ 1 ] );
		} );

		it( 'returns a collapsed range before block if in the middle of that block (non-collapsed selection)', () => {
			setData( model, '<paragraph>x</paragraph><paragraph>f[o]o</paragraph><paragraph>y</paragraph>' );

			const range = findOptimalInsertionRange( doc.selection, model );

			expect( range.start.path ).to.deep.equal( [ 1 ] );
			expect( range.end.path ).to.deep.equal( [ 1 ] );
		} );

		it( 'returns a collapsed range after block if at the end of that block', () => {
			setData( model, '<paragraph>x</paragraph><paragraph>foo[]</paragraph><paragraph>y</paragraph>' );

			const range = findOptimalInsertionRange( doc.selection, model );

			expect( range.start.path ).to.deep.equal( [ 2 ] );
			expect( range.end.path ).to.deep.equal( [ 2 ] );
		} );

		// Checking if isTouching() was used.
		it( 'returns a collapsed range after block if at the end of that block (deeply nested)', () => {
			setData( model, '<paragraph>x</paragraph><paragraph>foo<span>bar[]</span></paragraph><paragraph>y</paragraph>' );

			const range = findOptimalInsertionRange( doc.selection, model );

			expect( range.start.path ).to.deep.equal( [ 2 ] );
			expect( range.end.path ).to.deep.equal( [ 2 ] );
		} );

		it( 'returns selection focus if not in a block', () => {
			model.schema.extend( '$text', { allowIn: '$root' } );
			setData( model, 'foo[]bar' );

			const range = findOptimalInsertionRange( doc.selection, model );

			expect( range.start.path ).to.deep.equal( [ 3 ] );
			expect( range.end.path ).to.deep.equal( [ 3 ] );
		} );

		// https://github.com/ckeditor/ckeditor5/issues/7438
		describe( 'integration with the WidgetTypeAround feature ("widget-type-around" model selection attribute)', () => {
			it( 'should respect the attribute value when a widget (block and an object) is selected ("fake caret" before a widget)', () => {
				setData( model, '<paragraph>x</paragraph>[<imageBlock></imageBlock>]<paragraph>y</paragraph>' );

				model.change( writer => {
					writer.setSelectionAttribute( 'widget-type-around', 'before' );
				} );

				const range = findOptimalInsertionRange( doc.selection, model );

				expect( range.start.path ).to.deep.equal( [ 1 ] );
				expect( range.end.path ).to.deep.equal( [ 1 ] );
			} );

			it( 'should respect the attribute value when a widget (block and an object) is selected ("fake caret" after a widget)', () => {
				setData( model, '<paragraph>x</paragraph>[<imageBlock></imageBlock>]<paragraph>y</paragraph>' );

				model.change( writer => {
					writer.setSelectionAttribute( 'widget-type-around', 'after' );
				} );

				const range = findOptimalInsertionRange( doc.selection, model );

				expect( range.start.path ).to.deep.equal( [ 2 ] );
				expect( range.end.path ).to.deep.equal( [ 2 ] );
			} );

			it( 'should return a range on a selected widget (block and an object) ("fake caret" not displayed)', () => {
				setData( model, '<paragraph>x</paragraph>[<imageBlock></imageBlock>]<paragraph>y</paragraph>' );

				const range = findOptimalInsertionRange( doc.selection, model );

				expect( range.start.path ).to.deep.equal( [ 1 ] );
				expect( range.end.path ).to.deep.equal( [ 2 ] );
			} );

			it( 'should respect the attribute value when a widget (an object) is selected ("fake caret" before a widget)', () => {
				setData( model, '<paragraph>x</paragraph>[<horizontalLine></horizontalLine>]<paragraph>y</paragraph>' );

				model.change( writer => {
					writer.setSelectionAttribute( 'widget-type-around', 'before' );
				} );

				const range = findOptimalInsertionRange( doc.selection, model );

				expect( range.start.path ).to.deep.equal( [ 1 ] );
				expect( range.end.path ).to.deep.equal( [ 1 ] );
			} );

			it( 'should respect the attribute value when a widget (an object) is selected ("fake caret" after a widget)', () => {
				setData( model, '<paragraph>x</paragraph>[<horizontalLine></horizontalLine>]<paragraph>y</paragraph>' );

				model.change( writer => {
					writer.setSelectionAttribute( 'widget-type-around', 'after' );
				} );

				const range = findOptimalInsertionRange( doc.selection, model );

				expect( range.start.path ).to.deep.equal( [ 2 ] );
				expect( range.end.path ).to.deep.equal( [ 2 ] );
			} );

			it( 'should return a range on a selected widget (an object) ("fake caret" not displayed)', () => {
				setData( model, '<paragraph>x</paragraph>[<horizontalLine></horizontalLine>]<paragraph>y</paragraph>' );

				const range = findOptimalInsertionRange( doc.selection, model );

				expect( range.start.path ).to.deep.equal( [ 1 ] );
				expect( range.end.path ).to.deep.equal( [ 2 ] );
			} );
		} );
	} );

	describe( 'viewToModelPositionOutsideModelElement()', () => {
		let mapper, model, modelP, viewP, viewXyz, modelSpan, viewSpan;

		beforeEach( () => {
			mapper = new Mapper();
			model = new Model();

			// MODEL: <p>foo<span></span>bar</p>
			const modelFoo = new ModelText( 'foo' );
			modelSpan = new ModelElement( 'span' );
			const modelBar = new ModelText( 'bar' );
			modelP = new ModelElement( 'p', null, [ modelFoo, modelSpan, modelBar ] );

			// VIEW: <p>foo<span>xyz</span>bar</p>
			const viewFoo = new ViewText( viewDocument, 'foo' );
			viewXyz = new ViewText( viewDocument, 'xyz' );
			viewSpan = new ViewElement( viewDocument, 'span', null, viewXyz );
			const viewBar = new ViewText( viewDocument, 'bar' );
			viewP = new ViewElement( viewDocument, 'p', null, [ viewFoo, viewSpan, viewBar ] );

			mapper.bindElements( modelP, viewP );
			mapper.bindElements( modelSpan, viewSpan );
		} );

		it( 'should map view position that is at the beginning of the view element to a position before the model element', () => {
			mapper.on( 'viewToModelPosition', viewToModelPositionOutsideModelElement( model, viewElement => viewElement.name == 'span' ) );

			// View:
			// <p>foo<span>|xyz</span>bar</p>.
			const viewPosition = new ViewPosition( viewXyz, 0 );

			// Model:
			// <p>foo|<span></span>bar</p>.
			const modelPosition = mapper.toModelPosition( viewPosition );

			expect( modelPosition.path ).to.deep.equal( [ 3 ] );
		} );

		it( 'should map view position that is in the middle of the view element to a position after the model element', () => {
			mapper.on( 'viewToModelPosition', viewToModelPositionOutsideModelElement( model, viewElement => viewElement.name == 'span' ) );

			// View:
			// <p>foo<span>x|yz</span>bar</p>.
			const viewPosition = new ViewPosition( viewXyz, 1 );

			// Model:
			// <p>foo|<span></span>bar</p>.
			const modelPosition = mapper.toModelPosition( viewPosition );

			expect( modelPosition.path ).to.deep.equal( [ 4 ] );
		} );

		it( 'should map view position that is at the end of the view element to a position after the model element', () => {
			mapper.on( 'viewToModelPosition', viewToModelPositionOutsideModelElement( model, viewElement => viewElement.name == 'span' ) );

			// View:
			// <p>foo<span>xyz|</span>bar</p>.
			const viewPosition = new ViewPosition( viewXyz, 3 );

			// Model:
			// <p>foo<span></span>|bar</p>.
			const modelPosition = mapper.toModelPosition( viewPosition );

			expect( modelPosition.path ).to.deep.equal( [ 4 ] );
		} );

		it( 'should not fire if view element is not matched', () => {
			mapper.on( 'viewToModelPosition', viewToModelPositionOutsideModelElement( model, () => false ) );

			// View:
			// <p>foo<span>x|yz</span>bar</p>.
			const viewPosition = new ViewPosition( viewXyz, 1 );

			// Model:
			// <p>foo<span>x|yz</span>bar</p>.
			modelSpan._appendChild( new ModelText( 'xyz' ) );
			const modelPosition = mapper.toModelPosition( viewPosition );

			expect( modelPosition.path ).to.deep.equal( [ 3, 1 ] );
		} );
	} );

	describe( 'Calculate resize host ancestor width utils', () => {
		describe( 'calculateResizeHostAncestorWidth()', () => {
			it( 'should get size from parent of passed element', () => {
				const domResizeHost = tag( 'div' );
				const tree = tag( 'div', sizeAttributes( 200 ), [
					domResizeHost
				] );

				document.body.appendChild( tree );
				expect( calculateResizeHostAncestorWidth( domResizeHost ) ).to.be.equal( 200 );
				tree.remove();
			} );

			it( 'if passed element\'s parent has unknown size then grandparent is used', () => {
				const domResizeHost = tag( 'div' );
				const tree = tag( 'div', sizeAttributes( 400 ), [
					tag( 'div', {}, [
						domResizeHost
					] )
				] );

				document.body.appendChild( tree );
				expect( calculateResizeHostAncestorWidth( domResizeHost ) ).to.be.equal( 400 );
				tree.remove();
			} );

			it( 'should return 0 if element is not mounted to DOM', () => {
				const domResizeHost = tag( 'div' );

				expect( calculateResizeHostAncestorWidth( domResizeHost ) ).to.be.equal( 0 );
			} );

			it( 'function takes size up to 6 level grandparent', () => {
				const domResizeHost = tag( 'with-size' );
				const tree = tag( 'parent-6', sizeAttributes( 600 ), [
					tag( 'parent-5', {}, [
						tag( 'parent-4', {}, [
							tag( 'parent-3', {}, [
								tag( 'parent-2', {}, [
									tag( 'parent-1', {}, [
										domResizeHost
									] )
								] )
							] )
						] )
					] )
				] );

				const unknownDomResizeHost = tag( 'without-size' );
				const unknownTree = tag( 'parent-7', sizeAttributes( 600 ), [
					tag( 'parent-6', {}, [
						tag( 'parent-5', {}, [
							tag( 'parent-4', {}, [
								tag( 'parent-3', {}, [
									tag( 'parent-2', {}, [
										tag( 'parent-1', {}, [
											unknownDomResizeHost
										] )
									] )
								] )
							] )
						] )
					] )
				] );

				document.body.appendChild( tree );
				document.body.appendChild( unknownTree );

				expect( calculateResizeHostAncestorWidth( domResizeHost ) ).to.be.equal( 600 );
				expect( calculateResizeHostAncestorWidth( unknownDomResizeHost ) ).to.be.equal( 0 );

				tree.remove();
				unknownTree.remove();
			} );
		} );

		describe( 'calculateResizeHostPercentageWidth()', () => {
			it( 'if no `resizeHostRect` argument passed then it should calc percentage based on passed `domResizeHost`', () => {
				const domResizeHost = tag( 'div', sizeAttributes( 100 ) );
				const tree = tag( 'div', sizeAttributes( 200 ), [
					domResizeHost
				] );

				document.body.appendChild( tree );
				expect( calculateResizeHostPercentageWidth( domResizeHost ) ).to.be.equal( 50 );
				tree.remove();
			} );

			it( 'if `resizeHostRect` argument passed then it should calc percentage based on that argument', () => {
				const domResizeHost = tag( 'div', sizeAttributes( 50 ) );
				const tree = tag( 'div', sizeAttributes( 100 ), [
					domResizeHost
				] );

				document.body.appendChild( tree );
				expect( calculateResizeHostPercentageWidth( domResizeHost, { width: 60 } ) ).to.be.equal( 60 );
				tree.remove();
			} );

			it( 'should return 0 if 6 level grandparent width is unknown', () => {
				const unknownDomResizeHost = tag( 'div', sizeAttributes( 50 ) );
				const unknownTree = tag( 'parent-7', {}, [
					tag( 'parent-6', {}, [
						tag( 'parent-5', {}, [
							tag( 'parent-4', {}, [
								tag( 'parent-3', {}, [
									tag( 'parent-2', {}, [
										tag( 'parent-1', {}, [
											unknownDomResizeHost
										] )
									] )
								] )
							] )
						] )
					] )
				] );

				document.body.appendChild( unknownTree );
				expect( calculateResizeHostPercentageWidth( unknownDomResizeHost ) ).to.be.equal( 0 );
				unknownTree.remove();
			} );
		} );

		function tag( name, attributes = {}, children = [] ) {
			const element = document.createElement( name );

			for ( const [ key, value ] of Object.entries( attributes ) ) {
				element.setAttribute( key, value );
			}

			for ( const child of children ) {
				element.appendChild( child );
			}

			return element;
		}

		function sizeAttributes( width, height = 1, unit = 'px' ) {
			return {
				style: [
					`width: ${ width }${ unit };`,
					`height: ${ height }${ unit }`
				].join( '' )
			};
		}
	} );
} );
