/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module upload/filerepository
 */

import {
	Plugin,
	PendingActions,
	type PendingAction
} from '@ckeditor/ckeditor5-core';

import {
	CKEditorError,
	Collection,
	ObservableMixin,
	logWarning,
	uid,
	type ObservableChangeEvent,
	type CollectionChangeEvent
} from '@ckeditor/ckeditor5-utils';

import FileReader from './filereader.js';

/**
 * File repository plugin. A central point for managing file upload.
 *
 * To use it, first you need an upload adapter. Upload adapter's job is to handle communication with the server
 * (sending the file and handling server's response). You can use one of the existing plugins introducing upload adapters
 * (e.g. {@link module:easy-image/cloudservicesuploadadapter~CloudServicesUploadAdapter} or
 * {@link module:adapter-ckfinder/uploadadapter~CKFinderUploadAdapter}) or write your own one – see
 * the {@glink framework/deep-dive/upload-adapter Custom image upload adapter deep-dive} guide.
 *
 * Then, you can use {@link module:upload/filerepository~FileRepository#createLoader `createLoader()`} and the returned
 * {@link module:upload/filerepository~FileLoader} instance to load and upload files.
 */
export default class FileRepository extends Plugin {
	/**
	 * Collection of loaders associated with this repository.
	 */
	public loaders = new Collection<FileLoader>();

	/**
	 * A factory function which should be defined before using `FileRepository`.
	 *
	 * It should return a new instance of {@link module:upload/filerepository~UploadAdapter} that will be used to upload files.
	 * {@link module:upload/filerepository~FileLoader} instance associated with the adapter
	 * will be passed to that function.
	 *
	 * For more information and example see {@link module:upload/filerepository~UploadAdapter}.
	 */
	public declare createUploadAdapter?: ( loader: FileLoader ) => UploadAdapter;

	/**
	 * Loaders mappings used to retrieve loaders references.
	 */
	private _loadersMap = new Map<File | Promise<File>, FileLoader>();

	/**
	 * Reference to a pending action registered in a {@link module:core/pendingactions~PendingActions} plugin
	 * while upload is in progress. When there is no upload then value is `null`.
	 */
	private _pendingAction: PendingAction | null = null;

	/**
	 * Number of bytes uploaded.
	 *
	 * @readonly
	 * @observable
	 */
	declare public uploaded: number;

	/**
	 * Number of total bytes to upload.
	 *
	 * It might be different than the file size because of headers and additional data.
	 * It contains `null` if value is not available yet, so it's better to use {@link #uploadedPercent} to monitor
	 * the progress.
	 *
	 * @readonly
	 * @observable
	 */
	declare public uploadTotal: number | null;

	/**
	 * Upload progress in percents.
	 *
	 * @readonly
	 * @observable
	 */
	declare public uploadedPercent: number;

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'FileRepository' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ PendingActions ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		// Keeps upload in a sync with pending actions.
		this.loaders.on<CollectionChangeEvent>( 'change', () => this._updatePendingAction() );

		this.set( 'uploaded', 0 );
		this.set( 'uploadTotal', null );

		this.bind( 'uploadedPercent' ).to( this, 'uploaded', this, 'uploadTotal', ( uploaded, total ) => {
			return total ? ( uploaded / total * 100 ) : 0;
		} );
	}

	/**
	 * Returns the loader associated with specified file or promise.
	 *
	 * To get loader by id use `fileRepository.loaders.get( id )`.
	 *
	 * @param fileOrPromise Native file or promise handle.
	 */
	public getLoader( fileOrPromise: File | Promise<File> ): FileLoader | null {
		return this._loadersMap.get( fileOrPromise ) || null;
	}

	/**
	 * Creates a loader instance for the given file.
	 *
	 * Requires {@link #createUploadAdapter} factory to be defined.
	 *
	 * @param fileOrPromise Native File object or native Promise object which resolves to a File.
	 */
	public createLoader( fileOrPromise: File | Promise<File> ): FileLoader | null {
		if ( !this.createUploadAdapter ) {
			/**
			 * You need to enable an upload adapter in order to be able to upload files.
			 *
			 * This warning shows up when {@link module:upload/filerepository~FileRepository} is being used
			 * without {@link module:upload/filerepository~FileRepository#createUploadAdapter defining an upload adapter}.
			 *
			 * **If you see this warning when using one of the {@glink getting-started/legacy/installation-methods/predefined-builds
			 * CKEditor 5 Builds}**
			 * it means that you did not configure any of the upload adapters available by default in those builds.
			 *
			 * Predefined builds are a deprecated solution and we strongly advise
			 * {@glink updating/nim-migration/migration-to-new-installation-methods migrating to new installation methods}.
			 *
			 * See the {@glink features/images/image-upload/image-upload comprehensive "Image upload overview"} to learn which upload
			 * adapters are available in the builds and how to configure them.
			 *
			 * Otherwise, if you see this warning, there is a chance that you enabled
			 * a feature like {@link module:image/imageupload~ImageUpload},
			 * or {@link module:image/imageupload/imageuploadui~ImageUploadUI} but you did not enable any upload adapter.
			 * You can choose one of the existing upload adapters listed in the
			 * {@glink features/images/image-upload/image-upload "Image upload overview"}.
			 *
			 * You can also implement your {@glink framework/deep-dive/upload-adapter own image upload adapter}.
			 *
			 * @error filerepository-no-upload-adapter
			 */
			logWarning( 'filerepository-no-upload-adapter' );

			return null;
		}

		const loader = new FileLoader( Promise.resolve( fileOrPromise ), this.createUploadAdapter );

		this.loaders.add( loader );
		this._loadersMap.set( fileOrPromise, loader );

		// Store also file => loader mapping so loader can be retrieved by file instance returned upon Promise resolution.
		if ( fileOrPromise instanceof Promise ) {
			loader.file
				.then( file => {
					this._loadersMap.set( file!, loader );
				} )
				// Every then() must have a catch().
				// File loader state (and rejections) are handled in read() and upload().
				// Also, see the "does not swallow the file promise rejection" test.
				.catch( () => {} );
		}

		loader.on<ObservableChangeEvent>( 'change:uploaded', () => {
			let aggregatedUploaded = 0;

			for ( const loader of this.loaders ) {
				aggregatedUploaded += loader.uploaded;
			}

			this.uploaded = aggregatedUploaded;
		} );

		loader.on<ObservableChangeEvent>( 'change:uploadTotal', () => {
			let aggregatedTotal = 0;

			for ( const loader of this.loaders ) {
				if ( loader.uploadTotal ) {
					aggregatedTotal += loader.uploadTotal;
				}
			}

			this.uploadTotal = aggregatedTotal;
		} );

		return loader;
	}

	/**
	 * Destroys the given loader.
	 *
	 * @param fileOrPromiseOrLoader File or Promise associated with that loader or loader itself.
	 */
	public destroyLoader( fileOrPromiseOrLoader: File | Promise<File> | FileLoader ): void {
		const loader = fileOrPromiseOrLoader instanceof FileLoader ? fileOrPromiseOrLoader : this.getLoader( fileOrPromiseOrLoader )!;

		loader._destroy();

		this.loaders.remove( loader );

		this._loadersMap.forEach( ( value, key ) => {
			if ( value === loader ) {
				this._loadersMap.delete( key );
			}
		} );
	}

	/**
	 * Registers or deregisters pending action bound with upload progress.
	 */
	private _updatePendingAction(): void {
		const pendingActions = this.editor.plugins.get( PendingActions );

		if ( this.loaders.length ) {
			if ( !this._pendingAction ) {
				const t = this.editor.t;
				const getMessage = ( value: number ) => `${ t( 'Upload in progress' ) } ${ parseInt( value as any ) }%.`;

				this._pendingAction = pendingActions.add( getMessage( this.uploadedPercent ) );
				this._pendingAction.bind( 'message' ).to( this, 'uploadedPercent', getMessage );
			}
		} else {
			pendingActions.remove( this._pendingAction! );
			this._pendingAction = null;
		}
	}
}

/**
 * File loader class.
 *
 * It is used to control the process of reading the file and uploading it using the specified upload adapter.
 */
class FileLoader extends /* #__PURE__ */ ObservableMixin() {
	/**
	 * Unique id of FileLoader instance.
	 *
	 * @readonly
	 */
	public readonly id: string;

	/**
	 * Additional wrapper over the initial file promise passed to this loader.
	 */
	private _filePromiseWrapper: FilePromiseWrapper;

	/**
	 * Adapter instance associated with this file loader.
	 */
	private _adapter: UploadAdapter;

	/**
	 * FileReader used by FileLoader.
	 */
	private _reader: FileReader;

	/**
	 * Current status of FileLoader. It can be one of the following:
	 *
	 * * 'idle',
	 * * 'reading',
	 * * 'uploading',
	 * * 'aborted',
	 * * 'error'.
	 *
	 * When reading status can change in a following way:
	 *
	 * `idle` -> `reading` -> `idle`
	 * `idle` -> `reading -> `aborted`
	 * `idle` -> `reading -> `error`
	 *
	 * When uploading status can change in a following way:
	 *
	 * `idle` -> `uploading` -> `idle`
	 * `idle` -> `uploading` -> `aborted`
	 * `idle` -> `uploading` -> `error`
	 *
	 * @readonly
	 * @observable
	 */
	declare public status: 'idle' | 'reading' | 'uploading' | 'aborted' | 'error';

	/**
	 * Number of bytes uploaded.
	 *
	 * @readonly
	 * @observable
	 */
	declare public uploaded: number;

	/**
	 * Number of total bytes to upload.
	 *
	 * @readonly
	 * @observable
	 */
	declare public uploadTotal: number | null;

	/**
	 * Upload progress in percents.
	 *
	 * @readonly
	 * @observable
	 */
	declare public uploadedPercent: number;

	/**
	 * Response of the upload.
	 *
	 * @readonly
	 * @observable
	 */
	declare public uploadResponse?: UploadResponse | null;

	/**
	 * Creates a new instance of `FileLoader`.
	 *
	 * @param filePromise A promise which resolves to a file instance.
	 * @param uploadAdapterCreator The function which returns {@link module:upload/filerepository~UploadAdapter} instance.
	 */
	constructor( filePromise: Promise<File>, uploadAdapterCreator: ( loader: FileLoader ) => UploadAdapter ) {
		super();

		this.id = uid();
		this._filePromiseWrapper = this._createFilePromiseWrapper( filePromise );
		this._adapter = uploadAdapterCreator( this );
		this._reader = new FileReader();

		this.set( 'status', 'idle' );
		this.set( 'uploaded', 0 );
		this.set( 'uploadTotal', null );

		this.bind( 'uploadedPercent' ).to( this, 'uploaded', this, 'uploadTotal', ( uploaded, total ) => {
			return total ? ( uploaded / total * 100 ) : 0;
		} );

		this.set( 'uploadResponse', null );
	}

	/**
	 * A `Promise` which resolves to a `File` instance associated with this file loader.
	 */
	public get file(): Promise<File | null> {
		if ( !this._filePromiseWrapper ) {
			// Loader was destroyed, return promise which resolves to null.
			return Promise.resolve( null );
		} else {
			// The `this._filePromiseWrapper.promise` is chained and not simply returned to handle a case when:
			//
			//		* The `loader.file.then( ... )` is called by external code (returned promise is pending).
			//		* Then `loader._destroy()` is called (call is synchronous) which destroys the `loader`.
			//		* Promise returned by the first `loader.file.then( ... )` call is resolved.
			//
			// Returning `this._filePromiseWrapper.promise` will still resolve to a `File` instance so there
			// is an additional check needed in the chain to see if `loader` was destroyed in the meantime.
			return this._filePromiseWrapper.promise.then( file => this._filePromiseWrapper ? file : null );
		}
	}

	/**
	 * Returns the file data. To read its data, you need for first load the file
	 * by using the {@link module:upload/filerepository~FileLoader#read `read()`} method.
	 */
	public get data(): string | undefined {
		return this._reader.data;
	}

	/**
	 * Reads file using {@link module:upload/filereader~FileReader}.
	 *
	 * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `filerepository-read-wrong-status` when status
	 * is different than `idle`.
	 *
	 * Example usage:
	 *
	 * ```ts
	 * fileLoader.read()
	 * 	.then( data => { ... } )
	 * 	.catch( err => {
	 * 		if ( err === 'aborted' ) {
	 * 			console.log( 'Reading aborted.' );
	 * 		} else {
	 * 			console.log( 'Reading error.', err );
	 * 		}
	 * 	} );
	 * ```
	 *
	 * @returns Returns promise that will be resolved with read data. Promise will be rejected if error
	 * occurs or if read process is aborted.
	 */
	public read(): Promise<string> {
		if ( this.status != 'idle' ) {
			/**
			 * You cannot call read if the status is different than idle.
			 *
			 * @error filerepository-read-wrong-status
			 */
			throw new CKEditorError( 'filerepository-read-wrong-status', this );
		}

		this.status = 'reading';

		return this.file
			.then( file => this._reader.read( file! ) )
			.then( data => {
				// Edge case: reader was aborted after file was read - double check for proper status.
				// It can happen when image was deleted during its upload.
				if ( this.status !== 'reading' ) {
					throw this.status;
				}

				this.status = 'idle';

				return data;
			} )
			.catch( err => {
				if ( err === 'aborted' ) {
					this.status = 'aborted';
					throw 'aborted';
				}

				this.status = 'error';
				throw this._reader.error ? this._reader.error : err;
			} );
	}

	/**
	 * Reads file using the provided {@link module:upload/filerepository~UploadAdapter}.
	 *
	 * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `filerepository-upload-wrong-status` when status
	 * is different than `idle`.
	 * Example usage:
	 *
	 * ```ts
	 * fileLoader.upload()
	 * 	.then( data => { ... } )
	 * 	.catch( e => {
	 * 		if ( e === 'aborted' ) {
	 * 			console.log( 'Uploading aborted.' );
	 * 		} else {
	 * 			console.log( 'Uploading error.', e );
	 * 		}
	 * 	} );
	 * ```
	 *
	 * @returns Returns promise that will be resolved with response data. Promise will be rejected if error
	 * occurs or if read process is aborted.
	 */
	public upload(): Promise<UploadResponse> {
		if ( this.status != 'idle' ) {
			/**
			 * You cannot call upload if the status is different than idle.
			 *
			 * @error filerepository-upload-wrong-status
			 */
			throw new CKEditorError( 'filerepository-upload-wrong-status', this );
		}

		this.status = 'uploading';

		return this.file
			.then( () => this._adapter.upload() )
			.then( data => {
				this.uploadResponse = data;
				this.status = 'idle';

				return data;
			} )
			.catch( err => {
				if ( this.status === 'aborted' ) {
					throw 'aborted';
				}

				this.status = 'error';
				throw err;
			} );
	}

	/**
	 * Aborts loading process.
	 */
	public abort(): void {
		const status = this.status;
		this.status = 'aborted';

		if ( !this._filePromiseWrapper.isFulfilled ) {
			// Edge case: file loader is aborted before read() is called
			// so it might happen that no one handled the rejection of this promise.
			// See https://github.com/ckeditor/ckeditor5-upload/pull/100
			this._filePromiseWrapper.promise.catch( () => {} );

			this._filePromiseWrapper.rejecter( 'aborted' );
		} else if ( status == 'reading' ) {
			this._reader.abort();
		} else if ( status == 'uploading' && this._adapter.abort ) {
			this._adapter.abort();
		}

		this._destroy();
	}

	/**
	 * Performs cleanup.
	 *
	 * @internal
	 */
	public _destroy(): void {
		this._filePromiseWrapper = undefined as any;
		this._reader = undefined as any;
		this._adapter = undefined as any;
		this.uploadResponse = undefined;
	}

	/**
	 * Wraps a given file promise into another promise giving additional
	 * control (resolving, rejecting, checking if fulfilled) over it.
	 *
	 * @param filePromise The initial file promise to be wrapped.
	 */
	private _createFilePromiseWrapper( filePromise: Promise<File> ): FilePromiseWrapper {
		const wrapper: Partial<FilePromiseWrapper> = {};

		wrapper.promise = new Promise<File>( ( resolve, reject ) => {
			wrapper.rejecter = reject;
			wrapper.isFulfilled = false;

			filePromise
				.then( file => {
					wrapper.isFulfilled = true;
					resolve( file );
				} )
				.catch( err => {
					wrapper.isFulfilled = true;
					reject( err );
				} );
		} );

		return wrapper as FilePromiseWrapper;
	}
}

export type { FileLoader };

/**
 * Upload adapter interface used by the {@link module:upload/filerepository~FileRepository file repository}
 * to handle file upload. An upload adapter is a bridge between the editor and server that handles file uploads.
 * It should contain a logic necessary to initiate an upload process and monitor its progress.
 *
 * Learn how to develop your own upload adapter for CKEditor 5 in the
 * {@glink framework/deep-dive/upload-adapter "Custom upload adapter"} guide.
 *
 * @interface UploadAdapter
 */
export interface UploadAdapter {

	/**
	 * Executes the upload process.
	 * This method should return a promise that will resolve when data will be uploaded to server. Promise should be
	 * resolved with an object containing information about uploaded file:
	 *
	 * ```json
	 * {
	 * 	default: 'http://server/default-size.image.png'
	 * }
	 * ```
	 *
	 * Additionally, other image sizes can be provided:
	 *
	 * ```json
	 * {
	 * 	default: 'http://server/default-size.image.png',
	 * 	'160': 'http://server/size-160.image.png',
	 * 	'500': 'http://server/size-500.image.png',
	 * 	'1000': 'http://server/size-1000.image.png',
	 * 	'1052': 'http://server/default-size.image.png'
	 * }
	 * ```
	 *
	 * You can also pass additional properties from the server. In this case you need to wrap URLs
	 * in the `urls` object and pass additional properties along the `urls` property.
	 *
	 * ```json
	 * {
	 * 	myCustomProperty: 'foo',
	 * 	urls: {
	 * 		default: 'http://server/default-size.image.png',
	 * 		'160': 'http://server/size-160.image.png',
	 * 		'500': 'http://server/size-500.image.png',
	 * 		'1000': 'http://server/size-1000.image.png',
	 * 		'1052': 'http://server/default-size.image.png'
	 * 	}
	 * }
	 * ```
	 *
	 * NOTE: When returning multiple images, the widest returned one should equal the default one. It is essential to
	 * correctly set `width` attribute of the image. See this discussion:
	 * https://github.com/ckeditor/ckeditor5-easy-image/issues/4 for more information.
	 *
	 * Take a look at {@link module:upload/filerepository~UploadAdapter example Adapter implementation} and
	 * {@link module:upload/filerepository~FileRepository#createUploadAdapter createUploadAdapter method}.
	 *
	 * @returns Promise that should be resolved when data is uploaded.
	 */
	upload(): Promise<UploadResponse>;

	/**
	 * Aborts the upload process.
	 * After aborting it should reject promise returned from {@link #upload upload()}.
	 *
	 * Take a look at {@link module:upload/filerepository~UploadAdapter example Adapter implementation} and
	 * {@link module:upload/filerepository~FileRepository#createUploadAdapter createUploadAdapter method}.
	 */
	abort?(): void;
}

export type UploadResponse = Record<string, unknown>;

/**
 * Object returned by {@link module:upload/filerepository~FileLoader#_createFilePromiseWrapper} method
 * to add more control over the initial file promise passed to {@link module:upload/filerepository~FileLoader}.
 */
type FilePromiseWrapper = {

	/**
	 * Wrapper promise which can be chained for further processing.
	 */
	promise: Promise<File>;

	/**
	 * Rejects the promise when called.
	 */
	rejecter: ( reason?: unknown ) => void;

	/**
	 * Whether original promise is already fulfilled.
	 */
	isFulfilled: boolean;
};
