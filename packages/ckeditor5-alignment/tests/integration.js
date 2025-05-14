/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Alignment from '../src/alignment.js';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Heading from '@ckeditor/ckeditor5-heading/src/heading.js';
import Image from '@ckeditor/ckeditor5-image/src/image.js';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption.js';
import LegacyList from '@ckeditor/ckeditor5-list/src/legacylist.js';
import Enter from '@ckeditor/ckeditor5-enter/src/enter.js';
import Delete from '@ckeditor/ckeditor5-typing/src/delete.js';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';

describe( 'Alignment integration', () => {
	let editor, model, element;

	beforeEach( () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, {
				plugins: [ Alignment, BlockQuote, Paragraph, Heading, Image, ImageCaption, LegacyList, Enter, Delete ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
			} );
	} );

	afterEach( () => {
		element.remove();

		return editor.destroy();
	} );

	describe( 'compatibility with images', () => {
		it( 'does not work inside image caption', () => {
			setModelData( model, '<imageBlock src="/assets/sample.png"><caption>Foo[]</caption></imageBlock>' );

			editor.execute( 'alignment', { value: 'center' } );

			expect( getModelData( model ) ).to.equal( '<imageBlock src="/assets/sample.png"><caption>Foo[]</caption></imageBlock>' );
		} );

		it( 'does not work inside image caption when selection overlaps image', () => {
			setModelData(
				model,
				'<paragraph>foo[foo</paragraph>' +
				'<imageBlock src="/assets/sample.png"><caption>bar</caption></imageBlock>' +
				'<paragraph>baz]baz</paragraph>'
			);

			editor.execute( 'alignment', { value: 'center' } );

			expect( getModelData( model ) ).to.equal(
				'<paragraph alignment="center">foo[foo</paragraph>' +
				'<imageBlock src="/assets/sample.png"><caption>bar</caption></imageBlock>' +
				'<paragraph alignment="center">baz]baz</paragraph>'
			);
		} );
	} );

	describe( 'compatibility with blockQuote', () => {
		it( 'does work inside BlockQuote on paragraph', () => {
			setModelData( model, '<blockQuote><paragraph>Foo[]</paragraph></blockQuote>' );

			editor.execute( 'alignment', { value: 'center' } );

			expect( getModelData( model ) ).to.equal( '<blockQuote><paragraph alignment="center">Foo[]</paragraph></blockQuote>' );
		} );

		it( 'does work inside blockQuote on heading', () => {
			setModelData( model, '<blockQuote><heading1>Foo[]</heading1></blockQuote>' );

			editor.execute( 'alignment', { value: 'center' } );

			expect( getModelData( model ) ).to.equal( '<blockQuote><heading1 alignment="center">Foo[]</heading1></blockQuote>' );
		} );

		it( 'does work inside blockQuote on listItem', () => {
			setModelData( model, '<blockQuote><listItem listIndent="0" listType="numbered">Foo[]</listItem></blockQuote>' );

			editor.execute( 'alignment', { value: 'center' } );

			expect( getModelData( model ) ).to.equal(
				'<blockQuote><listItem alignment="center" listIndent="0" listType="numbered">Foo[]</listItem></blockQuote>'
			);
		} );
	} );

	describe( 'compatibility with \'to-model-attribute\' converter', () => {
		it( 'should not set the "alignment" attribute if the schema does not allow', () => {
			// See: https://github.com/ckeditor/ckeditor5/pull/9249#issuecomment-815658459.
			editor.model.schema.register( 'div', {
				inheritAllFrom: '$block',
				allowAttributes: [ 'customAlignment' ]
			} );

			// Does not allow for setting the "alignment" attribute for `div` elements.
			editor.model.schema.addAttributeCheck( ( context, attributeName ) => {
				if ( context.endsWith( 'div' ) && attributeName == 'alignment' ) {
					return false;
				}
			} );

			editor.conversion.elementToElement( { model: 'div', view: 'div' } );

			editor.conversion.attributeToAttribute( {
				model: {
					name: 'div',
					key: 'customAlignment',
					values: [ 'right' ]
				},
				view: {
					right: {
						key: 'style',
						value: {
							'text-align': 'right'
						}
					}
				}
			} );

			// Conversion for the `style[text-align]` attribue will be called twice.
			// - The first one comes from the AlignmentEditing plugin,
			// - The second one from the test.
			editor.setData( '<div style="text-align: right;">foo</div>' );

			// As we do not allow for the `alignment` attribute for the `div` element, we expect
			// that the `customAlignment` property will be set.
			expect( getModelData( editor.model, { withoutSelection: true } ) ).to.equal( '<div customAlignment="right">foo</div>' );
			expect( editor.getData() ).to.equal( '<div style="text-align:right;">foo</div>' );
		} );
	} );
} );
