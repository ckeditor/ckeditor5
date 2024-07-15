/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document, window, setTimeout, URL */

/**
 * @module uploadcare/uploadcarecommand
 */

import type { Writer } from 'ckeditor5/src/engine.js';
import { Command, type Editor } from 'ckeditor5/src/core.js';
import { createElement } from 'ckeditor5/src/utils.js';

import type * as LR from '@uploadcare/blocks';

/**
 * The Uploadcare command. It is used by the {@link module:uploadcare/uploadcareediting~UploadcareEditing Uploadcare editing feature}
 * to open the dialog with the context of the chosen uploading source.
 *
 * ```ts
 * editor.execute( 'uploadcare' );
 * ```
 */
export default class UploadcareCommand extends Command {
	declare public value: boolean;

	/**
	 * The choosen source type.
	 */
	private _type: string;

	/**
	 * The DOM element that represents the Uploadcare config web component.
	 * It is used to pass the initial configuration.
	 */
	private _configElement: Element | null = null;

	/**
	 * Represents the DOM element associated with the Uploadcare context web components.
	 * It is utilized to process operations through the Uploadcare API.
	 */
	private _ctxElement: LR.UploaderBlock | null = null;

	/**
	 * @internal
	 */
	public readonly _chosenAssets = new Set<any>();

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
	public override execute( type: string ): void {
		this._type = type;

		this.fire<UploadcareEvent<'open'>>( 'uploadcare:open' );
	}

	/**
	 * Indicates if the Uploadcare dialog is already opened.
	 *
	 * @protected
	 * @returns {Boolean}
	 */
	private _getValue(): boolean {
		return this._ctxElement !== null;
	}

	/**
	 * Checks whether the command can be enabled in the current context.
	 */
	private _checkEnabled() {
		const imageCommand = this.editor.commands.get( 'insertImage' )!;

		return imageCommand.isEnabled;
	}

	private _initConfig() {
		this._configElement = createElement( document, 'lr-config', {
			'pubKey': '532fdaa30fa803cef431',
			'ctx-name': 'uploader',
			'source-list': this._type
		} );

		document.body.appendChild( this._configElement );
	}

	private _initCtx() {
		this._ctxElement = createElement( document, 'lr-upload-ctx-provider', {
			'ctx-name': 'uploader'
		} ) as LR.UploaderBlock;

		document.body.appendChild( this._ctxElement );

		this._ctxElement.initFlow();
	}

	/**
	 * Initializes various event listeners for the `uploadcare:*` events, because all functionality
	 * of the `uploadcare` command is event-based.
	 */
	private _initListeners() {
		const editor = this.editor;

		// Refresh the command after firing the `uploadcare:*` event.
		this.on<UploadcareEvent>( 'uploadcare', () => {
			this.refresh();
		}, { priority: 'low' } );

		// Handle opening of the CKBox dialog.
		this.on<UploadcareEvent<'open'>>( 'uploadcare:open', evt => {
			if ( !this.isEnabled || this.value ) {
				return;
			}

			this._initConfig();
			this._initCtx();

			this._ctxElement!.addEventListener( 'done-click', () => {
				console.log( 'change' );
			} );
		} );

		this.on<UploadcareEvent<'close'>>( 'uploadcare:close', () => {
			if ( !this.value ) {
				return;
			}

			this._ctxElement!.doneFlow();

			this._configElement!.remove();
			this._configElement = null;

			this._ctxElement!.remove();
			this._ctxElement = null;

			editor.editing.view.focus();
		} );

		// Handle choosing the assets.
		this.on<UploadcareEvent<'choose'>>( 'uploadcare:choose', ( evt, assets ) => {
			if ( !this.isEnabled ) {
				return;
			}

			console.log( 'uploadcare:choose' );

			// const imageCommand = editor.commands.get( 'insertImage' )!;
			// const linkCommand = editor.commands.get( 'link' )!;
			//
			// const assetsToProcess = prepareAssets( {
			// 	assets,
			// 	isImageAllowed: imageCommand.isEnabled,
			// 	isLinkAllowed: linkCommand.isEnabled
			// } );
			//
			// const assetsCount = assetsToProcess.length;
			//
			// if ( assetsCount === 0 ) {
			// 	return;
			// }
			//
			// // All assets are inserted in one undo step.
			// model.change( writer => {
			// 	for ( const asset of assetsToProcess ) {
			// 		const isLastAsset = asset === assetsToProcess[ assetsCount - 1 ];
			// 		const isSingleAsset = assetsCount === 1;
			//
			// 		this._insertAsset( asset, isLastAsset, writer, isSingleAsset );
			//
			// 		// If asset ID must be set for the inserted model element, store the asset temporarily and remove it automatically
			// 		// after the timeout.
			// 		if ( shouldInsertDataId ) {
			// 			setTimeout( () => this._chosenAssets.delete( asset ), ASSET_INSERTION_WAIT_TIMEOUT );
			//
			// 			this._chosenAssets.add( asset );
			// 		}
			// 	}
			// } );
			//
			// editor.editing.view.focus();
		} );

		// Clean up after the editor is destroyed.
		this.listenTo( editor, 'destroy', () => {
			this.fire<UploadcareEvent<'close'>>( 'uploadcare:close' );
			this._chosenAssets.clear();
		} );
	}

	/**
	 * Inserts the asset into the model.
	 *
	 * @param asset The asset to be inserted.
	 * @param isLastAsset Indicates if the current asset is the last one from the chosen set.
	 * @param writer An instance of the model writer.
	 * @param isSingleAsset It's true when only one asset is processed.
	 */
	private _insertAsset(
		asset: any,
		isLastAsset: boolean,
		writer: Writer,
		isSingleAsset: boolean
	) {
		const editor = this.editor;
		const model = editor.model;
		const selection = model.document.selection;

		// Remove the `linkHref` attribute to not affect the asset to be inserted.
		writer.removeSelectionAttribute( 'linkHref' );

		if ( asset.type === 'image' ) {
			this._insertImage( asset );
		} else {
			return;
		}

		// Except for the last chosen asset, move the selection to the end of the current range to avoid overwriting other, already
		// inserted assets.
		if ( !isLastAsset ) {
			writer.setSelection( selection.getLastPosition()! );
		}
	}

	/**
	 * Inserts the image by calling the `insertImage` command.
	 *
	 * @param asset The asset to be inserted.
	 */
	private _insertImage( asset: any ) {
		const editor = this.editor;
		const {
			imageFallbackUrl,
			imageSources,
			imageTextAlternative,
			imageWidth,
			imageHeight,
			imagePlaceholder
		} = asset.attributes;

		editor.execute( 'insertImage', {
			source: {
				src: imageFallbackUrl,
				sources: imageSources,
				alt: imageTextAlternative,
				width: imageWidth,
				height: imageHeight,
				...( imagePlaceholder ? { placeholder: imagePlaceholder } : null )
			}
		} );
	}
}

/**
 * Fired when the command is executed, the dialog is closed or the assets are chosen.
 *
 * @eventName ~UploadcareCommand#uploadcare
 */
type UploadcareEvent<Name extends '' | 'choose' | 'open' | 'close' = ''> = {
	name: Name extends '' ? 'uploadcare' : `uploadcare:${ Name }`;
	args: Name extends 'choose' ? [ assets: Array<any> ] : [];
};
