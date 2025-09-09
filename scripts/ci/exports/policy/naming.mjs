/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Declaration } from '../utils/declaration.mjs';

export function validateNaming( { pkg, module, item } ) {
	const policies = [
		viewDocumentEventPolicy(),
		...enginePolicies(),
		essentialPackagesPolicy(),
		pluginClassPolicy(),
		commandClassPolicy(),
		containsPackageNamePolicy()
	];

	const policy = policies.find( policy => policy.isApplicable() );

	if ( policy.checkName() ) {
		return { ok: true, policyName: policy.policyName };
	}

	return { ok: false, warning: policy.getWarning(), policyName: policy.policyName };

	function essentialPackagesPolicy() {
		const essentialPackages = [
			'@ckeditor/ckeditor5-clipboard',
			'@ckeditor/ckeditor5-cloud-services',
			'@ckeditor/ckeditor5-collaboration-core',
			'@ckeditor/ckeditor5-core',
			'@ckeditor/ckeditor5-editor-balloon',
			'@ckeditor/ckeditor5-editor-classic',
			'@ckeditor/ckeditor5-editor-decoupled',
			'@ckeditor/ckeditor5-editor-inline',
			'@ckeditor/ckeditor5-editor-multi-root',
			'@ckeditor/ckeditor5-engine',
			'@ckeditor/ckeditor5-typing',
			'@ckeditor/ckeditor5-ui',
			'@ckeditor/ckeditor5-upload',
			'@ckeditor/ckeditor5-utils',
			'@ckeditor/ckeditor5-widget'
		];

		return {
			policyName: 'essential-packages',
			isApplicable: () => essentialPackages.includes( pkg.packageName ),
			checkName: everyNameIsOk
		};
	}

	// Temporary policies (for one-off renaming).
	function enginePolicies() {
		return [
			namesInFile( /^controller\// ).shouldContain( 'Controller' ),
			namesInFile( /^conversion\/downcast*/ ).shouldContain( 'Downcast' ),
			namesInFile( /^conversion\/upcast*/ ).shouldContain( 'Upcast' ),
			namesInFile( /^conversion\// ).areOk(),
			namesInFile( /^dataprocessor\// ).areOk(),
			namesInFile( /^dev-utils\// ).shouldStartWith( '_' ),
			namesInFile( /^model\/batch.ts$/ ).areOk(),
			namesInFile( /^model\/differ.ts$/ ).shouldStartWith( 'Differ' ),
			namesInFile( /^model\/markercollection.ts$/ ).shouldContain( 'Marker' ),
			namesInFile( /^model\/history.ts$/ ).shouldContain( 'History' ),
			namesInFile( /^model\/!(operation)/ ).shouldStartWith( 'Model' ),
			namesInFile( /^view\/observer\/bubbling/ ).shouldContain( 'Bubbling' ),
			namesInFile( /^view\/observer\// ).shouldContain( 'Observer' ),
			namesInFile( /^view\/styles/ ).shouldContain( 'Style' ),
			namesInFile( /^view\/matcher.ts$/ ).shouldContain( 'Match' ),
			namesInFile( /^view\/view.ts/ ).shouldContain( 'View' ),
			namesInFile( /^view\// ).shouldContain( 'View' )
		];

		function namesInFile( fileNameRegex ) {
			const isApplicable = () => (
				pkg.packageName === '@ckeditor/ckeditor5-engine' &&
				fileNameRegex.test( module.relativeFileName ) &&
				!item.internal
			);

			return {
				areOk: () => ( {
					policyName: 'engine',
					isApplicable,
					checkName: everyNameIsOk
				} ),

				shouldContain: str => ( {
					policyName: 'engine',
					isApplicable,
					checkName: () => item.localName.includes( str ) || item.localName.includes( str.toUpperCase() ),
					getWarning: () => `include ${ str }`
				} ),

				shouldStartWith: str => ( {
					policyName: 'engine',
					isApplicable,
					checkName: () => item.localName.startsWith( str ) || item.localName.startsWith( str.toUpperCase() ),
					getWarning: () => `add '${ str }' prefix`
				} )
			};
		}
	}

	function pluginClassPolicy() {
		return {
			policyName: 'plugin-class',
			isApplicable: () => findDeclaration( item )?.isPluginClass,
			checkName: everyNameIsOk
		};
	}

	function commandClassPolicy() {
		return {
			policyName: 'command-class',
			isApplicable: () => findDeclaration( item )?.isCommandClass,
			checkName: () => item.localName.endsWith( 'Command' ),
			getWarning: () => 'add \'Command\' suffix'
		};
	}

	function viewDocumentEventPolicy() {
		const viewDocumentEventRegex = /^ViewDocument(.*)Event(Data)?$/;

		return {
			policyName: 'view-document-event',
			isApplicable: () => viewDocumentEventRegex.test( item.localName ),
			checkName: everyNameIsOk
		};
	}

	function containsPackageNamePolicy() {
		return {
			policyName: 'package-name',
			isApplicable: () => true,
			checkName: () => getPackageNameVariants().some( name => {
				if ( item.internal ) {
					return true;
				}

				return item.localName.includes( name ) || item.localName.includes( name.toUpperCase() );
			} ),
			getWarning: () => `include ${ getPackageNameVariants().map( name => `'${ name }'` ).join( ' or ' ) }`
		};

		function getPackageNameVariants() {
			const specificPackages = {
				'ckbox': [ 'CKBox' ],
				'ckfinder': [ 'CKFinder' ],
				'find-and-replace': [ 'Find', 'Replace' ],
				'comments': [ 'Comment', 'Annotation' ],
				'revision-history': [ 'Revision' ],
				'real-time-collaboration': [ 'Rtc' ],
				'track-changes': [ 'TrackChange', 'Suggestion' ],
				'html-support': [ 'HtmlSupport', 'Ghs', 'Html' ],
				'media-embed': [ 'Media' ],
				'paste-from-office': [ 'Office' ],
				'watchdog': [ 'ActionsRecorder', 'Watchdog' ],
				'list-multi-level': [ 'MultiLevelList', 'ListMultiLevel' ]
			};

			const packageName = pkg.packageName.match( /^@ckeditor\/ckeditor5-(.*)$/ )?.[ 1 ];

			return specificPackages[ packageName ] ?? [ getDefaultPackageName() ];

			function getDefaultPackageName() {
				const singularPackageName = packageName.endsWith( 's' ) ?
					packageName.slice( 0, -1 ) :
					packageName;

				const pascalCasePackageName =
					singularPackageName.charAt( 0 ).toUpperCase() +
					singularPackageName.slice( 1 ).replace( /-(.)/g, ( _, char ) => char.toUpperCase() );

				return pascalCasePackageName;
			}
		}
	}
}

function everyNameIsOk() {
	return true;
}

function findDeclaration( exportItem ) {
	// Export should have references set by Module.resolveReferences().
	if ( !exportItem.references || !exportItem.references.length ) {
		return null;
	}

	// Find the first Declaration in references.
	// References can be either Declaration or Import.
	const declaration = exportItem.references.find( ref => ref instanceof Declaration );

	if ( !declaration ) {
		return null;
	}

	return declaration;
}
