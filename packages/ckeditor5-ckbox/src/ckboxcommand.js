/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document, window, setTimeout, URL */

/**
 * @module ckbox/ckboxcommand
 */

import { Command } from 'ckeditor5/src/core';
import { createElement, toMap } from 'ckeditor5/src/utils';
import { getEnvironmentId, getImageUrls } from './utils';

// Defines the waiting time (in milliseconds) for inserting the chosen asset into the model. The chosen asset is temporarily stored in the
// `CKBoxCommand#_chosenAssets` and it is removed from there automatically after this time. See `CKBoxCommand#_chosenAssets` for more
// details.
const ASSET_INSERTION_WAIT_TIMEOUT = 1000;

/**
 * The CKBox command. It is used by the {@link module:ckbox/ckboxediting~CKBoxEditing CKBox editing feature} to open the CKBox file manager.
 * The file manager allows inserting an image or a link to a file into the editor content.
 *
 *		editor.execute( 'ckbox' );
 *
 * **Note:** This command uses other features to perform the following tasks:
 * - To insert images it uses the {@link module:image/image/insertimagecommand~InsertImageCommand 'insertImage'} command from the
 * {@link module:image/image~Image Image feature}.
 * - To insert links to other files it uses the {@link module:link/linkcommand~LinkCommand 'link'} command from the
 * {@link module:link/link~Link Link feature}.
 *
 * @extends module:core/command~Command
 */
export default class CKBoxCommand extends Command {
	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		/**
		 * A set of all chosen assets. They are stored temporarily and they are automatically removed 1 second after being chosen.
		 * Chosen assets have to be "remembered" for a while to be able to map the given asset with the element inserted into the model.
		 * This association map is then used to set the ID on the model element.
		 *
		 * All chosen assets are automatically removed after the timeout, because (theoretically) it may happen that they will never be
		 * inserted into the model, even if the {@link module:link/linkcommand~LinkCommand `'link'`} command or the
		 * {@link module:image/image/insertimagecommand~InsertImageCommand `'insertImage'`} command is enabled. Such a case may arise when
		 * another plugin blocks the command execution. Then, in order not to keep the chosen (but not inserted) assets forever, we delete
		 * them automatically to prevent memory leakage. The 1 second timeout is enough to insert the asset into the model and extract the
		 * ID from the chosen asset.
		 *
		 * The assets are stored only if
		 * the {@link module:ckbox/ckbox~CKBoxConfig#ignoreDataId `config.ckbox.ignoreDataId`} option is set to `false` (by default).
		 *
		 * @protected
		 * @member {Set.<module:ckbox/ckbox~CKBoxAssetDefinition>} #_chosenAssets
		 */
		this._chosenAssets = new Set();

		/**
		 * The DOM element that acts as a mounting point for the CKBox dialog.
		 *
		 * @private
		 * @member {Element|null} #_wrapper
		 */
		this._wrapper = null;

		this._initListeners();
	}

	/**
	 * @inheritDoc
	 */
	refresh() {
		this.value = this._getValue();
		this.isEnabled = this._checkEnabled();
	}

	/**
	 * @inheritDoc
	 */
	execute() {
		this.fire( 'ckbox:open' );
	}

	/**
	 * Indicates if the CKBox dialog is already opened.
	 *
	 * @protected
	 * @returns {Boolean}
	 */
	_getValue() {
		return this._wrapper !== null;
	}

	/**
	 * Checks whether the command can be enabled in the current context.
	 *
	 * @protected
	 * @returns {Boolean}
	 */
	_checkEnabled() {
		const imageCommand = this.editor.commands.get( 'insertImage' );
		const linkCommand = this.editor.commands.get( 'link' );

		if ( !imageCommand.isEnabled && !linkCommand.isEnabled ) {
			return false;
		}

		return true;
	}

	/**
	 * Creates the options object for the CKBox dialog.
	 *
	 * @protected
	 * @returns {Object} options
	 * @returns {String} options.theme The theme for CKBox dialog.
	 * @returns {String} options.language The language for CKBox dialog.
	 * @returns {String} options.tokenUrl The token endpoint URL.
	 * @returns {String} options.serviceOrigin The base URL of the API service.
	 * @returns {String} options.assetsOrigin The base URL for assets inserted into the editor.
	 * @returns {Object} options.dialog
	 * @returns {Function} options.dialog.onClose The callback function invoked after closing the CKBox dialog.
	 * @returns {Object} options.assets
	 * @returns {Function} options.assets.onChoose The callback function invoked after choosing the assets.
	 */
	_prepareOptions() {
		const editor = this.editor;
		const ckboxConfig = editor.config.get( 'ckbox' );

		return {
			theme: ckboxConfig.theme,
			language: ckboxConfig.language,
			tokenUrl: ckboxConfig.tokenUrl,
			serviceOrigin: ckboxConfig.serviceOrigin,
			assetsOrigin: ckboxConfig.assetsOrigin,
			dialog: {
				onClose: () => this.fire( 'ckbox:close' )
			},
			assets: {
				onChoose: assets => this.fire( 'ckbox:choose', assets )
			}
		};
	}

	/**
	 * Initializes various event listeners for the `ckbox:*` events, because all functionality of the `ckbox` command is event-based.
	 *
	 * @protected
	 */
	_initListeners() {
		const editor = this.editor;
		const model = editor.model;
		const shouldInsertDataId = !editor.config.get( 'ckbox.ignoreDataId' );

		// Refresh the command after firing the `ckbox:*` event.
		this.on( 'ckbox', () => {
			this.refresh();
		}, { priority: 'low' } );

		// Handle opening of the CKBox dialog.
		this.on( 'ckbox:open', () => {
			if ( !this.isEnabled || this.value ) {
				return;
			}

			this._wrapper = createElement( document, 'div', { class: 'ck ckbox-wrapper' } );
			document.body.appendChild( this._wrapper );

			window.CKBox.mount( this._wrapper, this._prepareOptions() );
		} );

		// Handle closing of the CKBox dialog.
		this.on( 'ckbox:close', () => {
			if ( !this.value ) {
				return;
			}

			this._wrapper.remove();
			this._wrapper = null;
		} );

		// Handle choosing the assets.
		this.on( 'ckbox:choose', ( evt, assets ) => {
			if ( !this.isEnabled ) {
				return;
			}

			const imageCommand = editor.commands.get( 'insertImage' );
			const linkCommand = editor.commands.get( 'link' );
			const ckboxEditing = editor.plugins.get( 'CKBoxEditing' );
			const assetsOrigin = editor.config.get( 'ckbox.assetsOrigin' );

			const assetsToProcess = prepareAssets( {
				assets,
				origin: assetsOrigin,
				token: ckboxEditing.getToken(),
				isImageAllowed: imageCommand.isEnabled,
				isLinkAllowed: linkCommand.isEnabled
			} );

			if ( assetsToProcess.length === 0 ) {
				return;
			}

			// All assets are inserted in one undo step.
			model.change( writer => {
				for ( const asset of assetsToProcess ) {
					const isLastAsset = asset === assetsToProcess[ assetsToProcess.length - 1 ];

					this._insertAsset( asset, isLastAsset, writer );

					// If asset ID must be set for the inserted model element, store the asset temporarily and remove it automatically
					// after the timeout.
					if ( shouldInsertDataId ) {
						setTimeout( () => this._chosenAssets.delete( asset ), ASSET_INSERTION_WAIT_TIMEOUT );

						this._chosenAssets.add( asset );
					}
				}
			} );
		} );

		// Clean up after the editor is destroyed.
		this.listenTo( editor, 'destroy', () => {
			this.fire( 'ckbox:close' );
			this._chosenAssets.clear();
		} );
	}

	/**
	 * Inserts the asset into the model.
	 *
	 * @protected
	 * @param {Object} asset The asset to be inserted.
	 * @param {Boolean} isLastAsset Indicates if the current asset is the last one from the chosen set.
	 * @param {module:engine/model/writer~Writer} writer An instance of the model writer.
	 */
	_insertAsset( asset, isLastAsset, writer ) {
		const editor = this.editor;
		const model = editor.model;
		const selection = model.document.selection;

		// Remove the `linkHref` attribute to not affect the asset to be inserted.
		writer.removeSelectionAttribute( 'linkHref' );

		if ( asset.type === 'image' ) {
			this._insertImage( asset );
		} else {
			this._insertLink( asset, writer );
		}

		// Except for the last chosen asset, move the selection to the end of the current range to avoid overwriting other, already
		// inserted assets.
		if ( !isLastAsset ) {
			writer.setSelection( selection.getLastPosition() );
		}
	}

	/**
	 * Inserts the image by calling the `insertImage` command.
	 *
	 * @protected
	 * @param {module:ckbox/ckbox~CKBoxAssetDefinition} asset The asset to be inserted.
	 */
	_insertImage( asset ) {
		const editor = this.editor;
		const { imageFallbackUrl, imageSources, imageTextAlternative } = asset.attributes;

		editor.execute( 'insertImage', {
			source: {
				src: imageFallbackUrl,
				sources: imageSources,
				alt: imageTextAlternative
			}
		} );
	}

	/**
	 * Inserts the link to the asset by calling the `link` command.
	 *
	 * @protected
	 * @param {module:ckbox/ckbox~CKBoxAssetDefinition} asset The asset to be inserted.
	 * @param {module:engine/model/writer~Writer} writer An instance of the model writer.
	 */
	_insertLink( asset, writer ) {
		const editor = this.editor;
		const model = editor.model;
		const selection = model.document.selection;
		const { linkName, linkHref } = asset.attributes;

		// If the selection is collapsed, insert the asset name as the link label and select it.
		if ( selection.isCollapsed ) {
			const selectionAttributes = toMap( selection.getAttributes() );
			const textNode = writer.createText( linkName, selectionAttributes );
			const range = model.insertContent( textNode );

			writer.setSelection( range );
		}

		editor.execute( 'link', linkHref );
	}
}

// Parses the chosen assets into the internal data format. Filters out chosen assets that are not allowed.
//
// @private
// @param {Object} data
// @param {Array.<module:ckbox/ckbox~CKBoxRawAssetDefinition>} data.assets
// @param {String} data.origin The base URL for assets inserted into the editor.
// @param {module:cloud-services/token~Token} data.token
// @param {Boolean} data.isImageAllowed
// @param {Boolean} data.isLinkAllowed
// @returns {Array.<module:ckbox/ckbox~CKBoxAssetDefinition>}
function prepareAssets( { assets, origin, token, isImageAllowed, isLinkAllowed } ) {
	return assets
		.map( asset => ( {
			id: asset.data.id,
			type: isImage( asset ) ? 'image' : 'link',
			attributes: prepareAssetAttributes( asset, token, origin )
		} ) )
		.filter( asset => asset.type === 'image' ? isImageAllowed : isLinkAllowed );
}

// Parses the assets attributes into the internal data format.
//
// @private
// @param {module:ckbox/ckbox~CKBoxRawAssetDefinition} asset
// @param {module:cloud-services/token~Token} token
// @param {String} origin The base URL for assets inserted into the editor.
// @returns {module:ckbox/ckbox~CKBoxAssetImageAttributesDefinition|module:ckbox/ckbox~CKBoxAssetLinkAttributesDefinition}
function prepareAssetAttributes( asset, token, origin ) {
	if ( isImage( asset ) ) {
		const { imageFallbackUrl, imageSources } = getImageUrls( {
			token,
			origin,
			id: asset.data.id,
			width: asset.data.metadata.width,
			extension: asset.data.extension
		} );

		return {
			imageFallbackUrl,
			imageSources,
			imageTextAlternative: asset.data.metadata.description || ''
		};
	}

	return {
		linkName: asset.data.name,
		linkHref: getAssetUrl( asset, token, origin )
	};
}

// Checks whether the asset is an image.
//
// @private
// @param {module:ckbox/ckbox~CKBoxRawAssetDefinition} asset
// @returns {Boolean}
function isImage( asset ) {
	const metadata = asset.data.metadata;

	if ( !metadata ) {
		return false;
	}

	return metadata.width && metadata.height;
}

// Creates the URL for the asset.
//
// @private
// @param {module:ckbox/ckbox~CKBoxRawAssetDefinition} asset
// @param {module:cloud-services/token~Token} token
// @param {String} origin The base URL for assets inserted into the editor.
// @returns {String}
function getAssetUrl( asset, token, origin ) {
	const environmentId = getEnvironmentId( token );
	const url = new URL( `${ environmentId }/assets/${ asset.data.id }/file`, origin );

	url.searchParams.set( 'download', 'true' );

	return url.toString();
}

/**
 * Fired when the command is executed.
 *
 * @event ckbox:open
 */

/**
 * Fired when the CKBox dialog is closed.
 *
 * @event ckbox:close
 */

/**
 * Fired after the assets are chosen.
 *
 * @event ckbox:choose
 * @param {Array.<module:ckbox/ckbox~CKBoxRawAssetDefinition>} assets Chosen assets.
 */
