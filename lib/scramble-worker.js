(function(f) {if (typeof MagicWorker !== "undefined") {
    MagicWorker.register("lib/scramble-worker.js", f);
} else {f()}})(function() {


this.addEventListener("message", function(e)
{
  switch (e.data.command) {
    case "getRandomScramble":
      this.postMessage({
        commandId: e.data.commandId,
        scramble: {
          eventName: e.data.eventName,
          scrambleString: scramblers[e.data.eventName].getRandomScramble().scramble_string
        }
      });
      break;
    default:
      throw new Error("Unknown command:", e.data.command);
  }
}, false);


/******** randomInt ********/


/*
 * randomInt.below(max) returns a random non-negative integer less than max (0 <= output < max).
 * `max` must be at most 2^53.
 */
var randomInt = (function() {
  var MAX_JS_PRECISE_INT = 9007199254740992;
  var allowMathRandomFallback_ = false;
  var random53BitValue_;

  function enableInsecureMathRandomFallback() {
    if (!cryptoObject_) {
      var warningString = "WARNING: randomInt is falling back to Math.random for random number generation."
      console.warn ? console.warn(warningString) : console.log(warningString);
      allowMathRandomFallback_ = true;
    }
  }

  var cryptoObject_;
       if (typeof this.crypto   !== "undefined") { cryptoObject_ = this.crypto;   }
  else if (typeof this.msCrypto !== "undefined") { cryptoObject_ = this.msCrypto; }
  else                                           { cryptoObject_ = null;          }

  var UPPER_HALF_MULTIPLIER = 2097152; // 2^21. We have to use multiplication because bit shifts truncate to 32 bits.
  var LOWER_HALF_DIVIDER = 2048;
  if (cryptoObject_) {
    random53BitValue_ = function() {
      // Construct a random 53-bit value from a 32-bit upper half and a 21-bit lower half.
      var array = new Uint32Array(2);
      cryptoObject_.getRandomValues(array);
      var upper = array[0];
      var lower = array[1];
      return Math.floor(upper * UPPER_HALF_MULTIPLIER) + Math.floor(lower / LOWER_HALF_DIVIDER);
    }
  } else {
    var warningString = "ERROR: randomInt could not find a suitable crypto.getRandomValues() function."
    console.error ? console.error(warningString) : console.log(warningString);
    random53BitValue_ = function() {
      if (allowMathRandomFallback_) {
        var TWO_TO_THE_32 = 4294967296; // We're assuming Math.random() has 32 bits of entropy on all platforms.
        var upper = Math.floor(Math.random() * TWO_TO_THE_32);
        var lower = Math.floor(Math.random() * TWO_TO_THE_32);
        return Math.floor(upper * UPPER_HALF_MULTIPLIER) + Math.floor(lower / LOWER_HALF_DIVIDER);
      } else {
        throw new Error("randomInt cannot get random values.");
      }
    }
  }

  function validateMax_(max) {
    if (typeof max !== "number" || max < 0 || Math.floor(max) !== max) {
      throw new Error("randomInt.below() not called with a positive integer value.");
    }
    if (max > MAX_JS_PRECISE_INT) {
      throw new Error("Called randomInt.below() with max == " + max + ", which is larger than Javascript can handle with integer precision.")
    };
  };

  function below(max) {
    validateMax_(max);

    var val = random53BitValue_();
    var maxUniformSamplingRange = Math.floor(MAX_JS_PRECISE_INT / max) * max;

    // Rejection sampling:
    if (val < maxUniformSamplingRange)
    {
      return val % max;
    }
    else {
      // val % max would produce a biased result. This bias an be very bad if `max` is on the order of MAX_JS_PRECISE_INT. We have to try again, so just call ourselves recursively.
      // For some values of `max` just above 9007199254740992 / 2, this happens about once on average. For other values of `max`, it's less than that (and for small values of `max` it's extremely unlikely).
      return below(max);
    }
  };

  return {
    below: below,
    enableInsecureMathRandomFallback: enableInsecureMathRandomFallback
  };
}.bind(this))();


/******** JSSS source below ********/


/*

scramble_222.js

2x2x2 Solver / Scramble Generator in Javascript.

Code taken from the official WCA scrambler.
Ported by Lucas Garron, November 23, 2011.

 */

"use strict";
if (typeof scramblers === "undefined") {
  var scramblers = {};
  scramblers.lib = {
    // https://github.com/lgarron/randomInt.js
    randomInt: randomInt
  }
}

scramblers["222"] = (function() {

  var posit = new Array ();
  function initbrd(){
    posit = new Array (
                  1,1,1,1,
                  2,2,2,2,
                  5,5,5,5,
                  4,4,4,4,
                  3,3,3,3,
                  0,0,0,0);
  }
  initbrd();
  var seq = new Array();
  function solved(){
      for (var i=0;i<24; i+=4){
          c=posit[i];
          for(var j=1;j<4;j++)
              if(posit[i+j]!=c) return(false);
      }
      return(true);
  }

  // ----[ This function is replaced by mix2() ]------
  /*
  function mix(){
      initbrd();
      for(var i=0;i<500;i++){
          var f=Math.floor(scramblers.lib.randomInt.below(3)+3) + 16*Math.floor(randomSource.random()*3);
          domove(f);
      }
  }
  */

  // Alternative mixing function, based on generating a random-state (by Conrad Rider)
  function mix2(){
    // Fixed cubie
    var fixed = 6;
    // Generate random permutation
    var perm_src = [0, 1, 2, 3, 4, 5, 6, 7];
    var perm_sel = Array(); 
    for(var i = 0; i < 7; i++){
      var ch = scramblers.lib.randomInt.below(7 - i);
      ch = perm_src[ch] === fixed ? (ch + 1) % (8 - i) : ch;
      perm_sel[i >= fixed ? i + 1 : i] = perm_src[ch];
      perm_src[ch] = perm_src[7 - i];
    }
    perm_sel[fixed] = fixed;
    // Generate random orientation
    var total = 0;
    var ori_sel = Array();
    var i = fixed === 0 ? 1 : 0;
    for(; i < 7; i = i === fixed - 1 ? i + 2 : i + 1){
      ori_sel[i] = scramblers.lib.randomInt.below(3);
      total += ori_sel[i];
    }
    if(i <= 7) ori_sel[i] = (3 - (total % 3)) % 3;
    ori_sel[fixed] = 0;

    // Convert to face format
    // Mapping from permutation/orientation to facelet
    var D = 1, L = 2, B = 5, U = 4, R = 3, F = 0;
    // D 0 1 2 3  L 4 5 6 7  B 8 9 10 11  U 12 13 14 15  R 16 17 18 19  F 20 21 22 23
    // Map from permutation/orientation to face
    var fmap = [[ U,  R,  F],[ U,  B,  R],[ U,  L,  B],[ U,  F,  L],[ D,  F,  R],[D,  R,  B],[ D,  B,  L],[ D,  L,  F]];
    // Map from permutation/orientation to facelet identifier
    var pos  = [[15, 16, 21],[13,  9, 17],[12,  5,  8],[14, 20,  4],[ 3, 23, 18],[1, 19, 11],[ 0, 10,  7],[ 2,  6, 22]];
    // Convert cubie representation into facelet representaion
    for(var i = 0; i < 8; i++){
      for(var j = 0; j < 3; j++)
        posit[pos[i][(ori_sel[i] + j) % 3]] = fmap[perm_sel[i]][j];
    }
  }
  // ----- [End of alternative mixing function]--------------

  var piece=new Array(15,16,16,21,21,15,  13,9,9,17,17,13,  14,20,20,4,4,14,  12,5,5,8,8,12,
                          3,23,23,18,18,3,   1,19,19,11,11,1,  2,6,6,22,22,2,    0,10,10,7,7,0);
  var adj=new Array();
  adj[0]=new Array();
  adj[1]=new Array();
  adj[2]=new Array();
  adj[3]=new Array();
  adj[4]=new Array();
  adj[5]=new Array();
  var opp=new Array();
  var auto;
  var tot;
  function calcadj(){
      //count all adjacent pairs (clockwise around corners)
      var a,b;
      for(a=0;a<6;a++)for(b=0;b<6;b++) adj[a][b]=0;
      for(a=0;a<48;a+=2){
          if(posit[piece[a]]<=5 && posit[piece[a+1]]<=5 )
              adj[posit[piece[a]]][posit[piece[a+1]]]++;
      }
  }
  function calctot(){
      //count how many of each colour
      tot=new Array(0,0,0,0,0,0,0);
      for(var e=0;e<24;e++) tot[posit[e]]++;
  }
  var mov2fc=new Array()
  mov2fc[0]=new Array(0, 2, 3, 1, 23,19,10,6 ,22,18,11,7 ); //D
  mov2fc[1]=new Array(4, 6, 7, 5, 12,20,2, 10,14,22,0, 8 ); //L
  mov2fc[2]=new Array(8, 10,11,9, 12,7, 1, 17,13,5, 0, 19); //B
  mov2fc[3]=new Array(12,13,15,14,8, 17,21,4, 9, 16,20,5 ); //U
  mov2fc[4]=new Array(16,17,19,18,15,9, 1, 23,13,11,3, 21); //R
  mov2fc[5]=new Array(20,21,23,22,14,16,3, 6, 15,18,2, 4 ); //F
  function domove(y){
      var q=1+(y>>4);
      var f=y&15;
      while(q){
          for(var i=0;i<mov2fc[f].length;i+=4){
              var c=posit[mov2fc[f][i]];
              posit[mov2fc[f][i]]=posit[mov2fc[f][i+3]];
              posit[mov2fc[f][i+3]]=posit[mov2fc[f][i+2]];
              posit[mov2fc[f][i+2]]=posit[mov2fc[f][i+1]];
              posit[mov2fc[f][i+1]]=c;
          }
          q--;
      }
  }
  var sol=new Array();
  function solve(){
      calcadj();
      var opp=new Array();
      for(a=0;a<6;a++){
          for(b=0;b<6;b++){
              if(a!=b && adj[a][b]+adj[b][a]===0) { opp[a]=b; opp[b]=a; }
          }
      }
      //Each piece is determined by which of each pair of opposite colours it uses.
      var ps=new Array();
      var tws=new Array();
      var a=0;
      for(var d=0; d<7; d++){
          var p=0;
          for(b=a;b<a+6;b+=2){
              if(posit[piece[b]]===posit[piece[42]]) p+=4;
              if(posit[piece[b]]===posit[piece[44]]) p+=1;
              if(posit[piece[b]]===posit[piece[46]]) p+=2;
          }
          ps[d]=p;
          if(posit[piece[a]]===posit[piece[42]] || posit[piece[a]]===opp[posit[piece[42]]]) tws[d]=0;
          else if(posit[piece[a+2]]===posit[piece[42]] || posit[piece[a+2]]===opp[posit[piece[42]]]) tws[d]=1;
          else tws[d]=2;
          a+=6;
      }
      //convert position to numbers
      var q=0;
      for(var a=0;a<7;a++){
          var b=0;
          for(var c=0;c<7;c++){
              if(ps[c]===a)break;
              if(ps[c]>a)b++;
          }
          q=q*(7-a)+b;
      }
      var t=0;
      for(var a=5;a>=0;a--){
          t=t*3+tws[a]-3*Math.floor(tws[a]/3);
      }
      if(q!=0 || t!=0){
          sol.length=0;
          for(var l=seqlen;l<100;l++){
              if(search(0,q,t,l,-1)) break;
          }
          t="";
          for(q=0;q<sol.length;q++){
              t = "URF".charAt(sol[q]/10)+"\'2 ".charAt(sol[q]%10) + " " + t;
          }
          return t;
      }
  }
  function search(d,q,t,l,lm){
      //searches for solution, from position q|t, in l moves exactly. last move was lm, current depth=d
      if(l===0){
          if(q===0 && t===0){
              return(true);
          }
      }else{
          if(perm[q]>l || twst[t]>l) return(false);
          var p,s,a,m;
          for(m=0;m<3;m++){
              if(m!=lm){
                  p=q; s=t;
                  for(a=0;a<3;a++){
                      p=permmv[p][m];
                      s=twstmv[s][m];
                      sol[d]=10*m+a;
                      if(search(d+1,p,s,l-1,m)) return(true);
                  }
              }
          }
      }
      return(false);
  }
  var perm=new Array();
  var twst=new Array();
  var permmv=new Array()
  var twstmv=new Array();
  function calcperm(){
      //calculate solving arrays
      //first permutation
   
      for(var p=0;p<5040;p++){
          perm[p]=-1;
          permmv[p]=new Array();
          for(var m=0;m<3;m++){
              permmv[p][m]=getprmmv(p,m);
          }
      }
   
      perm[0]=0;
      for(var l=0;l<=6;l++){
          var n=0;
          for(var p=0;p<5040;p++){
              if(perm[p]===l){
                  for(var m=0;m<3;m++){
                      var q=p;
                      for(var c=0;c<3;c++){
                          var q=permmv[q][m];
                          if(perm[q]===-1) { perm[q]=l+1; n++; }
                      }
                  }
              }
          }
      }
   
      //then twist
      for(var p=0;p<729;p++){
          twst[p]=-1;
          twstmv[p]=new Array();
          for(var m=0;m<3;m++){
              twstmv[p][m]=gettwsmv(p,m);
          }
      }
   
      twst[0]=0;
      for(var l=0;l<=5;l++){
          var n=0;
          for(var p=0;p<729;p++){
              if(twst[p]===l){
                  for(var m=0;m<3;m++){
                      var q=p;
                      for(var c=0;c<3;c++){
                          var q=twstmv[q][m];
                          if(twst[q]===-1) { twst[q]=l+1; n++; }
                      }
                  }
              }
          }
      }
      //remove wait sign
  }
  function getprmmv(p,m){
      //given position p<5040 and move m<3, return new position number
      var a,b,c,q;
      //convert number into array;
      var ps=new Array()
      q=p;
      for(a=1;a<=7;a++){
          b=q%a;
          q=(q-b)/a;
          for(c=a-1;c>=b;c--) ps[c+1]=ps[c];
          ps[b]=7-a;
      }
      //perform move on array
      if(m===0){
          //U
          c=ps[0];ps[0]=ps[1];ps[1]=ps[3];ps[3]=ps[2];ps[2]=c;
      }else if(m===1){
          //R
          c=ps[0];ps[0]=ps[4];ps[4]=ps[5];ps[5]=ps[1];ps[1]=c;
      }else if(m===2){
          //F
          c=ps[0];ps[0]=ps[2];ps[2]=ps[6];ps[6]=ps[4];ps[4]=c;
      }
      //convert array back to number
      q=0;
      for(a=0;a<7;a++){
          b=0;
          for(c=0;c<7;c++){
              if(ps[c]===a)break;
              if(ps[c]>a)b++;
          }
          q=q*(7-a)+b;
      }
      return(q)
  }
  function gettwsmv(p,m){
      //given orientation p<729 and move m<3, return new orientation number
      var a,b,c,d,q;
      //convert number into array;
      var ps=new Array()
      q=p;
      d=0;
      for(a=0;a<=5;a++){
          c=Math.floor(q/3);
          b=q-3*c;
          q=c;
          ps[a]=b;
          d-=b;if(d<0)d+=3;
      }
      ps[6]=d;
      //perform move on array
      if(m===0){
          //U
          c=ps[0];ps[0]=ps[1];ps[1]=ps[3];ps[3]=ps[2];ps[2]=c;
      }else if(m===1){
          //R
          c=ps[0];ps[0]=ps[4];ps[4]=ps[5];ps[5]=ps[1];ps[1]=c;
          ps[0]+=2; ps[1]++; ps[5]+=2; ps[4]++;
      }else if(m===2){
          //F
          c=ps[0];ps[0]=ps[2];ps[2]=ps[6];ps[6]=ps[4];ps[4]=c;
          ps[2]+=2; ps[0]++; ps[4]+=2; ps[6]++;
      }
      //convert array back to number
      q=0;
      for(a=5;a>=0;a--){
          q=q*3+(ps[a]%3);
      }
      return(q);
  }

  // Default settings
  var size=2;
  var seqlen=0;
  var numcub=5;
  var mult=false;
  var cubeorient=false;
  var colorString = "yobwrg";  //In dlburf order. May use any colours in colorList below
   
  // list of available colours
  var colorList=new Array(
         'y', "yellow.jpg", "yellow",
         'b', "blue.jpg",   "blue",
         'r', "red.jpg",    "red",
         'w', "white.jpg",  "white",
         'g', "green.jpg",  "green",
         'o', "orange.jpg", "orange",
         'p', "purple.jpg", "purple",
         '0', "grey.jpg",   "grey"      // used for unrecognised letters, or when zero used.
  );

  var colors=new Array(); //stores colours used
  var seq=new Array();  // move sequences
  var posit = new Array();  // facelet array
  var flat2posit; //lookup table for drawing cube
  var colorPerm = new Array(); //dlburf face colour permutation for each cube orientation
  colorPerm[0] = new Array(5,0,1,4,3,2);

  // get all the form settings from the url parameters
  function parse() {

    /*
    var s="";
    var urlquery=location.href.split("?")
    if(urlquery.length>1){
      var urlterms=urlquery[1].split("&")
      for( var i=0; i<urlterms.length; i++){
        var urllr=urlterms[i].split("=");
        if(urllr[0]==="len") {
          if(urllr[1]-0 >= 1 ) seqlen=urllr[1]-0;
        } else if(urllr[0]==="num"){
          if(urllr[1]-0 >= 1 ) numcub=urllr[1]-0;
        } else if(urllr[0]==="col") {
          if(urllr[1].length===6) colorString = urllr[1];
        }
      }
    }
    */
   
    // expand colour string into 6 actual html color names
    for(var k=0; k<6; k++){
      colors[k]=colorList.length-3; // gray
      for( var i=0; i<colorList.length; i+=3 ){
        if( colorString.charAt(k)===colorList[i] ){
          colors[k]=i;
          break;
        }
      }
    }
  }
   
  // append set of moves along an axis to current sequence in order
  function appendmoves( sq, axsl, tl, la ){
    for( var sl=0; sl<tl; sl++){  // for each move type
      if( axsl[sl] ){       // if it occurs
        var q=axsl[sl]-1;
   
        // get semi-axis of this move
        var sa = la;
        var m = sl;
        if(sl+sl+1>=tl){ // if on rear half of this axis
          sa+=3; // get semi-axis (i.e. face of the move)
          m=tl-1-m; // slice number counting from that face
          q=2-q; // opposite direction when looking at that face
        }
        // store move
        sq[sq.length]=(m*6+sa)*4+q;
      }
    }
  }

  var initialized = false;
   
  // generate sequence of scambles
  function initialize(){

    if (!initialized) {
      var i, j;
      // build lookup table
      flat2posit=new Array(12*size*size);
      for(i=0; i<flat2posit.length; i++) flat2posit[i]=-1;
      for(i=0; i<size; i++){
        for(j=0; j<size; j++){
          flat2posit[4*size*(3*size-i-1)+  size+j  ]=        i *size+j; //D
          flat2posit[4*size*(  size+i  )+  size-j-1]=(  size+i)*size+j; //L
          flat2posit[4*size*(  size+i  )+4*size-j-1]=(2*size+i)*size+j; //B
          flat2posit[4*size*(       i  )+  size+j  ]=(3*size+i)*size+j; //U
          flat2posit[4*size*(  size+i  )+2*size+j  ]=(4*size+i)*size+j; //R
          flat2posit[4*size*(  size+i  )+  size+j  ]=(5*size+i)*size+j; //F
        }
      }
    }
   
  /*
         19                32
     16           48           35
         31   60      51   44
     28     80    63    67     47
                83  64
            92          79
                95  76
   
                   0
               12     3
                  15
  */
  }

  var cubeSize = 2;

  var border = 2;
  var width = 20;
  var gap = 4;


  function colorGet(col){
    if (col==="r") return ("#FF0000");
    if (col==="o") return ("#FF8000");
    if (col==="b") return ("#0000FF");
    if (col==="g") return ("#00FF00");
    if (col==="y") return ("#FFFF00");
    if (col==="w") return ("#FFFFFF");
    if (col==="x") return ("#000000");
  }

  var scalePoint = function(w, h, ptIn) {
    
    var defaultWidth = border*2+width*4*cubeSize+gap*3;
    var defaultHeight = border*2+width*3*cubeSize+gap*2;

    var scale = Math.min(w/defaultWidth, h/defaultHeight);

    var x = Math.floor(ptIn[0]*scale + (w - (defaultWidth * scale))/2) + 0.5;
    var y = Math.floor(ptIn[1]*scale + (h - (defaultHeight * scale))/2) + 0.5;

    return [x, y];
  }

  function drawSquare(r, canvasWidth, canvasHeight, cx, cy, w, fillColor) {

    var arrx = [cx - w, cx - w, cx + w, cx + w];
    var arry = [cy - w, cy + w, cy + w, cy - w];

    var pathString = "";
    for (var i = 0; i < arrx.length; i++) {
      var scaledPoint = scalePoint(canvasWidth, canvasHeight, [arrx[i], arry[i]]);
      pathString += ((i===0) ? "M" : "L") + scaledPoint[0] + "," + scaledPoint[1];
    }
    pathString += "z";
      
    r.path(pathString).attr({fill: colorGet(fillColor), stroke: "#000"})
  }

  var drawScramble = function(parentElement, state, w, h) {

    initializeDrawing();

    var colorString = "wrgoby"; // UFRLBD

    var r = Raphael(parentElement, w, h);

    var s="",i,f,d=0,q;
    var ori = 0;
    d=0;
    s="<table border=0 cellpadding=0 cellspacing=0>";
    for(i=0;i<3*size;i++){
      s+="<tr>";
      for(f=0;f<4*size;f++){
        if(flat2posit[d]<0){
          s+="<td><\/td>";
        }else{
          var c = colorPerm[ori][state[flat2posit[d]]];
          var col = colorList[colors[c]+0];
          drawSquare(r, w, h, border + width /2 + f*width + gap*Math.floor(f/2), border + width /2 + i*width + gap*Math.floor(i/2), width/2, col);
          //s+="<td style='background-color:"+colorList[colors[c]+2]+"'><img src='scrbg/"+colorList[colors[c]+1]+"' width=10 border=1 height=10><\/td>";
        }
        d++;
      }
      s+="<\/tr>";
    }
    s+="<\/table>";
    return(s);
  }
   
  function doslice(f,d,q){
    //do move of face f, layer d, q quarter turns
    var f1,f2,f3,f4;
    var s2=size*size;
    var c,i,j,k;
    if(f>5)f-=6;
    // cycle the side facelets
    for(k=0; k<q; k++){
      for(i=0; i<size; i++){
        if(f===0){
          f1=6*s2-size*d-size+i;
          f2=2*s2-size*d-1-i;
          f3=3*s2-size*d-1-i;
          f4=5*s2-size*d-size+i;
        }else if(f===1){
          f1=3*s2+d+size*i;
          f2=3*s2+d-size*(i+1);
          f3=  s2+d-size*(i+1);
          f4=5*s2+d+size*i;
        }else if(f===2){
          f1=3*s2+d*size+i;
          f2=4*s2+size-1-d+size*i;
          f3=  d*size+size-1-i;
          f4=2*s2-1-d-size*i;
        }else if(f===3){
          f1=4*s2+d*size+size-1-i;
          f2=2*s2+d*size+i;
          f3=  s2+d*size+i;
          f4=5*s2+d*size+size-1-i;
        }else if(f===4){
          f1=6*s2-1-d-size*i;
          f2=size-1-d+size*i;
          f3=2*s2+size-1-d+size*i;
          f4=4*s2-1-d-size*i;
        }else if(f===5){
          f1=4*s2-size-d*size+i;
          f2=2*s2-size+d-size*i;
          f3=s2-1-d*size-i;
          f4=4*s2+d+size*i;
        }
        c=posit[f1];
        posit[f1]=posit[f2];
        posit[f2]=posit[f3];
        posit[f3]=posit[f4];
        posit[f4]=c;
      }
   
      /* turn face */
      if(d===0){
        for(i=0; i+i<size; i++){
          for(j=0; j+j<size-1; j++){
            f1=f*s2+         i+         j*size;
            f3=f*s2+(size-1-i)+(size-1-j)*size;
            if(f<3){
              f2=f*s2+(size-1-j)+         i*size;
              f4=f*s2+         j+(size-1-i)*size;
            }else{
              f4=f*s2+(size-1-j)+         i*size;
              f2=f*s2+         j+(size-1-i)*size;
            }
            c=posit[f1];
            posit[f1]=posit[f2];
            posit[f2]=posit[f3];
            posit[f3]=posit[f4];
            posit[f4]=c;
          }
        }
      }
    }
  };

  /*
   * Some helper functions.
   */

  var getRandomScramble = function() {
    initializeFull();

    mix2();
    var solution = solve();

    return {
      state: posit,
      scramble_string: solution
    };
  };

  var drawingInitialized = false;

  var initializeDrawing = function(continuation) {

    if (!drawingInitialized) {

      calcperm();
      parse();
      initialize();

      drawingInitialized = true;
    }

    if (continuation) {
      setTimeout(continuation, 0);
    }
  };

  var initializeFull = function(continuation, _) {
  
    initializeDrawing();

    if (continuation) {
      setTimeout(continuation, 0);
    }
  };


  /* mark2 interface */
  return {
    version: "July 05, 2015",
    initialize: initializeFull,
    setRandomSource: function() {console.log("setRandomSource is deprecated. Iat hs no effect anymore.")},
    getRandomScramble: getRandomScramble,
    drawScramble: drawScramble,

    /* Other methods */
  };

})();
/*

scramble_333.js

3x3x3 Solver / Scramble Generator in Javascript.

The core 3x3x3 code is from a min2phase solver by Shuang Chen.
Compiled to Javascript using GWT.
(There may be a lot of redundant code right now, but it's still really fast.)

 */


scramblers["333"] = (function() {


var _;
function nullMethod(){
}

function createArray(length1, length2){
  var result, i;
  result = Array(length1);
  for (i=0; i<length1; result[i++]=Array(length2));
  return result;
}

function $clinit_CoordCube(){
  $clinit_CoordCube = nullMethod;
  UDSliceMove = createArray(495, 18);
  TwistMove = createArray(324, 18);
  FlipMove = createArray(336, 18);
  UDSliceConj = createArray(495, 8);
  UDSliceTwistPrun = Array(160380);
  UDSliceFlipPrun = Array(166320);
  TwistFlipPrun = Array(870912);
  Mid3Move = createArray(1320, 18);
  Mid32MPerm = Array(24);
  CParity = Array(346);
  CPermMove = createArray(2768, 18);
  EPermMove = createArray(2768, 10);
  MPermMove = createArray(24, 10);
  MPermConj = createArray(24, 16);
  MCPermPrun = Array(66432);
  MEPermPrun = Array(66432);
}

function initCParity(){
  var i;
  for (i=0; i<346; ++i) {
    CParity[i] = 0;
  }
  for (i = 0; i < 2768; ++i) {
    CParity[i >>> 3] = (CParity[i >>> 3] | get8Parity((CPermS2R)[i]) << (i & 7));
  }
}

function initCPermMove(){
  var c, d, i, j;
  c = new CubieCube_0;
  d = new CubieCube_0;
  for (i = 0; i < 2768; ++i) {
    set8Perm(c.cp, (CPermS2R)[i]);
    for (j = 0; j < 18; ++j) {
      CornMult(c, moveCube[j], d);
      CPermMove[i][j] = $getCPermSym(d);
    }
  }
}

function initEPermMove(){
  var c, d, i, j;
  c = new CubieCube_0;
  d = new CubieCube_0;
  for (i = 0; i < 2768; ++i) {
    set8Perm(c.ep, (EPermS2R)[i]);
    for (j = 0; j < 10; ++j) {
      EdgeMult(c, moveCube[ud2std[j]], d);
      EPermMove[i][j] = $getEPermSym(d);
    }
  }
}

function initFlipMove(){
  var c, d, i, j;
  c = new CubieCube_0;
  d = new CubieCube_0;
  for (i = 0; i < 336; ++i) {
    $setFlip(c, (FlipS2R)[i]);
    for (j = 0; j < 18; ++j) {
      EdgeMult(c, moveCube[j], d);
      FlipMove[i][j] = $getFlipSym(d);
    }
  }
}

function initMCEPermPrun(callback){
  var SymState, c, check, corn, cornx, d, depth, done, edge, edgex, i, idx, idxx, inv, j, m_0, mid, midx, select, sym, symx;
  c = new CubieCube_0;
  d = new CubieCube_0;
  depth = 0;
  done = 1;
  SymState = Array(2768);
  for (i = 0; i < 2768; ++i) {
    SymState[i] = 0;
    set8Perm(c.ep, (EPermS2R)[i]);
    for (j = 1; j < 16; ++j) {
      EdgeMult(CubeSym[SymInv[j]], c, temp_0);
      EdgeMult(temp_0, CubeSym[j], d);
      binarySearch(EPermS2R, get8Perm(d.ep)) != 65535 && (SymState[i] = (SymState[i] | 1 << j));
    }
  }
  for (i = 0; i < 66432; ++i) {
    MEPermPrun[i] = -1;
  }
  MEPermPrun[0] = 0;
  while (done < 66432) {
    inv = depth > 7;
    select = inv?-1:depth;
    check = inv?depth:-1;
    ++depth;
    for (i = 0; i < 66432; ++i) {
      if (MEPermPrun[i] === select) {
        mid = i % 24;
        edge = ~~(i / 24);
        for (m_0 = 0; m_0 < 10; ++m_0) {
          edgex = EPermMove[edge][m_0];
          symx = edgex & 15;
          midx = MPermConj[MPermMove[mid][m_0]][symx];
          edgex >>>= 4;
          idx = edgex * 24 + midx;
          if (MEPermPrun[idx] === check) {
            ++done;
            if (inv) {
              MEPermPrun[i] = depth;
              break;
            }
             else {
              MEPermPrun[idx] = depth;
              sym = SymState[edgex];
              if (sym != 0) {
                for (j = 1; j < 16; ++j) {
                  sym = sym >> 1;
                  if ((sym & 1) === 1) {
                    idxx = edgex * 24 + MPermConj[midx][j];
                    if (MEPermPrun[idxx] === -1) {
                      MEPermPrun[idxx] = depth;
                      ++done;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    if ((done / 66432.) > 0.01) {
      callback("MEPermPrun: " + (Math.floor(done * 100 / 66432)) +"% (" + done + "/66432)");
    }
  }
  for (i = 0; i < 66432; ++i) {
    MCPermPrun[i] = -1;
  }
  MCPermPrun[0] = 0;
  depth = 0;
  done = 1;
  while (done < 66432) {
    inv = depth > 7;
    select = inv?-1:depth;
    check = inv?depth:-1;
    ++depth;
    for (i = 0; i < 66432; ++i) {
      if (MCPermPrun[i] === select) {
        mid = i % 24;
        corn = ~~(i / 24);
        for (m_0 = 0; m_0 < 10; ++m_0) {
          cornx = CPermMove[corn][ud2std[m_0]];
          symx = (cornx & 15);
          midx = MPermConj[MPermMove[mid][m_0]][symx];
          cornx = cornx >>> 4;
          idx = cornx * 24 + midx;
          if (MCPermPrun[idx] === check) {
            ++done;
            if (inv) {
              MCPermPrun[i] = depth;
              break;
            }
             else {
              MCPermPrun[idx] = depth;
              sym = SymState[cornx];
              if (sym != 0) {
                for (j = 1; j < 16; ++j) {
                  sym = sym >> 1;
                  if ((sym & 1) === 1) {
                    idxx = cornx * 24 + MPermConj[midx][j ^ (e2c)[j]];
                    if (MCPermPrun[idxx] === -1) {
                      MCPermPrun[idxx] = depth;
                      ++done;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    if ((done / 66432.) > 0.01) {
      callback("MCPermPrun: " + (Math.floor(done * 100 / 66432)) +"% (" + done + "/66432)");
    }
  }
}

function initMPermConj(){
  var c, d, i, j;
  c = new CubieCube_0;
  d = new CubieCube_0;
  for (i = 0; i < 24; ++i) {
    $setMPerm(c, i);
    for (j = 0; j < 16; ++j) {
      EdgeConjugate(c, SymInv[j], d);
      MPermConj[i][j] = $getMPerm(d);
    }
  }
}

function initMPermMove(){
  var c, d, i, j;
  c = new CubieCube_0;
  d = new CubieCube_0;
  for (i = 0; i < 24; ++i) {
    $setMPerm(c, i);
    for (j = 0; j < 10; ++j) {
      EdgeMult(c, moveCube[ud2std[j]], d);
      MPermMove[i][j] = $getMPerm(d);
    }
  }
}

function initMid32MPerm(){
  var c, i;
  c = new CubieCube_0;
  for (i = 0; i < 24; ++i) {
    $setMPerm(c, i);
    Mid32MPerm[$getMid3(c) % 24] = i;
  }
}

function initMid3Move(){
  var c, d, i, j;
  c = new CubieCube_0;
  d = new CubieCube_0;
  for (i = 0; i < 1320; ++i) {
    $setMid3(c, i);
    for (j = 0; j < 18; ++j) {
      EdgeMult(c, moveCube[j], d);
      Mid3Move[i][j] = $getMid3(d);
    }
  }
}



function initTwistFlipSlicePrun(callback){
  var SymState, SymStateF, c, check, d, depth, done, flip, flipx, fsym, fsymx, fsymxx, i, idx, idxx, inv, j, k, m_0, select, slice, slicex, sym, symF, symx, tsymx, twist, twistx;
  SymState = Array(324);
  c = new CubieCube_0;
  d = new CubieCube_0;
  for (i = 0; i < 324; ++i) {
    SymState[i] = 0;
    $setTwist(c, TwistS2R[i]);
    for (j = 0; j < 8; ++j) {
      CornMultSym(CubeSym[SymInv[j << 1]], c, temp_0);
      CornMultSym(temp_0, CubeSym[j << 1], d);
      binarySearch(TwistS2R, $getTwist(d)) != 65535 && (SymState[i] = SymState[i] | (1 << j));
    }
  }
  SymStateF = Array(336);
  for (i = 0; i < 336; ++i) {
    SymStateF[i] = 0;
    $setFlip(c, (FlipS2R)[i]);
    for (j = 0; j < 8; ++j) {
      EdgeMult(CubeSym[SymInv[j << 1]], c, temp_0);
      EdgeMult(temp_0, CubeSym[j << 1], d);
      binarySearch(FlipS2R, $getFlip(d)) != 65535 && (SymStateF[i] = SymStateF[i] | (1 << j));
    }
  }
  for (i = 0; i < 870912; ++i) {
    TwistFlipPrun[i] = -1;
  }
  for (i = 0; i < 8; ++i) {
    TwistFlipPrun[i] = 0;
  }
  depth = 0;
  done = 8;
  while (done < 870912) {
    inv = depth > 6;
    select = inv?-1:depth;
    check = inv?depth:-1;
    ++depth;
    for (i = 0; i < 870912; ++i) {
      if (TwistFlipPrun[i] != select)
        continue;
      twist = ~~(i / 2688);
      flip = i % 2688;
      fsym = i & 7;
      flip >>>= 3;
      for (m_0 = 0; m_0 < 18; ++m_0) {
        twistx = TwistMove[twist][m_0];
        tsymx = twistx & 7;
        twistx >>>= 3;
        flipx = FlipMove[flip][Sym8Move[fsym][m_0]];
        fsymx = Sym8MultInv[Sym8Mult[flipx & 7][fsym]][tsymx];
        flipx >>>= 3;
        idx = twistx * 2688 + (flipx << 3 | fsymx);
        if (TwistFlipPrun[idx] === check) {
          ++done;
          if (inv) {
            TwistFlipPrun[i] = depth;
            break;
          }
           else {
            TwistFlipPrun[idx] = depth;
            sym = SymState[twistx];
            symF = SymStateF[flipx];
            if (sym != 1 || symF != 1) {
              for (j = 0; j < 8; ++j , symF = symF >> 1) {
                if ((symF & 1) === 1) {
                  fsymxx = Sym8MultInv[fsymx][j];
                  for (k = 0; k < 8; ++k) {
                    if ((sym & 1 << k) != 0) {
                      idxx = twistx * 2688 + (flipx << 3 | Sym8MultInv[fsymxx][k]);
                      if (TwistFlipPrun[idxx] === -1) {
                        TwistFlipPrun[idxx] = depth;
                        ++done;
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    if ((done / 870912.) > 0.01) {
      callback("TwistFlipPrun: " + (Math.floor(done * 100 / 870912)) +"% (" + done + "/870912)");
    }
  }
  for (i = 0; i < 160380; ++i) {
    UDSliceTwistPrun[i] = -1;
  }
  UDSliceTwistPrun[0] = 0;
  depth = 0;
  done = 1;
  while (done < 160380) {
    inv = depth > 6;
    select = inv?-1:depth;
    check = inv?depth:-1;
    ++depth;
    for (i = 0; i < 160380; ++i) {
      if (UDSliceTwistPrun[i] === select) {
        slice = i % 495;
        twist = ~~(i / 495);
        for (m_0 = 0; m_0 < 18; ++m_0) {
          twistx = TwistMove[twist][m_0];
          symx = twistx & 7;
          slicex = UDSliceConj[UDSliceMove[slice][m_0]][symx];
          twistx >>>= 3;
          idx = twistx * 495 + slicex;
          if (UDSliceTwistPrun[idx] === check) {
            ++done;
            if (inv) {
              UDSliceTwistPrun[i] = depth;
              break;
            }
             else {
              UDSliceTwistPrun[idx] = depth;
              sym = SymState[twistx];
              if (sym != 1) {
                for (j = 1; j < 8; ++j) {
                  sym = sym >> 1;
                  if ((sym & 1) === 1) {
                    idxx = twistx * 495 + UDSliceConj[slicex][j];
                    if (UDSliceTwistPrun[idxx] === -1) {
                      UDSliceTwistPrun[idxx] = depth;
                      ++done;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    if ((done / 160380.) > 0.01) {
      callback("UDSliceTwistPrun: " + (Math.floor(done * 100 / 160380)) +"% (" + done + "/160380)");
    }
  }
  for (i = 0; i < 166320; ++i) {
    UDSliceFlipPrun[i] = -1;
  }
  UDSliceFlipPrun[0] = 0;
  depth = 0;
  done = 1;
  while (done < 166320) {
    inv = depth > 6;
    select = inv?-1:depth;
    check = inv?depth:-1;
    ++depth;
    for (i = 0; i < 166320; ++i) {
      if (UDSliceFlipPrun[i] === select) {
        slice = i % 495;
        flip = ~~(i / 495);
        for (m_0 = 0; m_0 < 18; ++m_0) {
          flipx = FlipMove[flip][m_0];
          symx = flipx & 7;
          slicex = UDSliceConj[UDSliceMove[slice][m_0]][symx];
          flipx >>>= 3;
          idx = flipx * 495 + slicex;
          if (UDSliceFlipPrun[idx] === check) {
            ++done;
            if (inv) {
              UDSliceFlipPrun[i] = depth;
              break;
            }
             else {
              UDSliceFlipPrun[idx] = depth;
              sym = SymStateF[flipx];
              if (sym != 1) {
                for (j = 1; j < 8; ++j) {
                  sym = sym >> 1;
                  if ((sym & 1) === 1) {
                    idxx = flipx * 495 + UDSliceConj[slicex][j];
                    if (UDSliceFlipPrun[idxx] === -1) {
                      UDSliceFlipPrun[idxx] = depth;
                      ++done;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    if ((done / 166320.) > 0.01) {
      callback("UDSliceFlipPrun: " + (Math.floor(done * 100 / 166320)) +"% (" + done + "/166320)");
    }
  }
}

function initTwistMove(){
  var c, d, i, j;
  c = new CubieCube_0;
  d = new CubieCube_0;
  for (i = 0; i < 324; ++i) {
    $setTwist(c, TwistS2R[i]);
    for (j = 0; j < 18; ++j) {
      CornMult(c, moveCube[j], d);
      TwistMove[i][j] = $getTwistSym(d);
    }
  }
}

function initUDSliceConj(){
  var c, d, i, j;
  c = new CubieCube_0;
  d = new CubieCube_0;
  for (i = 0; i < 495; ++i) {
    $setUDSlice(c, i);
    for (j = 0; j < 16; j = j + 2) {
      EdgeConjugate(c, (SymInv)[j], d);
      UDSliceConj[i][j >>> 1] = $getUDSlice(d);
    }
  }
}

function initUDSliceMove(){
  var c, d, i, j;
  c = new CubieCube_0;
  d = new CubieCube_0;
  for (i = 0; i < 495; ++i) {
    $setUDSlice(c, i);
    for (j = 0; j < 18; ++j) {
      EdgeMult(c, moveCube[j], d);
      UDSliceMove[i][j] = $getUDSlice(d);
    }
  }
}

var CParity, CPermMove, EPermMove, FlipMove, MCPermPrun, MEPermPrun, MPermConj, MPermMove, Mid32MPerm, Mid3Move, TwistFlipPrun, TwistMove, UDSliceConj, UDSliceFlipPrun, UDSliceMove, UDSliceTwistPrun;
function $clinit_CubieCube(){
  $clinit_CubieCube = nullMethod;
  temp_0 = new CubieCube_0;
  CubeSym = Array(16);
  SymInv = Array(16);
  SymMult = createArray(16, 16);
  SymMove = createArray(16, 18);
  Sym8Mult = createArray(8, 8);
  Sym8Move = createArray(8, 18);
  Sym8MultInv = createArray(8, 8);
  SymMoveUD = createArray(16, 10);
  FlipS2R = Array(336);
  TwistS2R = Array(324);
  CPermS2R = Array(2768);
  EPermS2R = CPermS2R;
  MtoEPerm = Array(40320);
  merge = createArray(56, 56);
  e2c = [0, 0, 0, 0, 1, 3, 1, 3, 1, 3, 1, 3, 0, 0, 0, 0];
  urf1 = new CubieCube_2(2531, 1373, 67026819, 1877);
  urf2 = new CubieCube_2(2089, 1906, 322752913, 255);
  urfMove = [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17], [6, 7, 8, 0, 1, 2, 3, 4, 5, 15, 16, 17, 9, 10, 11, 12, 13, 14], [3, 4, 5, 6, 7, 8, 0, 1, 2, 12, 13, 14, 15, 16, 17, 9, 10, 11], [2, 1, 0, 5, 4, 3, 8, 7, 6, 11, 10, 9, 14, 13, 12, 17, 16, 15], [8, 7, 6, 2, 1, 0, 5, 4, 3, 17, 16, 15, 11, 10, 9, 14, 13, 12], [5, 4, 3, 8, 7, 6, 2, 1, 0, 14, 13, 12, 17, 16, 15, 11, 10, 9]];
  initMove();
  initSym();
}

function $$init(obj){
  obj.cp = [0, 1, 2, 3, 4, 5, 6, 7];
  obj.co = [0, 0, 0, 0, 0, 0, 0, 0];
  obj.ep = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  obj.eo = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
}

function $copy(obj, c){
  var i;
  for (i = 0; i < 8; ++i) {
    obj.cp[i] = c.cp[i];
    obj.co[i] = c.co[i];
  }
  for (i = 0; i < 12; ++i) {
    obj.ep[i] = c.ep[i];
    obj.eo[i] = c.eo[i];
  }
}

function $getCPermSym(obj){
  var idx, k;
  if (EPermR2S != null) {
    idx = EPermR2S[get8Perm(obj.cp)];
    idx = (idx ^ e2c[idx & 15]);
    return idx;
  }
  for (k = 0; k < 16; ++k) {
    CornConjugate(obj, SymInv[k], obj.temps);
    idx = binarySearch(CPermS2R, get8Perm(obj.temps.cp));
    if (idx != 65535) {
      return (idx << 4 | k);
    }
  }
  return 0;
}

function $getDRtoDL(obj){
  var i, idxA, idxB, mask, r, t;
  idxA = 0;
  idxB = 0;
  mask = 0;
  r = 3;
  for (i = 11; i >= 0; --i) {
    if (4 <= obj.ep[i] && obj.ep[i] <= 6) {
      idxA = idxA + (Cnk)[i][r--];
      t = 1 << obj.ep[i];
      idxB = idxB + bitCount(mask & t - 1) * fact[2 - r];
      mask = (mask | t);
    }
  }
  return idxA * 6 + idxB;
}

function $getEPermSym(obj){
  var idx, k;
  if (EPermR2S != null) {
    return EPermR2S[get8Perm(obj.ep)];
  }
  for (k = 0; k < 16; ++k) {
    EdgeConjugate(obj, SymInv[k], obj.temps);
    idx = binarySearch(EPermS2R, get8Perm(obj.temps.ep));
    if (idx != 65535) {
      return (idx << 4 | k);
    }
  }
  return 0;
}

function $getEdgePerm(obj){
  var i, idx, m_0, t;
  m_0 = 1 << obj.ep[11];
  idx = 0;
  for (i = 10; i >= 0; --i) {
    t = 1 << obj.ep[i];
    idx += bitCount(m_0 & t - 1) * (fact)[11 - i];
    m_0 |= t;
  }
  return idx;
}

function $getFlip(obj){
  var i, idx;
  idx = 0;
  for (i = 0; i < 11; ++i) {
    idx = (idx | obj.eo[i] << i);
  }
  return idx;
}

function $getFlipSym(obj){
  var idx, k;
  if (FlipR2S != null) {
    return FlipR2S[$getFlip(obj)];
  }
  for (k = 0; k < 16; k = k + 2) {
    EdgeConjugate(obj, SymInv[k], obj.temps);
    idx = binarySearch(FlipS2R, $getFlip(obj.temps));
    if (idx != 65535) {
      return (idx << 3 | k >>> 1);
    }
  }
  return 0;
}

function $getMPerm(obj){
  var i, idx, m_0, t;
  m_0 = 1 << obj.ep[11];
  idx = 0;
  for (i = 10; i >= 8; --i) {
    t = 1 << obj.ep[i];
    idx += bitCount(m_0 & t - 1) * (fact)[11 - i];
    m_0 |= t;
  }
  return idx;
}

function $getMid3(obj){
  var i, idxA, idxB, mask, r, t;
  idxA = 0;
  idxB = 0;
  mask = 0;
  r = 3;
  for (i = 11; i >= 0; --i) {
    if (obj.ep[i] >= 9) {
      idxA = idxA + (Cnk)[i][r--];
      t = 1 << obj.ep[i];
      idxB = idxB + bitCount(mask & t - 1) * fact[2 - r];
      mask = (mask | t);
    }
  }
  return idxA * 6 + idxB;
}

function $getTwist(obj){
  var i, idx;
  idx = 0;
  for (i = 0; i < 7; ++i) {
    idx = idx * 3;
    idx = idx + obj.co[i];
  }
  return idx;
}

function $getTwistSym(obj){
  var idx, k;
  if (TwistR2S != null) {
    return TwistR2S[$getTwist(obj)];
  }
  for (k = 0; k < 16; k = k + 2) {
    CornConjugate(obj, SymInv[k], obj.temps);
    idx = $getTwist(obj.temps);
    idx = binarySearch(TwistS2R, idx);
    if (idx != 65535) {
      return (idx << 3 | k >>> 1);
    }
  }
  return 0;
}

function $getUDSlice(obj){
  var i, idx, r;
  idx = 0;
  r = 4;
  for (i = 0; i < 12; ++i) {
    obj.ep[i] >= 8 && (idx = idx + (Cnk)[11 - i][r--]);
  }
  return idx;
}

function $getURtoUL(obj){
  var i, idxA, idxB, mask, r, t;
  idxA = 0;
  idxB = 0;
  mask = 0;
  r = 3;
  for (i = 11; i >= 0; --i) {
    if (obj.ep[i] <= 2) {
      idxA = idxA + (Cnk)[i][r--];
      t = 1 << obj.ep[i];
      idxB = idxB + bitCount(mask & t - 1) * fact[2 - r];
      mask = (mask | t);
    }
  }
  return idxA * 6 + idxB;
}

function $invCubieCube(obj){
  var corn, edge, ori;
  for (edge = 0; edge < 12; ++edge)
    obj.temps.ep[obj.ep[edge]] = edge;
  for (edge = 0; edge < 12; ++edge)
    obj.temps.eo[edge] = obj.eo[obj.temps.ep[edge]];
  for (corn = 0; corn < 8; ++corn)
    obj.temps.cp[obj.cp[corn]] = corn;
  for (corn = 0; corn < 8; ++corn) {
    ori = obj.co[obj.temps.cp[corn]];
    obj.temps.co[corn] = -ori;
    obj.temps.co[corn] < 0 && (obj.temps.co[corn] = obj.temps.co[corn] + 3);
  }
  $copy(obj, obj.temps);
}

function $setEdgePerm(obj, idx){
  var i, j;
  obj.ep[11] = 0;
  for (i = 10; i >= 0; --i) {
    obj.ep[i] = idx % (12 - i);
    idx = ~~(idx / (12 - i));
    for (j = i + 1; j < 12; ++j) {
      obj.ep[j] >= obj.ep[i] && ++obj.ep[j];
    }
  }
}

function $setFlip(obj, idx){
  var i;
  obj.eo[11] = bitOdd(idx);
  for (i = 0; i < 11; ++i) {
    obj.eo[i] = (idx & 1);
    idx = idx >>> 1;
  }
}

function $setMPerm(obj, idx){
  var i, j;
  obj.ep[11] = 8;
  for (i = 10; i >= 8; --i) {
    obj.ep[i] = idx % (12 - i) + 8;
    idx = ~~(idx / (12 - i));
    for (j = i + 1; j < 12; ++j) {
      obj.ep[j] >= obj.ep[i] && ++obj.ep[j];
    }
  }
}

function $setMid3(obj, idxA){
  var edge, i, r;
  edge = (perm3)[idxA % 6];
  idxA = ~~(idxA / 6);
  r = 3;
  for (i = 11; i >= 0; --i) {
    if (idxA >= Cnk[i][r]) {
      idxA = idxA - Cnk[i][r--];
      obj.ep[i] = edge[2 - r];
    }
     else {
      obj.ep[i] = 8 - i + r;
    }
  }
}

function $setTwist(obj, idx){
  var i, twst;
  twst = 0;
  for (i = 6; i >= 0; --i) {
    twst = twst + (obj.co[i] = idx % 3);
    idx = ~~(idx / 3);
  }
  obj.co[7] = (15 - twst) % 3;
}

function $setUDSlice(obj, idx){
  var i, r;
  r = 4;
  for (i = 0; i < 12; ++i) {
    if (idx >= (Cnk)[11 - i][r]) {
      idx = idx - Cnk[11 - i][r--];
      obj.ep[i] = 11 - r;
    }
     else {
      obj.ep[i] = i + r - 4;
    }
  }
}

function $verify(obj){
  var c, cornMask, e, edgeMask, i, sum;
  sum = 0;
  edgeMask = 0;
  for (e = 0; e < 12; ++e)
    edgeMask = (edgeMask | 1 << obj.ep[e]);
  if (edgeMask != 4095)
    return -2;
  for (i = 0; i < 12; ++i)
    sum = sum ^ obj.eo[i];
  if (sum % 2 != 0)
    return -3;
  cornMask = 0;
  for (c = 0; c < 8; ++c)
    cornMask = (cornMask | 1 << obj.cp[c]);
  if (cornMask != 255)
    return -4;
  sum = 0;
  for (i = 0; i < 8; ++i)
    sum = sum + obj.co[i];
  if (sum % 3 != 0)
    return -5;
  if ((get12Parity($getEdgePerm(obj)) ^ get8Parity(get8Perm(obj.cp))) != 0)
    return -6;
  return 0;
}

function CornConjugate(a, idx, b){
  CornMultSym(CubeSym[SymInv[idx]], a, temp_0);
  CornMultSym(temp_0, CubeSym[idx], b);
}

function CornMult(a, b, prod){
  var corn;
  for (corn = 0; corn < 8; ++corn) {
    prod.cp[corn] = a.cp[b.cp[corn]];
    prod.co[corn] = (a.co[b.cp[corn]] + b.co[corn]) % 3;
  }
}

function CornMultSym(a, b, prod){
  var corn, ori, oriA, oriB;
  for (corn = 0; corn < 8; ++corn) {
    prod.cp[corn] = a.cp[b.cp[corn]];
    oriA = a.co[b.cp[corn]];
    oriB = b.co[corn];
    ori = oriA;
    ori = ori + (oriA < 3?oriB:3 - oriB);
    ori = ori % 3;
    oriA < 3 ^ oriB < 3 && (ori = ori + 3);
    prod.co[corn] = ori;
  }
}

function CubieCube_0(){
  $$init(this);
}

function CubieCube_1(cp, co, ep, eo){
  var i;
  $$init(this);
  for (i = 0; i < 8; ++i) {
    this.cp[i] = cp[i];
    this.co[i] = co[i];
  }
  for (i = 0; i < 12; ++i) {
    this.ep[i] = ep[i];
    this.eo[i] = eo[i];
  }
}

function CubieCube_2(cperm, twist, eperm, flip){
  $$init(this);
  set8Perm(this.cp, cperm);
  $setTwist(this, twist);
  $setEdgePerm(this, eperm);
  $setFlip(this, flip);
}

function CubieCube_3(c){
  CubieCube_1.call(this, c.cp, c.co, c.ep, c.eo);
}

function EdgeConjugate(a, idx, b){
  EdgeMult(CubeSym[SymInv[idx]], a, temp_0);
  EdgeMult(temp_0, CubeSym[idx], b);
}

function EdgeMult(a, b, prod){
  var ed;
  for (ed = 0; ed < 12; ++ed) {
    prod.ep[ed] = a.ep[b.ep[ed]];
    prod.eo[ed] = (b.eo[ed] ^ a.eo[b.ep[ed]]);
  }
}

function get8Perm(arr){
  var i, idx, v, val;
  idx = 0;
  val = 1985229328;
  for (i = 0; i < 7; ++i) {
    v = arr[i] << 2;
    idx = (8 - i) * idx + (val >> v & 7);
    val -= 286331152 << v;
  }
  return idx;
}

function initMove(){
  var m_0, mc, p;
  mc = Array(18);
  moveCube = [new CubieCube_2(15120, 0, 119750400, 0), new CubieCube_2(21021, 1494, 323403417, 0), new CubieCube_2(8064, 1236, 29441808, 802), new CubieCube_2(9, 0, 5880, 0), new CubieCube_2(1230, 412, 2949660, 0), new CubieCube_2(224, 137, 328552, 1160)];
  for (m_0 = 0; m_0 < 6; ++m_0) {
    mc[m_0 * 3] = moveCube[m_0];
    for (p = 0; p < 2; ++p) {
      mc[m_0 * 3 + p + 1] = new CubieCube_0;
      EdgeMult(mc[m_0 * 3 + p], moveCube[m_0], mc[m_0 * 3 + p + 1]);
      CornMult(mc[m_0 * 3 + p], moveCube[m_0], mc[m_0 * 3 + p + 1]);
    }
  }
  moveCube = mc;
}

function initSym(){
  var c, d, f2, i, j, k, lr2, m_0, s, temp, u4;
  c = new CubieCube_0;
  d = new CubieCube_0;
  f2 = new CubieCube_2(28783, 0, 259268407, 0);
  u4 = new CubieCube_2(15138, 0, 119765538, 1792);
  lr2 = new CubieCube_2(5167, 0, 83473207, 0);
  lr2.co = [3, 3, 3, 3, 3, 3, 3, 3];
  for (i = 0; i < 16; ++i) {
    CubeSym[i] = new CubieCube_3(c);
    CornMultSym(c, u4, d);
    EdgeMult(c, u4, d);
    temp = d;
    d = c;
    c = temp;
    if (i % 4 === 3) {
      CornMultSym(temp, lr2, d);
      EdgeMult(temp, lr2, d);
      temp = d;
      d = c;
      c = temp;
    }
    if (i % 8 === 7) {
      CornMultSym(temp, f2, d);
      EdgeMult(temp, f2, d);
      temp = d;
      d = c;
      c = temp;
    }
  }
  for (j = 0; j < 16; ++j) {
    for (k = 0; k < 16; ++k) {
      CornMultSym(CubeSym[j], CubeSym[k], c);
      if (c.cp[0] === 0 && c.cp[1] === 1 && c.cp[2] === 2) {
        SymInv[j] = k;
        break;
      }
    }
  }
  for (i = 0; i < 16; ++i) {
    for (j = 0; j < 16; ++j) {
      CornMultSym(CubeSym[i], CubeSym[j], c);
      for (k = 0; k < 16; ++k) {
        if (CubeSym[k].cp[0] === c.cp[0] && CubeSym[k].cp[1] === c.cp[1] && CubeSym[k].cp[2] === c.cp[2]) {
          SymMult[i][j] = k;
          break;
        }
      }
    }
  }
  for (j = 0; j < 18; ++j) {
    for (s = 0; s < 16; ++s) {
      CornConjugate(moveCube[j], SymInv[s], c);
      CONTINUE: for (m_0 = 0; m_0 < 18; ++m_0) {
        for (i = 0; i < 8; ++i) {
          if (c.cp[i] != moveCube[m_0].cp[i] || c.co[i] != moveCube[m_0].co[i]) {
            continue CONTINUE;
          }
        }
        SymMove[s][j] = m_0;
      }
    }
  }
  for (j = 0; j < 10; ++j) {
    for (s = 0; s < 16; ++s) {
      SymMoveUD[s][j] = (std2ud)[SymMove[s][ud2std[j]]];
    }
  }
  for (j = 0; j < 8; ++j) {
    for (s = 0; s < 8; ++s) {
      Sym8Mult[s][j] = SymMult[s << 1][j << 1] >>> 1;
    }
  }
  for (j = 0; j < 18; ++j) {
    for (s = 0; s < 8; ++s) {
      Sym8Move[s][j] = SymMove[s << 1][j];
    }
  }
  for (j = 0; j < 8; ++j) {
    for (s = 0; s < 8; ++s) {
      Sym8MultInv[j][s] = Sym8Mult[j][SymInv[s << 1] >> 1];
    }
  }
}

function initSym2Raw(){
  var a, b, c, count, d, i, idx, j, m_0, mask, occ, s;
  c = new CubieCube_0;
  d = new CubieCube_0;
  occ = Array(1260);
  count = 0;
  for (i = 0; i < 64; occ[i++] = 0)
  ;
  for (i = 0; i < 2048; ++i) {
    if ((occ[i >>> 5] & 1 << (i & 31)) === 0) {
      $setFlip(c, i);
      for (s = 0; s < 16; s = s + 2) {
        EdgeMult(CubeSym[SymInv[s]], c, temp_0);
        EdgeMult(temp_0, CubeSym[s], d);
        idx = $getFlip(d);
        occ[idx >>> 5] |= 1 << (idx & 31);
        FlipR2S[idx] = (count << 3 | s >>> 1);
      }
      FlipS2R[count++] = i;
    }
  }
  count = 0;
  for (i = 0; i < 69; occ[i++] = 0)
  ;
  for (i = 0; i < 2187; ++i) {
    if ((occ[i >>> 5] & 1 << (i & 31)) === 0) {
      $setTwist(c, i);
      for (s = 0; s < 16; s = s + 2) {
        CornMultSym(CubeSym[SymInv[s]], c, temp_0);
        CornMultSym(temp_0, CubeSym[s], d);
        idx = $getTwist(d);
        occ[idx >>> 5] |= 1 << (idx & 31);
        TwistR2S[idx] = (count << 3 | s >>> 1);
      }
      TwistS2R[count++] = i;
    }
  }

  mask = Array(2);
  mask[0] = Array(56);
  mask[1] = Array(56);
  for (i=0; i<56; ++i) {
    mask[0][i] = mask[1][i] = 0;
  }
  for (i = 0; i < 40320; ++i) {
    set8Perm(c.ep, i);
    a = ~~($getURtoUL(c) / 6);
    b = ~~($getDRtoDL(c) / 6);
    mask[b>>5][a] |= 1 << (b & 0x1f);
  }
  for (i = 0; i < 56; ++i) {
    count = 0;
    for (j = 0; j < 56; ++j) {
      ((mask[j>>5][i] & (1 << (j & 0x1f))) != 0) && (merge[i][j] = count++);
    }
  }
  count = 0;
  for (i = 0; i < 1260; occ[i++] = 0)
  ;
  for (i = 0; i < 40320; ++i) {
    if ((occ[i >>> 5] & 1 << (i & 31)) === 0) {
      set8Perm(c.ep, i);
      for (s = 0; s < 16; ++s) {
        EdgeMult(CubeSym[SymInv[s]], c, temp_0);
        EdgeMult(temp_0, CubeSym[s], d);
        idx = get8Perm(d.ep);
        occ[idx >>> 5] |= 1 << (idx & 31);
        a = $getURtoUL(d);
        b = $getDRtoDL(d);
        m_0 = merge[~~(a / 6)][~~(b / 6)] * 4032 + a * 12 + b % 6 * 2 + get8Parity(idx);
        MtoEPerm[m_0] = (count << 4 | s);
        EPermR2S[idx] = (count << 4 | s);
      }
      EPermS2R[count++] = i;
    }
  }
}

function set8Perm(arr, idx){
  var i, m_0, p, v, val;
  val = 1985229328;
  for (i = 0; i < 7; ++i) {
    p = (fact)[7 - i];
    v = ~~(idx / p);
    idx = idx - v * p;
    v <<= 2;
    arr[i] = (val >> v & 7);
    m_0 = (1 << v) - 1;
    val = (val & m_0) + (val >> 4 & ~m_0);
  }
  arr[7] = val;
}

function CubieCube(){
}

_ = CubieCube_3.prototype = CubieCube_2.prototype = CubieCube_0.prototype = CubieCube.prototype;
_.temps = null;
var CPermS2R, CubeSym, EPermR2S = null, EPermS2R, FlipR2S = null, FlipS2R, MtoEPerm, Sym8Move, Sym8Mult, Sym8MultInv, SymInv, SymMove, SymMoveUD, SymMult, TwistR2S = null, TwistS2R, e2c, merge, moveCube = null, temp_0, urf1, urf2, urfMove;


function $Solve(obj, c){
  var i;
  c.temps = new CubieCube_0;
  for (i = 0; i < 6; ++i) {
    obj.twist[i] = $getTwistSym(c);
    obj.tsym[i] = obj.twist[i] & 7;
    obj.twist[i] >>>= 3;
    obj.flip[i] = $getFlipSym(c);
    obj.fsym[i] = obj.flip[i] & 7;
    obj.flip[i] >>>= 3;
    obj.slice_0[i] = $getUDSlice(c);
    obj.corn0[i] = $getCPermSym(c);
    obj.csym0[i] = obj.corn0[i] & 15;
    obj.corn0[i] >>>= 4;
    obj.mid30[i] = $getMid3(c);
    obj.e10[i] = $getURtoUL(c);
    obj.e20[i] = $getDRtoDL(c);
    obj.prun[i] = Math.max(Math.max((UDSliceTwistPrun)[obj.twist[i] * 495 + UDSliceConj[obj.slice_0[i]][obj.tsym[i]]], UDSliceFlipPrun[obj.flip[i] * 495 + UDSliceConj[obj.slice_0[i]][obj.fsym[i]]]), TwistFlipPrun[obj.twist[i] * 2688 + (obj.flip[i] << 3 | (Sym8MultInv)[obj.fsym[i]][obj.tsym[i]])]);
    CornMult(urf2, c, c.temps);
    CornMult(c.temps, urf1, c);
    EdgeMult(urf2, c, c.temps);
    EdgeMult(c.temps, urf1, c);
    i === 2 && $invCubieCube(c);
  }
  obj.solution = null;
  for (obj.length1 = 0; obj.length1 < obj.sol; ++obj.length1) {
    obj.maxlength2 = Math.min(~~(obj.sol / 2) + 1, obj.sol - obj.length1);
    for (obj.urfidx = 0; obj.urfidx < 6; ++obj.urfidx) {
      obj.corn[0] = obj.corn0[obj.urfidx];
      obj.csym[0] = obj.csym0[obj.urfidx];
      obj.mid3[0] = obj.mid30[obj.urfidx];
      obj.e1[0] = obj.e10[obj.urfidx];
      obj.e2[0] = obj.e20[obj.urfidx];
      if (obj.prun[obj.urfidx] <= obj.length1 && $phase1(obj, obj.twist[obj.urfidx], obj.tsym[obj.urfidx], obj.flip[obj.urfidx], obj.fsym[obj.urfidx], obj.slice_0[obj.urfidx], obj.length1, 18)) {
        return obj.solution === null?'Error 8':obj.solution;
      }
    }
  }
  return 'Error 7';
}

function $init2(obj){
  var cornx, edge, esym, ex, i, lm, m_0, mid, prun, s, sb, urf;
  obj.valid2 = Math.min(obj.valid2, obj.valid1);
  for (i = obj.valid1; i < obj.length1; ++i) {
    m_0 = obj.move[i];
    obj.corn[i + 1] = (CPermMove)[obj.corn[i]][(SymMove)[obj.csym[i]][m_0]];
    obj.csym[i + 1] = SymMult[obj.corn[i + 1] & 15][obj.csym[i]];
    obj.corn[i + 1] >>>= 4;
    obj.mid3[i + 1] = Mid3Move[obj.mid3[i]][m_0];
  }
  obj.valid1 = obj.length1;
  mid = (Mid32MPerm)[obj.mid3[obj.length1] % 24];
  prun = MCPermPrun[obj.corn[obj.length1] * 24 + MPermConj[mid][obj.csym[obj.length1]]];
  if (prun >= obj.maxlength2) {
    return false;
  }
  for (i = obj.valid2; i < obj.length1; ++i) {
    obj.e1[i + 1] = Mid3Move[obj.e1[i]][obj.move[i]];
    obj.e2[i + 1] = Mid3Move[obj.e2[i]][obj.move[i]];
  }
  obj.valid2 = obj.length1;
  cornx = obj.corn[obj.length1];
  ex = (merge)[~~(obj.e1[obj.length1] / 6)][~~(obj.e2[obj.length1] / 6)] * 4032 + obj.e1[obj.length1] * 12 + obj.e2[obj.length1] % 6 * 2 + (CParity[cornx >>> 3] >>> (cornx & 7) & 1 ^ (parity4)[mid]);
  edge = MtoEPerm[ex];
  esym = edge & 15;
  edge >>>= 4;
  prun = Math.max(MEPermPrun[edge * 24 + MPermConj[mid][esym]], prun);
  if (prun >= obj.maxlength2) {
    return false;
  }
  lm = obj.length1 === 0?10:std2ud[~~(obj.move[obj.length1 - 1] / 3) * 3 + 1];
  for (i = prun; i < obj.maxlength2; ++i) {
    if ($phase2(obj, edge, esym, obj.corn[obj.length1], obj.csym[obj.length1], mid, i, obj.length1, lm)) {
      obj.sol = obj.length1 + i;
      sb = "";
      urf = obj.urfidx;
      (urf = (urf + 3) % 6);
      if (urf < 3) {
        for (s = 0; s < obj.length1; ++s) {
          sb += move2str[urfMove[urf][obj.move[s]]];
          sb += ' ';
        }
        obj.useSeparator && (sb.impl.string += '.' , sb);
        for (s = obj.length1; s < obj.sol; ++s) {
          sb += move2str[urfMove[urf][obj.move[s]]];
          sb += ' ';
        }
      }
       else {
        for (s = obj.sol - 1; s >= obj.length1; --s) {
          sb += move2str[urfMove[urf][obj.move[s]]];
          sb += ' ';
        }
        obj.useSeparator && (sb += '.' , sb);
        for (s = obj.length1 - 1; s >= 0; --s) {
          sb += move2str[urfMove[urf][obj.move[s]]];
          sb += ' ';
        }
      }
      obj.solution = sb;
      return true;
    }
  }
  return false;
}

function $phase1(obj, twist, tsym, flip, fsym, slice, maxl, lm){
  var flipx, fsymx, m_0, slicex, tsymx, twistx;
  if (twist === 0 && flip === 0 && slice === 0 && maxl < 5) {
    return maxl === 0 && $init2(obj);
  }
  for (m_0 = 0; m_0 < 18; ++m_0) {
    if ((ckmv)[lm][m_0]) {
      m_0 += 2;
      continue;
    }
    slicex = (UDSliceMove)[slice][m_0];
    twistx = TwistMove[twist][Sym8Move[tsym][m_0]];
    tsymx = Sym8Mult[twistx & 7][tsym];
    twistx >>>= 3;
    if (UDSliceTwistPrun[twistx * 495 + UDSliceConj[slicex][tsymx]] >= maxl) {
      continue;
    }
    flipx = FlipMove[flip][Sym8Move[fsym][m_0]];
    fsymx = Sym8Mult[flipx & 7][fsym];
    flipx >>>= 3;
    if (TwistFlipPrun[twistx * 2688 + (flipx << 3 | Sym8MultInv[fsymx][tsymx])] >= maxl || UDSliceFlipPrun[flipx * 495 + UDSliceConj[slicex][fsymx]] >= maxl) {
      continue;
    }
    obj.move[obj.length1 - maxl] = m_0;
    obj.valid1 = Math.min(obj.valid1, obj.length1 - maxl);
    if ($phase1(obj, twistx, tsymx, flipx, fsymx, slicex, maxl - 1, m_0)) {
      return true;
    }
  }
  return false;
}

function $phase2(obj, edge, esym, corn, csym, mid, maxl, depth, lm){
  var cornx, csymx, edgex, esymx, m_0, midx;
  if (edge === 0 && corn === 0 && mid === 0) {
    return true;
  }
  for (m_0 = 0; m_0 < 10; ++m_0) {
    if ((ckmv2)[lm][m_0]) {
      continue;
    }
    midx = (MPermMove)[mid][m_0];
    edgex = EPermMove[edge][(SymMoveUD)[esym][m_0]];
    esymx = SymMult[edgex & 15][esym];
    edgex >>>= 4;
    if (MEPermPrun[edgex * 24 + MPermConj[midx][esymx]] >= maxl) {
      continue;
    }
    cornx = CPermMove[corn][SymMove[csym][ud2std[m_0]]];
    csymx = SymMult[cornx & 15][csym];
    cornx >>>= 4;
    if (MCPermPrun[cornx * 24 + MPermConj[midx][csymx]] >= maxl) {
      continue;
    }
    obj.move[depth] = ud2std[m_0];
    if ($phase2(obj, edgex, esymx, cornx, csymx, midx, maxl - 1, depth + 1, m_0)) {
      return true;
    }
  }
  return false;
}

function $solution(obj, facelets){
  var $e0, cc, i, s;
  init_0();
    for (i = 0; i < 54; ++i) {
      switch (facelets.charCodeAt(i)) {
        case 85:
          obj.f[i] = 0;
          break;
        case 82:
          obj.f[i] = 1;
          break;
        case 70:
          obj.f[i] = 2;
          break;
        case 68:
          obj.f[i] = 3;
          break;
        case 76:
          obj.f[i] = 4;
          break;
        case 66:
          obj.f[i] = 5;
          break;
        default:return 'Error 1';
      }
    }
  cc = toCubieCube(obj.f);
  obj.sol = 22;
  return $Solve(obj, cc);
}

function Search(){
  this.move = Array(31);
  this.corn = Array(20);
  this.csym = Array(20);
  this.mid3 = Array(20);
  this.e1 = Array(20);
  this.e2 = Array(20);
  this.twist = Array(6);
  this.tsym = Array(6);
  this.flip = Array(6);
  this.fsym = Array(6);
  this.slice_0 = Array(6);
  this.corn0 = Array(6);
  this.csym0 = Array(6);
  this.mid30 = Array(6);
  this.e10 = Array(6);
  this.e20 = Array(6);
  this.prun = Array(6);
  this.count = Array(6);
  this.f = Array(54);
}

_ = Search.prototype;
_.inverse = false;
_.length1 = 0;
_.maxlength2 = 0;
_.sol = 999;
_.solution = null;
_.urfidx = 0;
_.useSeparator = false;
_.valid1 = 0;
_.valid2 = 0;

function init_0(safeStatusCallback){
  if (inited)
    return;
  $clinit_Util();
  safeStatusCallback("[0/9] Initializing Cubie Cube...");
  $clinit_CubieCube();
  FlipR2S = Array(2048);
  TwistR2S = Array(2187);
  EPermR2S = Array(40320);
  safeStatusCallback("[1/9] Initializing Sym2Raw...");
  initSym2Raw();
  safeStatusCallback("[2/9] Initializing CoordCube...");
  $clinit_CoordCube();
  safeStatusCallback("[3/9] Initializing Perm, Flip, and Twist Moves...");
  initCPermMove();
  initEPermMove();
  initFlipMove();
  initTwistMove();
  safeStatusCallback("[4/9] Initializing UDSlice...");
  EPermR2S = null;
  FlipR2S = null;
  TwistR2S = null;
  initUDSliceMove();
  initUDSliceConj();
  safeStatusCallback("[5/9] Initializing Mid3Move...");
  initMid3Move();
  initMid32MPerm();
  initCParity();
  safeStatusCallback("[6/9] Initializing Perms...");
  initMPermMove();
  initMPermConj();
  safeStatusCallback("[7/9] Initializing TwistFlipSlicePrun...");
  initTwistFlipSlicePrun(safeStatusCallback);
  safeStatusCallback("[8/9] Initializing MCEPermPrum...");
  initMCEPermPrun(safeStatusCallback);
  safeStatusCallback("[9/9] Done initializing 3x3x3...");
  inited = true;
}

function randomCube_0(){
  var cperm, eperm;
  do {
    eperm = scramblers.lib.randomInt.below(479001600);
    cperm = scramblers.lib.randomInt.below(40320);
  }
   while ((get8Parity(cperm) ^ get12Parity(eperm)) != 0);
  return toFaceCube(new CubieCube_2(cperm, scramblers.lib.randomInt.below(2187), eperm, scramblers.lib.randomInt.below(2048)));
}

var inited = false;
function $clinit_Util(){
  $clinit_Util = nullMethod;
  var i, j;
  cornerFacelet = [[8, 9, 20], [6, 18, 38], [0, 36, 47], [2, 45, 11], [29, 26, 15], [27, 44, 24], [33, 53, 42], [35, 17, 51]];
  edgeFacelet = [[5, 10], [7, 19], [3, 37], [1, 46], [32, 16], [28, 25], [30, 43], [34, 52], [23, 12], [21, 41], [50, 39], [48, 14]];
  cornerColor = [[0, 1, 2], [0, 2, 4], [0, 4, 5], [0, 5, 1], [3, 2, 1], [3, 4, 2], [3, 5, 4], [3, 1, 5]];
  edgeColor = [[0, 1], [0, 2], [0, 4], [0, 5], [3, 1], [3, 2], [3, 4], [3, 5], [2, 1], [2, 4], [5, 4], [5, 1]];
  Cnk = createArray(12, 12);
  fact = [1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880, 3628800, 39916800, 479001600];
  move2str = ['U ', 'U2', "U'", 'R ', 'R2', "R'", 'F ', 'F2', "F'", 'D ', 'D2', "D'", 'L ', 'L2', "L'", 'B ', 'B2', "B'"];
  ud2std = [0, 1, 2, 4, 7, 9, 10, 11, 13, 16];
  std2ud = Array(18);
  ckmv = createArray(19, 18);
  ckmv2 = createArray(11, 10);
  parity4 = Array(24);
  perm3 = [[11, 10, 9], [10, 11, 9], [11, 9, 10], [9, 11, 10], [10, 9, 11], [9, 10, 11]];
  for (i = 0; i < 10; ++i) {
    std2ud[ud2std[i]] = i;
  }
  for (i = 0; i < 18; ++i) {
    for (j = 0; j < 18; ++j) {
      ckmv[i][j] = ~~(i / 3) === ~~(j / 3) || ~~(i / 3) % 3 === ~~(j / 3) % 3 && i >= j;
    }
    ckmv[18][i] = false;
  }
  for (i = 0; i < 10; ++i) {
    for (j = 0; j < 10; ++j) {
      ckmv2[i][j] = ckmv[ud2std[i]][ud2std[j]];
    }
    ckmv2[10][i] = false;
  }
  for (i=0; i<12; ++i)
    for (j=0; j<12; ++j)
      Cnk[i][j] = 0;
  for (i = 0; i < 12; ++i) {
    Cnk[i][0] = 1;
    Cnk[i][i] = 1;
    for (j = 1; j < i; ++j) {
      Cnk[i][j] = Cnk[i - 1][j - 1] + Cnk[i - 1][j];
    }
  }
  for (i = 0; i < 24; ++i) {
    parity4[i] = get4Parity(i);
  }
}

function binarySearch(arr, key){
  var l_0, length_0, mid, r, val;
  length_0 = arr.length;
  if (key <= arr[length_0 - 1]) {
    l_0 = 0;
    r = length_0 - 1;
    while (l_0 <= r) {
      mid = l_0 + r >>> 1;
      val = arr[mid];
      if (key > val) {
        l_0 = mid + 1;
      }
       else if (key < val) {
        r = mid - 1;
      }
       else {
        return mid;
      }
    }
  }
  return 65535;
}

function bitCount(i){
  i = i - (i >>> 1 & 1431655765);
  i = (i & 858993459) + (i >>> 2 & 858993459);
  return i + (i >>> 8) + (i >>> 4) & 15;
}

function bitOdd(i){
  i = (i ^ i >>> 1);
  i = (i ^ i >>> 2);
  i = (i ^ i >>> 4);
  i = (i ^ i >>> 8);
  return (i & 1);
}

function get12Parity(idx){
  var i, p;
  p = 0;
  for (i = 10; i >= 0; --i) {
    p = p + idx % (12 - i);
    idx = ~~(idx / (12 - i));
  }
  p = (p & 1);
  return p;
}

function get4Parity(idx){
  var i, p;
  p = 0;
  for (i = 2; i >= 0; --i) {
    p = p + idx % (4 - i);
    idx = ~~(idx / (4 - i));
  }
  p = (p & 1);
  return p;
}

function get8Parity(idx){
  var i, p;
  p = 0;
  for (i = 6; i >= 0; --i) {
    p = p + idx % (8 - i);
    idx = ~~(idx / (8 - i));
  }
  p = (p & 1);
  return p;
}

function toCubieCube(f){
  var ccRet, col1, col2, i, j, ori;
  ccRet = new CubieCube_0;
  for (i = 0; i < 8; ++i)
    ccRet.cp[i] = 0;
  for (i = 0; i < 12; ++i)
    ccRet.ep[i] = 0;
  for (i = 0; i < 8; ++i) {
    for (ori = 0; ori < 3; ++ori)
      if (f[cornerFacelet[i][ori]] === 0 || f[cornerFacelet[i][ori]] === 3)
        break;
    col1 = f[cornerFacelet[i][(ori + 1) % 3]];
    col2 = f[cornerFacelet[i][(ori + 2) % 3]];
    for (j = 0; j < 8; ++j) {
      if (col1 === cornerColor[j][1] && col2 === cornerColor[j][2]) {
        ccRet.cp[i] = j;
        ccRet.co[i] = ori % 3;
        break;
      }
    }
  }
  for (i = 0; i < 12; ++i) {
    for (j = 0; j < 12; ++j) {
      if (f[edgeFacelet[i][0]] === edgeColor[j][0] && f[edgeFacelet[i][1]] === edgeColor[j][1]) {
        ccRet.ep[i] = j;
        ccRet.eo[i] = 0;
        break;
      }
      if (f[edgeFacelet[i][0]] === edgeColor[j][1] && f[edgeFacelet[i][1]] === edgeColor[j][0]) {
        ccRet.ep[i] = j;
        ccRet.eo[i] = 1;
        break;
      }
    }
  }
  return ccRet;
}

function toFaceCube(cc){
  var c, e, f, i, j, n, ori, ts;
  f = Array(54);
  ts = [85, 82, 70, 68, 76, 66];
  for (i = 0; i < 54; ++i) {
    f[i] = ts[~~(i / 9)];
  }
  for (c = 0; c < 8; ++c) {
    j = cc.cp[c];
    ori = cc.co[c];
    for (n = 0; n < 3; ++n)
      f[cornerFacelet[c][(n + ori) % 3]] = ts[cornerColor[j][n]];
  }
  for (e = 0; e < 12; ++e) {
    j = cc.ep[e];
    ori = cc.eo[e];
    for (n = 0; n < 2; ++n)
      f[edgeFacelet[e][(n + ori) % 2]] = ts[edgeColor[j][n]];
  }
  return String.fromCharCode.apply(null, f);
}

var Cnk, ckmv, ckmv2, cornerColor, cornerFacelet, edgeColor, edgeFacelet, fact, move2str, parity4, perm3, std2ud, ud2std;






  //"UF UR UB UL DF DR DB DL FR FL BR BL UFR URB UBL ULF DRF DFL DLB DBR URFLBD";
   //0  3  6  9  12 15 18 21 24 27 30 33 36  40  44  48  52  56  60  64  68

  var drawingStickerMap = [
    [   // U
      [ 0, 1, 2],
      [ 3, 4, 5],
      [ 6, 7, 8]
    ],[ // R
      [ 9,10,11],
      [12,13,14],
      [15,16,17]
    ],[ // F
      [18,19,20],
      [21,22,23],
      [24,25,26]
    ],[ // L
      [36,37,38],
      [39,40,41],
      [42,43,44]
    ],[ // B
      [45,46,47],
      [48,49,50],
      [51,52,53]
    ],[ // D
      [27,28,29],
      [30,31,32],
      [33,34,35]
    ]
  ];

  var border = 2;
  var width = 12;
  var gap = 4;
  //URFLBD
  var drawingCenters = [
    [border + width/2*9  + gap*1,  border + width/2*3         ],
    [border + width/2*15 + gap*2,  border + width/2*9  + gap*1],
    [border + width/2*9  + gap*1,  border + width/2*9  + gap*1],
    [border + width/2*3  + gap*0,  border + width/2*9  + gap*1],
    [border + width/2*21 + gap*3,  border + width/2*9  + gap*1],
    [border + width/2*9  + gap*1,  border + width/2*15 + gap*2],
  ];


  function colorGet(col){
    if (col==="r") return ("#FF0000");
    if (col==="o") return ("#FF8000");
    if (col==="b") return ("#0000FF");
    if (col==="g") return ("#00FF00");
    if (col==="y") return ("#FFFF00");
    if (col==="w") return ("#FFFFFF");
    if (col==="x") return ("#000000");
  }

  var scalePoint = function(w, h, ptIn) {

    var defaultWidth = border*2+width*12+gap*3;
    var defaultHeight = border*2+width*9+gap*2;
    
    var scale = Math.min(w/defaultWidth, h/defaultHeight);

    var x = Math.floor(ptIn[0]*scale + (w - (defaultWidth * scale))/2) + 0.5;
    var y = Math.floor(ptIn[1]*scale + (h - (defaultHeight * scale))/2) + 0.5;

    return [x, y];
  }

  function drawSquare(r, wi, h, cx, cy, w, fillColor) {

    var arrx = [cx - w, cx - w, cx + w, cx + w];
    var arry = [cy - w, cy + w, cy + w, cy - w];

    var pathString = "";
    for (var i = 0; i < arrx.length; i++) {
      var scaledPoint = scalePoint(wi, h, [arrx[i], arry[i]]);
      pathString += ((i===0) ? "M" : "L") + scaledPoint[0] + "," + scaledPoint[1];
    }
    pathString += "z";

    r.path(pathString).attr({fill: colorGet(fillColor), stroke: "#000"})
  }

  var drawScramble = function(parentElement, state, w, h) {

    var colorString = "wrgoby"; // UFRLBD
    var colorScheme = {
      "U": colorString[0],
      "R": colorString[1],
      "F": colorString[2],
      "L": colorString[3],
      "B": colorString[4],
      "D": colorString[5],
    };

    var r = Raphael(parentElement, w, h);

    var stateWithCenters = state + " URFLBD";

    for (var i = 0; i < 6; i++) {
      for (var j = 0; j < 3; j++) {
        for (var k = 0; k < 3; k++) {
          var face = stateWithCenters[drawingStickerMap[i][j][k]];
          drawSquare(r, w, h, drawingCenters[i][0] + (k-1)*width, drawingCenters[i][1] + (j-1)*width, width/2, colorScheme[face]);
        }
      }
    }

  };

  var initialized = false;
  var search;

  var ini = function(callback, _, statusCallback) {

    if (typeof statusCallback !== "function") {
      statusCallback = function() {};
    }

    if (!initialized) {
      search = new Search;
      init_0(statusCallback);
      initialized = true;
    }
    if(callback) setTimeout(callback, 0);
  };

  var getRandomScramble = function() {

    ini();

    var posit = randomCube_0();
    var solution = $solution(search, posit);

    return {
      state: posit,
      scramble_string: solution
    };
  }


  return {
    /* mark2 interface */
    version: "July 05, 2015",
    initialize: ini,
    setRandomSource: function() {console.log("setRandomSource is deprecated. It has no effect anymore.")},
    getRandomScramble: getRandomScramble,
    drawScramble: drawScramble,

    /* Other methods */
  };

})();

function randomScrambleWithOrientation() {
  var scr = scramblers["333"].getRandomScramble();
  console.log(scr.scramble_string)
  scr.scramble_string = scr.scramble_string + ["", " Rw", " Rw2", " Rw'", " Fw", " Fw'"][scramblers.lib.randomInt.below(6)] + ["", " Dw", " Dw2", " Dw'"][scramblers.lib.randomInt.below(4)];
  console.log(scr.scramble_string)
  return scr;
}

scramblers["333fm"] = scramblers["333"];
scramblers["333ft"] = scramblers["333"];
scramblers["333bf"] = scramblers["333"];
scramblers["333oh"] = scramblers["333"];

scramblers["333bf"] = {};
scramblers["333bf"].prototype = scramblers["333"];
scramblers["333bf"].getRandomScramble = randomScrambleWithOrientation;

scramblers["333mbf"] = scramblers["333bf"];

scramblers["clock"] = (function() {
  /*
  function prt(p){
    if(p<10) document.write(" ");
    document.write(p+" ");
  }
  function prtrndpin(){
    prtpin(Math.floor(Math.random()*2));
  }
  function prtpin(p){
    document.write(p===0?"U":"d");
  }
  */
  
  function getRandomScramble(){
    var posit = new Array (0,0,0,0,0,0,0,0,0,  0,0,0,0,0,0,0,0,0);
    var p = "dU";
    var pegs = [0, 0, 0, 0];
    var seq = new Array();
    var i,j;
    var moves = new Array();
    moves[0]=new Array(1,1,1,1,1,1,0,0,0,  -1,0,-1,0,0,0,0,0,0);
    moves[1]=new Array(0,1,1,0,1,1,0,1,1,  -1,0,0,0,0,0,-1,0,0);
    moves[2]=new Array(0,0,0,1,1,1,1,1,1,  0,0,0,0,0,0,-1,0,-1);
    moves[3]=new Array(1,1,0,1,1,0,1,1,0,  0,0,-1,0,0,0,0,0,-1);
  
    moves[4]=new Array(0,0,0,0,0,0,1,0,1,  0,0,0,-1,-1,-1,-1,-1,-1);
    moves[5]=new Array(1,0,0,0,0,0,1,0,0,  0,-1,-1,0,-1,-1,0,-1,-1);
    moves[6]=new Array(1,0,1,0,0,0,0,0,0,  -1,-1,-1,-1,-1,-1,0,0,0);
    moves[7]=new Array(0,0,1,0,0,0,0,0,1,  -1,-1,0,-1,-1,0,-1,-1,0);
  
    moves[ 8]=new Array(0,1,1,1,1,1,1,1,1,  -1,0,0,0,0,0,-1,0,-1);
    moves[ 9]=new Array(1,1,0,1,1,1,1,1,1,  0,0,-1,0,0,0,-1,0,-1);
    moves[10]=new Array(1,1,1,1,1,1,1,1,0,  -1,0,-1,0,0,0,0,0,-1);
    moves[11]=new Array(1,1,1,1,1,1,0,1,1,  -1,0,-1,0,0,0,-1,0,0);
  
    moves[12]=new Array(1,1,1,1,1,1,1,1,1,  -1,0,-1,0,0,0,-1,0,-1);
    moves[13]=new Array(1,0,1,0,0,0,1,0,1,  -1,-1,-1,-1,-1,-1,-1,-1,-1);
  
    for( i=0; i<14; i++){
      seq[i] = scramblers.lib.randomInt.below(12)-5;
    }
  
    for( i=0; i<4; i++){
      pegs[i] = scramblers.lib.randomInt.below(2);
    }
  
    for( i=0; i<14; i++){
      for( j=0; j<18; j++){
        posit[j]+=seq[i]*moves[i][j];
      }
    }
    for( j=0; j<18; j++){
      posit[j]%=12;
      while( posit[j]<=0 ) posit[j]+=12;
    }
  
  	var scramble = "";

  	function turns(top, bot, tUL, tUR, tDL, tDR) {
		var topWithChanges = top.replace(/\<\./g, "<span class='peg_changed'>").replace(/\<\_/g, "<span class='peg_same___'>").replace(/\>/g, "</span>");
		var botWithChanges = bot.replace(/\<\./g, "<span class='peg_changed'>").replace(/\<\_/g, "<span class='peg_same___'>").replace(/\>/g, "</span>");

  		scramble += "<div class='clock_outer'><div class='clock_inner'>";
  			scramble += tUL + " <span class='clock_pegs'>" + topWithChanges + "</span>&nbsp;" + tUR + "<br>";
  			scramble += tDL + " <span class='clock_pegs'>" + botWithChanges + "</span>&nbsp;" + tDR;
  		scramble += "</div></div>";
  	}

  	function turn_name(turn, amount) {
  		var suffix;
  		if (amount === 0) {
  			return "&nbsp;&nbsp;&nbsp;";
  		}
  		else if (amount === 1) {
  			suffix = "</span>&nbsp;&nbsp;";
  		}
  		else if (amount === -1) {
  			suffix = "'</span>&nbsp;&nbsp;";
  		}
  		else if (amount >= 0) {
  			suffix = "" + amount + "</span>&nbsp;";
  		}
  		else {
  			suffix = "" + (-amount) + "'</span>";
  		}
  		return "<span class='clock_turn'>" + turn + suffix;
  	}

/*
    turns("<_U><_U>", "<_d><_d>", "&nbsp;&nbsp;&nbsp;"  , turn_name("U", seq[0]) , "&nbsp;&nbsp;&nbsp;", turn_name("d", seq[4]));
    turns("<.d><_U>", "<_d><.U>", turn_name("d", seq[5]), turn_name("U", seq[1]) , "&nbsp;&nbsp;&nbsp;", "&nbsp;&nbsp;&nbsp;"  );
    turns("<_d><.d>", "<.U><_U>", "&nbsp;&nbsp;&nbsp;"  , turn_name("d", seq[6]) , "&nbsp;&nbsp;&nbsp;", turn_name("U", seq[2]));
    turns("<.U><_d>", "<_U><.d>", turn_name("U", seq[3]), turn_name("d", seq[7]) , "&nbsp;&nbsp;&nbsp;", "&nbsp;&nbsp;&nbsp;"  );
    turns("<.d><.U>", "<_U><.U>", "&nbsp;&nbsp;&nbsp;"  , turn_name("U", seq[8]) , "&nbsp;&nbsp;&nbsp;", "&nbsp;&nbsp;&nbsp;"  );
    turns("<.U><.d>", "<_U><_U>", turn_name("U", seq[9]), "&nbsp;&nbsp;&nbsp;"   , "&nbsp;&nbsp;&nbsp;", "&nbsp;&nbsp;&nbsp;"  );
    turns("<_U><.U>", "<_U><.d>", "&nbsp;&nbsp;&nbsp;"  , turn_name("U", seq[10]), "&nbsp;&nbsp;&nbsp;", "&nbsp;&nbsp;&nbsp;"  );
    turns("<_U><_U>", "<.d><.U>", "&nbsp;&nbsp;&nbsp;"  , turn_name("U", seq[11]), "&nbsp;&nbsp;&nbsp;", "&nbsp;&nbsp;&nbsp;"  );
    turns("<_U><_U>", "<.U><_U>", "&nbsp;&nbsp;&nbsp;"  , turn_name("U", seq[12]), "&nbsp;&nbsp;&nbsp;", "&nbsp;&nbsp;&nbsp;"  );
    turns("<.d><.d>", "<.d><.d>", "&nbsp;&nbsp;&nbsp;"  , turn_name("d", seq[13]), "&nbsp;&nbsp;&nbsp;", "&nbsp;&nbsp;&nbsp;"  )
    */

    turns("<_U><_U>", "<_d><_d>", ""  , turn_name("U", seq[0]) , "", turn_name("d", seq[4]) );
    turns("<.d><_U>", "<_d><.U>", ""  , turn_name("U", seq[1]) , "", turn_name("d", seq[5]) );
    turns("<_d><.d>", "<.U><_U>", ""  , turn_name("U", seq[2]) , "", turn_name("d", seq[6]) );
    turns("<.U><_d>", "<_U><.d>", ""  , turn_name("U", seq[3]) , "", turn_name("d", seq[7]) );
    turns("<.d><.U>", "<_U><.U>", ""  , turn_name("U", seq[8]) , "", "&nbsp;&nbsp;&nbsp;"   );
    turns("<.U><.d>", "<_U><_U>", ""  , turn_name("U", seq[9]) , "", "&nbsp;&nbsp;&nbsp;"   );
    turns("<_U><.U>", "<_U><.d>", ""  , turn_name("U", seq[10]), "", "&nbsp;&nbsp;&nbsp;"   );
    turns("<_U><_U>", "<.d><.U>", ""  , turn_name("U", seq[11]), "", "&nbsp;&nbsp;&nbsp;"   );
    turns("<_U><_U>", "<.U><_U>", ""  , turn_name("U", seq[12]), "", "&nbsp;&nbsp;&nbsp;"   );
    turns("<.d><.d>", "<.d><_d>", ""  , turn_name("d", seq[13]), "", "&nbsp;&nbsp;&nbsp;"   );
    turns(p[pegs[0]] + p[pegs[1]], p[pegs[2]] + p[pegs[3]], ""  , ""   , "", "");

    var scrambleString = "";

    var turnToString = function(turn, amount) {
      var suffix;
      if (amount === 0) {
        return "";
      }
      else if (amount === 1) {
        suffix = "";
      }
      else if (amount === -1) {
        suffix = "'";
      }
      else if (amount >= 0) {
        suffix = "" + amount + "";
      }
      else {
        suffix = "" + (-amount) + "'";
      }
      return " " + turn + suffix;
    }
    
    var addToScrambleString = function(pegs, UAmount, dAmount) {
      scrambleString += "[" + pegs + "]" + turnToString("U", UAmount) + turnToString("d", dAmount) +" ";
    }

    addToScrambleString("UU/dd", seq[0], seq[4]);
    addToScrambleString("dU/dU", seq[1], seq[5]);
    addToScrambleString("dd/UU", seq[2], seq[6]);
    addToScrambleString("Ud/Ud", seq[3], seq[7]);
    addToScrambleString("dU/UU", seq[8], 0);
    addToScrambleString("Ud/UU", seq[9], 0);
    addToScrambleString("UU/Ud", seq[10], 0);
    addToScrambleString("UU/dU", seq[11], 0);
    addToScrambleString("UU/UU", seq[12], 0);
    addToScrambleString("dd/dd", 0, seq[13]);
    addToScrambleString(p[pegs[0]] + p[pegs[1]] + "/" + p[pegs[2]] + p[pegs[3]], 0, 0);

    /*
    for( i=0; i<9; i++){
      prt(posit[i]);
      if( (i%3)===2 ) scramble += "\n";
    }
    scramble += "Back:\n";
    for( i=0; i<9; i++){
      prt(posit[i+9]);
      if( (i%3)===2 ) scramble += "\n";
    }
    */

    return {
      state: {dials: posit, pegs: pegs},
      scramble_string: scrambleString
    };
  }

  var initializeFull = function(continuation, _) {
    
    if (continuation) {
      setTimeout(continuation, 0);
    }
  };

  var scalePoint = function(w, h, ptIn) {
    
    var defaultWidth = 220;
    var defaultHeight = 110;

    var scale = Math.min(w/defaultWidth, h/defaultHeight);

    var x = Math.floor(ptIn[0]*scale + (w - (defaultWidth * scale))/2) + 0.5;
    var y = Math.floor(ptIn[1]*scale + (h - (defaultHeight * scale))/2) + 0.5;

    return [x, y, scale];
  }

  function drawPolygon(r, w, h, fillColor, rrx, arry) {

    var pathString = "";
    for (var i = 0; i < arrx.length; i++) {
      var scaledPoint = scalePoint(w, h, [arrx[i], arry[i]]);
      pathString += ((i===0) ? "M" : "L") + scaledPoint[0] + "," + scaledPoint[1];
    }
    pathString += "z";

    return r.path(pathString).attr({fill: fillColor, stroke: "none"});
  }

  var drawCircle = function(r, w, h, cx, cy, rad, fillColor, stroke, stroke_width) {
    var scaledPoint = scalePoint(w, h, [cx, cy]);

    return r.circle(scaledPoint[0], scaledPoint[1], scaledPoint[2]*rad).attr({fill: fillColor, stroke: stroke, "stroke-width": stroke_width});
  }

  Math.TAU = Math.PI * 2;
  var arrx, arry;

  function drawClockFace(r, w, h, cx, cy, face_fill, hour) {

    var cxScaled = scalePoint(w, h, [cx, cy])[0];
    var cyScaled = scalePoint(w, h, [cx, cy])[1];

    drawCircle(r, w, h, cx, cy, 13, face_fill, "none", 0);
    drawCircle(r, w, h, cx, cy, 4, "#F00", "none", 0);

  	var c = Math.cos(hour/12*Math.TAU);
  	var s = Math.sin(hour/12*Math.TAU);

  	arrx = [cx , cx + 4	, cx - 4];
  	arry = [cy - 12, cy - 1, cy - 1];
  	
  	var hand = drawPolygon(r, w, h, "#F00", arrx, arry);

  	hand.rotate(30*hour, cxScaled, cyScaled);


    drawCircle(r, w, h, cx, cy, 2, "#FF0", "none", 0);

  	arrx = [cx, cx + 2, cx - 2];
  	arry = [cy - 8 , cy - 0.5, cy - 0.5];
  	
  	var handInner = drawPolygon(r, w, h, "#FF0", arrx, arry);

  	handInner.rotate(30*hour, cxScaled, cyScaled);

  }

  function drawPeg(r, w, h, cx, cy, pegValue) {

  	var pegRadius = 6;
  	var color;
  	if (pegValue === 1) {
  		color = "#FF0";
  	}
  	else {
  		color = "#440";
  	}

    drawCircle(r, w, h, cx, cy, pegRadius, color, "#000", "1px");
  }

  var drawScramble = function(parentElement, state, w, h) {

  	var clock_radius = 52;

  	var face_dist = 30;
  	var face_background_dist = 29;

  	var face_radius = 15;
  	var face_background_radius = 18;

    var r = Raphael(parentElement, w, h);

    var drawSideBackground = function(cx, cy, fill, stroke, stroke_width) {

      drawCircle(r, w, h, cx, cy, clock_radius, fill, stroke, stroke_width);

  		for (var x = cx - face_background_dist; x <= cx + face_background_dist; x += face_background_dist) {
  			for (var y = cy - face_background_dist; y <= cy + face_background_dist; y += face_background_dist) {
          drawCircle(r, w, h, x, y, face_background_radius, fill, stroke, stroke_width);
  			}
  		}
    }

    var cx = 55;
    var cy = 55;

    drawSideBackground(cx, cy, "none", "#000", "3px");
    drawSideBackground(cx, cy, "#36F", "none");

    var i = 0;
  	for (var y = cy - face_dist; y <= cy + face_dist; y += face_dist) {
  		for (var x = cx - face_dist; x <= cx + face_dist; x += face_dist) {
  			drawClockFace(r, w, h, x, y, "#8AF", state.dials[i]);
  			//console.log(state.dials[i]);
  			i++;
  		}
  	}
  	
  	drawPeg(r, w, h, cx - face_dist/2, cy - face_dist/2, state.pegs[0]);
  	drawPeg(r, w, h, cx + face_dist/2, cy - face_dist/2, state.pegs[1]);
  	drawPeg(r, w, h, cx - face_dist/2, cy + face_dist/2, state.pegs[2]);
  	drawPeg(r, w, h, cx + face_dist/2, cy + face_dist/2, state.pegs[3]);
  	


      var cx = 165;
      var cy = 55;

      drawSideBackground(cx, cy, "#none", "#000", 3);
      drawSideBackground(cx, cy, "#8AF", "none");

      var i = 9;
  	for (y = cy - face_dist; y <= cy + face_dist; y += face_dist) {
  		for (x = cx - face_dist; x <= cx + face_dist; x += face_dist) {
  			drawClockFace(r, w, h, x, y, "#36F",  state.dials[i]);
  			//console.log(state.dials[i]);
  			i++;
  		}
  	}
  	
  	drawPeg(r, w, h, cx + face_dist/2, cy - face_dist/2, 1-state.pegs[0]);
  	drawPeg(r, w, h, cx - face_dist/2, cy - face_dist/2, 1-state.pegs[1]);
  	drawPeg(r, w, h, cx + face_dist/2, cy + face_dist/2, 1-state.pegs[2]);
  	drawPeg(r, w, h, cx - face_dist/2, cy + face_dist/2, 1-state.pegs[3]);

  };

  return {
    /* mark2 interface */
    version: "July 05, 2015",
    initialize: initializeFull,
    setRandomSource: function() {console.log("setRandomSource is deprecated. It has no effect anymore.")},
    getRandomScramble: getRandomScramble,
    drawScramble: drawScramble,

    /* Other methods */
  };
})();
/*

Program by Clément Gallet, based on earlier work by Jaap Scherphuis. Idea by Stefan Pochmann.

## Notation:
D means all layers below the U face together in one move.
R means all layers right from the L face together in one move.
++ means 2/5 move clockwise (144 degrees), -- means 2/5 move counterclockwise (-144 degrees).
U is the regular move of the U face, according to standard cube notation.
<br>
 */
scramblers["minx"] = (function() {
 
  var linelen=10;
  var linenbr=7;
  
  function parse() {
  	/*
  	var urlquery=location.href.split("?")
  	if(urlquery.length>1){
  		var urlterms=urlquery[1].split("&")
  		for( var i=0; i<urlterms.length; i++){
  			var urllr=urlterms[i].split("=");
  			if(urllr[0]==="ll") {
  				if(urllr[1]-0 >= 1 ) linelen=urllr[1]-0;
  			} else if(urllr[0]==="ln"){
  				if(urllr[1]-0 >= 1 ) linenbr=urllr[1]-0;
  			} else if(urllr[0]==="num"){
  				if(urllr[1]-0 >= 1 ) numcub=urllr[1]-0;
  			}
  		}
  	}
  	*/
  }


  var permU = [4, 0, 1, 2, 3, 9, 5, 6, 7, 8, 10, 11, 12, 13, 58, 59, 16, 17, 18, 63, 20, 21, 22, 23, 24, 14, 15, 27, 28, 29, 19, 31, 32, 33, 34, 35, 25, 26, 38, 39, 40, 30, 42, 43, 44, 45, 46, 36, 37, 49, 50, 51, 41, 53, 54, 55, 56, 57, 47, 48, 60, 61, 62, 52, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131];
  var permUi = [1, 2, 3, 4, 0, 6, 7, 8, 9, 5, 10, 11, 12, 13, 25, 26, 16, 17, 18, 30, 20, 21, 22, 23, 24, 36, 37, 27, 28, 29, 41, 31, 32, 33, 34, 35, 47, 48, 38, 39, 40, 52, 42, 43, 44, 45, 46, 58, 59, 49, 50, 51, 63, 53, 54, 55, 56, 57, 14, 15, 60, 61, 62, 19, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131];
  var permD2 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 33, 34, 35, 14, 15, 38, 39, 40, 19, 42, 43, 44, 45, 46, 25, 26, 49, 50, 51, 30, 53, 54, 55, 56, 57, 36, 37, 60, 61, 62, 41, 64, 65, 11, 12, 13, 47, 48, 16, 17, 18, 52, 20, 21, 22, 23, 24, 58, 59, 27, 28, 29, 63, 31, 32, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 124, 125, 121, 122, 123, 129, 130, 126, 127, 128, 131];
  var permD2i = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 44, 45, 46, 14, 15, 49, 50, 51, 19, 53, 54, 55, 56, 57, 25, 26, 60, 61, 62, 30, 64, 65, 11, 12, 13, 36, 37, 16, 17, 18, 41, 20, 21, 22, 23, 24, 47, 48, 27, 28, 29, 52, 31, 32, 33, 34, 35, 58, 59, 38, 39, 40, 63, 42, 43, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 123, 124, 125, 121, 122, 128, 129, 130, 126, 127, 131];
  var permR2 = [81, 77, 78, 3, 4, 86, 82, 83, 8, 85, 87, 122, 123, 124, 125, 121, 127, 128, 129, 130, 126, 131, 89, 90, 24, 25, 88, 94, 95, 29, 97, 93, 98, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 26, 22, 23, 48, 30, 31, 27, 28, 53, 32, 69, 70, 66, 67, 68, 74, 75, 71, 72, 73, 76, 101, 102, 103, 99, 100, 106, 107, 108, 104, 105, 109, 46, 47, 79, 80, 45, 51, 52, 84, 49, 50, 54, 0, 1, 2, 91, 92, 5, 6, 7, 96, 9, 10, 15, 11, 12, 13, 14, 20, 16, 17, 18, 19, 21, 113, 114, 110, 111, 112, 118, 119, 115, 116, 117, 120, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65];
  var permR2i = [88, 89, 90, 3, 4, 93, 94, 95, 8, 97, 98, 100, 101, 102, 103, 99, 105, 106, 107, 108, 104, 109, 46, 47, 24, 25, 45, 51, 52, 29, 49, 50, 54, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 81, 77, 78, 48, 85, 86, 82, 83, 53, 87, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 57, 58, 59, 55, 56, 62, 63, 64, 60, 61, 65, 1, 2, 79, 80, 0, 6, 7, 84, 9, 5, 10, 26, 22, 23, 91, 92, 31, 27, 28, 96, 30, 32, 69, 70, 66, 67, 68, 74, 75, 71, 72, 73, 76, 112, 113, 114, 110, 111, 117, 118, 119, 115, 116, 120, 15, 11, 12, 13, 14, 20, 16, 17, 18, 19, 21];

   function applyMove(state, movePerm) {
   	 var stateNew = [];
  	 for (var i = 0; i < 11*12; i++) {
  		stateNew[i] = state[movePerm[i]];
  	 }
  	 return stateNew;
   }
  
  function getRandomScramble(){

	var i;
	var seq =new Array();
	for(i=0; i<linenbr*linelen; i++){
		seq[i]=scramblers.lib.randomInt.below(2);
	}

  	var s="",i,j;

  	var state = [];
  	for (i = 0; i < 12; i++) {
  		for (j = 0; j < 11; j++) {
  			state[i*11+j] = i;
  		}
  	}

  	for(j=0; j<linenbr; j++){
  		for(i=0; i<linelen; i++){
  			if (i%2)
  			{
  				if (seq[j*linelen + i]) {
	  				s+="D++ ";
	  				state = applyMove(state, permD2);
	  			}
  				else {
	  				s+="D-- ";
	  				state = applyMove(state, permD2i);
	  			}
  			}
  			else
  			{
  				if (seq[j*linelen + i]) {
	  				s+="R++ ";
	  				state = applyMove(state, permR2);
	  			}
  				else {
	  				s+="R-- ";
	  				state = applyMove(state, permR2i);
  				}
  			}
  		}
  		if (seq[(j+1)*linelen - 1]) {
	  		s+="U";
	  		state = applyMove(state, permU);
	  	}
  		else {
	  		s+="U'";
			state = applyMove(state, permUi);
	  	}
  		if (j < linenbr-1) {
  			s += "<br>";
  		}
  	}

    return {
      state: state,
      scramble_string: s
    };
  }
  
  var initializeFull = function(continuation, _) {
    
    if (continuation) {
      setTimeout(continuation, 0);
    }
  };


  /*
   * Drawing code.
   * Messy, but it works.
   */
  var edgeFrac = (1+Math.sqrt(5))/4;
  var centerFrac = 0.5;

  Math.TAU = Math.PI * 2;

  var s18 = function(i) {return Math.sin(Math.TAU*i/20);};
  var c18 = function(i) {return Math.cos(Math.TAU*i/20);};

  var colors = [
  	"#FFF",
  	"#008",
  	"#080",
  	"#0FF",
  	"#822",
  	"#8AF",

  	"#F00",
  	"#00F",
  	"#F0F",
  	"#0F0",
  	"#F80",
  	"#FF0",

  ];

	function drawPolygon(r, fillColor, arrx, arry) {

	  var pathString = "";
	  for (var i = 0; i < arrx.length; i++) {
	    pathString += ((i===0) ? "M" : "L") + arrx[i] + "," + arry[i];
	  }
	  pathString += "z";

	  return r.path(pathString).attr({fill: fillColor, stroke: "#000"});
	}

  var drawScramble = function(parentElement, state, w, h) {



    var defaultWidth = 350;
    var defaultHeight = 180;

    var scale = Math.min(w/defaultWidth, h/defaultHeight);

    var dx = (w - (defaultWidth * scale))/2;
    var dy = (h - (defaultHeight * scale))/2;


    // Change this if the SVG element is too large.
    
    var majorR = 36*scale;
    var minorR = majorR * edgeFrac

    var pentR = minorR*2;

    var cx1 = 92*scale + dx;
    var cy1 = 80*scale + dy;

    var cx2 = cx1 + c18(1)*3*pentR;
    var cy2 = cy1 + s18(1)*1*pentR;

    var trans = [
      [0, cx1, cy1, 0, 0],
      [36, cx1, cy1, 1, 1],
      [36+72*1, cx1, cy1, 1, 5],
      [36+72*2, cx1, cy1, 1, 9],
      [36+72*3, cx1, cy1, 1, 13],
      [36+72*4, cx1, cy1, 1, 17],
      [0, cx2, cy2, 1, 7],
      [-72*1, cx2, cy2, 1, 3],
      [-72*2, cx2, cy2, 1, 19],
      [-72*3, cx2, cy2, 1, 15],
      [-72*4, cx2, cy2, 1, 11],
      [36+72*2, cx2, cy2, 0, 0]
    ];

    var r = Raphael(parentElement, w, h);

    //console.log(state);

    var index = 0;

    for (var side = 0; side < 12; side++) {

	    for (var i = 0; i < 5; i++) {

	    	var dx = majorR*(1-centerFrac)/2/Math.tan(Math.TAU/10);
	    	var arrx = [0, dx, 0, -dx];
	    	var arry = [-majorR,- majorR*(1+centerFrac)/2, -majorR*centerFrac, -majorR*(1+centerFrac)/2]

	    	var p = drawPolygon(r, colors[state[index++]], arrx, arry);
	    	//var p = r.circle(0, - circR, circRadius);
	    	//p.attr({fill: colors[state[index++]], stroke: "#000"});
	    	p.translate(trans[side][1] + trans[side][3]*c18(trans[side][4])*pentR, trans[side][2] + trans[side][3]*s18(trans[side][4])*pentR);
			p.rotate(72*i + trans[side][0], 0, 0);
	    }

	    for (var i = 0; i < 5; i++) {

	    	var sx = Math.tan(Math.TAU/10);
	    	var arrx = [c18(-1)*majorR - dx, dx, 0, s18(4)*centerFrac*majorR];
	    	var arry = [s18(-1)*majorR - majorR + majorR*(1+centerFrac)/2,- majorR*(1+centerFrac)/2, -majorR*centerFrac, -c18(4)*centerFrac*majorR]

	    	var p = drawPolygon(r, colors[state[index++]], arrx, arry);
	    	p.translate(trans[side][1] + trans[side][3]*c18(trans[side][4])*pentR, trans[side][2] + trans[side][3]*s18(trans[side][4])*pentR);
	    	p.rotate(72*i + trans[side][0], 0, 0);
	    }

	    var arrx = [s18(0)*centerFrac*majorR, s18(4)*centerFrac*majorR, s18(8)*centerFrac*majorR, s18(12)*centerFrac*majorR, s18(16)*centerFrac*majorR];
	    var arry = [-c18(0)*centerFrac*majorR, -c18(4)*centerFrac*majorR, -c18(8)*centerFrac*majorR, -c18(12)*centerFrac*majorR, -c18(16)*centerFrac*majorR];

	    var p = drawPolygon(r, colors[state[index++]], arrx, arry);
	    p.translate(trans[side][1] + trans[side][3]*c18(trans[side][4])*pentR, trans[side][2] + trans[side][3]*s18(trans[side][4])*pentR);
	    p.rotate(trans[side][0], 0, 0);
	}

	//console.log(index);

  };

  
  return {
    /* mark2 interface */
    version: "July 05, 2015",
    initialize: initializeFull,
    setRandomSource: function() {console.log("setRandomSource is deprecated. It has no effect anymore.")},
    getRandomScramble: getRandomScramble,
    drawScramble: drawScramble,

    /* Other methods */
  };
})();
/*

scramble_NNN.js

NxNxN Scramble Generator in Javascript.

Code taken from the official WCA scrambler.
Ported by Lucas Garron, November 24, 2011.

 */

// We use an anonymous wrapper (and call it immediately) in order to avoid leaving the generator hanging around in the top-level scope.
(function(){

  var generate_NNN_scrambler = function(size, seqlen, mult) {
      return (function () {
      // Default settings
      //var size=3;
      //var seqlen=30;
      var numcub=1;
      //var mult=false;
      var cubeorient=false;
      var colorString = "yobwrg";  //In dlburf order. May use any colours in colorList below
       
      // list of available colours
      var colorList=new Array(
        'y', "yellow.jpg", "yellow",
        'b', "blue.jpg",   "blue",
        'r', "red.jpg",    "red",
        'w', "white.jpg",  "white",
        'g', "green.jpg",  "green",
        'o', "orange.jpg", "orange",
        'p', "purple.jpg", "purple",
        '0', "grey.jpg",   "grey"      // used for unrecognised letters, or when zero used.
      );
       
      var colors=new Array(); //stores colours used
      var seq=new Array();  // move sequences
      var posit = new Array();  // facelet array
      var flat2posit; //lookup table for drawing cube
      var colorPerm = new Array(); //dlburf face colour permutation for each cube orientation
      colorPerm[ 0] = new Array(0,1,2,3,4,5);
      colorPerm[ 1] = new Array(0,2,4,3,5,1);
      colorPerm[ 2] = new Array(0,4,5,3,1,2);
      colorPerm[ 3] = new Array(0,5,1,3,2,4);
      colorPerm[ 4] = new Array(1,0,5,4,3,2);
      colorPerm[ 5] = new Array(1,2,0,4,5,3);
      colorPerm[ 6] = new Array(1,3,2,4,0,5);
      colorPerm[ 7] = new Array(1,5,3,4,2,0);
      colorPerm[ 8] = new Array(2,0,1,5,3,4);
      colorPerm[ 9] = new Array(2,1,3,5,4,0);
      colorPerm[10] = new Array(2,3,4,5,0,1);
      colorPerm[11] = new Array(2,4,0,5,1,3);
      colorPerm[12] = new Array(3,1,5,0,4,2);
      colorPerm[13] = new Array(3,2,1,0,5,4);
      colorPerm[14] = new Array(3,4,2,0,1,5);
      colorPerm[15] = new Array(3,5,4,0,2,1);
      colorPerm[16] = new Array(4,0,2,1,3,5);
      colorPerm[17] = new Array(4,2,3,1,5,0);
      colorPerm[18] = new Array(4,3,5,1,0,2);
      colorPerm[19] = new Array(4,5,0,1,2,3);
      colorPerm[20] = new Array(5,0,4,2,3,1);
      colorPerm[21] = new Array(5,1,0,2,4,3);
      colorPerm[22] = new Array(5,3,1,2,0,4);
      colorPerm[23] = new Array(5,4,3,2,1,0);
       
      // get all the form settings from the url parameters
      function parse() {

        /*
        var s="";
        var urlquery=location.href.split("?")
        if(urlquery.length>1){
          var urlterms=urlquery[1].split("&")
          for( var i=0; i<urlterms.length; i++){
            var urllr=urlterms[i].split("=");
            if(urllr[0]==="size") {
              if(urllr[1]-0 >= 2 ) size=urllr[1]-0;
            } else if(urllr[0]==="len") {
              if(urllr[1]-0 >= 1 ) seqlen=urllr[1]-0;
            } else if(urllr[0]==="num"){
              if(urllr[1]-0 >= 1 ) numcub=urllr[1]-0;
            } else if(urllr[0]==="multi") {
              mult=(urllr[1]==="on");
            } else if(urllr[0]==="cubori") {
              cubeorient=(urllr[1]==="on");
            } else if(urllr[0]==="col") {
              if(urllr[1].length===6) colorString = urllr[1];
            }
          }
        }*/

        // build lookup table
        var i, j;
        flat2posit=new Array(12*size*size);
        for(i=0; i<flat2posit.length; i++) flat2posit[i]=-1;
        for(i=0; i<size; i++){
          for(j=0; j<size; j++){
            flat2posit[4*size*(3*size-i-1)+  size+j  ]=        i *size+j; //D
            flat2posit[4*size*(  size+i  )+  size-j-1]=(  size+i)*size+j; //L
            flat2posit[4*size*(  size+i  )+4*size-j-1]=(2*size+i)*size+j; //B
            flat2posit[4*size*(       i  )+  size+j  ]=(3*size+i)*size+j; //U
            flat2posit[4*size*(  size+i  )+2*size+j  ]=(4*size+i)*size+j; //R
            flat2posit[4*size*(  size+i  )+  size+j  ]=(5*size+i)*size+j; //F
          }
        }
       
        /*
               19                32
           16           48           35
               31   60      51   44
           28     80    63    67     47
                      83  64
                  92          79
                      95  76
         
                         0
                     12     3
                        15
        */
       
        // expand colour string into 6 actual html color names
        for(var k=0; k<6; k++){
          colors[k]=colorList.length-3; // gray
          for( var i=0; i<colorList.length; i+=3 ){
            if( colorString.charAt(k)===colorList[i] ){
              colors[k]=i;
              break;
            }
          }
        }
      }
       
      // append set of moves along an axis to current sequence in order
      function appendmoves( sq, axsl, tl, la ){
        for( var sl=0; sl<tl; sl++){  // for each move type
          if( axsl[sl] ){       // if it occurs
            var q=axsl[sl]-1;
       
            // get semi-axis of this move
            var sa = la;
            var m = sl;
            if(sl+sl+1>=tl){ // if on rear half of this axis
              sa+=3; // get semi-axis (i.e. face of the move)
              m=tl-1-m; // slice number counting from that face
              q=2-q; // opposite direction when looking at that face
            }
            // store move
            sq[sq.length]=(m*6+sa)*4+q;
          }
        }
      }
       
      // generate sequence of scambles
      function scramble(){
        //tl=number of allowed moves (twistable layers) on axis -- middle layer ignored
        var tl=size;
        if(mult || (size&1)!=0 ) tl--;
        //set up bookkeeping
        var axsl=new Array(tl);    // movement of each slice/movetype on this axis
        var axam=new Array(0,0,0); // number of slices moved each amount
        var la; // last axis moved
       
        // for each cube scramble
        for( var n=0; n<numcub; n++){
          // initialise this scramble
          la=-1;
          seq[n]=new Array(); // moves generated so far
          // reset slice/direction counters
          for( var i=0; i<tl; i++) axsl[i]=0;
          axam[0]=axam[1]=axam[2]=0;
          var moved = 0;
       
          // while generated sequence not long enough
          while( seq[n].length + moved <seqlen ){
       
            var ax, sl, q;
            do{
              do{
                // choose a random axis
                ax=scramblers.lib.randomInt.below(3);
                // choose a random move type on that axis
                sl=scramblers.lib.randomInt.below(tl);
                // choose random amount
                q=scramblers.lib.randomInt.below(3);
              }while( ax===la && axsl[sl]!=0 );    // loop until have found an unused movetype
            }while( ax===la          // loop while move is reducible: reductions only if on same axis as previous moves
                && !mult        // multislice moves have no reductions so always ok
                && tl===size       // only even-sized cubes have reductions (odds have middle layer as reference)
                && (
                  2*axam[0]===tl ||  // reduction if already have half the slices move in same direction
                  2*axam[1]===tl ||
                  2*axam[2]===tl ||
                  (
                    2*(axam[q]+1)===tl // reduction if move makes exactly half the slices moved in same direction and
                    &&
                    axam[0]+axam[1]+axam[2]-axam[q] > 0 // some other slice also moved
                  )
                  )
            );
       
            // if now on different axis, dump cached moves from old axis
            if( ax!=la ) {
              appendmoves( seq[n], axsl, tl, la );
              // reset slice/direction counters
              for( var i=0; i<tl; i++) axsl[i]=0;
              axam[0]=axam[1]=axam[2]=0;
              moved = 0;
              // remember new axis
              la=ax;
            }
       
            // adjust counters for this move
            axam[q]++;// adjust direction count
            moved++;
            axsl[sl]=q+1;// mark the slice has moved amount
       
          }
          // dump the last few moves
          appendmoves( seq[n], axsl, tl, la );
       
          // do a random cube orientation if necessary
          seq[n][seq[n].length]= cubeorient ? scramblers.lib.randomInt.below(24) : 0;
        }
       
      }

      var cubeSize = size;

      var border = 2;
      var width = 40/cubeSize;
      var gap = 4;

      function colorGet(col){
        if (col==="r") return ("#FF0000");
        if (col==="o") return ("#FF8000");
        if (col==="b") return ("#0000FF");
        if (col==="g") return ("#00FF00");
        if (col==="y") return ("#FFFF00");
        if (col==="w") return ("#FFFFFF");
        if (col==="x") return ("#000000");
      }

      var scalePoint = function(w, h, ptIn) {
        
        var defaultWidth = border*2+width*4*cubeSize+gap*3;
        var defaultHeight = border*2+width*3*cubeSize+gap*2;

        var scale = Math.min(w/defaultWidth, h/defaultHeight);

        var x = Math.floor(ptIn[0]*scale + (w - (defaultWidth * scale))/2) + 0.5;
        var y = Math.floor(ptIn[1]*scale + (h - (defaultHeight * scale))/2) + 0.5;

        return [x, y];
      }

      function drawSquare(r, canvasWidth, canvasHeight, cx, cy, w, fillColor) {

        var arrx = [cx - w, cx - w, cx + w, cx + w];
        var arry = [cy - w, cy + w, cy + w, cy - w];

        var pathString = "";
        for (var i = 0; i < arrx.length; i++) {
          var scaledPoint = scalePoint(canvasWidth, canvasHeight, [arrx[i], arry[i]]);
          pathString += ((i===0) ? "M" : "L") + scaledPoint[0] + "," + scaledPoint[1];
        }
        pathString += "z";
          
        r.path(pathString).attr({fill: colorGet(fillColor), stroke: "#000"})
      }

      var drawScramble = function(parentElement, state, w, h) {

        initializeDrawing();

        var colorString = "wrgoby"; // UFRLBD

        var r = Raphael(parentElement, w, h);

        var s="",i,f,d=0,q;
        var ori = 0;
        d=0;
        s="<table border=0 cellpadding=0 cellspacing=0>";
        for(i=0;i<3*size;i++){
          s+="<tr>";
          for(f=0;f<4*size;f++){
            if(flat2posit[d]<0){
              s+="<td><\/td>";
            }else{
              var c = colorPerm[ori][state[flat2posit[d]]];
              var col = colorList[colors[c]+0];
              drawSquare(r, w, h, border + width /2 + f*width + gap*Math.floor(f/cubeSize), border + width /2 + i*width + gap*Math.floor(i/cubeSize), width/2, col);
              //s+="<td style='background-color:"+colorList[colors[c]+2]+"'><img src='scrbg/"+colorList[colors[c]+1]+"' width=10 border=1 height=10><\/td>";
            }
            d++;
          }
          s+="<\/tr>";
        }
        s+="<\/table>";
        return(s);
      }
       
      function scramblestring(n){
        var s="",j;
        for(var i=0; i<seq[n].length-1; i++){
          if( i!=0 ) s+=" ";
          var k=seq[n][i]>>2;
       
          j=k%6; k=(k-j)/6;
          if( k && size<=5 && !mult ) {
            s+="dlburf".charAt(j);  // use lower case only for inner slices on 4x4x4 or 5x5x5
          }else{
            if(size<=5 && mult ){
              s+="DLBURF".charAt(j);
              if(k) s+="w"; // use w only for double layers on 4x4x4 and 5x5x5
            }
            else{
              if(k) s+=(k+1);
              s+="DLBURF".charAt(j);
            }
          }
       
          j=seq[n][i]&3;
          if(j!=0) s+=" 2'".charAt(j);
        }
       
        // add cube orientation
        if( cubeorient ){
          var ori = seq[n][seq[n].length-1];
          s="Top:"+colorList[ 2+colors[colorPerm[ori][3]] ]
            +"&nbsp;&nbsp;&nbsp;Front:"+colorList[2+ colors[colorPerm[ori][5]] ]+"<br>"+s;
        }
        return s;
      }
       
      function imagestring(nr){
        var s="",i,f,d=0,q;
       
        // initialise colours
        for( i=0; i<6; i++)
          for( f=0; f<size*size; f++)
            posit[d++]=i;
       
        // do move sequence
        for(i=0; i<seq[nr].length-1; i++){
          q=seq[nr][i]&3;
          f=seq[nr][i]>>2;
          d=0;
          while(f>5) { f-=6; d++; }
          do{
            doslice(f,d,q+1);
            d--;
          }while( mult && d>=0 );
        }
       
        // build string containing cube
        var ori = seq[nr][seq[nr].length-1];
        d=0;
        var imageheight = 160; // height of cube images in pixels (160px is a good height for fitting 5 images on a sheet of paper)
        var stickerheight = Math.floor(imageheight/(size*3));
        if(stickerheight < 5) { stickerheight = 5; } // minimum sticker size of 5px, takes effect when cube size reaches 11
        s="<div style='width:"+(stickerheight*size*4)+"px; height:"+(stickerheight*size*3)+"px;'>";
        for(i=0;i<3*size;i++){
          s+="<div style='float: left; display: block; height: "+stickerheight+"px; width: "+(stickerheight*size*4)+"px; line-height: 0px;'>";
          for(f=0;f<4*size;f++){
            if(true){
              s+="<div style='overflow: hidden; display: block; float: left; height: "+stickerheight+"px; width: "+stickerheight+"px;'></div>";
            }else{
              var c = colorPerm[ori][posit[flat2posit[d]]];
              s+="<div style='overflow: hidden; display: block; float: left; border: 1px solid #000; height: "+(stickerheight*1-2)+"px; width: "+(stickerheight*1-2)+"px;'><img src='scrbg/"+colorList[colors[c]+1]+"' /></div>";
            }
            d++;
          }
          s+="</div>";
        }
        s+="</div>";
        return(s);
      }
       
      function doslice(f,d,q){
        //do move of face f, layer d, q quarter turns
        var f1,f2,f3,f4;
        var s2=size*size;
        var c,i,j,k;
        if(f>5)f-=6;
        // cycle the side facelets
        for(k=0; k<q; k++){
          for(i=0; i<size; i++){
            if(f===0){
              f1=6*s2-size*d-size+i;
              f2=2*s2-size*d-1-i;
              f3=3*s2-size*d-1-i;
              f4=5*s2-size*d-size+i;
            }else if(f===1){
              f1=3*s2+d+size*i;
              f2=3*s2+d-size*(i+1);
              f3=  s2+d-size*(i+1);
              f4=5*s2+d+size*i;
            }else if(f===2){
              f1=3*s2+d*size+i;
              f2=4*s2+size-1-d+size*i;
              f3=  d*size+size-1-i;
              f4=2*s2-1-d-size*i;
            }else if(f===3){
              f1=4*s2+d*size+size-1-i;
              f2=2*s2+d*size+i;
              f3=  s2+d*size+i;
              f4=5*s2+d*size+size-1-i;
            }else if(f===4){
              f1=6*s2-1-d-size*i;
              f2=size-1-d+size*i;
              f3=2*s2+size-1-d+size*i;
              f4=4*s2-1-d-size*i;
            }else if(f===5){
              f1=4*s2-size-d*size+i;
              f2=2*s2-size+d-size*i;
              f3=s2-1-d*size-i;
              f4=4*s2+d+size*i;
            }
            c=posit[f1];
            posit[f1]=posit[f2];
            posit[f2]=posit[f3];
            posit[f3]=posit[f4];
            posit[f4]=c;
          }
       
          /* turn face */
          if(d===0){
            for(i=0; i+i<size; i++){
              for(j=0; j+j<size-1; j++){
                f1=f*s2+         i+         j*size;
                f3=f*s2+(size-1-i)+(size-1-j)*size;
                if(f<3){
                  f2=f*s2+(size-1-j)+         i*size;
                  f4=f*s2+         j+(size-1-i)*size;
                }else{
                  f4=f*s2+(size-1-j)+         i*size;
                  f2=f*s2+         j+(size-1-i)*size;
                }
                c=posit[f1];
                posit[f1]=posit[f2];
                posit[f2]=posit[f3];
                posit[f3]=posit[f4];
                posit[f4]=c;
              }
            }
          }
        }
      }


      /*
       * Some helper functions.
       */


      var getRandomScramble = function() {
        scramble();
        imagestring(0);

        return {
          state: posit,
          scramble_string: scramblestring(0)
        };
      };

      var drawingInitialized = false;

      var initializeDrawing = function(continuation) {

        if (!drawingInitialized) {

          parse();

          drawingInitialized = true;
        }

        if (continuation) {
          setTimeout(continuation, 0);
        }
      };

      var initializeFull = function(continuation, _) {

        initializeDrawing();

        if (continuation) {
          setTimeout(continuation, 0);
        }
      };


      /* mark2 interface */
      return {
        version: "July 05, 2015",
        initialize: initializeFull,
        setRandomSource: function() {console.log("setRandomSource is deprecated. It has no effect anymore.")},        getRandomScramble: getRandomScramble,
        drawScramble: drawScramble,

        /* Other methods */
      };

    })();
  }

  scramblers["444bf"] = scramblers["444"] = generate_NNN_scrambler(4, 40, true);
  scramblers["555bf"] = scramblers["555"] = generate_NNN_scrambler(5, 60, true);
  scramblers["666"] = generate_NNN_scrambler(6, 70, true);
  scramblers["777"] = generate_NNN_scrambler(7, 100, true);

})();
/* Base script written by Jaap Scherphuis, jaapsch a t yahoo d o t com */
/* Javascript written by Syoji Takamatsu, , red_dragon a t honki d o t net */
/* Random-State modification by Lucas Garron (lucasg a t gmx d o t de / garron.us) in collaboration with Michael Gottlieb (mzrg.com)*/
/* Optimal modification by Michael Gottlieb (qqwref a t gmail d o t com) from Jaap's code */
/* Version 1.0*/
"use strict";

scramblers["pyram"] = (function() {

  var numcub = 1;

  var colorString = "xgryb";  //In dlburf order. May use any colours in colorList below

   
  // list of available colours
  var colorList = [
   'g', "green.jpg",  "green",
   'r', "red.jpg",    "red",
   'y', "yellow.jpg", "yellow",
   'b', "blue.jpg",   "blue",
   'w', "white.jpg",  "white",
   'o', "orange.jpg","orange",   // 'orange' is not an official html colour name
   'p', "purple.jpg", "purple",
   '0', "gray.jpg",   "grey"      // used for unrecognised letters, or when zero used.
  ];
  // layout
  var layout =
   [1,2,1,2,1,0,2,0,1,2,1,2,1,
    0,1,2,1,0,2,1,2,0,1,2,1,0,
    0,0,1,0,2,1,2,1,2,0,1,0,0,
    0,0,0,0,0,0,0,0,0,0,0,0,0,
    0,0,0,0,1,2,1,2,1,0,0,0,0,
    0,0,0,0,0,1,2,1,0,0,0,0,0,
    0,0,0,0,0,0,1,0,0,0,0,0,0];
   
  var seq   = []; // move sequences
  var colmap = []; // color map
  var colors = []; //stores colours used
  var scramblestring = [];
   
  function parse() {

    /*
   var s = "";
   var urlquery = location.href.split("?")
   if(urlquery.length > 1) {
    var urlterms = urlquery[1].split("&")
    for( var i = 0; i < urlterms.length; i++) {
     var urllr = urlterms[i].split("=");
     if(urllr[0] == "num") {
      if(urllr[1] - 0 >= 1 ) 
       numcub = urllr[1] - 0;
     } 
     else if(urllr[0] == "col") {
      if(urllr[1].length==4) 
       colorString = urllr[1];
     }
    }
   }
   */

   // expand colour string into 6 actual html color names
   for(var k = 0; k < 6; k++){
    colors[k+1] = colorList.length - 3; // gray
    for( var i = 0; i < colorList.length; i += 3) {
     if( colorString.charAt(k) == colorList[i]) {
      colors[k+1] = i; // not use index 0
      break;
     }
    }
   }
  }
  parse();
   
  function init_colors(n){
   colmap[n] =
    [1,1,1,1,1,0,2,0,3,3,3,3,3,
     0,1,1,1,0,2,2,2,0,3,3,3,0,
     0,0,1,0,2,2,2,2,2,0,3,0,0,
     0,0,0,0,0,0,0,0,0,0,0,0,0,
     0,0,0,0,4,4,4,4,4,0,0,0,0,
     0,0,0,0,0,4,4,4,0,0,0,0,0,
     0,0,0,0,0,0,4,0,0,0,0,0,0];
  }
   
  function scramble()
  {
   var i, j, n, ls, t;
   
   for( n = 0; n < numcub; n++){
    initbrd();
    dosolve();
   
    scramblestring[n]="";
    init_colors(n);
    for (i=0;i<sol.length;i++) {
     scramblestring[n] += ["U","L","R","B"][sol[i]&7] + ["","'"][(sol[i]&8)/8] + " ";
     picmove([3,0,1,2][sol[i]&7],1+(sol[i]&8)/8,n);
    }
    var tips=["l","r","b","u"];
    for (i=0;i<4;i++) {
     var j = scramblers.lib.randomInt.below(3);
     if (j < 2) {
      scramblestring[n] += tips[i] + ["","'"][j] + " ";
      picmove(4+i,1+j,n);
     }
    }
   }
  }
   
  var posit = [];
  var mode;
  var edt;
  var perm=[];   // pruning table for edge permutation
  var twst=[];   // pruning table for edge orientation+twist
  var permmv=[]; // transition table for edge permutation
  var twstmv=[]; // transition table for edge orientation+twist
  var sol=[];
  var pcperm = [];
  var pcori  = [];
  var soltimer;
   
  function initbrd(){
      if( mode==4 ) clearTimeout(soltimer);
      posit = [0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,3];
      mode=0;
      sol.length=0;
  }
   
  function solved(){
      for (var i=1;i<9; i++){
          if( posit[i   ]!=posit[0 ] ) return(false);
          if( posit[i+9 ]!=posit[9 ] ) return(false);
          if( posit[i+18]!=posit[18] ) return(false);
          if( posit[i+27]!=posit[27] ) return(false);
      }
      return(true);
  }
   
  var edges = [2,11, 1,20, 4,31, 10,19, 13,29, 22,28];
   
  var movelist=[];
  movelist[0 ]=[0, 18,9,   6, 24,15,  1, 19,11,  2, 20,10];  //U
  movelist[1 ]=[23,3, 30,  26,7, 34,  22,1, 31,  20,4, 28];  //L
  movelist[2 ]=[5, 14,32,  8, 17,35,  4, 11,29,  2, 13,31];  //R
  movelist[3 ]=[12,21,27,  16,25,33,  13,19,28,  10,22,29];  //B
   
  function domove(m){
      for(var i=0;i<movelist[m].length; i+=3){
          var c=posit[movelist[m][i]];
          posit[movelist[m][i  ]]=posit[movelist[m][i+2]];
          posit[movelist[m][i+2]]=posit[movelist[m][i+1]];
          posit[movelist[m][i+1]]=c;
      }
  }
   
  function dosolve(){
      var a,b,c,l,t=0,q=0;
      // Get a random permutation and orientation.
      var parity = 0;
      pcperm = [0,1,2,3,4,5];
      for (var i=0;i<4;i++) {
       var other = i + scramblers.lib.randomInt.below(6-i);
       var temp = pcperm[i];
       pcperm[i] = pcperm[other];
       pcperm[other] = temp;
       if (i != other) parity++;
      }
      if (parity%2 == 1) {
       var temp = pcperm[4];
       pcperm[4] = pcperm[5];
       pcperm[5] = temp;
      }
      parity=0;
      pcori = [];
      for (var i=0;i<5;i++) {
       pcori[i] = scramblers.lib.randomInt.below(2);
       parity += pcori[i];
      }
      pcori[5] = parity % 2;
      for (var i=6;i<10;i++) {
       pcori[i] = scramblers.lib.randomInt.below(3);
      }
   
      for(a=0;a<6;a++){
          b=0;
          for(c=0;c<6;c++){
              if(pcperm[c]==a)break;
              if(pcperm[c]>a)b++;
          }
          q=q*(6-a)+b;
      }
      //corner orientation
      for(a=9;a>=6;a--){
          t=t*3+pcori[a];
      }
      //edge orientation
      for(a=4;a>=0;a--){
          t=t*2+pcori[a];
      }
   
      // solve it
      if(q!=0 || t!=0){
          for(l=7;l<12;l++){  //allow solutions from 7 through 11 moves
              if(search(q,t,l,-1)) break;
          }
      }
  }
   
  function search(q,t,l,lm){
      //searches for solution, from position q|t, in l moves exactly. last move was lm, current depth=d
      if(l==0){
          if(q==0 && t==0){
              return(true);
          }
      }else{
          if(perm[q]>l || twst[t]>l) return(false);
          var p,s,a,m;
          for(m=0;m<4;m++){
              if(m!=lm){
                  p=q; s=t;
                  for(a=0;a<2;a++){
                      p=permmv[p][m];
                      s=twstmv[s][m];
                      sol[sol.length]=m+8*a;
                      if(search(p,s,l-1,m)) return(true);
                      sol.length--;
                  }
              }
          }
      }
      return(false);
  }
   
   
  function calcperm(){
      var c,p,q,l,m,n;
      //calculate solving arrays
      //first permutation
      // initialise arrays
      for(p=0;p<720;p++){
          perm[p]=-1;
          permmv[p]=[];
          for(m=0;m<4;m++){
              permmv[p][m]=getprmmv(p,m);
          }
      }
      //fill it
      perm[0]=0;
      for(l=0;l<=6;l++){
          n=0;
          for(p=0;p<720;p++){
              if(perm[p]==l){
                  for(m=0;m<4;m++){
                      q=p;
                      for(c=0;c<2;c++){
                          q=permmv[q][m];
                          if(perm[q]==-1) { perm[q]=l+1; n++; }
                      }
                  }
              }
          }
      }
      //then twist
      // initialise arrays
      for(p=0;p<2592;p++){
          twst[p]=-1;
          twstmv[p]=[];
          for(m=0;m<4;m++){
              twstmv[p][m]=gettwsmv(p,m);
          }
      }
      //fill it
      twst[0]=0;
      for(l=0;l<=5;l++){
          n=0;
          for(p=0;p<2592;p++){
              if(twst[p]==l){
                  for(m=0;m<4;m++){
                      q=p;
                      for(c=0;c<2;c++){
                          q=twstmv[q][m];
                          if(twst[q]==-1) { twst[q]=l+1; n++; }
                      }
                  }
              }
          }
      }
  }
   
  function getprmmv(p,m){
      //given position p<720 and move m<4, return new position number
   
      //convert number into array
      var a,b,c;
      var ps=[];
      var q=p;
      for(a=1;a<=6;a++){
          c=Math.floor(q/a);
          b=q-a*c;
          q=c;
          for(c=a-1;c>=b;c--) ps[c+1]=ps[c];
          ps[b]=6-a;
      }
      //perform move on array
      if(m==0){
          //U
          cycle3(ps, 0, 3, 1);
      }else if(m==1){
          //L
          cycle3(ps, 1, 5, 2);
      }else if(m==2){
          //R
          cycle3(ps, 0, 2, 4);
      }else if(m==3){
          //B
          cycle3(ps, 3, 4, 5);
      }
      //convert array back to number
      q=0;
      for(a=0;a<6;a++){
          b=0;
          for(c=0;c<6;c++){
              if(ps[c]==a)break;
              if(ps[c]>a)b++;
          }
          q=q*(6-a)+b;
      }
      return(q)
  }
  function gettwsmv(p,m){
      //given position p<2592 and move m<4, return new position number
   
      //convert number into array;
      var a,b,c,d=0;
      var ps=[];
      var q=p;
   
      //first edge orientation
      for(a=0;a<=4;a++){
          ps[a]=q&1;
          q>>=1;
          d^=ps[a];
      }
      ps[5]=d;
   
      //next corner orientation
      for(a=6;a<=9;a++){
          c=Math.floor(q/3);
          b=q-3*c;
          q=c;
          ps[a]=b;
      }
   
      //perform move on array
      if(m==0){
          //U
          ps[6]++; if(ps[6]==3) ps[6]=0;
          cycle3(ps, 0, 3, 1);
          ps[1]^=1;ps[3]^=1;
      }else if(m==1){
          //L
          ps[7]++; if(ps[7]==3) ps[7]=0;
          cycle3(ps, 1, 5, 2);
          ps[2]^=1; ps[5]^=1;
      }else if(m==2){
          //R
          ps[8]++; if(ps[8]==3) ps[8]=0;
          cycle3(ps, 0, 2, 4);
          ps[0]^=1; ps[2]^=1;
      }else if(m==3){
          //B
          ps[9]++; if(ps[9]==3) ps[9]=0;
          cycle3(ps, 3, 4, 5);
          ps[3]^=1; ps[4]^=1;
      }
      //convert array back to number
      q=0;
      //corner orientation
      for(a=9;a>=6;a--){
          q=q*3+ps[a];
      }
      //corner orientation
      for(a=4;a>=0;a--){
          q=q*2+ps[a];
      }
      return(q);
  }
   
  function picmove(type, direction, n){
   switch(type) {
    case 0: // L
     rotate3(n, 14,58,18, direction);
     rotate3(n, 15,57,31, direction);
     rotate3(n, 16,70,32, direction);
     rotate3(n, 30,28,56, direction);
     break;
    case 1: // R
     rotate3(n, 32,72,22, direction);
     rotate3(n, 33,59,23, direction);
     rotate3(n, 20,58,24, direction);
     rotate3(n, 34,60,36, direction);
     break;
    case 2: // B
     rotate3(n, 14,10,72, direction);
     rotate3(n,  1,11,71, direction);
     rotate3(n,  2,24,70, direction);
     rotate3(n,  0,12,84, direction);
     break;
    case 3: // U
     rotate3(n,  2,18,22, direction);
     rotate3(n,  3,19, 9, direction);
     rotate3(n, 16,20,10, direction);
     rotate3(n,  4, 6, 8, direction);
     break;
    case 4: // l
     rotate3(n, 30,28,56, direction);
     break;
    case 5: // r
     rotate3(n, 34,60,36, direction);
     break;
    case 6: // b
     rotate3(n,  0,12,84, direction);
     break;
    case 7: // u
     rotate3(n,  4, 6, 8, direction);
     break;
   }
  }
   
  function rotate3(n, v1, v2, v3, clockwise)
  {
   if(clockwise == 2) {
    cycle3(colmap[n], v3, v2, v1);
   } else {
    cycle3(colmap[n], v1, v2, v3);
   }
  }
   
  function cycle3(arr, i1, i2, i3) {
   var c = arr[i1];
   arr[i1] = arr[i2];
   arr[i2] = arr[i3];
   arr[i3] = c;
  }
   
  function draw_triangle(pat, color, val)
  {
     var s = "";
     if(pat == 1) {
        s += "<table border=0 cellpadding=0 cellspacing=0>";
        s += "<tr>";
        for(var c=1; c<=12; c++){
           s += "<td width=1 height=2><img src='scrbg/" +colorList[colors[color] + 1] +  "' height='2px' width='1px'></td>";
        }
        s += "</tr>";
   
        for(var i = 1; i <= 5; i++) {
           s += "<tr>";
           s += "<td colspan=" + i + " width=" + i + " height=2 bgcolor=silver></td>";
           s += "<td colspan=" + (12 - i * 2) + " width=" + (12 - i * 2) + " height=2><img src='scrbg/" +colorList[colors[color] + 1] +  "' height='2px' width='"+(12 - i * 2)+"px'></td>";
           s += "<td colspan=" + i + " width=" + i + " height=2 bgcolor=silver></td>";
           s += "</tr>";
        }
   
        s += "</table>";
     }
     else if(pat == 2) {
        s += "<table border=0 cellpadding=0 cellspacing=0>";
        for(var i = 5; i >= 1; i--) {
           s += "<tr>";
           s += "<td colspan=" + i + " width=" + i + " height=2 bgcolor=silver></td>";
           s += "<td colspan=" + (12 - i * 2) + " width=" + (12 - i * 2) + " height=2><img src='scrbg/" +colorList[colors[color] + 1] +  "' height='2px' width='"+(12 - i * 2)+"px'></td>";
           s += "<td colspan=" + i + " width=" + i + " height=2 bgcolor=silver></td>";
           s += "</tr>";
        }
   
        s += "<tr>";
        for(var c=1; c<=12; c++){
           s += "<td width=1 height=2><img src='scrbg/" +colorList[colors[color] + 1] +  "' height='2px' width='1px'></td>";
        }
        s += "</tr>";
        s += "</table>";
     }
     else {
        s += "&nbsp;";
     }
     return s;
  }
   
  function imagetable(n)
  {
  	var x,y;
  	var s = "<table border=0 cellpadding=0 cellspacing=0>";
   
  	for(var y = 0; y < 7; y++) {
  		s += "<tr>";
  		for(var x = 0; x < 13; x++) {
  			s += "<td>";
  			s += draw_triangle(layout[y * 13 + x], colmap[n][y * 13 + x], "");
  			s += "</td>";
  		}
  		s += "</tr>";
  	}
  	s += "</table>";
  	return s;
  }

  /* Methods added by Lucas. */

  var getRandomScramble = function() {
    initializeFull();
    scramble();

    return {
      state: colmap,
      scramble_string: scramblestring[0]
    };
  };

  var initialized = false;

  var initializeFull = function(continuation, _) {

    if (initialized) {
      return;
    }
    initialized = true;

    parse();
    calcperm();

    if (continuation) {
      setTimeout(continuation, 0);
    }
  };



  var border = 15;
  var width = 18;
  //URFLBD
  var drawingCenters = [
    [border + width/2*1, border + width/2*1],
    [border + width/2*5, border + width/2*3],
    [border + width/2*3, border + width/2*3],
    [border + width/2*1, border + width/2*3],
    [border + width/2*7, border + width/2*3],
    [border + width/2*3, border + width/2*5],
  ];


  function colorGet(col){
    if (col=="r") return ("#FF0000");
    if (col=="o") return ("#FF8000");
    if (col=="b") return ("#0000FF");
    if (col=="g") return ("#00FF00");
    if (col=="y") return ("#FFFF00");
    if (col=="w") return ("#FFFFFF");
    if (col=="x") return ("#000000");
  }

  var scalePoint = function(w, h, ptIn) {

    var defaultWidth = border*2+width*9;
    var defaultHeight = border*2+width*5.3;
    

    var scale = Math.min(w/defaultWidth, h/defaultHeight);

    var x = Math.floor(ptIn[0]*scale + (w - (defaultWidth * scale))/2) + 0.5;
    var y = Math.floor(ptIn[1]*scale + (h - (defaultHeight * scale))/2) + 0.5;

    return [x, y];
  }

  function drawTriangle(r, canvasWidth, canvasHeight, cx, cy, w, h, direction, fillColor) {

    var dM = 1; // Direction Multiplier
    if (direction == 2) {
      dM = -1;
    }

    var arrx = [cx, cx - w, cx + w];
    var arry = [cy + h * dM, cy - h * dM, cy - h * dM];

    var pathString = "";
    for (var i = 0; i < arrx.length; i++) {
      var scaledPoint = scalePoint(canvasWidth, canvasHeight, [arrx[i], arry[i]]);
      pathString += ((i===0) ? "M" : "L") + scaledPoint[0] + "," + scaledPoint[1];
    }
    pathString += "z";
      
    r.path(pathString).attr({fill: colorGet(fillColor), stroke: "#000"})
  }

  var drawScramble = function(parentElement, state, w, h) {

    var r = Raphael(parentElement, w, h);

    for(var y = 0; y < 7; y++) {
      for(var x = 0; x < 13; x++) {
        var col = state[0][y * 13 + x];
        if (col != 0) {
          var xx = border + width + x*width/2*2/Math.sqrt(3);
          var yy = border + y * width;
          if (y > 3) {
            yy -= width/2;
          }
          drawTriangle(r, w, h, xx, yy, width/2*2/Math.sqrt(3), width/2, layout[y * 13 + x], colorString[col]);
        }
      }
    }

  }

  return {
    /* mark2 interface */
    version: "July 05, 2015",
    initialize: initializeFull,
    setRandomSource: function() {console.log("setRandomSource is deprecated. It has no effect anymore.")},
    getRandomScramble: getRandomScramble,
    drawScramble: drawScramble,

    /* Other methods */
  };
})();
/*

scramble_sq1.js

Square-1 Solver / Scramble Generator in Javascript.

Code by by Shuang Chen.
Compiled to Javascript using GWT.

*/


scramblers["sq1"] = (function() {


function nullMethod(){
}

function FullCube_copy(obj, c){
  obj.ul = c.ul;
  obj.ur = c.ur;
  obj.dl = c.dl;
  obj.dr = c.dr;
  obj.ml = c.ml;
}

function FullCube_doMove(obj, move){
  var temp;
  move <<= 2;
  if (move > 24) {
    move = 48 - move;
    temp = obj.ul;
    obj.ul = (~~obj.ul >> move | obj.ur << 24 - move) & 16777215;
    obj.ur = (~~obj.ur >> move | temp << 24 - move) & 16777215;
  }
   else if (move > 0) {
    temp = obj.ul;
    obj.ul = (obj.ul << move | ~~obj.ur >> 24 - move) & 16777215;
    obj.ur = (obj.ur << move | ~~temp >> 24 - move) & 16777215;
  }
   else if (move == 0) {
    temp = obj.ur;
    obj.ur = obj.dl;
    obj.dl = temp;
    obj.ml = 1 - obj.ml;
  }
   else if (move >= -24) {
    move = -move;
    temp = obj.dl;
    obj.dl = (obj.dl << move | ~~obj.dr >> 24 - move) & 16777215;
    obj.dr = (obj.dr << move | ~~temp >> 24 - move) & 16777215;
  }
   else if (move < -24) {
    move = 48 + move;
    temp = obj.dl;
    obj.dl = (~~obj.dl >> move | obj.dr << 24 - move) & 16777215;
    obj.dr = (~~obj.dr >> move | temp << 24 - move) & 16777215;
  }
}

function FullCube_getParity(obj){
  var a, b, cnt, i, p;
  cnt = 0;
  obj.arr[0] = FullCube_pieceAt(obj, 0);
  for (i = 1; i < 24; ++i) {
    FullCube_pieceAt(obj, i) != obj.arr[cnt] && (obj.arr[++cnt] = FullCube_pieceAt(obj, i));
  }
  p = 0;
  for (a = 0; a < 16; ++a) {
    for (b = a + 1; b < 16; ++b) {
      obj.arr[a] > obj.arr[b] && (p ^= 1);
    }
  }
  return p;
}

function FullCube_getShapeIdx(obj){
  var dlx, drx, ulx, urx;
  urx = obj.ur & 1118481;
  urx |= ~~urx >> 3;
  urx |= ~~urx >> 6;
  urx = urx & 15 | ~~urx >> 12 & 48;
  ulx = obj.ul & 1118481;
  ulx |= ~~ulx >> 3;
  ulx |= ~~ulx >> 6;
  ulx = ulx & 15 | ~~ulx >> 12 & 48;
  drx = obj.dr & 1118481;
  drx |= ~~drx >> 3;
  drx |= ~~drx >> 6;
  drx = drx & 15 | ~~drx >> 12 & 48;
  dlx = obj.dl & 1118481;
  dlx |= ~~dlx >> 3;
  dlx |= ~~dlx >> 6;
  dlx = dlx & 15 | ~~dlx >> 12 & 48;
  return Shape_getShape2Idx(FullCube_getParity(obj) << 24 | ulx << 18 | urx << 12 | dlx << 6 | drx);
}

function FullCube_getSquare(obj, sq){
  var a, b;
  for (a = 0; a < 8; ++a) {
    obj.prm[a] = ~~(~~FullCube_pieceAt(obj, a * 3 + 1) >> 1 << 24) >> 24;
  }
  sq.cornperm = get8Perm(obj.prm);
  sq.topEdgeFirst = FullCube_pieceAt(obj, 0) == FullCube_pieceAt(obj, 1);
  a = sq.topEdgeFirst?2:0;
  for (b = 0; b < 4; a += 3 , ++b)
    obj.prm[b] = ~~(~~FullCube_pieceAt(obj, a) >> 1 << 24) >> 24;
  sq.botEdgeFirst = FullCube_pieceAt(obj, 12) == FullCube_pieceAt(obj, 13);
  a = sq.botEdgeFirst?14:12;
  for (; b < 8; a += 3 , ++b)
    obj.prm[b] = ~~(~~FullCube_pieceAt(obj, a) >> 1 << 24) >> 24;
  sq.edgeperm = get8Perm(obj.prm);
  sq.ml = obj.ml;
}

function FullCube_pieceAt(obj, idx){
  var ret;
  idx < 6?(ret = ~~obj.ul >> (5 - idx << 2)):idx < 12?(ret = ~~obj.ur >> (11 - idx << 2)):idx < 18?(ret = ~~obj.dl >> (17 - idx << 2)):(ret = ~~obj.dr >> (23 - idx << 2));
  return ~~((ret & 15) << 24) >> 24;
}

function FullCube_setPiece(obj, idx, value) {
  if (idx < 6) {
		obj.ul &= ~(0xf << ((5-idx) << 2));
		obj.ul |= value << ((5-idx) << 2);
	} else if (idx < 12) {
		obj.ur &= ~(0xf << ((11-idx) << 2));
		obj.ur |= value << ((11-idx) << 2);
	} else if (idx < 18) {
		obj.dl &= ~(0xf << ((17-idx) << 2));
		obj.dl |= value << ((17-idx) << 2);
	} else {
		obj.dr &= ~(0xf << ((23-idx) << 2));
		obj.dr |= value << ((23-idx) << 2);
	}	
}


function FullCube_FullCube__Ljava_lang_String_2V(){
  this.arr = []; 
  this.prm = []; 
}

function FullCube_randomCube(){
	var f, i, shape, edge, corner, n_edge, n_corner, rnd, m;
	f = new FullCube_FullCube__Ljava_lang_String_2V;
	shape = Shape_ShapeIdx[~~(scramblers.lib.randomInt.below(3678))];
	corner = 0x01234567 << 1 | 0x11111111;
	edge = 0x01234567 << 1;
	n_corner = n_edge = 8;
	for (i=0; i<24; i++) {
		if (((shape >> i) & 1) == 0) {//edge
			rnd = ~~(scramblers.lib.randomInt.below(n_edge)) << 2;
			FullCube_setPiece(f, 23-i, (edge >> rnd) & 0xf);
			m = (1 << rnd) - 1;
			edge = (edge & m) + ((edge >> 4) & ~m);
			--n_edge;
		} else {//corner
			rnd = ~~(scramblers.lib.randomInt.below(n_corner)) << 2;
			FullCube_setPiece(f, 23-i, (corner >> rnd) & 0xf);
			FullCube_setPiece(f, 22-i, (corner >> rnd) & 0xf);
			m = (1 << rnd) - 1;
			corner = (corner & m) + ((corner >> 4) & ~m);
			--n_corner;
			++i;								
		}
	}
	f.ml = ~~(scramblers.lib.randomInt.below(2));
//	console.log(f);
	return f;
}


function FullCube(){
}

_ = FullCube_FullCube__Ljava_lang_String_2V.prototype = FullCube.prototype; 
_.dl = 10062778;
_.dr = 14536702;
_.ml = 0;
_.ul = 70195;
_.ur = 4544119;
var FullCube_gen;
function Search_init2(obj){
  var corner, edge, i, j, ml, prun;
  FullCube_copy(obj.Search_d, obj.Search_c);
  for (i = 0; i < obj.Search_length1; ++i) {
    FullCube_doMove(obj.Search_d, obj.Search_move[i]);
  }
  FullCube_getSquare(obj.Search_d, obj.Search_sq);
  edge = obj.Search_sq.edgeperm;
  corner = obj.Search_sq.cornperm;
  ml = obj.Search_sq.ml;
  prun = Math.max( SquarePrun[obj.Search_sq.edgeperm << 1 | ml], SquarePrun[obj.Search_sq.cornperm << 1 | ml]);
  for (i = prun; i < obj.Search_maxlen2; ++i) {
    if (Search_phase2(obj, edge, corner, obj.Search_sq.topEdgeFirst, obj.Search_sq.botEdgeFirst, ml, i, obj.Search_length1, 0)) {
      for (j = 0; j < i; ++j) {
        FullCube_doMove(obj.Search_d, obj.Search_move[obj.Search_length1 + j]);
        //console.log(obj.Search_move[obj.Search_length1 + j]);
      }
      //console.log(obj.Search_d);
      //console.log(obj.Search_move);
      obj.Search_sol_string = Search_move2string(obj, i + obj.Search_length1);
      return true;
    }
  }
  return false;
}

function Search_move2string(obj, len) {
  var s = "";
  var top = 0, bottom = 0;
  for (var i=len-1; i>=0; i--) {
    var val = obj.Search_move[i];
    //console.log(val);
    if (val > 0) {
      val = 12 - val;
      top = (val > 6) ? (val-12) : val;
    } else if (val < 0) {
      val = 12 + val
      bottom = (val > 6) ? (val-12) : val;
    } else {
      if (top == 0 && bottom == 0) {
        s += " / "
      } else {
        s += "(" + top + ", " + bottom + ") / ";
      }
      top = bottom = 0;
    }
  }
  if (top == 0 && bottom == 0) {
  } else {
    s += "(" + top + ", " + bottom + ")";
  }
  return s;// + " (" + len + "t)";
}

function Search_phase1(obj, shape, prunvalue, maxl, depth, lm){
  var m, prunx, shapex;
  if (prunvalue == 0 && maxl < 4) {
    return maxl == 0 && Search_init2(obj);
  }
  if (lm != 0) {
    shapex =  Shape_TwistMove[shape];
    prunx = ShapePrun[shapex];
    if (prunx < maxl) {
      obj.Search_move[depth] = 0;
      if (Search_phase1(obj, shapex, prunx, maxl - 1, depth + 1, 0)) {
        return true;
      }
    }
  }
  shapex = shape;
  if (lm <= 0) {
    m = 0;
    while (true) {
      m +=  Shape_TopMove[shapex];
      shapex = ~~m >> 4;
      m &= 15;
      if (m >= 12) {
        break;
      }
      prunx = ShapePrun[shapex];
      if (prunx > maxl) {
        break;
      }
       else if (prunx < maxl) {
        obj.Search_move[depth] = m;
        if (Search_phase1(obj, shapex, prunx, maxl - 1, depth + 1, 1)) {
          return true;
        }
      }
    }
  }
  shapex = shape;
  if (lm <= 1) {
    m = 0;
    while (true) {
      m +=  Shape_BottomMove[shapex];
      shapex = ~~m >> 4;
      m &= 15;
      if (m >= 6) {
        break;
      }
      prunx = ShapePrun[shapex];
      if (prunx > maxl) {
        break;
      }
       else if (prunx < maxl) {
        obj.Search_move[depth] = -m;
        if (Search_phase1(obj, shapex, prunx, maxl - 1, depth + 1, 2)) {
          return true;
        }
      }
    }
  }
  return false;
}

function Search_phase2(obj, edge, corner, topEdgeFirst, botEdgeFirst, ml, maxl, depth, lm){
  var botEdgeFirstx, cornerx, edgex, m, prun1, prun2, topEdgeFirstx;
  if (maxl == 0 && !topEdgeFirst && botEdgeFirst) {
    return true;
  }
  if (lm != 0 && topEdgeFirst == botEdgeFirst) {
    edgex =  Square_TwistMove[edge];
    cornerx = Square_TwistMove[corner];
    if (SquarePrun[edgex << 1 | 1 - ml] < maxl && SquarePrun[cornerx << 1 | 1 - ml] < maxl) {
      obj.Search_move[depth] = 0;
      if (Search_phase2(obj, edgex, cornerx, topEdgeFirst, botEdgeFirst, 1 - ml, maxl - 1, depth + 1, 0)) {
        return true;
      }
    }
  }
  if (lm <= 0) {
    topEdgeFirstx = !topEdgeFirst;
    edgex = topEdgeFirstx? Square_TopMove[edge]:edge;
    cornerx = topEdgeFirstx?corner: Square_TopMove[corner];
    m = topEdgeFirstx?1:2;
    prun1 =  SquarePrun[edgex << 1 | ml];
    prun2 = SquarePrun[cornerx << 1 | ml];
    while (m < 12 && prun1 <= maxl && prun1 <= maxl) {
      if (prun1 < maxl && prun2 < maxl) {
        obj.Search_move[depth] = m;
        if (Search_phase2(obj, edgex, cornerx, topEdgeFirstx, botEdgeFirst, ml, maxl - 1, depth + 1, 1)) {
          return true;
        }
      }
      topEdgeFirstx = !topEdgeFirstx;
      if (topEdgeFirstx) {
        edgex = Square_TopMove[edgex];
        prun1 = SquarePrun[edgex << 1 | ml];
        m += 1;
      }
       else {
        cornerx = Square_TopMove[cornerx];
        prun2 = SquarePrun[cornerx << 1 | ml];
        m += 2;
      }
    }
  }
  if (lm <= 1) {
    botEdgeFirstx = !botEdgeFirst;
    edgex = botEdgeFirstx? Square_BottomMove[edge]:edge;
    cornerx = botEdgeFirstx?corner: Square_BottomMove[corner];
    m = botEdgeFirstx?1:2;
    prun1 =  SquarePrun[edgex << 1 | ml];
    prun2 = SquarePrun[cornerx << 1 | ml];
    while (m < (maxl > 3?6:12) && prun1 <= maxl && prun1 <= maxl) {
      if (prun1 < maxl && prun2 < maxl) {
        obj.Search_move[depth] = -m;
        if (Search_phase2(obj, edgex, cornerx, topEdgeFirst, botEdgeFirstx, ml, maxl - 1, depth + 1, 2)) {
          return true;
        }
      }
      botEdgeFirstx = !botEdgeFirstx;
      if (botEdgeFirstx) {
        edgex = Square_BottomMove[edgex];
        prun1 = SquarePrun[edgex << 1 | ml];
        m += 1;
      }
       else {
        cornerx = Square_BottomMove[cornerx];
        prun2 = SquarePrun[cornerx << 1 | ml];
        m += 2;
      }
    }
  }
  return false;
}

function Search_solution(obj, c){
  var shape;
  obj.Search_c = c;
  shape = FullCube_getShapeIdx(c);
  //console.log(shape);
  for (obj.Search_length1 =  ShapePrun[shape]; obj.Search_length1 < 100; ++obj.Search_length1) {
    //console.log(obj.Search_length1);
    obj.Search_maxlen2 = Math.min(31 - obj.Search_length1, 17);
    if (Search_phase1(obj, shape, ShapePrun[shape], obj.Search_length1, 0, -1)) {
      break;
    }
  }
  return obj.Search_sol_string;
}

function Search_Search(){
  this.Search_move = []; 
  this.Search_d = new FullCube_FullCube__Ljava_lang_String_2V;
  this.Search_sq = new Square_Square;
}

function Search(){
}

_ = Search_Search.prototype = Search.prototype; 
_.Search_c = null;
_.Search_length1 = 0;
_.Search_maxlen2 = 0;
_.Search_sol_string = null;
function Shape_$clinit(){
  Shape_$clinit = nullMethod;
  Shape_halflayer =[0, 3, 6, 12, 15, 24, 27, 30, 48, 51, 54, 60, 63]; 
  Shape_ShapeIdx = []; 
  ShapePrun = []; 
  Shape_TopMove = []; 
  Shape_BottomMove = []; 
  Shape_TwistMove = []; 
  Shape_init();
}

function Shape_bottomMove(obj){
  var move, moveParity;
  move = 0;
  moveParity = 0;
  do {
    if ((obj.bottom & 2048) == 0) {
      move += 1;
      obj.bottom = obj.bottom << 1;
    }
     else {
      move += 2;
      obj.bottom = obj.bottom << 2 ^ 12291;
    }
    moveParity = 1 - moveParity;
  }
   while ((bitCount(obj.bottom & 63) & 1) != 0);
  (bitCount(obj.bottom) & 2) == 0 && (obj.Shape_parity ^= moveParity);
  return move;
}

function Shape_getIdx(obj){
  var ret;
  ret = binarySearch(Shape_ShapeIdx, obj.top << 12 | obj.bottom) << 1 | obj.Shape_parity;
  return ret;
}

function Shape_setIdx(obj, idx){
  obj.Shape_parity = idx & 1;
  obj.top = Shape_ShapeIdx[~~idx >> 1];
  obj.bottom = obj.top & 4095;
  obj.top >>= 12;
}

function Shape_topMove(obj){
  var move, moveParity;
  move = 0;
  moveParity = 0;
  do {
    if ((obj.top & 2048) == 0) {
      move += 1;
      obj.top = obj.top << 1;
    }
     else {
      move += 2;
      obj.top = obj.top << 2 ^ 12291;
    }
    moveParity = 1 - moveParity;
  }
   while ((bitCount(obj.top & 63) & 1) != 0);
  (bitCount(obj.top) & 2) == 0 && (obj.Shape_parity ^= moveParity);
  return move;
}

function Shape_Shape(){
}

function Shape_getShape2Idx(shp){
  var ret;
  ret = binarySearch(Shape_ShapeIdx, shp & 16777215) << 1 | ~~shp >> 24;
  return ret;
}

function Shape_init(){
  var count, depth, dl, done, done0, dr, i, idx, m, s, ul, ur, value, p1, p3, temp;
  count = 0;
  for (i = 0; i < 28561; ++i) {
    dr = Shape_halflayer[i % 13];
    dl = Shape_halflayer[~~(i / 13) % 13];
    ur = Shape_halflayer[~~(~~(i / 13) / 13) % 13];
    ul = Shape_halflayer[~~(~~(~~(i / 13) / 13) / 13)];
    value = ul << 18 | ur << 12 | dl << 6 | dr;
    bitCount(value) == 16 && (Shape_ShapeIdx[count++] = value);
  }
  s = new Shape_Shape;
  for (i = 0; i < 7356; ++i) {
    Shape_setIdx(s, i);
    Shape_TopMove[i] = Shape_topMove(s);
    Shape_TopMove[i] |= Shape_getIdx(s) << 4;
    Shape_setIdx(s, i);
    Shape_BottomMove[i] = Shape_bottomMove(s);
    Shape_BottomMove[i] |= Shape_getIdx(s) << 4;
    Shape_setIdx(s, i);
    temp = s.top & 63;
    p1 = bitCount(temp);
    p3 = bitCount(s.bottom & 4032);
    s.Shape_parity ^= 1 & ~~(p1 & p3) >> 1;
    s.top = s.top & 4032 | ~~s.bottom >> 6 & 63;
    s.bottom = s.bottom & 63 | temp << 6;
    Shape_TwistMove[i] = Shape_getIdx(s);
  }
  for (i = 0; i < 7536; ++i) {
    ShapePrun[i] = -1;
  }
  ShapePrun[Shape_getShape2Idx(14378715)] = 0;
  ShapePrun[Shape_getShape2Idx(31157686)] = 0;
  ShapePrun[Shape_getShape2Idx(23967451)] = 0;
  ShapePrun[Shape_getShape2Idx(7191990)] = 0;
  done = 4;
  done0 = 0;
  depth = -1;
  while (done != done0) {
    done0 = done;
    ++depth;
    for (i = 0; i < 7536; ++i) {
      if (ShapePrun[i] == depth) {
        m = 0;
        idx = i;
        do {
          idx = Shape_TopMove[idx];
          m += idx & 15;
          idx >>= 4;
          if (ShapePrun[idx] == -1) {
            ++done;
            ShapePrun[idx] = depth + 1;
          }
        }
         while (m != 12);
        m = 0;
        idx = i;
        do {
          idx = Shape_BottomMove[idx];
          m += idx & 15;
          idx >>= 4;
          if (ShapePrun[idx] == -1) {
            ++done;
            ShapePrun[idx] = depth + 1;
          }
        }
         while (m != 12);
        idx = Shape_TwistMove[i];
        if (ShapePrun[idx] == -1) {
          ++done;
          ShapePrun[idx] = depth + 1;
        }
      }
    }
  }
}

function Shape(){
}

_ = Shape_Shape.prototype = Shape.prototype; 
_.bottom = 0;
_.Shape_parity = 0;
_.top = 0;
var Shape_BottomMove, Shape_ShapeIdx, ShapePrun, Shape_TopMove, Shape_TwistMove, Shape_halflayer;
function Square_$clinit(){
  Square_$clinit = nullMethod;
  SquarePrun = []; 
  Square_TwistMove = []; 
  Square_TopMove = []; 
  Square_BottomMove = []; 
  fact = [1, 1, 2, 6, 24, 120, 720, 5040]; 
  Cnk = []; 
  for (var i=0; i<12; ++i) Cnk[i] = [];
  Square_init();
}

function Square_Square(){
}

function get8Perm(arr){
  var i, idx, v, val;
  idx = 0;
  val = 1985229328;
  for (i = 0; i < 7; ++i) {
    v = arr[i] << 2;
    idx = (8 - i) * idx + (~~val >> v & 7);
    val -= 286331152 << v;
  }
  return idx & 65535;
}

function Square_init(){
  var check, depth, done, find, i, idx, idxx, inv, j, m, ml, pos, temp;
  for (i = 0; i < 12; ++i) {
    Cnk[i][0] = 1;
    Cnk[i][i] = 1;
    for (j = 1; j < i; ++j) {
      Cnk[i][j] = Cnk[i - 1][j - 1] + Cnk[i - 1][j];
    }
  }
  pos = []; 
  for (i = 0; i < 40320; ++i) {
    set8Perm(pos, i);
    temp = pos[2];
    pos[2] = pos[4];
    pos[4] = temp;
    temp = pos[3];
    pos[3] = pos[5];
    pos[5] = temp;
    Square_TwistMove[i] = get8Perm(pos);
    set8Perm(pos, i);
    temp = pos[0];
    pos[0] = pos[1];
    pos[1] = pos[2];
    pos[2] = pos[3];
    pos[3] = temp;
    Square_TopMove[i] = get8Perm(pos);
    set8Perm(pos, i);
    temp = pos[4];
    pos[4] = pos[5];
    pos[5] = pos[6];
    pos[6] = pos[7];
    pos[7] = temp;
    Square_BottomMove[i] = get8Perm(pos);
  }
  for (i = 0; i < 80640; ++i) {
    SquarePrun[i] = -1;
  }
  SquarePrun[0] = 0;
  depth = 0;
  done = 1;
  while (done < 80640) {
    // console.log(done);
    inv = depth >= 11;
    find = inv?-1:depth;
    check = inv?depth:-1;
    ++depth;
    OUT: for (i = 0; i < 80640; ++i) {
      if (SquarePrun[i] == find) {
        idx = ~~i >> 1;
        ml = i & 1;
        idxx = Square_TwistMove[idx] << 1 | 1 - ml;
        if (SquarePrun[idxx] == check) {
          ++done;
          SquarePrun[inv?i:idxx] = ~~(depth << 24) >> 24;
          if (inv)
            continue OUT;
        }
        idxx = idx;
        for (m = 0; m < 4; ++m) {
          idxx = Square_TopMove[idxx];
          if (SquarePrun[idxx << 1 | ml] == check) {
            ++done;
            SquarePrun[inv?i:idxx << 1 | ml] = ~~(depth << 24) >> 24;
            if (inv)
              continue OUT;
          }
        }
        for (m = 0; m < 4; ++m) {
          idxx = Square_BottomMove[idxx];
          if (SquarePrun[idxx << 1 | ml] == check) {
            ++done;
            SquarePrun[inv?i:idxx << 1 | ml] = ~~(depth << 24) >> 24;
            if (inv)
              continue OUT;
          }
        }
      }
    }
  }
}

function set8Perm(arr, idx){
  var i, m, p, v, val;
  val = 1985229328;
  for (i = 0; i < 7; ++i) {
    p = fact[7 - i];
    v = ~~(idx / p);
    idx -= v * p;
    v <<= 2;
    arr[i] = ~~((~~val >> v & 7) << 24) >> 24;
    m = (1 << v) - 1;
    val = (val & m) + (~~val >> 4 & ~m);
  }
  arr[7] = ~~(val << 24) >> 24;
}

function Square(){
}

_ = Square_Square.prototype = Square.prototype; 
_.botEdgeFirst = false;
_.cornperm = 0;
_.edgeperm = 0;
_.ml = 0;
_.topEdgeFirst = false;
var Square_BottomMove, Cnk, SquarePrun, Square_TopMove, Square_TwistMove, fact;

function bitCount(x){
  x -= ~~x >> 1 & 1431655765;
  x = (~~x >> 2 & 858993459) + (x & 858993459);
  x = (~~x >> 4) + x & 252645135;
  x += ~~x >> 8;
  x += ~~x >> 16;
  return x & 63;
}

function binarySearch(sortedArray, key){
  var high, low, mid, midVal;
  low = 0;
  high = sortedArray.length - 1;
  while (low <= high) {
    mid = low + (~~(high - low) >> 1);
    midVal = sortedArray[mid];
    if (midVal < key) {
      low = mid + 1;
    }
     else if (midVal > key) {
      high = mid - 1;
    }
     else {
      return mid;
    }
  }
  return -low - 1;
}

  /*
   * Some helper functions.
   */

  var square1Solver_initialized = false;

  var square1SolverInitialize= function(doneCallback, _, statusCallback) {
    if (!square1Solver_initialized) {
      Shape_$clinit();
      Square_$clinit();
    }

    if (statusCallback) {
      statusCallback("Done initializing Square-1.");
    }

    square1Solver_initialized = true;
    if (doneCallback != null) {
      doneCallback();
    }
  }


  var square1SolverGetRandomPosition = function() {
    if (!square1Solver_initialized) {
      square1SolverInitialize();
    }
    return FullCube_randomCube();
  }

  var square1SolverGenerate = function(state) {
    var search_search = new Search_Search; // Can this be factored out?
    return Search_solution(search_search, state);
  }

  var square1SolverGetRandomScramble = function() {
    var randomState = square1SolverGetRandomPosition();
    var scrambleString = square1SolverGenerate(randomState);

    return {
      state: randomState,
      scramble_string: scrambleString 
    };
  }

  /*
   * Drawing methods. These are extremely messy and outdated by now, but at least they work.
   */


  function colorGet(col){
    if (col==="r") return ("#FF0000");
    if (col==="o") return ("#FF8000");
    if (col==="b") return ("#0000FF");
    if (col==="g") return ("#00FF00");
    if (col==="y") return ("#FFFF00");
    if (col==="w") return ("#FFFFFF");
    if (col==="x") return ("#000000");
  }

var scalePoint = function(w, h, ptIn) {
  
  var defaultWidth = 200;
  var defaultHeight = 110;

  var scale = Math.min(w/defaultWidth, h/defaultHeight);

  var x = Math.floor(ptIn[0]*scale + (w - (defaultWidth * scale))/2) + 0.5;
  var y = Math.floor(ptIn[1]*scale + (h - (defaultHeight * scale))/2) + 0.5;

  return [x, y];
}

function drawPolygon(r, fillColor, w, h, arrx, arry) {

  var pathString = "";
  for (var i = 0; i < arrx.length; i++) {
    var scaledPoint = scalePoint(w, h, [arrx[i], arry[i]]);
    pathString += ((i===0) ? "M" : "L") + scaledPoint[0] + "," + scaledPoint[1];
  }
  pathString += "z";

  r.path(pathString).attr({fill: colorGet(fillColor), stroke: "#000"})
}
 
 
function drawSq(stickers, middleIsSolved, shapes, parentElement, width, height, colorString) {

    var z = 1.366 // sqrt(2) / sqrt(1^2 + tan(15 degrees)^2)
    var r = Raphael(parentElement, width, height);

    var arrx, arry;
   
    var margin = 1;
    var sidewid=.15*100/z;
    var cx = 50;
    var cy = 50;
    var radius=(cx-margin-sidewid*z)/z;
    var w = (sidewid+radius)/radius   // ratio btw total piece width and radius
   
    var angles=[0,0,0,0,0,0,0,0,0,0,0,0,0];
    var angles2=[0,0,0,0,0,0,0,0,0,0,0,0,0];
   
    //initialize angles
    for(var foo=0; foo<24; foo++){
      angles[foo]=(17-foo*2)/12*Math.PI;
      shapes = shapes.concat("xxxxxxxxxxxxxxxx");
    }
    for(var foo=0; foo<24; foo++){
      angles2[foo]=(19-foo*2)/12*Math.PI;
      shapes = shapes.concat("xxxxxxxxxxxxxxxx");
    }
    
    function cos1(index) {return Math.cos(angles[index])*radius;}
    function sin1(index) {return Math.sin(angles[index])*radius;}
    function cos2(index) {return Math.cos(angles2[index])*radius;}
    function sin2(index) {return Math.sin(angles2[index])*radius;}

    var h = sin1(1)*w*z - sin1(1)*z;
    if (middleIsSolved) {
      arrx=[cx+cos1(1)*w*z, cx+cos1(4)*w*z, cx+cos1(7)*w*z, cx+cos1(10)*w*z];
      arry=[cy-sin1(1)*w*z, cy-sin1(4)*w*z, cy-sin1(7)*w*z, cy-sin1(10)*w*z];
      drawPolygon(r, "x", width, height, arrx, arry);
      
      cy += 10;
      arrx=[cx+cos1(0)*w, cx+cos1(0)*w, cx+cos1(1)*w*z, cx+cos1(1)*w*z];
      arry=[cy-sin1(1)*w*z, cy-sin1(1)*z, cy-sin1(1)*z, cy-sin1(1)*w*z, cy-sin1(1)*w*z];
      drawPolygon(r, colorString[5], width, height, arrx, arry)

      arrx=[cx+cos1(0)*w, cx+cos1(0)*w, cx+cos1(10)*w*z, cx+cos1(10)*w*z];
      arry=[cy-sin1(1)*w*z, cy-sin1(1)*z, cy-sin1(1)*z, cy-sin1(1)*w*z, cy-sin1(1)*w*z];
      drawPolygon(r, colorString[5], width, height, arrx, arry)
      cy -= 10;
    }
    else {
      arrx=[cx+cos1(1)*w*z, cx+cos1(4)*w*z, cx+cos1(6)*w, cx+cos1(9)*w*z, cx+cos1(11)*w*z, cx+cos1(0)*w];
      arry=[cy-sin1(1)*w*z, cy-sin1(4)*w*z, cy-sin1(6)*w, cy+sin1(9)*w*z, cy-sin1(11)*w*z, cy-sin1(0)*w];
      drawPolygon(r, "x", width, height, arrx, arry);

      arrx=[cx+cos1(9)*w*z, cx+cos1(11)*w*z, cx+cos1(11)*w*z, cx+cos1(9)*w*z];
      arry=[cy+sin1(9)*w*z-h, cy-sin1(11)*w*z-h, cy-sin1(11)*w*z, cy+sin1(9)*w*z];
      drawPolygon(r, colorString[4], width, height, arrx, arry);

      cy += 10;
      arrx=[cx+cos1(0)*w, cx+cos1(0)*w, cx+cos1(1)*w*z, cx+cos1(1)*w*z];
      arry=[cy-sin1(1)*w*z, cy-sin1(1)*z, cy-sin1(1)*z, cy-sin1(1)*w*z];
      drawPolygon(r, colorString[5], width, height, arrx, arry)

      arrx=[cx+cos1(0)*w, cx+cos1(0)*w, cx+cos1(11)*w*z, cx+cos1(11)*w*z];
      arry=[cy-sin1(1)*w*z, cy-sin1(1)*z, cy-sin1(11)*w*z + h, cy-sin1(11)*w*z];
      drawPolygon(r, colorString[2], width, height, arrx, arry)
      cy -= 10;
    }
     
    //fill and outline first layer
    var sc = 0;
    for(var foo=0; sc<12; foo++){
      if (shapes.length<=foo) sc = 12;
      if (shapes.charAt(foo)==="x") sc++;
      if (shapes.charAt(foo)==="c"){
        arrx=[cx, cx+cos1(sc), cx+cos1(sc+1)*z, cx+cos1(sc+2)];
        arry=[cy, cy-sin1(sc), cy-sin1(sc+1)*z, cy-sin1(sc+2)];
        drawPolygon(r, stickers.charAt(foo), width, height, arrx, arry)
    
        arrx=[cx+cos1(sc), cx+cos1(sc+1)*z, cx+cos1(sc+1)*w*z, cx+cos1(sc)*w];
        arry=[cy-sin1(sc), cy-sin1(sc+1)*z, cy-sin1(sc+1)*w*z, cy-sin1(sc)*w];
        drawPolygon(r, stickers.charAt(16+sc), width, height, arrx, arry)
      
        arrx=[cx+cos1(sc+2), cx+cos1(sc+1)*z, cx+cos1(sc+1)*w*z, cx+cos1(sc+2)*w];
        arry=[cy-sin1(sc+2), cy-sin1(sc+1)*z, cy-sin1(sc+1)*w*z, cy-sin1(sc+2)*w];
        drawPolygon(r, stickers.charAt(17+sc), width, height, arrx, arry)
   
        sc +=2;
      }
      if (shapes.charAt(foo)==="e"){
        arrx=[cx, cx+cos1(sc), cx+cos1(sc+1)];
        arry=[cy, cy-sin1(sc), cy-sin1(sc+1)];
        drawPolygon(r, stickers.charAt(foo), width, height, arrx, arry)
    
        arrx=[cx+cos1(sc), cx+cos1(sc+1), cx+cos1(sc+1)*w, cx+cos1(sc)*w];
        arry=[cy-sin1(sc), cy-sin1(sc+1), cy-sin1(sc+1)*w, cy-sin1(sc)*w];
        drawPolygon(r, stickers.charAt(16+sc), width, height, arrx, arry)
    
        sc +=1;
      }
    }
   
    //fill and outline second layer
    cx += 100;  
    cy += 10;


    var h = sin1(1)*w*z - sin1(1)*z;
    if (middleIsSolved) {
      arrx=[cx+cos1(1)*w*z, cx+cos1(4)*w*z, cx+cos1(7)*w*z, cx+cos1(10)*w*z];
      arry=[cy+sin1(1)*w*z, cy+sin1(4)*w*z, cy+sin1(7)*w*z, cy+sin1(10)*w*z];
      drawPolygon(r, "x", width, height, arrx, arry);
      
      cy -= 10;
      arrx=[cx+cos1(0)*w, cx+cos1(0)*w, cx+cos1(1)*w*z, cx+cos1(1)*w*z];
      arry=[cy+sin1(1)*w*z, cy+sin1(1)*z, cy+sin1(1)*z, cy+sin1(1)*w*z, cy+sin1(1)*w*z];
      drawPolygon(r, colorString[5], width, height, arrx, arry)

      arrx=[cx+cos1(0)*w, cx+cos1(0)*w, cx+cos1(10)*w*z, cx+cos1(10)*w*z];
      arry=[cy+sin1(1)*w*z, cy+sin1(1)*z, cy+sin1(1)*z, cy+sin1(1)*w*z, cy+sin1(1)*w*z];
      drawPolygon(r, colorString[5], width, height, arrx, arry)
      cy += 10;
    }
    else {
      arrx=[cx+cos1(1)*w*z, cx+cos1(4)*w*z, cx+cos1(6)*w, cx+cos1(9)*w*z, cx+cos1(11)*w*z, cx+cos1(0)*w];
      arry=[cy+sin1(1)*w*z, cy+sin1(4)*w*z, cy+sin1(6)*w, cy-sin1(9)*w*z, cy+sin1(11)*w*z, cy+sin1(0)*w];
      drawPolygon(r, "x", width, height, arrx, arry);

      arrx=[cx+cos1(9)*w*z, cx+cos1(11)*w*z, cx+cos1(11)*w*z, cx+cos1(9)*w*z];
      arry=[cy-sin1(9)*w*z+h, cy+sin1(11)*w*z+h, cy+sin1(11)*w*z, cy-sin1(9)*w*z];
      drawPolygon(r, colorString[4], width, height, arrx, arry);

      cy -= 10;
      arrx=[cx+cos1(0)*w, cx+cos1(0)*w, cx+cos1(1)*w*z, cx+cos1(1)*w*z];
      arry=[cy+sin1(1)*w*z, cy+sin1(1)*z, cy+sin1(1)*z, cy+sin1(1)*w*z];
      drawPolygon(r, colorString[5], width, height, arrx, arry)

      arrx=[cx+cos1(0)*w, cx+cos1(0)*w, cx+cos1(11)*w*z, cx+cos1(11)*w*z];
      arry=[cy+sin1(1)*w*z, cy+sin1(1)*z, cy+sin1(11)*w*z - h, cy+sin1(11)*w*z];
      drawPolygon(r, colorString[2], width, height, arrx, arry)
      cy += 10;
    }

    var sc = 0;
    for(sc=0; sc<12; foo++){
      if (shapes.length<=foo) sc = 12;
      if (shapes.charAt(foo)==="x") sc++;
      if (shapes.charAt(foo)==="c"){
        arrx=[cx, cx+cos2(sc), cx+cos2(sc+1)*z, cx+cos2(sc+2)];
        arry=[cy, cy-sin2(sc), cy-sin2(sc+1)*z, cy-sin2(sc+2)];
        drawPolygon(r, stickers.charAt(foo), width, height, arrx, arry)
   
        arrx=[cx+cos2(sc), cx+cos2(sc+1)*z, cx+cos2(sc+1)*w*z, cx+cos2(sc)*w];
        arry=[cy-sin2(sc), cy-sin2(sc+1)*z, cy-sin2(sc+1)*w*z, cy-sin2(sc)*w];
        drawPolygon(r, stickers.charAt(28+sc), width, height, arrx, arry)
    
        arrx=[cx+cos2(sc+2), cx+cos2(sc+1)*z, cx+cos2(sc+1)*w*z, cx+cos2(sc+2)*w];
        arry=[cy-sin2(sc+2), cy-sin2(sc+1)*z, cy-sin2(sc+1)*w*z, cy-sin2(sc+2)*w];
        drawPolygon(r, stickers.charAt(29+sc), width, height, arrx, arry)

        sc +=2;
   
      }
      if (shapes.charAt(foo)==="e"){
        arrx=[cx, cx+cos2(sc), cx+cos2(sc+1)];
        arry=[cy, cy-sin2(sc), cy-sin2(sc+1)];
        drawPolygon(r, stickers.charAt(foo), width, height, arrx, arry)
    
        arrx=[cx+cos2(sc), cx+cos2(sc+1), cx+cos2(sc+1)*w, cx+cos2(sc)*w];
        arry=[cy-sin2(sc), cy-sin2(sc+1), cy-sin2(sc+1)*w, cy-sin2(sc)*w];
        drawPolygon(r, stickers.charAt(28+sc), width, height, arrx, arry)
   
        sc +=1;
      }
    }

  }

  var remove_duplicates = function(arr) {
    var out = [];
    var j=0;
    for (var i=0; i<arr.length; i++)
    {
      if(i===0 || arr[i]!=arr[i-1])
      out[j++] = arr[i];
    }
    return out;
  }

  var drawScramble = function(parentElement, sq1State, w, h) {
//	console.log(sq1State);
    var state = sq1State["arr"];

    var colorString = "yobwrg";  //In dlburf order.
      
    var posit;
    var scrambleString;
    var tb, ty, col, eido;

    var middleIsSolved = sq1State.ml == 0;

    var posit = [];
    
    var map = [5,4,3,2,1,0,11,10,9,8,7,6,17,16,15,14,13,12,23,22,21,20,19,18];
//    FullCube_doMove(sq1State, 1);
//    FullCube_doMove(sq1State, 0);
    for (var j = 0; j < map.length; j++) {
      posit.push(FullCube_pieceAt(sq1State, map[j]));
    }
//    console.log(posit);
        
    var tb = ["3","3","3","3","3","3","3","3","0","0","0","0","0","0","0","0"];
    ty = ["e","c","e","c","e","c","e","c","e","c","e","c","e","c","e","c"];
    col = ["2","12","1","51","5","45","4","24", "4","42","5","54","1","15","2","21"];
 
    var top_side=remove_duplicates(posit.slice(0,12));
    var bot_side=remove_duplicates(posit.slice(18,24).concat(posit.slice(12,18)));
    var eido=top_side.concat(bot_side);

    var a="";
    var b="";
    var c="";
    var eq="_";
    for(var j=0; j<16; j++)
    {
      a+=ty[eido[j]];
      eq=eido[j];
      b+=tb[eido[j]];
      c+=col[eido[j]];
    }
    
    var stickers = (b.concat(c)
      .replace(/0/g,colorString[0])
      .replace(/1/g,colorString[1])
      .replace(/2/g,colorString[2])
      .replace(/3/g,colorString[3])
      .replace(/4/g,colorString[4])
      .replace(/5/g,colorString[5])
    );
    drawSq(stickers, middleIsSolved, a, parentElement, w, h, colorString);

  }

  /*
   * Export public methods.
   */

  return {

    /* mark2 interface */
    version: "July 05, 2015",
    initialize: square1SolverInitialize,
    setRandomSource: function() {console.log("setRandomSource is deprecated. It has no effect anymore.")},
    getRandomScramble: square1SolverGetRandomScramble,
    drawScramble: drawScramble,

    /* Other methods */
    getRandomPosition: square1SolverGetRandomPosition,
    //solve: square1SolverSolve,
    generate: square1SolverGenerate,
  };

})();

scramblers.lib.randomInt.enableInsecureMathRandomFallback();

});