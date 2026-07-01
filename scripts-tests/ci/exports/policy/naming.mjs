/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, expect, it } from 'vitest';
import { validateNaming } from '../../../../scripts/ci/exports/policy/naming.mjs';
import { Declaration } from '../../../../scripts/ci/exports/utils/declaration.mjs';

function createItem( { localName, internal = false, references = [] } = {} ) {
	return { localName, internal, references };
}

function validate( { packageName, relativeFileName = 'examplefeature.ts', item } ) {
	return validateNaming( {
		pkg: { packageName },
		module: { relativeFileName },
		item
	} );
}

describe( 'scripts/ci/exports/policy/naming', () => {
	describe( 'view document event policy', () => {
		it( 'should accept any `ViewDocument*Event` name', () => {
			const result = validate( {
				packageName: '@ckeditor/ckeditor5-example',
				item: createItem( { localName: 'ViewDocumentClickEvent' } )
			} );

			expect( result ).toEqual( { ok: true, policyName: 'view-document-event' } );
		} );
	} );

	describe( 'essential packages policy', () => {
		it( 'should accept any name in an essential package', () => {
			const result = validate( {
				packageName: '@ckeditor/ckeditor5-core',
				item: createItem( { localName: 'WithoutPackageName' } )
			} );

			expect( result ).toEqual( { ok: true, policyName: 'essential-packages' } );
		} );
	} );

	describe( 'engine policies', () => {
		it( 'should require the `Observer` part for names in `view/observer/` files', () => {
			const result = validate( {
				packageName: '@ckeditor/ckeditor5-engine',
				relativeFileName: 'view/observer/clickobserver.ts',
				item: createItem( { localName: 'ExampleClick' } )
			} );

			expect( result ).toEqual( { ok: false, warning: 'include Observer', policyName: 'engine' } );
		} );

		it( 'should accept a name containing `Observer` in `view/observer/` files', () => {
			const result = validate( {
				packageName: '@ckeditor/ckeditor5-engine',
				relativeFileName: 'view/observer/clickobserver.ts',
				item: createItem( { localName: 'ClickObserver' } )
			} );

			expect( result ).toEqual( { ok: true, policyName: 'engine' } );
		} );

		it( 'should accept an uppercase name part in `view/` files', () => {
			const result = validate( {
				packageName: '@ckeditor/ckeditor5-engine',
				relativeFileName: 'view/filler.ts',
				item: createItem( { localName: 'VIEW_FILLER_OFFSET' } )
			} );

			expect( result ).toEqual( { ok: true, policyName: 'engine' } );
		} );

		it( 'should require the `_` prefix for names in `dev-utils/` files', () => {
			const result = validate( {
				packageName: '@ckeditor/ckeditor5-engine',
				relativeFileName: 'dev-utils/model.ts',
				item: createItem( { localName: 'getModelData' } )
			} );

			expect( result ).toEqual( { ok: false, warning: 'add \'_\' prefix', policyName: 'engine' } );
		} );

		it( 'should accept a name with the `_` prefix in `dev-utils/` files', () => {
			const result = validate( {
				packageName: '@ckeditor/ckeditor5-engine',
				relativeFileName: 'dev-utils/model.ts',
				item: createItem( { localName: '_getModelData' } )
			} );

			expect( result ).toEqual( { ok: true, policyName: 'engine' } );
		} );

		it( 'should require the `Downcast` part for names in `conversion/downcast*` files', () => {
			const result = validate( {
				packageName: '@ckeditor/ckeditor5-engine',
				relativeFileName: 'conversion/downcasthelpers.ts',
				item: createItem( { localName: 'ExampleHelpers' } )
			} );

			expect( result ).toEqual( { ok: false, warning: 'include Downcast', policyName: 'engine' } );
		} );

		it( 'should fall back to the essential packages policy for internal engine items', () => {
			const result = validate( {
				packageName: '@ckeditor/ckeditor5-engine',
				relativeFileName: 'view/observer/clickobserver.ts',
				item: createItem( { localName: 'ExampleClick', internal: true } )
			} );

			expect( result ).toEqual( { ok: true, policyName: 'essential-packages' } );
		} );
	} );

	describe( 'plugin class policy', () => {
		it( 'should accept any name of a plugin class', () => {
			const declaration = new Declaration( { localName: 'WithoutPackageName', type: 'class' } );

			declaration.isPluginClass = true;

			const result = validate( {
				packageName: '@ckeditor/ckeditor5-case-change',
				item: createItem( { localName: 'WithoutPackageName', references: [ { localName: 'not-a-declaration' }, declaration ] } )
			} );

			expect( result ).toEqual( { ok: true, policyName: 'plugin-class' } );
		} );
	} );

	describe( 'command class policy', () => {
		function createCommandItem( localName ) {
			const declaration = new Declaration( { localName, type: 'class' } );

			declaration.isCommandClass = true;

			return createItem( { localName, references: [ declaration ] } );
		}

		it( 'should accept a command class name with the `Command` suffix', () => {
			const result = validate( {
				packageName: '@ckeditor/ckeditor5-case-change',
				item: createCommandItem( 'ChangeCaseCommand' )
			} );

			expect( result ).toEqual( { ok: true, policyName: 'command-class' } );
		} );

		it( 'should reject a command class name without the `Command` suffix', () => {
			const result = validate( {
				packageName: '@ckeditor/ckeditor5-case-change',
				item: createCommandItem( 'CaseChanger' )
			} );

			expect( result ).toEqual( { ok: false, warning: 'add \'Command\' suffix', policyName: 'command-class' } );
		} );
	} );

	describe( 'package name policy', () => {
		it( 'should accept a name containing the pascal-cased package name', () => {
			const result = validate( {
				packageName: '@ckeditor/ckeditor5-case-change',
				item: createItem( { localName: 'CaseChangeEditing' } )
			} );

			expect( result ).toEqual( { ok: true, policyName: 'package-name' } );
		} );

		it( 'should reject a name not containing the package name', () => {
			const result = validate( {
				packageName: '@ckeditor/ckeditor5-case-change',
				item: createItem( { localName: 'SomethingElse' } )
			} );

			expect( result ).toEqual( { ok: false, warning: 'include \'CaseChange\'', policyName: 'package-name' } );
		} );

		it( 'should accept an uppercase name containing the package name', () => {
			const result = validate( {
				packageName: '@ckeditor/ckeditor5-table',
				item: createItem( { localName: 'TABLE_DEFAULT_OPTIONS' } )
			} );

			expect( result ).toEqual( { ok: true, policyName: 'package-name' } );
		} );

		it( 'should accept any name of an internal item', () => {
			const result = validate( {
				packageName: '@ckeditor/ckeditor5-case-change',
				item: createItem( { localName: 'SomethingElse', internal: true } )
			} );

			expect( result ).toEqual( { ok: true, policyName: 'package-name' } );
		} );

		it( 'should use the singular form of a plural package name', () => {
			const result = validate( {
				packageName: '@ckeditor/ckeditor5-widgets',
				item: createItem( { localName: 'WidgetToolbar' } )
			} );

			expect( result ).toEqual( { ok: true, policyName: 'package-name' } );
		} );

		it( 'should use predefined name variants for specific packages', () => {
			const okResult = validate( {
				packageName: '@ckeditor/ckeditor5-find-and-replace',
				item: createItem( { localName: 'ReplaceAllUI' } )
			} );

			expect( okResult ).toEqual( { ok: true, policyName: 'package-name' } );

			const failedResult = validate( {
				packageName: '@ckeditor/ckeditor5-find-and-replace',
				item: createItem( { localName: 'SomethingElse' } )
			} );

			expect( failedResult ).toEqual( { ok: false, warning: 'include \'Find\' or \'Replace\'', policyName: 'package-name' } );
		} );
	} );
} );
