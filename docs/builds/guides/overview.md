---
# Scope:
# * What is it?
# * What are the use cases?
# * What is the difference with CKEditor 5 Framework?
# * What is the difference with CKEditor 4?

title: Overview
category: builds-guides
order: 10
---

CKEditor 5 Builds are comprised of a set of ready to use rich-text editors, so called "builds", with different configurations. Our goal is to provide easy to use solutions that can satisfy a good part of the editing use cases out there.

## Builds

### Classic editor

The classic "boxed" editing interface, with a toolbar at the top:

[ TODO: Classic editor screenshot or sample ]

### Inline editor

The edited content remains a part of the page, with a floating toolbar attached:

[ TODO: Inline editor screenshot ]

## How builds are designed

Each build was designed to satisfy as many use cases as possible. They differ in their UI, UX and features, and are based on the following approach:

* Include the set of features proposed by the {@link TODO Editor Recommendations} project.
* Include features that contribute to creating quality content. In other words, features like fonts, colors and alignment are excluded.
* Provide setups as generic as possible, based on research and community feedback.

### Build customization

Although the default builds try to fit many cases, they may still not be perfect in some integrations. They may have either too many or too few features. They may not have your preferred theme or UI implementation. Customization is required then.

Check {@link TODO Custom builds} for details on how to change the default builds to match your preferences.

## Use cases

Each of the builds fits several different use cases. Just think about any possible use for writing rich-text in applications.

The following are **some** common use cases:

* In content management systems:
	* Forms for writing articles or website content.
	* Inline writing in a front-end-like editing page.
	* In comments.
* In marketing and sales automation applications:
	* Composing e-mail campaigns.
	* Creating templates.
* In forum applications:
	* Creation of topics and their replies.
* In team collaboration applications:
	* Creation of shared documents.
* Other uses:
	* User profile editing pages.
	* Book writing applications.
	* Social messaging and content sharing.
	* Creation of ads in recruitment software.

### When NOT to use CKEditor 5 Builds?

The {@link TODO CKEditor 5 Framework} should be used, instead of builds, in the following cases:

* When you want to create your own text editor and have full control over every aspect of it, from UI to features.
* When the solution proposed by the builds does not fit your specific use case.

In the following cases {@link TODO CKEditor 4} should be used instead:

* When compatibility with old browsers is a requirement.
* If CKEditor 4 contains features that are essential for you, which are not available in CKEditor 5 yet.
* If CKEditor 4 is already in use in you application and you are still not ready to replace it with CKEditor 5.

<!-- TODO 1 -->
