var MagicWorker = (function() {

  var fileFunctions = {};
  
  // Save the original Worker, in case someone replaces it with MagicWorker.
  var originalWorker = window.Worker;

  var inlineWorker = function(workerCode) {
    var blob = new Blob([workerCode], {type: "text/javascript"});
    var workerURL = window.URL.createObjectURL(blob);
    var worker = new originalWorker(workerURL);
    setTimeout(function () { window.URL.revokeObjectURL(workerURL); }, 1000);
    return worker;
  };

  var MagicWorker = function (filename) {
    try {
      return new originalWorker(filename);
    }
    catch (e) {
      // Check for Chrome security exception.
      if (e.code == 18) {
        if (typeof workerCode === "undefined") {
          workerCode = fileFunctions[filename];
          if (typeof workerCode === "undefined") {
            throw "MagicWorker: Filename \"" + filename + "\" is not registered.";
          }
        }
        var src = workerCode.toString();
        src = src.slice(0, src.lastIndexOf("}")).substring(src.indexOf("{") + 1);

        return inlineWorker(src);
      }
      else {
        throw e;
      }
    }
  };

  MagicWorker.register = function(filename, fn) {
    if (typeof fileFunctions[filename] !== "undefined") {
      console.warn("MagicWorker: [WARNING] Multiple files were registered with the file name \"" + filename + "\". Make sure you register each script using its filename.");
    }
    fileFunctions[filename] = fn;
  };

  MagicWorker.prototype = originalWorker.prototype;

  return MagicWorker;
})();

window.Worker = MagicWorker;