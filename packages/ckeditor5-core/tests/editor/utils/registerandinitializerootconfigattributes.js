/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Editor } from '../../../src/editor/editor.js';
import { ElementApiMixin } from '../../../src/editor/utils/elementapimixin.js';
import { normalizeRootsConfig, normalizeSingleRootEditorConstructorParams } from '../../../src/editor/utils/normalizerootsconfig.js';
import { registerAndInitializeRootConfigAttributes } from '@ckeditor/ckeditor5-core';
import { global } from '@ckeditor/ckeditor5-utils';

describe( 'registerAndInitializeRootConfigAttributes()', () => {
	let domElement, editor;

	beforeEach( () => {
		editor = null;
		domElement = global.document.body.appendChild(
			global.document.createElement( 'div' )
		);
	} );

	afterEach( async () => {
		vi.restoreAllMocks();
		domElement.remove();

		if ( editor && editor.state !== 'destroyed' ) {
			await editor.destroy();
		}
	} );

	it( 'should not crash if editor was initialized without root(s) config', async () => {
		editor = await CustomEditor.create( {} );

		expect( editor ).toBeInstanceOf( CustomEditor );
	} );

	it( 'should not crash if root config is defined without `modelAttributes`', async () => {
		editor = await CustomEditor.create( {
			root: {
				attachTo: domElement
			}
		} );

		expect( editor ).toBeInstanceOf( CustomEditor );
	} );

	it( 'should not crash if roots config is defined without `modelAttributes`', async () => {
		editor = await CustomEditor.create( {
			roots: {
				main: {
					attachTo: domElement
				}
			}
		} );

		expect( editor ).toBeInstanceOf( CustomEditor );
	} );

	it( 'should register attributes if specified in `root.modelAttributes`', async () => {
		editor = await CustomEditor.create( {
			root: {
				modelAttributes: {
					foo: 1,
					bar: 2
				}
			}
		} );

		const root = editor.model.document.getRoot();

		expect( root.getAttribute( 'foo' ) ).toBe( 1 );
		expect( root.getAttribute( 'bar' ) ).toBe( 2 );

		expect( editor.getRootAttributes() ).toEqual( {
			foo: 1,
			bar: 2
		} );
	} );

	it( 'should register attributes if specified in `roots.main.modelAttributes`', async () => {
		editor = await CustomEditor.create( {
			roots: {
				main: {
					modelAttributes: {
						foo: 1,
						bar: 2
					}
				}
			}
		} );

		const root = editor.model.document.getRoot();

		expect( root.getAttribute( 'foo' ) ).toBe( 1 );
		expect( root.getAttribute( 'bar' ) ).toBe( 2 );

		expect( editor.getRootAttributes() ).toEqual( {
			foo: 1,
			bar: 2
		} );
	} );

	it( 'should not register additional root or do anything if specified not registered root in the config', async () => {
		editor = await CustomEditor.create( {
			roots: {
				main: {
					modelAttributes: {
						foo: 1,
						bar: 2
					}
				},
				second: {
					lazy: true
				}
			}
		} );

		expect( editor.getRootAttributes() ).toEqual( {
			foo: 1,
			bar: 2
		} );

		expect( editor.model.document.getRoot( 'second' ) ).toBeNull();
	} );

	it( 'should not set a root attribute when its value is `null` in `modelAttributes`', async () => {
		editor = await CustomEditor.create( {
			roots: {
				main: {
					modelAttributes: {
						foo: null
					}
				}
			}
		} );

		expect( editor.getRootAttributes( 'main' ) ).toEqual( { foo: null } );
	} );

	it( 'should not crash if there is no `modelAttributes` specified for created root', async () => {
		editor = await CustomEditor.create( {
			roots: {
				main: {
					modelAttributes: {
						foo: 1
					}
				},
				second: {}
			}
		} );

		expect( editor.getRootAttributes( 'main' ) ).toEqual( { foo: 1 } );
		expect( editor.getRootAttributes( 'second' ) ).toEqual( { foo: null } );
	} );

	it( 'should be possible to define attributes for multiple roots at once', async () => {
		editor = await CustomEditor.create( {
			roots: {
				main: {
					modelAttributes: {
						foo: 1
					}
				},
				second: {
					modelAttributes: {
						bar: 2
					}
				},
				third: {
					modelAttributes: {
						bar: 3
					}
				}
			}
		} );

		expect( editor.getRootAttributes( 'main' ) ).toEqual( {
			foo: 1,
			bar: null
		} );

		expect( editor.getRootAttributes( 'second' ) ).toEqual( {
			foo: null,
			bar: 2
		} );

		expect( editor.getRootAttributes( 'third' ) ).toEqual( {
			foo: null,
			bar: 3
		} );
	} );

	it( 'should register and set `$description` from `root.description`', async () => {
		editor = await CustomEditor.create( {
			root: {
				description: 'My description'
			}
		} );

		const root = editor.model.document.getRoot();

		expect( root.getAttribute( '$description' ) ).toBe( 'My description' );
		expect( editor.getRootAttributes() ).toEqual( { $description: 'My description' } );
	} );

	it( 'should register and set `$description` for each root from `roots.<rootName>.description`', async () => {
		editor = await CustomEditor.create( {
			roots: {
				main: {
					description: 'Main description'
				},
				second: {
					description: 'Second description'
				}
			}
		} );

		expect( editor.getRootAttributes( 'main' ) ).toEqual( { $description: 'Main description' } );
		expect( editor.getRootAttributes( 'second' ) ).toEqual( { $description: 'Second description' } );
	} );

	it( 'should not register `$description` when no description is configured', async () => {
		editor = await CustomEditor.create( {
			root: {
				modelAttributes: { foo: 1 }
			}
		} );

		expect( editor.getRootAttributes() ).toEqual( { foo: 1 } );
	} );

	it( 'should store `description` in `modelAttributes` so it ships through the RTC initial-data path', async () => {
		editor = await CustomEditor.create( {
			root: {
				description: 'My description'
			}
		} );

		expect( editor.config.get( 'roots' ).main.modelAttributes ).toEqual( { $description: 'My description' } );
	} );

	it( 'should not override a `$description` already provided in `modelAttributes`', async () => {
		editor = await CustomEditor.create( {
			root: {
				description: 'Configured description',
				modelAttributes: { $description: 'Restored description' }
			}
		} );

		expect( editor.getRootAttributes() ).toEqual( { $description: 'Restored description' } );
	} );

	it( 'should register and set `$title` from `root.title`', async () => {
		editor = await CustomEditor.create( {
			root: {
				title: 'My title'
			}
		} );

		const root = editor.model.document.getRoot();

		expect( root.getAttribute( '$title' ) ).toBe( 'My title' );
		expect( editor.getRootAttributes() ).toEqual( { $title: 'My title' } );
	} );

	it( 'should register and set `$title` for each root from `roots.<rootName>.title`', async () => {
		editor = await CustomEditor.create( {
			roots: {
				main: {
					title: 'Main title'
				},
				second: {
					title: 'Second title'
				}
			}
		} );

		expect( editor.getRootAttributes( 'main' ) ).toEqual( { $title: 'Main title' } );
		expect( editor.getRootAttributes( 'second' ) ).toEqual( { $title: 'Second title' } );
	} );

	it( 'should not register `$title` when no title is configured', async () => {
		editor = await CustomEditor.create( {
			root: {
				modelAttributes: { foo: 1 }
			}
		} );

		expect( editor.getRootAttributes() ).toEqual( { foo: 1 } );
	} );

	it( 'should store `title` in `modelAttributes` so it ships through the RTC initial-data path', async () => {
		editor = await CustomEditor.create( {
			root: {
				title: 'My title'
			}
		} );

		expect( editor.config.get( 'roots' ).main.modelAttributes ).toEqual( { $title: 'My title' } );
	} );

	it( 'should not override a `$title` already provided in `modelAttributes`', async () => {
		editor = await CustomEditor.create( {
			root: {
				title: 'Configured title',
				modelAttributes: { $title: 'Restored title' }
			}
		} );

		expect( editor.getRootAttributes() ).toEqual( { $title: 'Restored title' } );
	} );

	it( 'should register and set both `$description` and `$title` from the root config', async () => {
		editor = await CustomEditor.create( {
			root: {
				description: 'My description',
				title: 'My title'
			}
		} );

		expect( editor.getRootAttributes() ).toEqual( {
			$description: 'My description',
			$title: 'My title'
		} );
	} );
} );

class CustomEditor extends ElementApiMixin( Editor ) {
	constructor( sourceElementOrDataOrConfig, config ) {
		const {
			sourceElementOrData,
			editorConfig
		} = normalizeSingleRootEditorConstructorParams( sourceElementOrDataOrConfig, config );

		super( editorConfig );

		normalizeRootsConfig( sourceElementOrData, this.config, 'main', true );

		for ( const [ root, rootConfig ] of Object.entries( this.config.get( 'roots' ) ) ) {
			if ( rootConfig.lazy ) {
				continue;
			}

			this.model.document.createRoot( '$root', root );
		}

		registerAndInitializeRootConfigAttributes( this );
	}

	static create( sourceElementOrData, config = {} ) {
		return new Promise( resolve => {
			const editor = new this( sourceElementOrData, config );

			resolve(
				editor.initPlugins()
					.then( () => editor.data.init( editor.config.get( 'roots' ).main.initialData ) )
					.then( () => editor.fire( 'ready' ) )
					.then( () => editor )
			);
		} );
	}
}
