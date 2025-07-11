/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import { Bold } from '@ckeditor/ckeditor5-basic-styles/src/bold.js';
import { ModelPosition } from '../../src/model/position.js';
import { ModelRange } from '../../src/model/range.js';
import { _setModelData, _getModelData } from '../../src/dev-utils/model.js';

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
		_setModelData( model,
			'<paragraph>foo bar baz</paragraph>' +
			'<paragraph>foo <$text bold="true">bar{}</$text> baz</paragraph>'
		);

		// Remove second paragraph where selection is placed.
		model.enqueueChange( { isUndoable: false }, writer => {
			writer.remove( ModelRange._createFromPositionAndShift( new ModelPosition( model.document.getRoot(), [ 1 ] ), 1 ) );
		} );

		expect( _getModelData( model ) ).to.equal( '<paragraph>foo bar baz[]</paragraph>' );
	} );

	it( 'selection should retain attributes set manually', () => {
		_setModelData( model,
			'<paragraph>foo bar baz</paragraph>' +
			'<paragraph>foo bar baz</paragraph>' +
			'<paragraph>[]</paragraph>'
		);

		// Execute bold command when selection is inside empty paragraph.
		editor.execute( 'bold' );
		expect( _getModelData( model ) ).to.equal(
			'<paragraph>foo bar baz</paragraph>' +
			'<paragraph>foo bar baz</paragraph>' +
			'<paragraph selection:bold="true"><$text bold="true">[]</$text></paragraph>'
		);

		// Remove second paragraph.
		model.enqueueChange( { isUndoable: false }, writer => {
			writer.remove( ModelRange._createFromPositionAndShift( new ModelPosition( model.document.getRoot(), [ 1 ] ), 1 ) );
		} );

		// Selection attributes set by command should stay as they were.
		expect( _getModelData( model ) ).to.equal(
			'<paragraph>foo bar baz</paragraph>' +
			'<paragraph selection:bold="true"><$text bold="true">[]</$text></paragraph>' );
	} );
} );
