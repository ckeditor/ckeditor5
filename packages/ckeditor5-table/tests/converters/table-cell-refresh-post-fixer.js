/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Delete from '@ckeditor/ckeditor5-typing/src/delete';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import { assertEqualMarkup } from '@ckeditor/ckeditor5-utils/tests/_utils/utils';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

import TableEditing from '../../src/tableediting';
import { viewTable } from '../_utils/utils';

describe( 'Table cell refresh post-fixer', () => {
	let editor, model, doc, root, view, refreshItemSpy, element;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor.create( element, { plugins: [ Paragraph, TableEditing, Delete ] } )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				doc = model.document;
				root = doc.getRoot( 'main' );
				view = editor.editing.view;

				editor.model.schema.register( 'block', {
					inheritAllFrom: '$block'
				} );
				editor.conversion.elementToElement( { model: 'block', view: 'div' } );

				model.schema.extend( '$block', { allowAttributes: [ 'foo', 'bar' ] } );
				editor.conversion.attributeToAttribute( { model: 'foo', view: 'foo' } );
				editor.conversion.attributeToAttribute( { model: 'bar', view: 'bar' } );

				refreshItemSpy = sinon.spy( model.document.differ, 'refreshItem' );
			} );
	} );

	afterEach( () => {
		element.remove();
		return editor.destroy();
	} );

	it( 'should rename <span> to <p> when adding <paragraph> element to the same table cell', () => {
		editor.setData( viewTable( [ [ '<p>00</p>' ] ] ) );

		const table = root.getChild( 0 );

		model.change( writer => {
			const nodeByPath = table.getNodeByPath( [ 0, 0, 0 ] );
			const paragraph = writer.createElement( 'paragraph' );

			writer.insert( paragraph, nodeByPath, 'after' );
			writer.setSelection( nodeByPath.nextSibling, 0 );
		} );

		assertEqualMarkup( getViewData( view, { withoutSelection: true } ), viewTable( [
			[ '<p>00</p><p></p>' ]
		], { asWidget: true } ) );
		sinon.assert.calledOnce( refreshItemSpy );
	} );

	it( 'should rename <span> to <p> when adding more <paragraph> elements to the same table cell', () => {
		editor.setData( viewTable( [ [ '<p>00</p>' ] ] ) );

		const table = root.getChild( 0 );

		model.change( writer => {
			const nodeByPath = table.getNodeByPath( [ 0, 0, 0 ] );
			const paragraph1 = writer.createElement( 'paragraph' );
			const paragraph2 = writer.createElement( 'paragraph' );

			writer.insert( paragraph1, nodeByPath, 'after' );
			writer.insert( paragraph2, nodeByPath, 'after' );
			writer.setSelection( nodeByPath.nextSibling, 0 );
		} );

		assertEqualMarkup( getViewData( view, { withoutSelection: true } ), viewTable( [
			[ '<p>00</p><p></p><p></p>' ]
		], { asWidget: true } ) );
		sinon.assert.calledOnce( refreshItemSpy );
	} );

	it( 'should rename <span> to <p> on adding other block element to the same table cell', () => {
		editor.setData( viewTable( [ [ '<p>00</p>' ] ] ) );

		const table = root.getChild( 0 );

		model.change( writer => {
			const nodeByPath = table.getNodeByPath( [ 0, 0, 0 ] );
			const block = writer.createElement( 'block' );

			writer.insert( block, nodeByPath, 'after' );
			writer.setSelection( nodeByPath.nextSibling, 0 );
		} );

		assertEqualMarkup( getViewData( view, { withoutSelection: true } ), viewTable( [
			[ '<p>00</p><div></div>' ]
		], { asWidget: true } ) );
		sinon.assert.calledOnce( refreshItemSpy );
	} );

	it( 'should rename <span> to <p> on adding multiple other block elements to the same table cell', () => {
		editor.setData( viewTable( [ [ '<p>00</p>' ] ] ) );

		const table = root.getChild( 0 );

		model.change( writer => {
			const nodeByPath = table.getNodeByPath( [ 0, 0, 0 ] );
			const block1 = writer.createElement( 'block' );
			const block2 = writer.createElement( 'block' );

			writer.insert( block1, nodeByPath, 'after' );
			writer.insert( block2, nodeByPath, 'after' );
			writer.setSelection( nodeByPath.nextSibling, 0 );
		} );

		assertEqualMarkup( getViewData( view, { withoutSelection: true } ), viewTable( [
			[ '<p>00</p><div></div><div></div>' ]
		], { asWidget: true } ) );
		sinon.assert.calledOnce( refreshItemSpy );
	} );

	it( 'should properly rename the same element on consecutive changes', () => {
		editor.setData( viewTable( [ [ '<p>00</p>' ] ] ) );

		const table = root.getChild( 0 );

		model.change( writer => {
			const nodeByPath = table.getNodeByPath( [ 0, 0, 0 ] );

			writer.insertElement( 'paragraph', nodeByPath, 'after' );

			writer.setSelection( nodeByPath.nextSibling, 0 );
		} );

		assertEqualMarkup( getViewData( view, { withoutSelection: true } ), viewTable( [
			[ '<p>00</p><p></p>' ]
		], { asWidget: true } ) );
		sinon.assert.calledOnce( refreshItemSpy );

		model.change( writer => {
			writer.remove( table.getNodeByPath( [ 0, 0, 1 ] ) );
		} );

		assertEqualMarkup( getViewData( view, { withoutSelection: true } ), viewTable( [
			[ '00' ]
		], { asWidget: true } ) );
		sinon.assert.calledTwice( refreshItemSpy );
	} );

	it( 'should rename <span> to <p> when setting attribute on <paragraph>', () => {
		editor.setData( '<table><tr><td><p>00</p></td></tr></table>' );

		const table = root.getChild( 0 );

		model.change( writer => {
			writer.setAttribute( 'foo', 'bar', table.getNodeByPath( [ 0, 0, 0 ] ) );
		} );

		assertEqualMarkup( getViewData( view, { withoutSelection: true } ), viewTable( [
			[ '<p foo="bar">00</p>' ]
		], { asWidget: true } ) );
		sinon.assert.calledOnce( refreshItemSpy );
	} );

	it( 'should rename <p> to <span> when removing one of two paragraphs inside table cell', () => {
		editor.setData( viewTable( [ [ '<p>00</p><p>foo</p>' ] ] ) );

		const table = root.getChild( 0 );

		model.change( writer => {
			writer.remove( table.getNodeByPath( [ 0, 0, 1 ] ) );
		} );

		assertEqualMarkup( getViewData( view, { withoutSelection: true } ), viewTable( [
			[ '00' ]
		], { asWidget: true } ) );
		sinon.assert.calledOnce( refreshItemSpy );
	} );

	it( 'should rename <p> to <span> when removing all but one paragraph inside table cell', () => {
		editor.setData( viewTable( [ [ '<p>00</p><p>foo</p><p>bar</p>' ] ] ) );

		const table = root.getChild( 0 );

		model.change( writer => {
			writer.remove( table.getNodeByPath( [ 0, 0, 1 ] ) );
			writer.remove( table.getNodeByPath( [ 0, 0, 1 ] ) );
		} );

		assertEqualMarkup( getViewData( view, { withoutSelection: true } ), viewTable( [
			[ '00' ]
		], { asWidget: true } ) );
		sinon.assert.calledOnce( refreshItemSpy );
	} );

	it( 'should rename <p> to <span> when removing attribute from <paragraph>', () => {
		editor.setData( '<table><tr><td><p foo="bar">00</p></td></tr></table>' );

		const table = root.getChild( 0 );

		model.change( writer => {
			writer.removeAttribute( 'foo', table.getNodeByPath( [ 0, 0, 0 ] ) );
		} );

		assertEqualMarkup( getViewData( view, { withoutSelection: true } ), viewTable( [
			[ '<span style="display:inline-block">00</span>' ]
		], { asWidget: true } ) );
		sinon.assert.calledOnce( refreshItemSpy );
	} );

	it( 'should keep <p> in the view when <paragraph> attribute value is changed', () => {
		editor.setData( viewTable( [ [ '<p foo="bar">00</p>' ] ] ) );

		const table = root.getChild( 0 );

		model.change( writer => {
			writer.setAttribute( 'foo', 'baz', table.getNodeByPath( [ 0, 0, 0 ] ) );
		} );

		assertEqualMarkup( getViewData( view, { withoutSelection: true } ), viewTable( [
			[ '<p foo="baz">00</p>' ]
		], { asWidget: true } ) );
		// False positive: should not be called.
		sinon.assert.calledOnce( refreshItemSpy );
	} );

	it( 'should keep <p> in the view when adding another attribute to a <paragraph> with other attributes', () => {
		editor.setData( viewTable( [ [ '<p foo="bar">00</p>' ] ] ) );

		const table = root.getChild( 0 );

		model.change( writer => {
			writer.setAttribute( 'bar', 'bar', table.getNodeByPath( [ 0, 0, 0 ] ) );
		} );

		assertEqualMarkup( getViewData( view, { withoutSelection: true } ), viewTable( [
			[ '<p bar="bar" foo="bar">00</p>' ]
		], { asWidget: true } ) );

		// False positive
		sinon.assert.notCalled( refreshItemSpy );
	} );

	it( 'should keep <p> in the view when adding another attribute to a <paragraph> and removing attribute that is already set', () => {
		editor.setData( viewTable( [ [ '<p foo="bar">00</p>' ] ] ) );

		const table = root.getChild( 0 );

		model.change( writer => {
			writer.setAttribute( 'bar', 'bar', table.getNodeByPath( [ 0, 0, 0 ] ) );
			writer.removeAttribute( 'foo', table.getNodeByPath( [ 0, 0, 0 ] ) );
		} );

		assertEqualMarkup( getViewData( view, { withoutSelection: true } ), viewTable( [
			[ '<p bar="bar">00</p>' ]
		], { asWidget: true } ) );
		// False positive: should not be called.
		sinon.assert.calledOnce( refreshItemSpy );
	} );

	it( 'should keep <p> in the view when <paragraph> attribute value is changed (table cell with multiple blocks)', () => {
		editor.setData( viewTable( [ [ '<p foo="bar">00</p><p>00</p>' ] ] ) );

		const table = root.getChild( 0 );

		model.change( writer => {
			writer.setAttribute( 'foo', 'baz', table.getNodeByPath( [ 0, 0, 0 ] ) );
		} );

		assertEqualMarkup( getViewData( view, { withoutSelection: true } ), viewTable( [
			[ '<p foo="baz">00</p><p>00</p>' ]
		], { asWidget: true } ) );
		sinon.assert.notCalled( refreshItemSpy );
	} );

	it( 'should do nothing on rename <paragraph> to other block', () => {
		editor.setData( viewTable( [ [ '<p>00</p>' ] ] ) );

		const table = root.getChild( 0 );

		model.change( writer => {
			writer.rename( table.getNodeByPath( [ 0, 0, 0 ] ), 'block' );
		} );

		assertEqualMarkup( getViewData( view, { withoutSelection: true } ), viewTable( [
			[ '<div>00</div>' ]
		], { asWidget: true } ) );
		sinon.assert.notCalled( refreshItemSpy );
	} );

	it( 'should do nothing on adding <paragraph> to existing paragraphs', () => {
		editor.setData( viewTable( [ [ '<p>a</p><p>b</p>' ] ] ) );

		const table = root.getChild( 0 );

		model.change( writer => {
			writer.insertElement( 'paragraph', table.getNodeByPath( [ 0, 0, 1 ] ), 'after' );
		} );

		assertEqualMarkup( getViewData( view, { withoutSelection: true } ), viewTable( [
			[ '<p>a</p><p>b</p><p></p>' ]
		], { asWidget: true } ) );
		sinon.assert.notCalled( refreshItemSpy );
	} );

	it( 'should do nothing when setting attribute on block item other then <paragraph>', () => {
		editor.setData( viewTable( [ [ '<div>foo</div>' ] ] ) );

		const table = root.getChild( 0 );

		model.change( writer => {
			writer.setAttribute( 'foo', 'bar', table.getNodeByPath( [ 0, 0, 0 ] ) );
		} );

		assertEqualMarkup( getViewData( view, { withoutSelection: true } ), viewTable( [
			[ '<div foo="bar">foo</div>' ]
		], { asWidget: true } ) );
		sinon.assert.notCalled( refreshItemSpy );
	} );

	it( 'should rename <p> in to <span> when removing <paragraph> (table cell with 2 paragraphs)', () => {
		editor.setData( viewTable( [ [ '<p>00</p><p>00</p>' ] ] ) );

		const table = root.getChild( 0 );

		model.change( writer => {
			writer.remove( writer.createRangeOn( table.getNodeByPath( [ 0, 0, 1 ] ) ) );
		} );

		assertEqualMarkup( getViewData( view, { withoutSelection: true } ), viewTable( [
			[ '<span style="display:inline-block">00</span>' ]
		], { asWidget: true } ) );
		sinon.assert.calledOnce( refreshItemSpy );
	} );

	it( 'should update view selection after deleting content', () => {
		editor.setData( viewTable( [ [ '<p>foo</p><p>bar</p>' ] ] ) );

		const tableCell = root.getNodeByPath( [ 0, 0, 0 ] );

		// Replace table cell contents with paragraph - as model.deleteContent() does.
		model.change( writer => {
			writer.remove( writer.createRangeIn( tableCell ) );

			const paragraph = writer.createElement( 'paragraph' );

			writer.insert( paragraph, writer.createPositionAt( tableCell, 0 ) );

			// Set selection to newly created paragraph.
			writer.setSelection( paragraph, 0 );
		} );

		const viewRange = view.document.selection.getFirstRange();

		// Trying to map view selection to DOM range shouldn't throw after post-fixer will fix inserted <p> to <span>.
		expect( () => view.domConverter.viewRangeToDom( viewRange ) ).to.not.throw();
	} );

	it( 'should not update view selection after other feature set selection', () => {
		editor.model.schema.register( 'widget', {
			isObject: true,
			isBlock: true,
			allowWhere: '$block'
		} );
		editor.conversion.elementToElement( {
			model: 'widget',
			view: 'widget'
		} );

		editor.setData( viewTable( [ [ '<p>foo[]</p>' ] ] ) );

		const spy = sinon.spy();

		view.document.selection.on( 'change', spy );

		// Insert a widget in table cell and select it.
		model.change( writer => {
			const widgetElement = writer.createElement( 'widget' );
			const tableCell = root.getNodeByPath( [ 0, 0, 0, 0 ] );

			writer.insert( widgetElement, writer.createPositionAfter( tableCell ) );

			// Update the selection so it will be set on the widget and not in renamed paragraph.
			writer.setSelection( widgetElement, 'on' );
		} );

		// View selection should be updated only twice - will be set to null and then to widget.
		// If called thrice the selection post fixer for table cell was also called.
		sinon.assert.calledTwice( spy );
	} );

	// https://github.com/ckeditor/ckeditor5-table/issues/191.
	it( 'should not fire (and crash) for removed view elements', () => {
		editor.setData( viewTable( [ [ '<p>foo</p>' ] ] ) );

		const p = root.getNodeByPath( [ 0, 0, 0, 0 ] );

		// Replace table cell contents with paragraph - as model.deleteContent() does.
		model.change( writer => {
			writer.setSelection( writer.createRangeIn( root ) );
			editor.execute( 'delete' ); // For some reason it didn't crash with `writer.remove()`.

			writer.setAttribute( 'foo', 'bar', p );
		} );

		// Trying to map view selection to DOM range shouldn't throw after post-fixer will fix inserted <p> to <span>.
		expect( editor.getData() ).to.equal( '' );
	} );
} );
