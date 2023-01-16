/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
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
	public readonly files: Array<File>;

	/**
	 * The native DataTransfer object.
	 */
	private _native: DomDataTransfer;

	constructor( nativeDataTransfer: DomDataTransfer ) {
		this.files = getFiles( nativeDataTransfer );

		this._native = nativeDataTransfer;
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
