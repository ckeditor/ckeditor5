/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module link/linkimageediting
 */

import {
	Plugin,
	type Editor
} from 'ckeditor5/src/core.js';
import {
	Matcher,
	type UpcastElementEvent,
	type ModelNode,
	type ModelElement,
	type DowncastAttributeEvent,
	type ViewElement,
	type DowncastDispatcher,
	type UpcastDispatcher
} from 'ckeditor5/src/engine.js';
import { toMap } from 'ckeditor5/src/utils.js';

import { LinkEditing } from './linkediting.js';
import { type LinkManualDecorator } from './utils/manualdecorator.js';
import { type LinkCommand } from './linkcommand.js';

import type { ImageUtils } from '@ckeditor/ckeditor5-image';

/**
 * The link image engine feature.
 *
 * It accepts the `linkHref="url"` attribute in the model for the {@link module:image/image~Image `<imageBlock>`} element
 * which allows linking images.
 */
export class LinkImageEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ 'ImageEditing', 'ImageUtils', LinkEditing ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'LinkImageEditing' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	public afterInit(): void {
		const editor = this.editor;
		const schema = editor.model.schema;

		if ( editor.plugins.has( 'ImageBlockEditing' ) ) {
			schema.extend( 'imageBlock', { allowAttributes: [ 'linkHref' ] } );
		}

		editor.conversion.for( 'upcast' ).add( upcastLink( editor ) );
		editor.conversion.for( 'downcast' ).add( downcastImageLink( editor ) );

		// Definitions for decorators are provided by the `link` command and the `LinkEditing` plugin.
		this._enableAutomaticDecorators();
		this._enableManualDecorators();
	}

	/**
	 * Processes {@link module:link/linkconfig~LinkDecoratorAutomaticDefinition automatic decorators} definitions and
	 * attaches proper converters that will work when linking an image.`
	 */
	private _enableAutomaticDecorators(): void {
		const editor = this.editor;
		const command: LinkCommand = editor.commands.get( 'link' )!;
		const automaticDecorators = command.automaticDecorators;

		if ( automaticDecorators.length ) {
			editor.conversion.for( 'downcast' ).add( automaticDecorators.getDispatcherForLinkedImage() );
		}
	}

	/**
	 * Processes transformed {@link module:link/utils/manualdecorator~LinkManualDecorator} instances and attaches proper converters
	 * that will work when linking an image.
	 */
	private _enableManualDecorators(): void {
		const editor = this.editor;
		const command: LinkCommand = editor.commands.get( 'link' )!;

		for ( const decorator of command.manualDecorators ) {
			if ( editor.plugins.has( 'ImageBlockEditing' ) ) {
				editor.model.schema.extend( 'imageBlock', { allowAttributes: decorator.id } );
			}

			if ( editor.plugins.has( 'ImageInlineEditing' ) ) {
				editor.model.schema.extend( 'imageInline', { allowAttributes: decorator.id } );
			}

			editor.conversion.for( 'downcast' ).add( downcastImageLinkManualDecorator( decorator ) );
			editor.conversion.for( 'upcast' ).add( upcastImageLinkManualDecorator( editor, decorator ) );
		}
	}
}

/**
 * Returns a converter for linked block images that consumes the "href" attribute
 * if a link contains an image.
 *
 * @param editor The editor instance.
 */
function upcastLink( editor: Editor ): ( dispatcher: UpcastDispatcher ) => void {
	const isImageInlinePluginLoaded = editor.plugins.has( 'ImageInlineEditing' );
	const imageUtils: ImageUtils = editor.plugins.get( 'ImageUtils' );

	return dispatcher => {
		dispatcher.on<UpcastElementEvent>( 'element:a', ( evt, data, conversionApi ) => {
			const viewLink = data.viewItem;
			const imageInLink = imageUtils.findViewImgElement( viewLink );

			if ( !imageInLink ) {
				return;
			}

			const blockImageView = imageInLink.findAncestor( element => imageUtils.isBlockImageView( element ) );

			// There are four possible cases to consider here
			//
			// 1. A "root > ... > figure.image > a > img" structure.
			// 2. A "root > ... > figure.image > a > picture > img" structure.
			// 3. A "root > ... > block > a > img" structure.
			// 4. A "root > ... > block > a > picture > img" structure.
			//
			// but the last 2 cases should only be considered by this converter when the inline image plugin
			// is NOT loaded in the editor (because otherwise, that would be a plain, linked inline image).
			if ( isImageInlinePluginLoaded && !blockImageView ) {
				return;
			}

			// There's an image inside an <a> element - we consume it so it won't be picked up by the Link plugin.
			const consumableAttributes = { attributes: [ 'href' ] };

			// Consume the `href` attribute so the default one will not convert it to $text attribute.
			if ( !conversionApi.consumable.consume( viewLink, consumableAttributes ) ) {
				// Might be consumed by something else - i.e. other converter with priority=highest - a standard check.
				return;
			}

			const linkHref = viewLink.getAttribute( 'href' );

			// Missing the 'href' attribute.
			if ( !linkHref ) {
				return;
			}

			// A full definition of the image feature.
			// figure > a > img: parent of the view link element is an image element (figure).
			let modelElement: ModelNode | null = data.modelCursor.parent as ModelNode;

			if ( !modelElement.is( 'element', 'imageBlock' ) ) {
				// a > img: parent of the view link is not the image (figure) element. We need to convert it manually.
				const conversionResult = conversionApi.convertItem( imageInLink, data.modelCursor );

				// Set image range as conversion result.
				data.modelRange = conversionResult.modelRange;

				// Continue conversion where image conversion ends.
				data.modelCursor = conversionResult.modelCursor;

				modelElement = data.modelCursor.nodeBefore as ModelNode;
			}

			if ( modelElement && modelElement.is( 'element', 'imageBlock' ) ) {
				// Set the linkHref attribute from link element on model image element.
				conversionApi.writer.setAttribute( 'linkHref', linkHref, modelElement );
			}
		}, { priority: 'high' } );
		// Using the same priority that `upcastImageLinkManualDecorator()` converter guarantees
		// that manual decorators will decorate the proper element.
	};
}

/**
 * Creates a converter that adds `<a>` to linked block image view elements.
 */
function downcastImageLink( editor: Editor ): ( dispatcher: DowncastDispatcher ) => void {
	const imageUtils: ImageUtils = editor.plugins.get( 'ImageUtils' );

	return dispatcher => {
		dispatcher.on<DowncastAttributeEvent<ModelElement>>( 'attribute:linkHref:imageBlock', ( evt, data, conversionApi ) => {
			if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
				return;
			}

			// The image will be already converted - so it will be present in the view.
			const viewFigure = conversionApi.mapper.toViewElement( data.item )!;
			const writer = conversionApi.writer;

			// But we need to check whether the link element exists.
			const linkInImage = Array.from( viewFigure.getChildren() )
				.find( ( child ): child is ViewElement => child.is( 'element', 'a' ) );
			const viewImage = imageUtils.findViewImgElement( viewFigure )!;
			// <picture>...<img/></picture> or <img/>
			const viewImgOrPicture = viewImage.parent!.is( 'element', 'picture' ) ? viewImage.parent : viewImage;

			// If so, update the attribute if it's defined or remove the entire link if the attribute is empty.
			if ( linkInImage ) {
				if ( data.attributeNewValue ) {
					writer.setAttribute( 'href', data.attributeNewValue, linkInImage );
				} else {
					writer.move( writer.createRangeOn( viewImgOrPicture ), writer.createPositionAt( viewFigure, 0 ) );
					writer.remove( linkInImage );
				}
			} else {
				// But if it does not exist. Let's wrap already converted image by newly created link element.
				// 1. Create an empty link element.
				const linkElement = writer.createContainerElement( 'a', { href: data.attributeNewValue } );

				// 2. Insert link inside the associated image.
				writer.insert( writer.createPositionAt( viewFigure, 0 ), linkElement );

				// 3. Move the image to the link.
				writer.move( writer.createRangeOn( viewImgOrPicture ), writer.createPositionAt( linkElement, 0 ) );
			}
		}, { priority: 'high' } );
	};
}

/**
 * Returns a converter that decorates the `<a>` element when the image is the link label.
 */
function downcastImageLinkManualDecorator( decorator: LinkManualDecorator ): ( dispatcher: DowncastDispatcher ) => void {
	return dispatcher => {
		dispatcher.on<DowncastAttributeEvent<ModelElement>>( `attribute:${ decorator.id }:imageBlock`, ( evt, data, conversionApi ) => {
			const viewFigure = conversionApi.mapper.toViewElement( data.item )!;
			const linkInImage = Array.from( viewFigure.getChildren() )
				.find( ( child ): child is ViewElement => child.is( 'element', 'a' ) );

			// The <a> element was removed by the time this converter is executed.
			// It may happen when the base `linkHref` and decorator attributes are removed
			// at the same time (see #8401).
			if ( !linkInImage ) {
				return;
			}

			// Handle deactivated manual decorator.
			if ( decorator.value === undefined ) {
				for ( const key in decorator.attributes ) {
					conversionApi.writer.removeAttribute( key, linkInImage );
				}

				if ( decorator.classes ) {
					conversionApi.writer.removeClass( decorator.classes, linkInImage );
				}

				for ( const key in decorator.styles ) {
					conversionApi.writer.removeStyle( key, linkInImage );
				}

				return;
			}

			// Handle activated manual decorator.
			for ( const [ key, val ] of toMap( decorator.attributes ) ) {
				conversionApi.writer.setAttribute( key, val, linkInImage );
			}

			if ( decorator.classes ) {
				conversionApi.writer.addClass( decorator.classes, linkInImage );
			}

			for ( const key in decorator.styles ) {
				conversionApi.writer.setStyle( key, decorator.styles[ key ], linkInImage );
			}
		} );
	};
}

/**
 * Returns a converter that checks whether manual decorators should be applied to the link.
 */
function upcastImageLinkManualDecorator( editor: Editor, decorator: LinkManualDecorator ): ( dispatcher: UpcastDispatcher ) => void {
	const isImageInlinePluginLoaded = editor.plugins.has( 'ImageInlineEditing' );
	const imageUtils: ImageUtils = editor.plugins.get( 'ImageUtils' );

	return dispatcher => {
		dispatcher.on<UpcastElementEvent>( 'element:a', ( evt, data, conversionApi ) => {
			const viewLink = data.viewItem;
			const imageInLink = imageUtils.findViewImgElement( viewLink );

			// We need to check whether an image is inside a link because the converter handles
			// only manual decorators for linked images. See #7975.
			if ( !imageInLink ) {
				return;
			}

			const blockImageView = imageInLink.findAncestor( element => imageUtils.isBlockImageView( element ) );

			if ( isImageInlinePluginLoaded && !blockImageView ) {
				return;
			}

			const matcher = new Matcher( decorator._createPattern() );
			const result = matcher.match( viewLink );

			// The link element does not have required attributes or/and proper values.
			if ( !result ) {
				return;
			}

			// Check whether we can consume those attributes.
			if ( !conversionApi.consumable.consume( viewLink, result.match ) ) {
				return;
			}

			// At this stage we can assume that we have the `<imageBlock>` element.
			// `nodeBefore` comes after conversion: `<a><img></a>`.
			// `parent` comes with full image definition: `<figure><a><img></a></figure>.
			// See the body of the `upcastLink()` function.
			const modelElement = data.modelCursor.nodeBefore as ModelElement || data.modelCursor.parent;

			conversionApi.writer.setAttribute( decorator.id, true, modelElement );
		}, { priority: 'high' } );
		// Using the same priority that `upcastLink()` converter guarantees that the linked image was properly converted.
	};
}
