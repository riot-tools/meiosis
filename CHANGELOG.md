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
