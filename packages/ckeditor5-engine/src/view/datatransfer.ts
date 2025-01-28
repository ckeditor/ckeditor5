/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module engine/view/datatransfer
 */

type DomDataTransfer = globalThis.DataTransfer;

/**
 * A facade over the native [`DataTransfer`](https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer) object.
 */
export default class DataTransfer {
	/**
	 * The array of files created from the native `DataTransfer#files` or `DataTransfer#items`.
	 */
	private _files: Array<File> | null;

	/**
	 * The native DataTransfer object.
	 */
	private _native: DomDataTransfer;

	/**
	 * @param nativeDataTransfer The native [`DataTransfer`](https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer) object.
	 * @param options.cacheFiles Whether `files` list should be initialized in the constructor.
	 */
	constructor( nativeDataTransfer: DomDataTransfer, options: { cacheFiles?: boolean } = {} ) {
		// We should store references to the File instances in case someone would like to process this files
		// outside the event handler. Files are stored only for `drop` and `paste` events because they are not usable
		// in other events and are generating a huge delay on Firefox while dragging.
		// See https://github.com/ckeditor/ckeditor5/issues/13366.
		this._files = options.cacheFiles ? getFiles( nativeDataTransfer ) : null;

		this._native = nativeDataTransfer;
	}

	/**
	 * The array of files created from the native `DataTransfer#files` or `DataTransfer#items`.
	 */
	public get files(): Array<File> {
		if ( !this._files ) {
			this._files = getFiles( this._native );
		}

		return this._files;
	}

	/**
	 * Returns an array of available native content types.
	 */
	public get types(): ReadonlyArray<string> {
		return this._native.types;
	}

	/**
	 * Gets the data from the data transfer by its MIME type.
	 *
	 * ```ts
	 * dataTransfer.getData( 'text/plain' );
	 * ```
	 *
	 * @param type The MIME type. E.g. `text/html` or `text/plain`.
	 */
	public getData( type: string ): string {
		return this._native.getData( type );
	}

	/**
	 * Sets the data in the data transfer.
	 *
	 * @param type The MIME type. E.g. `text/html` or `text/plain`.
	 */
	public setData( type: string, data: string ): void {
		this._native.setData( type, data );
	}

	/**
	 * The effect that is allowed for a drag operation.
	 */
	public set effectAllowed( value: EffectAllowed ) {
		this._native.effectAllowed = value;
	}

	public get effectAllowed(): EffectAllowed {
		return this._native.effectAllowed;
	}

	/**
	 * The actual drop effect.
	 */
	public set dropEffect( value: DropEffect ) {
		this._native.dropEffect = value;
	}

	public get dropEffect(): DropEffect {
		return this._native.dropEffect;
	}

	/**
	 * Set a preview image of the dragged content.
	 */
	public setDragImage( image: Element, x: number, y: number ): void {
		this._native.setDragImage( image, x, y );
	}

	/**
	 * Whether the dragging operation was canceled.
	 */
	public get isCanceled(): boolean {
		return this._native.dropEffect == 'none' || !!( this._native as any ).mozUserCancelled;
	}
}

/**
 * The effect that is allowed for a drag operation.
 */
export type EffectAllowed = DomDataTransfer[ 'effectAllowed' ];

/**
 * The actual drop effect.
 */
export type DropEffect = DomDataTransfer[ 'dropEffect' ];

function getFiles( nativeDataTransfer: DomDataTransfer ): Array<File> {
	// DataTransfer.files and items are array-like and might not have an iterable interface.
	const files = Array.from( nativeDataTransfer.files || [] );
	const items = Array.from( nativeDataTransfer.items || [] );

	if ( files.length ) {
		return files;
	}

	// Chrome has empty DataTransfer.files, but allows getting files through the items interface.
	return items
		.filter( item => item.kind === 'file' )
		.map( item => item.getAsFile()! );
}
