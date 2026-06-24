/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	normalizeRootsConfig,
	normalizeSingleRootEditorConstructorParams,
	normalizeMultiRootEditorConstructorParams,
	normalizeViewRootElementDefinition
} from '../../../src/index.ts';
import { Config } from '@ckeditor/ckeditor5-utils';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';

describe( 'normalizeRootsConfig()', () => {
	let config;

	beforeEach( () => {
		config = new Config();
	} );

	describe( 'single-root (string source data)', () => {
		it( 'should set initialData from source data string', () => {
			normalizeRootsConfig( '<p>foo</p>', config );

			const roots = config.get( 'roots' );

			expect( roots.main.initialData ).toBe( '<p>foo</p>' );
		} );

		it( 'should set initialData from an empty string', () => {
			normalizeRootsConfig( '', config );

			const roots = config.get( 'roots' );

			expect( roots.main.initialData ).toBe( '' );
		} );

		it( 'should use custom default root name', () => {
			normalizeRootsConfig( '<p>foo</p>', config, 'content' );

			const roots = config.get( 'roots' );

			expect( roots.content.initialData ).toBe( '<p>foo</p>' );
			expect( roots.main ).toBeUndefined();
		} );

		it( 'should use initialData from config.root if set', () => {
			config.set( 'root', { initialData: '<p>bar</p>' } );

			normalizeRootsConfig( '', config );

			const roots = config.get( 'roots' );

			expect( roots.main.initialData ).toBe( '<p>bar</p>' );
		} );

		it( 'should use initialData from legacy config.initialData', () => {
			config.set( 'initialData', '<p>legacy</p>' );

			const sourceElement = document.createElement( 'div' );

			normalizeRootsConfig( sourceElement, config );

			const roots = config.get( 'roots' );

			expect( roots.main.initialData ).toBe( '<p>legacy</p>' );
		} );

		it( 'should throw when both config.root and config.roots.main are set', () => {
			config.set( 'root', { initialData: '<p>from root</p>' } );
			config.set( 'roots', { main: { initialData: '<p>from roots</p>' } } );

			expectToThrowCKEditorError( () => {
				normalizeRootsConfig( '', config );
			}, /^editor-create-roots-with-main/ );
		} );

		it( 'should throw when both source data string and config.initialData are set', () => {
			config.set( 'initialData', '<p>legacy</p>' );

			expectToThrowCKEditorError( () => {
				normalizeRootsConfig( '<p>source</p>', config );
			}, /^editor-create-initial-data-overspecified/ );
		} );

		it( 'should throw when both rootConfig.initialData and source data string are set', () => {
			config.set( 'roots', { main: { initialData: '<p>from roots</p>' } } );

			expectToThrowCKEditorError( () => {
				normalizeRootsConfig( '<p>source</p>', config );
			}, /^editor-create-root-initial-data-overspecified/ );
		} );

		it( 'should throw when both rootConfig.initialData and legacy config.initialData are set', () => {
			config.set( 'roots', { main: { initialData: '<p>from roots</p>' } } );
			config.set( 'initialData', '<p>legacy</p>' );

			expectToThrowCKEditorError( () => {
				normalizeRootsConfig( document.createElement( 'div' ), config );
			}, /^editor-create-legacy-initial-data-overspecified/ );
		} );
	} );

	describe( 'single-root (source element)', () => {
		let sourceElement;

		beforeEach( () => {
			sourceElement = document.createElement( 'div' );
			sourceElement.innerHTML = '<p>element data</p>';
		} );

		it( 'should extract initialData from source element', () => {
			normalizeRootsConfig( sourceElement, config );

			const roots = config.get( 'roots' );

			expect( roots.main.initialData ).toBe( '<p>element data</p>' );
		} );

		it( 'should prefer legacy config.initialData over source element', () => {
			config.set( 'initialData', '<p>legacy</p>' );

			normalizeRootsConfig( sourceElement, config );

			const roots = config.get( 'roots' );

			expect( roots.main.initialData ).toBe( '<p>legacy</p>' );
		} );
	} );

	describe( 'multi-root (object source data)', () => {
		it( 'should set initialData from source data object', () => {
			normalizeRootsConfig( {
				header: '<p>header</p>',
				content: '<p>content</p>'
			}, config, false );

			const roots = config.get( 'roots' );

			expect( roots.header.initialData ).toBe( '<p>header</p>' );
			expect( roots.content.initialData ).toBe( '<p>content</p>' );
		} );

		it( 'should merge source data with existing roots config', () => {
			config.set( 'roots', {
				header: { placeholder: 'Type header...' }
			} );

			normalizeRootsConfig( {
				header: '<p>header</p>',
				content: '<p>content</p>'
			}, config, false );

			const roots = config.get( 'roots' );

			expect( roots.header.initialData ).toBe( '<p>header</p>' );
			expect( roots.header.placeholder ).toBe( 'Type header...' );
			expect( roots.content.initialData ).toBe( '<p>content</p>' );
		} );

		it( 'should use initialData from roots config over source data elements', () => {
			config.set( 'roots', {
				header: { initialData: '<p>from config</p>' }
			} );

			const headerEl = document.createElement( 'div' );
			headerEl.innerHTML = '<p>from element</p>';

			normalizeRootsConfig( {
				header: headerEl
			}, config, false );

			const roots = config.get( 'roots' );

			expect( roots.header.initialData ).toBe( '<p>from config</p>' );
		} );

		it( 'should throw when both source data string and rootConfig.initialData are set for a root', () => {
			config.set( 'roots', {
				header: { initialData: '<p>from config</p>' }
			} );

			expectToThrowCKEditorError( () => {
				normalizeRootsConfig( {
					header: '<p>from source</p>'
				}, config, false );
			}, /^editor-create-root-initial-data-overspecified/ );
		} );

		it( 'should use legacy config.initialData as object', () => {
			config.set( 'initialData', {
				header: '<p>legacy header</p>',
				content: '<p>legacy content</p>'
			} );

			normalizeRootsConfig( {}, config, false );

			const roots = config.get( 'roots' );

			expect( roots.header.initialData ).toBe( '<p>legacy header</p>' );
			expect( roots.content.initialData ).toBe( '<p>legacy content</p>' );
		} );

		it( 'should collect root names from all sources', () => {
			config.set( 'roots', {
				fromRoots: { initialData: '<p>a</p>' }
			} );
			config.set( 'initialData', {
				fromLegacy: '<p>b</p>'
			} );

			normalizeRootsConfig( {
				fromSource: '<p>c</p>'
			}, config, false );

			const roots = config.get( 'roots' );

			expect( roots.fromRoots ).not.toBeUndefined();
			expect( roots.fromLegacy ).not.toBeUndefined();
			expect( roots.fromSource ).not.toBeUndefined();
		} );
	} );

	describe( 'defaultRootName parameter', () => {
		it( 'should default to "main"', () => {
			normalizeRootsConfig( '<p>foo</p>', config );

			const roots = config.get( 'roots' );

			expect( roots.main ).not.toBeUndefined();
		} );

		it( 'should not create a default root when set to false', () => {
			normalizeRootsConfig( {}, config, false );

			const roots = config.get( 'roots' );

			expect( roots.main ).toBeUndefined();
		} );

		it( 'should throw when config.root is set and defaultRootName is false', () => {
			config.set( 'root', { initialData: '<p>data</p>' } );

			expectToThrowCKEditorError( () => {
				normalizeRootsConfig( {}, config, false );
			}, /^editor-create-multi-root-with-main/ );
		} );
	} );

	describe( 'legacy placeholder and label', () => {
		it( 'should set placeholder from legacy config.placeholder string', () => {
			config.set( 'placeholder', 'Type here...' );

			normalizeRootsConfig( '<p>foo</p>', config );

			const roots = config.get( 'roots' );

			expect( roots.main.placeholder ).toBe( 'Type here...' );
		} );

		it( 'should set placeholder from legacy config.placeholder object', () => {
			config.set( 'placeholder', {
				header: 'Type header...',
				content: 'Type content...'
			} );
			config.set( 'roots', {
				header: { initialData: '' },
				content: { initialData: '' }
			} );

			normalizeRootsConfig( document.createElement( 'div' ), config );

			const roots = config.get( 'roots' );

			expect( roots.header.placeholder ).toBe( 'Type header...' );
			expect( roots.content.placeholder ).toBe( 'Type content...' );
		} );

		it( 'should set label from legacy config.label string', () => {
			config.set( 'label', 'Editor' );

			normalizeRootsConfig( '<p>foo</p>', config );

			const roots = config.get( 'roots' );

			expect( roots.main.label ).toBe( 'Editor' );
		} );

		it( 'should set label from legacy config.label object', () => {
			config.set( 'label', {
				header: 'Header editor',
				content: 'Content editor'
			} );
			config.set( 'roots', {
				header: { initialData: '' },
				content: { initialData: '' }
			} );

			normalizeRootsConfig( document.createElement( 'div' ), config );

			const roots = config.get( 'roots' );

			expect( roots.header.label ).toBe( 'Header editor' );
			expect( roots.content.label ).toBe( 'Content editor' );
		} );

		it( 'should not override placeholder already set in root config', () => {
			config.set( 'placeholder', 'Legacy placeholder' );
			config.set( 'roots', {
				main: { initialData: '', placeholder: 'Root placeholder' }
			} );

			normalizeRootsConfig( document.createElement( 'div' ), config );

			const roots = config.get( 'roots' );

			expect( roots.main.placeholder ).toBe( 'Root placeholder' );
		} );

		it( 'should not override label already set in root config', () => {
			config.set( 'label', 'Legacy label' );
			config.set( 'roots', {
				main: { initialData: '', label: 'Root label' }
			} );

			normalizeRootsConfig( document.createElement( 'div' ), config );

			const roots = config.get( 'roots' );

			expect( roots.main.label ).toBe( 'Root label' );
		} );
	} );

	describe( 'config.roots is set after normalization', () => {
		it( 'should always set config.roots', () => {
			normalizeRootsConfig( '<p>foo</p>', config );

			expect( config.get( 'roots' ) ).toBeTypeOf( 'object' );
		} );

		it( 'should update config.roots with all processed roots', () => {
			config.set( 'roots', {
				header: { initialData: '<p>h</p>' },
				content: { initialData: '<p>c</p>' }
			} );

			normalizeRootsConfig( document.createElement( 'div' ), config );

			const roots = config.get( 'roots' );

			expect( Object.keys( roots ) ).toContain( 'main' );
			expect( Object.keys( roots ) ).toContain( 'header' );
			expect( Object.keys( roots ) ).toContain( 'content' );
		} );
	} );

	describe( 'config.roots validation', () => {
		it( 'should throw when config.roots has a custom prototype', () => {
			config.set( 'roots', Object.assign( Object.create( {} ), { foo: { initialData: '' } } ) );

			expectToThrowCKEditorError( () => {
				normalizeRootsConfig( {}, config, false );
			}, /^editor-create-roots-not-plain-object/ );
		} );

		it( 'should throw when config.roots is a class instance', () => {
			class CustomRoots {
				constructor() {
					this.foo = { initialData: '' };
				}
			}

			config.set( 'roots', new CustomRoots() );

			expectToThrowCKEditorError( () => {
				normalizeRootsConfig( {}, config, false );
			}, /^editor-create-roots-not-plain-object/ );
		} );

		it( 'should not throw for a plain-object config.roots', () => {
			config.set( 'roots', { foo: { initialData: '<p>Foo</p>' } } );

			normalizeRootsConfig( {}, config, false );

			expect( config.get( 'roots' ).foo.initialData ).toBe( '<p>Foo</p>' );
		} );

		it( 'should not throw when config.roots is omitted', () => {
			normalizeRootsConfig( {}, config, false );

			expect( config.get( 'roots' ) ).toEqual( {} );
		} );

		it( 'should not throw when config.roots is null', () => {
			config.set( 'roots', null );

			normalizeRootsConfig( {}, config, false );

			expect( config.get( 'roots' ) ).toEqual( {} );
		} );
	} );

	describe( 'rootConfig.element normalization', () => {
		it( 'should leave an HTMLElement as-is', () => {
			const el = document.createElement( 'div' );
			el.innerHTML = '<p>data</p>';

			config.set( 'roots', { main: { element: el } } );

			normalizeRootsConfig( '', config );

			expect( config.get( 'roots' ).main.element ).toBe( el );
		} );

		it( 'should turn a tag-name string into a canonical descriptor', () => {
			config.set( 'roots', { main: { element: 'h1' } } );

			normalizeRootsConfig( '', config );

			expect( config.get( 'roots' ).main.element ).toEqual( { name: 'h1' } );
		} );

		it( 'should normalize a view element definition object', () => {
			config.set( 'roots', {
				main: {
					element: {
						name: 'section',
						classes: 'foo bar',
						styles: { color: 'red' },
						attributes: { 'data-id': '123' }
					}
				}
			} );

			normalizeRootsConfig( '', config );

			expect( config.get( 'roots' ).main.element ).toEqual( {
				name: 'section',
				classes: [ 'foo', 'bar' ],
				styles: { color: 'red' },
				attributes: { 'data-id': '123' }
			} );
		} );

		it( 'should lift attributes.class into the classes array', () => {
			config.set( 'roots', {
				main: {
					element: {
						name: 'section',
						classes: [ 'a' ],
						attributes: { class: 'b' }
					}
				}
			} );

			normalizeRootsConfig( '', config );

			const element = config.get( 'roots' ).main.element;

			expect( element.classes ).toEqual( [ 'a', 'b' ] );
			// `class` is moved into `classes` and replaced with an empty-string sentinel so the deep-merge in
			// `Config.set()` does not preserve the user-provided value.
			expect( element.attributes ).toEqual( { class: '' } );
		} );

		it( 'should keep attributes.style as a string when no styles object is provided', () => {
			config.set( 'roots', {
				main: {
					element: {
						name: 'section',
						attributes: { style: 'color: red' }
					}
				}
			} );

			normalizeRootsConfig( '', config );

			expect( config.get( 'roots' ).main.element.attributes ).toEqual( { style: 'color: red' } );
		} );

		it( 'should prefer styles object over attributes.style string and warn', () => {
			config.set( 'roots', {
				main: {
					element: {
						name: 'section',
						styles: { color: 'blue' },
						attributes: { style: 'color: red' }
					}
				}
			} );

			const warnSpy = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );

			try {
				normalizeRootsConfig( '', config );

				expect( warnSpy.mock.calls[ 0 ][ 0 ] ).toContain( 'editor-root-element-styles-overspecified' );

				const element = config.get( 'roots' ).main.element;

				expect( element.styles ).toEqual( { color: 'blue' } );
				// `style` is replaced with an empty-string sentinel so the deep-merge in `Config.set()` does not
				// preserve the user-provided value.
				expect( element.attributes ).toEqual( { style: '' } );
			} finally {
				warnSpy.mockRestore();
			}
		} );

		it( 'should throw when the element is an HTMLTextAreaElement', () => {
			config.set( 'roots', { main: { element: document.createElement( 'textarea' ) } } );

			expectToThrowCKEditorError( () => {
				normalizeRootsConfig( '', config );
			}, /^editor-wrong-element/ );
		} );

		it( 'should throw when the element is an HTMLInputElement', () => {
			config.set( 'roots', { main: { element: document.createElement( 'input' ) } } );

			expectToThrowCKEditorError( () => {
				normalizeRootsConfig( '', config );
			}, /^editor-wrong-element/ );
		} );

		it( 'should throw when the tag-name string is `textarea`', () => {
			config.set( 'roots', { main: { element: 'textarea' } } );

			expectToThrowCKEditorError( () => {
				normalizeRootsConfig( '', config );
			}, /^editor-wrong-element/ );
		} );

		it( 'should throw when the tag-name string is `input`', () => {
			config.set( 'roots', { main: { element: 'input' } } );

			expectToThrowCKEditorError( () => {
				normalizeRootsConfig( '', config );
			}, /^editor-wrong-element/ );
		} );

		it( 'should throw when the definition name is `textarea`', () => {
			config.set( 'roots', { main: { element: { name: 'textarea' } } } );

			expectToThrowCKEditorError( () => {
				normalizeRootsConfig( '', config );
			}, /^editor-wrong-element/ );
		} );

		it( 'should throw when the definition name is `input`', () => {
			config.set( 'roots', { main: { element: { name: 'input' } } } );

			expectToThrowCKEditorError( () => {
				normalizeRootsConfig( '', config );
			}, /^editor-wrong-element/ );
		} );

		it( 'should throw `editor-wrong-element-name` for a tag-name string with a leading space', () => {
			config.set( 'roots', { main: { element: ' div' } } );

			expectToThrowCKEditorError( () => {
				normalizeRootsConfig( '', config );
			}, /^editor-wrong-element-name/ );
		} );

		it( 'should throw `editor-wrong-element-name` for a tag-name string with angle brackets', () => {
			config.set( 'roots', { main: { element: '<miamia>' } } );

			expectToThrowCKEditorError( () => {
				normalizeRootsConfig( '', config );
			}, /^editor-wrong-element-name/ );
		} );

		it( 'should throw `editor-wrong-element-name` for an empty tag-name string', () => {
			config.set( 'roots', { main: { element: '' } } );

			expectToThrowCKEditorError( () => {
				normalizeRootsConfig( '', config );
			}, /^editor-wrong-element-name/ );
		} );

		it( 'should throw `editor-wrong-element-name` for a definition with a tag name containing a space', () => {
			config.set( 'roots', { main: { element: { name: 'has space' } } } );

			expectToThrowCKEditorError( () => {
				normalizeRootsConfig( '', config );
			}, /^editor-wrong-element-name/ );
		} );

		it( 'should throw `editor-wrong-element-name` for a definition with a non-string name', () => {
			config.set( 'roots', { main: { element: { name: 123 } } } );

			expectToThrowCKEditorError( () => {
				normalizeRootsConfig( '', config );
			}, /^editor-wrong-element-name/ );
		} );

		it( 'should not throw for a custom element name with a hyphen', () => {
			config.set( 'roots', { main: { element: 'my-element' } } );

			normalizeRootsConfig( '', config );

			expect( config.get( 'roots' ).main.element ).toEqual( { name: 'my-element' } );
		} );

		it( 'should not extract initial data from a non-HTMLElement element', () => {
			config.set( 'roots', { main: { element: 'h1' } } );

			normalizeRootsConfig( '', config );

			expect( config.get( 'roots' ).main.initialData ).toBe( '' );
		} );
	} );

	describe( 'rootConfig.element normalization (config.root)', () => {
		it( 'should throw `editor-wrong-element-name` for a tag-name string with a leading space', () => {
			config.set( 'root', { element: ' div' } );

			expectToThrowCKEditorError( () => {
				normalizeRootsConfig( '', config );
			}, /^editor-wrong-element-name/ );
		} );

		it( 'should throw `editor-wrong-element-name` for a tag-name string with angle brackets', () => {
			config.set( 'root', { element: '<miamia>' } );

			expectToThrowCKEditorError( () => {
				normalizeRootsConfig( '', config );
			}, /^editor-wrong-element-name/ );
		} );

		it( 'should throw `editor-wrong-element-name` for an empty tag-name string', () => {
			config.set( 'root', { element: '' } );

			expectToThrowCKEditorError( () => {
				normalizeRootsConfig( '', config );
			}, /^editor-wrong-element-name/ );
		} );

		it( 'should throw `editor-wrong-element-name` for a definition with a tag name containing a space', () => {
			config.set( 'root', { element: { name: 'has space' } } );

			expectToThrowCKEditorError( () => {
				normalizeRootsConfig( '', config );
			}, /^editor-wrong-element-name/ );
		} );

		it( 'should throw `editor-wrong-element` when the tag-name string is `textarea`', () => {
			config.set( 'root', { element: 'textarea' } );

			expectToThrowCKEditorError( () => {
				normalizeRootsConfig( '', config );
			}, /^editor-wrong-element/ );
		} );

		it( 'should turn a tag-name string into a canonical descriptor', () => {
			config.set( 'root', { element: 'h1' } );

			normalizeRootsConfig( '', config );

			expect( config.get( 'roots' ).main.element ).toEqual( { name: 'h1' } );
		} );

		it( 'should not throw for a custom element name with a hyphen', () => {
			config.set( 'root', { element: 'my-element' } );

			normalizeRootsConfig( '', config );

			expect( config.get( 'roots' ).main.element ).toEqual( { name: 'my-element' } );
		} );
	} );

	describe( 'normalizeViewRootElementDefinition()', () => {
		it( 'should return undefined for undefined input', () => {
			expect( normalizeViewRootElementDefinition( undefined ) ).toBeUndefined();
		} );

		it( 'should return undefined for null input', () => {
			expect( normalizeViewRootElementDefinition( null ) ).toBeUndefined();
		} );

		it( 'should return an HTMLElement as-is', () => {
			const el = document.createElement( 'div' );

			expect( normalizeViewRootElementDefinition( el ) ).toBe( el );
		} );

		it( 'should turn a tag-name string into `{ name: <string> }`', () => {
			expect( normalizeViewRootElementDefinition( 'h1' ) ).toEqual( { name: 'h1' } );
		} );

		it( 'should not include undefined fields in the output for a tag-name string', () => {
			const result = normalizeViewRootElementDefinition( 'h1' );

			expect( Object.keys( result ) ).toEqual( [ 'name' ] );
		} );

		it( 'should keep the existing `name` for an object input', () => {
			expect( normalizeViewRootElementDefinition( { name: 'section' } ) ).toEqual( { name: 'section' } );
		} );

		it( 'should leave a canonical descriptor unchanged when passed back in', () => {
			const canonical = normalizeViewRootElementDefinition( {
				name: 'section',
				classes: [ 'foo' ],
				attributes: { 'data-id': '123' }
			} );

			expect( normalizeViewRootElementDefinition( canonical ) ).toEqual( canonical );
		} );

		it( 'should split a whitespace-separated `classes` string into individual tokens', () => {
			const result = normalizeViewRootElementDefinition( { name: 'section', classes: 'foo bar' } );

			expect( result.classes ).toEqual( [ 'foo', 'bar' ] );
		} );

		it( 'should keep `classes` as an array when already an array', () => {
			const result = normalizeViewRootElementDefinition( { name: 'section', classes: [ 'foo', 'bar' ] } );

			expect( result.classes ).toEqual( [ 'foo', 'bar' ] );
		} );

		it( 'should split whitespace inside array entries of `classes`', () => {
			const result = normalizeViewRootElementDefinition( { name: 'section', classes: [ 'foo bar', 'baz' ] } );

			expect( result.classes ).toEqual( [ 'foo', 'bar', 'baz' ] );
		} );

		it( 'should drop empty entries produced by extra whitespace in `classes`', () => {
			const result = normalizeViewRootElementDefinition( { name: 'section', classes: '  foo   bar  ' } );

			expect( result.classes ).toEqual( [ 'foo', 'bar' ] );
		} );

		it( 'should split a whitespace-separated `attributes.class` string into individual tokens', () => {
			const result = normalizeViewRootElementDefinition( {
				name: 'section',
				attributes: { class: 'foo bar' }
			} );

			expect( result.classes ).toEqual( [ 'foo', 'bar' ] );
		} );

		it( 'should lift `attributes.class` into `classes`', () => {
			const result = normalizeViewRootElementDefinition( {
				name: 'section',
				attributes: { class: 'foo' }
			} );

			expect( result.classes ).toEqual( [ 'foo' ] );
			// `class` is replaced with an empty-string sentinel so the deep-merge in `Config.set()` does not preserve
			// the user-provided value.
			expect( result.attributes ).toEqual( { class: '' } );
		} );

		it( 'should concatenate `classes` with `attributes.class`', () => {
			const result = normalizeViewRootElementDefinition( {
				name: 'section',
				classes: [ 'a' ],
				attributes: { class: 'b' }
			} );

			expect( result.classes ).toEqual( [ 'a', 'b' ] );
		} );

		it( 'should keep `attributes.style` as a string when no `styles` object is provided', () => {
			const result = normalizeViewRootElementDefinition( {
				name: 'section',
				attributes: { style: 'color: red' }
			} );

			expect( result.attributes ).toEqual( { style: 'color: red' } );
		} );

		it( 'should keep `styles` as an object', () => {
			const result = normalizeViewRootElementDefinition( {
				name: 'section',
				styles: { color: 'red' }
			} );

			expect( result.styles ).toEqual( { color: 'red' } );
		} );

		it( 'should prefer `styles` object over `attributes.style` and log a warning', () => {
			const warnSpy = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );

			try {
				const result = normalizeViewRootElementDefinition( {
					name: 'section',
					styles: { color: 'blue' },
					attributes: { style: 'color: red' }
				} );

				expect( warnSpy.mock.calls[ 0 ][ 0 ] ).toContain( 'editor-root-element-styles-overspecified' );
				expect( result.styles ).toEqual( { color: 'blue' } );
				// `style` is replaced with an empty-string sentinel so the deep-merge in `Config.set()` does not
				// preserve the user-provided value.
				expect( result.attributes ).toEqual( { style: '' } );
			} finally {
				warnSpy.mockRestore();
			}
		} );

		it( 'should not treat an empty `styles` object as overriding `attributes.style`', () => {
			const warnSpy = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );

			try {
				const result = normalizeViewRootElementDefinition( {
					name: 'section',
					styles: {},
					attributes: { style: 'color: red' }
				} );

				expect( warnSpy ).not.toHaveBeenCalled();
				expect( result ).not.toHaveProperty( 'styles' );
				expect( result.attributes ).toEqual( { style: 'color: red' } );
			} finally {
				warnSpy.mockRestore();
			}
		} );

		it( 'should preserve unrelated attributes', () => {
			const result = normalizeViewRootElementDefinition( {
				name: 'section',
				attributes: { 'data-id': '123', 'data-role': 'editor' }
			} );

			expect( result.attributes ).toEqual( { 'data-id': '123', 'data-role': 'editor' } );
		} );

		it( 'should omit `name` from the normalized output when not provided', () => {
			const result = normalizeViewRootElementDefinition( {
				classes: [ 'foo' ],
				attributes: { 'data-id': '123' }
			} );

			expect( result ).not.toHaveProperty( 'name' );
			expect( result.classes ).toEqual( [ 'foo' ] );
			expect( result.attributes ).toEqual( { 'data-id': '123' } );
		} );

		it( 'should not throw when `name` is omitted', () => {
			expect( () => {
				normalizeViewRootElementDefinition( { classes: [ 'foo' ] } );
			} ).not.toThrow();
		} );

		it( 'should throw on `<textarea>` HTMLElement input', () => {
			expectToThrowCKEditorError( () => {
				normalizeViewRootElementDefinition( document.createElement( 'textarea' ) );
			}, /^editor-wrong-element/ );
		} );

		it( 'should throw on `<input>` HTMLElement input', () => {
			expectToThrowCKEditorError( () => {
				normalizeViewRootElementDefinition( document.createElement( 'input' ) );
			}, /^editor-wrong-element/ );
		} );

		it( 'should throw on `\'textarea\'` tag-name string', () => {
			expectToThrowCKEditorError( () => {
				normalizeViewRootElementDefinition( 'textarea' );
			}, /^editor-wrong-element/ );
		} );

		it( 'should throw on `\'input\'` tag-name string', () => {
			expectToThrowCKEditorError( () => {
				normalizeViewRootElementDefinition( 'input' );
			}, /^editor-wrong-element/ );
		} );

		it( 'should throw on definition with `name: \'textarea\'`', () => {
			expectToThrowCKEditorError( () => {
				normalizeViewRootElementDefinition( { name: 'textarea' } );
			}, /^editor-wrong-element/ );
		} );

		it( 'should throw on definition with `name: \'input\'`', () => {
			expectToThrowCKEditorError( () => {
				normalizeViewRootElementDefinition( { name: 'input' } );
			}, /^editor-wrong-element/ );
		} );

		it( 'should match the tag name case-insensitively', () => {
			expectToThrowCKEditorError( () => {
				normalizeViewRootElementDefinition( 'TEXTAREA' );
			}, /^editor-wrong-element/ );
		} );

		it( 'should throw `editor-wrong-element-name` for a tag-name string with a leading space', () => {
			expectToThrowCKEditorError( () => {
				normalizeViewRootElementDefinition( ' div' );
			}, /^editor-wrong-element-name/ );
		} );

		it( 'should throw `editor-wrong-element-name` for a tag-name string with angle brackets', () => {
			expectToThrowCKEditorError( () => {
				normalizeViewRootElementDefinition( '<miamia>' );
			}, /^editor-wrong-element-name/ );
		} );

		it( 'should throw `editor-wrong-element-name` for a tag-name string with a trailing space', () => {
			expectToThrowCKEditorError( () => {
				normalizeViewRootElementDefinition( 'div ' );
			}, /^editor-wrong-element-name/ );
		} );

		it( 'should throw `editor-wrong-element-name` for a tag-name string with a slash', () => {
			expectToThrowCKEditorError( () => {
				normalizeViewRootElementDefinition( 'div/' );
			}, /^editor-wrong-element-name/ );
		} );

		it( 'should throw `editor-wrong-element-name` for an empty tag-name string', () => {
			expectToThrowCKEditorError( () => {
				normalizeViewRootElementDefinition( '' );
			}, /^editor-wrong-element-name/ );
		} );

		it( 'should throw `editor-wrong-element-name` for a tag-name string starting with a digit', () => {
			expectToThrowCKEditorError( () => {
				normalizeViewRootElementDefinition( '1div' );
			}, /^editor-wrong-element-name/ );
		} );

		it( 'should throw `editor-wrong-element-name` for a tag-name string containing a dot', () => {
			expectToThrowCKEditorError( () => {
				normalizeViewRootElementDefinition( 'foo.bar' );
			}, /^editor-wrong-element-name/ );
		} );

		it( 'should throw `editor-wrong-element-name` for a tag-name string containing a colon', () => {
			expectToThrowCKEditorError( () => {
				normalizeViewRootElementDefinition( 'svg:rect' );
			}, /^editor-wrong-element-name/ );
		} );

		it( 'should throw `editor-wrong-element-name` for a definition with a name containing a space', () => {
			expectToThrowCKEditorError( () => {
				normalizeViewRootElementDefinition( { name: 'has space' } );
			}, /^editor-wrong-element-name/ );
		} );

		it( 'should throw `editor-wrong-element-name` for a definition with a name containing angle brackets', () => {
			expectToThrowCKEditorError( () => {
				normalizeViewRootElementDefinition( { name: '<div>' } );
			}, /^editor-wrong-element-name/ );
		} );

		it( 'should throw `editor-wrong-element-name` for a definition with an empty name', () => {
			expectToThrowCKEditorError( () => {
				normalizeViewRootElementDefinition( { name: '' } );
			}, /^editor-wrong-element-name/ );
		} );

		it( 'should throw `editor-wrong-element-name` for a definition with a numeric name', () => {
			expectToThrowCKEditorError( () => {
				normalizeViewRootElementDefinition( { name: 123 } );
			}, /^editor-wrong-element-name/ );
		} );

		it( 'should throw `editor-wrong-element-name` for a definition with a null name', () => {
			expectToThrowCKEditorError( () => {
				normalizeViewRootElementDefinition( { name: null } );
			}, /^editor-wrong-element-name/ );
		} );

		it( 'should not throw for a custom element name with a hyphen', () => {
			expect( normalizeViewRootElementDefinition( 'my-element' ) ).toEqual( { name: 'my-element' } );
		} );

		it( 'should not throw for a custom element name with an underscore', () => {
			expect( normalizeViewRootElementDefinition( 'my_element' ) ).toEqual( { name: 'my_element' } );
		} );

		it( 'should ignore the `priority` field from ViewElementDefinition', () => {
			const result = normalizeViewRootElementDefinition( { name: 'section', priority: 5 } );

			expect( result ).not.toHaveProperty( 'priority' );
		} );
	} );

	describe( 'separateAttachTo parameter', () => {
		it( 'should assign source element to rootConfig.element by default', () => {
			const sourceElement = document.createElement( 'div' );
			sourceElement.innerHTML = '<p>data</p>';

			normalizeRootsConfig( sourceElement, config );

			const roots = config.get( 'roots' );

			expect( roots.main.element ).toBe( sourceElement );
		} );

		it( 'should not assign source element to rootConfig.element when separateAttachTo is true', () => {
			const sourceElement = document.createElement( 'div' );
			sourceElement.innerHTML = '<p>data</p>';

			normalizeRootsConfig( sourceElement, config, 'main', true );

			const roots = config.get( 'roots' );

			expect( roots.main.element ).toBeUndefined();
		} );

		it( 'should set config.attachTo when separateAttachTo is true and source is an element', () => {
			const sourceElement = document.createElement( 'div' );
			sourceElement.innerHTML = '<p>data</p>';

			normalizeRootsConfig( sourceElement, config, 'main', true );

			expect( config.get( 'attachTo' ) ).toBe( sourceElement );
		} );

		it( 'should not set config.attachTo when separateAttachTo is false', () => {
			const sourceElement = document.createElement( 'div' );
			sourceElement.innerHTML = '<p>data</p>';

			normalizeRootsConfig( sourceElement, config );

			expect( config.get( 'attachTo' ) ).toBeUndefined();
		} );

		it( 'should not set config.attachTo when source is a string', () => {
			normalizeRootsConfig( '<p>data</p>', config, 'main', true );

			expect( config.get( 'attachTo' ) ).toBeUndefined();
		} );

		it( 'should extract initialData from config.attachTo when separateAttachTo is true and source is empty', () => {
			const el = document.createElement( 'div' );
			el.innerHTML = '<p>from attachTo</p>';

			config.set( 'attachTo', el );

			normalizeRootsConfig( '', config, 'main', true );

			const roots = config.get( 'roots' );

			expect( roots.main.initialData ).toBe( '<p>from attachTo</p>' );
		} );

		it( 'should extract initialData from rootConfig.element when source is empty', () => {
			const el = document.createElement( 'div' );
			el.innerHTML = '<p>from element</p>';

			config.set( 'roots', { main: { element: el } } );

			normalizeRootsConfig( '', config );

			const roots = config.get( 'roots' );

			expect( roots.main.initialData ).toBe( '<p>from element</p>' );
		} );

		it( 'should assign source elements to rootConfig.element for multi-root', () => {
			const fooEl = document.createElement( 'div' );
			fooEl.innerHTML = '<p>Foo</p>';
			const barEl = document.createElement( 'div' );
			barEl.innerHTML = '<p>Bar</p>';

			normalizeRootsConfig( { foo: fooEl, bar: barEl }, config, false );

			const roots = config.get( 'roots' );

			expect( roots.foo.element ).toBe( fooEl );
			expect( roots.bar.element ).toBe( barEl );
		} );

		it( 'should throw when source element conflicts with rootConfig.element', () => {
			const sourceElement = document.createElement( 'div' );
			sourceElement.innerHTML = '<p>source</p>';

			const existingElement = document.createElement( 'div' );
			existingElement.innerHTML = '<p>existing</p>';

			config.set( 'roots', { main: { element: existingElement } } );

			expectToThrowCKEditorError( () => {
				normalizeRootsConfig( sourceElement, config );
			}, /^editor-create-root-element-overspecified/ );
		} );

		it( 'should throw when source element conflicts with rootConfig.element for multi-root', () => {
			const fooEl = document.createElement( 'div' );
			fooEl.innerHTML = '<p>source</p>';

			const existingEl = document.createElement( 'div' );
			existingEl.innerHTML = '<p>existing</p>';

			config.set( 'roots', { foo: { element: existingEl } } );

			expectToThrowCKEditorError( () => {
				normalizeRootsConfig( { foo: fooEl }, config, false );
			}, /^editor-create-root-element-overspecified/ );
		} );

		it( 'should warn when config.root.element is set with separateAttachTo', () => {
			const el = document.createElement( 'div' );
			el.innerHTML = '<p>data</p>';

			config.set( 'roots', { main: { element: el } } );

			const warnSpy = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );

			try {
				normalizeRootsConfig( '', config, 'main', true );

				expect( warnSpy.mock.calls[ 0 ][ 0 ] ).toContain( 'editor-create-root-element-not-supported' );
			} finally {
				warnSpy.mockRestore();
			}
		} );

		it( 'should drop the unsupported DOM element from rootConfig.element when separateAttachTo is true', () => {
			const el = document.createElement( 'div' );
			el.innerHTML = '<p>data</p>';

			config.set( 'roots', { main: { element: el } } );

			const warnSpy = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );

			try {
				normalizeRootsConfig( '', config, 'main', true );

				const roots = config.get( 'roots' );

				expect( roots.main.element ).toBeUndefined();
			} finally {
				warnSpy.mockRestore();
			}
		} );

		it( 'should not extract initialData from rootConfig.element when separateAttachTo is true', () => {
			const el = document.createElement( 'div' );
			el.innerHTML = '<p>data</p>';

			config.set( 'roots', { main: { element: el } } );

			const warnSpy = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );

			try {
				normalizeRootsConfig( '', config, 'main', true );

				const roots = config.get( 'roots' );

				// The unsupported DOM element is ignored entirely - its content is not used as initial data.
				// Integrators should use `config.attachTo` for the placement element or `config.root.initialData` for data.
				expect( roots.main.initialData ).toBe( '' );
			} finally {
				warnSpy.mockRestore();
			}
		} );

		it( 'should keep a tag-name string in rootConfig.element when separateAttachTo is true', () => {
			config.set( 'roots', { main: { element: 'h1' } } );

			normalizeRootsConfig( '', config, 'main', true );

			const roots = config.get( 'roots' );

			expect( roots.main.element ).toEqual( { name: 'h1' } );
		} );

		it( 'should throw when config.attachTo is set without separateAttachTo', () => {
			const el = document.createElement( 'div' );

			config.set( 'attachTo', el );

			expectToThrowCKEditorError( () => {
				normalizeRootsConfig( '<p>foo</p>', config );
			}, /^editor-create-attachto-ignored/ );
		} );

		it( 'should throw when config.attachTo is already set and source is an element with separateAttachTo', () => {
			const sourceElement = document.createElement( 'div' );
			sourceElement.innerHTML = '<p>source</p>';

			const existingAttachTo = document.createElement( 'div' );
			config.set( 'attachTo', existingAttachTo );

			expectToThrowCKEditorError( () => {
				normalizeRootsConfig( sourceElement, config, 'main', true );
			}, /^editor-create-attachto-overspecified/ );
		} );
	} );

	describe( 'normalizeSingleRootEditorConstructorParams()', () => {
		it( 'should return source element and config when element is first argument', () => {
			const el = document.createElement( 'div' );
			const editorConfig = { plugins: [] };

			const result = normalizeSingleRootEditorConstructorParams( el, editorConfig );

			expect( result.sourceElementOrData ).toBe( el );
			expect( result.editorConfig ).toBe( editorConfig );
		} );

		it( 'should return source string and config when string is first argument', () => {
			const editorConfig = { plugins: [] };

			const result = normalizeSingleRootEditorConstructorParams( '<p>Foo</p>', editorConfig );

			expect( result.sourceElementOrData ).toBe( '<p>Foo</p>' );
			expect( result.editorConfig ).toBe( editorConfig );
		} );

		it( 'should return empty string and config when config object is first argument', () => {
			const editorConfig = { plugins: [] };

			const result = normalizeSingleRootEditorConstructorParams( editorConfig );

			expect( result.sourceElementOrData ).toBe( '' );
			expect( result.editorConfig ).toBe( editorConfig );
		} );

		it( 'should return first argument as sourceElementOrData when it is an object but non-empty config is provided', () => {
			const sourceData = { foo: '<p>Foo</p>' };
			const editorConfig = { plugins: [] };

			const result = normalizeSingleRootEditorConstructorParams( sourceData, editorConfig );

			expect( result.sourceElementOrData ).toBe( sourceData );
			expect( result.editorConfig ).toBe( editorConfig );
		} );
	} );

	describe( 'normalizeMultiRootEditorConstructorParams()', () => {
		it( 'should return source data and config when data object is first argument with config', () => {
			const sourceData = { foo: '<p>Foo</p>' };
			const editorConfig = { plugins: [] };

			const result = normalizeMultiRootEditorConstructorParams( sourceData, editorConfig );

			expect( result.sourceElementsOrData ).toBe( sourceData );
			expect( result.editorConfig ).toBe( editorConfig );
		} );

		it( 'should return empty object and config when config object is first argument', () => {
			const editorConfig = { plugins: [] };

			const result = normalizeMultiRootEditorConstructorParams( editorConfig );

			expect( result.sourceElementsOrData ).toEqual( {} );
			expect( result.editorConfig ).toBe( editorConfig );
		} );

		it( 'should return source data and empty config when source data is passed without config', () => {
			const sourceData = { foo: '<p>Foo</p>', bar: '<p>Bar</p>' };

			const result = normalizeMultiRootEditorConstructorParams( sourceData );

			expect( result.sourceElementsOrData ).toBe( sourceData );
		} );
	} );
} );
