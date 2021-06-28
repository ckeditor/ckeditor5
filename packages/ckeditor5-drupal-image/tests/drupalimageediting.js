/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

// import DrupalImageEditing from '../../src/imagecaption/imagecaptionediting';

import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
// import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import DrupalImageEditing from '../src/drupalimageediting';
import ImageCaptionEditing from '@ckeditor/ckeditor5-image/src/imagecaption/imagecaptionediting';
import ImageBlockEditing from '@ckeditor/ckeditor5-image/src/image/imageblockediting';

describe( 'DrupalImageEditing', () => {
	let editor, model; // , doc, view;

	// FakePlugin helps check if the plugin under test extends existing schema correctly.
	// class FakePlugin extends Plugin {
	// 	init() {
	// 		const schema = this.editor.model.schema;
	// 		const conversion = this.editor.conversion;

	// 		schema.register( 'foo', {
	// 			isObject: true,
	// 			isBlock: true,
	// 			allowWhere: '$block'
	// 		} );
	// 		schema.register( 'caption', {
	// 			allowIn: 'foo',
	// 			allowContentOf: '$block',
	// 			isLimit: true
	// 		} );

	// 		conversion.elementToElement( {
	// 			view: 'foo',
	// 			model: 'foo'
	// 		} );
	// 		conversion.elementToElement( {
	// 			view: 'caption',
	// 			model: 'caption'
	// 		} );
	// 	}
	// }

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [
				Paragraph,
				ImageBlockEditing,
				ImageCaptionEditing,
				DrupalImageEditing
			]
		} );

		model = editor.model;
		// doc = model.document;
		// view = editor.editing.view;
		// model.schema.register( 'widget' );
		// model.schema.extend( 'widget', { allowIn: '$root' } );
		// model.schema.extend( 'caption', { allowIn: 'widget' } );
		// model.schema.extend( '$text', { allowIn: 'widget' } );

		// editor.conversion.elementToElement( {
		// 	model: 'widget',
		// 	view: 'widget'
		// } );
	} );

	afterEach( async () => {
		return editor.destroy();
	} );

	it( 'should have pluginName', () => {
		expect( DrupalImageEditing.pluginName ).to.equal( 'DrupalImageEditing' );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( DrupalImageEditing ) ).to.be.instanceOf( DrupalImageEditing );
	} );

	describe( 'data pipeline', () => {
		describe( 'view to model (upcast)', () => {
			it.only( 'should convert figcaption inside image figure', () => {
				editor.setData(
					'<img alt="Alternative text" src="/drupal/image.jpg" data-caption="Some caption" data-align="right" />'
				);

				expect( getModelData( model, { withoutSelection: true } ) )
					.to.equal( '<imageBlock></imageBlock>' );
			} );

			it( 'should not add an empty caption if there is no figcaption', () => {
				editor.setData( '<figure class="image"><img src="/assets/sample.png" /></figure>' );

				expect( getModelData( model, { withoutSelection: true } ) )
					.to.equal( '<imageBlock src="/assets/sample.png"></imageBlock>' );
			} );

			it( 'should not convert figcaption inside other elements than image', () => {
				editor.setData( '<widget><figcaption>foobar</figcaption></widget>' );

				expect( getModelData( model, { withoutSelection: true } ) )
					.to.equal( '<widget>foobar</widget>' );
			} );
		} );

		describe( 'model to view (downcast)', () => {
			it( 'should convert caption element to figcaption', () => {
				setModelData( model, '<imageBlock src="img.png"><caption>Foo bar baz.</caption></imageBlock>' );

				expect( editor.getData() ).to.equal(
					'<figure class="image"><img src="img.png"><figcaption>Foo bar baz.</figcaption></figure>'
				);
			} );

			it( 'should not convert caption to figcaption if it\'s empty', () => {
				setModelData( model, '<imageBlock src="img.png"><caption></caption></imageBlock>' );

				expect( editor.getData() ).to.equal( '<figure class="image"><img src="img.png"><figcaption>&nbsp;</figcaption></figure>' );
			} );

			it( 'should not convert caption from other elements', () => {
				setModelData( model, '<widget>foo bar<caption></caption></widget>' );

				expect( editor.getData() ).to.equal( '<widget>foo bar</widget>' );
			} );
		} );
	} );
} );
