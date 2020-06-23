(function() {
  
const map = Object.create(null);

function _getSuffix(str){
  let i = str.lastIndexOf('.');
  if(i !== -1){
    return str.substr(i + 1);
  }
  return '';
}

function amdRequire(arr, success, errorCb){
  let len = arr.length;
  let count = 0;
  let isDone = false;
  arr.forEach(k => {
    const v = map[k];
    if(v.loaded){
      done();
    } else {
      let suffix = _getSuffix(v.url);
      if(suffix === 'css'){
        v.isCSS = true;
        loadCSS(v,  (err) => {
          if(err){
            v.error = err;
            done(err);
            return;
          }
          done();
        });
      } else {
        loadJS(k, (err) => {
          if(err){
            v.error = err;
            done(err);
            return;
          }
          done();
        })
      }
    }
  });
  function done(error){
    if(isDone){
      return;
    }
    if(error){
      isDone = true;
      if(errorCb){
        errorCb(error);
      } else {
        throw error;
      }
      return;
    }
    count = count + 1;
    if(count === len){
      const result = [];
      arr.forEach(k => {
        result.push(map[k].result);
      })
      success.apply(null, result);
    }
  }

}

// https://www.filamentgroup.com/lab/load-css-simpler/
// <link rel="stylesheet" href="/path/to/my.css" media="print" onload="this.media='all'">
function loadCSS(v, cb){
   const path = v.path;
   let dom = v.dom;
   if(!dom){
     dom = v.dom = document.createElement('link');
     dom.rel = 'stylesheet';
     dom.media = 'print';
     dom.href = path;
   }
   dom.addEventListener('onload', function(){
    if(v.dom){
      delete(v.dom);
      this.media = 'all';
      v.loaded = true;
     }
    cb(null);
   });
   dom.addEventListener('error', function(e){
     if(v.dom){
      delete(v.dom);
      document.head.removeChild(dom);
     }
    cb(e);
   });

   document.head.appendChild(dom);
}

function loadJS(k, cb){
  const v = map[k];
  let dom = v.dom;
  if(!dom){
    dom = v.dom = document.createElement('script');
    dom.src = v.url;
    dom.dataset['amdkey'] = k;
  }

  dom.addEventListener('load', function(){
    if(v.dom){
      delete(v.dom);
      v.loaded = true;
     }
    cb(null);
  });
  dom.addEventListener('error', function(e){
    if(v.dom){
      delete(v.dom);
      document.head.removeChild(dom);
     }
     cb(e);
  });
  document.head.appendChild(dom);
}

function define(arr, cb){
  if(typeof arr === 'function'){
    cb = arr;
  }
  if(typeof cb !== 'function'){
    throw new Error('simple-amd define argument not simple');
  }
  var script = document.currentScript;
  var k = script.dataset['amdkey'];
  let m = cb();
  map[k].result = m;
}

define.amd = true;

function setMap(obj){
  Object.keys(obj).forEach(k => {
    if(!map[k]){
      map[k] = {
        url: obj[k],
        loaded: false,
        result: true
      }
    }
  })
}

function isLoaded(key){
  var obj = map[key];
  if(obj){
    return obj.loaded === true;
  }
  return false;
}

Object.defineProperty(window, 'define', {enumerable: true, value: define, writable: false});
Object.defineProperty(window, 'require', {enumerable: true, value: amdRequire, writable: false});
Object.defineProperty(amdRequire, 'setMap', {enumerable: true, value: setMap, writable: false});
Object.defineProperty(amdRequire, 'isLoaded', {enumerable: true, value: isLoaded, writable: false});
Object.defineProperty(define, 'amd', {enumerable: true, value: true, writable: false});
})();