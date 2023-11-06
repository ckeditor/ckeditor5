/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals FormData, URL, XMLHttpRequest, window */

/**
 * @module ckbox/ckboximageedit/ckboximageeditcommand
 */

import { Command, type Editor } from 'ckeditor5/src/core';
import { createElement, global, retry } from 'ckeditor5/src/utils';
import CKBoxEditing from '../ckboxediting';

import { prepareImageAssetAttributes } from '../ckboxcommand';

import type {
	CKBoxRawAssetDefinition,
	CKBoxRawAssetDataDefinition
} from '../ckboxconfig';

import type { InsertImageCommand } from '@ckeditor/ckeditor5-image';

/**
 * The CKBox edit image command.
 *
 * Opens the CKBox dialog for editing the image.
 */
export default class CKBoxImageEditCommand extends Command {
	/**
	 * Flag indicating whether the command is active, i.e. dialog is open.
	 */
	declare public value: boolean;

	/**
	 * The DOM element that acts as a mounting point for the CKBox Edit Image dialog.
	 */
	private _wrapper: Element | null = null;

	/**
	 * Stores the value of `ckboxImageId` when image with this attribute is selected.
	 */
	private _ckboxImageId: string | null = null;

	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		super( editor );

		this.value = false;

		this._prepareListeners();
	}

	/**
	 * @inheritDoc
	 */
	public override refresh(): void {
		const editor = this.editor;

		this.value = this._getValue();

		const selectedElement = editor.model.document.selection.getSelectedElement();
		const isImageElement = selectedElement && ( selectedElement.is( 'element', 'imageInline' ) ||
			selectedElement.is( 'element', 'imageBlock' ) );

		if ( isImageElement && ( selectedElement.hasAttribute( 'ckboxImageId' ) ) ) {
			this.isEnabled = true;
			this._ckboxImageId = selectedElement.getAttribute( 'ckboxImageId' ) as string;
		} else {
			this.isEnabled = false;
			this._ckboxImageId = null;
		}
	}

	/**
	 * Opens the CKBox Image Editor dialog for editing the image.
	 */
	public override execute(): void {
		this.fire<CKBoxImageEditorEvent<'open'>>( 'ckboxImageEditor:open' );
	}

	/**
	 * Indicates if the CKBox Image Editor dialog is already opened.
	 */
	private _getValue(): boolean {
		return this._wrapper !== null;
	}

	/**
	 * Creates the options object for the CKBox Image Editor dialog.
	 *
	 * @returns The object with properties:
	 * - tokenUrl The token endpoint URL.
	 * - onClose The callback function invoked after closing the CKBox dialog.
	 * - onSave The callback function invoked after saving the edited image.
	 */
	private _prepareOptions() {
		const editor = this.editor;
		const ckboxConfig = editor.config.get( 'ckbox' )!;

		return {
			imageEditing: {
				allowOverwrite: false
			},
			tokenUrl: ckboxConfig.tokenUrl,
			onClose: () => this.fire<CKBoxImageEditorEvent<'close'>>( 'ckboxImageEditor:close' ),
			onSave: ( asset: CKBoxRawAssetDefinition ) =>
				this.fire<CKBoxImageEditorEvent<'save'>>( 'ckboxImageEditor:save', asset )
		};
	}

	/**
	 * Initializes various event listeners for the `ckboxImageEditor:*` events,
	 * because all functionality of the `ckboxImageEditor` command is event-based.
	 */
	private _prepareListeners(): void {
		const editor = this.editor;

		// Refresh the command after firing the `ckboxImageEditor:*` event.
		this.on<CKBoxImageEditorEvent>( 'ckboxImageEditor', () => {
			this.refresh();
		}, { priority: 'low' } );

		this.on<CKBoxImageEditorEvent<'open'>>( 'ckboxImageEditor:open', () => {
			if ( !this.isEnabled || this._getValue() ) {
				return;
			}

			this.value = true;
			this._wrapper = createElement( document, 'div', { class: 'ck ckbox-wrapper' } );

			global.document.body.appendChild( this._wrapper );

			window.CKBox.mountImageEditor(
				this._wrapper,
				{
					assetId: this._ckboxImageId,
					...this._prepareOptions()
				}
			);
		} );

		this.on<CKBoxImageEditorEvent<'close'>>( 'ckboxImageEditor:close', () => {
			if ( !this._wrapper ) {
				return;
			}

			this._wrapper.remove();
			this._wrapper = null;

			editor.editing.view.focus();
		} );

		this.on<CKBoxImageEditorEvent<'save'>>( 'ckboxImageEditor:save', ( evt, asset ) => {
			this._waitForAssetProcessed( asset ).then( () => {
				this.fire<CKBoxImageEditorEvent<'processed'>>( 'ckboxImageEditor:processed', asset );
			} );
		} );

		this.on<CKBoxImageEditorEvent<'processed'>>( 'ckboxImageEditor:processed', ( evt, asset ) => {
			const imageCommand: InsertImageCommand = editor.commands.get( 'insertImage' )!;

			const {
				imageFallbackUrl,
				imageSources,
				imageTextAlternative,
				imageWidth,
				imageHeight,
				imagePlaceholder
			} = prepareImageAssetAttributes( asset );

			editor.model.change( writer => {
				imageCommand.execute( {
					source: {
						src: imageFallbackUrl,
						sources: imageSources,
						alt: imageTextAlternative,
						width: imageWidth,
						height: imageHeight,
						...( imagePlaceholder ? { placeholder: imagePlaceholder } : null )
					}
				} );

				const selectedImageElement = editor.model.document.selection.getSelectedElement()!;

				writer.setAttribute( 'ckboxImageId', asset.data.id, selectedImageElement );
			} );
		} );
	}

	/**
	 * Get asset's status on server. If server respond with "success" status then
	 * image is already proceeded and ready for saving.
	 *
	 * @param data Data about certain asset.
	 */
	private async _getAssetStatusFromServer( data: CKBoxRawAssetDataDefinition ): Promise<{ status?: string }>
	{
		const url = new URL( 'assets/' + data.id, this.editor.config.get( 'ckbox.serviceOrigin' )! );

		const response = await this._sendHttpRequest( url );

		return {
			status: response.metadata.metadataProcessingStatus
		};
	}

	/**
	 * Waiting until asset is being processed.
	 *
	 * @param asset Data about certain asset.
	 */
	private _waitForAssetProcessed( asset: CKBoxRawAssetDefinition ): Promise<{ status?: string }> {
		return retry( async () => {
			const data = await this._getAssetStatusFromServer( asset.data );
			if ( !data.status || data.status == 'queued' ) {
				throw new Error( 'Image has not been processed yet.' );
			}

			return data;
		} );
	}

	/**
	 * Sends the HTTP request.
	 *
	 * @param config.url the URL where the request will be sent.
	 * @param config.method The HTTP method.
	 * @param config.data Additional data to send.
	 */
	private _sendHttpRequest( url: URL ) {
		const ckboxEditing = this.editor.plugins.get( CKBoxEditing );
		const xhr = new XMLHttpRequest();

		xhr.open( 'GET', url );
		xhr.setRequestHeader( 'Authorization', ckboxEditing.getToken().value );
		xhr.setRequestHeader( 'CKBox-Version', 'CKEditor 5' );
		xhr.responseType = 'json';

		return new Promise<any>( ( resolve, reject ) => {
			xhr.addEventListener( 'load', () => {
				const response = xhr.response;

				if ( !response || response.statusCode >= 400 ) {
					return reject( response && response.message );
				}

				return resolve( response );
			} );

			// Send the request.
			xhr.send();
		} );
	}
}

/**
 * Fired when the command is executed, the dialog is closed or the asset is saved.
 *
 * @eventName ~CKBoxImageEditCommand#ckboxImageEditor
 */
type CKBoxImageEditorEvent<Name extends '' | 'save' | 'processed' | 'open' | 'close' = ''> = {
	name: Name extends '' ? 'ckboxImageEditor' : `ckboxImageEditor:${ Name }`;
	args: Name extends 'save' | 'processed' ? [ asset: CKBoxRawAssetDefinition ] : [];
};
