/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import buildViewConverter from '../../src/conversion/buildviewconverter';
import buildModelConverter from '../../src/conversion/buildmodelconverter';

import { getData as getModelData } from '../../src/dev-utils/model';
import { getData as getViewData } from '../../src/dev-utils/view';

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

				expect( getModelData( editor.document ) ).to.equal( '[<widget></widget>]<paragraph>foo</paragraph>' );
				expect( getViewData( editor.editing.view ) ).to.equal( '[<widget></widget>]<p>foo</p>' );

				return editor.destroy();
			} );
	} );
} );

function WidgetPlugin( editor ) {
	const schema = editor.document.schema;

	schema.registerItem( 'widget' );
	schema.allow( { name: 'widget', inside: '$root' } );
	schema.objects.add( 'widget' );

	buildModelConverter().for( editor.data.modelToView, editor.editing.modelToView )
		.fromElement( 'widget' )
		.toElement( 'widget' );

	buildViewConverter().for( editor.data.viewToModel )
		.fromElement( 'widget' )
		.toElement( 'widget' );
}
