export default ({ getStream, connect }) => {

// Ommitted because of build script
/** import { connect, getStream } from 'riot-meiosis'; */

const urls = {
    js: "https://cdnjs.cloudflare.com/ajax/libs/jsoneditor/9.1.9/jsoneditor.min.js",
    css: "https://cdnjs.cloudflare.com/ajax/libs/jsoneditor/9.1.9/jsoneditor.min.css",
    fontawesome: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.11.2/css/all.min.css"
};

const mkCss = (href) => {

    const link = document.createElement('link');
    link.setAttribute('href', href);
    link.setAttribute('rel', 'stylesheet');

    return link;
};

const debounce = function (func, wait, ref, rmdtState) {

    let timeout;
    let countdown;
    let countdownTimeout;

    const setInnerText = () => {

        if (!rmdtState().editing || !rmdtState().autoSave) {
            ref.innerText = '';
            return;
        }

        if (!countdown) {

            ref.innerText = 'saved!';
            return;
        }
        ref.innerText = `saving in ${countdown}`;
        countdown--;

        countdownTimeout = setTimeout(setInnerText, wait / 5);
    };

    return function () {


        if (ref) {

            countdown = 5;
            clearTimeout(countdownTimeout);
            setInnerText();
        }

        const context = this, args = arguments;
        const later = function() {
            timeout = null;
            func.apply(context, args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};


const mapToState = (app, ownState) => ({ ...ownState, app });

const component = {

    state: {
        isOpen: false,
        editing: false,
        asTree: true,
        autoSave: false,
        editorOpts: {
            mode: 'view',
            mainMenuBar: false
        }
    },

    loadScripts(cb) {

        const script = document.createElement('script');
        script.setAttribute('src', urls.js);

        script.onload = () => cb();

        document.head.appendChild(mkCss(urls.css));
        document.head.appendChild(mkCss(urls.fontawesome));
        document.body.appendChild(script);
    },

    toggleOpen() {

        this.update({ isOpen: !this.state.isOpen });
    },

    toggleAutoSave() {

        this.update({ autoSave: !this.state.autoSave });
    },

    viewMode() {

        this.setMode('view', false);
    },

    toggleMode() {

        if (this.state.asTree) {
            this.textMode();
        }
        else {
            this.treeMode();
        }
    },

    textMode() {

        this.setMode('text', true, false);
    },

    treeMode() {

        this.setMode('tree', true);
    },

    setMode(mode, editing, asTree = true) {

        const { editorOpts } = this.state;
        editorOpts.mode = mode;
        this.update({ editing, editorOpts, asTree });
    },

    onSave() {

        const changes = this.editor.get();
        getStream().push(changes);
    },

    onChange() {

        if (this.state.autoSave) this.onSave();
    },

    onMounted(props, state) {

        this.root.classList.add('closed');

        window.addEventListener('keydown', ({ keyCode }) => {

            if (keyCode === 27) {

                this.update({ isOpen: false });
            }
        });

        const debouncedOnChange = debounce(
            this.onChange.bind(this),
            (props.debounce || 3000) * 1,
            this.$('#savingCountdown'),
            () => this.state
        );

        this.loadScripts(() => {

            this.ref = this.$('#tree');
            this.editor = new JSONEditor(this.ref, {
                ...state.editorOpts,
                onChange: debouncedOnChange
            });

            this.editor.set(state.app);
        });
    },

    onUpdated(_, state) {

        if (this.state.isOpen) {
            this.root.classList.remove('closed');
        }
        else {
            this.root.classList.add('closed');
        }

        if (this.state.editing) {
            this.$('#savingCountdown').style.display = '';
        }
        else {
            this.$('#savingCountdown').style.display = 'none';
        }

        if (!this.editor) {
            return;
        }

        this.editor.update(state.app);
        this.editor.setMode(state.editorOpts.mode);
    }
};

var rmdevtools = {
  'css': `rmdevtools,[is="rmdevtools"]{ display: block; position: fixed; bottom: 0; top: 0; right: 0; width: 400px; height: 100vh; background: rgba(250,250,250, 0.95); box-shadow: 0px 0px 10px rgba(0,0,0,0.2); transition: all 250ms; z-index: 9999; opacity: 0.95; } rmdevtools table,[is="rmdevtools"] table{ margin: 0; } rmdevtools button,[is="rmdevtools"] button{ line-height: 1; } rmdevtools #container,[is="rmdevtools"] #container{ height: 100vh; overflow: auto; padding: 5px; padding-bottom: 35px; } rmdevtools #tree,[is="rmdevtools"] #tree{ height: calc(100% - 60px); } rmdevtools .toggle,[is="rmdevtools"] .toggle{ position: absolute; bottom: 2px; border-radius: 2px; padding: 5px; background: #fff; border: 1px solid #eee; font-size: 16px; color: #6c0; box-shadow: 0px 0px 3px rgba(0,0,0,0.1); transition: all 250ms; } rmdevtools .toggle:hover,[is="rmdevtools"] .toggle:hover{ color: #6a0; box-shadow: 0px 0px 6px rgba(0,0,0,0.2); } rmdevtools .toggle.open,[is="rmdevtools"] .toggle.open{ left: -35px; z-index: 11; } rmdevtools .toggle.mode,[is="rmdevtools"] .toggle.mode{ right: 5px; z-index: 10; } rmdevtools .toggle.save,[is="rmdevtools"] .toggle.save{ right: 71px; z-index: 9; } rmdevtools .toggle.autoSave,[is="rmdevtools"] .toggle.autoSave{ right: 38px; z-index: 9; } rmdevtools .toggle.view,[is="rmdevtools"] .toggle.view{ left: 5px; z-index: 8; } rmdevtools #savingCountdown,[is="rmdevtools"] #savingCountdown{ bottom: 7px; left: 40px; padding: 4px; font-size: 12px; color: #ccc; position: absolute; } rmdevtools.closed,[is="rmdevtools"].closed{ right: -400px; padding: 0; box-shadow: 0px 0px 0px rgba(0,0,0,0.2); } rmdevtools.closed h3,[is="rmdevtools"].closed h3{ font-size: 1rem; position: absolute; top: 0; right: 10px; } @media only screen and (max-width: 768px) { rmdevtools,[is="rmdevtools"]{ width: 280px; } rmdevtools.closed,[is="rmdevtools"].closed{ right: -280px; } }`,

  'exports': connect(mapToState)(
    component
  ),

  'template': function(
    template,
    expressionTypes,
    bindingTypes,
    getComponent
  ) {
    return template(
      '<a expr0="expr0" class="toggle open" title="Toggle state debugger"><i expr1="expr1" class="fa fa-eye-slash fa-fw"></i><i expr2="expr2" class="fa fa-eye fa-fw"></i></a><virtual expr3="expr3"></virtual><a expr11="expr11" class="toggle mode" title="Edit state"></a><span id="savingCountdown"></span><div id="container"><div id="tree"></div></div>',
      [
        {
          'redundantAttribute': 'expr0',
          'selector': '[expr0]',

          'expressions': [
            {
              'type': expressionTypes.EVENT,
              'name': 'onclick',

              'evaluate': function(
                scope
              ) {
                return scope.toggleOpen;
              }
            }
          ]
        },
        {
          'type': bindingTypes.IF,

          'evaluate': function(
            scope
          ) {
            return scope.state.isOpen;
          },

          'redundantAttribute': 'expr1',
          'selector': '[expr1]',

          'template': template(
            null,
            []
          )
        },
        {
          'type': bindingTypes.IF,

          'evaluate': function(
            scope
          ) {
            return !scope.state.isOpen;
          },

          'redundantAttribute': 'expr2',
          'selector': '[expr2]',

          'template': template(
            null,
            []
          )
        },
        {
          'type': bindingTypes.IF,

          'evaluate': function(
            scope
          ) {
            return scope.state.editing;
          },

          'redundantAttribute': 'expr3',
          'selector': '[expr3]',

          'template': template(
            null,
            [
              {
                'type': bindingTypes.TAG,
                'getComponent': getComponent,

                'evaluate': function(
                  scope
                ) {
                  return 'virtual';
                },

                'slots': [
                  {
                    'id': 'default',
                    'html': '<virtual expr4="expr4"></virtual><a expr6="expr6" class="toggle mode" title="Cancel edit"><i class="fa fa-ban fa-fw"></i></a><a expr7="expr7" class="toggle autoSave" title="Toggle Auto Save"><i expr8="expr8"></i></a><a expr9="expr9" class="toggle view"><i expr10="expr10"></i></a>',

                    'bindings': [
                      {
                        'type': bindingTypes.IF,

                        'evaluate': function(
                          scope
                        ) {
                          return !scope.state.autoSave;
                        },

                        'redundantAttribute': 'expr4',
                        'selector': '[expr4]',

                        'template': template(
                          null,
                          [
                            {
                              'type': bindingTypes.TAG,
                              'getComponent': getComponent,

                              'evaluate': function(
                                scope
                              ) {
                                return 'virtual';
                              },

                              'slots': [
                                {
                                  'id': 'default',
                                  'html': '<a expr5="expr5" class="toggle save" title="Save state"><i class="fa fa-save fa-fw"></i></a>',

                                  'bindings': [
                                    {
                                      'redundantAttribute': 'expr5',
                                      'selector': '[expr5]',

                                      'expressions': [
                                        {
                                          'type': expressionTypes.EVENT,
                                          'name': 'onclick',

                                          'evaluate': function(
                                            scope
                                          ) {
                                            return scope.onSave;
                                          }
                                        }
                                      ]
                                    }
                                  ]
                                }
                              ],

                              'attributes': []
                            }
                          ]
                        )
                      },
                      {
                        'redundantAttribute': 'expr6',
                        'selector': '[expr6]',

                        'expressions': [
                          {
                            'type': expressionTypes.EVENT,
                            'name': 'onclick',

                            'evaluate': function(
                              scope
                            ) {
                              return scope.viewMode;
                            }
                          }
                        ]
                      },
                      {
                        'redundantAttribute': 'expr7',
                        'selector': '[expr7]',

                        'expressions': [
                          {
                            'type': expressionTypes.EVENT,
                            'name': 'onclick',

                            'evaluate': function(
                              scope
                            ) {
                              return scope.toggleAutoSave;
                            }
                          }
                        ]
                      },
                      {
                        'redundantAttribute': 'expr8',
                        'selector': '[expr8]',

                        'expressions': [
                          {
                            'type': expressionTypes.ATTRIBUTE,
                            'name': 'class',

                            'evaluate': function(
                              scope
                            ) {
                              return [
                                'fa fa-',
                                scope.state.autoSave ? 'mouse' : 'sync',
                                ' fa-fw'
                              ].join(
                                ''
                              );
                            }
                          }
                        ]
                      },
                      {
                        'redundantAttribute': 'expr9',
                        'selector': '[expr9]',

                        'expressions': [
                          {
                            'type': expressionTypes.EVENT,
                            'name': 'onclick',

                            'evaluate': function(
                              scope
                            ) {
                              return scope.toggleMode;
                            }
                          },
                          {
                            'type': expressionTypes.ATTRIBUTE,
                            'name': 'title',

                            'evaluate': function(
                              scope
                            ) {
                              return scope.state.asTree ? 'Text mode' : 'Tree mode';
                            }
                          }
                        ]
                      },
                      {
                        'redundantAttribute': 'expr10',
                        'selector': '[expr10]',

                        'expressions': [
                          {
                            'type': expressionTypes.ATTRIBUTE,
                            'name': 'class',

                            'evaluate': function(
                              scope
                            ) {
                              return [
                                'fa fa-',
                                scope.state.asTree ? 'code' : 'tree',
                                ' fa-fw'
                              ].join(
                                ''
                              );
                            }
                          }
                        ]
                      }
                    ]
                  }
                ],

                'attributes': []
              }
            ]
          )
        },
        {
          'type': bindingTypes.IF,

          'evaluate': function(
            scope
          ) {
            return !scope.state.editing;
          },

          'redundantAttribute': 'expr11',
          'selector': '[expr11]',

          'template': template(
            '<i class="fa fa-edit fa-fw"></i>',
            [
              {
                'expressions': [
                  {
                    'type': expressionTypes.EVENT,
                    'name': 'onclick',

                    'evaluate': function(
                      scope
                    ) {
                      return scope.treeMode;
                    }
                  }
                ]
              }
            ]
          )
        }
      ]
    );
  },

  'name': 'rmdevtools'
};

return rmdevtools;

}