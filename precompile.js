// Code goes here

(function (){
  var compile = window.compile = {
    Error:{
      NotAFunction:0x01
    },
    Statement:{
      define:Statement,
      literal:function (expr) {
        if (typeof expr == 'string') {
          if (expr.indexOf("'")>0) {
            if (expr.indexOf('"')>0) {
              expr = expr.replace(/"/g, "\"");
            }
            return '"'+expr+'"';
          }
          else return "'"+expr+"'";
        }
        return String(expr);
      }
    },
    Function:{
      Arguments:{
        define:Arguments
      },
      define:Function,
      invoke:invoke
    }
  };
  function Arguments () {
    if (!(this instanceof Arguments)) return new Arguments(arguments);
    if (arguments[0] instanceof Arguments) this.arguments = arguments[0].arguments;
    if (typeof arguments[0] == 'undefined') this.arguments = [];
    if (typeof arguments[0] == 'object' && arguments[0].length >= 0) arguments = arguments[0];
    this.arguments = arguments;
    this.precompiled = '';
    for (var a = 0; a < arguments.length; a ++) {
      this.precompiled += (a?',':'')+arguments[a];
    }
  };
  function Statement(){
    if (!(this instanceof Statement)) return new Statement(arguments);
    if (typeof arguments[0] == 'object' && arguments[0].length >= 0) arguments = arguments[0];
    this.statements = arguments;
    this.precompiled = '';
    for (var a = 0; arguments.length > a; a ++) {
      this.precompiled += (a?',':'')+arguments[a];
    }
    this.chain = function chain (Stat) {
      if (Stat instanceof Statement)
      return new Statement(this.precompiled+'.'+Stat.precompiled);
      else return this;
    };
  };
  function Function (name, args, body) {
    if (typeof name == 'object' && name instanceof Function) {
      args = this.args = name.args;
      body = this.body = name.body;
      name = name.name || undefined;
    }
    if (!(this instanceof Function)) return new Function(name, args, body);
    if (name) this.name = name;
    if (!args || !(args instanceof Arguments))  {
      args = new Arguments(args);
    }
    if (!body || !body.length || !(body[0] instanceof Statement))  {
      body = this.body =  [new Statement(body)];
    }
    else if (typeof body[0] == 'string') {
      this.body = body;
      for (var s = 0; body.length > s; s ++) {
        body.push(new Statement(body[s]));
      }
    }
    this.precompiled = 'function'+
      (name?(' '+name):'')+
      '('+args.precompiled+'){';
    for (var statement = 0; statement < body.length; statement ++) {
      this.precompiled += closeStatement(body[statement]).precompiled;
    }
    this.precompiled += '}';
    this.invoke = function invoke ()  {
      var precompiled = '('+this.precompiled+')(';
      for (var a = 0; arguments.length > a; a ++) {
        precompiled += (a?',':'')+compile.Statement.literal(arguments[a]);
      }
      return new Statement(precompiled + ')');
    }
  };
  function closeStatement (Stat) {
    if (Stat instanceof Statement || Stat instanceof Function) {
      if (Stat.precompiled.charAt(Stat.precompiled.length-1) != ';') {
        Stat.precompiled += ';';
      }
    }
    return Stat;
  }
  function invoke (Func)  {
    if (!(Func instanceof Function)) throw compile.Error.NotAFunction;
    var precompiled = '(';
    for (var a = 1; arguments.length > a; a ++) {
      precompiled += (a?',':'')+compile.Statement.literal(arguments[a]);
    }
    return new Statement(Func.precompiled + '('+precompiled + ')');
  };
})();
