# [4.0.0](https://github.com/riot-tools/meiosis/compare/v3.0.2...v4.0.0) (2024-03-31)


### Bug Fixes

* typescript falsity, package upgrades ([e25f8f7](https://github.com/riot-tools/meiosis/commit/e25f8f787fc2fdbdcf86730af8bbabc0602f5979)), closes [#32](https://github.com/riot-tools/meiosis/issues/32) [#30](https://github.com/riot-tools/meiosis/issues/30)


### BREAKING CHANGES

* major package upgrades

## [3.0.2](https://github.com/riot-tools/meiosis/compare/v3.0.1...v3.0.2) (2023-04-13)


### Bug Fixes

* 🐛 installable with riot 7 ([53f1bc3](https://github.com/riot-tools/meiosis/commit/53f1bc34c41b93c54574515f52696bce294742d0)), closes [#29](https://github.com/riot-tools/meiosis/issues/29)

## [3.0.1](https://github.com/riot-tools/meiosis/compare/v3.0.0...v3.0.1) (2021-11-03)


### Bug Fixes

* 🐛 wrap connect function to support destructure ([edafcf3](https://github.com/riot-tools/meiosis/commit/edafcf38564d9abcf3e833d77b23fd8fdb3f3015))

# [3.0.0](https://github.com/riot-tools/meiosis/compare/v2.0.5...v3.0.0) (2021-10-28)


### Bug Fixes

* 🐛 typings, upgrade dependencies ([e76c75f](https://github.com/riot-tools/meiosis/commit/e76c75f9fad0bb072e8a9a3ea8412493b6743089))


### BREAKING CHANGES

* 🧨 mapToComponent no longer accepts an object

# [3.0.0-next.1](https://github.com/riot-tools/meiosis/compare/v2.0.5...v3.0.0-next.1) (2021-10-27)


### Bug Fixes

* 🐛 typings, upgrade dependencies ([e76c75f](https://github.com/riot-tools/meiosis/commit/e76c75f9fad0bb072e8a9a3ea8412493b6743089))


### BREAKING CHANGES

* 🧨 mapToComponent no longer accepts an object

## [2.0.5](https://github.com/riot-tools/meiosis/compare/v2.0.4...v2.0.5) (2021-10-22)


### Bug Fixes

* 🐛 state utils dependency ([2ce63ef](https://github.com/riot-tools/meiosis/commit/2ce63ef6febc1f02915062a407708dee427a4268))

## [2.0.4](https://github.com/riot-tools/meiosis/compare/v2.0.3...v2.0.4) (2021-10-15)


### Bug Fixes

* 🐛 bug in the dispatch typings ([6b76af5](https://github.com/riot-tools/meiosis/commit/6b76af52a23621cd98457f410cf23a217c913483))
* state manager generics ([447217b](https://github.com/riot-tools/meiosis/commit/447217bf0c13c0d702f91ba30588542c42de1949))

## [2.0.3](https://github.com/riot-tools/meiosis/compare/v2.0.2...v2.0.3) (2021-10-12)


### Bug Fixes

* 🐛 adding generics to state manager ([60c7807](https://github.com/riot-tools/meiosis/commit/60c7807c30ca51a57a86ed823d8e7a00032af831))

## [2.0.1-next.4](https://github.com/riot-tools/meiosis/compare/v2.0.1-next.3...v2.0.1-next.4) (2021-10-08)


### Bug Fixes

* 🐛 adding generics to state manager ([60c7807](https://github.com/riot-tools/meiosis/commit/60c7807c30ca51a57a86ed823d8e7a00032af831))

## [2.0.1-next.3](https://github.com/riot-tools/meiosis/compare/v2.0.1-next.2...v2.0.1-next.3) (2021-09-30)


### Bug Fixes

* 🐛 lexical this on dispatch ([fee1d49](https://github.com/riot-tools/meiosis/commit/fee1d49567a6a13de06e1bc8abd6388fa38f2c3f))
## [2.0.1-next.2](https://github.com/riot-tools/meiosis/compare/v2.0.1-next.1...v2.0.1-next.2) (2021-09-22)


### Bug Fixes

* 🐛 play nice with typescript ([f1f9e42](https://github.com/riot-tools/meiosis/commit/f1f9e42835f64e8912203ebae6f173844d019c63))

## [2.0.1-next.1](https://github.com/riot-tools/meiosis/compare/v2.0.0...v2.0.1-next.1) (2021-09-15)


### Bug Fixes

* 🐛 rework typings ([d654c54](https://github.com/riot-tools/meiosis/commit/d654c54dbe37c93a4a8f8a855f477b4032e33433))

# [2.0.0](https://github.com/riot-tools/meiosis/compare/v1.2.0...v2.0.0) (2021-08-22)


### Features

* 🎸 v2 rewrite ([e44ddf0](https://github.com/riot-tools/meiosis/commit/e44ddf0bf7db9c7c7d46ac823bf4f9e3d52122b8)), closes [#6](https://github.com/riot-tools/meiosis/issues/6)
* Merge pull request [#14](https://github.com/riot-tools/meiosis/issues/14) from riot-tools/next ([50ba3fe](https://github.com/riot-tools/meiosis/commit/50ba3fefbaf34977008cd74dab3f2f52a39fb939))


### BREAKING CHANGES

* 🧨 no more getState, getStream. connect functions no longer. Now requires
instantiation via `new` constructor.

feat: 🎸 2 two clone updates

Bidirectional updates among clones. All tests passing. Added
`goToState(sid: number)`, but needs tests. Add github actions.
* 🧨 Riot 6 only support with TypeScript

chore: 🤖 example preview with parcel

refactor: 🐛 renames, stable tsconf, readme

Renamed some classes so they are more semantic. Instatiated via class;
no more function. Stable tsconfig and mocha tests using ts.

# [2.0.0-next.7](https://github.com/riot-tools/meiosis/compare/v2.0.0-next.6...v2.0.0-next.7) (2021-08-05)


### Bug Fixes

* 🐛 peer dep ([5915c95](https://github.com/riot-tools/meiosis/commit/5915c958164a70a6ff1a0d45b17c6ece875abdfb))
* 🐛 version, actions ([3b62de4](https://github.com/riot-tools/meiosis/commit/3b62de48d6e91d9a90d845f39514898aab594225))
* gh actions ([cdd93ad](https://github.com/riot-tools/meiosis/commit/cdd93ad2e94468da2d7088da189e794d9e809b52))
* gh actions ([743355a](https://github.com/riot-tools/meiosis/commit/743355a21686d89950344eadd62c15a145dbba09))
* gh actions ([d8460c4](https://github.com/riot-tools/meiosis/commit/d8460c420b594c940b897b1ff93c1a507de2db98))
* gh actions ([fa6dfab](https://github.com/riot-tools/meiosis/commit/fa6dfab2e05ef27fb1432b9f096a4fa86d2f2519))
* gh actions ([2280653](https://github.com/riot-tools/meiosis/commit/22806536f4d80ea82e426a310e73a86d36ba881a))


### Features

* 🎸 riot 6 only ([a7ca9ea](https://github.com/riot-tools/meiosis/commit/a7ca9ea18d90048f868229b412787efec64c477e))


### BREAKING CHANGES

* 🧨 Riot 6 only support with TypeScript

# [2.0.0-next.6](https://github.com/riot-tools/meiosis/compare/v2.0.0-next.5...v2.0.0-next.6) (2021-08-03)


### Bug Fixes

* 🐛 package json ([4163aec](https://github.com/riot-tools/meiosis/commit/4163aec13718ca10c232778aa07d6e2c7c0e144f))

# [2.0.0-next.5](https://github.com/riot-tools/meiosis/compare/v2.0.0-next.4...v2.0.0-next.5) (2021-05-18)


### Bug Fixes

* 🐛 move utils out ([b84666c](https://github.com/riot-tools/meiosis/commit/b84666c0c443af0a433ceaee145e666666a5f87e))

# [2.0.0-next.4](https://github.com/riot-tools/meiosis/compare/v2.0.0-next.3...v2.0.0-next.4) (2021-05-10)


### Bug Fixes

* 🐛 rollup conf ([4632d07](https://github.com/riot-tools/meiosis/commit/4632d0785ff1c0dd91a81b31094b67fdbbbeb533))

# [2.0.0-next.3](https://github.com/riot-tools/meiosis/compare/v2.0.0-next.2...v2.0.0-next.3) (2021-02-23)


### Bug Fixes

* 🐛 update documentation ([be37fe0](https://github.com/riot-tools/meiosis/commit/be37fe09cad2bd510cca97882ac3f46b10ea08a7))

# [2.0.0-next.2](https://github.com/riot-tools/meiosis/compare/v2.0.0-next.1...v2.0.0-next.2) (2021-02-23)


### Features

* 🤖 update package name ([8533bcf](https://github.com/riot-tools/meiosis/commit/8533bcf2e2cd26709fa7bb18a3a24f1bb4d7e8fd))

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
