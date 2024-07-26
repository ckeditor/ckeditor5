/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window */

/**
 * @module ckbox/ckboxediting
 */

import type { InitializedToken } from '@ckeditor/ckeditor5-cloud-services';
import { Plugin, type Editor } from 'ckeditor5/src/core.js';
import {
	Range,
	type DocumentSelection,
	type DowncastAttributeEvent,
	type DowncastWriter,
	type Element,
	type Item,
	type Node,
	type UpcastElementEvent,
	type ViewElement,
	type Writer
} from 'ckeditor5/src/engine.js';
import { logError, type DecoratedMethodEvent } from 'ckeditor5/src/utils.js';

import type { CKBoxAssetDefinition } from './ckboxconfig.js';

import CKBoxCommand from './ckboxcommand.js';
import CKBoxUploadAdapter from './ckboxuploadadapter.js';
import CKBoxUtils from './ckboxutils.js';

import type { ReplaceImageSourceCommand } from '@ckeditor/ckeditor5-image';

/**
 * The CKBox editing feature. It introduces the {@link module:ckbox/ckboxcommand~CKBoxCommand CKBox command} and
 * {@link module:ckbox/ckboxuploadadapter~CKBoxUploadAdapter CKBox upload adapter}.
 */
export default class CKBoxEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'CKBoxEditing' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ 'LinkEditing', 'PictureEditing', CKBoxUploadAdapter, CKBoxUtils ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;

		if ( !this._shouldBeInitialised() ) {
			return;
		}

		this._checkImagePlugins();

		// Registering the `ckbox` command makes sense only if the CKBox library is loaded, as the `ckbox` command opens the CKBox dialog.
		if ( isLibraryLoaded() ) {
			editor.commands.add( 'ckbox', new CKBoxCommand( editor ) );
		}
	}

	/**
	 * @inheritDoc
	 */
	public afterInit(): void {
		const editor = this.editor;

		if ( !this._shouldBeInitialised() ) {
			return;
		}

		// Extending the schema, registering converters and applying fixers only make sense if the configuration option to assign
		// the assets ID with the model elements is enabled.
		if ( !editor.config.get( 'ckbox.ignoreDataId' ) ) {
			this._initSchema();
			this._initConversion();
			this._initFixers();
		}
	}

	/**
	 * Returns true only when the integrator intentionally wants to use the plugin, i.e. when the `config.ckbox` exists or
	 * the CKBox JavaScript library is loaded.
	 */
	private _shouldBeInitialised(): boolean {
		const editor = this.editor;
		const hasConfiguration = !!editor.config.get( 'ckbox' );

		return hasConfiguration || isLibraryLoaded();
	}

	/**
	 * Checks if at least one image plugin is loaded.
	 */
	private _checkImagePlugins() {
		const editor = this.editor;

		if ( !editor.plugins.has( 'ImageBlockEditing' ) && !editor.plugins.has( 'ImageInlineEditing' ) ) {
			/**
			 * The CKBox feature requires one of the following plugins to be loaded to work correctly:
			 *
			 * * {@link module:image/imageblock~ImageBlock},
			 * * {@link module:image/imageinline~ImageInline},
			 * * {@link module:image/image~Image} (loads both `ImageBlock` and `ImageInline`)
			 *
			 * Please make sure your editor configuration is correct.
			 *
			 * @error ckbox-plugin-image-feature-missing
			 * @param {module:core/editor/editor~Editor} editor
			 */
			logError( 'ckbox-plugin-image-feature-missing', editor );
		}
	}

	/**
	 * Extends the schema to allow the `ckboxImageId` and `ckboxLinkId` attributes for links and images.
	 */
	private _initSchema() {
		const editor = this.editor;
		const schema = editor.model.schema;

		schema.extend( '$text', { allowAttributes: 'ckboxLinkId' } );

		if ( schema.isRegistered( 'imageBlock' ) ) {
			schema.extend( 'imageBlock', { allowAttributes: [ 'ckboxImageId', 'ckboxLinkId' ] } );
		}

		if ( schema.isRegistered( 'imageInline' ) ) {
			schema.extend( 'imageInline', { allowAttributes: [ 'ckboxImageId', 'ckboxLinkId' ] } );
		}

		schema.addAttributeCheck( ( context, attributeName ) => {
			const isLink = !!context.last.getAttribute( 'linkHref' );

			if ( !isLink && attributeName === 'ckboxLinkId' ) {
				return false;
			}
		} );
	}

	/**
	 * Configures the upcast and downcast conversions for the `ckboxImageId` and `ckboxLinkId` attributes.
	 */
	private _initConversion() {
		const editor = this.editor;

		// Convert `ckboxLinkId` => `data-ckbox-resource-id`.
		editor.conversion.for( 'downcast' ).add( dispatcher => {
			// Due to custom converters for linked block images, handle the `ckboxLinkId` attribute manually.
			dispatcher.on<DowncastAttributeEvent<Element>>( 'attribute:ckboxLinkId:imageBlock', ( evt, data, conversionApi ) => {
				const { writer, mapper, consumable } = conversionApi;

				if ( !consumable.consume( data.item, evt.name ) ) {
					return;
				}

				const viewFigure = mapper.toViewElement( data.item );
				const linkInImage = [ ...viewFigure!.getChildren() ]
					.find( ( child: any ) => child.name === 'a' ) as ViewElement | undefined;

				// No link inside an image - no conversion needed.
				if ( !linkInImage ) {
					return;
				}

				if ( data.item.hasAttribute( 'ckboxLinkId' ) ) {
					writer.setAttribute( 'data-ckbox-resource-id', data.item.getAttribute( 'ckboxLinkId' ), linkInImage );
				} else {
					writer.removeAttribute( 'data-ckbox-resource-id', linkInImage );
				}
			}, { priority: 'low' } );

			dispatcher.on<DowncastAttributeEvent>( 'attribute:ckboxLinkId', ( evt, data, conversionApi ) => {
				const { writer, mapper, consumable } = conversionApi;

				if ( !consumable.consume( data.item, evt.name ) ) {
					return;
				}

				// Remove the previous attribute value if it was applied.
				if ( data.attributeOldValue ) {
					const viewElement = createLinkElement( writer, data.attributeOldValue as string );

					writer.unwrap( mapper.toViewRange( data.range ), viewElement );
				}

				// Add the new attribute value if specified in a model element.
				if ( data.attributeNewValue ) {
					const viewElement = createLinkElement( writer, data.attributeNewValue as string );

					if ( data.item.is( 'selection' ) ) {
						const viewSelection = writer.document.selection;

						writer.wrap( viewSelection.getFirstRange()!, viewElement );
					} else {
						writer.wrap( mapper.toViewRange( data.range ), viewElement );
					}
				}
			}, { priority: 'low' } );
		} );

		// Convert `data-ckbox-resource-id` => `ckboxLinkId`.
		//
		// The helper conversion does not handle all cases, so take care of the `data-ckbox-resource-id` attribute manually for images
		// and links.
		editor.conversion.for( 'upcast' ).add( dispatcher => {
			dispatcher.on<UpcastElementEvent>( 'element:a', ( evt, data, conversionApi ) => {
				const { writer, consumable } = conversionApi;

				// Upcast the `data-ckbox-resource-id` attribute only for valid link elements.
				if ( !data.viewItem.getAttribute( 'href' ) ) {
					return;
				}

				const consumableAttributes = { attributes: [ 'data-ckbox-resource-id' ] };

				if ( !consumable.consume( data.viewItem, consumableAttributes ) ) {
					return;
				}

				const attributeValue = data.viewItem.getAttribute( 'data-ckbox-resource-id' );

				// Missing the `data-ckbox-resource-id` attribute.
				if ( !attributeValue ) {
					return;
				}

				if ( data.modelRange ) {
					// If the `<a>` element contains more than single children (e.g. a linked image), set the `ckboxLinkId` for each
					// allowed child.
					for ( let item of data.modelRange.getItems() ) {
						if ( item.is( '$textProxy' ) ) {
							item = item.textNode;
						}

						// Do not copy the `ckboxLinkId` attribute when wrapping an element in a block element, e.g. when
						// auto-paragraphing.
						if ( shouldUpcastAttributeForNode( item ) ) {
							writer.setAttribute( 'ckboxLinkId', attributeValue, item );
						}
					}
				} else {
					// Otherwise, just set the `ckboxLinkId` for the model element.
					const modelElement = data.modelCursor.nodeBefore || data.modelCursor.parent;

					writer.setAttribute( 'ckboxLinkId', attributeValue, modelElement as Element );
				}
			}, { priority: 'low' } );
		} );

		// Convert `ckboxImageId` => `data-ckbox-resource-id`.
		editor.conversion.for( 'downcast' ).attributeToAttribute( {
			model: 'ckboxImageId',
			view: 'data-ckbox-resource-id'
		} );

		// Convert `data-ckbox-resource-id` => `ckboxImageId`.
		editor.conversion.for( 'upcast' ).elementToAttribute( {
			model: {
				key: 'ckboxImageId',
				value: ( viewElement: ViewElement ) => viewElement.getAttribute( 'data-ckbox-resource-id' )
			},
			view: {
				attributes: {
					'data-ckbox-resource-id': /[\s\S]+/
				}
			}
		} );

		const replaceImageSourceCommand = editor.commands.get( 'replaceImageSource' );

		if ( replaceImageSourceCommand ) {
			this.listenTo<DecoratedMethodEvent<ReplaceImageSourceCommand, 'cleanupImage'>>(
				replaceImageSourceCommand,
				'cleanupImage',
				( _, [ writer, image ] ) => {
					writer.removeAttribute( 'ckboxImageId', image );
				}
			);
		}
	}

	/**
	 * Registers post-fixers that add or remove the `ckboxLinkId` and `ckboxImageId` attributes.
	 */
	private _initFixers() {
		const editor = this.editor;
		const model = editor.model;
		const selection = model.document.selection;

		// Registers the post-fixer to sync the asset ID with the model elements.
		model.document.registerPostFixer( syncDataIdPostFixer( editor ) );

		// Registers the post-fixer to remove the `ckboxLinkId` attribute from the model selection.
		model.document.registerPostFixer( injectSelectionPostFixer( selection ) );
	}
}

/**
 * A post-fixer that synchronizes the asset ID with the model element.
 */
function syncDataIdPostFixer( editor: Editor ) {
	return ( writer: Writer ) => {
		let changed = false;

		const model = editor.model;
		const ckboxCommand: CKBoxCommand = editor.commands.get( 'ckbox' )!;

		// The ID from chosen assets are stored in the `CKBoxCommand#_chosenAssets`. If there is no command, it makes no sense to check
		// for changes in the model.
		if ( !ckboxCommand ) {
			return changed;
		}

		for ( const entry of model.document.differ.getChanges() ) {
			if ( entry.type !== 'insert' && entry.type !== 'attribute' ) {
				continue;
			}

			const range = entry.type === 'insert' ?
				new Range( entry.position, entry.position.getShiftedBy( entry.length ) ) :
				entry.range;

			const isLinkHrefAttributeRemoval = entry.type === 'attribute' &&
				entry.attributeKey === 'linkHref' &&
				entry.attributeNewValue === null;

			for ( const item of range.getItems() ) {
				// If the `linkHref` attribute has been removed, sync the change with the `ckboxLinkId` attribute.
				if ( isLinkHrefAttributeRemoval && item.hasAttribute( 'ckboxLinkId' ) ) {
					writer.removeAttribute( 'ckboxLinkId', item );

					changed = true;

					continue;
				}

				// Otherwise, the change concerns either a new model element or an attribute change. Try to find the assets for the modified
				// model element.
				const assets = findAssetsForItem( item, ckboxCommand._chosenAssets );

				for ( const asset of assets ) {
					const attributeName = asset.type === 'image' ? 'ckboxImageId' : 'ckboxLinkId';

					if ( asset.id === item.getAttribute( attributeName ) ) {
						continue;
					}

					writer.setAttribute( attributeName, asset.id, item );

					changed = true;
				}
			}
		}

		return changed;
	};
}

/**
 * A post-fixer that removes the `ckboxLinkId` from the selection if it does not represent a link anymore.
 */
function injectSelectionPostFixer( selection: DocumentSelection ) {
	return ( writer: Writer ) => {
		const shouldRemoveLinkIdAttribute = !selection.hasAttribute( 'linkHref' ) && selection.hasAttribute( 'ckboxLinkId' );

		if ( shouldRemoveLinkIdAttribute ) {
			writer.removeSelectionAttribute( 'ckboxLinkId' );

			return true;
		}

		return false;
	};
}

/**
 * Tries to find the asset that is associated with the model element by comparing the attributes:
 * - the image fallback URL with the `src` attribute for images,
 * - the link URL with the `href` attribute for links.
 *
 * For any model element, zero, one or more than one asset can be found (e.g. a linked image may be associated with the link asset and the
 * image asset).
 */
function findAssetsForItem( item: Item, assets: Set<CKBoxAssetDefinition> ) {
	const isImageElement = item.is( 'element', 'imageInline' ) || item.is( 'element', 'imageBlock' );
	const isLinkElement = item.hasAttribute( 'linkHref' );

	return [ ...assets ].filter( asset => {
		if ( asset.type === 'image' && isImageElement ) {
			return asset.attributes.imageFallbackUrl === item.getAttribute( 'src' );
		}

		if ( asset.type === 'link' && isLinkElement ) {
			return asset.attributes.linkHref === item.getAttribute( 'linkHref' );
		}
	} );
}

/**
 * Creates view link element with the requested ID.
 */
function createLinkElement( writer: DowncastWriter, id: string ) {
	// Priority equal 5 is needed to merge adjacent `<a>` elements together.
	const viewElement = writer.createAttributeElement( 'a', { 'data-ckbox-resource-id': id }, { priority: 5 } );

	writer.setCustomProperty( 'link', true, viewElement );

	return viewElement;
}

/**
 * Checks if the model element may have the `ckboxLinkId` attribute.
 */
function shouldUpcastAttributeForNode( node: Node ) {
	if ( node.is( '$text' ) ) {
		return true;
	}

	if ( node.is( 'element', 'imageInline' ) || node.is( 'element', 'imageBlock' ) ) {
		return true;
	}

	return false;
}

/**
 * Returns true if the CKBox library is loaded, false otherwise.
 */
function isLibraryLoaded(): boolean {
	return !!window.CKBox;
}
