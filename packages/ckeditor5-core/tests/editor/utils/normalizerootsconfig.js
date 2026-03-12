/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { normalizeRootsConfig } from '../../../src/index.ts';
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

			expect( roots.main.initialData ).to.equal( '<p>foo</p>' );
		} );

		it( 'should set initialData from an empty string', () => {
			normalizeRootsConfig( '', config );

			const roots = config.get( 'roots' );

			expect( roots.main.initialData ).to.equal( '' );
		} );

		it( 'should use custom default root name', () => {
			normalizeRootsConfig( '<p>foo</p>', config, 'content' );

			const roots = config.get( 'roots' );

			expect( roots.content.initialData ).to.equal( '<p>foo</p>' );
			expect( roots.main ).to.be.undefined;
		} );

		it( 'should use initialData from config.root if set', () => {
			config.set( 'root', { initialData: '<p>bar</p>' } );
			const sourceElement = document.createElement( 'div' );

			normalizeRootsConfig( sourceElement, config );

			const roots = config.get( 'roots' );

			expect( roots.main.initialData ).to.equal( '<p>bar</p>' );
		} );

		it( 'should use initialData from legacy config.initialData', () => {
			config.set( 'initialData', '<p>legacy</p>' );

			const sourceElement = document.createElement( 'div' );

			normalizeRootsConfig( sourceElement, config );

			const roots = config.get( 'roots' );

			expect( roots.main.initialData ).to.equal( '<p>legacy</p>' );
		} );

		it( 'should throw when both config.root and config.roots.main are set', () => {
			config.set( 'root', { initialData: '<p>from root</p>' } );
			config.set( 'roots', { main: { initialData: '<p>from roots</p>' } } );

			expectToThrowCKEditorError( () => {
				normalizeRootsConfig( '', config );
			}, /^editor-create-roots-initial-data/ );
		} );

		it( 'should throw when both source data string and config.initialData are set', () => {
			config.set( 'initialData', '<p>legacy</p>' );

			expectToThrowCKEditorError( () => {
				normalizeRootsConfig( '<p>source</p>', config );
			}, /^editor-create-initial-data/ );
		} );

		it( 'should throw when both rootConfig.initialData and source data string are set', () => {
			config.set( 'roots', { main: { initialData: '<p>from roots</p>' } } );

			expectToThrowCKEditorError( () => {
				normalizeRootsConfig( '<p>source</p>', config );
			}, /^editor-create-initial-data/ );
		} );

		it( 'should throw when both rootConfig.initialData and legacy config.initialData are set', () => {
			config.set( 'roots', { main: { initialData: '<p>from roots</p>' } } );
			config.set( 'initialData', '<p>legacy</p>' );

			expectToThrowCKEditorError( () => {
				normalizeRootsConfig( document.createElement( 'div' ), config );
			}, /^editor-create-roots-initial-data/ );
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

			expect( roots.main.initialData ).to.equal( '<p>element data</p>' );
		} );

		it( 'should prefer legacy config.initialData over source element', () => {
			config.set( 'initialData', '<p>legacy</p>' );

			normalizeRootsConfig( sourceElement, config );

			const roots = config.get( 'roots' );

			expect( roots.main.initialData ).to.equal( '<p>legacy</p>' );
		} );
	} );

	describe( 'multi-root (object source data)', () => {
		it( 'should set initialData from source data object', () => {
			normalizeRootsConfig( {
				header: '<p>header</p>',
				content: '<p>content</p>'
			}, config, false );

			const roots = config.get( 'roots' );

			expect( roots.header.initialData ).to.equal( '<p>header</p>' );
			expect( roots.content.initialData ).to.equal( '<p>content</p>' );
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

			expect( roots.header.initialData ).to.equal( '<p>header</p>' );
			expect( roots.header.placeholder ).to.equal( 'Type header...' );
			expect( roots.content.initialData ).to.equal( '<p>content</p>' );
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

			expect( roots.header.initialData ).to.equal( '<p>from config</p>' );
		} );

		it( 'should throw when both source data string and rootConfig.initialData are set for a root', () => {
			config.set( 'roots', {
				header: { initialData: '<p>from config</p>' }
			} );

			expectToThrowCKEditorError( () => {
				normalizeRootsConfig( {
					header: '<p>from source</p>'
				}, config, false );
			}, /^editor-create-initial-data/ );
		} );

		it( 'should use legacy config.initialData as object', () => {
			config.set( 'initialData', {
				header: '<p>legacy header</p>',
				content: '<p>legacy content</p>'
			} );

			normalizeRootsConfig( {}, config, false );

			const roots = config.get( 'roots' );

			expect( roots.header.initialData ).to.equal( '<p>legacy header</p>' );
			expect( roots.content.initialData ).to.equal( '<p>legacy content</p>' );
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

			expect( roots.fromRoots ).to.not.be.undefined;
			expect( roots.fromLegacy ).to.not.be.undefined;
			expect( roots.fromSource ).to.not.be.undefined;
		} );
	} );

	describe( 'defaultRootName parameter', () => {
		it( 'should default to "main"', () => {
			normalizeRootsConfig( '<p>foo</p>', config );

			const roots = config.get( 'roots' );

			expect( roots.main ).to.not.be.undefined;
		} );

		it( 'should not create a default root when set to false', () => {
			normalizeRootsConfig( {}, config, false );

			const roots = config.get( 'roots' );

			expect( roots.main ).to.be.undefined;
		} );

		it( 'should throw when config.root is set and defaultRootName is false', () => {
			config.set( 'root', { initialData: '<p>data</p>' } );

			expectToThrowCKEditorError( () => {
				normalizeRootsConfig( {}, config, false );
			}, /^editor-create-roots-initial-data/ );
		} );
	} );

	describe( 'legacy placeholder and label', () => {
		it( 'should set placeholder from legacy config.placeholder string', () => {
			config.set( 'placeholder', 'Type here...' );

			normalizeRootsConfig( '<p>foo</p>', config );

			const roots = config.get( 'roots' );

			expect( roots.main.placeholder ).to.equal( 'Type here...' );
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

			expect( roots.header.placeholder ).to.equal( 'Type header...' );
			expect( roots.content.placeholder ).to.equal( 'Type content...' );
		} );

		it( 'should set label from legacy config.label string', () => {
			config.set( 'label', 'Editor' );

			normalizeRootsConfig( '<p>foo</p>', config );

			const roots = config.get( 'roots' );

			expect( roots.main.label ).to.equal( 'Editor' );
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

			expect( roots.header.label ).to.equal( 'Header editor' );
			expect( roots.content.label ).to.equal( 'Content editor' );
		} );

		it( 'should not override placeholder already set in root config', () => {
			config.set( 'placeholder', 'Legacy placeholder' );
			config.set( 'roots', {
				main: { initialData: '', placeholder: 'Root placeholder' }
			} );

			normalizeRootsConfig( document.createElement( 'div' ), config );

			const roots = config.get( 'roots' );

			expect( roots.main.placeholder ).to.equal( 'Root placeholder' );
		} );

		it( 'should not override label already set in root config', () => {
			config.set( 'label', 'Legacy label' );
			config.set( 'roots', {
				main: { initialData: '', label: 'Root label' }
			} );

			normalizeRootsConfig( document.createElement( 'div' ), config );

			const roots = config.get( 'roots' );

			expect( roots.main.label ).to.equal( 'Root label' );
		} );
	} );

	describe( 'config.roots is set after normalization', () => {
		it( 'should always set config.roots', () => {
			normalizeRootsConfig( '<p>foo</p>', config );

			expect( config.get( 'roots' ) ).to.be.an( 'object' );
		} );

		it( 'should update config.roots with all processed roots', () => {
			config.set( 'roots', {
				header: { initialData: '<p>h</p>' },
				content: { initialData: '<p>c</p>' }
			} );

			normalizeRootsConfig( document.createElement( 'div' ), config );

			const roots = config.get( 'roots' );

			expect( Object.keys( roots ) ).to.include( 'main' );
			expect( Object.keys( roots ) ).to.include( 'header' );
			expect( Object.keys( roots ) ).to.include( 'content' );
		} );
	} );
} );
