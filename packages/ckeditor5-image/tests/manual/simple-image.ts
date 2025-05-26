/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import { EasyImage } from '@ckeditor/ckeditor5-easy-image';
import { LinkImage } from '@ckeditor/ckeditor5-link';
import { SourceEditing } from '@ckeditor/ckeditor5-source-editing';
import { CloudServices } from '@ckeditor/ckeditor5-cloud-services';
import { GeneralHtmlSupport } from '@ckeditor/ckeditor5-html-support';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';

import type { Editor } from '@ckeditor/ckeditor5-core';
import type { ViewElement, Element, UpcastElementEvent } from '@ckeditor/ckeditor5-engine';
import { AutoImage, ImageInsert, ImageResize, type ImageUtils } from '@ckeditor/ckeditor5-image';
import ImageLoadObserver, { type ImageLoadedEvent } from '@ckeditor/ckeditor5-image/src/image/imageloadobserver.js';

declare global {
	interface Window {
		editor: Editor;
	}
}

function SimpleImage( editor: Editor ) {
	editor.conversion.for( 'upcast' )
		// The IMG element conversion.
		.add( dispatcher => {
			dispatcher.on<UpcastElementEvent>( 'element:img', ( evt, data, conversionApi ) => {
				const { viewItem } = data;
				const { writer, consumable, safeInsert, updateConversionResult, schema } = conversionApi;

				let image;

				if ( !consumable.test( viewItem, { name: true, attributes: 'src' } ) ) {
					return;
				}

				if ( schema.checkChild( data.modelCursor, 'imageInline' ) ) {
					image = writer.createElement( 'imageInline', {
						src: viewItem.getAttribute( 'src' )
					} );
				} else {
					image = writer.createElement( 'imageBlock', {
						src: viewItem.getAttribute( 'src' )
					} );
				}

				if ( !safeInsert( image, data.modelCursor ) ) {
					return;
				}

				consumable.consume( viewItem, { name: true, attributes: 'src' } );
				updateConversionResult( image, data );
			}, { priority: 'high' } );
		} )

		// The width attribute to resizedWidth conversion.
		.attributeToAttribute( {
			view: {
				name: 'img',
				key: 'width'
			},
			model: {
				key: 'resizedWidth',
				value: viewElement => {
					return `${ parseInt( viewElement.getAttribute( 'width' ) ) }px`;
				}
			}
		} )

		// The height attribute to resizedHeight conversion.
		.attributeToAttribute( {
			view: {
				name: 'img',
				key: 'height'
			},
			model: {
				key: 'resizedHeight',
				value: viewElement => {
					return `${ parseInt( viewElement.getAttribute( 'height' ) ) }px`;
				}
			}
		} );

	editor.conversion.for( 'dataDowncast' )
		// The IMG element.
		.elementToElement( {
			model: 'imageBlock',
			view: ( modelElement, { writer } ) => writer.createEmptyElement( 'img' ),
			converterPriority: 'high'
		} )
		.elementToElement( {
			model: 'imageInline',
			view: ( modelElement, { writer } ) => writer.createEmptyElement( 'img' ),
			converterPriority: 'high'
		} )

		// There is a resizedWidth so use it as a width attribute in data.
		.attributeToAttribute( {
			model: {
				name: 'imageBlock',
				key: 'resizedWidth'
			},
			view: attributeValue => ( {
				key: 'width',
				value: `${ parseInt( attributeValue as string ) }`
			} ),
			converterPriority: 'high'
		} )
		.attributeToAttribute( {
			model: {
				name: 'imageInline',
				key: 'resizedWidth'
			},
			view: attributeValue => ( {
				key: 'width',
				value: `${ parseInt( attributeValue as string ) }`
			} ),
			converterPriority: 'high'
		} )

		// There is a resizedHeight so use it as a height attribute in data.
		.attributeToAttribute( {
			model: {
				name: 'imageBlock',
				key: 'resizedHeight'
			},
			view: attributeValue => ( {
				key: 'height',
				value: `${ parseInt( attributeValue as string ) }`
			} ),
			converterPriority: 'high'
		} )
		.attributeToAttribute( {
			model: {
				name: 'imageInline',
				key: 'resizedHeight'
			},
			view: attributeValue => ( {
				key: 'height',
				value: `${ parseInt( attributeValue as string ) }`
			} ),
			converterPriority: 'high'
		} )

		// Natural width should be used only if resizedWidth is not specified (is equal to natural width).
		.attributeToAttribute( {
			model: {
				name: 'imageBlock',
				key: 'width'
			},
			view: ( attributeValue, { consumable }, data ) => {
				if ( data.item.hasAttribute( 'resizedWidth' ) ) {
					// Natural width consumed and not down-casted (because resizedWidth was used to downcast to the width attribute).
					consumable.consume( data.item, 'attribute:width' );

					return null;
				} else {
					// There is no resizedWidth so downcast natural width to the attribute in data.
					return {
						key: 'width',
						value: attributeValue
					};
				}
			},
			converterPriority: 'high'
		} )
		.attributeToAttribute( {
			model: {
				name: 'imageInline',
				key: 'width'
			},
			view: ( attributeValue, { consumable }, data ) => {
				if ( data.item.hasAttribute( 'resizedWidth' ) ) {
					// Natural width consumed and not down-casted (because resizedWidth was used to downcast to the width attribute).
					consumable.consume( data.item, 'attribute:width' );

					return null;
				} else {
					// There is no resizedWidth so downcast natural width to the attribute in data.
					return {
						key: 'width',
						value: attributeValue
					};
				}
			},
			converterPriority: 'high'
		} )

		// Natural height converted to resized height attribute (based on aspect ratio and resized width if available).
		.attributeToAttribute( {
			model: {
				name: 'imageBlock',
				key: 'height'
			},
			view: ( attributeValue, conversionApi, data ) => {
				if ( data.item.hasAttribute( 'resizedWidth' ) ) {
					// The resizedWidth is present so calculate height from aspect ratio.
					const resizedWidth = parseInt( data.item.getAttribute( 'resizedWidth' ) as string );
					const naturalWidth = parseInt( data.item.getAttribute( 'width' ) as string );
					const naturalHeight = parseInt( attributeValue as string );
					const aspectRatio = naturalWidth / naturalHeight;

					return {
						key: 'height',
						value: `${ Math.round( resizedWidth / aspectRatio ) }`
					};
				} else {
					// There is no resizedWidth so using natural height attribute.
					return {
						key: 'height',
						value: attributeValue
					};
				}
			},
			converterPriority: 'high'
		} )
		.attributeToAttribute( {
			model: {
				name: 'imageInline',
				key: 'height'
			},
			view: ( attributeValue, conversionApi, data ) => {
				if ( data.item.hasAttribute( 'resizedWidth' ) ) {
					// The resizedWidth is present so calculate height from aspect ratio.
					const resizedWidth = parseInt( data.item.getAttribute( 'resizedWidth' ) as string );
					const naturalWidth = parseInt( data.item.getAttribute( 'width' ) as string );
					const naturalHeight = parseInt( attributeValue as string );
					const aspectRatio = naturalWidth / naturalHeight;

					return {
						key: 'height',
						value: `${ Math.round( resizedWidth / aspectRatio ) }`
					};
				} else {
					// There is no resizedWidth so using natural height attribute.
					return {
						key: 'height',
						value: attributeValue
					};
				}
			},
			converterPriority: 'high'
		} );

	editor.editing.view.addObserver( ImageLoadObserver );

	const imageUtils: ImageUtils = editor.plugins.get( 'ImageUtils' );

	// Waiting for any new images loaded, so we can set their natural width and height.
	editor.editing.view.document.on<ImageLoadedEvent>( 'imageLoaded', ( evt, domEvent ) => {
		const imgViewElement = editor.editing.view.domConverter.mapDomToView( domEvent.target as HTMLElement );

		if ( !imgViewElement ) {
			return;
		}

		const viewElement = imageUtils.getImageWidgetFromImageView( imgViewElement as ViewElement );

		if ( !viewElement ) {
			return;
		}

		const modelElement = editor.editing.mapper.toModelElement( viewElement );

		if ( !modelElement ) {
			return;
		}

		editor.model.enqueueChange( { isUndoable: false }, () => {
			imageUtils.setImageNaturalSizeAttributes( modelElement );
		} );
	} );

	// Post-fixer to ensure we do not have redundant resizedX attributes if image is in original size.
	editor.model.document.registerPostFixer( writer => {
		const changes = writer.model.document.differ.getChanges();
		const images: Array<Element> = [];
		let wasFixed = false;

		for ( const change of changes ) {
			if ( change.type == 'attribute' ) {
				if ( ![ 'width', 'height', 'resizedWidth', 'resizedHeight' ].includes( change.attributeKey ) ) {
					continue;
				}

				const item = change.range.start.nodeAfter!;

				if ( item.is( 'element', 'imageBlock' ) || item.is( 'element', 'imageInline' ) ) {
					images.push( item );
				}
			} else if ( change.type == 'insert' && change.name != '$text' ) {
				const items = Array.from( writer.createRangeOn( change.position.nodeAfter! ).getItems() );

				for ( const item of items ) {
					if ( item.is( 'element', 'imageBlock' ) || item.is( 'element', 'imageInline' ) ) {
						images.push( item );
					}
				}
			}
		}

		for ( const item of images ) {
			if (
				item.hasAttribute( 'resizedWidth' ) &&
				item.getAttribute( 'resizedWidth' ) == `${ item.getAttribute( 'width' ) }px`
			) {
				writer.removeAttribute( 'resizedWidth', item );
				wasFixed = true;
			}

			if (
				item.hasAttribute( 'resizedHeight' ) &&
				item.getAttribute( 'resizedHeight' ) == `${ item.getAttribute( 'height' ) }px`
			) {
				writer.removeAttribute( 'resizedHeight', item );
				wasFixed = true;
			}
		}

		return wasFixed;
	} );
}

ClassicEditor
	.create( document.getElementById( 'editor' )!, {
		plugins: [
			ArticlePluginSet, EasyImage, ImageResize, ImageInsert, LinkImage, AutoImage,
			CloudServices, SourceEditing, GeneralHtmlSupport, SimpleImage
		],
		toolbar: [
			'sourceEditing',
			'|',
			'heading',
			'|',
			'bold', 'italic', 'link',
			'|',
			'bulletedList', 'numberedList',
			'|',
			'outdent', 'indent',
			'|',
			'blockQuote', 'insertImage', 'insertTable', 'mediaEmbed',
			'|',
			'undo', 'redo'
		],
		cloudServices: CS_CONFIG,
		table: {
			contentToolbar: [
				'tableColumn', 'tableRow', 'mergeTableCells'
			]
		},
		image: {
			resizeUnit: 'px',
			resizeOptions: [
				{
					name: 'resizeImage:original',
					label: 'Original size',
					value: null
				},
				{
					name: 'resizeImage:custom',
					label: 'Custom size',
					value: 'custom'
				},
				{
					name: 'resizeImage:50',
					label: '500px',
					value: '500'
				},
				{
					name: 'resizeImage:75',
					label: '200px',
					value: '200'
				}
			],
			toolbar: [
				'imageTextAlternative', 'toggleImageCaption', '|',
				'imageStyle:inline', 'imageStyle:wrapText', 'imageStyle:breakText', 'imageStyle:side', '|',
				'resizeImage'
			]
		},
		htmlSupport: {
			allow: [ { name: /./, attributes: true, classes: true, styles: true } ]
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
