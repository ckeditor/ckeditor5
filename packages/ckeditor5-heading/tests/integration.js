/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Heading from '../src/heading.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';

import Enter from '@ckeditor/ckeditor5-enter/src/enter.js';
import Image from '@ckeditor/ckeditor5-image/src/image.js';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption.js';
import Undo from '@ckeditor/ckeditor5-undo/src/undo.js';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

describe( 'Heading integration', () => {
	let editor, model, doc, element;

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, {
				plugins: [ Paragraph, Heading, Enter, Image, ImageCaption, Undo ]
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

	describe( 'with the enter key', () => {
		it( 'should make the "enter" command insert a default heading block if the selection ended at the end of a heading block', () => {
			editor.setData( '<h2>foobar</h2>' );

			model.change( writer => {
				writer.setSelection( doc.getRoot().getChild( 0 ), 'end' );
			} );

			editor.execute( 'enter' );

			expect( getModelData( model ) ).to.equal( '<heading1>foobar</heading1><paragraph>[]</paragraph>' );
		} );

		it( 'should not alter the "enter" command if selection not ended at the end of a heading block', () => {
			// This test is to fill code coverage.
			editor.setData( '<h2>foobar</h2>' );

			model.change( writer => {
				writer.setSelection( doc.getRoot().getChild( 0 ), 3 );
			} );

			editor.execute( 'enter' );

			expect( getModelData( model ) ).to.equal( '<heading1>foo</heading1><heading1>[]bar</heading1>' );
		} );
	} );

	describe( 'with the image feature', () => {
		// https://github.com/ckeditor/ckeditor5-heading/issues/73
		it( 'should not destroy the image when a selection converted to a heading', () => {
			setModelData( model,
				'<paragraph>fo[o</paragraph>' +
				'<imageBlock src="/assets/sample.png">' +
					'<caption>xxx</caption>' +
				'</imageBlock>' +
				'<paragraph>b]ar</paragraph>'
			);

			editor.execute( 'heading', { value: 'heading1' } );

			expect( getModelData( model ) ).to.equal(
				'<heading1>fo[o</heading1>' +
				'<imageBlock src="/assets/sample.png">' +
					'<caption>xxx</caption>' +
				'</imageBlock>' +
				'<heading1>b]ar</heading1>'
			);
		} );
	} );

	describe( 'with the undo feature', () => {
		it( 'does not create undo steps when applied to an existing heading (collapsed selection)', () => {
			// Ensure no undo step by using a transparent batch.
			model.enqueueChange( { isUndoable: false }, () => {
				setModelData( model, '<heading1>foo[]bar</heading1>' );
			} );

			editor.execute( 'heading', { value: 'heading1' } );
			expect( getModelData( model ) ).to.equal( '<heading1>foo[]bar</heading1>' );

			expect( editor.commands.get( 'undo' ).isEnabled ).to.be.false;
		} );

		it( 'does not create undo steps when applied to an existing heading (non–collapsed selection)', () => {
			// Ensure no undo step by using a transparent batch.
			model.enqueueChange( { isUndoable: false }, () => {
				setModelData( model, '<heading1>[foo</heading1><heading1>bar]</heading1>' );
			} );

			editor.execute( 'heading', { value: 'heading1' } );
			expect( getModelData( model ) ).to.equal( '<heading1>[foo</heading1><heading1>bar]</heading1>' );

			expect( editor.commands.get( 'undo' ).isEnabled ).to.be.false;
		} );
	} );

	// Remember to sync docs/_snippets/features/custom-heading-elements.js and docs/features/headings.md
	// with this test when changing it.
	describe( 'fancy heading sample in the docs', () => {
		it( 'upcasts the <h2> and <h2 class=fancy> elements when configured to do so', () => {
			const element = document.createElement( 'div' );
			document.body.appendChild( element );

			return ClassicTestEditor
				.create( element, {
					plugins: [ Paragraph, Heading ],
					heading: {
						options: [
							{ model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
							{ model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
							{
								model: 'headingFancy',
								view: {
									name: 'h2',
									classes: 'fancy'
								},
								title: 'Heading 2 (fancy)',
								class: 'ck-heading_heading2_fancy',
								converterPriority: 'high'
							}
						]
					}
				} )
				.then( editor => {
					editor.setData( '<h2>Heading 2</h2><h2 class="fancy">Fancy Heading 2</h2>' );

					expect( editor.getData() )
						.to.equal( '<h2>Heading 2</h2><h2 class="fancy">Fancy Heading 2</h2>' );

					element.remove();
					return editor.destroy();
				} );
		} );
	} );
} );
