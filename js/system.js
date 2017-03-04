
function ListReader(s){
    this.s = s;
    this.i = 0;
    var me = 
    //alert(s);
    this.getc = function(){
        if(this.i >= this.s.length)
            return 0;
        var c = this.s[this.i];
        this.i+=1;
        return c;        
    }
    this.ungetc = function(){
        this.i-=1;
    }
    this.see = function(){
        if(this.i >= this.s.length)
            return 0;
        return this.s[this.i];        
    }
}
function dset(v){
    var s = {};
    for(var i=0;i<v.length;i++){
        s[v[i]] = true;
    }
    return s;
}
function djoin(a,b){
    
    var s = {};
    for(var i in  a){
        s[i] = true;
    }
    for(var i in  b){
        s[i] = true;
    }
    return s;
}

var tkbegin = dset([
    "a","b","c","d","e","f","g","h","i","j","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z",
    "A","B","C","D","E","F","G","H","I","J","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z",
    "_","$"
]);

var tkmed = djoin(tkbegin, dset(["0","1","2","3","4","5","6","7","8","9","."]));

var tkops = dset(["=","+","-","/","*","(",")","{","}","/*",","]);
var nums = dset(["0","1","2","3","4","5","6","7","8","9"]);

var pri = {
    "=":0,
    "+":1,
    "-":1,
    "*":2,
    "/":2,
    "&-":3
};

function readRestToken(reader){
    var s = "";
    var c=1;
    do{
        c= reader.getc();
        if(c!==0){
            if(c in tkmed){
                s+= c;
            }else{
                reader.ungetc();
                c = 0;
            }
        }
    }while(c!==0);
    return s;
}
function readStr(reader){
    var s = "";
    var c=1;
    do{
        c= reader.getc();
        if(c!==0){
            if(c =='"'){
                c=0;
            }else{
                s+= c;
            }
        }
    }while(c!==0);
    return s;
}
function tokenize(reader){
    var c=1;
    var tks = [];
    do{
        c= reader.getc();
        //console.log(c.charCodeAt(0));
        if(c!==0){
            if(c in nums || (c=='-' && reader.see() in nums)){
                var ns = c;
                var c2 =0;
                do{
                    c2 = reader.getc();
                    if(c2!==0 && (c2== '.' || c2 in nums) ){
                        ns+= c2;
                    }else {
                        if(c2!==0)
                            reader.ungetc();
                        break;
                    }
                }while(c2!==0);
                tks.push(ns);                
            }else if(c in tkmed){
                var tk = c+ readRestToken(reader);
                tks.push(tk);
            }else if(c in tkops){
                tks.push(c);
                
            }else if(c=='"'){
                tks.push(tk);
            }
        }
    }while(c!==0);
    return tks;
}

var register = {
    
};


function Exp(){
    this.type = "none";
}
Exp.prototype.print = function(){
    return "undefined";
}
Exp.prototype.eq = function(o){
    return false;
}
Exp.prototype.add = function(o){
    return null;
}
Exp.prototype.mul = function(o){
    return null;
}
Exp.prototype.div = function(o){
    return null;
}
Exp.prototype.ldiv = function(o){
    return null;
}

Exp.prototype.execute = function(){
    return this;
}
Exp.prototype.derivate = function(x){
    return C(0);
}

function ErrorExp(m){
    this.type = "error";
    this.m = m;
}
ErrorExp.prototype = new Exp();
ErrorExp.prototype.print = function(){
    return "ERROR: " + this.m ;
}
ErrorExp.prototype.execute = function(){
    return this;
}
ErrorExp.prototype = new Exp();

function ConstExp(a){
    this.type = "const";
    this.v = a;
}
ConstExp.prototype = new Exp();

ConstExp.prototype.print = function(){
    return this.v+"";
}
ConstExp.prototype.execute = function(){
    return this;
}

ConstExp.prototype.eq = function(o){
    return o.type == this.type && o.v == this.v;
}
ConstExp.prototype.ldiv = function(o){
    return mul(o.execute(), 1.0/this.v).execute();
}
ConstExp.prototype.add = function(o){
    if(this.v==0)
        return o;
        
    if(o.type=="const"){
        return C(this.v+o.v);;
    }
    return null;
}
ConstExp.prototype.mul = function(o){
    if(this.v == 0)
        return C(0);
    if(o.type=="const"){
        return C(this.v*o.v);;
    }
    return null;
}
ConstExp.prototype.sub = function(o){
    if(o.type=="const"){
        return C(this.v-o.v);;
    }
    return null;
}
ConstExp.prototype.div = function(o){
    if(o.type=="const"){
        return C(this.v/o.v);;
    }
    return null;
}
ConstExp.prototype.derivate = function(x){
    return C(0);
}

function VarExp(a){
    this.type = "var";
    this.v = a;
}
VarExp.prototype = new Exp();

VarExp.prototype.add = function(o){
    if(o.type=="var" && o.v == this.v){
        return mul(o,C(2)).execute();
    }
    return null;
}
VarExp.prototype.print = function(){
    return this.v+"";
}
VarExp.prototype.execute = function(){
    if(this.v in register){
        return register[this.v];
    }else{
        return this;
    }
}
VarExp.prototype.eq = function(o){
    return o.type == this.type && o.v == this.v;
}

VarExp.prototype.derivate = function(x){
    console.log("D " + x + " " + this.v);
    if(x!=this.v)
        return C(0);
    else
        return C(1);
}
function sum(v){
    return new SumExp(v);
}
function SumExp(v){
    this.type = "sum";
    this.v = v;
    console.log(v);
}
SumExp.prototype = new Exp();

SumExp.prototype.eq  = function(o){
    if(o.type!="sum")return false;
    var allh = true;
    for(var i=0;i<this.v.length;i++){
        var e = this.v[i];  
        var hash = false;
        for(var j=0;j<o.v.length;j++){
            if(e.eq(o.v[j])){
                hash=true;
            }
        }
        if(!hash)
            allh=false;      
    }
    for(var i=0;i<o.v.length;i++){
        var e = o.v[i];       
        var hash = false;
        for(var j=0;j<this.v.length;j++){
            if(e.eq(this.v[j])){
                hash=true;
            }
        }
        if(!hash)
            allh=false;            
    }
    return allh;
}
SumExp.prototype.print = function(){
    var s = "";
    for(var i=0;i<this.v.length;i++){
        var e = this.v[i];
        
        if(e.type=="mul" && e.v[0].type == "const" && e.v[0].v== -1){
            s+= "-";
            for(var j=1;j<e.v.length;j++){
                if(j>1)
                    s+="*";
                s+=e.v[j].print();
            }       
        }else{
            if(i>0)
                s+=" + ";
            s+= e.print();
        }
    }
    return "("+s+")";
}
SumExp.prototype.execute = function(){
    var v = [];    
    for(var i=0;i<this.v.length;i++){
        var e = this.v[i].execute();
        if(e.type=="sum"){
            v =  v.concat(e.v);
        }else v.push(e);      
    }
    var acc=0;
    var ff =[];
    for(var i=0;i<v.length;i++){
        var e = v[i];
        var f = e;
        var mg = false;
        for(var j=0;j<ff.length;j++){
            var o = ff[j].add(e);
            if(o==null)
                o = e.add(ff[j]);
            if(o!=null){
                ff[j] = o;
                mg = true;
            }
        }
        if(!mg)
            ff.push(f);
    }
    if(ff.length==1)
        return ff[0];
    else
        return sum(ff);
}
SumExp.prototype.derivate = function(x){
    var v = [];    
    for(var i=0;i<this.v.length;i++){
        var e = this.v[i].execute();
        v.push(e.derivate(x));
    }
    return new SumExp(v);
}


function MulExp(v){
    this.type = "mul";
    this.v = v;
    console.log(v);
}
MulExp.prototype = new Exp();

MulExp.prototype.print = function(){
    var s = "";
    for(var i=0;i<this.v.length;i++){
        if(i>0)
            s+="*";
        var e = this.v[i];
        s+= e.print();
    }
    return "("+s+")";
}

MulExp.prototype.eq  = function(o){
    if(o.type!="mul")return false;
    var allh = true;
    for(var i=0;i<this.v.length;i++){
        var e = this.v[i];  
        var hash = false;
        for(var j=0;j<o.v.length;j++){
            if(e.eq(o.v[j])){
                hash=true;
            }
        }
        if(!hash)
            allh=false;      
    }
    for(var i=0;i<o.v.length;i++){
        var e = o.v[i];       
        var hash = false;
        for(var j=0;j<this.v.length;j++){
            if(e.eq(this.v[j])){
                hash=true;
            }
        }
        if(!hash)
            allh=false;            
    }
    return allh;
}
MulExp.prototype.add  = function(o){
    if(o.type!="mul"){
        o = new MulExp([o,C(1)]);
    }
        
    var ssu = null;
    var otp = [];
    var fa =1,fb=1;
    var allh = true;
    for(var i=0;i<this.v.length;i++){
        var e = this.v[i];
        if(e.type=="const")
            fa = e.v;
        else{
            var hash = false;
            for(var j=0;j<o.v.length;j++){
                if(e.eq(o.v[j])){
                    hash=true;
                }
            }
            if(!hash)
                allh=false;            
        }
    }
    for(var i=0;i<o.v.length;i++){
        var e = o.v[i];
        if(e.type=="const")
            fb = e.v;
        else{
            var hash = false;
            for(var j=0;j<this.v.length;j++){
                if(e.eq(this.v[j])){
                    hash=true;
                }
            }
            if(!hash)
                allh=false;            
        }
    }
    if(!hash)   
        return null;
    var m = [];
    for(var i=0;i<this.v.length;i++){
        var e = this.v[i];
        if(e.type!="const")
            m.push(e);
    }
    m.push(C(fa+fb));
    return (new MulExp(m)).execute();    
}

MulExp.prototype.execute = function(){
    var v = [];    
    for(var i=0;i<this.v.length;i++){
        var e = this.v[i].execute();
        if(e.type=="mul"){
            v =  v.concat(e.v);
        }else v.push(e);      
    }
    var acc=0;
    var ff =[];
    for(var i=0;i<v.length;i++){
        var e = v[i];
        var f = e;
        var mg = false;
        for(var j=0;j<ff.length;j++){
            var o = ff[j].mul(e);
            if(o==null)
                o = e.mul(ff[j]);
            if(o!=null){
                ff[j] = o;
                mg = true;
            }
        }
        if(!mg)
            ff.push(f);
    }
    for(var i=0;i<ff.length;i++){
        if(ff[i].type=="const"){
            var e = ff[0];
            ff[0] = ff[i];
            ff[i] = e;
        }
    }
    if(ff.length==1)
        return ff[0];
    else{
        if(ff[0].type=="const" && ff[0].v == 1)
            ff = ff.slice(1);
        return new MulExp(ff);
    }
}
MulExp.prototype.derivate = function(x){
    if(this.v.length==2){
        return add(mul(this.v[0].derivate(x),this.v[1]),
                    mul(this.v[0],this.v[1].derivate(x))).execute();
    }
    var m = null;
    for(var i=0;i<this.v.length;i++){
        var e = this.v[i].execute();
        if(m==null)
            m=e;
        else
            m = mul(m,e);
    }
    return m.derivate(x);
}




function DivExp(a,b){
    this.type = "div";
    this.a = a;
    this.b = b;
}
DivExp.prototype = new Exp();

DivExp.prototype.print = function(){
   
    return "("+this.a.print() + "/" + this.b.print()+")";
}

DivExp.prototype.eq  = function(o){
    if(o.type!="div")return false;
    return this.a.eq(o.a) && this.b.eq(o.b);
}
DivExp.prototype.add  = function(o){
    if(o.type!="div"){
        return null;
    }
    if(this.b.eq(o.b))
        return (new DivExp(new SumExp([o.a,this.a]), this.b)).execute();
    return null;    
}

DivExp.prototype.mul  = function(o){
    if(o.type=="div"){
        return (new DivExp(mul(this.a,o.a), mul(this.b,o.b))).execute();
    }
    return (new DivExp(mul(this.a,o), this.b)).execute(); 
}
DivExp.prototype.execute = function(){
    var a = this.a.execute();
    var b = this.b.execute();
    var o = a.div(b);
    if(o == null)
        o = b.ldiv(a);
    if(o!=null)
        return o.execute();
    else {
        if(a.eq(b))return C(1);
        
        return new DivExp(a,b);
    }
}
DivExp.prototype.derivate = function(x){
    var a = this.a.execute();
    var b = this.b.execute();
    return div(sub(mul(a.derivate(x),b),mul(a,b.derivate(x))), mul(b,b)).execute();
}

function VecExp(v){
    this.type = "vec";
    this.v = v;    
}
VecExp.prototype = new Exp();

VecExp.prototype.print = function(){
    var s = "";
    for(var i=0;i<this.v.length;i++){
        if(i>0)
            s+=",";
        s+= this.v[i].print();
    }
    return "(" + s + ")";
}
VecExp.prototype.execute = function(){
    return this;
}
VecExp.prototype.add = function(o){
    if(o.type == "vec"){
        var v2 = [];
        for(var i=0;i<this.v.length;i++){
            v2.push(add(this.v[i],o.v[i]).execute());
        }
        return new VecExp(v2);
    }
    return this;
}
VecExp.prototype.mul = function(o){
    var v2 = [];
    for(var i=0;i<this.v.length;i++){
        v2.push(mul(this.v[i],o).execute());
    }
    return new VecExp(v2);        
}
VecExp.prototype.derivate = function(x){
    var v =[];
    for(var i=0;i<this.v.length;i++){
        v.push(this.v.derivate(x));
    }
    return vec(v);    
}
function vec(args){
    return new VecExp(args);
}


var opsf = {};
opsf["="] = function(a,b){
    if(a.type!='var'){
        return Exp();
    }else{
        register[a.v] = b.execute();
        return b;
    }
}
function add(a,b){
    return new SumExp([a,b]);
}
function div(a,b){
    return new DivExp(a,b);
}
function sub(a,b){
    return new OpExp("-",a,b);
}
function mul(a,b){
    return new MulExp([a,b]);
}

function isZero(a){
    return a.type == "const" && a.v ==0;
}
function op(o,a,b){
    return new OpExp(o,a,b);
}

function op1(o,a){
    return new Op1Exp(o,a);
}
function minus(a){
    return op1("-",a);
}

var opsr = {};
var opsr1 = {};
opsr["+"] = {
    "reduce":function(a,b){
        if(isZero(a)){
            return b;
        }   
        if(isZero(b)){
            return a;
        }             

        var c = a.add(b);
        if(c==null)
            c = b.add(a);
        if(c!=null){
            return c;
        }else{
            return (new SumExp([a,b])).execute();
        }
    },
    "derivate":function(x,a,b){
        return add(a.derivate(x),b.derivate(x));
    },
        
    "eq": function(a,b){
        return a.l.eq(b.l) && a.r.eq(b.r);
    }
}
opsr1["-"] = {
    "reduce":function(a){
        if(a.type=='const' ){
            return C(-a.v);
        }else{
            return minus(a);
        }
    },
    "derivate":function(x,a){
        return minus(a.derivate(x));
    }
}
opsr["-"] = {
    "reduce":function(a,b){
        if(isZero(a)){
            return minus(b);
        }   
        if(isZero(b)){
            return a;
        }
        var b2 = mul(b,C(-1)).execute();
        a = a.execute();
        
        var c = a.add(b2);
        if(c==null)
            c = b2.add(a);
        if(c!=null){
            return c.execute();
        }else{
            return new SumExp([a,b2]).execute();
        }
    },
    "derivate":function(x,a,b){
        return new OpExp("-",a.derivate(x),b.derivate(x));
    }
}

function isOne(a){
    return a.type == "const" && a.v == 1;
}
opsr["*"] = {
    "reduce":function(a,b){
        if(isOne(a)){
            return b;
        }   
        if(isOne(b)){
            return a;
        } 
        if(isZero(a) || isZero(b)){
            return C(0);
        }        
        var c = a.mul(b);
        if(c==null)
            c = b.mul(a);
        if(c!=null){
            return c;
        }else{
            return (new MulExp([a,b])).execute();
        }
    }
    ,
    "derivate":function(x,a,b){
        console.log("m " + x);
        return add(mul(a.derivate(x),b),mul(b.derivate(x),a));
    }
}
opsr["/"] = {
    "reduce":function(a,b){
        if(isZero(a) || isZero(b)){
            return C(0);
        }        

        var c = a.div(b);
        if(c!=null){
            return c;
        }else{
            return (new DivExp(a,b)).execute();
        }
    }
    ,
    "derivate":function(x,a,b){
        return div(sub(mul(a.derivate(x),b),mul(b.derivate(x),a)), mul(b,b));
    }
}

function OpExp(op,a,b){
    this.type = "op";
    this.l = a;
    this.p = false;
    this.r = b;
    this.op = op;
}
OpExp.prototype = new Exp();

OpExp.prototype.execute = function(){
    if(this.op in opsf){
        return opsf[this.op](this.l,this.r);
    }else if(this.op in opsr){
        return opsr[this.op].reduce(this.l.execute(), this.r.execute());
    }else{
        return this;
    }
}
var commut = dset(["+","-","*"]);
OpExp.prototype.eq = function(o){
    if(o.type!="op" || o.op!=this.op)return false;
    if(o.l.eq(this.l) && o.r.eq(this.r))
        return true;
    if(this.op in commut)
        return o.l.eq(this.r) && o.r.eq(this.l);
    else
        return false;
}

OpExp.prototype.print = function(){
    if(this.l!=null){
        return "(" + this.l.print()+" " + this.op +" " + this.r.print()+")";
    }else return "("+this.op+" " + this.r.print()+")";
}
OpExp.prototype.derivate = function(x){
    if(this.op in opsr){
        return opsr[this.op].derivate(x,this.l, this.r);
    }else{
        return new ConstExp(0);
    }
}


function Op1Exp(op,a){
    this.type = "op1";
    this.l = a;
    this.p = false;
    this.op = op;
}
Op1Exp.prototype = new Exp();

Op1Exp.prototype.execute = function(){
     if(this.op in opsr1){
        return opsr1[this.op].reduce(this.l.execute());
    }else{
        return this;
    }
}
Op1Exp.prototype.print = function(){
    return "("+this.op +" " + this.l.print()+")";
}
Op1Exp.prototype.derivate = function(x){
    if(this.op in opsr1){
        return opsr1[this.op].derivate(x,this.l);
    }else{
        return new ConstExp(0);
    }
}


function FuncExp(f,args){
    this.type = "func";
    this.f = f;
    this.args = args;
    console.log(f);
}
FuncExp.prototype = new Exp();

FuncExp.prototype.print = function(){
    var s = this.f+"(";
    for(var i=0;i<this.args.length;i++){
        if(i>0)
            s+=' , ';
        s+= this.args[i].print();
    }
    return s+")";
}
FuncExp.prototype.execute = function(){
    if(this.f in register){
        var v = [];
        for(var i=0;i<this.args.length;i++){
            v.push(this.args[i].execute());
        }
        return register[this.f].exec(v);
    }
}
FuncExp.prototype.derivate = function(x){
    if(this.f in register){
        var v = [];
        for(var i=0;i<this.args.length;i++){
            v.push(this.args[i].execute());
        }
        return register[this.f].derivate(v,x);
    }
}
function F(n,ar){
    return new FuncExp(n,ar);
}
function C(n){
    return new ConstExp(n);
}

register["sin"] = {
    exec:function(args){
        if(args[0].type=="const")
            return C(Math.sin(args[0].v));
        else
            return F("sin",args);
    }
};


register["sqrt"] = {
    exec:function(args){
        if(args[0].type=="const")
            return C(Math.sqrt(args[0].v));
        else
            return F("sqrt",args);
    },
    derivate:function(args,x){
        return mul(div(C(-0.5),F("sqrt",args)), args[0].derivate(x)).execute();
    }
};
register["D"] = {
    exec:function(args){
        console.log("F2 "+args[1].v);
        console.log(args);
        return args[0].execute().derivate(args[1].v).execute();
    }
};

register["Vector"] = {
    exec:function(args){
        return new VecExp(args);
    }
};
register["dot"] = {
    exec:function(args){
        console.log(args);
        var res = mul(args[0].v[0],args[1].v[0]);
        for(var i=1;i<args[0].v.length;i++){
            res = add(res, mul(args[0].v[i],args[1].v[i]));
        }
        console.log(res);
        return res.execute();
    }
};
register["cross"] = {
    exec:function(args){
        var a = args[0].v;
        var b = args[1].v;
        
        return vec([sub(mul(a[1],b[2]),mul(a[2],b[1])),
                    sub(mul(a[2],b[0]),mul(a[0],b[2])),
                    sub(mul(a[0],b[1]),mul(a[1],b[0]))]);
    }
};

function readUntil(reader,ec){
    var l = [];
    var c;
    do{
        c = reader.getc();
        if(c!=ec && c!==0)
            l.push(c);
    }while(c!=ec && c!==0);
    return l;
}
function readUntil2(reader,ec){
    var l = [];
    var c;
    var p = 0;
    do{
        c = reader.getc();              
        if(c==ec && p==0)
            break;
        else{                
            if(c=='(')
                p++;
            if(c==')')
                p--;  
            l.push(c);
        }
    }while(c!==0);
    return l;
}
function analize(reader){
    
    var left , right, op;
    var o;
    do{
        o = reader.getc();
        if(o!==0){ 
            if(o in pri){
                op = o;
            }else{ 
                if(o=='('){
                    o = analize(new ListReader(readUntil2(reader,')')));
                }else{
                    if(reader.see()=='('){
                        reader.getc();
                        var pl = new ListReader(readUntil2(reader,')'));//param list
                        var ppc = 0;
                        var ll = [];
                        var args = [];
                        var c =0;
                        do{
                            c = pl.getc();
                            if(c==')'){
                                ppc--;
                            }else
                            if(c=='(')
                                ppc++;
                            if(ppc>=0 && c!==0){
                                if(c==',' && ppc==0){
                                    console.log(ll);
                                    args.push(analize(new ListReader(ll)));
                                    ll =[];
                                }else{
                                    ll.push(c);
                                }
                            }
                                
                        }while(c!==0 && ppc>=0);
                        console.log(ll);
                        args.push(analize(new ListReader(ll)));
                        o = new FuncExp(o, args);
                    }else{
                        
                        if(!isNaN(o))
                            o = new ConstExp(parseFloat(o));
                        else 
                            o = new VarExp(o);                        
                    }
                }
                
                if(op!=null){
                    right = o;
                    if(left != null && left.type=='op' && !left.p &&  pri[left.op] <  pri[op]){
                        left.r = new OpExp(op, left.r,right);
                    }else{
                        if(left==null){
                            left = new Op1Exp(op, right);
                        }else left = new OpExp(op, left,right);
                    }            
                }else{
                    left = o;
                }
            }
        }
    }while(o!==0);
    if(left.type=='op')
        left.p = true;
    return left;
}

function el(ht, childs){
    var e = $(ht);
    for(var i=0;i<childs.length;i++){
        e.append(childs[i]);
    }
    return e;
}
var promp = null;
function summ(){
    var lc = promp.val().split("\n");
    var out = "";
    for(var i=0;i<lc.length;i++){
        var tks = tokenize(new ListReader(lc[i]));
        if(tks.length>0){
            var rrr = analize(new ListReader(tks)).execute();
            out+= lc[i] +"\n>>>>\n"+rrr.print()+"\n-----\n";
           // $("#history").append(el('<div class="he"></div>',[rrr.print()])); 
        }
    }
    
    nextPromp(out);
}
var his =$("#history"); 
var la = null;
function addE(e){
    his.append(la = el('<div class="he"></div>',[e]));
}
function nextPromp(msg){
    if(promp!=null){
        var tx = promp.val();

        la.remove();
       // addE("<pre>"+tx+"</pre>");
    }
    addE("<pre>"+msg+"</pre>");
    promp = $('<textarea class="texti" name="Text1" cols="40" rows="5"></textarea>');        
    promp.keydown(function (event) {
        if (event.keyCode == 13) {         
            if(!event.shiftKey){
                event.stopPropagation();
                summ();
            } 
        }
    });
    addE(promp);
    promp.focus();

}
nextPromp("welcome to xaxaxa");
