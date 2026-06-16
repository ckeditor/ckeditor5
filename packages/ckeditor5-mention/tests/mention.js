/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { global } from '@ckeditor/ckeditor5-utils';
import { ViewElement, ViewText } from '@ckeditor/ckeditor5-engine';

import { Mention } from '../src/mention.js';
import { MentionEditing } from '../src/mentionediting.js';
import { MentionUI } from '../src/mentionui.js';

describe( 'Mention', () => {
	let editorElement, editor, viewDocument;

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Mention ]
			} )
			.then( newEditor => {
				editor = newEditor;
				viewDocument = editor.editing.view.document;
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( Mention ) ).toBeInstanceOf( Mention );
	} );

	it( 'has proper name', () => {
		expect( Mention.pluginName ).toBe( 'Mention' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( Mention.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( Mention.isPremiumPlugin ).toBe( false );
	} );

	it( 'should load MentionEditing plugin', () => {
		expect( editor.plugins.get( MentionEditing ) ).toBeInstanceOf( MentionEditing );
	} );

	it( 'should load MentionUI plugin', () => {
		expect( editor.plugins.get( MentionUI ) ).toBeInstanceOf( MentionUI );
	} );

	describe( 'toMentionAttribute()', () => {
		it( 'should create mention attribute with default properties', () => {
			const text = new ViewText( viewDocument, 'John Doe' );

			const viewElement = new ViewElement( viewDocument, 'span', {
				'data-mention': '@John'
			}, text );

			const mentionAttribute = editor.plugins.get( 'Mention' ).toMentionAttribute( viewElement );

			expect( mentionAttribute ).toHaveProperty( 'id', '@John' );
			expect( mentionAttribute ).toHaveProperty( 'uid' );
			expect( mentionAttribute ).toHaveProperty( '_text', 'John Doe' );
		} );

		it( 'should create mention attribute with provided attributes', () => {
			const text = new ViewText( viewDocument, 'John Doe' );

			const viewElement = new ViewElement( viewDocument, 'span', {
				'data-mention': '@John'
			}, text );

			const mentionAttribute = editor.plugins.get( 'Mention' ).toMentionAttribute( viewElement, { foo: 'bar' } );

			expect( mentionAttribute ).toHaveProperty( 'id', '@John' );
			expect( mentionAttribute ).toHaveProperty( 'foo', 'bar' );
			expect( mentionAttribute ).toHaveProperty( 'uid' );
			expect( mentionAttribute ).toHaveProperty( '_text', 'John Doe' );
		} );

		it( 'should return undefined if Element has no text node', () => {
			const viewElement = new ViewElement( viewDocument, 'span', {
				'data-mention': '@John'
			} );

			const mentionAttribute = editor.plugins.get( 'Mention' ).toMentionAttribute( viewElement );

			expect( mentionAttribute ).toBeUndefined();
		} );
	} );
} );
