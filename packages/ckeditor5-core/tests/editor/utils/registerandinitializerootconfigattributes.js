/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { testUtils } from '../../_utils/utils.js';
import { Editor } from '../../../src/editor/editor.js';
import { ElementApiMixin } from '../../../src/editor/utils/elementapimixin.js';
import { normalizeRootsConfig, normalizeSingleRootEditorConstructorParams } from '../../../src/editor/utils/normalizerootsconfig.js';
import { registerAndInitializeRootConfigAttributes } from '@ckeditor/ckeditor5-core';

describe( 'registerAndInitializeRootConfigAttributes()', () => {
	let domElement, editor;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editor = null;
		domElement = global.document.body.appendChild(
			global.document.createElement( 'div' )
		);
	} );

	afterEach( async () => {
		domElement.remove();

		if ( editor && editor.state !== 'destroyed' ) {
			await editor.destroy();
		}
	} );

	it( 'should not crash if editor was initialized without root(s) config', async () => {
		editor = await CustomEditor.create( {} );

		expect( editor ).to.be.instanceOf( CustomEditor );
	} );

	it( 'should not crash if root config is defined without `modelAttributes`', async () => {
		editor = await CustomEditor.create( {
			root: {
				attachTo: domElement
			}
		} );

		expect( editor ).to.be.instanceOf( CustomEditor );
	} );

	it( 'should not crash if roots config is defined without `modelAttributes`', async () => {
		editor = await CustomEditor.create( {
			roots: {
				main: {
					attachTo: domElement
				}
			}
		} );

		expect( editor ).to.be.instanceOf( CustomEditor );
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

		expect( root.getAttribute( 'foo' ) ).to.be.equal( 1 );
		expect( root.getAttribute( 'bar' ) ).to.be.equal( 2 );

		expect( editor.getRootAttributes() ).to.deep.equal( {
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

		expect( root.getAttribute( 'foo' ) ).to.be.equal( 1 );
		expect( root.getAttribute( 'bar' ) ).to.be.equal( 2 );

		expect( editor.getRootAttributes() ).to.deep.equal( {
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

		expect( editor.getRootAttributes() ).to.deep.equal( {
			foo: 1,
			bar: 2
		} );

		expect( editor.model.document.getRoot( 'second' ) ).to.be.null;
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

		expect( editor.getRootAttributes( 'main' ) ).to.deep.equal( { foo: 1 } );
		expect( editor.getRootAttributes( 'second' ) ).to.deep.equal( { foo: null } );
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

		expect( editor.getRootAttributes( 'main' ) ).to.deep.equal( {
			foo: 1,
			bar: null
		} );

		expect( editor.getRootAttributes( 'second' ) ).to.deep.equal( {
			foo: null,
			bar: 2
		} );

		expect( editor.getRootAttributes( 'third' ) ).to.deep.equal( {
			foo: null,
			bar: 3
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
