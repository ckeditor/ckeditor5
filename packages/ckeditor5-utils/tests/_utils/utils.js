/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global console:false */

import AssertionError from 'assertion-error';
import { html_beautify as beautify } from 'js-beautify/js/lib/beautify-html';

import EmitterMixin from '../../src/emittermixin';
import CKEditorError from '../../src/ckeditorerror';
import areConnectedThroughProperties from '../../src/areconnectedthroughproperties';

/**
 * Creates an instance inheriting from {@link module:utils/emittermixin~EmitterMixin} with one additional method `observe()`.
 * It allows observing changes to attributes in objects being {@link module:utils/observablemixin~Observable observable}.
 *
 * The `observe()` method accepts:
 *
 * * `{String} observableName` – Identifier for the observable object. E.g. `"Editable"` when
 * you observe one of editor's editables. This name will be displayed on the console.
 * * `{utils.Observable observable} – The object to observe.
 * * `{Array.<String>} filterNames` – Array of property names to be observed.
 *
 * Typical usage:
 *
 *		const observer = utils.createObserver();
 *		observer.observe( 'Editable', editor.editables.current );
 *
 *		// Stop listening (method from the EmitterMixin):
 *		observer.stopListening();
 *
 * @returns {Emitter} The observer.
 */
export function createObserver() {
	const observer = Object.create( EmitterMixin, {
		observe: {
			value: function observe( observableName, observable, filterNames ) {
				observer.listenTo( observable, 'change', ( evt, propertyName, value, oldValue ) => {
					if ( !filterNames || filterNames.includes( propertyName ) ) {
						console.log( `[Change in ${ observableName }] ${ propertyName } = '${ value }' (was '${ oldValue }')` );
					}
				} );

				return observer;
			}
		}
	} );

	return observer;
}

/**
 * Checks whether observable properties are properly bound to each other.
 *
 * Syntax given that observable `A` is bound to observables [`B`, `C`, ...]:
 *
 *		assertBinding( A,
 *			{ initial `A` attributes },
 *			[
 *				[ B, { new `B` attributes } ],
 *				[ C, { new `C` attributes } ],
 *				...
 *			],
 *			{ `A` attributes after [`B`, 'C', ...] changed }
 *		);
 */
export function assertBinding( observable, stateBefore, data, stateAfter ) {
	let key, boundObservable, attrs;

	for ( key in stateBefore ) {
		expect( observable[ key ] ).to.equal( stateBefore[ key ] );
	}

	// Change attributes of bound observables.
	for ( [ boundObservable, attrs ] of data ) {
		for ( key in attrs ) {
			if ( !boundObservable.hasOwnProperty( key ) ) {
				boundObservable.set( key, attrs[ key ] );
			} else {
				boundObservable[ key ] = attrs[ key ];
			}
		}
	}

	for ( key in stateAfter ) {
		expect( observable[ key ] ).to.equal( stateAfter[ key ] );
	}
}

/**
 * An assertion util to test whether the given function throws error that has correct message,
 * data and whether the context of the error and the `editorThatShouldBeFindableFromContext`
 * have common props (So the watchdog will be able to find the correct editor instance and restart it).
 *
 * @param {Function} fn Tested function that should throw a `CKEditorError`.
 * @param {RegExp|String} message Expected message of the error.
 * @param {*} editorThatShouldBeFindableFromContext An editor instance that should be findable from the error context.
 * @param {Object} [data] Error data.
 */
export function expectToThrowCKEditorError( fn, message, editorThatShouldBeFindableFromContext, data ) {
	let err = null;

	try {
		fn();
	} catch ( _err ) {
		err = _err;

		assertCKEditorError( err, message, editorThatShouldBeFindableFromContext, data );
	}

	expect( err ).to.not.equal( null, 'Function did not throw any error' );
}

/**
 * An assertion util to test whether a given error has correct message, data and whether the context of the
 * error and the `editorThatShouldBeFindableFromContext` have common props (So the watchdog will be able to
 * find the correct editor instance and restart it).
 *
 * @param {module:utils/ckeditorerror~CKEditorError} err The tested error.
 * @param {RegExp|String} message Expected message of the error.
 * @param {*} [editorThatShouldBeFindableFromContext] An editor instance that should be findable from the error context.
 * @param {Object} [data] Error data.
 */
export function assertCKEditorError( err, message, editorThatShouldBeFindableFromContext, data ) {
	if ( typeof message === 'string' ) {
		message = new RegExp( message );
	}

	expect( message ).to.be.a( 'regexp', 'Error message should be a string or a regexp.' );
	expect( err ).to.be.instanceOf( CKEditorError );
	expect( err.message ).to.match( message, 'Error message does not match the provided one.' );

	// TODO: The `editorThatShouldBeFindableFromContext` is optional but should be required in the future.
	if ( editorThatShouldBeFindableFromContext === null ) {
		expect( err.context ).to.equal( null, 'Error context was expected to be `null`' );
	} else if ( editorThatShouldBeFindableFromContext !== undefined ) {
		expect( areConnectedThroughProperties( editorThatShouldBeFindableFromContext, err.context ) )
			.to.equal( true, 'Editor cannot be find from the error context' );
	}

	if ( data ) {
		expect( err.data ).to.deep.equal( data );
	}
}

/**
 * An assertion util test whether two given strings containing markup language are equal.
 * Unlike `expect().to.equal()` form Chai assertion library, this util formats the markup before showing a diff.
 *
 * This util can be used to test HTML strings and string containing serialized model.
 *
 *		// Will throw an error that is handled as assertion error by Chai.
 *		assertEqualMarkup(
 *			'<paragraph><$text foo="bar">baz</$text></paragraph>',
 *			'<paragraph><$text foo="bar">baaz</$text></paragraph>',
 *		);
 *
 * @param {String} actual An actual string.
 * @param {String} expected An expected string.
 * @param {String} [message="Expected two markup strings to be equal"] Optional error message.
 */
export function assertEqualMarkup( actual, expected, message = 'Expected markup strings to be equal' ) {
	if ( actual != expected ) {
		throw new AssertionError( message, {
			actual: formatMarkup( actual ),
			expected: formatMarkup( expected ),
			showDiff: true
		} );
	}
}

// Renames the $text occurrences as it is not properly formatted by the beautifier - it is tread as a block.
const TEXT_TAG_PLACEHOLDER = 'span data-cke="true"';
const TEXT_TAG_PLACEHOLDER_REGEXP = new RegExp( TEXT_TAG_PLACEHOLDER, 'g' );

function formatMarkup( string ) {
	const htmlSafeString = string.replace( /\$text/g, TEXT_TAG_PLACEHOLDER );

	const beautifiedMarkup = beautify( htmlSafeString, {
		indent_size: 2,
		space_in_empty_paren: true
	} );

	return beautifiedMarkup.replace( TEXT_TAG_PLACEHOLDER_REGEXP, '$text' );
}
