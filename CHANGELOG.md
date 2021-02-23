# [2.0.0-next.1](https://github.com/damusix/riot-meiosis/compare/v1.2.0...v2.0.0-next.1) (2021-02-23)


### Features

* 🎸 v2 rewrite ([810dc97](https://github.com/damusix/riot-meiosis/commit/810dc97400c764f36f03f97ea5e9f101f75d5cae)), closes [#6](https://github.com/damusix/riot-meiosis/issues/6)


### BREAKING CHANGES

* 🧨 no more getState, getStream. connect functions no longer. Now requires
instantiation via `new` constructor.

feat: 🎸 2 two clone updates

Bidirectional updates among clones. All tests passing. Added
`goToState(sid: number)`, but needs tests. Add github actions.

# [1.2.0](https://github.com/damusix/riot-meiosis/compare/v1.1.8...v1.2.0) (2021-02-08)


### Features

* version bump ([556c160](https://github.com/damusix/riot-meiosis/commit/556c160083a573b7b519bd63447795e13b6ce7e7))

# [1.2.0](https://github.com/damusix/riot-meiosis/compare/v1.1.8...v1.2.0) (2021-02-08)


### Features

* version bump ([556c160](https://github.com/damusix/riot-meiosis/commit/556c160083a573b7b519bd63447795e13b6ce7e7))

# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [1.1.8](https://github.com/damusix/riot-meiosis/compare/v1.1.7...v1.1.8) (2020-03-11)


### Bug Fixes

* **connect:** fix stream.off error when component unmount ([2cead0c](https://github.com/damusix/riot-meiosis/commit/2cead0c3a30208867ec0f6532863a94226b543d3))

### [1.1.7](https://github.com/damusix/riot-meiosis/compare/v1.1.6...v1.1.7) (2020-03-10)


### Bug Fixes

* **connect:** hoist variables to avoid undefined ([1c16c51](https://github.com/damusix/riot-meiosis/commit/1c16c51d6053054f6b68eabf4a9986473699799c))

### [1.1.6](https://github.com/damusix/riot-meiosis/compare/v1.1.5...v1.1.6) (2020-03-10)


### Bug Fixes

* **connect:** bad if check onBeforeUnmount ([878d67b](https://github.com/damusix/riot-meiosis/commit/878d67b214b8ef7826119db7620c9b51262c9e4f))

### [1.1.5](https://github.com/damusix/riot-meiosis/compare/v1.1.3...v1.1.5) (2020-03-06)


### Bug Fixes

* **connect:** pass component props to mapToState fn ([771904f](https://github.com/damusix/riot-meiosis/commit/771904f19efde1e315f1d2c9f72f3e586644b02a)), closes [#2](https://github.com/damusix/riot-meiosis/issues/2)
* **utils:** stateHasChanges throw when checking constructor of null ([cfa69df](https://github.com/damusix/riot-meiosis/commit/cfa69df165278394c250e03c3a4a8c3788f16f0b))

### 1.1.4 (2020-02-26)


### Bug Fixes

* **connect:** pass component props to mapToState fn ([771904f](https://github.com/damusix/riot-meiosis/commit/771904f19efde1e315f1d2c9f72f3e586644b02a)), closes [#2](https://github.com/damusix/riot-meiosis/issues/2)
