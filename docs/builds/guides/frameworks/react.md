---
category: builds-integration-frameworks
order: 30
---

# React component

TODO link to npm

## Quick start: Using CKEditor 5 builds

The easiest way to use CKEditor 5 in your React application is by choosing one of the [editor builds](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/overview.html). There are four official builds which you can choose from:

* [CKEditor 5 classic editor build](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic)
* [CKEditor 5 inline editor build](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline)
* [CKEditor 5 balloon editor build](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon)
* [CKEditor 5 document editor build](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document) (read this [note](#note-using-the-document-editor-build))

Install the component and one of the builds:

```bash
npm install --save @ckeditor/ckeditor5-react @ckeditor/ckeditor5-build-classic
```

Use the CKEditor component inside your project:

```jsx
import React, { Component } from 'react';
import CKEditor from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

class App extends Component {
    render() {
        return (
            <div className="App">
                <h2>Using CKEditor 5 build in React</h2>
                <CKEditor
                    editor={ ClassicEditor }
                    data="<p>Hello from CKEditor 5!</p>"
                    onInit={ editor => {
                        // You can store the "editor" and use when it's needed.
                        console.log( 'Editor is ready to use!', editor );
                    } }
                    onChange={ ( event, editor ) => {
                        const data = editor.getData();
                        console.log( { event, editor, data } );
                    } ) }
                />
            </div>
        );
    }
}

export default App;
```

### Component properties

The `<CKEditor>` component supports the following properties:

* `editor` (required) &ndash; The [`Editor`](https://ckeditor.com/docs/ckeditor5/latest/api/module_core_editor_editor-Editor.html) constructor to use.
* `data` &ndash; The initial data for the created editor. See the [`DataApi#setData()`](https://ckeditor.com/docs/ckeditor5/latest/api/module_core_editor_utils_dataapimixin-DataApi.html#function-setData) method.
* `config` &ndash; The editor configuration. See the [Configuration](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/configuration.html) guide.
* `onChange` &ndash; A function called when the editor's data changed. See the [`model.Document#change:data`](https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_model_document-Document.html#event-change:data) event.

	The callback receives two parameters:

	1. an [`EventInfo`](https://ckeditor.com/docs/ckeditor5/latest/api/module_utils_eventinfo-EventInfo.html) object,
	2. an [`Editor`](https://ckeditor.com/docs/ckeditor5/latest/api/module_core_editor_editor-Editor.html) instance.
* `onInit` &ndash; A function called when the editor was initialized. It receives the initialized [`editor`](https://ckeditor.com/docs/ckeditor5/latest/api/module_core_editor_editor-Editor.html) as a parameter.

### Customizing the builds

[CKEditor 5 builds](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/overview.htm) come ready to use, with a set of built-in plugins and a predefined configuration. While you can change the configuration easily by using the `config` property of the `<CKEditor>` component which allows you to change the [toolbar](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/configuration.html#toolbar-setup) or [remove some plugins](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/configuration.html#removing-features), in order to add plugins you need to rebuild the editor.

There are two main ways to do that.

* [Customize one of the existing builds](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/development/custom-builds.html).

	This option does not require any changes in your project's configuration. You will create a new build somewhere next to your project and include it like you included one of the existing builds. Therefore, it is the easiest way to add missing features. Read more about this method in [Installing plugins](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/installing-plugins.html).
* [Integrate the editor from source](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/advanced-setup.html).

	In this approach you will include CKEditor 5 from source &mdash; so you will choose the editor creator you want and the list of plugins, etc. It is more powerful and creates a tighter integration between your application and CKEditor 5, however, it requires adjusting your `webpack.config.js` to CKEditor 5 needs.

	Read more about this option in [Integrating CKEditor 5 from source](#integrating-ckeditor-5-from-source).

### Note: Building for production

If you use `create-react-app` or use a custom configuration for you application but still use `webpack@3`, you will need to adjust the `UglifyJsPlugin` options to make CKEditor 5 compatible with this setup. CKEditor 5 builds use ES6 so the default JavaScript minifier of `webpack@3` and `create-react-app` is not able to digest them.

To do that, you need to first [eject the configuration](https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/template/README.md#npm-run-eject) from the setup created via `create-react-app` (assuming that you use it).

```bash
npm run eject
```

Then, you can customize `UglifyJsPlugin` options in the webpack configuration. Read how to do this [here](#changes-required-in-webpackconfigprodjs).

**Note**: The latest `webpack@4` comes with a version of `UglifyJsPlugin` which supports ES6 out of the box. Also, the React community works on allowing importing ES6 libraries into your applications, so this step will soon be no longer required.

### Note: Using the document editor build

If you use the [Document editor](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/ui/document-editor.html), [you need to add the toolbar to the DOM manually](https://ckeditor.com/docs/ckeditor5/latest/api/module_editor-decoupled_decouplededitor-DecoupledEditor.html#static-function-create):

```jsx
import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';

class App extends Component {
    render() {
        return (
            <div className="App">
                <h2>CKEditor 5 using a custom build - DecoupledEditor</h2>
                <CKEditor
                    onInit={ editor => {
                        console.log( 'Editor is ready to use!', editor );

                        // Insert the toolbar before the editable area.
                        editor.ui.view.editable.element.parentElement.insertBefore(
                            editor.ui.view.toolbar.element,
                            editor.ui.view.editable.element
                        );
                    } }
                    onChange={ ( event, editor ) => console.log( { event, editor } ) }
                    editor={ DecoupledEditor }
                    data="<p>Hello from CKEditor 5's DecoupledEditor!</p>"
                    config={ /* the editor configuration */ }
                />
        );
    }
}

export default App;
```

## Integrating CKEditor 5 from source

Integrating the editor from source allows you to use the full power of the [CKEditor 5 Framework](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/overview.html).

This guide assumes that you are using [Create React App CLI](https://github.com/facebook/create-react-app) as your boilerplate and it goes through adjusting it to fit CKEditor 5's needs. If you use your custom webpack setup, please read more about [including CKEditor 5 from source](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/advanced-setup.html#scenario-2-building-from-source).

Install React CLI:

```bash
npm install -g create-react-app
```

Create your project using the CLI and go to the project's directory:

```bash
create-react-app ckeditor5-react-example && cd ckeditor5-react-example
```

Ejecting configuration is needed for custom webpack configuration to load inline SVG images and CKEditor 5's CSS.
More information about ejecting can be found [here](https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/template/README.md#npm-run-eject).

```bash
npm run eject
```

### Changes required in `webpack.config.prod.js`

```bash
Failed to minify the code from this file:                                              [31/75]
        <project_root>/node_modules/@ckeditor/ckeditor5-build-classic/build/ckeditor.js:5:2077
```

UglifyJS exported by `webpack@3` cannot parse code written in ES6. You need to manually replace it with `uglifyjs-webpack-plugin`. These changes touche the `webpack.config.prod.js` file only.

After ejecting, this file is placed in `<project_root>/config/webpack.config.prod.js`.

1. Install `uglifyjs-webpack-plugin`.

```bash
npm install --save-dev uglifyjs-webpack-plugin
```

2. Load the installed package (at the top of the `webpack.config.prod.js` file).

```js
const UglifyJsWebpackPlugin = require( 'uglifyjs-webpack-plugin' );
```

3. Replace the `webpack.optimize.UglifyJsPlugin` with `UglifyJsWebpackPlugin`

```diff
- new webpack.optimize.UglifyJsPlugin
+ new UglifyJsWebpackPlugin
```

Options: `compress`, `mangle` and `output` are invaild for `UglifyJsWebpackPlugin`. You need to wrap these options as `uglifyOptions`.

The whole plugin definition should look as follows:

```js
// Minify the code.
new UglifyJsWebpackPlugin( {
  uglifyOptions: {
    compress: {
      warnings: false,
      // Disabled because of an issue with Uglify breaking seemingly valid code:
      // https://github.com/facebookincubator/create-react-app/issues/2376
      // Pending further investigation:
      // https://github.com/mishoo/UglifyJS2/issues/2011
      comparisons: false,
    },
    mangle: {
        safari10: true,
    },
    output: {
        comments: false,
        // Turned on because emoji and regex is not minified properly using default
        // https://github.com/facebookincubator/create-react-app/issues/2488
        ascii_only: true,
    },
  },
  sourceMap: shouldUseSourceMap,
} )
```

### Changes required for both webpack configurations (`webpack.config.dev.js` and `webpack.config.prod.js`)

In order to build your application properly, you need to modify your webpack configuration files. After ejecting they are located at:

```bash
<project_root>/config/webpack.config.dev.js
<project_root>/config/webpack.config.prod.js
```

You need to modify the webpack configuration to load CKEditor 5 SVG icons properly.

At the beginning import an object that creates the configuration for PostCSS:

```js
const { styles } = require( '@ckeditor/ckeditor5-dev-utils' );
```

Then add two new elements to the exported object under the `module.rules` array (as new items for the `oneOf` array). These are SVG and CSS loaders only for CKEditor 5 code:

```js
{
  test: /ckeditor5-[^/\\]+[/\\]theme[/\\]icons[/\\][^/\\]+\.svg$/,
  use: [ 'raw-loader' ]
},
{
  test: /ckeditor5-[^/\\]+[/\\]theme[/\\].+\.css/,
  use: [
    {
      loader: 'style-loader',
      options: {
        singleton: true
      }
    },
    {
      loader: 'postcss-loader',
      options: styles.getPostCssConfig( {
        themeImporter: {
          themePath: require.resolve( '@ckeditor/ckeditor5-theme-lark' )
        },
        minify: true
      } )
    }
  ]
},
```

Exclude CSS files used by CKEditor 5 from project's CSS loader:

```js
{
  test: /\.css$/,
  exclude: /ckeditor5-[^/\\]+[/\\]theme[/\\].+\.css/,
  // (...)
}
```

And exclude CKEditor 5 SVG and CSS files from `file-loader` because these files will be handled by the loaders added previously (usually the last item in the `module.rules` array is the `file-loader`) so it looks like this:

```js
{
  loader: require.resolve('file-loader'),
  // Exclude `js` files to keep the "css" loader working as it injects
  // its runtime that would otherwise be processed through the "file" loader.
  // Also exclude `html` and `json` extensions so they get processed
  // by webpack's internal loaders.
  exclude: [
  	/\.(js|jsx|mjs)$/,
  	/\.html$/,
  	/\.json$/,
  	/ckeditor5-[^/\\]+[/\\]theme[/\\]icons[/\\][^/\\]+\.svg$/,
  	/ckeditor5-[^/\\]+[/\\]theme[/\\].+\.css/
  ],
  options: {
    name: 'static/media/[name].[hash:8].[ext]'
  }
}
```

**Remember that the changes above should be done in both configuration files.**

Next, install `raw-loader`, the theme for CKEditor 5 and CKEditor 5 development utilities:

```bash
npm install --save-dev raw-loader @ckeditor/ckeditor5-theme-lark @ckeditor/ckeditor5-dev-utils
```

Install the component, editor and plugins you need:

```bash
npm install --save \
	@ckeditor/ckeditor5-react \
	@ckeditor/ckeditor5-editor-classic \
	@ckeditor/ckeditor5-essentials \
	@ckeditor/ckeditor5-basic-styles \
	@ckeditor/ckeditor5-heading \
	@ckeditor/ckeditor5-paragraph
```

### Use the CKEditor component together with [CKEditor 5 Framework](https://ckeditor.com/docs/ckeditor5/latest/framework/):

```jsx
import React, { Component } from 'react';
import CKEditor from '@ckeditor/ckeditor5-react';

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';

class App extends Component {
    render() {
        return (
            <div className="App">
                <h2>Using CKEditor 5 Framework in React</h2>
                <CKEditor
                    onInit={ editor => console.log( 'Editor is ready to use!', editor ) }
                    onChange={ ( event, editor ) => console.log( { event, editor } ) }
                    config={ {
                        plugins: [ Essentials, Paragraph, Bold, Italic, Heading ],
                        toolbar: [ 'heading', '|', 'bold', 'italic', '|', 'undo', 'redo', ]
                    } }
                    editor={ ClassicEditor }
                    data="<p>Hello from CKEditor 5!</p>"
                />
            </div>
        );
    }
}

export default App;
```

## Contributing and reporting issues

The source code of this component is available on GitHub in https://github.com/ckeditor/ckeditor5-react.
