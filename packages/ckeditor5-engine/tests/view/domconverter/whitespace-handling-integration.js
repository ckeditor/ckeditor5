/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import ImageInlineEditing from '@ckeditor/ckeditor5-image/src/image/imageinlineediting';
import ShiftEnter from '@ckeditor/ckeditor5-enter/src/shiftenter';

import { getData } from '../../../src/dev-utils/model';

// NOTE:
// dev utils' setData() loses white spaces so don't use it for tests here!!!
// https://github.com/ckeditor/ckeditor5-engine/issues/1428

describe( 'DomConverter – whitespace handling – integration', () => {
	let editor;

	// See https://github.com/ckeditor/ckeditor5-engine/issues/822.
	describe( 'normalizing whitespaces around block boundaries (#822)', () => {
		beforeEach( () => {
			return VirtualTestEditor
				.create( { plugins: [ Paragraph, ImageInlineEditing ] } )
				.then( newEditor => {
					editor = newEditor;

					editor.model.schema.extend( '$text', { allowAttributes: [ 'bold' ] } );
					editor.conversion.attributeToElement( { model: 'bold', view: 'b' } );
				} );
		} );

		afterEach( () => {
			return editor.destroy();
		} );

		it( 'new line at the end of the content is ignored', () => {
			editor.setData( '<p>foo</p>\n' );

			expect( getData( editor.model, { withoutSelection: true } ) )
				.to.equal( '<paragraph>foo</paragraph>' );

			expect( editor.getData() ).to.equal( '<p>foo</p>' );
		} );

		it( 'whitespaces at the end of the content are ignored', () => {
			editor.setData( '<p>foo</p>\n\r\n \t' );

			expect( getData( editor.model, { withoutSelection: true } ) )
				.to.equal( '<paragraph>foo</paragraph>' );

			expect( editor.getData() ).to.equal( '<p>foo</p>' );
		} );

		it( 'nbsp at the end of the content is not ignored', () => {
			editor.setData( '<p>foo&nbsp;</p>' );

			expect( getData( editor.model, { withoutSelection: true } ) )
				.to.equal( '<paragraph>foo </paragraph>' );

			expect( editor.getData() ).to.equal( '<p>foo&nbsp;</p>' );
		} );

		it( 'new line at the beginning of the content is ignored', () => {
			editor.setData( '\n<p>foo</p>' );

			expect( getData( editor.model, { withoutSelection: true } ) )
				.to.equal( '<paragraph>foo</paragraph>' );

			expect( editor.getData() ).to.equal( '<p>foo</p>' );
		} );

		it( 'whitespaces at the beginning of the content are ignored', () => {
			editor.setData( '\n\n \t<p>foo</p>' );

			expect( getData( editor.model, { withoutSelection: true } ) )
				.to.equal( '<paragraph>foo</paragraph>' );

			expect( editor.getData() ).to.equal( '<p>foo</p>' );
		} );

		it( 'nbsp at the beginning of the content is not ignored', () => {
			editor.setData( '<p>&nbsp;foo</p>' );

			expect( getData( editor.model, { withoutSelection: true } ) )
				.to.equal( '<paragraph> foo</paragraph>' );

			expect( editor.getData() ).to.equal( '<p>&nbsp;foo</p>' );
		} );

		it( 'new line between blocks is ignored', () => {
			editor.setData( '<p>foo</p>\n<p>bar</p>' );

			expect( getData( editor.model, { withoutSelection: true } ) )
				.to.equal( '<paragraph>foo</paragraph><paragraph>bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p>foo</p><p>bar</p>' );
		} );

		it( 'whitespaces between blocks are ignored', () => {
			editor.setData( '<p>foo</p>\n\n \t<p>bar</p>' );

			expect( getData( editor.model, { withoutSelection: true } ) )
				.to.equal( '<paragraph>foo</paragraph><paragraph>bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p>foo</p><p>bar</p>' );
		} );

		// Controversial result. See https://github.com/ckeditor/ckeditor5-engine/issues/987.
		it( 'nbsp between blocks is not ignored (between paragraphs)', () => {
			editor.setData( '<p>foo</p>&nbsp;<p>bar</p>' );

			expect( getData( editor.model, { withoutSelection: true } ) )
				.to.equal( '<paragraph>foo</paragraph><paragraph> </paragraph><paragraph>bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p>foo</p><p>&nbsp;</p><p>bar</p>' );
		} );

		it( 'nbsp between blocks is not ignored (different blocks)', () => {
			editor.model.schema.register( 'block', { inheritAllFrom: '$block' } );
			editor.conversion.elementToElement( { model: 'block', view: 'block' } );
			editor.setData( '<block>foo</block>&nbsp;<p>bar</p>' );

			expect( getData( editor.model, { withoutSelection: true } ) )
				.to.equal(
					'<block>foo</block>' +
					'<paragraph> </paragraph>' +
					'<paragraph>bar</paragraph>'
				);

			expect( editor.getData() )
				.to.equal(
					'<block>foo</block>' +
					'<p>&nbsp;</p>' +
					'<p>bar</p>'
				);
		} );

		it( 'new lines inside blocks are ignored', () => {
			editor.setData( '<p>\nfoo\n</p>' );

			expect( getData( editor.model, { withoutSelection: true } ) )
				.to.equal( '<paragraph>foo</paragraph>' );

			expect( editor.getData() ).to.equal( '<p>foo</p>' );
		} );

		it( 'whitespaces inside blocks are ignored', () => {
			editor.setData( '<p>\n\n \tfoo\n\n \t</p>' );

			expect( getData( editor.model, { withoutSelection: true } ) )
				.to.equal( '<paragraph>foo</paragraph>' );

			expect( editor.getData() ).to.equal( '<p>foo</p>' );
		} );

		it( 'nbsp inside blocks are not ignored', () => {
			editor.setData( '<p>&nbsp;foo&nbsp;</p>' );

			expect( getData( editor.model, { withoutSelection: true } ) )
				.to.equal( '<paragraph> foo </paragraph>' );

			expect( editor.getData() ).to.equal( '<p>&nbsp;foo&nbsp;</p>' );
		} );

		it( 'single nbsp inside blocks are ignored', () => {
			editor.setData( '<p>&nbsp;</p>' );

			expect( getData( editor.model, { withoutSelection: true } ) )
				.to.equal( '<paragraph></paragraph>' );

			expect( editor.getData() ).to.equal( '' ); // trimmed
		} );

		it( 'all whitespaces together are ignored', () => {
			editor.setData( '\n<p>foo\n\r\n \t</p>\n<p> bar</p>' );

			expect( getData( editor.model, { withoutSelection: true } ) )
				.to.equal( '<paragraph>foo</paragraph><paragraph>bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p>foo</p><p>bar</p>' );
		} );

		it( 'nbsp between inline elements is not ignored', () => {
			editor.setData( '<p><b>foo</b>&nbsp;<b>bar</b></p>' );

			expect( getData( editor.model, { withoutSelection: true } ) )
				.to.equal( '<paragraph><$text bold="true">foo</$text>\u00A0<$text bold="true">bar</$text></paragraph>' );

			expect( editor.getData() ).to.equal( '<p><b>foo</b>&nbsp;<b>bar</b></p>' );
		} );

		it( 'nbsp before inline element is not ignored', () => {
			editor.setData( '<p>&nbsp;<b>bar</b></p>' );

			expect( getData( editor.model, { withoutSelection: true } ) )
				.to.equal( '<paragraph> <$text bold="true">bar</$text></paragraph>' );

			expect( editor.getData() ).to.equal( '<p>&nbsp;<b>bar</b></p>' );
		} );

		it( 'nbsp after inline element is not ignored', () => {
			editor.setData( '<p><b>bar</b>&nbsp;</p>' );

			expect( getData( editor.model, { withoutSelection: true } ) )
				.to.equal( '<paragraph><$text bold="true">bar</$text> </paragraph>' );

			expect( editor.getData() ).to.equal( '<p><b>bar</b>&nbsp;</p>' );
		} );

		describe( 'around inline objects', () => {
			it( 'white space with text before empty inline object is not ignored', () => {
				editor.setData( '<p>foo <img src="/assets/sample.png"></p>' );

				expect( getData( editor.model, { withoutSelection: true } ) )
					.to.equal( '<paragraph>foo <imageInline src="/assets/sample.png"></imageInline></paragraph>' );

				expect( editor.getData() ).to.equal( '<p>foo <img src="/assets/sample.png"></p>' );
			} );

			it( 'white space with text after empty inline object is not ignored', () => {
				editor.setData( '<p><img src="/assets/sample.png" /> foo</p>' );

				expect( getData( editor.model, { withoutSelection: true } ) )
					.to.equal( '<paragraph><imageInline src="/assets/sample.png"></imageInline> foo</paragraph>' );

				expect( editor.getData() ).to.equal( '<p><img src="/assets/sample.png"> foo</p>' );
			} );

			it( 'white spaces with text around empty inline object are not ignored', () => {
				editor.setData( '<p>foo <img src="/assets/sample.png"> bar</p>' );

				expect( getData( editor.model, { withoutSelection: true } ) )
					.to.equal( '<paragraph>foo <imageInline src="/assets/sample.png"></imageInline> bar</paragraph>' );

				expect( editor.getData() ).to.equal( '<p>foo <img src="/assets/sample.png"> bar</p>' );
			} );

			it( 'white space before empty inline object is ignored', () => {
				editor.setData( '<p> <img src="/assets/sample.png"></p>' );

				expect( getData( editor.model, { withoutSelection: true } ) )
					.to.equal( '<paragraph><imageInline src="/assets/sample.png"></imageInline></paragraph>' );

				expect( editor.getData() ).to.equal( '<p><img src="/assets/sample.png"></p>' );
			} );

			it( 'white space after empty inline object is ignored', () => {
				editor.setData( '<p><img src="/assets/sample.png" /> </p>' );

				expect( getData( editor.model, { withoutSelection: true } ) )
					.to.equal( '<paragraph><imageInline src="/assets/sample.png"></imageInline></paragraph>' );

				expect( editor.getData() ).to.equal( '<p><img src="/assets/sample.png"></p>' );
			} );

			it( 'white spaces around empty inline object are ignored', () => {
				editor.setData( '<p> <img src="/assets/sample.png"> </p>' );

				expect( getData( editor.model, { withoutSelection: true } ) )
					.to.equal( '<paragraph><imageInline src="/assets/sample.png"></imageInline></paragraph>' );

				expect( editor.getData() ).to.equal( '<p><img src="/assets/sample.png"></p>' );
			} );

			it( 'nbsp before empty inline object is not ignored', () => {
				editor.setData( '<p>&nbsp;<img src="/assets/sample.png"></p>' );

				expect( getData( editor.model, { withoutSelection: true } ) )
					.to.equal( '<paragraph> <imageInline src="/assets/sample.png"></imageInline></paragraph>' );

				expect( editor.getData() ).to.equal( '<p>&nbsp;<img src="/assets/sample.png"></p>' );
			} );

			it( 'nbsp after empty inline object is not ignored', () => {
				editor.setData( '<p><img src="/assets/sample.png" />&nbsp;</p>' );

				expect( getData( editor.model, { withoutSelection: true } ) )
					.to.equal( '<paragraph><imageInline src="/assets/sample.png"></imageInline> </paragraph>' );

				expect( editor.getData() ).to.equal( '<p><img src="/assets/sample.png">&nbsp;</p>' );
			} );

			it( 'nbsp around empty inline object are not ignored', () => {
				editor.setData( '<p>&nbsp;<img src="/assets/sample.png">&nbsp;</p>' );

				expect( getData( editor.model, { withoutSelection: true } ) )
					.to.equal( '<paragraph> <imageInline src="/assets/sample.png"></imageInline> </paragraph>' );

				expect( editor.getData() ).to.equal( '<p>&nbsp;<img src="/assets/sample.png">&nbsp;</p>' );
			} );

			it( 'text+nbsp before empty inline object is not ignored', () => {
				editor.setData( '<p>foo&nbsp;<img src="/assets/sample.png"></p>' );

				expect( getData( editor.model, { withoutSelection: true } ) )
					.to.equal( '<paragraph>foo <imageInline src="/assets/sample.png"></imageInline></paragraph>' );

				expect( editor.getData() ).to.equal( '<p>foo <img src="/assets/sample.png"></p>' );
			} );

			it( 'nbsp+text after empty inline object is not ignored', () => {
				editor.setData( '<p><img src="/assets/sample.png" />&nbsp;foo</p>' );

				expect( getData( editor.model, { withoutSelection: true } ) )
					.to.equal( '<paragraph><imageInline src="/assets/sample.png"></imageInline> foo</paragraph>' );

				expect( editor.getData() ).to.equal( '<p><img src="/assets/sample.png"> foo</p>' );
			} );

			it( 'text+nbsp or nbsp+text around empty inline object are not ignored', () => {
				editor.setData( '<p>foo&nbsp;<img src="/assets/sample.png">&nbsp;bar</p>' );

				expect( getData( editor.model, { withoutSelection: true } ) )
					.to.equal( '<paragraph>foo <imageInline src="/assets/sample.png"></imageInline> bar</paragraph>' );

				expect( editor.getData() ).to.equal( '<p>foo <img src="/assets/sample.png"> bar</p>' );
			} );

			it( 'white space around (and inside) inline object elements should not be trimmed', () => {
				editor.model.schema.register( 'button', {
					allowWhere: '$text',
					isInline: true,
					allowChildren: [ '$text' ]
				} );

				editor.conversion.elementToElement( {
					model: 'button',
					view: 'button'
				} );

				editor.setData( '<p>foo <button> Button </button> bar</p>' );

				expect( getData( editor.model, { withoutSelection: true } ) )
					.to.equal( '<paragraph>foo <button> Button </button> bar</paragraph>' );

				expect( editor.getData() ).to.equal( '<p>foo <button> Button </button> bar</p>' );
			} );

			it( 'white spaces around (and inside) successive inline object elements should not be trimmed', () => {
				editor.model.schema.register( 'button', {
					allowWhere: '$text',
					isInline: true,
					allowChildren: [ '$text' ]
				} );

				editor.conversion.elementToElement( {
					model: 'button',
					view: 'button'
				} );

				editor.setData( '<p>foo <button> Button </button> <button> Another </button> bar</p>' );

				expect( getData( editor.model, { withoutSelection: true } ) )
					.to.equal( '<paragraph>foo <button> Button </button> <button> Another </button> bar</paragraph>' );

				expect( editor.getData() ).to.equal( '<p>foo <button> Button </button> <button> Another </button> bar</p>' );
			} );

			it( 'white spaces around (and inside) nested inline object elements should not be trimmed', () => {
				editor.model.schema.register( 'select', {
					allowWhere: '$text',
					isInline: true,
					allowChildren: [ 'optgroup' ],
					allowAttributes: [ 'name' ]
				} );

				editor.model.schema.register( 'optgroup', {
					allowWhere: 'select',
					isInline: true,
					allowChildren: [ 'option' ],
					allowAttributes: [ 'label' ]
				} );

				editor.model.schema.register( 'option', {
					allowWhere: 'optgroup',
					isInline: true,
					allowChildren: [ '$text' ],
					allowAttributes: [ 'value' ]
				} );

				editor.conversion.elementToElement( { model: 'select', view: 'select' } );
				editor.conversion.elementToElement( { model: 'optgroup', view: 'optgroup' } );
				editor.conversion.elementToElement( { model: 'option', view: 'option' } );
				editor.conversion.attributeToAttribute( { model: 'name', view: 'name' } );
				editor.conversion.attributeToAttribute( { model: 'label', view: 'label' } );
				editor.conversion.attributeToAttribute( { model: 'value', view: 'value' } );

				const initialData = '<p>select <select name="things">' +
						'<optgroup label="FoosAndBars">' +
							'<option value="foo"> Foo </option>' +
							'<option value="bar"> Bar </option>' +
						'</optgroup>' +
						'<optgroup label="letters">' +
							'<option value="a"> A </option>' +
							'<option value="b"> B </option>' +
						'</optgroup>' +
					'</select> with some text' +
				'</p>';

				editor.setData( initialData );

				expect( getData( editor.model, { withoutSelection: true } ) )
					.to.equal( '<paragraph>select ' +
						'<select name="things">' +
							'<optgroup label="FoosAndBars">' +
								'<option value="foo"> Foo </option>' +
								'<option value="bar"> Bar </option>' +
							'</optgroup>' +
							'<optgroup label="letters">' +
								'<option value="a"> A </option>' +
								'<option value="b"> B </option>' +
							'</optgroup>' +
						'</select>' +
					' with some text</paragraph>' );

				expect( editor.getData() ).to.equal( initialData );
			} );

			// All possible cases have been checked 👆. These are dummy tests only to verify this will work for all elements in the list.
			// Note: <img> is added by ImageInlineEditing plugin in the editor configuration.
			describe( 'detection of DomConverter#inlineObjectElements', () => {
				const elements = [
					'object', 'iframe', 'input', 'button', 'textarea', 'select', 'option', 'video', 'embed', 'audio', 'canvas'
				];

				// Singletons don't have $text children.
				const singletons = [ 'input', 'embed' ];

				for ( const name of elements ) {
					it( `should work for the <${ name }> element`, () => {
						editor.model.schema.register( name, {
							allowWhere: '$text',
							isInline: true,
							allowChildren: singletons.includes( name ) ? [] : [ '$text' ]
						} );

						editor.conversion.elementToElement( {
							model: name,
							view: name
						} );

						if ( singletons.includes( name ) ) {
							editor.setData( `<p>foo <${ name }> bar</p>` );

							expect( getData( editor.model, { withoutSelection: true } ) )
								.to.equal( `<paragraph>foo <${ name }></${ name }> bar</paragraph>` );

							expect( editor.getData() ).to.equal( `<p>foo <${ name }> bar</p>` );
						} else {
							editor.setData( `<p>foo <${ name }>foo</${ name }> bar</p>` );

							expect( getData( editor.model, { withoutSelection: true } ) )
								.to.equal( `<paragraph>foo <${ name }>foo</${ name }> bar</paragraph>` );

							expect( editor.getData() ).to.equal( `<p>foo <${ name }>foo</${ name }> bar</p>` );
						}
					} );
				}
			} );
		} );
	} );

	// https://github.com/ckeditor/ckeditor5/issues/1024
	describe( 'whitespaces around <br>s', () => {
		beforeEach( () => {
			return VirtualTestEditor
				.create( { plugins: [ Paragraph, ShiftEnter ] } )
				.then( newEditor => {
					editor = newEditor;
				} );
		} );

		afterEach( () => {
			return editor.destroy();
		} );

		it( 'single spaces around <br> #1', () => {
			editor.setData( '<p>foo&nbsp;<br>&nbsp;bar</p>' );

			expect( getData( editor.model, { withoutSelection: true } ) )
				.to.equal( '<paragraph>foo\u00A0<softBreak></softBreak> bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p>foo&nbsp;<br>&nbsp;bar</p>' );
		} );

		it( 'single spaces around <br> #2', () => {
			editor.setData( '<p>foo&nbsp;<br> bar</p>' );

			expect( getData( editor.model, { withoutSelection: true } ) )
				.to.equal( '<paragraph>foo\u00A0<softBreak></softBreak>bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p>foo&nbsp;<br>bar</p>' );
		} );

		it( 'two spaces before a <br>', () => {
			editor.setData( '<p>foo &nbsp;<br>bar</p>' );

			expect( getData( editor.model, { withoutSelection: true } ) )
				.to.equal( '<paragraph>foo  <softBreak></softBreak>bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p>foo &nbsp;<br>bar</p>' );
		} );

		it( 'two nbsps before a <br>', () => {
			editor.setData( '<p>foo&nbsp;&nbsp;<br>bar</p>' );

			expect( getData( editor.model, { withoutSelection: true } ) )
				.to.equal( '<paragraph>foo\u00a0 <softBreak></softBreak>bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p>foo&nbsp;&nbsp;<br>bar</p>' );
		} );

		it( 'single space after a <br>', () => {
			editor.setData( '<p>foo<br>&nbsp;bar</p>' );

			expect( getData( editor.model, { withoutSelection: true } ) )
				.to.equal( '<paragraph>foo<softBreak></softBreak> bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p>foo<br>&nbsp;bar</p>' );
		} );

		it( 'single space after a <br> (normalization)', () => {
			editor.setData( '<p>foo<br> bar</p>' );

			expect( getData( editor.model, { withoutSelection: true } ) )
				.to.equal( '<paragraph>foo<softBreak></softBreak>bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p>foo<br>bar</p>' );
		} );

		it( 'two spaces after a <br>', () => {
			editor.setData( '<p>foo<br>&nbsp; bar</p>' );

			expect( getData( editor.model, { withoutSelection: true } ) )
				.to.equal( '<paragraph>foo<softBreak></softBreak>  bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p>foo<br>&nbsp; bar</p>' );
		} );

		it( 'two spaces after a <br> (normalization)', () => {
			editor.setData( '<p>foo<br> &nbsp;bar</p>' );

			expect( getData( editor.model, { withoutSelection: true } ) )
				.to.equal( '<paragraph>foo<softBreak></softBreak> bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p>foo<br>&nbsp;bar</p>' );
		} );

		it( 'two spaces after a <br> (normalization to a model nbsp)', () => {
			editor.setData( '<p>foo<br>&nbsp;&nbsp;bar</p>' );

			expect( getData( editor.model, { withoutSelection: true } ) )
				.to.equal( '<paragraph>foo<softBreak></softBreak> \u00a0bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p>foo<br>&nbsp;&nbsp;bar</p>' );
		} );

		// https://github.com/ckeditor/ckeditor5-engine/issues/1429
		// it( 'space between <br>s', () => {
		// 	editor.setData( '<p>foo<br>&nbsp;<br>bar</p>' );

		// 	expect( getData( editor.model, { withoutSelection: true } ) )
		// 		.to.equal( '<paragraph>foo<softBreak></softBreak> <softBreak></softBreak>bar</paragraph>' );

		// 	expect( editor.getData() ).to.equal( '<p>foo<br>&nbsp;<br>bar</p>' );
		// } );

		it( 'space between <br>s (normalization)', () => {
			editor.setData( '<p>foo<br> <br>bar</p>' );

			expect( getData( editor.model, { withoutSelection: true } ) )
				.to.equal( '<paragraph>foo<softBreak></softBreak><softBreak></softBreak>bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p>foo<br><br>bar</p>' );
		} );

		it( 'two spaces between <br>s', () => {
			editor.setData( '<p>foo<br>&nbsp;&nbsp;<br>bar</p>' );

			expect( getData( editor.model, { withoutSelection: true } ) )
				.to.equal( '<paragraph>foo<softBreak></softBreak>  <softBreak></softBreak>bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p>foo<br>&nbsp;&nbsp;<br>bar</p>' );
		} );
	} );
} );
