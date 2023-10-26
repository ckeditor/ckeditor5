/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals AbortController, FormData, URL, XMLHttpRequest, window */

/**
 * @module ckbox/ckboximageedit/ckboximageeditcommand
 */

import { Command, type Editor } from 'ckeditor5/src/core';
import { createElement, global } from 'ckeditor5/src/utils';
import { prepareAssets } from '../ckboxcommand';
import CKBoxEditing from '../ckboxediting';

import type {
	CKBoxAssetDefinition,
	CKBoxAssetImageAttributesDefinition,
	CKBoxRawAssetDefinition,
	CKBoxRawAssetDataDefinition
} from '../ckboxconfig';

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
			tokenUrl: ckboxConfig.tokenUrl,
			onClose: () => this.fire<CKBoxImageEditorEvent<'close'>>( 'ckboxImageEditor:close' ),
			onSave: ( data: CKBoxRawAssetDefinition ) =>
				this.fire<CKBoxImageEditorEvent<'save'>>( 'ckboxImageEditor:save', data )
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

			console.log( this._ckboxImageId );

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

		this.on<CKBoxImageEditorEvent<'save'>>( 'ckboxImageEditor:save', ( evt, { data } ) => {
			const url = new URL( 'assets/' + data.id, editor.config.get( 'ckbox.serviceOrigin' )! );
			const formData = new FormData();
			const requestConfig = {
				url,
				data: formData
			} as const;

			let limit = 10;

			const setIntervalId = setInterval( () => {
				this._sendHttpRequest( requestConfig ).then( res => {
					if ( res.metadata.metadataProcessingStatus === 'success' ) {
						this.updateImage( data );
						clearInterval( setIntervalId );
					}

					if ( limit === 0 ) {
						clearInterval( setIntervalId );
					}

					limit--;
				} );
			}, 1000 );
		} );
	}

	/**
	 * Updates image in model.
	 *
	 * @param config.data Data assets definitions.
	 */
	public updateImage( data: CKBoxRawAssetDataDefinition ): void {
		const editor = this.editor;
		const imageCommand = editor.commands.get( 'insertImage' )!;

		const preparedAsset: CKBoxAssetDefinition = prepareAssets( {
			assets: [ { data } ],
			isImageAllowed: imageCommand.isEnabled,
			isLinkAllowed: false
		} )[ 0 ];

		const {
			imageFallbackUrl,
			imageSources,
			imageTextAlternative,
			imageWidth,
			imageHeight,
			imagePlaceholder
		} = preparedAsset.attributes as CKBoxAssetImageAttributesDefinition;

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

			writer.setAttribute( 'ckboxImageId', data.id, selectedImageElement );

			this.fire<CKBoxImageEditorEvent<'processed'>>( 'ckboxImageEditor:processed', { data } );
		} );

		this.on<CKBoxImageEditorEvent<'processed'>>( 'ckboxImageEditor:processed', ( evt, data ) => {
			// TODO: finish the process (remove the indicator, etc.).
		} );
	}

	/**
	 * Sends the HTTP request.
	 *
	 * @param config.url the URL where the request will be sent.
	 * @param config.method The HTTP method.
	 * @param config.data Additional data to send.
	 */
	private _sendHttpRequest( { url, method = 'GET', data }: {
		url: URL;
		method?: 'GET' | 'POST';
		data?: FormData | null;
	} ) {
		const ckboxEditing = this.editor.plugins.get( CKBoxEditing );
		const controller = new AbortController();
		const signal = controller.signal;
		const xhr = new XMLHttpRequest();

		xhr.open( method, url.toString(), true );
		xhr.setRequestHeader( 'Authorization', ckboxEditing.getToken().value );
		xhr.setRequestHeader( 'CKBox-Version', 'CKEditor 5' );
		xhr.responseType = 'json';

		// The callback is attached to the `signal#abort` event.
		const abortCallback = () => {
			xhr.abort();
		};

		return new Promise<any>( ( resolve, reject ) => {
			signal.addEventListener( 'abort', abortCallback );

			xhr.addEventListener( 'loadstart', () => {
				signal.addEventListener( 'abort', abortCallback );
			} );

			xhr.addEventListener( 'loadend', () => {
				signal.removeEventListener( 'abort', abortCallback );
			} );

			xhr.addEventListener( 'error', () => {
				reject();
			} );

			xhr.addEventListener( 'abort', () => {
				reject();
			} );

			xhr.addEventListener( 'load', async () => {
				const response = xhr.response;

				if ( !response || response.statusCode >= 400 ) {
					return reject( response && response.message );
				}

				return resolve( response );
			} );

			// Send the request.
			xhr.send( data );
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
	args: Name extends 'save' | 'processed' ? [ data: CKBoxRawAssetDefinition ] : [];
};
