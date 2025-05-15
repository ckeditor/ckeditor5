/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module core/editor/utils/editorusagedata
 */

import { env, global, uid } from '@ckeditor/ckeditor5-utils';

import type Editor from '../editor.js';
import type { ToolbarConfig, ToolbarConfigItem } from '../editorconfig.js';
import type PluginCollection from '../../plugincollection.js';

/**
 * This part of the code is not executed in open-source implementations using a GPL key.
 * It only runs when a specific license key is provided. If you are uncertain whether
 * this applies to your installation, please contact our support team.
 *
 * @internal
 */
export function getEditorUsageData( editor: Editor ): EditorUsageData {
	return {
		sessionId: getSessionId(),
		pageSessionId: getPageSessionID(),
		hostname: window.location.hostname,
		version: globalThis.CKEDITOR_VERSION,
		type: getEditorType( editor ),
		plugins: getPluginsUsageData( editor.plugins ),
		distribution: getDistributionUsageData(),
		env: getEnvUsageData(),
		integration: Object.create( null ),
		menuBar: {
			isVisible: !!editor.config.get( 'menuBar.isVisible' )
		},
		language: {
			ui: editor.locale.uiLanguage,
			content: editor.locale.contentLanguage
		},
		toolbar: {
			main: getToolbarUsageData( editor.config.get( 'toolbar' ) ),
			block: getToolbarUsageData( editor.config.get( 'blockToolbar' ) ),
			balloon: getToolbarUsageData( editor.config.get( 'balloonToolbar' ) )
		}
	};
}

function getEditorType( editor: Editor ): `${ string }Editor` {
	return Object.getPrototypeOf( editor ).constructor.editorName!;
}

function getPluginsUsageData( collection: PluginCollection<Editor> ): Array<PluginUsageData> {
	return Array
		.from( collection )
		.filter( ( [ PluginConstructor ] ) => !!PluginConstructor.pluginName )
		.map( ( [ PluginConstructor ] ): PluginUsageData => {
			const {
				pluginName,
				isContextPlugin,
				isOfficialPlugin,
				isPremiumPlugin
			} = PluginConstructor;

			return {
				isContext: !!isContextPlugin,
				isOfficial: !!isOfficialPlugin,
				isPremium: !!isPremiumPlugin,
				name: pluginName!
			};
		} );
}

function getToolbarUsageData( toolbarConfig: ToolbarConfig | undefined ): ToolbarUsageData | undefined {
	if ( !toolbarConfig ) {
		return undefined;
	}

	const normalizedToolbar: Exclude<ToolbarConfig, Array<unknown>> =
		Array.isArray( toolbarConfig ) ?
			{ items: toolbarConfig } :
			toolbarConfig;

	const flattenToolbarConfigNames = extractToolbarConfigItemsNames( normalizedToolbar.items || [] );
	const isMultiline = flattenToolbarConfigNames.includes( '-' );

	return {
		isMultiline,
		shouldNotGroupWhenFull: !!normalizedToolbar.shouldNotGroupWhenFull,
		items: stripToolbarSeparatorItems( flattenToolbarConfigNames )
	};

	function stripToolbarSeparatorItems( items: Array<string> ): Array<string> {
		return items.filter( ( item: string ) => item !== '|' && item !== '-' );
	}

	function extractToolbarConfigItemsNames( items: Array<ToolbarConfigItem> ): Array<string> {
		return items.flatMap( item => {
			if ( typeof item === 'string' ) {
				return [ item ];
			}

			return extractToolbarConfigItemsNames( item.items );
		} );
	}
}

function getDistributionUsageData(): DistributionUsageData {
	return {
		channel: ( window[ Symbol.for( 'cke distribution' ) as any ] || 'sh' ) as unknown as string
	};
}

function getEnvUsageData(): EnvUsageData {
	let os: EnvUsageData[ 'os' ] = 'unknown';
	let browser: EnvUsageData[ 'browser' ] = 'unknown';

	if ( env.isMac ) {
		os = 'mac';
	} else if ( env.isWindows ) {
		os = 'windows';
	} else if ( env.isiOS ) {
		os = 'ios';
	} else if ( env.isAndroid ) {
		os = 'android';
	}

	if ( env.isGecko ) {
		browser = 'gecko';
	} else if ( env.isBlink ) {
		browser = 'blink';
	} else if ( env.isSafari ) {
		browser = 'safari';
	}

	return {
		os,
		browser
	};
}

function getSessionId(): string {
	if ( !localStorage.getItem( '__ckeditor-session-id' ) ) {
		localStorage.setItem( '__ckeditor-session-id', uid() );
	}

	return localStorage.getItem( '__ckeditor-session-id' )!;
}

function getPageSessionID() {
	global.window.CKEDITOR_PAGE_SESSION_ID = global.window.CKEDITOR_PAGE_SESSION_ID || uid();

	return global.window.CKEDITOR_PAGE_SESSION_ID;
}

declare global {
	interface Window {
		CKEDITOR_PAGE_SESSION_ID?: string;
	}
}

/**
 * @internal
 */
export type EditorUsageData = {
	sessionId: string;
	pageSessionId: string;
	hostname: string;
	version: string;
	type: `${ string }Editor`;
	plugins: Array<PluginUsageData>;
	toolbar: {
		main?: ToolbarUsageData;
		block?: ToolbarUsageData;
		balloon?: ToolbarUsageData;
	};
	menuBar: {
		isVisible: boolean;
	};
	language: {
		ui: string;
		content: string;
	};
	distribution: {
		channel: string;
	};
	env: EnvUsageData;
	integration: {
		[integrationName: string]: IntegrationUsageData;
	};
};

type IntegrationUsageData = {
	version: string;
	frameworkVersion?: string;
};

type DistributionUsageData = {
	channel: string;
};

type EnvUsageData = {
	os: 'mac' | 'windows' | 'ios' | 'android' | 'unknown';
	browser: 'safari' | 'gecko' | 'blink' | 'unknown';
};

type ToolbarUsageData = {
	items: Array<string>;
	isMultiline: boolean;
	shouldNotGroupWhenFull: boolean;
};

type PluginUsageData = {
	name: string;
	isPremium: boolean;
	isOfficial: boolean;
	isContext: boolean;
};
