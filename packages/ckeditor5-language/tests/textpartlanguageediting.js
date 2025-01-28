/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor.js';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view.js';

import TextPartLanguageEditing from '../src/textpartlanguageediting.js';
import TextPartLanguageCommand from '../src/textpartlanguagecommand.js';

describe( 'TextPartLanguageEditing', () => {
	let editor, model;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ TextPartLanguageEditing, Paragraph ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
			} );
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	it( 'should have pluginName', () => {
		expect( TextPartLanguageEditing.pluginName ).to.equal( 'TextPartLanguageEditing' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( TextPartLanguageEditing.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( TextPartLanguageEditing.isPremiumPlugin ).to.be.false;
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( TextPartLanguageEditing ) ).to.be.instanceOf( TextPartLanguageEditing );
	} );

	it( 'should set proper schema rules', () => {
		expect( model.schema.checkAttribute( [ '$root', '$block', '$text' ], 'language' ) ).to.be.true;
		expect( model.schema.checkAttribute( [ '$clipboardHolder', '$text' ], 'language' ) ).to.be.true;
	} );

	it( 'its attribute is marked with a copyOnEnter property', () => {
		expect( model.schema.getAttributeProperties( 'language' ) ).to.include( {
			copyOnEnter: true
		} );
	} );

	describe( 'command', () => {
		it( 'should register textPartLanguage command', () => {
			const command = editor.commands.get( 'textPartLanguage' );
			expect( command ).to.be.instanceOf( TextPartLanguageCommand );
		} );
	} );

	describe( 'data pipeline conversions', () => {
		it( 'should convert lang to language attribute', () => {
			editor.setData( '<p><span lang="fr">foo</span>bar</p>' );

			expect( getModelData( model, { withoutSelection: true } ) )
				.to.equal( '<paragraph><$text language="fr:ltr">foo</$text>bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p><span lang="fr" dir="ltr">foo</span>bar</p>' );
		} );

		it( 'should respect dir attribute', () => {
			editor.setData( '<p><span lang="fr" dir="rtl">foo</span>bar</p>' );

			expect( getModelData( model, { withoutSelection: true } ) )
				.to.equal( '<paragraph><$text language="fr:rtl">foo</$text>bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p><span lang="fr" dir="rtl">foo</span>bar</p>' );
		} );

		it( 'should be integrated with autoparagraphing', () => {
			editor.setData( '<span lang="fr">foo</span>bar' );

			expect( getModelData( model, { withoutSelection: true } ) )
				.to.equal( '<paragraph><$text language="fr:ltr">foo</$text>bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p><span lang="fr" dir="ltr">foo</span>bar</p>' );
		} );

		it( 'should respect nested element language ', () => {
			editor.setData( '<p><span dir="rtl" lang="he">hebrew<span dir="ltr" lang="fr">french</span>hebrew</span></p>' );

			expect( getModelData( model, { withoutSelection: true } ) )
				.to.equal( '<paragraph>' +
					'<$text language="he:rtl">hebrew</$text>' +
					'<$text language="fr:ltr">french</$text>' +
					'<$text language="he:rtl">hebrew</$text></paragraph>' );

			expect( editor.getData() ).to.equal( '<p>' +
				'<span lang="he" dir="rtl">hebrew</span>' +
				'<span lang="fr" dir="ltr">french</span>' +
				'<span lang="he" dir="rtl">hebrew</span></p>' );
		} );
	} );

	describe( 'editing pipeline conversion', () => {
		it( 'should convert attribute', () => {
			setModelData( model, '<paragraph><$text language="fr:ltr">foo</$text>bar</paragraph>' );

			expect( getViewData( editor.editing.view, { withoutSelection: true } ) )
				.to.equal( '<p><span dir="ltr" lang="fr">foo</span>bar</p>' );
		} );

		// #11538.
		// #11563.
		it( 'should not convert attribute set on other items than text', () => {
			editor.conversion.elementToElement( { view: 'fakeBlock', model: 'fakeBlock' } );
			model.schema.register( 'fakeBlock', { inheritAllFrom: '$block' } );

			setModelData( model, '<fakeBlock language="fr:ltr">foo</fakeBlock>' );

			expect( getViewData( editor.editing.view, { withoutSelection: true } ) )
				.to.equal( '<fakeBlock>foo</fakeBlock>' );
		} );

		// #11538.
		// #11563.
		it( 'should convert attribute set on document selection', () => {
			setModelData( model, '<paragraph>foo[]</paragraph>', {
				selectionAttributes: {
					language: 'fr:ltr'
				}
			} );

			expect( getViewData( editor.editing.view ) )
				.to.equal( '<p>foo<span dir="ltr" lang="fr">[]</span></p>' );
		} );
	} );

	describe( 'config', () => {
		it( 'should be set', () => {
			expect( editor.config.get( 'language.textPartLanguage' ) ).to.deep.equal( [
				{ title: 'Arabic', languageCode: 'ar' },
				{ title: 'French', languageCode: 'fr' },
				{ title: 'Spanish', languageCode: 'es' }
			] );
		} );

		it( 'should be customizable', async () => {
			const languageConfig = {
				ui: 'pl',
				content: 'pl',
				textPartLanguage: [
					{ title: 'Hebrew', languageCode: 'he' },
					{ title: 'Polish', languageCode: 'pl' }
				]
			};

			const customEditor = await VirtualTestEditor.create( {
				plugins: [ TextPartLanguageEditing ],
				language: languageConfig
			} );

			expect( customEditor.config.get( 'language' ) ).to.deep.equal( languageConfig );

			await customEditor.destroy();
		} );
	} );
} );
