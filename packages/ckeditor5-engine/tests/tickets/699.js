/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';

import { getData as getModelData } from '../../src/dev-utils/model.js';
import { getData as getViewData } from '../../src/dev-utils/view.js';

describe( 'Bug ckeditor5-engine#699', () => {
	let element;

	beforeEach( () => {
		element = document.createElement( 'div' );

		document.body.appendChild( element );
	} );

	afterEach( () => {
		element.remove();
	} );

	it( 'the engine sets the initial selection on the first widget', () => {
		return ClassicTestEditor
			.create( element, { plugins: [ Paragraph, WidgetPlugin ] } )
			.then( editor => {
				editor.setData( '<widget></widget><p>foo</p>' );

				expect( getModelData( editor.model ) ).to.equal( '[<widget></widget>]<paragraph>foo</paragraph>' );
				expect( getViewData( editor.editing.view ) ).to.equal( '[<widget></widget>]<p>foo</p>' );

				return editor.destroy();
			} );
	} );
} );

function WidgetPlugin( editor ) {
	const schema = editor.model.schema;

	schema.register( 'widget', {
		isObject: true
	} );
	schema.extend( 'widget', { allowIn: '$root' } );

	editor.conversion.for( 'downcast' ).elementToElement( {
		model: 'widget',
		view: 'widget'
	} );

	editor.conversion.for( 'upcast' ).elementToElement( {
		model: 'widget',
		view: 'widget'
	} );
}
