/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals AbortController, URL, window */

/**
 * @module ckbox/ckboximageedit/ckboximageeditcommand
 */

import { Command, PendingActions, type Editor } from 'ckeditor5/src/core';
import { createElement, global, retry } from 'ckeditor5/src/utils';
import type { Element as ModelElement } from 'ckeditor5/src/engine';
import { Notification } from 'ckeditor5/src/ui';
import { isEqual } from 'lodash-es';

import CKBoxEditing from '../ckboxediting';
import { sendHttpRequest } from '../utils';
import { prepareImageAssetAttributes } from '../ckboxcommand';
import type { CKBoxRawAssetDefinition, CKBoxRawAssetDataDefinition } from '../ckboxconfig';

import type { InsertImageCommand, ImageUtils } from '@ckeditor/ckeditor5-image';

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
	 * TODO
	 */
	private _processInProgress = new Map<string, ProcessingState>();

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
		const isImageElement = selectedElement && (
			selectedElement.is( 'element', 'imageInline' ) ||
			selectedElement.is( 'element', 'imageBlock' )
		);
		const isBeingProcessed = Array.from( this._processInProgress.values() )
			.some( ( { element } ) => isEqual( element, selectedElement ) );

		if ( isImageElement && selectedElement.hasAttribute( 'ckboxImageId' ) && !isBeingProcessed ) {
			this.isEnabled = true;
		} else {
			this.isEnabled = false;
		}
	}

	/**
	 * Opens the CKBox Image Editor dialog for editing the image.
	 */
	public override execute(): void {
		if ( !this.isEnabled || this._getValue() ) {
			return;
		}

		this.value = true;
		this._wrapper = createElement( document, 'div', { class: 'ck ckbox-wrapper' } );

		global.document.body.appendChild( this._wrapper );

		const imageElement = this.editor.model.document.selection.getSelectedElement()!;
		const ckboxImageId = imageElement.getAttribute( 'ckboxImageId' ) as string;

		const processingState: ProcessingState = {
			ckboxImageId,
			element: imageElement,
			controller: new AbortController()
		};

		window.CKBox.mountImageEditor( this._wrapper, this._prepareOptions( processingState ) );

		this.refresh();
	}

	public override destroy(): void {
		this._handleImageEditorOnClose();

		for ( const state of this._processInProgress.values() ) {
			state.controller.abort();
		}

		super.destroy();
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
	private _prepareOptions( state: ProcessingState ) {
		const editor = this.editor;
		const ckboxConfig = editor.config.get( 'ckbox' )!;

		return {
			assetId: state.ckboxImageId,
			imageEditing: {
				allowOverwrite: false
			},
			tokenUrl: ckboxConfig.tokenUrl,
			onClose: () => this._handleImageEditorOnClose(),
			onSave: ( asset: CKBoxRawAssetDefinition ) => this._handleImageEditorOnSave( state, asset )
		};
	}

	/**
	 * Initializes various event listeners for the `ckboxImageEditor:*` events,
	 * because all functionality of the `ckboxImageEditor` command is event-based.
	 */
	private _prepareListeners(): void {
		// Abort editing processing when the image has been removed.
		this.listenTo( this.editor.model.document, 'change:data', () => {
			const processingStates = this._getProcessesWithDeletedImage();

			processingStates.forEach( processingState => {
				processingState.controller.abort();
			} );
		} );
	}

	/**
	 * If in some process there is image which is already removed it returns that process.
	 */
	private _getProcessesWithDeletedImage(): Array<ProcessingState> {
		const states: Array<ProcessingState> = [];

		for ( const state of this._processInProgress.values() ) {
			if ( state.element.root.rootName == '$graveyard' ) {
				states.push( state );
			}
		}

		return states;
	}

	/**
	 * Close image editor.
	 */
	private _handleImageEditorOnClose() {
		if ( !this._wrapper ) {
			return;
		}

		this._wrapper.remove();
		this._wrapper = null;

		this.editor.editing.view.focus();

		this.refresh();
	}

	/**
	 * Save edited image. In case server respond with "success" replace with edited image,
	 * otherwise show notification error.
	 */
	private _handleImageEditorOnSave( state: ProcessingState, asset: CKBoxRawAssetDefinition ) {
		const t = this.editor.locale.t;
		const notification = this.editor.plugins.get( Notification );
		const pendingActions = this.editor.plugins.get( PendingActions );
		const action = pendingActions.add( t( 'Processing the edited image.' ) );

		this._processInProgress.set( state.ckboxImageId, state );
		this._showImageProcessingIndicator( asset );

		this._waitForAssetProcessed( asset.data.id, state.controller.signal )
			.then(
				asset => {
					this._replaceImage( state.element, asset );
				},
				() => {
					if ( !state.controller.signal.aborted ) {
						notification.showWarning( t( 'Server failed image processing or didn\'t respond' ), {
							title: t( 'Server failed image processing or didn\'t respond' ),
							namespace: 'ckbox'
						} );
					}

					// Remove processing indicator. It was added only to ViewElement.
					this.editor.editing.reconvertItem( state.element );
				}
			).finally( () => {
				this._processInProgress.delete( state.ckboxImageId );
				pendingActions.remove( action );
			} );

		this.refresh();
	}

	/**
	 * Get asset's status on server. If server respond with "success" status then
	 * image is already proceeded and ready for saving.
	 *
	 * @param id Id of desired asset.
	 * @param signal Abort connection with server.
	 */
	private async _getAssetStatusFromServer( id: string, signal: AbortSignal ): Promise<CKBoxRawAssetDefinition> {
		const url = new URL( 'assets/' + id, this.editor.config.get( 'ckbox.serviceOrigin' )! );
		const ckboxEditing = this.editor.plugins.get( CKBoxEditing );
		const response: CKBoxRawAssetDataDefinition = await sendHttpRequest( {
			url,
			signal,
			authorization: ckboxEditing.getToken().value
		} );
		const status = response.metadata!.metadataProcessingStatus;

		if ( !status || status == 'queued' ) {
			throw new Error( 'Image has not been processed yet.' );
		}

		return { data: { ...response } };
	}

	private async _waitForAssetProcessed( id: string, signal: AbortSignal ): Promise<CKBoxRawAssetDefinition> {
		const result = await retry(
			() => this._getAssetStatusFromServer( id, signal ),
			{
				signal,
				maxAttempts: 5
			}
		);

		if ( result.data.metadata!.metadataProcessingStatus != 'success' ) {
			throw new Error( 'Image processing failed.' );
		}

		return result;
	}

	/**
	 * Shows processing indicator while image is processing.
	 *
	 * @param asset Data about certain asset.
	 */
	private _showImageProcessingIndicator( asset: CKBoxRawAssetDefinition ): void {
		const editor = this.editor;
		const selectedImageElement = editor.model.document.selection.getSelectedElement()!;

		editor.editing.view.change( writer => {
			const imageElementView = editor.editing.mapper.toViewElement( selectedImageElement )!;
			const imageUtils: ImageUtils = this.editor.plugins.get( 'ImageUtils' );
			const img = imageUtils.findViewImgElement( imageElementView )!;

			writer.removeStyle( 'aspect-ratio', img );
			writer.setAttribute( 'width', asset.data.metadata!.width, img );
			writer.setAttribute( 'height', asset.data.metadata!.height, img );

			writer.setStyle( 'width', `${ asset.data.metadata!.width }px`, img );
			writer.setStyle( 'height', `${ asset.data.metadata!.height }px`, img );

			writer.addClass( 'image-processing', imageElementView );
		} );
	}

	/**
	 * Replace the edited image with the new one.
	 */
	private _replaceImage( element: ModelElement, asset: CKBoxRawAssetDefinition ) {
		const editor = this.editor;
		const imageCommand: InsertImageCommand = editor.commands.get( 'insertImage' )!;

		const {
			imageFallbackUrl,
			imageSources,
			imageWidth,
			imageHeight,
			imagePlaceholder
		} = prepareImageAssetAttributes( asset );

		const previousSelectionRanges = Array.from( editor.model.document.selection.getRanges() );

		editor.model.change( writer => {
			writer.setSelection( element, 'on' );

			imageCommand.execute( {
				source: {
					src: imageFallbackUrl,
					sources: imageSources,
					alt: element.getAttribute( 'alt' ),
					width: imageWidth,
					height: imageHeight,
					...( imagePlaceholder ? { placeholder: imagePlaceholder } : null )
				}
			} );

			element = editor.model.document.selection.getSelectedElement()!;

			writer.setAttribute( 'ckboxImageId', asset.data.id, element );

			writer.setSelection( previousSelectionRanges );
		} );
	}
}

interface ProcessingState {
	ckboxImageId: string;
	element: ModelElement;
	controller: AbortController;
}
