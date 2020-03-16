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
    if(v.successed){
      done();
    } else {
      let suffix = _getSuffix(v.url);
      if(suffix === 'css'){
        v.isCSS = true;
        loadCSS(v.url, (err) => {
          if(err){
            done(err);
            return;
          }
          v.successed = true;
          done();
        });
      } else {
        loadJS(k, (err) => {
          if(err){
            done(err);
            return;
          }
          v.successed = true;
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
      errorCb(error);
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
function loadCSS(path, cb){
   const dom = document.createElement('link');
   dom.rel = 'stylesheet';
   dom.media = 'print';
   dom.href = path;

   dom.onload = function(){
    this.media = 'all';
    cb(null);
   }
   dom.onerror = cb;

   document.head.appendChild(dom);
}

function loadJS(k, cb){
  const v = map[k];
  const dom = document.createElement('script');
  dom.src = v.url;
  dom.dataset['amdkey'] = k;
  dom.onload = function(){
   cb(null);
  }
  dom.onerror = cb;
  document.head.appendChild(dom);
}
let fuckEsModuleKey = '__esModule';
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
  
  
  if(m[fuckEsModuleKey]){
    let keys = Object.keys(m);
    if(keys.length === 1){
      let key = keys[0];
      m = m[key];
    }
  }
  map[k].result = m;
  
}

define.amd = true;

window.define = define;
window.require = amdRequire;
window.require.setMap = function(obj){
  Object.keys(obj).forEach(k => {
    if(!map[k]){
      map[k] = {
        url: obj[k],
        successed: false,
        result: true
      }
    }
  })
}

})();