---
title: Link
category: features
---

{@snippet features/build-link-source}

The {@link module:link/link~Link} feature brings support for link editing to the rich-text editor. It allows for inserting hyperlinks into the edited content and offers the UI to create and edit them.

## Demo

You can edit existing links by clicking them and using the balloon. Use the Link toolbar button or press <kbd>Ctrl/⌘</kbd>+<kbd>K</kbd> to create a new link.

{@snippet features/link}

## Typing around links

CKEditor 5 allows for typing both at inner and outer boundaries of links to make the editing easier for the users.

**To type inside a link**, move the caret to its (start or end) boundary. As long as the link remains highlighted (by default: blue), typing and applying formatting will be done within its boundaries:

{@img assets/img/typing-inside.gif 770 The animation showing typing inside the link in CKEditor 5 rich text editor.}

**To type before or after a link**, move the caret to its boundary, then press the Arrow key (<kbd>→</kbd> or <kbd>←</kbd>) once. The link is no longer highlighted and whatever text you type or formatting you apply will not be enclosed by the link:

{@img assets/img/typing-before.gif 770 The animation showing typing before the link in CKEditor 5 rich text editor.}

## Custom link attributes (decorators)

By default, all links created in the editor have the `href="..."` attribute in the {@link builds/guides/integration/basic-api#getting-the-editor-data editor data}. If you want your links to have additional link attributes, {@link module:link/link~LinkConfig#decorators link decorators} provide an easy way to configure and manage them.

There are two types of link decorators you can use:

* [**Automatic**](#adding-attributes-to-links-based-on-predefined-rules-automatic-decorators) &ndash; They match links against pre–defined rules and manage their attributes based on the results.
* [**Manual**](#adding-attributes-to-links-using-the-ui-manual-decorators) &ndash; They allow users to control link attributes individually using the editor UI.

<info-box>
	Link decorators are disabled by default and it takes a proper [configuration](#configuration) to enable them in your rich-text editor.
</info-box>

### Demo

In the editor below, all **external** links get the `target="_blank"` and `rel="noopener noreferrer"` attributes ([automatic decorator](#adding-attributes-to-links-based-on-predefined-rules-automatic-decorators)). Click a link and edit it to see that it is possible to control the `download` attribute of specific links using the switch button in the editing balloon ([manual decorator](#adding-attributes-to-links-using-the-ui-manual-decorators)). Take a look at the editor data below (updated live) to see the additional link attributes.

{@snippet features/linkdecorators}

The following code was used to run the editor. Learn more about the [configuration](#configuration) of the feature.

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		toolbar: {
			items: [
				// ...
				'link'
			],
		},
		link: {
			// Automatically add target="_blank" and rel="noopener noreferrer" to all external links.
			addTargetToExternalLinks: true,

			// Let the users control the "download" attribute of each link.
			decorators: [
				{
					mode: 'manual',
					label: 'Downloadable',
					attributes: {
						download: 'download'
					}
				}
			]
		}
	} )
	.then( ... )
	.catch( ... );
```

### Configuration

Decorators are configured through definitions provided in the {@link module:link/link~LinkConfig#decorators `config.link.decorators`} configuration option.

Each decorator definition must have its own unique name. In case of [manual decorators](#adding-attributes-to-links-using-the-ui-manual-decorators), that name also represents the decorator in the {@link framework/guides/architecture/editing-engine#text-attributes document model}.

<info-box warning>
	Link decorators work independently of one another and no conflict resolution mechanism exists. For example, configuring the `target` attribute using both an automatic and a manual decorator at the same time could end up with quirky results. The same applies if multiple manual or automatic decorators were defined for the same attribute.
</info-box>

#### Adding `target` and `rel` attributes to external links

A very common use case for (automatic) link decorators is adding `target="_blank"` and `rel="noopener noreferrer"` attributes to all external links in the document. A dedicated {@link module:link/link~LinkConfig#addTargetToExternalLinks `config.link.addTargetToExternalLinks`} configuration has been created for that purpose. When this option is set to `true`, all links starting with `http://`, `https://` or `//` are "decorated" with `target` and `rel` attributes.

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// ...
		link: {
			addTargetToExternalLinks: true
		}
	} )
	.then( ... )
	.catch( ... );
```

Internally, this configuration corresponds to an [automatic decorator](#adding-attributes-to-links-based-on-predefined-rules-automatic-decorators) with the following {@link module:link/link~LinkDecoratorAutomaticDefinition definition}:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// ...
		link: {
			decorators: {
				addTargetToExternalLinks: {
					mode: 'automatic',
					callback: url => /^(https?:)?\/\//.test( url ),
					attributes: {
						target: '_blank',
						rel: 'noopener noreferrer'
					}
				}
			}
		}
	} )
	.then( ... )
	.catch( ... );
```

If you want to leave the decision whether a link should open in a new tab to the users, do not use the `config.link.addTargetToExternalLinks` configuration but define a new [manual decorator](#adding-attributes-to-links-using-the-ui-manual-decorators) with the following definition instead:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// ...
		link: {
			decorators: {
				openInNewTab: {
					mode: 'manual',
					label: 'Open in a new tab',
					attributes: {
						target: '_blank',
						rel: 'noopener noreferrer'
					}
				}
			}
		}
	} )
	.then( ... )
	.catch( ... );
```

#### Adding default link protocol to external links

A default link protocol can be useful when the user forgets to type the full URL address to an external source or website. Sometimes copying the text, like for example `ckeditor.com`, and converting it to a link may cause some issues. As a result, the created link will direct you to `yourdomain.com/ckeditor.com` because of the missing protocol. This makes the link relative to the site where it appears.

After you enable the {@link module:link/link~LinkConfig#defaultProtocol `config.link.defaultProtocol`} configuration option, the link feature will be able to handle this issue for you. By default it does not fix the passed link value, but when you set {@link module:link/link~LinkConfig#defaultProtocol `config.link.defaultProtocol`} to, for example, `http://`, the plugin will add the given protocol to every link that may need it (like `ckeditor.com`, `example.com`, etc. where `[protocol://]example.com` is missing).

See a basic configuration example:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// ...
		link: {
			defaultProtocol: 'http://'
		}
	} )
	.then( ... )
	.catch( ... );
```

<info-box>
	With the `config.link.defaultProtocol` option enabled, you are still able to link things locally using `#` or `/`. The protocol will not be added to these links.

	When enabled, this feature also provides the **email address auto-detection** feature. When you submit `hello@example.com` in your content, the plugin will automatically change it to `mailto:hello@example.com`.
</info-box>

#### Adding attributes to links based on pre–defined rules (automatic decorators)

Automatic link decorators match all links in the editor content against a {@link module:link/link~LinkDecoratorAutomaticDefinition function} which decides whether the link should receive some set of attributes, considering the URL (`href`) of the link. These decorators work silently and are being applied during the {@link framework/guides/architecture/editing-engine#conversion data downcast} only.

For instance, to create an automatic decorator that adds the `download="file.pdf"` attribute to all links ending with the `".pdf"` extension, you should add the following {@link module:link/link~LinkDecoratorAutomaticDefinition definition} to {@link module:link/link~LinkConfig#decorators `config.link.decorators`}:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// ...
		link: {
			decorators: {
				detectDownloadable: {
					mode: 'automatic',
					callback: url => url.endsWith( '.pdf' ),
					attributes: {
						download: 'file.pdf'
					}
				}
			}
		}
	} )
	.then( ... )
	.catch( ... );
```

<info-box>
	If you want the `target` and `rel` attributes to be added to all external links in your content, we prepared a [dedicated configuration](#adding-target-and-rel-attributes-to-external-links) exactly for that purpose so you do not have to define the automatic decorator by yourself.
</info-box>

#### Adding attributes to links using the UI (manual decorators)

Manual link decorators are represented in the link editing balloon as switch buttons that the users can use to control the presence of attributes of a particular link (check out the [demo](#demo) to learn more). Each manual decorator {@link module:link/link~LinkDecoratorManualDefinition definition} contains a human–readable label displayed next to the switch button in the link editing balloon. Make sure it is compact and precise for the convenience of the users.

To configure a "Downloadable" switch button in the link editing balloon that adds the `download="file"` attribute to the link when turned on, add the following definition to {@link module:link/link~LinkConfig#decorators `config.link.decorators`}:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// ...
		link: {
			decorators: {
				toggleDownloadable: {
					mode: 'manual',
					label: 'Downloadable',
					attributes: {
						download: 'file'
					}
				},
				openInNewTab: {
					mode: 'manual',
					label: 'Open in a new tab',
					defaultValue: true,			// This option will be selected by default.
					attributes: {
						target: '_blank',
						rel: 'noopener noreferrer'
					}
				}
			}
		}
	} )
	.then( ... )
	.catch( ... );
```

## Autolink feature

You can enable automatic linking of URLs typed or pasted into editor. The `AutoLink` feature will automatically add links to URLs or e-mail addresses.

<info-box>
	Autolink action can be always reverted using undo (<kbd>CTRL</kbd>+<kbd>Z</kbd>).
</info-box>

{@snippet features/autolink}

```js
import AutoLink from '@ckeditor/ckeditor5-link/src/autolink';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Link, AutoLink, ... ]
	} )
	.then( ... )
	.catch( ... );
```

## Installation

<info-box info>
	This feature is enabled by default in all builds. The installation instructions are for developers interested in building their own, custom rich text editor.
</info-box>

To add this feature to your editor, install the [`@ckeditor/ckeditor5-link`](https://www.npmjs.com/package/@ckeditor/ckeditor5-link) package:

```bash
npm install --save @ckeditor/ckeditor5-link
```

Then add the `Link` plugin to your plugin list:

```js
import Link from '@ckeditor/ckeditor5-link/src/link';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Link, ... ],
		toolbar: [ 'link', ... ],
	} )
	.then( ... )
	.catch( ... );
```

## Common API

The {@link module:link/link~Link} plugin registers the UI button component (`'link'`) and the following commands:

* The `'link'` command implemented by {@link module:link/linkcommand~LinkCommand}.
* The `'unlink'` command implemented by {@link module:link/unlinkcommand~UnlinkCommand}.

The commands can be executed using the {@link module:core/editor/editor~Editor#execute `editor.execute()`} method:

```js
// Applies the link to the selected content.
// When the selection is collapsed, it creates new text wrapped in a link.
editor.execute( 'link', 'http://example.com' );

// If there are decorators configured, the command can set their state.
editor.execute( 'link', 'http://example.com', { linkIsExternal: true } );

// Removes the link from the selection (and all decorators if present).
editor.execute( 'unlink' );
```

The package provides a plugin for {@link module:link/linkimage~LinkImage linking images}. See the {@link features/image#linking-images Linking images} section in the {@link features/image feature guide}.

Links are represented in the {@link module:engine/model/model~Model model} using the `linkHref` attribute. [Manual link decorators](#adding-attributes-to-links-using-the-ui-manual-decorators) are represented in the model using text attributes corresponding to their names, as configured in {@link module:link/link~LinkConfig#decorators `config.link.decorators`}.

<info-box>
	We recommend using the official {@link framework/guides/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-link.
