/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import CloudServicesCore from '@ckeditor/ckeditor5-cloud-services/src/cloudservicescore.js';
import TokenMock from '@ckeditor/ckeditor5-cloud-services/tests/_utils/tokenmock.js';

// CKBox requires the `CloudServicesCore` plugin as a soft-requirement.
// In order to mock the `Token` class, we create a new class that extend the `CloudServicesCore` plugin
// and override the `#createToken()` method which creates an instance of the `Token` class.
export default class CloudServicesCoreMock extends CloudServicesCore {
	createToken( tokenUrlOrRefreshToken = 'ckbox-token' ) {
		// For testing purposes, we store the URL.
		this.tokenUrl = tokenUrlOrRefreshToken;

		return new TokenMock( tokenUrlOrRefreshToken );
	}
}
