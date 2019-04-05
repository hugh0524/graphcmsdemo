/**
 * Created by yinhe on 18/9/11.
 */

exports.sandbox = (sandbox, script) => {
  const vm = require("vm");
  sandbox = sandbox || {};
  script = new vm.Script(script);
  const context = new vm.createContext(sandbox);
  script.runInContext(context, {
    timeout: 3000
  });
  return sandbox;
};
