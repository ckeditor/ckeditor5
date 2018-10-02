/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

import { defaultConversion, defaultSchema, formatTable, formattedViewTable, viewTable } from '../_utils/utils';
import injectTableCellPostFixer from '../../src/converters/tablecell-post-fixer';
import Range from '@ckeditor/ckeditor5-engine/src/model/range';

import env from '@ckeditor/ckeditor5-utils/src/env';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import Position from '@ckeditor/ckeditor5-engine/src/model/position';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';

describe( 'TableCell post-fixer', () => {
	let editor, model, doc, root, view;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		const element = document.createElement( 'div' );
		document.body.appendChild( element );

		// Most tests assume non-edge environment but we do not set `contenteditable=false` on Edge so stub `env.isEdge`.
		testUtils.sinon.stub( env, 'isEdge' ).get( () => false );

		return ClassicTestEditor.create( element )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				doc = model.document;
				root = doc.getRoot( 'main' );
				view = editor.editing.view;

				defaultSchema( model.schema );
				defaultConversion( editor.conversion, true );

				editor.model.schema.register( 'block', {
					inheritAllFrom: '$block'
				} );
				editor.conversion.elementToElement( { model: 'block', view: 'div' } );

				model.schema.extend( '$block', { allowAttributes: 'foo' } );
				editor.conversion.attributeToAttribute( { model: 'foo', view: 'foo' } );

				injectTableCellPostFixer( model, editor.editing );
			} );
	} );

	it( 'should rename <span> to <p> when adding more <paragraph> elements to the same table cell', () => {
		editor.setData( viewTable( [ [ '<p>00</p>' ] ] ) );

		const table = root.getChild( 0 );

		model.change( writer => {
			const nodeByPath = table.getNodeByPath( [ 0, 0, 0 ] );

			const paragraph = writer.createElement( 'paragraph' );

			writer.insert( paragraph, nodeByPath, 'after' );

			writer.setSelection( nodeByPath.nextSibling, 0 );
		} );

		expect( formatTable( getViewData( view, { withoutSelection: true } ) ) ).to.equal( formattedViewTable( [
			[ '<p>00</p><p></p>' ]
		], { asWidget: true } ) );
	} );

	it( 'should rename <span> to <p> on adding other block element to the same table cell', () => {
		editor.setData( viewTable( [ [ '<p>00</p>' ] ] ) );

		const table = root.getChild( 0 );

		model.change( writer => {
			const nodeByPath = table.getNodeByPath( [ 0, 0, 0 ] );

			const paragraph = writer.createElement( 'block' );

			writer.insert( paragraph, nodeByPath, 'after' );

			writer.setSelection( nodeByPath.nextSibling, 0 );
		} );

		expect( formatTable( getViewData( view, { withoutSelection: true } ) ) ).to.equal( formattedViewTable( [
			[ '<p>00</p><div></div>' ]
		], { asWidget: true } ) );
	} );

	it( 'should properly rename the same element on consecutive changes', () => {
		editor.setData( viewTable( [ [ '<p>00</p>' ] ] ) );

		const table = root.getChild( 0 );

		model.change( writer => {
			const nodeByPath = table.getNodeByPath( [ 0, 0, 0 ] );

			writer.insertElement( 'paragraph', nodeByPath, 'after' );

			writer.setSelection( nodeByPath.nextSibling, 0 );
		} );

		expect( formatTable( getViewData( view, { withoutSelection: true } ) ) ).to.equal( formattedViewTable( [
			[ '<p>00</p><p></p>' ]
		], { asWidget: true } ) );

		model.change( writer => {
			writer.remove( table.getNodeByPath( [ 0, 0, 1 ] ) );
		} );

		expect( formatTable( getViewData( view, { withoutSelection: true } ) ) ).to.equal( formattedViewTable( [
			[ '00' ]
		], { asWidget: true } ) );
	} );

	it( 'should rename <span> to <p> when setting attribute on <paragraph>', () => {
		editor.setData( '<table><tr><td><p>00</p></td></tr></table>' );

		const table = root.getChild( 0 );

		model.change( writer => {
			writer.setAttribute( 'foo', 'bar', table.getNodeByPath( [ 0, 0, 0 ] ) );
		} );

		expect( formatTable( getViewData( view, { withoutSelection: true } ) ) ).to.equal( formattedViewTable( [
			[ '<p foo="bar">00</p>' ]
		], { asWidget: true } ) );
	} );

	it( 'should rename <p> to <span> when removing all but one paragraph inside table cell', () => {
		editor.setData( viewTable( [ [ '<p>00</p><p>foo</p>' ] ] ) );

		const table = root.getChild( 0 );

		model.change( writer => {
			writer.remove( table.getNodeByPath( [ 0, 0, 1 ] ) );
		} );

		expect( formatTable( getViewData( view, { withoutSelection: true } ) ) ).to.equal( formattedViewTable( [
			[ '00' ]
		], { asWidget: true } ) );
	} );

	it( 'should rename <p> to <span> when removing attribute from <paragraph>', () => {
		editor.setData( '<table><tr><td><p foo="bar">00</p></td></tr></table>' );

		const table = root.getChild( 0 );

		model.change( writer => {
			writer.removeAttribute( 'foo', table.getNodeByPath( [ 0, 0, 0 ] ) );
		} );

		expect( formatTable( getViewData( view, { withoutSelection: true } ) ) ).to.equal( formattedViewTable( [
			[ '<span>00</span>' ]
		], { asWidget: true } ) );
	} );

	it( 'should keep <p> in the view when <paragraph> attribute value is changed', () => {
		editor.setData( viewTable( [ [ '<p foo="bar">00</p>' ] ] ) );

		const table = root.getChild( 0 );

		model.change( writer => {
			writer.setAttribute( 'foo', 'baz', table.getNodeByPath( [ 0, 0, 0 ] ) );
		} );

		expect( formatTable( getViewData( view, { withoutSelection: true } ) ) ).to.equal( formattedViewTable( [
			[ '<p foo="baz">00</p>' ]
		], { asWidget: true } ) );
	} );

	it( 'should keep <p> in the view when <paragraph> attribute value is changed (table cell with multiple blocks)', () => {
		editor.setData( viewTable( [ [ '<p foo="bar">00</p><p>00</p>' ] ] ) );

		const table = root.getChild( 0 );

		model.change( writer => {
			writer.setAttribute( 'foo', 'baz', table.getNodeByPath( [ 0, 0, 0 ] ) );
		} );

		expect( formatTable( getViewData( view, { withoutSelection: true } ) ) ).to.equal( formattedViewTable( [
			[ '<p foo="baz">00</p><p>00</p>' ]
		], { asWidget: true } ) );
	} );

	it( 'should do nothing on rename <paragraph> to other block', () => {
		editor.setData( viewTable( [ [ '<p>00</p>' ] ] ) );

		const table = root.getChild( 0 );

		model.change( writer => {
			writer.rename( table.getNodeByPath( [ 0, 0, 0 ] ), 'block' );
		} );

		expect( formatTable( getViewData( view, { withoutSelection: true } ) ) ).to.equal( formattedViewTable( [
			[ '<div>00</div>' ]
		], { asWidget: true } ) );
	} );

	it( 'should do nothing when setting attribute on block item other then <paragraph>', () => {
		editor.setData( viewTable( [ [ '<div>foo</div>' ] ] ) );

		const table = root.getChild( 0 );

		model.change( writer => {
			writer.setAttribute( 'foo', 'bar', table.getNodeByPath( [ 0, 0, 0 ] ) );
		} );

		expect( formatTable( getViewData( view, { withoutSelection: true } ) ) ).to.equal( formattedViewTable( [
			[ '<div foo="bar">foo</div>' ]
		], { asWidget: true } ) );
	} );

	it( 'should not crash when view.change() block was called in model.change()', () => {
		editor.setData( viewTable( [ [ '<p>foobar</p>' ] ] ) );

		const table = root.getChild( 0 );

		expect( formatTable( getViewData( view, { withoutSelection: true } ) ) )
			.to.equal( formattedViewTable( [ [ 'foobar' ] ], { asWidget: true } ) );

		expect( () => {
			model.change( writer => {
				const tableCell = table.getNodeByPath( [ 0, 0 ] );

				writer.insertElement( 'paragraph', null, Position.createAt( tableCell, 'end' ) );
				writer.setSelection( Range.createIn( tableCell ) );

				// Do some change in the view while inside model change.
				editor.editing.view.change( writer => {
					writer.addClass( 'foo', editor.editing.mapper.toViewElement( tableCell ) );
				} );
			} );
		} ).to.not.throw();

		expect( formatTable( getViewData( view ) ) ).to.equal( formattedViewTable( [
			[ { class: 'foo', contents: '<p>{foobar</p><p>]</p>' } ]
		], { asWidget: true } ) );
	} );

	it( 'should keep <p> in the view when <paragraph> attribute value is changed (table cell with multiple blocks)', () => {
		editor.setData( viewTable( [ [ '<p>00</p><p>00</p>' ] ] ) );

		const table = root.getChild( 0 );

		model.change( writer => {
			writer.remove( Range.createOn( table.getNodeByPath( [ 0, 0, 1 ] ) ) );
		} );

		expect( formatTable( getViewData( view, { withoutSelection: true } ) ) ).to.equal( formattedViewTable( [
			[ '<span>00</span>' ]
		], { asWidget: true } ) );
	} );

	it( 'should update view selection after deleting content', () => {
		editor.setData( viewTable( [ [ '<p>foo</p><p>bar</p>' ] ] ) );

		const tableCell = root.getNodeByPath( [ 0, 0, 0 ] );

		// Replace table cell contents with paragraph - as model.deleteContent() does.
		model.change( writer => {
			writer.remove( Range.createIn( tableCell ) );

			const paragraph = writer.createElement( 'paragraph' );

			writer.insert( paragraph, Position.createAt( tableCell ) );

			// Set selection to newly created paragraph.
			writer.setSelection( paragraph, 0 );
		} );

		const viewRange = view.document.selection.getFirstRange();

		// Trying to map view selection to DOM range shouldn't throw after post-fixer will fix inserted <p> to <span>.
		expect( () => view.domConverter.viewRangeToDom( viewRange ) ).to.not.throw();
	} );
} );
