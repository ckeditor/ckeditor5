/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document, console, AbortController, URL, window */

/**
 * @module ckbox/ckboximageedit/ckboximageeditcommand
 */

import { Command, PendingActions, type Editor } from 'ckeditor5/src/core.js';
import {
	CKEditorError,
	abortableDebounce,
	createElement,
	retry,
	delay,
	type AbortableFunc
} from 'ckeditor5/src/utils.js';
import type { Element as ModelElement } from 'ckeditor5/src/engine.js';
import { Notification } from 'ckeditor5/src/ui.js';
import { isEqual } from 'lodash-es';

import { sendHttpRequest } from '../utils.js';
import { prepareImageAssetAttributes } from '../ckboxcommand.js';
import type { CKBoxRawAssetDefinition, CKBoxRawAssetDataDefinition } from '../ckboxconfig.js';

import type { ImageUtils } from '@ckeditor/ckeditor5-image';
import { createEditabilityChecker } from './utils.js';
import CKBoxUtils from '../ckboxutils.js';

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
	 * The states of image processing in progress.
	 */
	private _processInProgress = new Set<ProcessingState>();

	/**
	 * Determines if the element can be edited.
	 */
	private _canEdit: ( element: ModelElement ) => boolean;

	/**
	 * A wrapper function to prepare mount options. Ensures that at most one preparation is in-flight.
	 */
	private _prepareOptions: AbortableFunc<[ ProcessingState ], Promise<Record<string, unknown>>>;

	/**
	* CKBox's onClose function runs before the final cleanup, potentially causing
	* page layout changes after it finishes. To address this, we use a setTimeout hack
	* to ensure that floating elements on the page maintain their correct position.
	*
	* See: https://github.com/ckeditor/ckeditor5/issues/16153.
	*/
	private _updateUiDelayed = delay( () => this.editor.ui.update(), 0 );

	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		super( editor );

		this.value = false;

		this._canEdit = createEditabilityChecker( editor.config.get( 'ckbox.allowExternalImagesEditing' ) );
		this._prepareOptions = abortableDebounce( ( signal, state ) => this._prepareOptionsAbortable( signal, state ) );

		this._prepareListeners();
	}

	/**
	 * @inheritDoc
	 */
	public override refresh(): void {
		const editor = this.editor;

		this.value = this._getValue();

		const selectedElement = editor.model.document.selection.getSelectedElement();

		this.isEnabled =
			!!selectedElement &&
			this._canEdit( selectedElement ) &&
			!this._checkIfElementIsBeingProcessed( selectedElement );
	}

	/**
	 * Opens the CKBox Image Editor dialog for editing the image.
	 */
	public override execute(): void {
		if ( this._getValue() ) {
			return;
		}

		const wrapper = createElement( document, 'div', { class: 'ck ckbox-wrapper' } );

		this._wrapper = wrapper;
		this.value = true;

		document.body.appendChild( this._wrapper );

		const imageElement = this.editor.model.document.selection.getSelectedElement()!;

		const processingState: ProcessingState = {
			element: imageElement,
			controller: new AbortController()
		};

		this._prepareOptions( processingState ).then(
			options => window.CKBox.mountImageEditor( wrapper, options ),
			error => {
				const editor = this.editor;
				const t = editor.t;
				const notification = editor.plugins.get( Notification );

				notification.showWarning( t( 'Failed to determine category of edited image.' ), {
					namespace: 'ckbox'
				} );
				console.error( error );
				this._handleImageEditorClose();
			}
		);
	}

	/**
	 * @inheritDoc
	 */
	public override destroy(): void {
		this._handleImageEditorClose();

		this._prepareOptions.abort();

		this._updateUiDelayed.cancel();

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
	 */
	private async _prepareOptionsAbortable( signal: AbortSignal, state: ProcessingState ) {
		const editor = this.editor;
		const ckboxConfig = editor.config.get( 'ckbox' )!;
		const ckboxUtils = editor.plugins.get( CKBoxUtils );
		const { element } = state;

		let imageMountOptions;
		const ckboxImageId = element.getAttribute( 'ckboxImageId' );

		if ( ckboxImageId ) {
			imageMountOptions = {
				assetId: ckboxImageId
			};
		} else {
			const imageUrl = new URL( element.getAttribute( 'src' ) as string, document.baseURI ).href;
			const uploadCategoryId = await ckboxUtils.getCategoryIdForFile( imageUrl, { signal } );

			imageMountOptions = {
				imageUrl,
				uploadCategoryId
			};
		}

		return {
			...imageMountOptions,
			imageEditing: {
				allowOverwrite: false
			},
			tokenUrl: ckboxConfig.tokenUrl,
			...( ckboxConfig.serviceOrigin && { serviceOrigin: ckboxConfig.serviceOrigin } ),
			onClose: () => this._handleImageEditorClose(),
			onSave: ( asset: CKBoxRawAssetDefinition ) => this._handleImageEditorSave( state, asset )
		};
	}

	/**
	 * Initializes event lister for an event of removing an image.
	 */
	private _prepareListeners(): void {
		// Abort editing processing when the image has been removed.
		this.listenTo( this.editor.model.document, 'change:data', () => {
			const processingStates = this._getProcessingStatesOfDeletedImages();

			processingStates.forEach( processingState => {
				processingState.controller.abort();
			} );
		} );
	}

	/**
	 * Gets processing states of images that have been deleted in the mean time.
	 */
	private _getProcessingStatesOfDeletedImages(): Array<ProcessingState> {
		const states: Array<ProcessingState> = [];

		for ( const state of this._processInProgress.values() ) {
			if ( state.element.root.rootName == '$graveyard' ) {
				states.push( state );
			}
		}

		return states;
	}

	private _checkIfElementIsBeingProcessed( selectedElement: ModelElement ) {
		for ( const { element } of this._processInProgress ) {
			if ( isEqual( element, selectedElement ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Closes the CKBox Image Editor dialog.
	 */
	private _handleImageEditorClose() {
		if ( !this._wrapper ) {
			return;
		}

		this._wrapper.remove();
		this._wrapper = null;

		this.editor.editing.view.focus();

		this._updateUiDelayed();

		this.refresh();
	}

	/**
	 * Save edited image. In case server respond with "success" replace with edited image,
	 * otherwise show notification error.
	 */
	private _handleImageEditorSave( state: ProcessingState, asset: CKBoxRawAssetDefinition ) {
		const t = this.editor.locale.t;
		const notification = this.editor.plugins.get( Notification );
		const pendingActions = this.editor.plugins.get( PendingActions );
		const action = pendingActions.add( t( 'Processing the edited image.' ) );

		this._processInProgress.add( state );
		this._showImageProcessingIndicator( state.element, asset );
		this.refresh();

		this._waitForAssetProcessed( asset.data.id, state.controller.signal )
			.then(
				asset => {
					this._replaceImage( state.element, asset );
				},
				error => {
					// Remove processing indicator. It was added only to ViewElement.
					this.editor.editing.reconvertItem( state.element );

					if ( state.controller.signal.aborted ) {
						return;
					}

					if ( !error || error instanceof CKEditorError ) {
						notification.showWarning( t( 'Server failed to process the image.' ), {
							namespace: 'ckbox'
						} );
					} else {
						console.error( error );
					}
				}
			).finally( () => {
				this._processInProgress.delete( state );
				pendingActions.remove( action );
				this.refresh();
			} );
	}

	/**
	 * Get asset's status on server. If server responds with "success" status then
	 * image is already proceeded and ready for saving.
	 */
	private async _getAssetStatusFromServer( id: string, signal: AbortSignal ): Promise<CKBoxRawAssetDefinition> {
		const ckboxUtils = this.editor.plugins.get( CKBoxUtils );

		const url = new URL( 'assets/' + id, this.editor.config.get( 'ckbox.serviceOrigin' )! );
		const response: CKBoxRawAssetDataDefinition = await sendHttpRequest( {
			url,
			signal,
			authorization: ( await ckboxUtils.getToken() ).value
		} );
		const status = response.metadata!.metadataProcessingStatus;

		if ( !status || status == 'queued' ) {
			/**
			 * Image has not been processed yet.
			 *
			 * @error ckbox-image-not-processed
			 */
			throw new CKEditorError( 'ckbox-image-not-processed' );
		}

		return { data: { ...response } };
	}

	/**
	 * Waits for an asset to be processed.
	 * It retries retrieving asset status from the server in case of failure.
	 */
	private async _waitForAssetProcessed( id: string, signal: AbortSignal ): Promise<CKBoxRawAssetDefinition> {
		const result = await retry(
			() => this._getAssetStatusFromServer( id, signal ),
			{
				signal,
				maxAttempts: 5
			}
		);

		if ( result.data.metadata!.metadataProcessingStatus != 'success' ) {
			/**
			 * The image processing failed.
			 *
			 * @error ckbox-image-processing-failed
			 */
			throw new CKEditorError( 'ckbox-image-processing-failed' );
		}

		return result;
	}

	/**
	 * Shows processing indicator while image is processing.
	 *
	 * @param asset Data about certain asset.
	 */
	private _showImageProcessingIndicator( element: ModelElement, asset: CKBoxRawAssetDefinition ): void {
		const editor = this.editor;

		editor.editing.view.change( writer => {
			const imageElementView = editor.editing.mapper.toViewElement( element )!;
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

			editor.execute( 'insertImage', {
				source: {
					src: imageFallbackUrl,
					sources: imageSources,
					width: imageWidth,
					height: imageHeight,
					...( imagePlaceholder ? { placeholder: imagePlaceholder } : null ),
					...( element.hasAttribute( 'alt' ) ? { alt: element.getAttribute( 'alt' ) } : null )
				}
			} );

			const previousChildren = element.getChildren();

			element = editor.model.document.selection.getSelectedElement()!;

			for ( const child of previousChildren ) {
				writer.append( writer.cloneElement( child as ModelElement ), element );
			}

			writer.setAttribute( 'ckboxImageId', asset.data.id, element );

			writer.setSelection( previousSelectionRanges );
		} );
	}
}

interface ProcessingState {
	element: ModelElement;
	controller: AbortController;
}
