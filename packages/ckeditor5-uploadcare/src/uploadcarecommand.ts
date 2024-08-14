/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

/**
 * @module uploadcare/uploadcarecommand
 */

import type { Writer } from 'ckeditor5/src/engine.js';
import { Command, icons, type Editor } from 'ckeditor5/src/core.js';
import { createElement } from 'ckeditor5/src/utils.js';
import { Dialog, DialogViewPosition } from 'ckeditor5/src/ui.js';

import * as UC from '@uploadcare/file-uploader';

import UploadcareFormView from './ui/uploadcareformview.js';
import type { UploadcareAssetImageDefinition, UploadcareSource } from './uploadcareconfig.js';
import { getTranslation } from './utils/common-translations.js';

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
	private _type: null | UploadcareSource;

	/**
	 * The DOM element that represents the Uploadcare config web component.
	 * It is used to pass the initial configuration.
	 */
	private _configElement: Element | null = null;

	/**
	 * Represents the DOM element associated with the Uploadcare context web components.
	 * It delivers the Uploadcare API and emits the file events.
	 */
	private _ctxElement: UC.UploaderBlock | null = null;

	/**
	 * Represents the Uploadcare API object.
	 */
	private _api: UC.UploaderPublicApi | null = null;

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
	public override execute( type: UploadcareSource ): void {
		if ( !this.isEnabled ) {
			return;
		}

		this._type = type;

		if ( !this._ctxElement ) {
			this._initComponents();
		} else {
			this._reinitFlow();
		}

		// It should be called after initializing all elements.
		this._api!.initFlow();
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
		UC.defineComponents( UC );

		this._initConfig();
		this._initCtx();
		this._initDialog();
		this._initListeners();
	}

	/**
	 * Finishes the current flow and updates the components if they are already initialized.
	 */
	private _reinitFlow() {
		this._api!.doneFlow();
		this._configElement!.setAttribute( 'source-list', this._type );

		if ( this._dialog.isOpen ) {
			this._dialog.hide();
		}

		this._initDialog();
	}

	private _initConfig() {
		const configOptions = this.editor.config.get( 'uploadcare' ) || {};

		this._configElement = createElement( document, 'lr-config', {
			...configOptions,
			'ctx-name': 'uploader',
			'sourceList': this._type,
			'imgOnly': true,
			'removeCopyright': true,
			'localeName': this.editor.locale.contentLanguage
		} );

		document.body.appendChild( this._configElement );
	}

	private _initCtx() {
		this._ctxElement = createElement( document, 'lr-upload-ctx-provider', {
			'ctx-name': 'uploader'
		} ) as UC.UploaderBlock;

		document.body.appendChild( this._ctxElement );

		this._api = this._ctxElement!.getAPI();
	}

	private _initDialog() {
		const { locale } = this.editor;

		const form = new UploadcareFormView( locale );

		this._dialog.show( {
			id: 'uploadCare',
			icon: icons.imageUpload,
			title: getTranslation( locale, this._type! ).text,
			content: form,
			position: DialogViewPosition.EDITOR_TOP_CENTER,
			onShow: () => {
				form.focus();
			},
			onHide: () => {
				this._close();
			}
		} );
	}

	/**
	 * Clears the current state and removes the created elements.
	 */
	private _close() {
		this._api!.removeAllFiles();

		this.editor.editing.view.focus();
	}

	/**
	 * Initializes various event listeners for the events, because all functionality
	 * of the `uploadcare` is event-based.
	 */
	private _initListeners() {
		const editor = this.editor;

		this._ctxElement!.addEventListener( 'done-click', () => {
			const { allEntries } = this._api!.getOutputCollectionState();

			const model = this.editor.model;

			// All assets are inserted in one undo step.
			model.change( writer => {
				const entriesCount = allEntries.length;

				for ( const entry of allEntries ) {
					const isLastAsset = entry === allEntries[ entriesCount - 1 ];
					const { cdnUrl, fileInfo } = entry;

					if ( !cdnUrl || !fileInfo ) {
						continue;
					}

					const asset: UploadcareAssetImageDefinition = {
						id: fileInfo!.uuid,
						type: 'image',
						url: cdnUrl
					};

					this._insertAsset( asset, isLastAsset, writer );
				}
			} );

			this._dialog.hide();
		} );

		this._ctxElement!.addEventListener( 'change', ( evt: CustomEvent<UC.OutputCollectionState> ) => {
			// Whenever the `clear` button is triggered we need to re-init the flow.
			if ( evt.detail.status === 'idle' && !evt.detail.allEntries.length ) {
				const activity = this._type === 'local' ? 'start-from' : this._type;

				this._api!.setCurrentActivity( activity );
			}
		} );

		// Clean up after the editor is destroyed.
		this.listenTo( editor, 'destroy', () => {
			this._close();

			this._configElement!.remove();
			this._configElement = null;

			this._ctxElement!.remove();
			this._ctxElement = null;
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

		editor.execute( 'insertImage', {
			source: asset.url
		} );
	}
}
