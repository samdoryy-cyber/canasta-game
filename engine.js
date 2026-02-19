// ===== Game Engine PRO =====
const CARD_VALUES = {
  "A":20,"2":20,"3":5,"4":5,"5":5,"6":5,
  "7":5,"8":10,"9":10,"10":10,
  "J":10,"Q":10,"K":10,
  "JOKER":50
};

const FREEZE_CARDS=["2♠","2♣","JOKER"];

function getValue(card){ return card.replace(/♠|♥|♦|♣/g,""); }
function isWild(card){ return getValue(card)==="2" || card==="JOKER"; }

function createDeck(){
  const suits=["♠","♥","♦","♣"];
  const values=["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
  let deck=[];
  for(let s of suits){
    for(let v of values){ deck.push(v+s); }
  }
  deck.push("JOKER"); deck.push("JOKER");
  return shuffle(deck.concat(deck));
}

function shuffle(array){
  for(let i=array.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [array[i],array[j]]=[array[j],array[i]];
  }
  return array;
}

function groupValid(group){
  if(group.length<3) return false;
  let base = group.find(c=>!isWild(c));
  if(!base) return false;
  let baseValue = getValue(base);
  return group.every(c=>isWild(c) || getValue(c)===baseValue);
}

function checkCanasta(group){
  if(group.length!==7) return false;
  let wild = group.filter(isWild).length;
  if(wild===0) return "natural";
  if(wild<=2) return "mixed";
  return false;
}

function checkDreamCanasta(group){ return group.length===7 && group.filter(isWild).length<=2; }
function calculatePoints(group){
  let total=0; group.forEach(c=>{ total+=CARD_VALUES[getValue(c)]||0; });
  return total;
}