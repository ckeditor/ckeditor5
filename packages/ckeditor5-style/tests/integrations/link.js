/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import GeneralHtmlSupport from '@ckeditor/ckeditor5-html-support/src/generalhtmlsupport';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import ImageBlock from '@ckeditor/ckeditor5-image/src/imageblock';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import Link from '@ckeditor/ckeditor5-link/src/link';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import Style from '../../src/style';
import { Bold } from '@ckeditor/ckeditor5-basic-styles';

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
			} );
		} );
	} );

	describe( 'active styles', () => {
		beforeEach( () => {
			editor.setData(
				''
			);
		} );

		// it( 'OL style should be active for OL blocks (selection in the first list block)', () => {
		// 	model.change( writer => writer.setSelection( root.getChild( 1 ), 0 ) );
		// 	command.refresh();
		//
		// 	expect( command.value ).to.have.members( [ 'LI style', 'OL style' ] );
		// } );
	} );

	describe( 'apply style', () => {
		beforeEach( () => {
			editor.setData(
				''
			);
		} );

		// it( 'OL style should be applied to the whole list (without sublist)', () => {
		// 	model.change( writer => writer.setSelection( root.getChild( 1 ), 0 ) );
		// 	command.refresh();
		// 	command.execute( { styleName: 'OL style' } );
		//
		// 	expect( editor.getData() ).to.equal(
		// 		''
		// 	);
		// } );
	} );

	async function createEditor( styleDefinitions ) {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		editor = await ClassicTestEditor.create( editorElement, {
			plugins: [
				Paragraph, ImageBlock, ImageCaption, Heading, BlockQuote, Link, Bold, GeneralHtmlSupport, Style
			],
			style: {
				definitions: styleDefinitions
			}
		} );

		model = editor.model;
		command = editor.commands.get( 'style' );
	}
} );
