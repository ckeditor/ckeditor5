---
category: setup
meta-title: Optimizing build size | CKEditor 5 documentation
order: 120
modified_at: 2024-06-19
---

# Optimizing build size

By default, the CKEditor&nbsp;5 packages are well optimized and the vast majority of the code is tree-shakeable, meaning that most of the unused (or "dead") code is removed during the build process. However, there are some additional steps you can take to further optimize the build size, as the default installation methods were designed to be as developer-friendly as possible, not necessarily to produce the smallest possible build.

Note that build size optimization is only possible when using the npm build and module bundler. The CDN build cannot be optimized in this way, as it is intended to include all plugins, features and styles.

## How to optimize the build size

To optimize the build size, you only need to make a few changes to the way you import the editor, styles, and optionally translations, compared to what was shown in the {@link getting-started/quick-start Quick start} guide. You do not need to change anything in the editor configuration or in the way you use the editor.

### Code imports

The first step in the process of optimizing build size is to import only the editor features you need, as adding more `plugins` to the editor configuration will increase build size.

The next step is to change the way you import the editor features. Currently, you are probably importing them from the following packages:

```js
import { /* ... */ } from 'ckeditor5';
import { /* ... */ } from 'ckeditor5-premium-features';
```

These two packages export all the editor features, and most of them are tree-shakeable, but there is some code that may be added to the build even if it is not used. To ensure that the unused code is not imported, you can import the editor features directly from the packages that contain them.

For example, if you are using the `ClassicEditor` with the `Bold`, `Italic` and `Table` features, you can change the imports like this:

```diff
- import { ClassicEditor, Bold, Italic and Table } from 'ckeditor5';

+ import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic/dist/index.js';
+ import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles/dist/index.js';
+ import { Table } from '@ckeditor/ckeditor5-table/dist/index.js';
```

<info-box warning>
	Note the `/dist/index.js` part of the import paths. This is important to ensure that the editor functions are imported from the correct files.
</info-box>

To find the correct package names, see the {@link getting-started/legacy-getting-started/legacy-imports#finding-individual-packages Finding individual packages} guide. Alternatively, if you are using an IDE with TypeScript support, you can use the `Go to Definition` feature to find the package names.

### Styles

Currently, you probably import one or both of the following style sheets, depending on whether or not you use the premium features:

```js
import 'ckeditor5/ckeditor5.css';
import 'ckeditor5-premium-features/ckeditor5-premium-features.css';
```

Such imports are great, because they are very readable and easy to follow. However, these style sheets contain all the styles for all the plugins and features. If you want to reduce the build size, you can import only the core styles and the styles for the plugins that you use.

First, import the core styles. They are all needed for the editor to work properly:

```js
// Import the core styles.
import '@ckeditor/ckeditor5-theme-lark/dist/index.css';
import '@ckeditor/ckeditor5-clipboard/dist/index.css';
import '@ckeditor/ckeditor5-core/dist/index.css';
import '@ckeditor/ckeditor5-engine/dist/index.css';
import '@ckeditor/ckeditor5-enter/dist/index.css';
import '@ckeditor/ckeditor5-paragraph/dist/index.css';
import '@ckeditor/ckeditor5-select-all/dist/index.css';
import '@ckeditor/ckeditor5-typing/dist/index.css';
import '@ckeditor/ckeditor5-ui/dist/index.css';
import '@ckeditor/ckeditor5-undo/dist/index.css';
import '@ckeditor/ckeditor5-upload/dist/index.css';
import '@ckeditor/ckeditor5-utils/dist/index.css';
import '@ckeditor/ckeditor5-watchdog/dist/index.css';
import '@ckeditor/ckeditor5-widget/dist/index.css';
```

Then, import the styles for the plugins that you use. For example, if you use the `Bold`, `Italic` or `Table` features, you can import only the styles for those features:

```js
// Import the styles for the features that you use.
import '@ckeditor/ckeditor5-basic-styles/dist/index.css';
import '@ckeditor/ckeditor5-table/dist/index.css';
// ...
```

When it comes to plugin styles, the rule of thumb is to import the styles from all the individual packages from which you import the editor features. For example, if you import the `Bold` feature from `@ckeditor/ckeditor5-basic-styles/dist/index.js`, you should also import `@ckeditor/ckeditor5-basic-styles/dist/index.css`.

You may notice that some plugin style sheets are empty. This is intentional, as some plugins do not have styles now, but may have them in the future. Adding the imports now will ensure that you do not accidentally miss some styles if that happens. Importing empty stylesheets does not increase the build size.

### Translations

By default, the editor comes with American English translations, so if you use it, you don't need to import any additional translations, thus reducing the size of the build.

However, if you need to support other languages, the {@link getting-started/setup/ui-language Setting the UI language} guide shows how to import additional translations.

For example, if you need to support Polish, you can import the Polish translations like this:

```js
import coreTranslations from 'ckeditor5/translations/pl.js';
import premiumFeaturesTranslations from 'ckeditor5-premium-features/translations/pl.js';
```

However, like with the styles, these files contain translations for all plugins and features. If you want to reduce the build size, you can import only the core translations and the translations for the plugins you use.

First, import the core translations. They are all needed for the editor to work properly:

```js
// Import the core translations.
import clipboardTranslations from '@ckeditor/ckeditor5-clipboard/dist/translations/<LANGUAGE>.js';
import coreTranslations from '@ckeditor/ckeditor5-core/dist/translations/<LANGUAGE>.js';
import enterTranslations from '@ckeditor/ckeditor5-enter/dist/translations/<LANGUAGE>.js';
import selectAllTranslations from '@ckeditor/ckeditor5-select-all/dist/translations/<LANGUAGE>.js';
import uiTranslations from '@ckeditor/ckeditor5-ui/dist/translations/<LANGUAGE>.js';
import undoTranslations from '@ckeditor/ckeditor5-undo/dist/translations/<LANGUAGE>.js';
import uploadTranslations from '@ckeditor/ckeditor5-upload/dist/translations/<LANGUAGE>.js';
import widgetTranslations from '@ckeditor/ckeditor5-widget/dist/translations/<LANGUAGE>.js';
```

Then, import the translations for the plugins that you use. For example, if you use the `Bold`, `Italic` or `Table` features, you can only import the translations for those features:

```js
// Import the translations for the features that you use.
import basicStylesTranslations from '@ckeditor/ckeditor5-basic-styles/dist/translations/<LANGUAGE>.js';
import tableTranslations from '@ckeditor/ckeditor5-table/dist/translations/<LANGUAGE>.js';
```

As with styles, the rule of thumb is to import translations from all the individual packages from which you import the editor features. For example, if you import the `Bold` feature from the `@ckeditor/ckeditor5-basic-styles/dist/index.js` package, you should also import the translations from the `@ckeditor/ckeditor5-basic-styles/translations/<LANGUAGE>.js` file.

Some plugins may not have translations. In such cases, you do not need to import translations for them.
