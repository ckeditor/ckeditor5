/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals XMLHttpRequest */

import uid from '@ckeditor/ckeditor5-utils/src/uid';

// WARNING: The URL below should not be used for any other purpose than Easy Image plugin development.
// Images uploaded using the testing token service may be deleted automatically at any moment.
// If you would like to try the Easy Image service, please wait until the official launch of Easy Image and sign up for a free trial.
// Images uploaded during the free trial will not be deleted for the whole trial period and additionally the trial service can be converted
// into a subscription at any moment, allowing you to preserve all uploaded images.
const CLOUD_SERVICES_TOKEN_URL = 'https://j2sns7jmy0.execute-api.eu-central-1.amazonaws.com/prod/token';

export default function getTokenUrl() {
	const userId = uid();

	return `${ CLOUD_SERVICES_TOKEN_URL }?user.id=${ userId }`;
}
