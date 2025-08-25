/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import parser from '@babel/parser';
import traverse from '@babel/traverse';
import fs from 'fs';
import upath from 'upath';
import { Export } from './export.mjs';
import { Import } from './import.mjs';
import { Declaration } from './declaration.mjs';
import { ExternalModule } from './externalmodule.mjs';
import { isInternalNode } from './misc.mjs';
import { createExportResolutionError } from './errorutils.mjs';

export class Module {
	static load( fileName, errorCollector ) {
		const data = fs.readFileSync( fileName, 'utf8' );

		const ast = parser.parse( data, {
			sourceType: 'module',
			sourceFilename: fileName,
			ranges: true,
			plugins: [ 'typescript' ]
		} );

		return new Module( fileName, ast, {
			publicApiTag: data.includes( ' * @publicApi' )
		}, errorCollector );
	}

	constructor( fileName, ast, { publicApiTag }, errorCollector ) {
		this.fileName = fileName.replace( /\.d\.ts$/, '.ts' );
		// TODO: `/external/` check doesn't seem correct, because it causes some errors to be silenced.
		this.isPublicApi = fileName.includes( '/external/' ) || this.relativeFileName === 'index.ts' ? true : publicApiTag;
		this.exports = [];
		this.imports = [];
		this.declarations = [];
		this.augmentations = [];
		this.errorCollector = errorCollector;

		// Collecting all generic type parameters in the module as a shortcut to ignore them later.
		// If we don't do this, we will have to check every time if the reference is a type parameter.
		// It is a bit of a shortcut as type parameters exist in the given declaration context only.
		const typeParameters = [];

		traverse.default( ast, {
			ExportNamedDeclaration: ( { node } ) => {
				if ( node.declaration ) {
					// Ignore TSDeclareFunction for now as it is a different signature of the same function from FunctionDeclaration.
					if ( node.declaration.type === 'TSDeclareFunction' ) {
						return;
					}

					if ( node.declaration.id ) {
						this.exports.push( Export.create( {
							name: node.declaration.id.name,
							localName: node.declaration.id.name,
							node,
							fileName
						} ) );
					}
					else if ( node.declaration.type === 'VariableDeclaration' ) {
						for ( const declaration of node.declaration.declarations ) {
							this.exports.push( Export.create( {
								name: declaration.id.name,
								localName: declaration.id.name,
								node, // TODO more specific node?
								fileName
							} ) );
						}
					}
					else {
						throw new Error( 'Unknown AST export node' );
					}
				} else {
					// export type { Marker };
					// export { Marker, Foo as bar, Baz as default };
					// or when `source` is set:
					// export ... from ...; export * as ... from ...;
					for ( const specifier of node.specifiers ) {
						this.exports.push( Export.create( {
							name: specifier.exported.name,
							localName: specifier.local ? specifier.local.name : '*',
							exportKind: node.exportKind === 'type' ? 'type' : specifier.exportKind,
							node,
							type: specifier.local?.type === 'Identifier' ? 'identifier' : '',
							fileName,
							importFrom: node.source ? node.source.value : undefined
						} ) );
					}
				}
			},

			ExportDefaultDeclaration: ( { node } ) => {
				// Ignore TSDeclareFunction for now as it is a different signature of the same function from FunctionDeclaration.
				if ( node.declaration.type === 'TSDeclareFunction' ) {
					return;
				}

				if ( node.declaration.id ) {
					// export default class foo {}
					// export default function foo() {}
					this.exports.push( Export.create( {
						name: 'default',
						localName: node.declaration.id.name,
						node,
						fileName
					} ) );
				} else {
					// export default foo;
					// export default class {}
					// export default { foo: 2 }
					this.exports.push( Export.create( {
						name: 'default',
						localName: node.declaration.name || '<default>',
						node,
						fileName
					} ) );

					if ( !node.declaration.name ) {
						this.declarations.push( Declaration.create( {
							localName: '<default>',
							type: '',
							node
						} ) );
					}
				}
			},

			ExportAllDeclaration: ( { node } ) => {
				this.exports.push( Export.create( {
					name: '*',
					localName: '',
					node,
					fileName,
					importFrom: node.source ? node.source.value : undefined
				} ) );
			},

			ImportDeclaration: ( { node } ) => {
				// import '../theme/blockquote.css'
				// if ( node.specifiers.length === 0 && !node.source.value.endsWith( '.css' ) ) {
				// 	// TODO fix augmentation.ts files to import only from index.ts
				// 	// TODO remove unnecessary: import './mediaembedconfig.js'; etc
				// 	console.warn( 'Specifier not found ' + node.source.value + ' ' + this.relativeFileName + '#' + node.loc.start.line );
				// }

				for ( const specifier of node.specifiers ) {
					// import ViewText from './text.js'
					if ( specifier.type === 'ImportDefaultSpecifier' ) {
						this.imports.push( Import.create( {
							name: 'default',
							localName: specifier.local.name,
							importFrom: node.source.value,
							importKind: specifier.importKind,
							// node.assertions ???
							node,
							fileName
						} ) );
					}
					else if ( specifier.type === 'ImportSpecifier' ) {
						// import { default as Matcher, type MatcherPattern } from './matcher.js';
						if ( specifier.imported.type === 'Identifier' ) {
							this.imports.push( Import.create( {
								name: specifier.imported.name,
								localName: specifier.local.name,
								importKind: specifier.importKind,
								importFrom: node.source.value,
								// node.assertions ???
								node,
								fileName
							} ) );
						}
						else {
							throw new Error( 'Unknown AST import specifier:' + specifier.imported );
						}
					}
					else if ( specifier.type === 'ImportNamespaceSpecifier' ) {
						// import * as foo from './bar.js'
						this.imports.push( Import.create( {
							name: '*',
							localName: specifier.local.name,
							importKind: specifier.importKind,
							importFrom: node.source.value,
							// node.assertions ???
							node,
							fileName
						} ) );
					}
					else {
						throw new Error( 'Unknown AST import specifier:' + specifier.type + ' ' +
							this.relativeFileName + '#' + node.loc.start.line
						);
					}
				}
			},

			// Ignore body-s of functions, methods, etc.
			BlockStatement: path => {
				path.skip();
			},

			'ClassMethod|ClassProperty': path => {
				if ( path.node.accessibility === 'private' ) {
					path.skip();
				}
			},

			TSTypeParameter: ( { node } ) => {
				typeParameters.push( node.name );
			},

			Declaration: path => {
				const { node } = path;

				// Handled separately.
				if ( path.isExportDeclaration() || path.isImportDeclaration() ) {
					return;
				}

				// Skip `declare module '...' { ... }` and `declare global { ... }`
				// except for augmentations for '@ckeditor/ckeditor5-core'.
				// as it currently does not affect export results.
				if ( path.isTSModuleDeclaration() ) {
					// Process module declarations, specifically handling augmentations for @ckeditor/ckeditor5-core.
					if ( node.id.type === 'StringLiteral' && node.id.value === '@ckeditor/ckeditor5-core' ) {
						// Process declarations inside the module augmentation.
						path.traverse( {
							TSInterfaceDeclaration: interfacePath => {
								// Add the augmented interface itself to augmentations and declarations.
								const declaration = Declaration.create( {
									localName: interfacePath.node.id.name,
									type: 'TSInterfaceDeclaration',
									node: interfacePath.node,
									internal: false
								} );

								declaration.isAugmentation = true;
								this.augmentations.push( declaration );
								this.declarations.push( declaration );
							}
						} );
					} else {
						// Skip other module declarations (declare global, etc.).
						path.skip();
					}
					return;
				}

				if ( path.isVariableDeclaration() ) {
					if ( path.parentPath.isProgram() || path.parentPath.isExportDeclaration() ) {
						for ( const declarator of path.node.declarations ) {
							this.declarations.push( Declaration.create( {
								localName: declarator.id.name,
								type: 'var',
								node
							} ) );
						}
					} else if ( !path.parentPath.isBlockParent() ) {
						// Ignore variable declarations in the body of functions, classes, for-of loops, etc. but warn about other cases.
						console.warn( 'Ignored variable declaration', node.loc.filename, node.loc.start.line );
					}

					return;
				}

				if ( node.id.type !== 'Identifier' ) {
					console.warn( 'No node identifier', node.loc.start.line, node.loc.start.column );
					return;
				}

				const declaration = Declaration.create( {
					localName: node.id.name,
					type: node.type,
					internal: !this.isPublicApi || !!path.findParent( path => isInternalNode( path.node ) ),
					node
				} );

				this.declarations.push( declaration );

				// As the declaration is traversed before its type parameters.
				if ( node.typeParameters ) {
					path.traverse( {
						TSTypeParameter: ( { node } ) => {
							typeParameters.push( node.name );
						}
					} );
				}

				// For class.
				if ( node.superClass ) {
					const superClassPath = path.get( 'superClass' );
					const baseClasses = [];

					if ( superClassPath.isIdentifier() ) {
						const superClassName = superClassPath.node.name;

						baseClasses.push( superClassName );
						declaration.addReference( superClassName, typeParameters );
					} else {
						superClassPath.traverse( {
							Identifier: path => {
								const superClassName = path.node.name;

								baseClasses.push( superClassName );
								declaration.addReference( superClassName, typeParameters );
							}
						} );
					}

					// Store the base classes chain.
					declaration.baseClasses = baseClasses;
				}

				// For class.
				if ( node.implements ) {
					path.get( 'implements' ).forEach( item => item.traverse( {
						TSTypeReference: path => {
							declaration.addReference( path.node.typeName.name, typeParameters );
							path.skip();
						},
						Identifier: path => {
							declaration.addReference( path.node.name, typeParameters );
						}
					} ) );
				}

				// For interface.
				if ( node.extends ) {
					path.get( 'extends' ).forEach( item => item.traverse( {
						Identifier: path => {
							declaration.addReference( path.node.name, typeParameters );
						}
					} ) );
				}
			},

			TSTypeReference: path => {
				const { node } = path;

				// Ignore references from internal nodes.
				if ( path.findParent( path => isInternalNode( path.node ) ) ) {
					return;
				}

				if ( node.typeName.type === 'Identifier' || node.typeName.type === 'TSQualifiedName' ) {
					const parentPath = path.findParent( path => path.isDeclaration() || path.isVariableDeclarator() );

					if ( !parentPath ) {
						console.warn( '!! no parent function or class property', node.loc.start.line, node.loc.start.column ); // TODO
						// throw new Error( 'Unhandled TSTypeReference' );
						return;
					}

					if ( parentPath.node.id && parentPath.node.id.type !== 'Identifier' ) {
						console.warn( '!! not an identifier', node.loc.start.line, node.loc.start.column ); // TODO
						return;
					}

					const declarationName = parentPath.node.id ? parentPath.node.id.name : '<default>';

					this.declarations
						.find( ( { localName } ) => localName === declarationName )
						.addReference( node.typeName, typeParameters );
				}
				else {
					console.warn( '!!! reference is not an identifier', node.loc.start.line, node.loc.start.column );
				}
			}
		} );
	}

	resolveImportsExports( packages, modules ) {
		// Resolve modules referenced by `import x from y` and `export x from y`.
		const resolveModuleImport = item => {
			if ( typeof item.importFrom == 'string' ) {
				const importFrom = this.resolvePath( item.importFrom, packages );

				const otherModule = importFrom ?
					modules.find( module => module.fileName === importFrom ) :
					new ExternalModule( item.importFrom );

				return item.resolveImport( otherModule );
			} else {
				return [ item ];
			}
		};

		this.exports = this.exports.flatMap( resolveModuleImport );
		this.imports = this.imports.flatMap( resolveModuleImport );
	}

	resolveReferences() {
		// Import references.
		for ( const importItem of this.imports ) {
			importItem.references = this._findImportReference( importItem.importFrom, importItem.name );
		}

		for ( const declarationItem of this.declarations ) {
			declarationItem.references = [
				// Replace names of references with objects.
				...declarationItem.references.flatMap( referenceName => this._findReference( referenceName ) ),

				// Find exports related to the given declaration as it could be referenced by other declarations in the same module.
				...this.exports.filter( exportItem => exportItem.localName === declarationItem.localName )
			];

			// Recursively resolve base classes.
			const resolveBaseClasses = ( declaration, visited = new Set() ) => {
				if ( !declaration.baseClasses || visited.has( declaration ) ) {
					return [];
				}

				visited.add( declaration );
				const allBaseClasses = [ ...declaration.baseClasses ];

				for ( const baseClassName of declaration.baseClasses ) {
					// Find the base class declaration through references.
					for ( const ref of declaration.references ) {
						let targetDeclaration;

						if ( ref instanceof Import ) {
							// If it's an import, follow its references to find the target declaration.
							for ( const exportRef of ref.references || [] ) {
								for ( const declRef of exportRef.references || [] ) {
									if ( declRef instanceof Declaration && declRef.localName === baseClassName ) {
										targetDeclaration = declRef;
										break;
									}
								}
								if ( targetDeclaration ) {
									break;
								}
							}
						} else if ( ref instanceof Declaration ) {
							targetDeclaration = ref;
						}

						if ( targetDeclaration && targetDeclaration.localName === baseClassName ) {
							// Recursively get base classes of the base class.
							const inheritedBaseClasses = resolveBaseClasses( targetDeclaration, visited );

							allBaseClasses.push( ...inheritedBaseClasses );
							break;
						}
					}
				}

				return allBaseClasses;
			};

			// Update baseClasses with all inherited base classes.
			if ( declarationItem.baseClasses ) {
				declarationItem.baseClasses = resolveBaseClasses( declarationItem );
			}
		}

		// Link exports with declarations of exported stuff.
		for ( const exportItem of this.exports ) {
			const references = exportItem.importFrom ?
				this._findImportReference( exportItem.importFrom, exportItem.localName ) :
				this._findReference( exportItem.localName );

			if ( !references || !references.length ) {
				const context = {
					fileName: this.fileName,
					exportName: exportItem.name,
					isExternalModule: exportItem.importFrom instanceof ExternalModule,
					exportKind: exportItem.exportKind
				};

				const exportResolutionError = createExportResolutionError( context );

				this.errorCollector.addError( exportResolutionError );
			}

			exportItem.references = references;
		}
	}

	_findReference( referenceName ) {
		const reference =
			this.declarations.find( declaration => declaration.localName === referenceName ) ||
			this.imports.find( importItem => importItem.localName === referenceName );

		if ( !reference ) {
			if ( Module.ignoredStdTypes.includes( referenceName ) ) {
				return [];
			}

			// Collect unknown type references to add later to Module.ignoredStdTypes list if confirmed that are global declarations.
			Module.unknownReferences.add( referenceName );

			return [];
		}

		return [ reference ];
	}

	_findImportReference( importFrom, referenceName ) {
		// Patch: Handle undefined importFrom gracefully to prevent crashes.
		if ( !importFrom ) {
			return [];
		}

		if ( importFrom instanceof ExternalModule ) {
			return [];
		}

		// For `export * as ... from ...`;
		if ( referenceName === '*' ) {
			return importFrom.exports;
		}

		const reference = importFrom.exports.find( exportItem => exportItem.name === referenceName );

		if ( !reference ) {
			const context = {
				fileName: this.fileName,
				exportName: referenceName,
				isExternalModule: false,
				exportKind: importFrom.exportKind
			};

			const importReferenceError = createExportResolutionError( context );

			this.errorCollector.addError( importReferenceError );
		}

		return [ reference ];
	}

	get packageName() {
		const packageDirMatch = this.fileName.match( /.+\/packages\/(.+?)\// );
		const externalDirMatch = this.fileName.match( /.+\/external\/(.+?)\// );

		return '@ckeditor/' + ( packageDirMatch ? packageDirMatch[ 1 ] : externalDirMatch[ 1 ] );
	}

	get relativeFileName() {
		return this.fileName.replace( /.+\/src\//, '' );
	}

	resolvePath( fileName, packages ) {
		if ( fileName.startsWith( '/' ) ) {
			return fileName;
		}

		if ( fileName.startsWith( '.' ) ) {
			return upath.join( upath.dirname( this.fileName ), fileName.replace( /\.js$/, '.ts' ) );
		}

		for ( const pkg of packages.values() ) {
			if ( normalizeModuleAlias( fileName ) === pkg.packageName ) {
				return upath.join( pkg.dirName, '/src/index.ts' );
			}
		}

		return null;
	}

	static ignoredStdTypes = [
		'AbortController',
		'AbortSignal',
		'Array',
		'ArrayBuffer',
		'ArrayLike',
		'Blob',
		'Buffer',
		'CSSRule',
		'CSSStyleDeclaration',
		'CSSStyleSheet',
		'CanvasRenderingContext2D',
		'ClipboardEvent',
		'Comment',
		'CompositionEvent',
		'ConstructorParameters',
		'CustomElementConstructor',
		'DOMException',
		'DOMParser',
		'DOMRect',
		'DOMRectList',
		'Date',
		'Document',
		'DocumentFragment',
		'DragEvent',
		'Element',
		'Error',
		'ErrorEvent',
		'Event',
		'EventTarget',
		'Exclude',
		'File',
		'FileList',
		'FileReader',
		'FocusEvent',
		'FormData',
		'Function',
		'Generator',
		'HTMLBRElement',
		'HTMLBodyElement',
		'HTMLButtonElement',
		'HTMLDivElement',
		'HTMLElement',
		'HTMLElementEventMap',
		'HTMLElementTagNameMap',
		'HTMLIFrameElement',
		'HTMLImageElement',
		'HTMLInputElement',
		'HTMLSpanElement',
		'HTMLTextAreaElement',
		'HTMLUListElement',
		'HeadersInit',
		'InputEvent',
		'InstanceType',
		'Iterable',
		'IterableIterator',
		'Iterator',
		'IteratorResult',
		'IteratorYieldResult',
		'KeyboardEvent',
		'Map',
		'MouseEvent',
		'Node',
		'NodeList',
		'NonNullable',
		'Omit',
		'Parameters',
		'Partial',
		'Pick',
		'ProgressEvent',
		'Promise',
		'PropertyKey',
		'Range',
		'Readonly',
		'ReadonlyArray',
		'Record',
		'RegExp',
		'RegExpExecArray',
		'RegExpMatchArray',
		'Required',
		'ResizeObserverEntry',
		'ReturnType',
		'SVGElementTagNameMap',
		'Selection',
		'Set',
		'StaticRange',
		'Text',
		'ThisType',
		'TouchEvent',
		'URL',
		'Uint8Array',
		'VoidFunction',
		'WeakSet',
		'Window',
		'WindowEventMap',
		'XMLHttpRequest',
		'const'
	];

	static unknownReferences = new Set();
}

function normalizeModuleAlias( name ) {
	return name.replace( /^ckeditor5(?:-collaboration)?\/src\/(.*)\.js$/, '@ckeditor/ckeditor5-$1' );
}
