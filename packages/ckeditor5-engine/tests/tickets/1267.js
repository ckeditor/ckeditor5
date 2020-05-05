/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Position from '../../src/model/position';
import Range from '../../src/model/range';
import { setData as setModelData, getData as getModelData } from '../../src/dev-utils/model';

describe( 'Bug ckeditor5-engine#1267', () => {
	let element, editor, model;

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, { plugins: [ Paragraph, Bold ] } )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
			} );
	} );

	afterEach( () => {
		element.remove();

		return editor.destroy();
	} );

	it( 'selection should not retain attributes after external change removal', () => {
		setModelData( model,
			'<paragraph>foo bar baz</paragraph>' +
			'<paragraph>foo <$text bold="true">bar{}</$text> baz</paragraph>'
		);

		// Remove second paragraph where selection is placed.
		model.enqueueChange( 'transparent', writer => {
			writer.remove( Range._createFromPositionAndShift( new Position( model.document.getRoot(), [ 1 ] ), 1 ) );
		} );

		expect( getModelData( model ) ).to.equal( '<paragraph>foo bar baz[]</paragraph>' );
	} );

	it( 'selection should retain attributes set manually', () => {
		setModelData( model,
			'<paragraph>foo bar baz</paragraph>' +
			'<paragraph>foo bar baz</paragraph>' +
			'<paragraph>[]</paragraph>'
		);

		// Execute bold command when selection is inside empty paragraph.
		editor.execute( 'bold' );
		expect( getModelData( model ) ).to.equal(
			'<paragraph>foo bar baz</paragraph>' +
			'<paragraph>foo bar baz</paragraph>' +
			'<paragraph selection:bold="true"><$text bold="true">[]</$text></paragraph>'
		);

		// Remove second paragraph.
		model.enqueueChange( 'transparent', writer => {
			writer.remove( Range._createFromPositionAndShift( new Position( model.document.getRoot(), [ 1 ] ), 1 ) );
		} );

		// Selection attributes set by command should stay as they were.
		expect( getModelData( model ) ).to.equal(
			'<paragraph>foo bar baz</paragraph>' +
			'<paragraph selection:bold="true"><$text bold="true">[]</$text></paragraph>' );
	} );
} );
