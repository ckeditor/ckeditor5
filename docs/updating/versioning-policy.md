---
menu-title: Versioning policy
meta-title: Versioning policy | CKEditor 5 Documentation
meta-description: The versioning approach to the CKEditor 5 project.
category: updating
order: 50
---

# Versioning policy

CKEditor&nbsp;5 consists of multiple npm packages (over 80). When releasing them, we use the following rules:

* We use the `MAJOR.MINOR.PATCH` version identifiers.
* All packages are always in the same version.
* A major release of CKEditor&nbsp;5 (that is, of all its packages) is published when at least one of its packages must have a major release.
* A minor version of CKEditor&nbsp;5 (that is, of all its packages) is published when at least one of its packages must have a minor release and none of them require a major release.
* A package must have a major release when it contains a *major breaking change*.
* If none of the packages contain any *major breaking change*, the following rules are used to determine the new version of each package:
	* If a package contains a *minor breaking change*, a `MINOR` version is increased.
	* If a package contains a new feature, a `MINOR` version is increased.
	* If a package contains only bug fixes, unrelated changes (for example, updated translations), documentation or other internal changes, a `PATCH` version is increased.
* To ensure that all packages are in the same version, some releases of certain packages may be empty (no changes).

## Major and minor breaking changes

The ecosystem of CKEditor&nbsp;5 consists of multiple layers. Our approach to breaking changes and their effect depends on which layer is affected.

* **The integration layer.** This is the most commonly used API which is used to integrate and customize existing builds or editors built from source. It also includes their setup (whose features are included and their default configuration).
	* Breaking changes frequency: as rarely as possible. Therefore, changes to this layer are usually done in a backward-compatible way.
	* A breaking change in this layer is understood as a **major breaking change**.
* **The plugin development API layer.** This is the API exposed by packages such as {@link api/engine `@ckeditor/ckeditor5-engine`} or {@link api/core `@ckeditor/ckeditor5-core`}, which is commonly used by plugin developers.
	* Breaking changes frequency: rarely. This layer is still frequently used by developers, therefore, we try to limit breaking changes. However, to avoid increasing the technical debt, from time to time we will introduce breaking changes to one or more packages. We also try to "batch" them to have as many breaking changes done in one release as possible, to reduce the frequency of major releases.
	* A breaking change in this layer is understood as a **major breaking change**.
* **The low-level customizability API layer.** This is the part of package APIs that allows tweaking the behavior of existing features, their UI, etc., and building other features on top of the existing ones or by using their helpers.
	* Breaking changes frequency: frequent. This layer, while exposed by CKEditor&nbsp;5 Framework, is often closely connected to the architecture of a certain feature and may expose some implementation details. We want this layer to be public as it increases the ability to reuse the code, however, we cannot guarantee its stability on the same level as in the two previous layers.
	* A breaking change in this layer is understood as a **minor breaking change**.

## Why not semantic versioning?

Prior to version 15.0.0 each package was versioned independently and followed the [semantic versioning (SemVer)](https://semver.org/). Following SemVer as close as possible was useful as it allowed us to quickly identify what changed in each release of a certain package. However, it led to [problems with building old versions of the editor](https://github.com/ckeditor/ckeditor5/issues/1746).

Therefore, we switched to a more commonly used practice for an ecosystem of packages, which is to treat a single breaking change as a major release of all packages. It automatically fixed the aforementioned problem in all projects that use caret ranges in their `package.json` files. Later on, we decided that it will be even more convenient for integrators if all packages are in the exact same version, which is also not uncommon (for example, [Angular](https://github.com/angular/angular) follows this practice).
