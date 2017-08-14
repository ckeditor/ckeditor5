/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document */

import Heading from '../src/heading.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
import Undo from '@ckeditor/ckeditor5-undo/src/undo';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'Heading integration', () => {
	let editor, doc, element;

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, {
				plugins: [ Paragraph, Heading, Enter, Image, ImageCaption, Undo ]
			} )
			.then( newEditor => {
				editor = newEditor;
				doc = editor.document;
			} );
	} );

	afterEach( () => {
		element.remove();

		return editor.destroy();
	} );

	describe( 'with the enter key', () => {
		it( 'should make the "enter" command insert a default heading block if the selection ended at the end of a heading block', () => {
			editor.setData( '<h2>foobar</h2>' );
			doc.selection.setCollapsedAt( doc.getRoot().getChild( 0 ), 'end' );

			editor.execute( 'enter' );

			expect( getModelData( doc ) ).to.equal( '<heading1>foobar</heading1><paragraph>[]</paragraph>' );
		} );

		it( 'should not alter the "enter" command if selection not ended at the end of a heading block', () => {
			// This test is to fill code coverage.
			editor.setData( '<h2>foobar</h2>' );
			doc.selection.setCollapsedAt( doc.getRoot().getChild( 0 ), 3 );

			editor.execute( 'enter' );

			expect( getModelData( doc ) ).to.equal( '<heading1>foo</heading1><heading1>[]bar</heading1>' );
		} );
	} );

	describe( 'with the image feature', () => {
		// https://github.com/ckeditor/ckeditor5-heading/issues/73
		it( 'should not destroy the image when a selection converted to a heading', () => {
			setModelData( editor.document,
				'<paragraph>fo[o</paragraph>' +
				'<image src="foo.png">' +
					'<caption>xxx</caption>' +
				'</image>' +
				'<paragraph>b]ar</paragraph>'
			);

			editor.execute( 'heading1' );

			expect( getModelData( doc ) ).to.equal(
				'<heading1>fo[o</heading1>' +
				'<image src="foo.png">' +
					'<caption>xxx</caption>' +
				'</image>' +
				'<heading1>b]ar</heading1>'
			);
		} );
	} );

	describe( 'with the undo feature', () => {
		it( 'does not create undo steps when applied to an existing heading (collapsed selection)', () => {
			setModelData( editor.document, '<heading1>foo[]bar</heading1>' );

			editor.execute( 'heading1' );
			expect( getModelData( editor.document ) ).to.equal( '<heading1>foo[]bar</heading1>' );

			expect( editor.commands.get( 'undo' ).isEnabled ).to.be.false;
		} );

		it( 'does not create undo steps when applied to an existing heading (non–collapsed selection)', () => {
			setModelData( editor.document, '<heading1>[foo</heading1><heading1>bar]</heading1>' );

			editor.execute( 'heading1' );
			expect( getModelData( editor.document ) ).to.equal( '<heading1>[foo</heading1><heading1>bar]</heading1>' );

			expect( editor.commands.get( 'undo' ).isEnabled ).to.be.false;
		} );
	} );
} );
