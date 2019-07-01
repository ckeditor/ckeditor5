---
title: Link
category: features
---

{@snippet features/build-link-source}

The {@link module:link/link~Link} feature brings support for link editing to the editor. It allows for inserting hyperlinks into the edited content and offers the UI to create and edit them.

## Demo

You can edit existing links by clicking them and using the balloon. Use the Link toolbar button or press <kbd>Ctrl/⌘</kbd>+<kbd>K</kbd> to create a new link.

{@snippet features/link}

## Typing around links

CKEditor 5 allows for typing both at inner and outer boundaries of links to make the editing easier for the users.

**To type inside a link**, move the caret to its (start or end) boundary. As long as the link remains highlighted (by default: blue), typing and and applying formatting will be done within its boundaries:

{@img assets/img/typing-inside.gif 770 The animation showing typing inside the link in CKEditor 5 rich text editor.}

**To type before or after a link**, move the caret to its boundary, then press the Arrow key (<kbd>→</kbd> or <kbd>←</kbd>) once. The link is no longer highlighted and whatever text you type or formatting you apply will not be enclosed by the link:

{@img assets/img/typing-before.gif 770 The animation showing typing before the link in CKEditor 5 rich text editor.}

## Custom link attributes (decorators)

By default, all links created in the editor have the `href="..."` attribute in the {@link builds/guides/integration/basic-api#getting-the-editor-data editor data}. If you want your links to have additional link attributes, {@link module:link/link~LinkConfig#decorators link decorators} provide an easy way to configure and manage them. There are two types of link decorators you can make use of:

* [**automatic**](#adding-attributes-to-links-based-on-predefined-rules-automatic-decorators) – they match links against pre–defined rules and manage their attributes based on the results,
* [**manual**](#adding-attributes-to-links-using-the-ui-manual-decorators) – they allow users to control link attributes individually using the editor UI.

<info-box>
	Link decorators are disabled by default and it takes a proper [configuration](#configuration) to enable them in your editor. If you do not want to use them in your application, you do not need to do anything.
</info-box>

### Demo

In the editor below, all **external** links get the `target="_blank"` and `rel="noopener noreferrer"` attributes ([automatic decorator](#adding-attributes-to-links-based-on-predefined-rules-automatic-decorators)). Click a link and edit it to see that it is possible to control the `downloadable` attribute of specific links using the switch button in the editing balloon ([manual decorator](#adding-attributes-to-links-using-the-ui-manual-decorators)). Take a look at the editor data below (updated live) to see the additional link attributes.

{@snippet features/linkdecorators}

### Configuration

Decorators are configured via definitions in {@link module:link/link~LinkConfig#decorators `config.link.decorators`}. Each decorator definition must have its own unique name. In case of [manual decorators](#adding-attributes-to-links-using-the-ui-manual-decorators), that name also represents the decorator in the {@link framework/guides/architecture/editing-engine#text-attributes document model}.

<info-box warning>
	Link decorators work independently and no conflict resolution mechanism exists. For example, configuring the `target` attribute using both an automatic and a manual decorator at a time could end up with quirky results. The same applies if multiple manual or automatic decorators were defined for the same attribute.
</info-box>

#### Adding `target` and `rel` attributes to external links

A very common use case for (automatic) link decorators is adding `target="_blank"` and `rel="noopener noreferrer"` attributes to all external links in the document. A dedicated {@link module:link/link~LinkConfig#addTargetToExternalLinks `config.link.addTargetToExternalLinks`} configuration has been created for that purpose. When this option is set `true`, all links staring with `http://`, `https://` or `//` are "decorated" with `target` and `rel` attributes.

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

**Note**: If you want to leave the decision whether a link should open in new tab to the users, do not use the `config.link.addTargetToExternalLinks` configuration but define a new [manual decorator](#adding-attributes-to-links-using-the-ui-manual-decorators) with the proper definition:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// ...
		link: {
			decorators: {
				addTargetToLinks: {
					mode: 'manual',
					label: 'Open link in a new tab',
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

#### Adding attributes to links based on pre–defined rules (automatic decorators)

Automatic link decorators match all links in the editor content against a {@link module:link/link~LinkDecoratorAutomaticDefinition function} which decides whether the link should gain some set of attributes or not, considering the URL (`href`) of the link. These decorators work silently being applied during {@link framework/guides/architecture/editing-engine#conversion data downcast} only.

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
	If you want `target` and `rel` attributes to be added to all external links in your content, we prepared a [dedicated configuration](#adding-target-and-rel-attributes-to-external-links) exactly for that purpose so you do not have to define the automatic decorator by yourself.
</info-box>

#### Adding attributes to links using the UI (manual decorators)

Manual link decorators are represented in the link editing balloon as switch buttons users can use to control the presence of attributes of a particular link (check out the [demo](#demo) to learn more). Each manual decorator {@link module:link/link~LinkDecoratorManualDefinition definition} contains a human–readable label displayed next to the switch button in the link editing balloon. Make sure it is compact and precise for the convenience of the users.

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
				}
			}
		}
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

Links are represented in the {@link module:engine/model/model~Model model} using the `linkHref` attribute. [Manual link decorators](#adding-attributes-to-links-using-the-ui-manual-decorators) are represented in the model using text attributes corresponding to their names as configured in {@link module:link/link~LinkConfig#decorators `config.link.decorators`}.

<info-box>
	We recommend using the official {@link framework/guides/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Contribute

The source code of the feature is available on GitHub in https://github.com/ckeditor/ckeditor5-link.
