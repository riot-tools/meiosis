export default ({ getStream, connect }) => {

// Ommitted because of build script
/** import { connect, getStream } from 'riot-meiosis'; */

const urls = {
    js: "https://cdnjs.cloudflare.com/ajax/libs/jsoneditor/7.0.4/jsoneditor.min.js",
    css: "https://cdnjs.cloudflare.com/ajax/libs/jsoneditor/7.0.4/jsoneditor.min.css",
    fontawesome: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.11.2/css/all.min.css"
};

const mkCss = (href) => {

    const link = document.createElement('link');
    link.setAttribute('href', href);
    link.setAttribute('rel', 'stylesheet');

    return link;
};

const mapToState = (app, ownState) => ({ ...ownState, app });

const component = {

    state: {
        isOpen: false,
        editing: false,
        asTree: true,
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
    viewMode() {
        this.setMode('view', false);
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
    onMounted(_, state) {
        this.root.classList.add('closed');

        this.loadScripts(() => {

            this.ref = this.$('#tree');
            this.editor = new JSONEditor(this.ref, state.editorOpts);

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

        if (!this.editor) {
            return;
        }

        this.editor.update(state.app);
        this.editor.setMode(state.editorOpts.mode);
    }
};

var rmdevtools = {
  'css': `rmdevtools,[is="rmdevtools"]{ display: block; position: fixed; bottom: 0; top: 0; right: 0; width: 400px; height: 100vh; background: rgba(250,250,250, 0.95); box-shadow: 0px 0px 10px rgba(0,0,0,0.2); transition: all 250ms; z-index: 9999; } rmdevtools table,[is="rmdevtools"] table{ margin: 0; } rmdevtools button,[is="rmdevtools"] button{ line-height: 1; } rmdevtools #container,[is="rmdevtools"] #container{ height: 100vh; overflow: auto; padding: 5px; padding-bottom: 35px; } rmdevtools .toggle,[is="rmdevtools"] .toggle{ position: absolute; bottom: 2px; border-radius: 2px; padding: 5px; background: #fff; border: 1px solid #eee; font-size: 16px; color: #6c0; box-shadow: 0px 0px 3px rgba(0,0,0,0.1); transition: all 250ms; } rmdevtools .toggle:hover,[is="rmdevtools"] .toggle:hover{ color: #6a0; box-shadow: 0px 0px 6px rgba(0,0,0,0.2); } rmdevtools .toggle.open,[is="rmdevtools"] .toggle.open{ left: -35px; z-index: 11; } rmdevtools .toggle.mode,[is="rmdevtools"] .toggle.mode{ right: 5px; z-index: 10; } rmdevtools .toggle.save,[is="rmdevtools"] .toggle.save{ right: 38px; z-index: 9; } rmdevtools .toggle.view,[is="rmdevtools"] .toggle.view{ left: 5px; z-index: 8; } rmdevtools.closed,[is="rmdevtools"].closed{ right: -400px; padding: 0; box-shadow: 0px 0px 0px rgba(0,0,0,0.2); } rmdevtools.closed h3,[is="rmdevtools"].closed h3{ font-size: 1rem; position: absolute; top: 0; right: 10px; } @media only screen and (max-width: 768px) { rmdevtools,[is="rmdevtools"]{ width: 280px; } rmdevtools.closed,[is="rmdevtools"].closed{ right: -280px; } }`,
  'exports': connect(mapToState)(component),

  'template': function(template, expressionTypes, bindingTypes, getComponent) {
    return template(
      '<a expr0="expr0" class="toggle open" title="Toggle state debugger"><i expr1="expr1" class="fa fa-eye-slash fa-fw"></i><i expr2="expr2" class="fa fa-eye fa-fw"></i></a><a expr3="expr3" class="toggle mode" title="Edit state"></a><a expr4="expr4" class="toggle mode" title="Cancel edit"></a><a expr5="expr5" class="toggle save" title="Save state"></a><a expr6="expr6" class="toggle view" title="Text mode"></a><a expr7="expr7" class="toggle view" title="Tree mode"></a><div id="container"><div id="tree"></div></div>',
      [{
        'redundantAttribute': 'expr0',
        'selector': '[expr0]',

        'expressions': [{
          'type': expressionTypes.EVENT,
          'name': 'onclick',

          'evaluate': function(scope) {
            return scope.toggleOpen;
          }
        }]
      }, {
        'type': bindingTypes.IF,

        'evaluate': function(scope) {
          return scope.state.isOpen;
        },

        'redundantAttribute': 'expr1',
        'selector': '[expr1]',

        'template': template(null, [{
          'expressions': [{
            'type': expressionTypes.ATTRIBUTE,
            'name': 'class',

            'evaluate': function(scope) {
              return 'fa fa-eye-slash fa-fw';
            }
          }]
        }])
      }, {
        'type': bindingTypes.IF,

        'evaluate': function(scope) {
          return !scope.state.isOpen;
        },

        'redundantAttribute': 'expr2',
        'selector': '[expr2]',

        'template': template(null, [{
          'expressions': [{
            'type': expressionTypes.ATTRIBUTE,
            'name': 'class',

            'evaluate': function(scope) {
              return 'fa fa-eye fa-fw';
            }
          }]
        }])
      }, {
        'type': bindingTypes.IF,

        'evaluate': function(scope) {
          return !scope.state.editing;
        },

        'redundantAttribute': 'expr3',
        'selector': '[expr3]',

        'template': template('<i class="fa fa-edit fa-fw"></i>', [{
          'expressions': [{
            'type': expressionTypes.ATTRIBUTE,
            'name': 'class',

            'evaluate': function(scope) {
              return 'toggle mode';
            }
          }, {
            'type': expressionTypes.EVENT,
            'name': 'onclick',

            'evaluate': function(scope) {
              return scope.treeMode;
            }
          }, {
            'type': expressionTypes.ATTRIBUTE,
            'name': 'title',

            'evaluate': function(scope) {
              return 'Edit state';
            }
          }]
        }])
      }, {
        'type': bindingTypes.IF,

        'evaluate': function(scope) {
          return scope.state.editing;
        },

        'redundantAttribute': 'expr4',
        'selector': '[expr4]',

        'template': template('<i class="fa fa-ban fa-fw"></i>', [{
          'expressions': [{
            'type': expressionTypes.ATTRIBUTE,
            'name': 'class',

            'evaluate': function(scope) {
              return 'toggle mode';
            }
          }, {
            'type': expressionTypes.EVENT,
            'name': 'onclick',

            'evaluate': function(scope) {
              return scope.viewMode;
            }
          }, {
            'type': expressionTypes.ATTRIBUTE,
            'name': 'title',

            'evaluate': function(scope) {
              return 'Cancel edit';
            }
          }]
        }])
      }, {
        'type': bindingTypes.IF,

        'evaluate': function(scope) {
          return scope.state.editing;
        },

        'redundantAttribute': 'expr5',
        'selector': '[expr5]',

        'template': template('<i class="fa fa-save fa-fw"></i>', [{
          'expressions': [{
            'type': expressionTypes.ATTRIBUTE,
            'name': 'class',

            'evaluate': function(scope) {
              return 'toggle save';
            }
          }, {
            'type': expressionTypes.EVENT,
            'name': 'onclick',

            'evaluate': function(scope) {
              return scope.onSave;
            }
          }, {
            'type': expressionTypes.ATTRIBUTE,
            'name': 'title',

            'evaluate': function(scope) {
              return 'Save state';
            }
          }]
        }])
      }, {
        'type': bindingTypes.IF,

        'evaluate': function(scope) {
          return scope.state.editing && scope.state.asTree;
        },

        'redundantAttribute': 'expr6',
        'selector': '[expr6]',

        'template': template('<i class="fa fa-code fa-fw"></i>', [{
          'expressions': [{
            'type': expressionTypes.ATTRIBUTE,
            'name': 'class',

            'evaluate': function(scope) {
              return 'toggle view';
            }
          }, {
            'type': expressionTypes.EVENT,
            'name': 'onclick',

            'evaluate': function(scope) {
              return scope.textMode;
            }
          }, {
            'type': expressionTypes.ATTRIBUTE,
            'name': 'title',

            'evaluate': function(scope) {
              return 'Text mode';
            }
          }]
        }])
      }, {
        'type': bindingTypes.IF,

        'evaluate': function(scope) {
          return scope.state.editing && !scope.state.asTree;
        },

        'redundantAttribute': 'expr7',
        'selector': '[expr7]',

        'template': template('<i class="fa fa-tree fa-fw"></i>', [{
          'expressions': [{
            'type': expressionTypes.ATTRIBUTE,
            'name': 'class',

            'evaluate': function(scope) {
              return 'toggle view';
            }
          }, {
            'type': expressionTypes.EVENT,
            'name': 'onclick',

            'evaluate': function(scope) {
              return scope.treeMode;
            }
          }, {
            'type': expressionTypes.ATTRIBUTE,
            'name': 'title',

            'evaluate': function(scope) {
              return 'Tree mode';
            }
          }]
        }])
      }]
    );
  },

  'name': 'rmdevtools'
};

return rmdevtools;

}