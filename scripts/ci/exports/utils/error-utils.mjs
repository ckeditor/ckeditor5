/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * Utility functions for creating detailed error messages with context information.
 */

export function createExportResolutionSummary( context ) {
	const { fileName, exportName, isExternalModule, exportKind } = context;

	const relativePath = fileName.replace( /.*\/packages\//, '' ).replace( /.*\/external\//, '' );
	const exportType = exportKind || 'value';

	let reason, solution;

	if ( isExternalModule ) {
		reason = 'External module re-export';
		solution = 'Create local declarations for external exports or use type-only exports';
	} else {
		reason = 'Declaration not found';
		solution = 'Check if the export exists in the source module and verify import path';
	}

	return {
		summary: `[${ relativePath }] Export '${ exportName }' (${ exportType }): ${ reason }`,
		solution
	};
}

export function createModuleResolutionSummary( context ) {
	const { fileName, importFrom } = context;

	const relativePath = fileName.replace( /.*\/packages\//, '' ).replace( /.*\/external\//, '' );

	return {
		summary: `[${ relativePath }] Module '${ importFrom }' not found`,
		solution: 'Check if the package exists and has a proper index.ts file'
	};
}

export function createImportReferenceSummary( context ) {
	const { fileName, importFrom, referenceName } = context;

	const relativePath = fileName.replace( /.*\/packages\//, '' ).replace( /.*\/external\//, '' );

	return {
		summary: `[${ relativePath }] Import '${ referenceName }' from '${ importFrom }' not found`,
		solution: 'Verify the export exists in the source module and check for typos'
	};
}

export function createASTParsingSummary( context ) {
	const { fileName, nodeType, line, column } = context;

	const relativePath = fileName.replace( /.*\/packages\//, '' ).replace( /.*\/external\//, '' );
	const location = line ? `:${ line }${ column ? `:${ column }` : '' }` : '';

	return {
		summary: `[${ relativePath }${ location }] AST parsing failed for ${ nodeType }`,
		solution: 'Check for unsupported TypeScript syntax or parser configuration issues'
	};
}

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

	let message = '\nExport resolution failed\n';
	message += `File: ${ fileName }\n`;
	message += `Export: ${ exportName }\n`;
	message += `Local name: ${ localName }\n`;

	if ( exportKind ) {
		message += `Export kind: ${ exportKind }\n`;
	}

	if ( importFrom ) {
		message += `Import from: ${ importFrom }\n`;
		message += `External module: ${ isExternalModule ? 'Yes' : 'No' }\n`;
	}

	if ( isExternalModule ) {
		message += '\nThis appears to be a re-export from an external module.\n';
		message += 'The validation script cannot resolve external module exports.\n';
		message += 'Consider:\n';
		message += '1. Skipping validation for external modules\n';
		message += '2. Creating local declarations for external exports\n';
		message += '3. Using type-only exports for external types\n';
	} else {
		message += '\nAvailable declarations in this module:\n';
		if ( availableDeclarations.length > 0 ) {
			availableDeclarations.forEach( decl => {
				message += `   - ${ decl.localName } (${ decl.type })\n`;
			} );
		} else {
			message += '   (none)\n';
		}

		message += '\nAvailable imports in this module:\n';
		if ( availableImports.length > 0 ) {
			availableImports.forEach( imp => {
				message += `   - ${ imp.localName } from ${ imp.importFrom }\n`;
			} );
		} else {
			message += '   (none)\n';
		}

		message += '\nPossible solutions:\n';
		message += '1. Check if the declaration exists in the imported module\n';
		message += '2. Verify the import path is correct\n';
		message += '3. Ensure the export is properly declared in the source module\n';
		message += '4. Check for typos in the export/import names\n';
	}

	return message;
}

export function createModuleResolutionError( context ) {
	const {
		fileName,
		importFrom,
		packageName,
		availablePackages = []
	} = context;

	let message = '\nModule resolution failed\n';
	message += `File: ${ fileName }\n`;
	message += `Package: ${ packageName }\n`;
	message += `Import path: ${ importFrom }\n`;

	message += '\nAvailable packages:\n';
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

	message += '\nPossible solutions:\n';
	message += '1. Check if the package exists in the workspace\n';
	message += '2. Verify the import path is correct\n';
	message += '3. Ensure the package has a proper index.ts file\n';
	message += '4. Check for typos in the package name or path\n';

	return message;
}

export function createImportReferenceError( context ) {
	const {
		fileName,
		importFrom,
		referenceName,
		availableExports = []
	} = context;

	let message = '\nImport reference not found\n';
	message += `File: ${ fileName }\n`;
	message += `Import from: ${ importFrom }\n`;
	message += `Reference name: ${ referenceName }\n`;

	message += '\nAvailable exports in source module:\n';
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

	message += '\nPossible solutions:\n';
	message += '1. Check if the export exists in the source module\n';
	message += '2. Verify the export name is spelled correctly\n';
	message += '3. Ensure the export is properly declared in the source module\n';
	message += '4. Check if the export is a type export when importing as value or vice versa\n';

	return message;
}

export function createASTParsingError( context ) {
	const {
		fileName,
		nodeType,
		line,
		column,
		node
	} = context;

	let message = '\nAST parsing failed\n';
	message += `File: ${ fileName }\n`;
	message += `Location: line ${ line }, column ${ column }\n`;
	message += `Node type: ${ nodeType }\n`;

	if ( node ) {
		message += '\nNode details:\n';
		message += `   Type: ${ node.type }\n`;
		if ( node.name ) {
			message += `   Name: ${ node.name }\n`;
		}
		if ( node.value ) {
			message += `   Value: ${ node.value }\n`;
		}
	}

	message += '\nThis usually indicates:\n';
	message += '1. Unsupported TypeScript/JavaScript syntax\n';
	message += '2. A bug in the AST parser configuration\n';
	message += '3. Missing Babel/TypeScript parser plugin\n';
	message += '4. Syntax error in the source file\n';

	return message;
}
