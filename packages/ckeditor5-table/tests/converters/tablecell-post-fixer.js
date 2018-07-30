/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import { defaultConversion, defaultSchema, formatTable, formattedViewTable, modelTable } from '../_utils/utils';
import injectTableCellPostFixer from '../../src/converters/tablecell-post-fixer';

import env from '@ckeditor/ckeditor5-utils/src/env';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

describe( 'TableCell post-fixer', () => {
	let editor, model, doc, root, viewDocument;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		// Most tests assume non-edge environment but we do not set `contenteditable=false` on Edge so stub `env.isEdge`.
		testUtils.sinon.stub( env, 'isEdge' ).get( () => false );

		return VirtualTestEditor.create()
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				doc = model.document;
				root = doc.getRoot( 'main' );
				viewDocument = editor.editing.view;

				defaultSchema( model.schema );
				defaultConversion( editor.conversion, true );

				injectTableCellPostFixer( model, editor.editing );
			} );
	} );

	it( 'should create <span> element for single paragraph inside table cell', () => {
		setModelData( model, modelTable( [ [ '00[]' ] ] ) );

		expect( formatTable( getViewData( viewDocument, { withoutSelection: true } ) ) ).to.equal( formatTable(
			'<figure class="ck-widget ck-widget_selectable table" contenteditable="false">' +
				'<div class="ck ck-widget__selection-handler"></div>' +
				'<table>' +
					'<tbody>' +
						'<tr>' +
							'<td class="ck-editor__editable ck-editor__nested-editable" contenteditable="true">' +
								'<span>00</span>' +
							'</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>' +
			'</figure>'
		) );
	} );

	it( 'should rename <span> to <p> when more then one block content inside table cell', () => {
		setModelData( model, modelTable( [ [ '00[]' ] ] ) );

		const table = root.getChild( 0 );

		model.change( writer => {
			const nodeByPath = table.getNodeByPath( [ 0, 0, 0 ] );

			const paragraph = writer.createElement( 'paragraph' );

			writer.insert( paragraph, nodeByPath, 'after' );

			writer.setSelection( nodeByPath.nextSibling, 0 );
		} );

		expect( formatTable( getViewData( viewDocument, { withoutSelection: true } ) ) ).to.equal( formattedViewTable( [
			[ '<p>00</p><p></p>' ]
		], { asWidget: true } ) );
	} );

	it( 'should rename <p> to <span> when removing all but one paragraph inside table cell', () => {
		setModelData( model, modelTable( [ [ '<paragraph>00[]</paragraph><paragraph>foo</paragraph>' ] ] ) );

		const table = root.getChild( 0 );

		model.change( writer => {
			writer.remove( table.getNodeByPath( [ 0, 0, 1 ] ) );
		} );

		expect( formatTable( getViewData( viewDocument, { withoutSelection: true } ) ) ).to.equal( formattedViewTable( [
			[ '00' ]
		], { asWidget: true } ) );
	} );

	it( 'should rename <span> to <p> when setting attribute on paragraph', () => {
		model.schema.extend( '$block', { allowAttributes: 'foo' } );
		editor.conversion.attributeToAttribute( { model: 'foo', view: 'foo' } );

		setModelData( model, modelTable( [ [ '<paragraph>00[]</paragraph>' ] ] ) );

		const table = root.getChild( 0 );

		model.change( writer => {
			writer.setAttribute( 'foo', 'bar', table.getNodeByPath( [ 0, 0, 0 ] ) );
		} );

		expect( formatTable( getViewData( viewDocument, { withoutSelection: true } ) ) ).to.equal( formattedViewTable( [
			[ '<p foo="bar">00</p>' ]
		], { asWidget: true } ) );
	} );

	it( 'should rename <p> to <span> when removing attribute from paragraph', () => {
		model.schema.extend( '$block', { allowAttributes: 'foo' } );
		editor.conversion.attributeToAttribute( { model: 'foo', view: 'foo' } );

		setModelData( model, modelTable( [ [ '<paragraph foo="bar">00[]</paragraph>' ] ] ) );

		const table = root.getChild( 0 );

		model.change( writer => {
			writer.removeAttribute( 'foo', table.getNodeByPath( [ 0, 0, 0 ] ) );
		} );

		expect( formatTable( getViewData( viewDocument, { withoutSelection: true } ) ) ).to.equal( formattedViewTable( [
			[ '<span>00</span>' ]
		], { asWidget: true } ) );
	} );

	it( 'should do nothing on rename <paragraph> to <heading1>', () => {
		setModelData( model, modelTable( [ [ '00' ] ] ) );

		const table = root.getChild( 0 );

		editor.conversion.elementToElement( { model: 'heading1', view: 'h1' } );

		model.change( writer => {
			writer.rename( table.getNodeByPath( [ 0, 0, 0 ] ), 'heading1' );
		} );

		expect( formatTable( getViewData( viewDocument, { withoutSelection: true } ) ) ).to.equal( formattedViewTable( [
			[ '<h1>00</h1>' ]
		], { asWidget: true } ) );
	} );
} );
