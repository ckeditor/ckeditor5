/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import type {
	CloudServices,
	CloudServicesConfig,
	CloudServicesCore
} from './index';

declare module '@ckeditor/ckeditor5-core' {
	interface EditorConfig {

		/**
		 * The configuration of CKEditor Cloud Services. Introduced by the {@link module:cloud-services/cloudservices~CloudServices} plugin.
		 *
		 * Read more in {@link module:cloud-services/cloudservicesconfig~CloudServicesConfig}.
		 */
		cloudServices?: CloudServicesConfig;
	}

	interface PluginsMap {
		[ CloudServices.pluginName ]: CloudServices;
		[ CloudServicesCore.pluginName ]: CloudServicesCore;
	}
}
