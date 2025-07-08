/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * Utility functions for creating detailed error messages with context information.
 */

/**
 * Creates a detailed error message for export resolution failures.
 *
 * @param {Object} context - The context information
 * @param {string} context.fileName - The file where the error occurred
 * @param {string} context.exportName - The name of the export
 * @param {string} context.localName - The local name of the export
 * @param {string} context.importFrom - The module being imported from
 * @param {boolean} context.isExternalModule - Whether the import is from an external module
 * @param {string} context.exportKind - The kind of export (value, type, etc.)
 * @param {Array} context.availableDeclarations - Available declarations in the module
 * @param {Array} context.availableImports - Available imports in the module
 * @returns {string} A detailed error message
 */
export function createExportResolutionError( context ) {
	const {
		fileName,
		exportName,
		localName,
		importFrom,
		isExternalModule,
		exportKind,
		availableDeclarations = [],
		availableImports = []
	} = context;

	let message = '\n❌ Export resolution failed\n';
	message += `- File: ${ fileName }\n`;
	message += `- Export: ${ exportName }\n`;
	message += `- Local name: ${ localName }\n`;

	if ( exportKind ) {
		message += `- Export kind: ${ exportKind }\n`;
	}

	if ( importFrom ) {
		message += `- Import from: ${ importFrom }\n`;
		message += `- External module: ${ isExternalModule ? 'Yes' : 'No' }\n`;
	}

	if ( isExternalModule ) {
		message += '\n   This appears to be a re-export from an external module.\n';
		message += '   The validation script cannot resolve external module exports.\n';
		message += '   Consider:\n';
		message += '   1. Skipping validation for external modules\n';
		message += '   2. Creating local declarations for external exports\n';
		message += '   3. Using type-only exports for external types\n';
	} else {
		message += '\nAvailable declarations in this module:\n';
		if ( availableDeclarations.length > 0 ) {
			availableDeclarations.forEach( decl => {
				message += `   - ${ decl.localName } (${ decl.type })\n`;
			} );
		} else {
			message += '   (none)\n';
		}

		message += '\n📦 Available imports in this module:\n';
		if ( availableImports.length > 0 ) {
			availableImports.forEach( imp => {
				message += `   - ${ imp.localName } from ${ imp.importFrom }\n`;
			} );
		} else {
			message += '   (none)\n';
		}

		message += '\n💡 Possible solutions:\n';
		message += '   1. Check if the declaration exists in the imported module\n';
		message += '   2. Verify the import path is correct\n';
		message += '   3. Ensure the export is properly declared in the source module\n';
		message += '   4. Check for typos in the export/import names\n';
	}

	return message;
}

/**
 * Creates a detailed error message for module resolution failures.
 *
 * @param {Object} context - The context information
 * @param {string} context.fileName - The file where the error occurred
 * @param {string} context.importFrom - The module path that couldn't be resolved
 * @param {string} context.packageName - The package name
 * @param {Array} context.availablePackages - Available packages
 * @returns {string} A detailed error message
 */
export function createModuleResolutionError( context ) {
	const {
		fileName,
		importFrom,
		packageName,
		availablePackages = []
	} = context;

	let message = '\n❌ Module resolution failed\n';
	message += `- File: ${ fileName }\n`;
	message += `- Package: ${ packageName }\n`;
	message += `- Import path: ${ importFrom }\n`;

	message += '\n* Available packages:\n';
	if ( availablePackages.length > 0 ) {
		availablePackages.slice( 0, 10 ).forEach( pkg => {
			message += `   - ${ pkg }\n`;
		} );
		if ( availablePackages.length > 10 ) {
			message += `   ... and ${ availablePackages.length - 10 } more\n`;
		}
	} else {
		message += '   (none)\n';
	}

	message += '\n* Possible solutions:\n';
	message += '   1. Check if the package exists in the workspace\n';
	message += '   2. Verify the import path is correct\n';
	message += '   3. Ensure the package has a proper index.ts file\n';
	message += '   4. Check for typos in the package name or path\n';

	return message;
}

/**
 * Creates a detailed error message for import reference failures.
 *
 * @param {Object} context - The context information
 * @param {string} context.fileName - The file where the error occurred
 * @param {string} context.importFrom - The module being imported from
 * @param {string} context.referenceName - The reference name that couldn't be found
 * @param {Array} context.availableExports - Available exports in the source module
 * @returns {string} A detailed error message
 */
export function createImportReferenceError( context ) {
	const {
		fileName,
		importFrom,
		referenceName,
		availableExports = []
	} = context;

	let message = '\n❌ Import reference not found\n';
	message += `- File: ${ fileName }\n`;
	message += `- Import from: ${ importFrom }\n`;
	message += `- Reference name: ${ referenceName }\n`;

	message += '\n- Available exports in source module:\n';
	if ( availableExports.length > 0 ) {
		availableExports.slice( 0, 10 ).forEach( exp => {
			message += `   - ${ exp.name } (${ exp.exportKind || 'value' })\n`;
		} );
		if ( availableExports.length > 10 ) {
			message += `   ... and ${ availableExports.length - 10 } more\n`;
		}
	} else {
		message += '   (none)\n';
	}

	message += '\n- Possible solutions:\n';
	message += '   1. Check if the export exists in the source module\n';
	message += '   2. Verify the export name is spelled correctly\n';
	message += '   3. Ensure the export is properly declared in the source module\n';
	message += '   4. Check if the export is a type export when importing as value or vice versa\n';

	return message;
}

/**
 * Creates a detailed error message for AST parsing failures.
 *
 * @param {Object} context - The context information
 * @param {string} context.fileName - The file where the error occurred
 * @param {string} context.nodeType - The type of AST node
 * @param {string} context.line - The line number
 * @param {string} context.column - The column number
 * @param {Object} context.node - The AST node object
 * @returns {string} A detailed error message
 */
export function createASTParsingError( context ) {
	const {
		fileName,
		nodeType,
		line,
		column,
		node
	} = context;

	let message = '\n❌ AST parsing failed\n';
	message += `- File: ${ fileName }\n`;
	message += `- Location: line ${ line }, column ${ column }\n`;
	message += `- Node type: ${ nodeType }\n`;

	if ( node ) {
		message += '\n* Node details:\n';
		message += `   Type: ${ node.type }\n`;
		if ( node.name ) {
			message += `   Name: ${ node.name }\n`;
		}
		if ( node.value ) {
			message += `   Value: ${ node.value }\n`;
		}
	}

	message += '\n* This usually indicates:\n';
	message += '   1. Unsupported TypeScript/JavaScript syntax\n';
	message += '   2. A bug in the AST parser configuration\n';
	message += '   3. Missing Babel/TypeScript parser plugin\n';
	message += '   4. Syntax error in the source file\n';

	return message;
}
