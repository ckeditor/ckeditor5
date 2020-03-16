/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import Title from '../src/title';
import Heading from '../src/heading.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import { getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'Title integration', () => {
	let editor, model, doc, element;

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, {
				plugins: [ Paragraph, Heading, Enter, Bold, Title ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				doc = model.document;
			} );
	} );

	afterEach( () => {
		element.remove();

		return editor.destroy();
	} );

	describe( 'with basic styles', () => {
		// See: https://github.com/ckeditor/ckeditor5/issues/6427
		it( 'does not blow up when applying basic styles', () => {
			editor.setData( '<h1>Title</h1><p>Foo</p>' );

			editor.model.change( writer => {
				writer.setSelection( doc.getRoot().getChild( 1 ), 'on' );
			} );

			editor.execute( 'bold' );

			expect( editor.plugins.get( Title ).getBody() ).to.equal(
				'<p><strong>Foo</strong></p>'
			);

			expect( getModelData( model ) ).to.equal(
				'<title><title-content>Title</title-content></title><paragraph>[<$text bold="true">Foo</$text>]</paragraph>'
			);
		} );
	} );
} );
