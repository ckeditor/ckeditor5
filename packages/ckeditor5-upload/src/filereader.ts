/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module upload/filereader
 */

/* globals window */

import { ObservableMixin } from '@ckeditor/ckeditor5-utils';

type DomFileReader = globalThis.FileReader;

/**
 * Wrapper over the native `FileReader`.
 */
export default class FileReader extends ObservableMixin() {
	public total!: number;

	/**
	 * Instance of native FileReader.
	 */
	private readonly _reader: DomFileReader;

	/**
	 * Holds the data of an already loaded file. The file must be first loaded
	 * by using {@link module:upload/filereader~FileReader#read `read()`}.
	 */
	private _data?: string;

	/**
	 * Number of bytes loaded.
	 *
	 * @readonly
	 * @observable
	 */
	declare public loaded: number;

	/**
	 * Creates an instance of the FileReader.
	 */
	constructor() {
		super();

		const reader = new window.FileReader();

		this._reader = reader;
		this._data = undefined;

		this.set( 'loaded', 0 );

		reader.onprogress = evt => {
			this.loaded = evt.loaded;
		};
	}

	/**
	 * Returns error that occurred during file reading.
	 */
	public get error(): DOMException | null {
		return this._reader.error;
	}

	/**
	 * Holds the data of an already loaded file. The file must be first loaded
	 * by using {@link module:upload/filereader~FileReader#read `read()`}.
	 */
	public get data(): string | undefined {
		return this._data;
	}

	/**
	 * Reads the provided file.
	 *
	 * @param file Native File object.
	 * @returns Returns a promise that will be resolved with file's content.
	 * The promise will be rejected in case of an error or when the reading process is aborted.
	 */
	public read( file: File ): Promise<string> {
		const reader = this._reader;
		this.total = file.size;

		return new Promise( ( resolve, reject ) => {
			reader.onload = () => {
				const result = reader.result as string;

				this._data = result;

				resolve( result );
			};

			reader.onerror = () => {
				reject( 'error' );
			};

			reader.onabort = () => {
				reject( 'aborted' );
			};

			this._reader.readAsDataURL( file );
		} );
	}

	/**
	 * Aborts file reader.
	 */
	public abort(): void {
		this._reader.abort();
	}
}
