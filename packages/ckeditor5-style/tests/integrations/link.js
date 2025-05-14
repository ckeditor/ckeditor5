/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Heading from '@ckeditor/ckeditor5-heading/src/heading.js';
import GeneralHtmlSupport from '@ckeditor/ckeditor5-html-support/src/generalhtmlsupport.js';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import Image from '@ckeditor/ckeditor5-image/src/image.js';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption.js';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote.js';
import Link from '@ckeditor/ckeditor5-link/src/link.js';
import { Bold } from '@ckeditor/ckeditor5-basic-styles';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { setData as setModelData, getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import LinkStyleSupport from '../../src/integrations/link.js';

import Style from '../../src/style.js';

describe( 'LinkStyleSupport', () => {
	let editor, editorElement, command, model;

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		await createEditor( [
			{
				name: 'A style',
				element: 'a',
				classes: [ 'a-styled' ]
			},
			{
				name: 'B style',
				element: 'b',
				classes: [ 'b-styled' ]
			}
		] );
	} );

	afterEach( async () => {
		editorElement.remove();
		await editor.destroy();
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( LinkStyleSupport.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( LinkStyleSupport.isPremiumPlugin ).to.be.false;
	} );

	describe( 'enabled styles', () => {
		describe( 'collapsed selection', () => {
			it( 'Link style should be enabled for the selection in the link', () => {
				setModelData( model,
					'<paragraph>' +
						'before ' +
						'<$text linkHref="123">foo[]bar</$text>' +
						'after' +
					'</paragraph>'
				);

				command.refresh();

				expect( command.enabledStyles ).to.have.members( [ 'A style', 'B style' ] );
				expect( command.value ).to.be.empty;
			} );

			it( 'Link style should not be enabled for the selection outside the link', () => {
				setModelData( model,
					'<paragraph>' +
						'bef[]ore ' +
						'<$text linkHref="123">foobar</$text>' +
						'after' +
					'</paragraph>'
				);

				command.refresh();

				expect( command.enabledStyles ).to.have.members( [ 'B style' ] );
				expect( command.value ).to.be.empty;
			} );

			it( 'Link style should be enabled for the selection at the beginning of a link (selection gravity override)', () => {
				setModelData( model,
					'<paragraph>' +
						'before ' +
						'[]<$text linkHref="123">foobar</$text>' +
						'after' +
					'</paragraph>'
				);

				model.change( writer => writer.overrideSelectionGravity() );

				expect( command.enabledStyles ).to.have.members( [ 'A style', 'B style' ] );
				expect( command.value ).to.be.empty;
			} );

			it( 'Link style should not be enabled for the selection at the beginning of a link (default selection gravity)', () => {
				setModelData( model,
					'<paragraph>' +
						'before ' +
						'[]<$text linkHref="123">foobar</$text>' +
						'after' +
					'</paragraph>'
				);

				command.refresh();

				expect( command.enabledStyles ).to.have.members( [ 'B style' ] );
				expect( command.value ).to.be.empty;
			} );

			it( 'Link style should be enabled for the selection at the end of a link (default selection gravity override)', () => {
				setModelData( model,
					'<paragraph>' +
						'before ' +
						'<$text linkHref="123">foobar</$text>[]' +
						'after' +
					'</paragraph>'
				);

				command.refresh();

				expect( command.enabledStyles ).to.have.members( [ 'A style', 'B style' ] );
				expect( command.value ).to.be.empty;
			} );

			it( 'Link style should not be enabled for the selection at the end of a link (selection gravity override)', () => {
				setModelData( model,
					'<paragraph>' +
						'before ' +
						'<$text linkHref="123">foobar</$text>[]' +
						'after' +
					'</paragraph>'
				);

				model.change( writer => writer.overrideSelectionGravity() );

				expect( command.enabledStyles ).to.have.members( [ 'B style' ] );
				expect( command.value ).to.be.empty;
			} );

			it( 'Link style should be enabled for the selection in bolded link', () => {
				setModelData( model,
					'<paragraph>' +
						'before ' +
						'<$text linkHref="123" bold="true">foo[]bar</$text>' +
						'after' +
					'</paragraph>'
				);

				command.refresh();

				expect( command.enabledStyles ).to.have.members( [ 'A style', 'B style' ] );
				expect( command.value ).to.be.empty;
			} );

			it( 'Link style should not be enabled for the selection in bolded text', () => {
				setModelData( model,
					'<paragraph>' +
						'before ' +
						'<$text bold="true">foo[]bar</$text>' +
						'after' +
					'</paragraph>'
				);

				command.refresh();

				expect( command.enabledStyles ).to.have.members( [ 'B style' ] );
				expect( command.value ).to.be.empty;
			} );
		} );

		describe( 'non-collapsed selection', () => {
			it( 'Link style should be enabled for the selection in the link', () => {
				setModelData( model,
					'<paragraph>' +
						'before ' +
						'<$text linkHref="123">fo[ob]ar</$text>' +
						'after' +
					'</paragraph>'
				);

				command.refresh();

				expect( command.enabledStyles ).to.have.members( [ 'A style', 'B style' ] );
				expect( command.value ).to.be.empty;
			} );

			it( 'Link style should be enabled for the selection on the link', () => {
				setModelData( model,
					'<paragraph>' +
						'before ' +
						'<$text linkHref="123">[foobar]</$text>' +
						'after' +
					'</paragraph>'
				);

				command.refresh();

				expect( command.enabledStyles ).to.have.members( [ 'A style', 'B style' ] );
				expect( command.value ).to.be.empty;
			} );

			it( 'Link style should be enabled for the selection on na inline widget', () => {
				setModelData( model,
					'<paragraph>' +
						'before ' +
						'[<imageInline linkHref="123"></imageInline>]' +
						'after' +
					'</paragraph>'
				);

				command.refresh();

				expect( command.enabledStyles ).to.have.members( [ 'A style', 'B style' ] );
				expect( command.value ).to.be.empty;
			} );

			it( 'Link style should be enabled for the selection including a link', () => {
				setModelData( model,
					'<paragraph>' +
						'bef[ore ' +
						'<$text linkHref="123">foobar</$text>' +
						'af]ter' +
					'</paragraph>'
				);

				command.refresh();

				expect( command.enabledStyles ).to.have.members( [ 'A style', 'B style' ] );
				expect( command.value ).to.be.empty;
			} );

			it( 'Link style should be enabled for the selection including a link partly from start', () => {
				setModelData( model,
					'<paragraph>' +
						'bef[ore ' +
						'<$text linkHref="123">foo]bar</$text>' +
						'after' +
					'</paragraph>'
				);

				command.refresh();

				expect( command.enabledStyles ).to.have.members( [ 'A style', 'B style' ] );
				expect( command.value ).to.be.empty;
			} );

			it( 'Link style should be enabled for the selection including a link partly from end', () => {
				setModelData( model,
					'<paragraph>' +
						'before ' +
						'<$text linkHref="123">foo[bar</$text>' +
						'af]ter' +
					'</paragraph>'
				);

				command.refresh();

				expect( command.enabledStyles ).to.have.members( [ 'A style', 'B style' ] );
				expect( command.value ).to.be.empty;
			} );

			it( 'Link style should be enabled for the selection covering multiple links', () => {
				setModelData( model,
					'<paragraph>' +
						'before ' +
						'<$text linkHref="123">foo[bar</$text>' +
						'middle' +
						'<$text linkHref="abc">bar]foo</$text>' +
						'after' +
					'</paragraph>'
				);

				command.refresh();

				expect( command.enabledStyles ).to.have.members( [ 'A style', 'B style' ] );
				expect( command.value ).to.be.empty;
			} );

			it( 'Link style should be enabled for the selection covering multiple links (from outside)', () => {
				setModelData( model,
					'<paragraph>' +
						'bef[ore ' +
						'<$text linkHref="123">foobar</$text>' +
						'middle' +
						'<$text linkHref="abc">barfoo</$text>' +
						'af]ter' +
					'</paragraph>'
				);

				command.refresh();

				expect( command.enabledStyles ).to.have.members( [ 'A style', 'B style' ] );
				expect( command.value ).to.be.empty;
			} );

			it( 'Link style should be enabled for the selection covering multiple links (outside on the start)', () => {
				setModelData( model,
					'<paragraph>' +
						'bef[ore ' +
						'<$text linkHref="123">foobar</$text>' +
						'middle' +
						'<$text linkHref="abc">bar]foo</$text>' +
						'after' +
					'</paragraph>'
				);

				command.refresh();

				expect( command.enabledStyles ).to.have.members( [ 'A style', 'B style' ] );
				expect( command.value ).to.be.empty;
			} );

			it( 'Link style should be enabled for the selection covering multiple links (outside on the end)', () => {
				setModelData( model,
					'<paragraph>' +
						'before ' +
						'<$text linkHref="123">foo[bar</$text>' +
						'middle' +
						'<$text linkHref="abc">barfoo</$text>' +
						'aft]er' +
					'</paragraph>'
				);

				command.refresh();

				expect( command.enabledStyles ).to.have.members( [ 'A style', 'B style' ] );
				expect( command.value ).to.be.empty;
			} );

			it( 'Link style should not be enabled for the selection outside link', () => {
				setModelData( model,
					'<paragraph>' +
						'before ' +
						'<$text linkHref="123">foobar</$text>' +
						'mi[dd]le' +
						'<$text linkHref="abc">barfoo</$text>' +
						'after' +
					'</paragraph>'
				);

				command.refresh();

				expect( command.enabledStyles ).to.have.members( [ 'B style' ] );
				expect( command.value ).to.be.empty;
			} );
		} );
	} );

	describe( 'active styles', () => {
		describe( 'collapsed selection', () => {
			it( 'Link style should be active for the selection in the link', () => {
				setModelData( model,
					'<paragraph>' +
						'before ' +
						`<$text linkHref="123" htmlA="${ ghsAttribute( { classes: [ 'a-styled' ] } ) }">foo[]bar</$text>` +
						'after' +
					'</paragraph>'
				);

				command.refresh();

				expect( command.value ).to.have.members( [ 'A style' ] );
			} );

			it( 'Link style should not be active for the selection outside the link', () => {
				setModelData( model,
					'<paragraph>' +
						'bef[]ore ' +
						'<$text linkHref="123" htmlA="${ ghsAttribute( { classes: [ \'a-styled\' ] } ) }">foobar</$text>' +
						'after' +
					'</paragraph>'
				);

				command.refresh();

				expect( command.value ).to.be.empty;
			} );

			it( 'Link style should be active for the selection at the beginning of a link (selection gravity override)', () => {
				setModelData( model,
					'<paragraph>' +
						'before ' +
						`[]<$text linkHref="123" htmlA="${ ghsAttribute( { classes: [ 'a-styled' ] } ) }">foobar</$text>` +
						'after' +
					'</paragraph>'
				);

				model.change( writer => writer.overrideSelectionGravity() );

				expect( command.value ).to.have.members( [ 'A style' ] );
			} );

			it( 'Link style should not be active for the selection at the beginning of a link (default selection gravity)', () => {
				setModelData( model,
					'<paragraph>' +
						'before ' +
						`[]<$text linkHref="123" htmlA="${ ghsAttribute( { classes: [ 'a-styled' ] } ) }">foobar</$text>` +
						'after' +
					'</paragraph>'
				);

				command.refresh();

				expect( command.value ).to.be.empty;
			} );

			it( 'Link style should be active for the selection at the end of a link (default selection gravity override)', () => {
				setModelData( model,
					'<paragraph>' +
						'before ' +
						`<$text linkHref="123" htmlA="${ ghsAttribute( { classes: [ 'a-styled' ] } ) }">foobar</$text>[]` +
						'after' +
					'</paragraph>'
				);

				command.refresh();

				expect( command.value ).to.have.members( [ 'A style' ] );
			} );

			it( 'Link style should not be active for the selection at the end of a link (selection gravity override)', () => {
				setModelData( model,
					'<paragraph>' +
						'before ' +
						`<$text linkHref="123" htmlA="${ ghsAttribute( { classes: [ 'a-styled' ] } ) }">foobar</$text>[]` +
						'after' +
					'</paragraph>'
				);

				model.change( writer => writer.overrideSelectionGravity() );

				expect( command.value ).to.be.empty;
			} );

			it( 'Link style should be active for the selection in bolded link', () => {
				setModelData( model,
					'<paragraph>' +
						'before ' +
						`<$text linkHref="123" bold="true" htmlA="${ ghsAttribute( { classes: [ 'a-styled' ] } ) }">foo[]bar</$text>` +
						'after' +
					'</paragraph>'
				);

				command.refresh();

				expect( command.value ).to.have.members( [ 'A style' ] );
			} );

			it( 'Link style should not be active for the selection in bolded text', () => {
				setModelData( model,
					'<paragraph>' +
						'before ' +
						'<$text bold="true">foo[]bar</$text>' +
						'after' +
					'</paragraph>'
				);

				command.refresh();

				expect( command.value ).to.be.empty;
			} );
		} );

		describe( 'non-collapsed selection', () => {
			it( 'Link style should be active for the selection in the link', () => {
				setModelData( model,
					'<paragraph>' +
						'before ' +
						`<$text linkHref="123" htmlA="${ ghsAttribute( { classes: [ 'a-styled' ] } ) }">fo[ob]ar</$text>` +
						'after' +
					'</paragraph>'
				);

				command.refresh();

				expect( command.value ).to.have.members( [ 'A style' ] );
			} );

			it( 'Link style should be active for the selection on the link', () => {
				setModelData( model,
					'<paragraph>' +
						'before ' +
						`<$text linkHref="123" htmlA="${ ghsAttribute( { classes: [ 'a-styled' ] } ) }">[foobar]</$text>` +
						'after' +
					'</paragraph>'
				);

				command.refresh();

				expect( command.value ).to.have.members( [ 'A style' ] );
			} );

			it( 'Link style should be active for the selection on na inline widget', () => {
				setModelData( model,
					'<paragraph>' +
						'before ' +
						`[<imageInline linkHref="123" htmlA="${ ghsAttribute( { classes: [ 'a-styled' ] } ) }"></imageInline>]` +
						'after' +
					'</paragraph>'
				);

				command.refresh();

				expect( command.value ).to.have.members( [ 'A style' ] );
			} );

			it( 'Link style should be active for the selection including a link', () => {
				setModelData( model,
					'<paragraph>' +
						'bef[ore ' +
						`<$text linkHref="123" htmlA="${ ghsAttribute( { classes: [ 'a-styled' ] } ) }">foobar</$text>` +
						'af]ter' +
					'</paragraph>'
				);

				command.refresh();

				expect( command.value ).to.have.members( [ 'A style' ] );
			} );

			it( 'Link style should be active for the selection including a link partly from start', () => {
				setModelData( model,
					'<paragraph>' +
						'bef[ore ' +
						`<$text linkHref="123" htmlA="${ ghsAttribute( { classes: [ 'a-styled' ] } ) }">foo]bar</$text>` +
						'after' +
					'</paragraph>'
				);

				command.refresh();

				expect( command.value ).to.have.members( [ 'A style' ] );
			} );

			it( 'Link style should be active for the selection including a link partly from end', () => {
				setModelData( model,
					'<paragraph>' +
						'before ' +
						`<$text linkHref="123" htmlA="${ ghsAttribute( { classes: [ 'a-styled' ] } ) }">foo[bar</$text>` +
						'af]ter' +
					'</paragraph>'
				);

				command.refresh();

				expect( command.value ).to.have.members( [ 'A style' ] );
			} );

			it( 'Link style should be active for the selection covering multiple links', () => {
				setModelData( model,
					'<paragraph>' +
						'before ' +
						`<$text linkHref="123" htmlA="${ ghsAttribute( { classes: [ 'a-styled' ] } ) }">foo[bar</$text>` +
						'middle' +
						`<$text linkHref="abc" htmlA="${ ghsAttribute( { classes: [ 'a-styled' ] } ) }">bar]foo</$text>` +
						'after' +
					'</paragraph>'
				);

				command.refresh();

				expect( command.value ).to.have.members( [ 'A style' ] );
			} );

			it( 'Link style should be active for the selection covering multiple links (from outside)', () => {
				setModelData( model,
					'<paragraph>' +
						'bef[ore ' +
						`<$text linkHref="123" htmlA="${ ghsAttribute( { classes: [ 'a-styled' ] } ) }">foobar</$text>` +
						'middle' +
						`<$text linkHref="abc" htmlA="${ ghsAttribute( { classes: [ 'a-styled' ] } ) }">barfoo</$text>` +
						'af]ter' +
					'</paragraph>'
				);

				command.refresh();

				expect( command.value ).to.have.members( [ 'A style' ] );
			} );

			it( 'Link style should be active for the selection covering multiple links (outside on the start)', () => {
				setModelData( model,
					'<paragraph>' +
						'bef[ore ' +
						`<$text linkHref="123" htmlA="${ ghsAttribute( { classes: [ 'a-styled' ] } ) }">foobar</$text>` +
						'middle' +
						`<$text linkHref="abc" htmlA="${ ghsAttribute( { classes: [ 'a-styled' ] } ) }">bar]foo</$text>` +
						'after' +
					'</paragraph>'
				);

				command.refresh();

				expect( command.value ).to.have.members( [ 'A style' ] );
			} );

			it( 'Link style should be active for the selection covering multiple links (outside on the end)', () => {
				setModelData( model,
					'<paragraph>' +
						'before ' +
						`<$text linkHref="123" htmlA="${ ghsAttribute( { classes: [ 'a-styled' ] } ) }">foo[bar</$text>` +
						'middle' +
						`<$text linkHref="abc" htmlA="${ ghsAttribute( { classes: [ 'a-styled' ] } ) }">barfoo</$text>` +
						'aft]er' +
					'</paragraph>'
				);

				command.refresh();

				expect( command.value ).to.have.members( [ 'A style' ] );
			} );

			it( 'Link style should be active for the selection covering multiple links (first has style)', () => {
				setModelData( model,
					'<paragraph>' +
						'before ' +
						`<$text linkHref="123" htmlA="${ ghsAttribute( { classes: [ 'a-styled' ] } ) }">foo[bar</$text>` +
						'middle' +
						'<$text linkHref="abc">barfoo</$text>' +
						'aft]er' +
					'</paragraph>'
				);

				command.refresh();

				expect( command.value ).to.have.members( [ 'A style' ] );
			} );

			it( 'Link style should not be active for the selection covering multiple links (second has style)', () => {
				setModelData( model,
					'<paragraph>' +
						'before ' +
						'<$text linkHref="123">foo[bar</$text>' +
						'middle' +
						`<$text linkHref="abc" htmlA="${ ghsAttribute( { classes: [ 'a-styled' ] } ) }">barfoo</$text>` +
						'aft]er' +
					'</paragraph>'
				);

				command.refresh();

				expect( command.value ).to.be.empty;
			} );

			it( 'Link style should not be active for the selection outside link', () => {
				setModelData( model,
					'<paragraph>' +
						'before ' +
						`<$text linkHref="123" htmlA="${ ghsAttribute( { classes: [ 'a-styled' ] } ) }">foobar</$text>` +
						'mi[dd]le' +
						`<$text linkHref="abc" htmlA="${ ghsAttribute( { classes: [ 'a-styled' ] } ) }">barfoo</$text>` +
						'after' +
					'</paragraph>'
				);

				command.refresh();

				expect( command.value ).to.be.empty;
			} );
		} );
	} );

	describe( 'apply style', () => {
		beforeEach( () => {
			sinon.stub( console, 'warn' );
		} );

		describe( 'collapsed selection', () => {
			it( 'Link style should be applied to the link with the selection in the link', () => {
				setModelData( model,
					'<paragraph>' +
						'before ' +
						'<$text linkHref="123">foo[]bar</$text>' +
						'after' +
					'</paragraph>'
				);

				command.refresh();

				expect( command.enabledStyles ).to.have.members( [ 'A style', 'B style' ] );
				expect( command.value ).to.be.empty;

				command.execute( { styleName: 'A style' } );

				expect( command.value ).to.have.members( [ 'A style' ] );
				expect( getModelData( model ) ).to.equal(
					'<paragraph>' +
						'before ' +
						'<$text htmlA="{"classes":["a-styled"]}" linkHref="123">foo[]bar</$text>' +
						'after' +
					'</paragraph>'
				);
			} );

			it( 'Link style should not be applied for the selection outside the link', () => {
				setModelData( model,
					'<paragraph>' +
						'bef[]ore ' +
						'<$text linkHref="123">foobar</$text>' +
						'after' +
					'</paragraph>'
				);

				command.refresh();

				expect( command.enabledStyles ).to.have.members( [ 'B style' ] );
				expect( command.value ).to.be.empty;

				command.execute( { styleName: 'A style' } );

				expect( command.value ).to.be.empty;
				expect( getModelData( model ) ).to.equal(
					'<paragraph>' +
						'bef[]ore ' +
						'<$text linkHref="123">foobar</$text>' +
						'after' +
					'</paragraph>'
				);
			} );

			it( 'Link style should be applied for the selection at the beginning of a link (selection gravity override)', () => {
				setModelData( model,
					'<paragraph>' +
						'before ' +
						'[]<$text linkHref="123">foobar</$text>' +
						'after' +
					'</paragraph>'
				);

				model.change( writer => writer.overrideSelectionGravity() );

				expect( command.enabledStyles ).to.have.members( [ 'A style', 'B style' ] );
				expect( command.value ).to.be.empty;

				command.execute( { styleName: 'A style' } );

				expect( command.value ).to.have.members( [ 'A style' ] );
				expect( getModelData( model ) ).to.equal(
					'<paragraph>' +
						'before ' +
						'<$text htmlA="{"classes":["a-styled"]}" linkHref="123">[]foobar</$text>' +
						'after' +
					'</paragraph>'
				);
			} );

			it( 'Link style should not be applied for the selection at the beginning of a link (default selection gravity)', () => {
				setModelData( model,
					'<paragraph>' +
						'before ' +
						'[]<$text linkHref="123">foobar</$text>' +
						'after' +
					'</paragraph>'
				);

				command.refresh();

				expect( command.enabledStyles ).to.have.members( [ 'B style' ] );
				expect( command.value ).to.be.empty;

				command.execute( { styleName: 'A style' } );

				expect( command.value ).to.be.empty;
				expect( getModelData( model ) ).to.equal(
					'<paragraph>' +
						'before ' +
						'[]<$text linkHref="123">foobar</$text>' +
						'after' +
					'</paragraph>'
				);
			} );

			it( 'Link style should be applied for the selection at the end of a link (default selection gravity override)', () => {
				setModelData( model,
					'<paragraph>' +
						'before ' +
						'<$text linkHref="123">foobar</$text>[]' +
						'after' +
					'</paragraph>'
				);

				command.refresh();

				expect( command.enabledStyles ).to.have.members( [ 'A style', 'B style' ] );
				expect( command.value ).to.be.empty;

				command.execute( { styleName: 'A style' } );

				expect( command.value ).to.have.members( [ 'A style' ] );
				expect( getModelData( model ) ).to.equal(
					'<paragraph>' +
						'before ' +
						'<$text htmlA="{"classes":["a-styled"]}" linkHref="123">foobar[]</$text>' +
						'after' +
					'</paragraph>'
				);
			} );

			it( 'Link style should not be applied for the selection at the end of a link (selection gravity override)', () => {
				setModelData( model,
					'<paragraph>' +
						'before ' +
						'<$text linkHref="123">foobar</$text>[]' +
						'after' +
					'</paragraph>'
				);

				model.change( writer => writer.overrideSelectionGravity() );

				expect( command.enabledStyles ).to.have.members( [ 'B style' ] );
				expect( command.value ).to.be.empty;

				command.execute( { styleName: 'A style' } );

				expect( command.value ).to.be.empty;
				expect( getModelData( model ) ).to.equal(
					'<paragraph>' +
						'before ' +
						'<$text linkHref="123">foobar</$text>[]' +
						'after' +
					'</paragraph>'
				);
			} );

			it( 'Link style should be applied for the selection in bolded link', () => {
				setModelData( model,
					'<paragraph>' +
						'before ' +
						'<$text linkHref="123" bold="true">foo[]bar</$text>' +
						'after' +
					'</paragraph>'
				);

				command.refresh();

				expect( command.enabledStyles ).to.have.members( [ 'A style', 'B style' ] );
				expect( command.value ).to.be.empty;

				command.execute( { styleName: 'A style' } );

				expect( command.value ).to.have.members( [ 'A style' ] );
				expect( getModelData( model ) ).to.equal(
					'<paragraph>' +
						'before ' +
						'<$text bold="true" htmlA="{"classes":["a-styled"]}" linkHref="123">foo[]bar</$text>' +
						'after' +
					'</paragraph>'
				);
			} );

			it( 'Link style should not be applied for the selection in bolded text', () => {
				setModelData( model,
					'<paragraph>' +
						'before ' +
						'<$text bold="true">foo[]bar</$text>' +
						'after' +
					'</paragraph>'
				);

				command.refresh();

				expect( command.enabledStyles ).to.have.members( [ 'B style' ] );
				expect( command.value ).to.be.empty;

				command.execute( { styleName: 'A style' } );

				expect( command.value ).to.be.empty;
				expect( getModelData( model ) ).to.equal(
					'<paragraph>' +
						'before ' +
						'<$text bold="true">foo[]bar</$text>' +
						'after' +
					'</paragraph>'
				);
			} );
		} );

		describe( 'non-collapsed selection', () => {
			it( 'Link style should be applied for the selection in the link', () => {
				setModelData( model,
					'<paragraph>' +
						'before ' +
						'<$text linkHref="123">fo[ob]ar</$text>' +
						'after' +
					'</paragraph>'
				);

				command.refresh();

				expect( command.enabledStyles ).to.have.members( [ 'A style', 'B style' ] );
				expect( command.value ).to.be.empty;

				command.execute( { styleName: 'A style' } );

				expect( command.value ).to.have.members( [ 'A style' ] );
				expect( getModelData( model ) ).to.equal(
					'<paragraph>' +
						'before ' +
						'<$text htmlA="{"classes":["a-styled"]}" linkHref="123">fo[ob]ar</$text>' +
						'after' +
					'</paragraph>'
				);
			} );

			it( 'Link style should be applied for the selection on the link', () => {
				setModelData( model,
					'<paragraph>' +
					'before ' +
					'<$text linkHref="123">[foobar]</$text>' +
					'after' +
					'</paragraph>'
				);

				command.refresh();

				expect( command.enabledStyles ).to.have.members( [ 'A style', 'B style' ] );
				expect( command.value ).to.be.empty;

				command.execute( { styleName: 'A style' } );

				expect( command.value ).to.have.members( [ 'A style' ] );
				expect( getModelData( model ) ).to.equal(
					'<paragraph>' +
						'before ' +
						'[<$text htmlA="{"classes":["a-styled"]}" linkHref="123">foobar</$text>]' +
						'after' +
					'</paragraph>'
				);
			} );

			it( 'Link style should be applied for the selection on na inline widget', () => {
				setModelData( model,
					'<paragraph>' +
						'before ' +
						'[<imageInline linkHref="123"></imageInline>]' +
						'after' +
					'</paragraph>'
				);

				command.refresh();

				expect( command.enabledStyles ).to.have.members( [ 'A style', 'B style' ] );
				expect( command.value ).to.be.empty;

				command.execute( { styleName: 'A style' } );

				expect( command.value ).to.have.members( [ 'A style' ] );
				expect( getModelData( model ) ).to.equal(
					'<paragraph>' +
						'before ' +
						'[<imageInline htmlA="{"classes":["a-styled"]}" linkHref="123"></imageInline>]' +
						'after' +
					'</paragraph>'
				);
			} );

			it( 'Link style should be applied for the selection including a link', () => {
				setModelData( model,
					'<paragraph>' +
						'bef[ore ' +
						'<$text linkHref="123">foobar</$text>' +
						'af]ter' +
					'</paragraph>'
				);

				command.refresh();

				expect( command.enabledStyles ).to.have.members( [ 'A style', 'B style' ] );
				expect( command.value ).to.be.empty;

				command.execute( { styleName: 'A style' } );

				expect( command.value ).to.have.members( [ 'A style' ] );
				expect( getModelData( model ) ).to.equal(
					'<paragraph>' +
						'bef[ore ' +
						'<$text htmlA="{"classes":["a-styled"]}" linkHref="123">foobar</$text>' +
						'af]ter' +
					'</paragraph>'
				);
			} );

			it( 'Link style should be applied for the selection including a link partly from start', () => {
				setModelData( model,
					'<paragraph>' +
						'bef[ore ' +
						'<$text linkHref="123">foo]bar</$text>' +
						'after' +
					'</paragraph>'
				);

				command.refresh();

				expect( command.enabledStyles ).to.have.members( [ 'A style', 'B style' ] );
				expect( command.value ).to.be.empty;

				command.execute( { styleName: 'A style' } );

				expect( command.value ).to.have.members( [ 'A style' ] );
				expect( getModelData( model ) ).to.equal(
					'<paragraph>' +
						'bef[ore ' +
						'<$text htmlA="{"classes":["a-styled"]}" linkHref="123">foo]bar</$text>' +
						'after' +
					'</paragraph>'
				);
			} );

			it( 'Link style should be applied for the selection including a link partly from end', () => {
				setModelData( model,
					'<paragraph>' +
						'before ' +
						'<$text linkHref="123">foo[bar</$text>' +
						'af]ter' +
					'</paragraph>'
				);

				command.refresh();

				expect( command.enabledStyles ).to.have.members( [ 'A style', 'B style' ] );
				expect( command.value ).to.be.empty;

				command.execute( { styleName: 'A style' } );

				expect( command.value ).to.have.members( [ 'A style' ] );
				expect( getModelData( model ) ).to.equal(
					'<paragraph>' +
						'before ' +
						'<$text htmlA="{"classes":["a-styled"]}" linkHref="123">foo[bar</$text>' +
						'af]ter' +
					'</paragraph>'
				);
			} );

			it( 'Link style should be applied for the selection covering multiple links', () => {
				setModelData( model,
					'<paragraph>' +
						'before ' +
						'<$text linkHref="123">foo[bar</$text>' +
						'middle' +
						'<$text linkHref="abc">bar]foo</$text>' +
						'after' +
					'</paragraph>'
				);

				command.refresh();

				expect( command.enabledStyles ).to.have.members( [ 'A style', 'B style' ] );
				expect( command.value ).to.be.empty;

				command.execute( { styleName: 'A style' } );

				expect( command.value ).to.have.members( [ 'A style' ] );
				expect( getModelData( model ) ).to.equal(
					'<paragraph>' +
						'before ' +
						'<$text htmlA="{"classes":["a-styled"]}" linkHref="123">foo[bar</$text>' +
						'middle' +
						'<$text htmlA="{"classes":["a-styled"]}" linkHref="abc">bar]foo</$text>' +
						'after' +
					'</paragraph>'
				);
			} );

			it( 'Link style should be applied for the selection covering multiple links (from outside)', () => {
				setModelData( model,
					'<paragraph>' +
						'bef[ore ' +
						'<$text linkHref="123">foobar</$text>' +
						'middle' +
						'<$text linkHref="abc">barfoo</$text>' +
						'af]ter' +
					'</paragraph>'
				);

				command.refresh();

				expect( command.enabledStyles ).to.have.members( [ 'A style', 'B style' ] );
				expect( command.value ).to.be.empty;

				command.execute( { styleName: 'A style' } );

				expect( command.value ).to.have.members( [ 'A style' ] );
				expect( getModelData( model ) ).to.equal(
					'<paragraph>' +
						'bef[ore ' +
						'<$text htmlA="{"classes":["a-styled"]}" linkHref="123">foobar</$text>' +
						'middle' +
						'<$text htmlA="{"classes":["a-styled"]}" linkHref="abc">barfoo</$text>' +
						'af]ter' +
					'</paragraph>'
				);
			} );

			it( 'Link style should be applied for the selection covering multiple links (outside on the start)', () => {
				setModelData( model,
					'<paragraph>' +
						'bef[ore ' +
						'<$text linkHref="123">foobar</$text>' +
						'middle' +
						'<$text linkHref="abc">bar]foo</$text>' +
						'after' +
					'</paragraph>'
				);

				command.refresh();

				expect( command.enabledStyles ).to.have.members( [ 'A style', 'B style' ] );
				expect( command.value ).to.be.empty;

				command.execute( { styleName: 'A style' } );

				expect( command.value ).to.have.members( [ 'A style' ] );
				expect( getModelData( model ) ).to.equal(
					'<paragraph>' +
						'bef[ore ' +
						'<$text htmlA="{"classes":["a-styled"]}" linkHref="123">foobar</$text>' +
						'middle' +
						'<$text htmlA="{"classes":["a-styled"]}" linkHref="abc">bar]foo</$text>' +
						'after' +
					'</paragraph>'
				);
			} );

			it( 'Link style should be applied for the selection covering multiple links (outside on the end)', () => {
				setModelData( model,
					'<paragraph>' +
						'before ' +
						'<$text linkHref="123">foo[bar</$text>' +
						'middle' +
						'<$text linkHref="abc">barfoo</$text>' +
						'aft]er' +
					'</paragraph>'
				);

				command.refresh();

				expect( command.enabledStyles ).to.have.members( [ 'A style', 'B style' ] );
				expect( command.value ).to.be.empty;

				command.execute( { styleName: 'A style' } );

				expect( command.value ).to.have.members( [ 'A style' ] );
				expect( getModelData( model ) ).to.equal(
					'<paragraph>' +
						'before ' +
						'<$text htmlA="{"classes":["a-styled"]}" linkHref="123">foo[bar</$text>' +
						'middle' +
						'<$text htmlA="{"classes":["a-styled"]}" linkHref="abc">barfoo</$text>' +
						'aft]er' +
					'</paragraph>'
				);
			} );

			it( 'Link style should be removed for the selection covering multiple links (first has style)', () => {
				setModelData( model,
					'<paragraph>' +
						'before ' +
						`<$text linkHref="123" htmlA="${ ghsAttribute( { classes: [ 'a-styled' ] } ) }">foo[bar</$text>` +
						'middle' +
						'<$text linkHref="abc">barfoo</$text>' +
						'aft]er' +
					'</paragraph>'
				);

				command.refresh();

				expect( command.value ).to.have.members( [ 'A style' ] );

				command.execute( { styleName: 'A style' } );

				expect( command.value ).to.be.empty;
				expect( getModelData( model ) ).to.equal(
					'<paragraph>' +
						'before ' +
						'<$text linkHref="123">foo[bar</$text>' +
						'middle' +
						'<$text linkHref="abc">barfoo</$text>' +
						'aft]er' +
					'</paragraph>'
				);
			} );

			it( 'Link style should be applied for the selection covering multiple links (second has style)', () => {
				setModelData( model,
					'<paragraph>' +
						'before ' +
						'<$text linkHref="123">foo[bar</$text>' +
						'middle' +
						`<$text linkHref="abc" htmlA="${ ghsAttribute( { classes: [ 'a-styled' ] } ) }">barfoo</$text>` +
						'aft]er' +
					'</paragraph>'
				);

				command.refresh();

				expect( command.value ).to.be.empty;

				command.execute( { styleName: 'A style' } );

				expect( command.value ).to.have.members( [ 'A style' ] );
				expect( getModelData( model ) ).to.equal(
					'<paragraph>' +
						'before ' +
						'<$text htmlA="{"classes":["a-styled"]}" linkHref="123">foo[bar</$text>' +
						'middle' +
						'<$text htmlA="{"classes":["a-styled"]}" linkHref="abc">barfoo</$text>' +
						'aft]er' +
					'</paragraph>'
				);
			} );

			it( 'Link style should not be applied for the selection outside link', () => {
				setModelData( model,
					'<paragraph>' +
						'before ' +
						'<$text linkHref="123">foobar</$text>' +
						'mi[dd]le' +
						'<$text linkHref="abc">barfoo</$text>' +
						'after' +
					'</paragraph>'
				);

				command.refresh();

				expect( command.enabledStyles ).to.have.members( [ 'B style' ] );
				expect( command.value ).to.be.empty;

				command.execute( { styleName: 'A style' } );

				expect( command.value ).to.be.empty;
				expect( getModelData( model ) ).to.equal(
					'<paragraph>' +
						'before ' +
						'<$text linkHref="123">foobar</$text>' +
						'mi[dd]le' +
						'<$text linkHref="abc">barfoo</$text>' +
						'after' +
					'</paragraph>'
				);
			} );

			it( 'bold style should be applied on the selection only', () => {
				setModelData( model,
					'<paragraph>' +
						'before ' +
						'<$text bold="true">foo[bar]</$text>' +
						'after' +
					'</paragraph>'
				);

				command.refresh();
				command.execute( { styleName: 'B style' } );

				expect( getModelData( model ) ).to.equal(
					'<paragraph>' +
						'before ' +
						'<$text bold="true">foo</$text>' +
						'[<$text bold="true" htmlB="{"classes":["b-styled"]}">bar</$text>]' +
						'after' +
					'</paragraph>'
				);
			} );

			it( 'link style should be applied on the whole link (partly bolded link)', () => {
				setModelData( model,
					'<paragraph>' +
						'before ' +
						'<$text linkHref="123">f[o]o</$text>' +
						'<$text bold="true" linkHref="123">bar</$text>' +
						'after' +
					'</paragraph>'
				);

				command.refresh();
				command.execute( { styleName: 'A style' } );

				expect( getModelData( model ) ).to.equal(
					'<paragraph>' +
						'before ' +
						'<$text htmlA="{"classes":["a-styled"]}" linkHref="123">f[o]o</$text>' +
						'<$text bold="true" htmlA="{"classes":["a-styled"]}" linkHref="123">bar</$text>' +
						'after' +
					'</paragraph>'
				);
			} );
		} );
	} );

	async function createEditor( styleDefinitions ) {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		editor = await ClassicTestEditor.create( editorElement, {
			plugins: [
				Paragraph, Image, ImageCaption, Heading, BlockQuote, Link, Bold, GeneralHtmlSupport, Style
			],
			style: {
				definitions: styleDefinitions
			}
		} );

		model = editor.model;
		command = editor.commands.get( 'style' );
	}

	function ghsAttribute( value ) {
		return JSON.stringify( value ).replace( /"/g, '&quot;' );
	}
} );
