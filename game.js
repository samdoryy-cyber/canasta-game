let playerId="p_"+Math.floor(Math.random()*100000);
let playerName=prompt("اسمك");
let roomId=prompt("رقم الغرفة");

const roomRef=database.ref("rooms/"+roomId);

roomRef.child("players/"+playerId).set({name:playerName,score:0});
roomRef.child("players/"+playerId).onDisconnect().remove();

roomRef.child("players").on("value",snap=>{
  let players=snap.val();
  if(!players) return;
  if(Object.keys(players).length===4) initGame(players);
});

let selected=[];

function initGame(players){
  roomRef.child("state").once("value").then(snap=>{
    if(snap.exists()) return;

    let deck=createDeck();
    let ids=Object.keys(players);
    let hands={};
    let melds={}; let scores={};

    ids.forEach(id=>{
      hands[id]=deck.splice(0,15);
      melds[id]=[];
      scores[id]=0;
    });

    roomRef.child("state").set({
      deck:deck,
      discard:[],
      hands:hands,
      turn:ids[0],
      freeze:false,
      freezeCount:0,
      melds:melds,
      scores:scores
    });
  });

  listen();
}

function listen(){
  roomRef.child("state").on("value",snap=>{
    let g=snap.val(); if(!g) return;

    renderHand(g.hands[playerId]||[]);
    document.getElementById("turnInfo").innerText="الدور: "+g.turn;
    document.getElementById("freezeInfo").innerText=g.freeze?"المهملات مجمدة":"";
    updateDiscard(g.discard);
  });
}

function renderHand(hand){
  const div=document.getElementById("hand"); div.innerHTML="";
  hand.sort();
  hand.forEach(card=>{
    const c=document.createElement("div"); c.className="card"; c.innerText=card;
    c.onclick=()=>{
      if(selected.includes(card)){
        selected=selected.filter(x=>x!==card); c.style.background="white";
      }else{
        selected.push(card); c.style.background="yellow";
      }
    };
    div.appendChild(c);
  });
}

function draw(){
  roomRef.child("state").once("value").then(snap=>{
    let g=snap.val(); if(g.turn!==playerId) return alert("ليس دورك");
    if(g.deck.length===0) return;

    let card=g.deck.pop();
    g.hands[playerId].push(card);
    roomRef.child("state").update({deck:g.deck,hands:g.hands});
  });
}

function discard(card){
  roomRef.child("state").once("value").then(snap=>{
    let g=snap.val(); if(g.turn!==playerId) return;

    g.hands[playerId]=g.hands[playerId].filter(c=>c!==card);
    g.discard.push(card);

    if(FREEZE_CARDS.includes(card)){ g.freeze=true; g.freezeCount=0; }

    let ids=Object.keys(g.hands); let next=(ids.indexOf(playerId)+1)%ids.length;
    g.turn=ids[next];

    if(g.freeze){ g.freezeCount++; if(g.freezeCount>=4){ g.freeze=false; g.freezeCount=0; } }

    roomRef.child("state").set(g);
  });
}

function createMeld(){
  roomRef.child("state").once("value").then(snap=>{
    let g=snap.val(); if(g.turn!==playerId) return alert("ليس دورك");
    if(!groupValid(selected)) return alert("دمج غير صحيح");

    g.melds[playerId].push(selected);
    g.hands[playerId]=g.hands[playerId].filter(c=>!selected.includes(c));

    // كنستا
    let type=checkCanasta(selected); let points=calculatePoints(selected);
    if(checkDreamCanasta(selected)) points+=2000;
    else if(type==="natural") points+=500;
    else if(type==="mixed") points+=300;

    g.scores[playerId]+=points;
    selected=[]; roomRef.child("state").set(g);
  });
}

function takeDiscard(){
  roomRef.child("state").once("value").then(snap=>{
    let g=snap.val(); if(g.turn!==playerId) return;
    if(g.freeze) return alert("المهملات مجمدة");
    if(g.discard.length===0) return;

    let top=g.discard[g.discard.length-1];
    let canUse=selected.some(c=>getValue(c)===getValue(top));
    if(!canUse) return alert("يجب الدمج فوراً");

    g.hands[playerId].push(...g.discard);
    g.discard=[];
    roomRef.child("state").set(g);
  });
}

function endRound(){
  roomRef.child("state").once("value").then(snap=>{
    let g=snap.val(); if(!g) return;

    Object.keys(g.hands).forEach(id=>{
      let penalty=0;
      g.hands[id].forEach(c=>{ penalty+=CARD_VALUES[getValue(c)]||0; });
      g.scores[id]-=penalty;
    });

    alert("انتهت الجولة\n" + JSON.stringify(g.scores,null,2));
    roomRef.child("state").remove();
  });
}

function updateDiscard(pile){
  document.getElementById("discardPile").innerText=pile.length?pile[pile.length-1]:"";
}