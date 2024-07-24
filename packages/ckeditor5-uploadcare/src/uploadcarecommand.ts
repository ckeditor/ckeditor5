/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

/**
 * @module uploadcare/uploadcarecommand
 */

import type { Writer } from 'ckeditor5/src/engine.js';
import { Command, type Editor } from 'ckeditor5/src/core.js';
import { createElement } from 'ckeditor5/src/utils.js';
import { Dialog } from 'ckeditor5/src/ui.js';

import * as LR from '@uploadcare/blocks';

import UploadcareFormView from './ui/uploadcareformview.js';
import imageUploadIcon from '../theme/icons/image-upload.svg';
import { type UploadcareAssetImageDefinition } from './uploadcareconfig.js';

/**
 * The Uploadcare command. It is used by the {@link module:uploadcare/uploadcareediting~UploadcareEditing Uploadcare editing feature}
 * to open the dialog with the context of the chosen uploading source.
 *
 * ```ts
 * editor.execute( 'uploadcare' );
 * ```
 */
export default class UploadcareCommand extends Command {
	/**
	 * The dialog plugin instance.
	 *
	 * @internal
	 */
	private _dialog!: Dialog;

	/**
	 * The choosen source type.
	 */
	private _type: null | string;

	/**
	 * The DOM element that represents the Uploadcare config web component.
	 * It is used to pass the initial configuration.
	 */
	private _configElement: Element | null = null;

	/**
	 * Represents the DOM element associated with the Uploadcare context web components.
	 * It delivers the Uploadcare API.
	 */
	private _ctxElement: LR.UploaderBlock | null = null;

	/**
	 * Represents the Uploadcare API object.
	 */
	private _api: LR.UploaderPublicApi | null = null;

	/**
	 * @internal
	 */
	public readonly _chosenAssets = new Set<UploadcareAssetImageDefinition>();

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ Dialog ] as const;
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		super( editor );

		this._dialog = editor.plugins.get( Dialog );
	}

	/**
	 * @inheritDoc
	 */
	public override refresh(): void {
		this.isEnabled = this._checkEnabled();
	}

	/**
	 * @inheritDoc
	 */
	public override execute( type: string ): void {
		if ( !this.isEnabled ) {
			return;
		}

		this._type = type;

		if ( !this._ctxElement ) {
			this._initComponents();
		} else {
			this._reinitFlow();
		}

		this._api = this._ctxElement!.getAPI();
		// It should be called after initializing all elements.
		this._api.initFlow();
	}

	/**
	 * Checks whether the command can be enabled in the current context.
	 */
	private _checkEnabled() {
		const imageCommand = this.editor.commands.get( 'insertImage' )!;

		return imageCommand.isEnabled;
	}

	/**
	 * Initializes the necessary components.
	 * Registers blocks, initializes configuration, context, dialog, and listeners.
	 */
	private _initComponents() {
		LR.registerBlocks( LR );

		this._initConfig();
		this._initCtx();
		this._initDialog();
		this._initListeners();
	}

	/**
	 * Finishes the current flow and updates the components if they are already initialized.
	 * It is used when the dialog is already open and the command is executed with another type.
	 */
	private _reinitFlow() {
		this._api!.doneFlow();
		this._configElement!.setAttribute( 'source-list', this._type );
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
	}

	private _initDialog() {
		const { editor: { locale } } = this;
		const { t } = locale;

		const form = new UploadcareFormView( locale );

		this._dialog.show( {
			id: 'uploadCare',
			icon: imageUploadIcon,
			title: t( 'Uploadcare' ),
			content: form,
			onHide: () => {
				this._close();
			}
		} );
	}

	/**
	 * Clears the current state and removes the created elements.
	 */
	private _close() {
		this._dialog.hide();

		this._type = null;
		this._chosenAssets.clear();

		this._configElement!.remove();
		this._configElement = null;

		this._ctxElement!.remove();
		this._ctxElement = null;

		this.editor.editing.view.focus();
	}

	/**
	 * Initializes various event listeners for the events, because all functionality
	 * of the `uploadcare` is event-based.
	 */
	private _initListeners() {
		const editor = this.editor;

		this._ctxElement!.addEventListener( 'done-click', () => {
			const model = this.editor.model;

			// All assets are inserted in one undo step.
			model.change( writer => {
				const assetsToProcess = Array.from( this._chosenAssets );
				const assetsCount = assetsToProcess.length;

				for ( const asset of assetsToProcess ) {
					const isLastAsset = asset === assetsToProcess[ assetsCount - 1 ];

					this._insertAsset( asset, isLastAsset, writer );
				}
			} );

			this._close();
		} );

		this._ctxElement!.addEventListener( 'change', ( evt: CustomEvent<LR.OutputCollectionState> ) => {
			// Whenever the `clear` button is triggered we need to re-init the flow.
			if ( evt.detail.status === 'success' && !evt.detail.allEntries.length ) {
				this._chosenAssets.clear();
				this._ctxElement!.initFlow();
			}
		} );

		// Handle choosing the assets.
		this._ctxElement!.addEventListener( 'file-upload-success', ( evt: CustomEvent<LR.OutputFileEntry> ) => {
			const { fileInfo } = evt.detail;

			if ( !this.isEnabled || !fileInfo ) {
				return;
			}

			const asset: UploadcareAssetImageDefinition = {
				id: fileInfo.uuid,
				type: 'image',
				attributes: {
					imageFallbackUrl: fileInfo.cdnUrl,
					imageWidth: fileInfo.imageInfo!.width,
					imageHeight: fileInfo.imageInfo!.height
				}
			};

			this._chosenAssets.add( asset );

			editor.editing.view.focus();
		} );

		// Clean up after the editor is destroyed.
		this.listenTo( editor, 'destroy', () => {
			this._close();
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
		asset: any,
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
	private _insertImage( asset: UploadcareAssetImageDefinition ) {
		const editor = this.editor;
		const {
			imageFallbackUrl,
			imageWidth,
			imageHeight
		} = asset.attributes;

		editor.execute( 'insertImage', {
			source: {
				src: imageFallbackUrl,
				width: imageWidth,
				height: imageHeight
			}
		} );
	}
}
