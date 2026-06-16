/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { attachToForm } from '../../../src/editor/utils/attachtoform.js';
import { ElementApiMixin } from '../../../src/editor/utils/elementapimixin.js';
import { Editor } from '../../../src/editor/editor.js';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';

describe( 'attachToForm()', () => {
	let editor, form, textarea, submitStub;

	beforeEach( () => {
		form = document.createElement( 'form' );
		textarea = document.createElement( 'textarea' );
		form.appendChild( textarea );
		document.body.appendChild( form );
		submitStub = vi.spyOn( form, 'submit' ).mockImplementation( () => {} );

		// Prevents page realods in Firefox ;|
		form.addEventListener( 'submit', evt => {
			evt.preventDefault();
		} );

		class CustomEditor extends ElementApiMixin( Editor ) {}

		editor = new CustomEditor();
		editor.model.document.createRoot();
		editor.model.schema.extend( '$text', { allowIn: '$root' } );
		editor.fire( 'ready' );

		editor.data.set( 'foo bar' );
	} );

	afterEach( () => {
		vi.restoreAllMocks();
		form.remove();

		if ( editor ) {
			return editor.destroy();
		}
	} );

	it( 'should throw an error when is used with editor without `ElementApiMixin`', async () => {
		const editor = new Editor();

		expectToThrowCKEditorError( () => {
			attachToForm( editor );
		}, /^attachtoform-missing-elementapi-interface/, editor );

		editor.fire( 'ready' );
		await editor.destroy();
	} );

	it( 'should update editor#element after the "submit" event', () => {
		editor.sourceElement = textarea;
		attachToForm( editor );

		expect( textarea.value ).toBe( '' );

		form.dispatchEvent( new Event( 'submit', {
			// We need to be able to do preventDefault() to prevent page reloads in Firefox.
			cancelable: true
		} ) );

		expect( textarea.value ).toBe( 'foo bar' );
	} );

	it( 'should update editor#element after calling the submit() method', () => {
		editor.sourceElement = textarea;
		attachToForm( editor );

		expect( textarea.value ).toBe( '' );

		// Submit method is replaced by our implementation.
		expect( form.submit ).not.toBe( submitStub );
		form.submit();

		expect( textarea.value ).toBe( 'foo bar' );
		expect( submitStub ).toHaveBeenCalledOnce();

		// Check if original function was called in correct context.
		expect( submitStub ).toHaveBeenCalledWith();
		expect( submitStub.mock.contexts[ 0 ] ).toBe( form );
	} );

	it( 'should not update editor#element if it is not a textarea in a form', () => {
		const element = document.createElement( 'div' );
		form.appendChild( element );

		editor.sourceElement = element;
		attachToForm( editor );

		expect( textarea.value ).toBe( '' );

		// Submit method is not replaced by our implementation.
		expect( form.submit ).toBe( submitStub );
		form.submit();

		expect( textarea.value ).toBe( '' );
	} );

	it( 'should not update editor#element not belonging to a form', () => {
		const standaloneTextarea = document.createElement( 'textarea' );
		document.body.appendChild( standaloneTextarea );

		editor.sourceElement = standaloneTextarea;
		attachToForm( editor );

		expect( standaloneTextarea.value ).toBe( '' );

		// Submit method is not replaced by our implementation.
		expect( form.submit ).toBe( submitStub );
		form.submit();

		expect( standaloneTextarea.value ).toBe( '' );

		standaloneTextarea.remove();
	} );

	it( 'should not update editor#element after destruction of the editor - form.submit()', () => {
		editor.sourceElement = textarea;
		attachToForm( editor );

		expect( textarea.value ).toBe( '' );

		return editor.destroy().then( () => {
			editor = null;
			// Submit method is no longer replaced by our implementation.
			expect( form.submit ).toBe( submitStub );
			form.submit();

			expect( textarea.value ).toBe( '' );
		} );
	} );

	it( 'should not update the editor#element after destruction of the editor - "submit" event', () => {
		editor.sourceElement = textarea;
		attachToForm( editor );

		expect( textarea.value ).toBe( '' );

		return editor.destroy().then( () => {
			editor = null;

			form.dispatchEvent( new Event( 'submit', {
				// We need to be able to do preventDefault() to prevent page reloads in Firefox.
				cancelable: true
			} ) );

			expect( textarea.value ).toBe( '' );
		} );
	} );

	it( 'should not replace submit() method when one of the elements in a form is named "submit"', () => {
		// Restore stub since we want to mask submit function with input with name="submit".
		vi.restoreAllMocks();

		const input = document.createElement( 'input' );
		input.setAttribute( 'name', 'submit' );
		form.appendChild( input );

		editor.sourceElement = textarea;
		attachToForm( editor );

		expect( form.submit ).toBe( input );
		expect( textarea.value ).toBe( '' );

		form.dispatchEvent( new Event( 'submit', {
			// We need to be able to do preventDefault() to prevent page reloads in Firefox.
			cancelable: true
		} ) );

		expect( textarea.value ).toBe( 'foo bar' );

		return editor.destroy().then( () => {
			editor = null;

			expect( form.submit ).toBe( input );
			input.remove();
		} );
	} );
} );
