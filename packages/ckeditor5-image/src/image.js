/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/image
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import ImageTextAlternative from './imagetextalternative';

import '../theme/image.css';
import ImageTypeToggleCommand from './image/imagetypetogglecommand';
import ImageInsertCommand from './image/imageinsertcommand';
import ImageBlock from './image/imageblock';
import ImageInline from './image/imageinline';
import { modelToViewAttributeConverter, srcsetAttributeConverter } from './image/converters';

/**
 * The image plugin.
 *
 * For a detailed overview, check the {@glink features/image image feature} documentation.
 *
 * This is a "glue" plugin which loads the following plugins:
 *
 * * {@link module:image/image/imageblock~ImageBlock},
 * * {@link module:image/image/imageinline~ImageInline},
 * * {@link module:image/imagetextalternative~ImageTextAlternative}.
 *
 * Usually, it is used in conjuction with other plugins from this package. See the {@glink api/image package page}
 * for more information.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Image extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ ImageBlock, ImageInline, Widget, ImageTextAlternative ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Image';
	}

	init() {
		const editor = this.editor;
		const conversion = editor.conversion;

		conversion.for( 'downcast' )
			.add( modelToViewAttributeConverter( 'src' ) )
			.add( modelToViewAttributeConverter( 'alt' ) )
			.add( srcsetAttributeConverter() );

		conversion.for( 'upcast' )
			.attributeToAttribute( {
				view: {
					name: 'img',
					key: 'alt'
				},
				model: 'alt'
			} )
			.attributeToAttribute( {
				view: {
					name: 'img',
					key: 'srcset'
				},
				model: {
					key: 'srcset',
					value: viewImage => {
						const value = {
							data: viewImage.getAttribute( 'srcset' )
						};

						if ( viewImage.hasAttribute( 'width' ) ) {
							value.width = viewImage.getAttribute( 'width' );
						}

						return value;
					}
				}
			} );

		editor.commands.add( 'imageInsert', new ImageInsertCommand( editor ) );
		editor.commands.add( 'imageTypeToggle', new ImageTypeToggleCommand( this.editor ) );
	}
}

/**
 * The configuration of the image features. Used by the image features in the `@ckeditor/ckeditor5-image` package.
 *
 * Read more in {@link module:image/image~ImageConfig}.
 *
 * @member {module:image/image~ImageConfig} module:core/editor/editorconfig~EditorConfig#image
 */

/**
 * The configuration of the image features. Used by the image features in the `@ckeditor/ckeditor5-image` package.
 *
 *		ClassicEditor
 *			.create( editorElement, {
 * 				image: ... // Image feature options.
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 *
 * @interface ImageConfig
 */
