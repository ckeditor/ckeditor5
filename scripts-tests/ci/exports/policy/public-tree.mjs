/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, expect, it } from 'vitest';
import { publicTree } from '../../../../scripts/ci/exports/policy/public-tree.mjs';

function createLibrary( { indexExports = [], augmentations = [] } = {} ) {
	return {
		packages: new Map( [
			[ '@ckeditor/ckeditor5-example', {
				packageName: '@ckeditor/ckeditor5-example',
				index: { exports: indexExports },
				modules: [ { augmentations } ]
			} ]
		] )
	};
}

describe( 'scripts/ci/exports/policy/public-tree', () => {
	it( 'should mark exports of the package index and all their references as a part of the public tree', () => {
		const declarationReference = { references: [] };
		const declaration = { references: [ declarationReference ] };
		const sourceExport = { references: [ declaration ] };
		const indexExport = { references: [ sourceExport ] };

		publicTree( createLibrary( { indexExports: [ indexExport ] } ) );

		expect( indexExport.isPublicTree ).toBe( true );
		expect( sourceExport.isPublicTree ).toBe( true );
		expect( declaration.isPublicTree ).toBe( true );
		expect( declarationReference.isPublicTree ).toBe( true );
	} );

	it( 'should not mark an internal item and should not follow its references', () => {
		const reference = { references: [] };
		const internalDeclaration = { internal: true, references: [ reference ] };
		const indexExport = { references: [ internalDeclaration ] };

		publicTree( createLibrary( { indexExports: [ indexExport ] } ) );

		expect( internalDeclaration.isPublicTree ).toBeUndefined();
		expect( reference.isPublicTree ).toBeUndefined();
	} );

	it( 'should mark references of augmentations but not the augmentations themselves', () => {
		const reference = { references: [] };
		const augmentation = { isAugmentation: true, references: [ reference ] };

		publicTree( createLibrary( { augmentations: [ augmentation ] } ) );

		expect( reference.isPublicTree ).toBe( true );
		expect( augmentation.isPublicTree ).toBeUndefined();
	} );

	it( 'should handle circular references', () => {
		const declaration = { references: [] };
		const indexExport = { references: [ declaration ] };

		declaration.references.push( indexExport );

		publicTree( createLibrary( { indexExports: [ indexExport ] } ) );

		expect( indexExport.isPublicTree ).toBe( true );
		expect( declaration.isPublicTree ).toBe( true );
	} );

	it( 'should handle exports without references', () => {
		const indexExport = { references: null };

		publicTree( createLibrary( { indexExports: [ indexExport ] } ) );

		expect( indexExport.isPublicTree ).toBe( true );
	} );
} );
