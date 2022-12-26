/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import CodeBlock from '../../src/codeblock';
import CodeblockCaption from '../../src/codeblockcaption';
import CodeBlockEditing from '../../src/codeblockediting';
import CodeblockCaptionEditing from '../../src/codeblockcaption/codeblockcaptionediting';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

describe( 'ToggleCodeblockCaptionCommand', () => {
	let editor, model, command, element;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );
		return ClassicTestEditor
			.create( element, {
				language: 'en',
				plugins: [
					CodeBlock,
					CodeBlockEditing,
					CodeblockCaption,
					Paragraph
				]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;

				model.schema.register( 'nonCodeblock', {
					inheritAllFrom: '$block',
					isObject: true,
					allowIn: '$root'
				} );

				model.schema.extend( 'caption', { allowIn: 'nonCodeblock' } );

				editor.conversion.elementToElement( {
					model: 'nonCodeblock',
					view: 'nonCodeblock'
				} );

				editor.conversion.elementToElement( {
					model: 'caption',
					view: ( modelItem, { writer } ) => {
						if ( !modelItem.parent.is( 'element', 'nonCodeblock' ) ) {
							return null;
						}

						return writer.createContainerElement( 'figcaption' );
					}
				} );

				command = editor.commands.get( 'toggleCodeblockCaption' );
			} );
	} );

	afterEach( async () => {
		document.body.removeChild( element );
		return editor.destroy();
	} );

	describe( '#isEnabled', () => {
		it( 'should be false if the CodeblockCaption is not loaded', async () => {
			const element = document.createElement( 'div' );
			document.body.appendChild( element );

			const editor = await ClassicTestEditor
				.create( element, {
					plugins: [
						CodeBlock,
						CodeblockCaptionEditing,
						Paragraph
					]
				} );

			expect( editor.commands.get( 'toggleCodeblockCaption' ).isEnabled ).to.be.false;
			element.remove();
			return editor.destroy();
		} );

		it( 'should be false when no element is selected', () => {
			setModelData( model, '<paragraph>[]foo</paragraph>' );

			expect( command.isEnabled ).to.be.false;
		} );

		it( 'should be false when an element which is not codeblock is selected', () => {
			setModelData( model, '[<paragraph>foo</paragraph>]' );

			expect( command.isEnabled ).to.be.false;
		} );

		it( 'should be true when codeblock is selected', () => {
			setModelData( model, '[<codeBlock></codeBlock>]' );

			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be true when the selection is in the caption of an code', () => {
			setModelData( model, '<codeBlock><caption>[]</caption></codeBlock>' );

			expect( command.isEnabled ).to.be.true;
		} );

		it( 'should be false when the selection is in the caption of a non-Codeblock', () => {
			setModelData( model, '<nonCodeblock><caption>z[]xc</caption></nonCodeblock>' );

			expect( command.isEnabled ).to.be.false;
		} );

		it( 'should be false when there is more than an codeblock selected', () => {
			setModelData( model, '<paragraph>f[oo</paragraph><codeBlock></codeBlock><paragraph>b]ar</paragraph>' );

			expect( command.isEnabled ).to.be.false;
		} );
	} );

	describe( '#value', () => {
		it( 'should be false if the CodeblockCaption is not loaded', async () => {
			const element = document.createElement( 'div' );
			document.body.appendChild( element );

			const editor = await ClassicTestEditor
				.create( element, {
					plugins: [
						CodeBlock,
						CodeblockCaptionEditing,
						Paragraph
					]
				} );

			expect( editor.commands.get( 'toggleCodeblockCaption' ).value ).to.be.false;
			element.remove();
			return editor.destroy();
		} );

		it( 'should be false when no element is selected', () => {
			setModelData( model, '<paragraph>[]foo</paragraph>' );

			expect( command.value ).to.be.false;
		} );

		it( 'should be false when an element which is not codeblock is selected', () => {
			setModelData( model, '[<paragraph>foo</paragraph>]' );

			expect( command.value ).to.be.false;
		} );

		it( 'should be false when codeblock without caption is selected', () => {
			setModelData( model, '[<codeBlock></codeBlock>]' );

			expect( command.value ).to.be.false;
		} );

		it( 'should be true when code with an empty caption is selected', () => {
			setModelData( model, '[<codeBlock><caption></caption></codeBlock>]' );
			expect( command.value ).to.be.true;
		} );

		it( 'should be true when the selection is in the caption of an codeblock', () => {
			setModelData( model, '<codeBlock><caption>[]</caption></codeBlock>' );

			expect( command.value ).to.be.true;
		} );

		it( 'should be false when the selection is in the caption of a non-codeblock', () => {
			setModelData( model, '<nonCodeblock><caption>[]</caption></nonCodeblock>' );

			expect( command.value ).to.be.false;
		} );

		it( 'should be true when code with a non-empty caption is selected', () => {
			setModelData( model, '[<codeBlock><caption>foo</caption></codeBlock>]' );

			expect( command.value ).to.be.true;
		} );
	} );

	describe( 'execute()', () => {
		describe( 'for a block codeblock without a caption being selected', () => {
			it( 'should add an empty caption element to the codeblock', () => {
				setModelData( model, '[<codeBlock></codeBlock>]' );

				editor.execute( 'toggleCodeblockCaption' );

				expect( getModelData( model ) ).to.equal( '<codeBlock>[]<caption></caption></codeBlock>' );
			} );

			it( 'should add the caption element to the codeblock and attempt to restore its content', () => {
				setModelData( model, '[<codeBlock><caption>foo</caption></codeBlock>]' );

				editor.execute( 'toggleCodeblockCaption' );

				expect( getModelData( model ) ).to.equal( '<codeBlock>[]</codeBlock>' );

				editor.execute( 'toggleCodeblockCaption' );

				expect( getModelData( model ) ).to.equal( '<codeBlock>[]<caption>foo</caption></codeBlock>' );
			} );
		} );

		describe( 'for a block codeblock with a caption being selected', () => {
			it( 'should remove the caption from the codeblock and save it so it can be restored', () => {
				setModelData( model, '[<codeBlock><caption>foo</caption></codeBlock>]' );

				editor.execute( 'toggleCodeblockCaption' );

				expect( getModelData( model ) ).to.equal( '<codeBlock>[]</codeBlock>' );

				editor.execute( 'toggleCodeblockCaption' );

				expect( getModelData( model ) ).to.equal( '<codeBlock>[]<caption>foo</caption></codeBlock>' );
			} );

			it( 'should remove the caption from the codeblock and select the codeblock if the selection was in the caption element', () => {
				setModelData( model, '<codeBlock><caption>fo[]o</caption></codeBlock>' );

				editor.execute( 'toggleCodeblockCaption' );

				expect( getModelData( model ) ).to.equal( '<codeBlock>[]</codeBlock>' );

				editor.execute( 'toggleCodeblockCaption' );

				expect( getModelData( model ) ).to.equal( '<codeBlock>[]<caption>foo</caption></codeBlock>' );
			} );

			it( 'should save complex caption content and allow to restore it', () => {
				setModelData( model, '[<codeBlock><caption>foo<$text bold="true">bar</$text></caption></codeBlock>]' );

				editor.execute( 'toggleCodeblockCaption' );

				expect( getModelData( model ) ).to.equal( '<codeBlock>[]</codeBlock>' );

				editor.execute( 'toggleCodeblockCaption' );

				expect( getModelData( model ) ).to.equal(
					'<codeBlock>[]<caption>foo<$text bold="true">bar</$text></caption></codeBlock>'
				);
			} );

			it( 'should save the empty caption content', () => {
				setModelData( model, '[<codeBlock><caption>foo</caption></codeBlock>]' );

				editor.execute( 'toggleCodeblockCaption' );
				editor.execute( 'toggleCodeblockCaption' );

				const caption = model.document.getRoot().getChild( 0 ).getChild( 0 );

				model.change( writer => {
					writer.remove( writer.createRangeIn( caption ) );
				} );

				editor.execute( 'toggleCodeblockCaption' );
				editor.execute( 'toggleCodeblockCaption' );

				expect( getModelData( model ) ).to.equal( '<codeBlock>[]<caption></caption></codeBlock>' );
			} );
		} );

		describe( 'the focusCaptionOnShow option', () => {
			it( 'should move the selection to the caption when adding a caption (new empty caption)', () => {
				setModelData( model, '[<codeBlock></codeBlock>]' );

				editor.execute( 'toggleCodeblockCaption', { focusCaptionOnShow: true } );

				expect( getModelData( model ) ).to.equal( '<codeBlock><caption>[]</caption></codeBlock>' );
			} );

			it( 'should move the selection to the caption when restoring a caption', () => {
				setModelData( model, '[<codeBlock><caption>foo</caption></codeBlock>]' );

				editor.execute( 'toggleCodeblockCaption' );

				expect( getModelData( model ) ).to.equal( '<codeBlock>[]</codeBlock>' );

				editor.execute( 'toggleCodeblockCaption', { focusCaptionOnShow: true } );

				expect( getModelData( model ) ).to.equal( '<codeBlock><caption>[foo]</caption></codeBlock>' );
			} );

			it( 'should not change selection when caption is show up without focusCaptionOnShow option and tailing selection', () => {
				setModelData( model, '<codeBlock>foo[]bar</codeBlock>' );

				editor.execute( 'toggleCodeblockCaption' );

				expect( getModelData( model ) ).to.equal( '<codeBlock>foo[]bar<caption></caption></codeBlock>' );
			} );

			it( 'should not affect removal of the caption (selection in the caption)', () => {
				setModelData( model, '<codeBlock><caption>foo[]</caption></codeBlock>' );

				editor.execute( 'toggleCodeblockCaption', { focusCaptionOnShow: true } );

				expect( getModelData( model ) ).to.equal( '<codeBlock>[]</codeBlock>' );
			} );

			it( 'should not affect removal of the caption (selection on the codeblock)', () => {
				setModelData( model, '[<codeBlock><caption>foo</caption></codeBlock>]' );

				editor.execute( 'toggleCodeblockCaption', { focusCaptionOnShow: true } );

				expect( getModelData( model ) ).to.equal( '<codeBlock>[]</codeBlock>' );
			} );
		} );
	} );
} );
