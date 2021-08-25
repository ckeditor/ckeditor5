/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import UndoEditing from '@ckeditor/ckeditor5-undo/src/undoediting';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import ImageCaptionEditing from '../../src/imagecaption/imagecaptionediting';
import ImageBlockEditing from '../../src/image/imageblockediting';
import ImageInlineEditing from '../../src/image/imageinlineediting';
import ToggleImageCaptionCommand from '../../src/imagecaption/toggleimagecaptioncommand';

import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

describe( 'ImageCaptionEditing', () => {
	let editor, model, doc, view;

	// FakePlugin helps check if the plugin under test extends existing schema correctly.
	class FakePlugin extends Plugin {
		init() {
			const schema = this.editor.model.schema;
			const conversion = this.editor.conversion;

			schema.register( 'foo', {
				isObject: true,
				isBlock: true,
				allowWhere: '$block'
			} );
			schema.register( 'caption', {
				allowIn: 'foo',
				allowContentOf: '$block',
				isLimit: true
			} );

			conversion.elementToElement( {
				view: 'foo',
				model: 'foo'
			} );
			conversion.elementToElement( {
				view: 'caption',
				model: 'caption'
			} );
		}
	}

	testUtils.createSinonSandbox();

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( {
			plugins: [
				ImageBlockEditing,
				ImageInlineEditing,
				ImageCaptionEditing,
				UndoEditing,
				Paragraph
			]
		} );

		model = editor.model;
		doc = model.document;
		view = editor.editing.view;
		model.schema.register( 'widget' );
		model.schema.extend( 'widget', { allowIn: '$root' } );
		model.schema.extend( 'caption', { allowIn: 'widget' } );
		model.schema.extend( '$text', { allowIn: 'widget' } );

		editor.conversion.elementToElement( {
			model: 'widget',
			view: 'widget'
		} );
	} );

	afterEach( async () => {
		return editor.destroy();
	} );

	it( 'should have pluginName', () => {
		expect( ImageCaptionEditing.pluginName ).to.equal( 'ImageCaptionEditing' );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( ImageCaptionEditing ) ).to.be.instanceOf( ImageCaptionEditing );
	} );

	describe( 'schema', () => {
		it( 'should set proper schema rules for caption', () => {
			expect( model.schema.checkChild( [ '$root', 'imageBlock' ], 'caption' ) ).to.be.true;
			expect( model.schema.checkChild( [ '$root', 'imageBlock', 'caption' ], '$text' ) ).to.be.true;
			expect( model.schema.isLimit( 'caption' ) ).to.be.true;

			expect( model.schema.checkChild( [ '$root', 'imageBlock', 'caption' ], 'caption' ) ).to.be.false;

			model.schema.extend( '$block', { allowAttributes: 'aligmnent' } );
			expect( model.schema.checkAttribute( [ '$root', 'imageBlock', 'caption' ], 'alignment' ) ).to.be.false;
		} );

		it( 'should not set rules for image when ImageBlockEditing is not loaded', async () => {
			const editor = await VirtualTestEditor.create( {
				plugins: [ ImageInlineEditing, ImageCaptionEditing ]
			} );

			expect( editor.model.schema.checkAttribute( [ '$root', 'imageBlock' ], 'caption' ) ).to.be.false;

			return editor.destroy();
		} );

		it( 'should not set rules for imageInline when ImageInlineEditing is not loaded', async () => {
			const editor = await VirtualTestEditor.create( {
				plugins: [ ImageBlockEditing, ImageCaptionEditing ]
			} );

			expect( editor.model.schema.checkAttribute( [ '$root', 'imageInline' ], 'caption' ) ).to.be.false;

			return editor.destroy();
		} );
	} );

	describe( 'command', () => {
		it( 'should register the toggleImageCaption command', () => {
			const command = editor.commands.get( 'toggleImageCaption' );

			expect( command ).to.be.instanceOf( ToggleImageCaptionCommand );
		} );
	} );

	it( 'should extend caption if schema for it is already registered', async () => {
		const { model } = await VirtualTestEditor
			.create( {
				plugins: [ FakePlugin, ImageCaptionEditing, ImageBlockEditing, ImageInlineEditing, UndoEditing, Paragraph ]
			} );

		expect( model.schema.isRegistered( 'caption' ) ).to.be.true;
		expect( model.schema.isLimit( 'caption' ) ).to.be.true;
		expect( model.schema.checkChild( [ 'imageBlock' ], 'caption' ) ).to.be.true;
	} );

	describe( 'data pipeline', () => {
		describe( 'view to model (upcast)', () => {
			it( 'should convert figcaption inside image figure', () => {
				editor.setData( '<figure class="image"><img src="/assets/sample.png" /><figcaption>foo bar</figcaption></figure>' );

				expect( getModelData( model, { withoutSelection: true } ) )
					.to.equal( '<imageBlock src="/assets/sample.png"><caption>foo bar</caption></imageBlock>' );
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

	describe( 'editing pipeline', () => {
		describe( 'model to view', () => {
			it( 'should convert caption element to figcaption contenteditable', () => {
				setModelData( model, '<imageBlock src="img.png"><caption>Foo bar baz.</caption></imageBlock>' );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<figure class="ck-widget image" contenteditable="false">' +
						'<img src="img.png"></img>' +
						'<figcaption class="ck-editor__editable ck-editor__nested-editable" ' +
							'contenteditable="true" data-placeholder="Enter image caption">' +
							'Foo bar baz.' +
						'</figcaption>' +
					'</figure>'
				);
			} );

			it( 'should not convert caption from other elements', () => {
				setModelData( model, '<widget>foo bar<caption></caption></widget>' );
				expect( getViewData( view, { withoutSelection: true } ) ).to.equal( '<widget>foo bar</widget>' );
			} );

			it( 'should not convert when element is already consumed', () => {
				editor.editing.downcastDispatcher.on(
					'insert:caption',
					( evt, data, conversionApi ) => {
						conversionApi.consumable.consume( data.item, 'insert' );

						const imageFigure = conversionApi.mapper.toViewElement( data.range.start.parent );
						const viewElement = conversionApi.writer.createAttributeElement( 'span' );

						const viewPosition = conversionApi.writer.createPositionAt( imageFigure, 'end' );
						conversionApi.mapper.bindElements( data.item, viewElement );
						conversionApi.writer.insert( viewPosition, viewElement );
					},
					{ priority: 'high' }
				);

				setModelData( model, '<imageBlock src="img.png"><caption>Foo bar baz.</caption></imageBlock>' );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<figure class="ck-widget image" contenteditable="false"><img src="img.png"></img><span></span>Foo bar baz.</figure>'
				);
			} );

			it( 'should show caption when something is inserted inside', () => {
				setModelData( model, '<paragraph>foo</paragraph><imageBlock src="img.png"><caption></caption></imageBlock>' );

				const image = doc.getRoot().getChild( 1 );
				const caption = image.getChild( 0 );

				model.change( writer => {
					writer.insertText( 'foo bar', caption );
				} );

				expect( getViewData( view ) ).to.equal(
					'<p>{}foo</p>' +
					'<figure class="ck-widget image" contenteditable="false">' +
						'<img src="img.png"></img>' +
						'<figcaption class="ck-editor__editable ck-editor__nested-editable" ' +
							'contenteditable="true" data-placeholder="Enter image caption">' +
							'foo bar' +
						'</figcaption>' +
					'</figure>'
				);
			} );

			it( 'should not hide when everything is removed from caption', () => {
				setModelData( model, '<paragraph>foo</paragraph><imageBlock src="img.png"><caption>foo bar baz</caption></imageBlock>' );

				const image = doc.getRoot().getChild( 1 );
				const caption = image.getChild( 0 );

				model.change( writer => {
					writer.remove( writer.createRangeIn( caption ) );
				} );

				expect( getViewData( view ) ).to.equal(
					'<p>{}foo</p>' +
					'<figure class="ck-widget image" contenteditable="false">' +
						'<img src="img.png"></img>' +
						'<figcaption class="ck-editor__editable ck-editor__nested-editable ck-placeholder" ' +
							'contenteditable="true" data-placeholder="Enter image caption">' +
						'</figcaption>' +
					'</figure>'
				);
			} );

			it( 'should show when not everything is removed from caption', () => {
				setModelData( model, '<paragraph>foo</paragraph><imageBlock src="img.png"><caption>foo bar baz</caption></imageBlock>' );

				const image = doc.getRoot().getChild( 1 );
				const caption = image.getChild( 0 );

				model.change( writer => {
					writer.remove( writer.createRange( writer.createPositionAt( caption, 0 ), writer.createPositionAt( caption, 8 ) ) );
				} );

				expect( getViewData( view ) ).to.equal(
					'<p>{}foo</p>' +
					'<figure class="ck-widget image" contenteditable="false">' +
						'<img src="img.png"></img>' +
						'<figcaption class="ck-editor__editable ck-editor__nested-editable" ' +
							'contenteditable="true" data-placeholder="Enter image caption">baz</figcaption>' +
					'</figure>'
				);
			} );

			it( 'should apply highlighting on figcaption', () => {
				editor.conversion.for( 'editingDowncast' ).markerToHighlight( {
					model: 'marker',
					view: data => ( {
						classes: 'highlight-' + data.markerName.split( ':' )[ 1 ],
						attributes: {
							'data-foo': data.markerName.split( ':' )[ 1 ]
						}
					} )
				} );

				setModelData( model, '<imageBlock src="img.png"><caption>Foo bar baz.</caption></imageBlock>' );

				const caption = doc.getRoot().getNodeByPath( [ 0, 0 ] );

				model.change( writer => {
					writer.addMarker( 'marker:yellow', {
						range: writer.createRangeOn( caption ),
						usingOperation: false
					} );
				} );

				const viewElement = editor.editing.mapper.toViewElement( caption );

				expect( viewElement.getCustomProperty( 'addHighlight' ) ).to.be.a( 'function' );
				expect( viewElement.getCustomProperty( 'removeHighlight' ) ).to.be.a( 'function' );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<figure class="ck-widget image" contenteditable="false">' +
						'<img src="img.png"></img>' +
						'<figcaption class="ck-editor__editable ck-editor__nested-editable highlight-yellow" ' +
								'contenteditable="true" data-foo="yellow" data-placeholder="Enter image caption">' +
							'Foo bar baz.' +
						'</figcaption>' +
					'</figure>'
				);

				model.change( writer => {
					writer.removeMarker( 'marker:yellow' );
				} );

				expect( getViewData( view, { withoutSelection: true } ) ).to.equal(
					'<figure class="ck-widget image" contenteditable="false">' +
						'<img src="img.png"></img>' +
						'<figcaption class="ck-editor__editable ck-editor__nested-editable" ' +
								'contenteditable="true" data-placeholder="Enter image caption">' +
							'Foo bar baz.' +
						'</figcaption>' +
					'</figure>'
				);
			} );
		} );
	} );

	describe( 'inserting image to the document', () => {
		it( 'should not add a caption element if image does not have it', () => {
			model.change( writer => {
				writer.insertElement( 'imageBlock', { src: '', alt: '' }, doc.getRoot() );
			} );

			expect( getModelData( model ) ).to.equal(
				'[<imageBlock alt="" src=""></imageBlock>]<paragraph></paragraph>'
			);

			expect( getViewData( view ) ).to.equal(
				'[<figure class="ck-widget image" contenteditable="false">' +
					'<img alt="" src=""></img>' +
				'</figure>]' +
				'<p></p>'
			);
		} );

		it( 'should not add a caption element if an image does not have it (image is nested in inserted element)', () => {
			model.change( writer => {
				model.schema.register( 'table', { allowWhere: '$block', isLimit: true, isObject: true, isBlock: true } );
				model.schema.register( 'tableRow', { allowIn: 'table', isLimit: true } );
				model.schema.register( 'tableCell', { allowIn: 'tableRow', isLimit: true, isSelectable: true } );
				model.schema.extend( '$block', { allowIn: 'tableCell' } );
				editor.conversion.for( 'downcast' ).elementToElement( { model: 'table', view: 'table' } );
				editor.conversion.for( 'downcast' ).elementToElement( { model: 'tableRow', view: 'tr' } );
				editor.conversion.for( 'downcast' ).elementToElement( { model: 'tableCell', view: 'td' } );

				const table = writer.createElement( 'table' );
				const tableRow = writer.createElement( 'tableRow' );
				const tableCell1 = writer.createElement( 'tableCell' );
				const tableCell2 = writer.createElement( 'tableCell' );
				const image1 = writer.createElement( 'imageBlock', { src: '', alt: '' } );
				const image2 = writer.createElement( 'imageBlock', { src: '', alt: '' } );

				writer.insert( tableRow, table );
				writer.insert( tableCell1, tableRow );
				writer.insert( tableCell2, tableRow );
				writer.insert( image1, tableCell1 );
				writer.insert( image2, tableCell2 );
				writer.insert( table, doc.getRoot() );
			} );

			expect( getModelData( model ) ).to.equal(
				'[<table>' +
					'<tableRow>' +
						'<tableCell><imageBlock alt="" src=""></imageBlock></tableCell>' +
						'<tableCell><imageBlock alt="" src=""></imageBlock></tableCell>' +
					'</tableRow>' +
				'</table>]' +
				'<paragraph></paragraph>'
			);

			expect( getViewData( view ) ).to.equal(
				'[<table>' +
					'<tr>' +
						'<td>' +
							'<figure class="ck-widget image" contenteditable="false">' +
								'<img alt="" src=""></img>' +
							'</figure>' +
						'</td>' +
						'<td>' +
							'<figure class="ck-widget image" contenteditable="false">' +
								'<img alt="" src=""></img>' +
							'</figure>' +
						'</td>' +
					'</tr>' +
				'</table>]' +
				'<p></p>'
			);
		} );

		it( 'should not add caption element if image already have it', () => {
			model.change( writer => {
				const caption = writer.createElement( 'caption' );
				const image = writer.createElement( 'imageBlock', { src: '', alt: '' } );

				writer.insertText( 'foo bar', caption );
				writer.insert( caption, image );
				writer.insert( image, doc.getRoot() );
			} );

			expect( getModelData( model ) ).to.equal(
				'[<imageBlock alt="" src=""><caption>foo bar</caption></imageBlock>]<paragraph></paragraph>'
			);

			expect( getViewData( view ) ).to.equal(
				'[<figure class="ck-widget image" contenteditable="false">' +
					'<img alt="" src=""></img>' +
					'<figcaption class="ck-editor__editable ck-editor__nested-editable" ' +
						'contenteditable="true" data-placeholder="Enter image caption">' +
						'foo bar' +
					'</figcaption>' +
				'</figure>]' +
				'<p></p>'
			);
		} );

		it( 'should not add caption element twice', () => {
			model.change( writer => {
				const image = writer.createElement( 'imageBlock', { src: '', alt: '' } );
				const caption = writer.createElement( 'caption' );

				// Since we are adding an empty image, this should trigger caption fixer.
				writer.insert( image, doc.getRoot() );

				// Add caption just after the image is inserted, in same batch.
				writer.insert( caption, image );
			} );

			// Check whether caption fixer added redundant caption.
			expect( getModelData( model ) ).to.equal(
				'[<imageBlock alt="" src=""><caption></caption></imageBlock>]<paragraph></paragraph>'
			);

			expect( getViewData( view ) ).to.equal(
				'[<figure class="ck-widget image" contenteditable="false">' +
					'<img alt="" src=""></img>' +
					'<figcaption class="ck-editor__editable ck-editor__nested-editable ck-placeholder" ' +
						'contenteditable="true" data-placeholder="Enter image caption"></figcaption>' +
				'</figure>]' +
				'<p></p>'
			);
		} );

		it( 'should do nothing for other changes than insert', () => {
			setModelData( model, '<imageBlock src=""><caption>foo bar</caption></imageBlock>' );

			const image = doc.getRoot().getChild( 0 );

			model.change( writer => {
				writer.setAttribute( 'alt', 'alt text', image );
			} );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<imageBlock alt="alt text" src=""><caption>foo bar</caption></imageBlock>'
			);
		} );

		it( 'should do nothing on $text insert', () => {
			setModelData( model, '<imageBlock src=""><caption>foo bar</caption></imageBlock><paragraph>[]</paragraph>' );

			const paragraph = doc.getRoot().getChild( 1 );

			// Simulate typing behavior - second input will generate input change without entry.item in change entry.
			const batch = model.createBatch();

			model.enqueueChange( batch, writer => {
				writer.insertText( 'f', paragraph, 0 );
			} );

			model.enqueueChange( batch, writer => {
				writer.insertText( 'oo', paragraph, 1 );
			} );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal(
				'<imageBlock src=""><caption>foo bar</caption></imageBlock><paragraph>foo</paragraph>'
			);
		} );
	} );

	describe( 'editing view', () => {
		it( 'image should have empty figcaption element when is selected', () => {
			setModelData( model, '<paragraph>foo</paragraph>[<imageBlock src=""><caption></caption></imageBlock>]' );

			expect( getViewData( view ) ).to.equal(
				'<p>foo</p>' +
				'[<figure class="ck-widget image" contenteditable="false">' +
					'<img src=""></img>' +
					'<figcaption class="ck-editor__editable ck-editor__nested-editable ck-placeholder" ' +
						'contenteditable="true" data-placeholder="Enter image caption">' +
					'</figcaption>' +
				'</figure>]'
			);
		} );

		it( 'image should have empty figcaption element when not selected', () => {
			setModelData( model, '<paragraph>[]foo</paragraph><imageBlock src=""><caption></caption></imageBlock>' );

			expect( getViewData( view ) ).to.equal(
				'<p>{}foo</p>' +
				'<figure class="ck-widget image" contenteditable="false">' +
					'<img src=""></img>' +
					'<figcaption class="ck-editor__editable ck-editor__nested-editable ck-placeholder" ' +
						'contenteditable="true" data-placeholder="Enter image caption">' +
					'</figcaption>' +
				'</figure>'
			);
		} );

		it( 'should keep the placeholder visible when the figcaption is focused', () => {
			setModelData( model, '<paragraph>foo</paragraph>[<imageBlock src=""></imageBlock>]' );

			editor.execute( 'toggleImageCaption' );

			expect( getViewData( view ) ).to.equal(
				'<p>foo</p>' +
				'[<figure class="ck-widget image" contenteditable="false">' +
					'<img src=""></img>' +
					'<figcaption class="ck-editor__editable ck-editor__nested-editable ck-placeholder" ' +
						'contenteditable="true" data-placeholder="Enter image caption">' +
					'</figcaption>' +
				'</figure>]'
			);

			const caption = doc.getRoot().getNodeByPath( [ 1, 0 ] );

			editor.editing.view.document.isFocused = true;
			editor.focus();

			model.change( writer => {
				writer.setSelection( writer.createRangeIn( caption ) );
			} );

			expect( getViewData( view ) ).to.equal(
				'<p>foo</p>' +
				'<figure class="ck-widget image" contenteditable="false">' +
					'<img src=""></img>' +
					'<figcaption ' +
						'class="ck-editor__editable ck-editor__nested-editable ck-editor__nested-editable_focused ck-placeholder" ' +
						'contenteditable="true" data-placeholder="Enter image caption">[]' +
					'</figcaption>' +
				'</figure>'
			);
		} );

		it( 'should not add additional figcaption if one is already present', () => {
			setModelData( model, '<paragraph>foo</paragraph>[<imageBlock src=""><caption>foo bar</caption></imageBlock>]' );

			expect( getViewData( view ) ).to.equal(
				'<p>foo</p>' +
				'[<figure class="ck-widget image" contenteditable="false">' +
					'<img src=""></img>' +
					'<figcaption class="ck-editor__editable ck-editor__nested-editable" ' +
						'contenteditable="true" data-placeholder="Enter image caption">foo bar</figcaption>' +
				'</figure>]'
			);
		} );

		it( 'should not alter the figcaption when the caption is empty and the image is no longer selected', () => {
			setModelData( model, '<paragraph>foo</paragraph>[<imageBlock src=""><caption></caption></imageBlock>]' );

			model.change( writer => {
				writer.setSelection( null );
			} );

			expect( getViewData( view ) ).to.equal(
				'<p>{}foo</p>' +
				'<figure class="ck-widget image" contenteditable="false">' +
					'<img src=""></img>' +
					'<figcaption class="ck-editor__editable ck-editor__nested-editable ck-placeholder" ' +
						'contenteditable="true" data-placeholder="Enter image caption">' +
					'</figcaption>' +
				'</figure>'
			);
		} );

		it( 'should not remove figcaption when selection is inside it even when it is empty', () => {
			setModelData( model, '<imageBlock src=""><caption>[foo bar]</caption></imageBlock>' );

			model.change( writer => {
				writer.remove( doc.selection.getFirstRange() );
			} );

			expect( getViewData( view ) ).to.equal(
				'<figure class="ck-widget image" contenteditable="false">' +
					'<img src=""></img>' +
					'<figcaption class="ck-editor__editable ck-editor__nested-editable ck-placeholder" ' +
						'contenteditable="true" data-placeholder="Enter image caption">' +
						'[]' +
					'</figcaption>' +
				'</figure>'
			);
		} );

		it( 'should not remove figcaption when selection is moved from it to its image', () => {
			setModelData( model, '<imageBlock src=""><caption>[foo bar]</caption></imageBlock>' );
			const image = doc.getRoot().getChild( 0 );

			model.change( writer => {
				writer.remove( doc.selection.getFirstRange() );
				writer.setSelection( writer.createRangeOn( image ) );
			} );

			expect( getViewData( view ) ).to.equal(
				'[<figure class="ck-widget image" contenteditable="false">' +
					'<img src=""></img>' +
					'<figcaption class="ck-editor__editable ck-editor__nested-editable ck-placeholder" ' +
						'contenteditable="true" data-placeholder="Enter image caption"></figcaption>' +
				'</figure>]'
			);
		} );

		it( 'should not remove figcaption when selection is moved from it to other image', () => {
			setModelData( model, '<imageBlock src="">' +
				'<caption>[foo bar]</caption></imageBlock><imageBlock src=""><caption></caption>' +
			'</imageBlock>' );
			const image = doc.getRoot().getChild( 1 );

			model.change( writer => {
				writer.setSelection( writer.createRangeOn( image ) );
			} );

			expect( getViewData( view ) ).to.equal(
				'<figure class="ck-widget image" contenteditable="false">' +
					'<img src=""></img>' +
					'<figcaption class="ck-editor__editable ck-editor__nested-editable" ' +
						'contenteditable="true" data-placeholder="Enter image caption">foo bar</figcaption>' +
				'</figure>' +
				'[<figure class="ck-widget image" contenteditable="false">' +
					'<img src=""></img>' +
					'<figcaption class="ck-editor__editable ck-editor__nested-editable ck-placeholder" ' +
						'contenteditable="true" data-placeholder="Enter image caption"></figcaption>' +
				'</figure>]'
			);
		} );

		it( 'should show empty figcaption when image is selected but editor is in the readOnly mode', () => {
			editor.isReadOnly = true;

			setModelData( model, '[<imageBlock src="img.png"><caption></caption></imageBlock>]' );

			expect( getViewData( view ) ).to.equal(
				'[<figure class="ck-widget image" contenteditable="false">' +
					'<img src="img.png"></img>' +
					'<figcaption class="ck-editor__editable ck-editor__nested-editable ck-placeholder" ' +
						'contenteditable="false" data-placeholder="Enter image caption"></figcaption>' +
				'</figure>]'
			);
		} );

		describe( 'undo/redo integration', () => {
			it( 'should create view element after redo', () => {
				setModelData( model, '<paragraph>foo</paragraph><imageBlock src=""><caption>[foo bar baz]</caption></imageBlock>' );

				const modelRoot = doc.getRoot();
				const modelImage = modelRoot.getChild( 1 );
				const modelCaption = modelImage.getChild( 0 );

				// Remove text and selection from caption.
				model.change( writer => {
					writer.remove( writer.createRangeIn( modelCaption ) );
					writer.setSelection( null );
				} );

				// Check if there is no figcaption in the view.
				expect( getViewData( view ) ).to.equal(
					'<p>{}foo</p>' +
					'<figure class="ck-widget image" contenteditable="false">' +
						'<img src=""></img>' +
						'<figcaption class="ck-editor__editable ck-editor__nested-editable ck-placeholder" ' +
							'contenteditable="true" data-placeholder="Enter image caption">' +
						'</figcaption>' +
					'</figure>'
				);

				editor.execute( 'undo' );

				// Check if figcaption is back with contents.
				expect( getViewData( view ) ).to.equal(
					'<p>foo</p>' +
					'<figure class="ck-widget image" contenteditable="false">' +
						'<img src=""></img>' +
						'<figcaption class="ck-editor__editable ck-editor__nested-editable" ' +
							'contenteditable="true" data-placeholder="Enter image caption">' +
							'{foo bar baz}' +
						'</figcaption>' +
					'</figure>'
				);
			} );

			it( 'undo should work after inserting the image', () => {
				setModelData( model, '<paragraph>foo[]</paragraph>' );

				model.change( writer => {
					const image = writer.createElement( 'imageBlock', { src: '/assets/sample.png' } );

					writer.insert( image, doc.getRoot() );
				} );

				expect( getModelData( model ) ).to.equal(
					'<imageBlock src="/assets/sample.png"></imageBlock><paragraph>foo[]</paragraph>'
				);

				editor.execute( 'undo' );

				expect( getModelData( model ) ).to.equal( '<paragraph>foo[]</paragraph>' );
			} );
		} );
	} );
} );
