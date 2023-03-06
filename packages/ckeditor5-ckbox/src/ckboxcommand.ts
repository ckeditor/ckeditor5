/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document, window, setTimeout, URL */

/**
 * @module ckbox/ckboxcommand
 */

import type { InitializedToken } from '@ckeditor/ckeditor5-cloud-services';
import type { Writer } from 'ckeditor5/src/engine';
import { Command, type Editor } from 'ckeditor5/src/core';
import { createElement, toMap } from 'ckeditor5/src/utils';

import type {
	CKBoxAssetDefinition,
	CKBoxAssetImageAttributesDefinition,
	CKBoxAssetImageDefinition,
	CKBoxAssetLinkAttributesDefinition,
	CKBoxAssetLinkDefinition,
	CKBoxRawAssetDefinition
} from './ckboxconfig';

import { getEnvironmentId, getImageUrls } from './utils';
import type CKBoxEditing from './ckboxediting';

declare global {
	// eslint-disable-next-line no-var
	var CKBox: {
		mount( wrapper: Element, options: Record<string, unknown> ): void;
	};
}

// Defines the waiting time (in milliseconds) for inserting the chosen asset into the model. The chosen asset is temporarily stored in the
// `CKBoxCommand#_chosenAssets` and it is removed from there automatically after this time. See `CKBoxCommand#_chosenAssets` for more
// details.
const ASSET_INSERTION_WAIT_TIMEOUT = 1000;

/**
 * The CKBox command. It is used by the {@link module:ckbox/ckboxediting~CKBoxEditing CKBox editing feature} to open the CKBox file manager.
 * The file manager allows inserting an image or a link to a file into the editor content.
 *
 * ```ts
 * editor.execute( 'ckbox' );
 * ```
 *
 * **Note:** This command uses other features to perform the following tasks:
 * - To insert images it uses the {@link module:image/image/insertimagecommand~InsertImageCommand 'insertImage'} command from the
 * {@link module:image/image~Image Image feature}.
 * - To insert links to other files it uses the {@link module:link/linkcommand~LinkCommand 'link'} command from the
 * {@link module:link/link~Link Link feature}.
 */
export default class CKBoxCommand extends Command {
	declare public value: boolean;

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
	 * the {@link module:ckbox/ckboxconfig~CKBoxConfig#ignoreDataId `config.ckbox.ignoreDataId`} option is set to `false` (by default).
	 *
	 * @internal
	 */
	public readonly _chosenAssets = new Set<CKBoxAssetDefinition>();

	/**
	 * The DOM element that acts as a mounting point for the CKBox dialog.
	 */
	private _wrapper: Element | null = null;

	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		super( editor );

		this._initListeners();
	}

	/**
	 * @inheritDoc
	 */
	public override refresh(): void {
		this.value = this._getValue();
		this.isEnabled = this._checkEnabled();
	}

	/**
	 * @inheritDoc
	 */
	public override execute(): void {
		this.fire<CKBoxEvent<'open'>>( 'ckbox:open' );
	}

	/**
	 * Indicates if the CKBox dialog is already opened.
	 *
	 * @protected
	 * @returns {Boolean}
	 */
	private _getValue(): boolean {
		return this._wrapper !== null;
	}

	/**
	 * Checks whether the command can be enabled in the current context.
	 */
	private _checkEnabled() {
		const imageCommand = this.editor.commands.get( 'insertImage' )!;
		const linkCommand = this.editor.commands.get( 'link' )!;

		if ( !imageCommand.isEnabled && !linkCommand.isEnabled ) {
			return false;
		}

		return true;
	}

	/**
	 * Creates the options object for the CKBox dialog.
	 *
	 * @returns The object with properties:
	 * - theme The theme for CKBox dialog.
	 * - language The language for CKBox dialog.
	 * - tokenUrl The token endpoint URL.
	 * - serviceOrigin The base URL of the API service.
	 * - assetsOrigin The base URL for assets inserted into the editor.
	 * - dialog.onClose The callback function invoked after closing the CKBox dialog.
	 * - assets.onChoose The callback function invoked after choosing the assets.
	 */
	private _prepareOptions() {
		const editor = this.editor;
		const ckboxConfig = editor.config.get( 'ckbox' )!;

		return {
			theme: ckboxConfig.theme,
			language: ckboxConfig.language,
			tokenUrl: ckboxConfig.tokenUrl,
			serviceOrigin: ckboxConfig.serviceOrigin,
			assetsOrigin: ckboxConfig.assetsOrigin,
			dialog: {
				onClose: () => this.fire<CKBoxEvent<'close'>>( 'ckbox:close' )
			},
			assets: {
				onChoose: ( assets: Array<CKBoxRawAssetDefinition> ) => this.fire<CKBoxEvent<'choose'>>( 'ckbox:choose', assets )
			}
		};
	}

	/**
	 * Initializes various event listeners for the `ckbox:*` events, because all functionality of the `ckbox` command is event-based.
	 */
	private _initListeners() {
		const editor = this.editor;
		const model = editor.model;
		const shouldInsertDataId = !editor.config.get( 'ckbox.ignoreDataId' );

		// Refresh the command after firing the `ckbox:*` event.
		this.on<CKBoxEvent>( 'ckbox', () => {
			this.refresh();
		}, { priority: 'low' } );

		// Handle opening of the CKBox dialog.
		this.on<CKBoxEvent<'open'>>( 'ckbox:open', () => {
			if ( !this.isEnabled || this.value ) {
				return;
			}

			this._wrapper = createElement( document, 'div', { class: 'ck ckbox-wrapper' } );
			document.body.appendChild( this._wrapper );

			window.CKBox.mount( this._wrapper, this._prepareOptions() );
		} );

		// Handle closing of the CKBox dialog.
		this.on<CKBoxEvent<'close'>>( 'ckbox:close', () => {
			if ( !this.value ) {
				return;
			}

			this._wrapper!.remove();
			this._wrapper = null;
		} );

		// Handle choosing the assets.
		this.on<CKBoxEvent<'choose'>>( 'ckbox:choose', ( evt, assets ) => {
			if ( !this.isEnabled ) {
				return;
			}

			const imageCommand = editor.commands.get( 'insertImage' )!;
			const linkCommand = editor.commands.get( 'link' )!;
			const ckboxEditing: CKBoxEditing = editor.plugins.get( 'CKBoxEditing' );
			const assetsOrigin = editor.config.get( 'ckbox.assetsOrigin' )!;

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
			this.fire<CKBoxEvent<'close'>>( 'ckbox:close' );
			this._chosenAssets.clear();
		} );
	}

	/**
	 * Inserts the asset into the model.
	 *
	 * @param asset The asset to be inserted.
	 * @param isLastAsset Indicates if the current asset is the last one from the chosen set.
	 * @param writer An instance of the model writer.
	 */
	private _insertAsset(
		asset: CKBoxAssetDefinition,
		isLastAsset: boolean,
		writer: Writer
	) {
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
	 * @param asset The asset to be inserted.
	 */
	private _insertImage( asset: CKBoxAssetImageDefinition ) {
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
	 * @param asset The asset to be inserted.
	 * @param writer An instance of the model writer.
	 */
	private _insertLink( asset: CKBoxAssetLinkDefinition, writer: Writer ) {
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

/**
 * Parses the chosen assets into the internal data format. Filters out chosen assets that are not allowed.
 */
function prepareAssets(
	{ assets, origin, token, isImageAllowed, isLinkAllowed }: {
		assets: Array<CKBoxRawAssetDefinition>;
		origin: string;
		token: InitializedToken;
		isImageAllowed: boolean;
		isLinkAllowed: boolean;
	}
): Array<CKBoxAssetDefinition> {
	return assets
		.map( asset => isImage( asset ) ?
			{
				id: asset.data.id,
				type: 'image',
				attributes: prepareImageAssetAttributes( asset, token, origin )
			} as const :
			{
				id: asset.data.id,
				type: 'link',
				attributes: prepareLinkAssetAttributes( asset, token, origin )
			} as const
		)
		.filter( asset => asset.type === 'image' ? isImageAllowed : isLinkAllowed );
}

/**
 * Parses the assets attributes into the internal data format.
 *
 * @param origin The base URL for assets inserted into the editor.
 */
function prepareImageAssetAttributes(
	asset: CKBoxRawAssetDefinition,
	token: InitializedToken,
	origin: string
): CKBoxAssetImageAttributesDefinition {
	const { imageFallbackUrl, imageSources } = getImageUrls( {
		token,
		origin,
		id: asset.data.id,
		width: asset.data.metadata!.width!,
		extension: asset.data.extension
	} );

	return {
		imageFallbackUrl,
		imageSources,
		imageTextAlternative: asset.data.metadata!.description || ''
	};
}

/**
 * Parses the assets attributes into the internal data format.
 *
 * @param origin The base URL for assets inserted into the editor.
 */
function prepareLinkAssetAttributes(
	asset: CKBoxRawAssetDefinition,
	token: InitializedToken,
	origin: string
): CKBoxAssetLinkAttributesDefinition {
	return {
		linkName: asset.data.name,
		linkHref: getAssetUrl( asset, token, origin )
	};
}

/**
 * Checks whether the asset is an image.
 */
function isImage( asset: CKBoxRawAssetDefinition ) {
	const metadata = asset.data.metadata;

	if ( !metadata ) {
		return false;
	}

	return metadata.width && metadata.height;
}

/**
 * Creates the URL for the asset.
 *
 * @param origin The base URL for assets inserted into the editor.
 */
function getAssetUrl(
	asset: CKBoxRawAssetDefinition,
	token: InitializedToken,
	origin: string
) {
	const environmentId = getEnvironmentId( token );
	const url = new URL( `${ environmentId }/assets/${ asset.data.id }/file`, origin );

	url.searchParams.set( 'download', 'true' );

	return url.toString();
}

/**
 * Fired when the command is executed, the dialog is closed or the assets are chosen.
 *
 * @eventName ~CKBoxCommand#ckbox
 */
type CKBoxEvent<Name extends '' | 'choose' | 'open' | 'close' = ''> = {
	name: Name extends '' ? 'ckbox' : `ckbox:${ Name }`;
	args: Name extends 'choose' ? [ assets: Array<CKBoxRawAssetDefinition> ] : [];
};
