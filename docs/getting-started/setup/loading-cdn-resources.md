---
category: setup
meta-title: Loading CDN resources | CKEditor 5 Documentation
meta-description: Learn how to load CKEditor 5 resources from CDN.
order: 130
modified_at: 2024-11-20
---

# Loading CDN resources

Loading CKEditor&nbsp;5 and its plugins from a CDN requires adding the necessary script and style sheet tags to the `<head>` of your page. In some environments, this can be easily done manually by following the {@link getting-started/integrations-cdn/quick-start CDN for Vanilla JavaScript} guide.

However, other environments may require more work. It is especially true if you want to load some resources conditionally or dynamically or need to wait for the resources to be loaded before using them.

For this reason, we provide the `useCKEditorCloud` and `loadCKEditorCloud` helper functions to make this process easier. These functions will handle adding the necessary script and style sheet tags to your page, ensure that the resources are only loaded once, and provide access to the data exported by them. This way you can load CKEditor&nbsp;5 and its plugins from a CDN without worrying about the technical details.

If you use our {@link getting-started/integrations-cdn/react-default-cdn React} or {@link getting-started/integrations-cdn/vuejs-v3 Vue.js 3+} integrations, see the {@link getting-started/setup/loading-cdn-resources#using-the-useckeditorcloud-function Using the `useCKEditorCloud` function} section. Otherwise, see the {@link getting-started/setup/loading-cdn-resources#using-the-loadckeditorcloud-function Using the `loadCKEditorCloud` function} section.

## Using the `useCKEditorCloud` function

Our {@link getting-started/integrations-cdn/react-default-cdn React} and {@link getting-started/integrations-cdn/vuejs-v3 Vue.js 3+} integrations export a helper function named `useCKEditorCloud` to help you load CDN resources. These helpers are only small wrappers around the `loadCKEditorCloud` function but are designed to better integrate with the specific framework, its lifecycle, and reactivity mechanisms.

Here is an example of how you can use `useCKEditorCloud`:

```js
const cloud = useCKEditorCloud( {
	version: '{@var ckeditor5-version}',
	premium: true
} );
```

This will add the necessary script and style sheet tags to the page's `<head>` and update the internal state to reflect the loading status. Depending on the framework, the `useCKEditorCloud` function may return different values. Please refer to the documentation of the specific integration for more details.

Regardless of the framework used, the `useCKEditorCloud` functions always accept the same options, which are described in the {@link getting-started/setup/loading-cdn-resources#the-loadckeditorcloud-function-options `loadCKEditorCloud` function options} section.

## Using the `loadCKEditorCloud` function

To use the `loadCKEditorCloud` helper, you need to install the following package:

```bash
npm install @ckeditor/ckeditor5-integrations-common
```

Then you can use the `loadCKEditorCloud` function like this:

```js
import { loadCKEditorCloud } from '@ckeditor/ckeditor5-integrations-common';

const { CKEditor, CKEditorPremiumFeatures } = await loadCKEditorCloud( {
	version: '{@var ckeditor5-version}',
	premium: true
} );
```

The `loadCKEditorCloud` function returns a promise that resolves to an object in which each key contains data of the corresponding CDN resources. The exact object shape depends on the options passed to the function.

The options accepted by the `loadCKEditorCloud` function are described in {@link getting-started/setup/loading-cdn-resources#the-loadckeditorcloud-function-options The `loadCKEditorCloud` function options} section.

## The `loadCKEditorCloud` function options

The `loadCKEditorCloud` function (and `useCKEditorCloud` functions which are small wrappers around it) accepts an object with the following properties:

* `version` (required) &ndash; The version of CKEditor&nbsp;5 and premium features (if `premium` option is set to `true`) to load.
* `translations` (optional) &ndash; An array of language codes to load translations for.
* `premium` (optional) &ndash; A Boolean value that indicates whether to load premium plugins. <sup>[1]</sup>
* `ckbox` (optional) &ndash; Configuration for loading CKBox integration. <sup>[1]</sup>
* `plugins` (optional) &ndash; Configuration for loading additional plugins. The object should have the global plugin name as keys and the plugin configuration as values. <sup>[1]</sup>
* `injectedHtmlElementsAttributes` (optional) &ndash; An object with attributes that will be added to the `<script>` and `<link>` tags that are injected into the page. This can be used to add attributes like `integrity` or `crossorigin` to the tags. By default, it is set to `{ crossorigin: 'anonymous' }`.

<info-box info>
[1] Using this option will result in additional network requests for JavaScript and CSS assets. Make sure to only use this option when you need it.
</info-box>

<style>
	sup {
		top: -0.5em;
		position: relative;
		font-size: 75%;
		line-height: 0;
		vertical-align: baseline;
	}
</style>

Here is an example showing all the available options:

```javascript
{
	version: '{@var ckeditor5-version}',
	translations: [ 'es', 'de' ],
	premium: true,
	ckbox: {
		version: '2.5.1',
		theme: 'lark' // Optional, default 'lark'.
	},
	plugins: {
		ThirdPartyPlugin: [
			'https://cdn.example.com/plugin.umd.js',
			'https://cdn.example.com/plugin.css'
		],
		AnotherPlugin: () => import( './path/to/plugin.umd.js' ),
		YetAnotherPlugin: {
			scripts: [ 'https://cdn.example.com/plugin.umd.js' ],
			stylesheets: [ 'https://cdn.example.com/plugin.css' ],

			// Optional, if it's not passed then the name of the plugin will be used.
			checkPluginLoaded: () => window.PLUGIN_NAME
		}
	}
}
```

Note that unless the `checkPluginLoaded` callback is used, the keys in the `plugins` object must match the names of the global object used by the plugins. As shown in the example above, we used the `checkPluginLoaded` to be able to access the plugin using the `YetAnotherPlugin` key, while the plugin itself assigns to the `window.PLUGIN_NAME` property.

With this configuration, the object returned by this function will have the following properties:

* `CKEditor` &ndash; The base CKEditor&nbsp;5 library.
* `CKEditorPremiumFeatures` &ndash; Premium features for CKEditor&nbsp;5. This option is only available when `premium` is set to `true`.
* `CKBox` &ndash; The CKBox integration. This option is only available when the `ckbox` option is provided.
* `ThirdPartyPlugin` &ndash; The custom plugin registered in the `plugins` option.
* `AnotherPlugin` &ndash; The custom plugin registered in the `plugins` option.
* `YetAnotherPlugin` &ndash; The custom plugin registered in the `plugins` option.
