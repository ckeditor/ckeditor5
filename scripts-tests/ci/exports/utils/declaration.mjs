/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, expect, it } from 'vitest';
import { Declaration } from '../../../../scripts/ci/exports/utils/declaration.mjs';

function createNode( { line = 1, filename = '/repo/packages/ckeditor5-example/src/file.ts', leadingComments, declare } = {} ) {
	return {
		loc: { filename, start: { line } },
		leadingComments,
		declare
	};
}

describe( 'scripts/ci/exports/utils/declaration', () => {
	describe( 'create()', () => {
		it( 'should map known AST declaration types to simplified type names', () => {
			const typeMap = {
				ClassDeclaration: 'class',
				FunctionDeclaration: 'function',
				TSDeclareFunction: 'function',
				TSInterfaceDeclaration: 'interface',
				TSTypeAliasDeclaration: 'type'
			};

			for ( const [ astType, simplifiedType ] of Object.entries( typeMap ) ) {
				const declaration = Declaration.create( {
					localName: 'Foo',
					type: astType,
					node: createNode()
				} );

				expect( declaration.type, astType ).toBe( simplifiedType );
			}
		} );

		it( 'should pass through an unknown type', () => {
			const declaration = Declaration.create( {
				localName: 'foo',
				type: 'var',
				node: createNode()
			} );

			expect( declaration.type ).toBe( 'var' );
		} );

		it( 'should read the file name and line number from the AST node location', () => {
			const declaration = Declaration.create( {
				localName: 'Foo',
				type: 'ClassDeclaration',
				node: createNode( { line: 42, filename: '/repo/packages/ckeditor5-example/src/foo.ts' } )
			} );

			expect( declaration.fileName ).toBe( '/repo/packages/ckeditor5-example/src/foo.ts' );
			expect( declaration.lineNumber ).toBe( 42 );
		} );

		it( 'should mark a declaration with the `@internal` comment as explicitly internal', () => {
			const declaration = Declaration.create( {
				localName: 'Foo',
				type: 'ClassDeclaration',
				node: createNode( { leadingComments: [ { value: '*\n * @internal\n ' } ] } )
			} );

			expect( declaration.internal ).toBe( true );
			expect( declaration.explicitInternal ).toBe( true );
		} );

		it( 'should mark a declaration as internal (but not explicitly) when the `internal` flag is passed', () => {
			const declaration = Declaration.create( {
				localName: 'Foo',
				type: 'ClassDeclaration',
				internal: true,
				node: createNode()
			} );

			expect( declaration.internal ).toBe( true );
			expect( declaration.explicitInternal ).toBe( false );
		} );

		it( 'should not mark a declaration as internal by default', () => {
			const declaration = Declaration.create( {
				localName: 'Foo',
				type: 'ClassDeclaration',
				node: createNode()
			} );

			expect( declaration.internal ).toBeFalsy();
			expect( declaration.explicitInternal ).toBe( false );
		} );

		it( 'should mark an ambient declaration (`declare class`)', () => {
			const declaration = Declaration.create( {
				localName: 'Foo',
				type: 'ClassDeclaration',
				node: createNode( { declare: true } )
			} );

			expect( declaration.ambient ).toBe( true );
		} );

		it( 'should initialize default values', () => {
			const declaration = Declaration.create( {
				localName: 'Foo',
				type: 'ClassDeclaration',
				node: createNode()
			} );

			expect( declaration.references ).toEqual( [] );
			expect( declaration.baseClasses ).toEqual( [] );
			expect( declaration.ambient ).toBe( false );
			expect( declaration.mixinBaseHelperCandidate ).toBe( false );
			expect( declaration.isMixinBaseHelper ).toBe( false );
		} );
	} );

	describe( 'addReference()', () => {
		function createDeclaration() {
			return Declaration.create( {
				localName: 'Foo',
				type: 'ClassDeclaration',
				node: createNode()
			} );
		}

		it( 'should add a reference passed as a string and be chainable', () => {
			const declaration = createDeclaration();

			const result = declaration.addReference( 'Bar', [] );

			expect( declaration.references ).toEqual( [ 'Bar' ] );
			expect( result ).toBe( declaration );
		} );

		it( 'should add a reference passed as an `Identifier` AST node', () => {
			const declaration = createDeclaration();

			declaration.addReference( { type: 'Identifier', name: 'Bar' }, [] );

			expect( declaration.references ).toEqual( [ 'Bar' ] );
		} );

		it( 'should add the right-hand name of a `globalThis` qualified name and mark the declaration', () => {
			const declaration = createDeclaration();

			declaration.addReference( {
				type: 'TSQualifiedName',
				left: { name: 'globalThis' },
				right: { name: 'Bar' }
			}, [] );

			expect( declaration.references ).toEqual( [ 'Bar' ] );
			expect( declaration.referenceGlobalThisProperty ).toBe( true );
		} );

		it( 'should add the left-hand name of a qualified name (namespace reference)', () => {
			const declaration = createDeclaration();

			declaration.addReference( {
				type: 'TSQualifiedName',
				left: { name: 'Namespace' },
				right: { name: 'Member' }
			}, [] );

			expect( declaration.references ).toEqual( [ 'Namespace' ] );
			expect( declaration.referenceGlobalThisProperty ).toBeUndefined();
		} );

		it( 'should ignore references to type parameters', () => {
			const declaration = createDeclaration();

			declaration.addReference( 'T', [ 'T' ] );

			expect( declaration.references ).toEqual( [] );
		} );

		it( 'should throw on an unknown reference type', () => {
			const declaration = createDeclaration();

			expect( () => {
				declaration.addReference( { type: 'StringLiteral' }, [] );
			} ).toThrow( 'Unknown reference type: StringLiteral' );
		} );
	} );
} );
