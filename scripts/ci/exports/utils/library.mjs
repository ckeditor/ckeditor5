#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* eslint-env node */

/**
 * Note: Run this script in root of ckeditor5.
 */

import { Module } from './module.mjs';
import { packageDirName } from './misc.mjs';

export class Library {
	constructor() {
		this.modules = [];
		this.packages = new Map();
	}

	loadModules( typeScriptFileNames ) {
		this.modules = typeScriptFileNames.map( fileName => Module.load( fileName ) );

		for ( const module of this.modules ) {
			const packageName = module.packageName;

			if ( !this.packages.has( packageName ) ) {
				this.packages.set( packageName, {
					packageName,
					dirName: packageDirName( module.fileName ),
					index: null,
					modules: []
				} );
			}

			if ( module.relativeFileName === 'index.ts' ) {
				this.packages.get( packageName ).index = module;
			} else {
				this.packages.get( packageName ).modules.push( module );
			}
		}

		// Resolve module imports after all packages have known names and paths.
		for ( const module of this.modules ) {
			module.resolveImportsExports( this.packages, this.modules );
		}

		// Resolve declarations references after all module imports have been resolved.
		for ( const module of this.modules ) {
			module.resolveReferences();
		}

		if ( Module.unknownReferences.size ) {
			const unknownReferences = Array.from( Module.unknownReferences ).map( name => `'${ name }'` ).sort().join( ',\n' );

			// Make sure that DOM/global declarations are listed in `Module.ignoredStdTypes`.
			console.warn( 'Unknown references:\n' + unknownReferences );
		}

		// Mark exports with the re-exported name.
		for ( const pkg of this.packages.values() ) {
			for ( const exportItem of pkg.index.exports ) {
				if ( exportItem.localName === '*' ) {
					// `export * as x from 'y'`
					for ( const srcExport of exportItem.importFrom.exports ) {
						srcExport.reExported.push( {
							name: exportItem.name + '.' + srcExport.name,
							kind: exportItem.exportKind
						} );
					}
				} else {
					const srcExport = exportItem.importFrom.exports.find( item => item.name === exportItem.localName );

					srcExport.reExported.push( {
						name: exportItem.name,
						kind: exportItem.exportKind
					} );
				}
			}
		}

		return this;
	}
}
