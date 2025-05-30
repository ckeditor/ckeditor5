/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module utils/ckeditorerror
 */

/**
 * URL to the documentation with error codes.
 */
export const DOCUMENTATION_URL = 'https://ckeditor.com/docs/ckeditor5/latest/support/error-codes.html';

/**
 * The CKEditor error class.
 *
 * You should throw `CKEditorError` when:
 *
 * * An unexpected situation occurred and the editor (most probably) will not work properly. Such exception will be handled
 * by the {@link module:watchdog/watchdog~Watchdog watchdog} (if it is integrated),
 * * If the editor is incorrectly integrated or the editor API is used in the wrong way. This way you will give
 * feedback to the developer as soon as possible. Keep in mind that for common integration issues which should not
 * stop editor initialization (like missing upload adapter, wrong name of a toolbar component) we use
 * {@link module:utils/ckeditorerror~logWarning `logWarning()`} and
 * {@link module:utils/ckeditorerror~logError `logError()`}
 * to improve developers experience and let them see the a working editor as soon as possible.
 *
 * ```ts
 * /**
 *  * Error thrown when a plugin cannot be loaded due to JavaScript errors, lack of plugins with a given name, etc.
 *  *
 *  * @error plugin-load
 *  * @param pluginName The name of the plugin that could not be loaded.
 *  * @param moduleName The name of the module which tried to load this plugin.
 *  *\/
 * throw new CKEditorError( 'plugin-load', {
 * 	pluginName: 'foo',
 * 	moduleName: 'bar'
 * } );
 * ```
 */
export default class CKEditorError extends Error {
	/**
	 * A context of the error by which the Watchdog is able to determine which editor crashed.
	 */
	public readonly context: object | null | undefined;

	/**
	 * The additional error data passed to the constructor. Undefined if none was passed.
	 */
	public readonly data?: object;

	/**
	 * Creates an instance of the CKEditorError class.
	 *
	 * @param errorName The error id in an `error-name` format. A link to this error documentation page will be added
	 * to the thrown error's `message`.
	 * @param context A context of the error by which the {@link module:watchdog/watchdog~Watchdog watchdog}
	 * is able to determine which editor crashed. It should be an editor instance or a property connected to it. It can be also
	 * a `null` value if the editor should not be restarted in case of the error (e.g. during the editor initialization).
	 * The error context should be checked using the `areConnectedThroughProperties( editor, context )` utility
	 * to check if the object works as the context.
	 * @param data Additional data describing the error. A stringified version of this object
	 * will be appended to the error message, so the data are quickly visible in the console. The original
	 * data object will also be later available under the {@link #data} property.
	 */
	constructor( errorName: string, context?: object | null, data?: object ) {
		super( getErrorMessage( errorName, data ) );

		this.name = 'CKEditorError';
		this.context = context;
		this.data = data;
	}

	/**
	 * Checks if the error is of the `CKEditorError` type.
	 */
	public is( type: string ): boolean {
		return type === 'CKEditorError';
	}

	/**
	 * A utility that ensures that the thrown error is a {@link module:utils/ckeditorerror~CKEditorError} one.
	 * It is useful when combined with the {@link module:watchdog/watchdog~Watchdog} feature, which can restart the editor in case
	 * of a {@link module:utils/ckeditorerror~CKEditorError} error.
	 *
	 * @param err The error to rethrow.
	 * @param context An object connected through properties with the editor instance. This context will be used
	 * by the watchdog to verify which editor should be restarted.
	 */
	public static rethrowUnexpectedError( err: Error, context: object ): never {
		if ( ( err as any ).is && ( err as any ).is( 'CKEditorError' ) ) {
			throw err;
		}

		/**
		 * An unexpected error occurred inside the CKEditor 5 codebase. This error will look like the original one
		 * to make the debugging easier.
		 *
		 * This error is only useful when the editor is initialized using the {@link module:watchdog/watchdog~Watchdog} feature.
		 * In case of such error (or any {@link module:utils/ckeditorerror~CKEditorError} error) the watchdog should restart the editor.
		 *
		 * @error unexpected-error
		 */
		const error = new CKEditorError( err.message, context );

		// Restore the original stack trace to make the error look like the original one.
		// See https://github.com/ckeditor/ckeditor5/issues/5595 for more details.
		error.stack = err.stack;

		throw error;
	}
}

/**
 * Logs a warning to the console with a properly formatted message and adds a link to the documentation.
 * Use whenever you want to log a warning to the console.
 *
 * ```ts
 * /**
 *  * There was a problem processing the configuration of the toolbar. The item with the given
 *  * name does not exist, so it was omitted when rendering the toolbar.
 *  *
 *  * @error toolbarview-item-unavailable
 *  * @param {String} name The name of the component.
 *  *\/
 * logWarning( 'toolbarview-item-unavailable', { name } );
 * ```
 *
 * See also {@link module:utils/ckeditorerror~CKEditorError} for an explanation when to throw an error and when to log
 * a warning or an error to the console.
 *
 * @param errorName The error name to be logged.
 * @param data Additional data to be logged.
 */
export function logWarning( errorName: string, data?: object ): void {
	console.warn( ...formatConsoleArguments( errorName, data ) );
}

/**
 * Logs an error to the console with a properly formatted message and adds a link to the documentation.
 * Use whenever you want to log an error to the console.
 *
 * ```ts
 * /**
 *  * There was a problem processing the configuration of the toolbar. The item with the given
 *  * name does not exist, so it was omitted when rendering the toolbar.
 *  *
 *  * @error toolbarview-item-unavailable
 *  * @param {String} name The name of the component.
 *  *\/
 *  logError( 'toolbarview-item-unavailable', { name } );
 * ```
 *
 * **Note**: In most cases logging a warning using {@link module:utils/ckeditorerror~logWarning} is enough.
 *
 * See also {@link module:utils/ckeditorerror~CKEditorError} for an explanation when to use each method.
 *
 * @param errorName The error name to be logged.
 * @param data Additional data to be logged.
 */
export function logError( errorName: string, data?: object ): void {
	console.error( ...formatConsoleArguments( errorName, data ) );
}

/**
 * Returns formatted link to documentation message.
 */
function getLinkToDocumentationMessage( errorName: string ): string {
	return `\nRead more: ${ DOCUMENTATION_URL }#error-${ errorName }`;
}

/**
 * Returns formatted error message.
 */
function getErrorMessage( errorName: string, data?: object ): string {
	const processedObjects = new WeakSet();
	const circularReferencesReplacer = ( key: string, value: unknown ) => {
		if ( typeof value === 'object' && value !== null ) {
			if ( processedObjects.has( value ) ) {
				return `[object ${ value.constructor.name }]`;
			}

			processedObjects.add( value );
		}

		return value;
	};

	const stringifiedData = data ? ` ${ JSON.stringify( data, circularReferencesReplacer ) }` : '';
	const documentationLink = getLinkToDocumentationMessage( errorName );

	return errorName + stringifiedData + documentationLink;
}

/**
 * Returns formatted console error arguments.
 */
function formatConsoleArguments( errorName: string, data?: object ): Array<unknown> {
	const documentationMessage = getLinkToDocumentationMessage( errorName );

	return data ? [ errorName, data, documentationMessage ] : [ errorName, documentationMessage ];
}
