import { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, onSnapshot, addDoc, updateDoc, arrayUnion, arrayRemove, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBex4onukJzgxMlMHkSdBmBmaIfRtCPGg8",
  authDomain: "united-movie-marathons.firebaseapp.com",
  projectId: "united-movie-marathons",
  storageBucket: "united-movie-marathons.firebasestorage.app",
  messagingSenderId: "1003386622942",
  appId: "1:1003386622942:web:86e2bd2f307fc6e2b7834f",
};
const fbApp = initializeApp(firebaseConfig);
const db = getFirestore(fbApp);

const AVATAR_COLORS = ["#ff4d6d","#4ecdc4","#ffe66d","#a29bfe","#fd9644","#26de81"];
const HP_HOUSES = [
  {name:"Gryffindor",color:"#740001",accent:"#FFD700",emoji:"🦁"},
  {name:"Slytherin",color:"#1a472a",accent:"#aaaaaa",emoji:"🐍"},
  {name:"Ravenclaw",color:"#0e1a40",accent:"#b0c4de",emoji:"🦅"},
  {name:"Hufflepuff",color:"#ecb939",accent:"#000000",emoji:"🦡"},
];
const QUOTES = [
  '"After all this time? Always... movie night." 🪄',
  '"Happiness can be found if one only remembers to turn on Netflix." ✨',
  '"Not a single one of us is sleeping until we finish this trilogy." 🍿',
  '"It takes bravery to sit through a 3hr film together." 🦁',
];
const QUIZ = [
  {id:"q1",text:"It's Friday night. You:",options:["Cancel plans, couch mode 🛋️","Gather the squad immediately 🎉","'Plans? What plans?' 🙃","Start a film, asleep in 10 mins 💤"]},
  {id:"q2",text:"Your Hogwarts house is obviously:",options:["Gryffindor, brave AND chaotic 🦁","Slytherin, just ambitious 🐍","Ravenclaw, the smart one 🦅","Hufflepuff and proud 🦡"]},
  {id:"q3",text:"Movie night snack order:",options:["Cinema popcorn only 🍿","Full charcuterie, we're adults 🧀","Whatever's in the fridge 🚪","Delivery from 3 places 🛵"]},
  {id:"q4",text:"Your movie gets 4% on Rotten Tomatoes. You:",options:["Watch harder out of spite 😤","Pretend you didn't suggest it 😶","Own it as a personality trait 🏆","'Critics don't understand cinema' 🎭"]},
  {id:"q5",text:"If Dobby asked for your sock right now:",options:["Give my best sock immediately 🧦","A slightly used one 🙄","I'd negotiate 😤","Is this a trick question 🤔"]},
  {id:"q6",text:"Your United role is:",options:["The one who picks everything 📋","The one asleep first 💤","Crying unexpectedly 😭","Already seen it, spoils it 👀"]},
];
const PERSONALITY = [
  {title:"The Chaos Curator",emoji:"🎪",desc:"Unhinged taste, zero regrets. Masterpieces or disasters — no in between."},
  {title:"The Sleepy Cinephile",emoji:"😴",desc:"Incredible taste, 9pm bedtime. You've 'watched' hundreds of films."},
  {title:"The Vibe Checker",emoji:"✨",desc:"Doesn't care what's on as long as blankets are soft. You are the glue."},
  {title:"The Movie Nerd",emoji:"🎬",desc:"Seen everything, has opinions about aspect ratios, will mention the director's cut."},
];
const MOVIES = [
  {id:"m1",title:"Harry Potter & the Prisoner of Azkaban",year:2004,genre:"Fantasy",emoji:"🪄",desc:"Widely considered the best HP film.",runtime:"2h 22m"},
  {id:"m2",title:"Interstellar",year:2014,genre:"Sci-Fi",emoji:"🚀",desc:"Nolan's space epic. Someone WILL cry.",runtime:"2h 49m"},
  {id:"m3",title:"Everything Everywhere All at Once",year:2022,genre:"Sci-Fi",emoji:"🥟",desc:"Chaotic multiverse. Everyone cries. 10/10.",runtime:"2h 19m"},
  {id:"m4",title:"The Grand Budapest Hotel",year:2014,genre:"Comedy",emoji:"🏨",desc:"Wes Anderson's most beloved.",runtime:"1h 39m"},
  {id:"m5",title:"Midsommar",year:2019,genre:"Horror",emoji:"🌸",desc:"Beautiful Swedish horror.",runtime:"2h 28m"},
  {id:"m6",title:"Knives Out",year:2019,genre:"Thriller",emoji:"🔪",desc:"Whodunnit perfection.",runtime:"2h 10m"},
  {id:"m7",title:"Spirited Away",year:2001,genre:"Animation",emoji:"🐉",desc:"Studio Ghibli masterpiece.",runtime:"2h 5m"},
  {id:"m8",title:"Parasite",year:2019,genre:"Thriller",emoji:"🏠",desc:"Bong Joon-ho's masterpiece.",runtime:"2h 12m"},
  {id:"m9",title:"Dune: Part Two",year:2024,genre:"Sci-Fi",emoji:"🏜️",desc:"Epic sci-fi sequel. Stunning visuals.",runtime:"2h 46m"},
  {id:"m10",title:"The Substance",year:2024,genre:"Horror",emoji:"💉",desc:"Wild body horror. Incredible.",runtime:"2h 20m"},
  {id:"m11",title:"Paddington 2",year:2017,genre:"Comedy",emoji:"🐻",desc:"Genuinely one of the greatest films ever made.",runtime:"1h 43m"},
  {id:"m12",title:"Poor Things",year:2023,genre:"Drama",emoji:"🧠",desc:"Bizarre, beautiful, utterly unhinged.",runtime:"2h 21m"},
  {id:"m13",title:"Oppenheimer",year:2023,genre:"Drama",emoji:"💥",desc:"3 hours of Cillian Murphy being haunted.",runtime:"3h"},
  {id:"m14",title:"The Menu",year:2022,genre:"Thriller",emoji:"🍽️",desc:"Dark food satire. Unexpectedly hilarious.",runtime:"1h 47m"},
  {id:"m15",title:"Hereditary",year:2018,genre:"Horror",emoji:"👁️",desc:"The most unsettling film in years.",runtime:"2h 7m"},
  {id:"m16",title:"Whiplash",year:2014,genre:"Drama",emoji:"🥁",desc:"Will make you anxious for 107 minutes.",runtime:"1h 47m"},
  {id:"m17",title:"Clueless",year:1995,genre:"Comedy",emoji:"💅",desc:"A perfect film. No notes.",runtime:"1h 37m"},
  {id:"m18",title:"Harry Potter & the Goblet of Fire",year:2005,genre:"Fantasy",emoji:"🔥",desc:"The tournament! The drama! The Yule Ball!",runtime:"2h 37m"},
  {id:"m19",title:"Lady Bird",year:2017,genre:"Drama",emoji:"🐦",desc:"Greta Gerwig's stunning debut.",runtime:"1h 33m"},
  {id:"m20",title:"Banshees of Inisherin",year:2022,genre:"Drama",emoji:"🪕",desc:"Two Irish men have a feud. Devastating.",runtime:"1h 54m"},
];
const MARATHONS = [
  {id:"t1",title:"Full Harry Potter Marathon",genre:"Fantasy",emoji:"⚡",desc:"All 8 films. ~19 hours. United would not survive but would try.",runtime:"~19 hrs",films:8},
  {id:"t2",title:"Lord of the Rings Extended",genre:"Fantasy",emoji:"💍",desc:"All three extended cuts. 11+ hours.",runtime:"~11 hrs",films:3},
  {id:"t3",title:"Studio Ghibli Night",genre:"Animation",emoji:"🌱",desc:"Spirited Away + Howl's Moving Castle + Princess Mononoke.",runtime:"~6 hrs",films:3},
  {id:"t4",title:"Marvel Infinity Saga",genre:"Action",emoji:"🦸",desc:"The first 22 MCU films.",runtime:"~50 hrs",films:22},
  {id:"t5",title:"Wizarding World Weekend",genre:"Fantasy",emoji:"🧙",desc:"HP + Fantastic Beasts. For the truly committed.",runtime:"~30 hrs",films:10},
  {id:"t6",title:"Wes Anderson Binge",genre:"Comedy",emoji:"🎨",desc:"Grand Budapest + Moonrise Kingdom + The French Dispatch.",runtime:"~8 hrs",films:5},
  {id:"t7",title:"Nolan Cinematic Universe",genre:"Sci-Fi",emoji:"⌛",desc:"Inception + Interstellar + Tenet + Oppenheimer.",runtime:"~10 hrs",films:4},
  {id:"t8",title:"A24 Horror Night",genre:"Horror",emoji:"🩸",desc:"Hereditary + Midsommar + The VVitch.",runtime:"~7 hrs",films:3},
  {id:"t9",title:"Pixar Cry-a-thon",genre:"Animation",emoji:"😭",desc:"Up + Coco + Inside Out. Bring tissues.",runtime:"~5 hrs",films:3},
  {id:"t10",title:"Rom-Com Renaissance",genre:"Romance",emoji:"💕",desc:"10 Things + Crazy Stupid Love + When Harry Met Sally.",runtime:"~5 hrs",films:3},
  {id:"t11",title:"Tarantino Night",genre:"Thriller",emoji:"🩸",desc:"Pulp Fiction + Inglourious Basterds + Kill Bill.",runtime:"~8 hrs",films:3},
  {id:"t12",title:"Bong Joon-ho Double",genre:"Thriller",emoji:"🎬",desc:"Parasite + Snowpiercer.",runtime:"~4 hrs",films:2},
  {id:"t13",title:"Sci-Fi Saturday",genre:"Sci-Fi",emoji:"🛸",desc:"Dune Part 1 & 2 + Arrival.",runtime:"~8 hrs",films:3},
  {id:"t14",title:"Hunger Games Full Run",genre:"Action",emoji:"🏹",desc:"All four films.",runtime:"~9 hrs",films:4},
  {id:"t15",title:"Godfather Trilogy",genre:"Drama",emoji:"🌹",desc:"All three Godfather films.",runtime:"~9 hrs",films:3},
];
const WAVELENGTH = [
  {id:"w1",text:"Adam walks into Woolworths. First thing in the trolley?",cat:"🛒 Supermarket · About Adam",options:["Something healthy he'll never eat 🥦","Chips immediately 🍟","Whatever's on special 🏷️","He forgets why he came 😵"],correct:0},
  {id:"w2",text:"Kim at the supermarket — first item?",cat:"🛒 Supermarket · About Kim",options:["Bubble tea ingredients 🧋","Snacks that look cute 🍡","Healthy stuff then secret chocolate 🍫","Reads every label first 📋"],correct:1},
  {id:"w3",text:"Lawrence's first supermarket pick?",cat:"🛒 Supermarket · About Lawrence",options:["Protein powder 💪","Beer 🍺","Whatever's on sale 🏷️","A Nintendo game somehow 🎮"],correct:2},
  {id:"w4",text:"United's movie night energy scale?",cat:"🎬 Movie Night",options:["Pure cosy ☕","Cosy with chaotic undertones 🌀","Mostly chaotic, snack arguments 🍿","Full chaos, someone always cries 😭"],correct:2},
  {id:"w5",text:"If Voldemort showed up to movie night, United would:",cat:"⚡ Harry Potter",options:["Invite him, he looks lonely 🥺","Pick HP marathon to humble him 🪄","Someone would befriend him 😬","Run. No questions asked 🏃"],correct:1},
  {id:"w6",text:"Pineapple on pizza is…",cat:"🧠 Hot Take",options:["An abomination 🚫","Actually fine 🍍","Correct and valid 👑","I will not answer this 😶"],correct:0},
  {id:"w7",text:"Film ends and it was bad. United says:",cat:"🎬 Movie Night",options:["'That was actually good tho' 🤡","Silence. Processing 😶","'I told you so' 😤","Rate it 10/10 ironically 💅"],correct:3},
];
const UQ = [
  {id:"u1",text:"Which HP film would United pick for marathon night?",options:["Philosopher's Stone 🪄","Prisoner of Azkaban 🐺","Goblet of Fire 🔥","Deathly Hallows 💀"]},
  {id:"u2",text:"Who is most likely to fall asleep during a movie?",options:["Adam 💤","Kim 😴","Lawrence 😂","All of us simultaneously 🛌"]},
  {id:"u3",text:"United's spirit animal?",options:["Golden retriever 🐕","Niffler ✨","Phoenix 🔥","House elf 🧦"]},
  {id:"u4",text:"If United were a Hogwarts class:",options:["Defence Against Dark Arts 🪄","Potions 🧪","Divination 🔮","Care of Magical Creatures 🐉"]},
  {id:"u5",text:"United's biggest threat to movie night:",options:["3hr film at 10pm 🕙","Pizza arriving mid-climax 🍕","Someone picking something sad 😭","Someone snoring 😤"]},
];
const CREW = [
  {name:"Adam",color:"#ff4d6d",house:HP_HOUSES[0],personality:{title:"The Chaos Curator",emoji:"🎪",desc:"Unhinged taste, zero regrets."}},
  {name:"Kim",color:"#4ecdc4",house:HP_HOUSES[2],personality:{title:"The Vibe Checker",emoji:"✨",desc:"Doesn't care what's on as long as blankets are soft."}},
  {name:"Lawrence",color:"#a29bfe",house:HP_HOUSES[1],personality:{title:"The Movie Nerd",emoji:"🎬",desc:"Seen everything, has opinions about aspect ratios."}},
];

function Stars({rating,onRate,size}) {
  const [hover,setHover] = useState(0);
  return (
    <span style={{display:"inline-flex",gap:2}}>
      {[1,2,3,4,5].map(s=>(
        <span key={s}
          onClick={onRate?()=>onRate(s):null}
          onMouseEnter={onRate?()=>setHover(s):null}
          onMouseLeave={onRate?()=>setHover(0):null}
          style={{fontSize:size||13,cursor:onRate?"pointer":"default",color:s<=(hover||Math.round(rating||0))?"#ffd166":"#2a2a30",transition:"color 0.1s"}}>★</span>
      ))}
    </span>
  );
}

function Avi({name,color,size}) {
  const sz=size||36;
  return <div style={{width:sz,height:sz,borderRadius:"50%",background:color||"#666",display:"flex",alignItems:"center",justifyContent:"center",fontSize:sz*0.38,fontWeight:700,color:"#fff",flexShrink:0,border:"2px solid #0d0d0f"}}>{(name||"?")[0].toUpperCase()}</div>;
}

function SwipeCard({card,onSwipe,votes,isMarathon}) {
  const [dx,setDx]=useState(0);
  const [dy,setDy]=useState(0);
  const [dragging,setDragging]=useState(false);
  const [sx,setSx]=useState(0);
  const [sy,setSy]=useState(0);
  function startD(cx,cy){setDx(0);setDy(0);setDragging(true);setSx(cx);setSy(cy);}
  function moveD(cx,cy){if(!dragging)return;setDx(cx-sx);setDy(cy-sy);}
  function endD(){if(!dragging)return;if(dx>80)onSwipe("yes");else if(dx<-80)onSwipe("no");setDx(0);setDy(0);setDragging(false);}
  const yes=votes?votes.yes||[]:[];
  const no=votes?votes.no||[]:[];
  return (
    <div
      onMouseDown={e=>startD(e.clientX,e.clientY)} onMouseMove={e=>moveD(e.clientX,e.clientY)} onMouseUp={endD} onMouseLeave={endD}
      onTouchStart={e=>startD(e.touches[0].clientX,e.touches[0].clientY)} onTouchMove={e=>{e.preventDefault();moveD(e.touches[0].clientX,e.touches[0].clientY);}} onTouchEnd={endD}
      style={{position:"absolute",inset:0,background:isMarathon?"linear-gradient(160deg,#1a1200,#0d1a0d)":"linear-gradient(160deg,#18181c,#1a1020)",border:"1px solid "+(isMarathon?"#ffd16633":"#2a2a30"),borderRadius:22,padding:"18px 16px 12px",cursor:"grab",userSelect:"none",touchAction:"none",transform:"translate("+dx+"px,"+(dy*0.3)+"px) rotate("+(dx*0.07)+"deg)",transition:dragging?"none":"transform 0.3s ease",display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
      <div style={{position:"absolute",top:18,left:14,padding:"4px 9px",borderRadius:7,border:"3px solid #26de81",color:"#26de81",fontFamily:"'Bebas Neue',sans-serif",fontSize:20,letterSpacing:2,opacity:Math.min(1,dx/60),transform:"rotate(-12deg)"}}>WATCH IT</div>
      <div style={{position:"absolute",top:18,right:14,padding:"4px 9px",borderRadius:7,border:"3px solid #ff4d6d",color:"#ff4d6d",fontFamily:"'Bebas Neue',sans-serif",fontSize:20,letterSpacing:2,opacity:Math.min(1,-dx/60),transform:"rotate(12deg)"}}>NOPE</div>
      <div style={{textAlign:"center"}}>
        {isMarathon&&<div style={{fontSize:9,fontWeight:700,color:"#ffd166",textTransform:"uppercase",letterSpacing:2,marginBottom:4}}>{card.films} films · marathon</div>}
        <div style={{fontSize:42,marginBottom:6}}>{card.emoji}</div>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:21,color:"#f0ece4",letterSpacing:1,lineHeight:1.1,marginBottom:7}}>{card.title}</div>
        <div style={{display:"flex",gap:5,justifyContent:"center",marginBottom:9,flexWrap:"wrap"}}>
          <span style={{padding:"2px 8px",borderRadius:20,border:"1px solid #2a2a30",background:"#0d0d0f",color:"#666",fontSize:10}}>{card.genre}</span>
          {card.year&&<span style={{padding:"2px 8px",borderRadius:20,border:"1px solid #2a2a30",background:"#0d0d0f",color:"#555",fontSize:10}}>{card.year}</span>}
          <span style={{padding:"2px 8px",borderRadius:20,border:"1px solid #2a2a30",background:"#0d0d0f",color:"#555",fontSize:10}}>⏱ {card.runtime}</span>
        </div>
        <p style={{color:"#777",fontSize:12,lineHeight:1.5}}>{card.desc}</p>
      </div>
      <div style={{background:"#0d0d0f",borderRadius:10,padding:"8px 10px",marginTop:9}}>
        <div style={{fontSize:9,color:"#333",textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>United votes — live 🔴</div>
        <div style={{display:"flex",gap:6}}>
          <div style={{flex:1,background:"#26de8111",border:"1px solid #26de8120",borderRadius:7,padding:"5px 6px",textAlign:"center"}}>
            <div style={{fontSize:16,fontWeight:700,color:"#26de81",lineHeight:1}}>{yes.length}</div>
            <div style={{fontSize:9,color:"#26de8166",marginTop:1}}>👍 Watch</div>
            {yes.length>0&&<div style={{fontSize:8,color:"#555",marginTop:1}}>{yes.join(", ")}</div>}
          </div>
          <div style={{flex:1,background:"#ff4d6d11",border:"1px solid #ff4d6d20",borderRadius:7,padding:"5px 6px",textAlign:"center"}}>
            <div style={{fontSize:16,fontWeight:700,color:"#ff4d6d",lineHeight:1}}>{no.length}</div>
            <div style={{fontSize:9,color:"#ff4d6d66",marginTop:1}}>👎 Nope</div>
            {no.length>0&&<div style={{fontSize:8,color:"#555",marginTop:1}}>{no.join(", ")}</div>}
          </div>
        </div>
      </div>
      <p style={{textAlign:"center",fontSize:9,color:"#222",marginTop:5}}>← drag to nope · drag to watch →</p>
    </div>
  );
}

export default function App() {
  const [screen,setScreen]=useState("join");
  const [name,setName]=useState("");
  const [profile,setProfile]=useState(null);
  const [qStep,setQStep]=useState(0);
  const [qAns,setQAns]=useState([]);
  const [editProf,setEditProf]=useState(false);
  const [draft,setDraft]=useState(null);
  const [quoteI,setQuoteI]=useState(0);
  const [page,setPage]=useState("swipe");
  const [swipeMode,setSwipeMode]=useState("movies");
  const [swipeTab,setSwipeTab]=useState("swipe");
  const [mIdx,setMIdx]=useState(0);
  const [tIdx,setTIdx]=useState(0);
  const [wStep,setWStep]=useState(0);
  const [wAns,setWAns]=useState({});
  const [wDone,setWDone]=useState(false);
  const [uStep,setUStep]=useState(0);
  const [uAns,setUAns]=useState({});
  const [uDone,setUDone]=useState(false);
  const [scores,setScores]=useState({overall:0.72,Adam:0.68,Kim:0.81,Lawrence:0.74});
  const [viewP,setViewP]=useState(null);
  const [toast,setToast]=useState(null);
  const [logSort,setLogSort]=useState("avg");
  const [expanded,setExpanded]=useState(null);
  const [showLog,setShowLog]=useState(false);
  const [showWL,setShowWL]=useState(false);
  const [logForm,setLogForm]=useState({theme:"",emoji:"🎬",date:"",snacks:"",films:[{title:"",highlight:""}],quote:"",myRating:0});
  const [wlForm,setWlForm]=useState({title:"",genre:"Fantasy",year:2024});
  const [chatIn,setChatIn]=useState("");

  // Firebase state
  const [mVotes,setMVotes]=useState({});
  const [tVotes,setTVotes]=useState({});
  const [msgs,setMsgs]=useState([]);
  const [watchlist,setWatchlist]=useState([]);
  const [logged,setLogged]=useState([]);
  const [fbReady,setFbReady]=useState(false);
  const chatRef=useRef(null);

  useEffect(()=>{chatRef.current&&chatRef.current.scrollIntoView({behavior:"smooth"});},[msgs]);
  useEffect(()=>{const t=setInterval(()=>setQuoteI(i=>(i+1)%QUOTES.length),5000);return()=>clearInterval(t);},[]);

  // Firebase listeners — start once logged in
  useEffect(()=>{
    if(!fbReady) return;
    const unsubs=[];
    unsubs.push(onSnapshot(collection(db,"swipeVotes"),snap=>{
      const mv={};const tv={};
      snap.forEach(d=>{
        const data=d.data();
        if(d.id.startsWith("m"))mv[d.id]=data;
        else tv[d.id]=data;
      });
      setMVotes(mv);setTVotes(tv);
    },(e)=>console.log(e)));
    unsubs.push(onSnapshot(collection(db,"messages"),snap=>{
      const arr=[];
      snap.forEach(d=>arr.push({id:d.id,...d.data()}));
      arr.sort((a,b)=>(a.ts||0)-(b.ts||0));
      setMsgs(arr);
    },(e)=>console.log(e)));
    unsubs.push(onSnapshot(collection(db,"watchlist"),snap=>{
      const arr=[];
      snap.forEach(d=>arr.push({id:d.id,...d.data()}));
      setWatchlist(arr);
    },(e)=>console.log(e)));
    unsubs.push(onSnapshot(collection(db,"marathons"),snap=>{
      const arr=[];
      snap.forEach(d=>arr.push({id:d.id,...d.data()}));
      arr.sort((a,b)=>(b.date||"").localeCompare(a.date||""));
      setLogged(arr);
    },(e)=>console.log(e)));
    unsubs.push(onSnapshot(doc(db,"united","scores"),snap=>{
      if(snap.exists())setScores(snap.data());
    },(e)=>console.log(e)));
    return()=>unsubs.forEach(u=>u());
  },[fbReady]);

  function toast2(msg){setToast(msg);setTimeout(()=>setToast(null),2200);}

  function doQuiz(ans) {
    const na=[...qAns,ans];
    setQAns(na);
    if(qStep<QUIZ.length-1){setQStep(s=>s+1);}
    else{
      const house=HP_HOUSES.find(h=>na[1].includes(h.name))||HP_HOUSES[0];
      const ptype=PERSONALITY[na.length%PERSONALITY.length];
      const color=AVATAR_COLORS[na[0].charCodeAt(0)%AVATAR_COLORS.length];
      const p={name,color,nickname:"",bio:"",house,personality:ptype};
      setProfile(p);
      setFbReady(true);
      setScreen("app");
      setDoc(doc(db,"profiles",name),p).catch(console.log);
      addDoc(collection(db,"messages"),{user:"System",text:name+" has joined United! ⚡",ts:Date.now(),time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}).catch(console.log);
    }
  }

  async function swipe(dir) {
    const deck=swipeMode==="movies"?MOVIES:MARATHONS;
    const idx=swipeMode==="movies"?mIdx:tIdx;
    const card=deck[idx%deck.length];
    const ref=doc(db,"swipeVotes",card.id);
    const snap=await getDoc(ref).catch(()=>null);
    const ex=snap&&snap.exists()?snap.data():{yes:[],no:[]};
    const y=ex.yes.filter(n=>n!==name);
    const n2=ex.no.filter(n=>n!==name);
    if(dir==="yes")y.push(name);else n2.push(name);
    await setDoc(ref,{yes:y,no:n2}).catch(console.log);
    toast2(dir==="yes"?"👍 Watch it!":"👎 Nope!");
    if(swipeMode==="movies")setMIdx(i=>i+1);else setTIdx(i=>i+1);
  }

  function skip(){if(swipeMode==="movies")setMIdx(i=>i+1);else setTIdx(i=>i+1);toast2("Skipped ⏩");}

  async function sendMsg() {
    if(!chatIn.trim())return;
    await addDoc(collection(db,"messages"),{user:name,text:chatIn.trim(),ts:Date.now(),time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}).catch(console.log);
    setChatIn("");
  }

  function waveAnswer(qid,idx) {
    const q=WAVELENGTH[wStep];
    setWAns(p=>({...p,[qid]:idx}));
    const match=idx===q.correct;
    const sk=q.cat.includes("Adam")?"Adam":q.cat.includes("Kim")?"Kim":q.cat.includes("Lawrence")?"Lawrence":"overall";
    const ns={...scores,overall:Math.min(1,Math.max(0,(scores.overall||0.5)+(match?0.03:-0.02))),[sk]:Math.min(1,Math.max(0,(scores[sk]||0.5)+(match?0.05:-0.03)))};
    setScores(ns);
    setDoc(doc(db,"united","scores"),ns).catch(console.log);
    if(wStep<WAVELENGTH.length-1)setWStep(s=>s+1);else setWDone(true);
  }

  async function saveLog() {
    const vf=logForm.films.filter(f=>f.title.trim());
    if(!logForm.theme||!logForm.date||!vf.length){toast2("Fill theme, date & 1+ film!");return;}
    const ratings={};
    if(logForm.myRating>0)ratings[name]=logForm.myRating;
    await addDoc(collection(db,"marathons"),{theme:logForm.theme,emoji:logForm.emoji,date:logForm.date,snacks:logForm.snacks,movies:vf,ratings,quote:logForm.quote?'"'+logForm.quote+'" — '+name:"",loggedBy:name,ts:Date.now()}).catch(console.log);
    setLogForm({theme:"",emoji:"🎬",date:"",snacks:"",films:[{title:"",highlight:""}],quote:"",myRating:0});
    setShowLog(false);toast2("Marathon logged! ⚡");
  }

  async function rateLog(id,r) {
    await updateDoc(doc(db,"marathons",id),{["ratings."+name]:r}).catch(console.log);
    toast2("Rating saved! ⭐");
  }

  async function addWatchlist() {
    if(!wlForm.title.trim()){toast2("Add a title!");return;}
    await addDoc(collection(db,"watchlist"),{...wlForm,by:name,hype:[],ts:Date.now()}).catch(console.log);
    setWlForm({title:"",genre:"Fantasy",year:2024});
    setShowWL(false);toast2("Added! 👀");
  }

  async function toggleHype(id,hype) {
    const ref=doc(db,"watchlist",id);
    if(hype.includes(name))await updateDoc(ref,{hype:arrayRemove(name)}).catch(console.log);
    else await updateDoc(ref,{hype:arrayUnion(name)}).catch(console.log);
  }

  function avgR(m){const v=Object.values(m.ratings||{});if(!v.length)return 0;return v.reduce((a,b)=>a+b,0)/v.length;}

  const sortedLogged=[...logged].sort((a,b)=>{
    if(logSort==="avg")return avgR(b)-avgR(a);
    if(logSort==="mine")return (b.ratings&&b.ratings[name]||0)-(a.ratings&&a.ratings[name]||0);
    return (b.date||"").localeCompare(a.date||"");
  });

  const curDeck=swipeMode==="movies"?MOVIES:MARATHONS;
  const curIdx=swipeMode==="movies"?mIdx:tIdx;
  const curCard=curDeck[curIdx%curDeck.length];
  const allVotes=swipeMode==="movies"?mVotes:tVotes;
  const curVotes=allVotes[curCard.id]||{yes:[],no:[]};
  const results=curDeck.map(c=>({...c,yes:(allVotes[c.id]||{}).yes||[],no:(allVotes[c.id]||{}).no||[],score:((allVotes[c.id]||{}).yes||[]).length})).filter(c=>c.score>0).sort((a,b)=>b.score-a.score);

  const css=`
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;600;700&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    body{background:#0d0d0f;}
    ::-webkit-scrollbar{width:3px;}
    ::-webkit-scrollbar-thumb{background:#ffd16633;border-radius:2px;}
    @keyframes su{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
    @keyframes fi{from{opacity:0;}to{opacity:1;}}
    @keyframes ti{from{opacity:0;transform:translateX(-50%) translateY(8px);}to{opacity:1;transform:translateX(-50%) translateY(0);}}
    @keyframes fs{from{opacity:0;transform:translateY(5px);}to{opacity:1;transform:translateY(0);}}
    input[type=date]::-webkit-calendar-picker-indicator{filter:invert(0.4);}
  `;
  const inp={width:"100%",padding:"9px 11px",background:"#0d0d0f",border:"1.5px solid #2a2a30",borderRadius:9,color:"#f0ece4",fontSize:13,outline:"none",marginBottom:10,fontFamily:"'DM Sans',sans-serif"};
  const gBtn={padding:"7px 13px",background:"linear-gradient(135deg,#ffd166,#fd9644)",color:"#0d0d0f",border:"none",borderRadius:8,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap"};
  const ghBtn={padding:"6px 10px",background:"transparent",border:"1.5px solid #2a2a30",borderRadius:8,color:"#555",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap"};
  const card={background:"#18181c",border:"1px solid #2a2a30",borderRadius:12,padding:"12px",animation:"su 0.3s ease"};

  function Modal({onClose,title,children}) {
    return (
      <div onClick={onClose} style={{position:"fixed",inset:0,background:"#000c",zIndex:100,display:"flex",alignItems:"flex-end",justifyContent:"center",animation:"fi 0.2s ease"}}>
        <div onClick={e=>e.stopPropagation()} style={{background:"#18181c",border:"1px solid #2a2a30",borderRadius:"18px 18px 0 0",width:"100%",maxWidth:480,padding:"16px 14px",maxHeight:"88vh",overflowY:"auto",animation:"su 0.3s ease"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:19,color:"#f0ece4",letterSpacing:1}}>{title}</div>
            <button onClick={onClose} style={{background:"#2a2a30",border:"none",color:"#777",width:25,height:25,borderRadius:"50%",cursor:"pointer",fontSize:10}}>✕</button>
          </div>
          {children}
        </div>
      </div>
    );
  }

  if(screen==="join") return (
    <div style={{background:"#0d0d0f",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',sans-serif",padding:14}}>
      <style>{css}</style>
      <div style={{background:"#18181c",border:"1px solid #ffd16633",borderRadius:20,padding:"34px 20px",textAlign:"center",maxWidth:320,width:"100%",animation:"su 0.4s ease"}}>
        <div style={{fontSize:50,marginBottom:4}}>⚡</div>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:46,color:"#ffd166",letterSpacing:4,marginBottom:4}}>UNITED</div>
        <p style={{color:"#888",fontSize:12,marginBottom:4}}>Movie Night HQ</p>
        <p style={{color:"#444",fontSize:11,marginBottom:22,fontStyle:"italic"}}>"After all this time? Always."</p>
        <input style={inp} placeholder="What do they call you?" value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&name.trim()&&setScreen("quiz")} autoFocus/>
        <button onClick={()=>name.trim()&&setScreen("quiz")} style={{...gBtn,width:"100%",padding:"11px",fontSize:13}}>Enter United 🧙</button>
      </div>
    </div>
  );

  if(screen==="quiz") {
    const q=QUIZ[qStep];
    return (
      <div style={{background:"#0d0d0f",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',sans-serif",padding:14}}>
        <style>{css}</style>
        <div style={{background:"#18181c",border:"1px solid #ffd16633",borderRadius:20,padding:"24px 20px",maxWidth:400,width:"100%",animation:"su 0.4s ease"}}>
          <div style={{fontSize:10,color:"#ffd16677",fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginBottom:6}}>The Sorting Hat Asks...</div>
          <div style={{height:4,background:"#1e1e26",borderRadius:4,marginBottom:16,overflow:"hidden"}}>
            <div style={{width:((qStep/QUIZ.length)*100)+"%",height:"100%",background:"linear-gradient(90deg,#ffd166,#fd9644)",borderRadius:4,transition:"width 0.3s"}}/>
          </div>
          <div style={{fontSize:10,color:"#555",marginBottom:6}}>Question {qStep+1} of {QUIZ.length}</div>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:21,color:"#f0ece4",lineHeight:1.3,marginBottom:16,letterSpacing:1}}>{q.text}</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {q.options.map((opt,i)=>(
              <button key={i} onClick={()=>doQuiz(opt)}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="#ffd166";e.currentTarget.style.color="#ffd166";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="#2a2a30";e.currentTarget.style.color="#f0ece4";}}
                style={{padding:"10px 12px",background:"#13131a",border:"1.5px solid #2a2a30",borderRadius:10,color:"#f0ece4",fontSize:12,cursor:"pointer",textAlign:"left",fontFamily:"'DM Sans',sans-serif",transition:"all 0.15s"}}>{opt}</button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:"#0d0d0f",minHeight:"100vh",color:"#f0ece4",maxWidth:480,margin:"0 auto",display:"flex",flexDirection:"column"}}>
      <style>{css}</style>
      {toast&&<div style={{position:"fixed",bottom:70,left:"50%",transform:"translateX(-50%)",background:"linear-gradient(135deg,#ffd166,#fd9644)",color:"#0d0d0f",padding:"6px 14px",borderRadius:24,fontSize:11,fontWeight:700,zIndex:200,whiteSpace:"nowrap",animation:"ti 0.3s ease",boxShadow:"0 4px 16px #ffd16633"}}>{toast}</div>}

      {viewP&&<Modal onClose={()=>setViewP(null)} title="Profile">
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
          <Avi name={viewP.name} color={viewP.color} size={48}/>
          <div>
            <div style={{fontSize:15,fontWeight:700,color:"#f0ece4"}}>{viewP.name}</div>
            {viewP.house&&<span style={{padding:"2px 7px",borderRadius:20,background:viewP.house.color+"44",color:viewP.house.accent,border:"1px solid "+viewP.house.color+"55",fontSize:9,fontWeight:700,display:"inline-block",marginTop:3}}>{viewP.house.emoji} {viewP.house.name}</span>}
          </div>
        </div>
        {viewP.personality&&<div style={{background:"#ffd16611",border:"1px solid #ffd16633",borderRadius:11,padding:11}}>
          <div style={{fontSize:20}}>{viewP.personality.emoji}</div>
          <div style={{fontSize:12,fontWeight:700,color:"#ffd166",marginTop:3}}>{viewP.personality.title}</div>
          <div style={{fontSize:11,color:"#aaa",marginTop:3,lineHeight:1.5}}>{viewP.personality.desc}</div>
        </div>}
      </Modal>}

      {editProf&&draft&&<Modal onClose={()=>setEditProf(false)} title="Edit Profile">
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
          <Avi name={draft.name} color={draft.color} size={42}/>
          <div style={{display:"flex",flexWrap:"wrap",gap:5}}>{AVATAR_COLORS.map(c=><div key={c} onClick={()=>setDraft(p=>({...p,color:c}))} style={{width:20,height:20,borderRadius:"50%",background:c,cursor:"pointer",border:draft.color===c?"2.5px solid #fff":"2px solid transparent"}}/>)}</div>
        </div>
        <div style={{fontSize:9,fontWeight:700,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Nickname</div>
        <input style={{...inp,marginBottom:10}} placeholder="What United calls you..." value={draft.nickname} onChange={e=>setDraft(p=>({...p,nickname:e.target.value}))}/>
        <div style={{fontSize:9,fontWeight:700,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>Hogwarts House</div>
        <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
          {HP_HOUSES.map(h=><button key={h.name} onClick={()=>setDraft(p=>({...p,house:h}))} style={{padding:"5px 9px",borderRadius:18,border:"1.5px solid "+(draft.house&&draft.house.name===h.name?h.color:"#2a2a30"),background:draft.house&&draft.house.name===h.name?h.color+"44":"transparent",color:draft.house&&draft.house.name===h.name?h.accent:"#555",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>{h.emoji} {h.name}</button>)}
        </div>
        <button onClick={()=>{setDoc(doc(db,"profiles",name),draft).catch(console.log);setProfile(draft);setEditProf(false);toast2("Saved! ⚡");}} style={{...gBtn,width:"100%",padding:"11px"}}>Save ⚡</button>
      </Modal>}

      {showLog&&<Modal onClose={()=>setShowLog(false)} title="Log a Marathon">
        <div style={{display:"flex",gap:8,marginBottom:8}}>
          <div style={{flex:"0 0 60px"}}>
            <div style={{fontSize:9,fontWeight:700,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>Emoji</div>
            <input style={inp} value={logForm.emoji} onChange={e=>setLogForm(p=>({...p,emoji:e.target.value}))} maxLength={2}/>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:9,fontWeight:700,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>Theme *</div>
            <input style={inp} placeholder="HP Marathon..." value={logForm.theme} onChange={e=>setLogForm(p=>({...p,theme:e.target.value}))}/>
          </div>
        </div>
        <div style={{display:"flex",gap:8,marginBottom:8}}>
          <div style={{flex:1}}>
            <div style={{fontSize:9,fontWeight:700,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>Date *</div>
            <input style={inp} type="date" value={logForm.date} onChange={e=>setLogForm(p=>({...p,date:e.target.value}))}/>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:9,fontWeight:700,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>Snacks</div>
            <input style={inp} placeholder="Butterbeer..." value={logForm.snacks} onChange={e=>setLogForm(p=>({...p,snacks:e.target.value}))}/>
          </div>
        </div>
        <div style={{fontSize:9,fontWeight:700,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>Films Watched</div>
        {logForm.films.map((f,i)=>(
          <div key={i} style={{background:"#0d0d0f",borderRadius:9,padding:9,marginBottom:7}}>
            <input style={{...inp,marginBottom:5}} placeholder={"Film title "+(i+1)} value={f.title} onChange={e=>{const arr=[...logForm.films];arr[i]={...arr[i],title:e.target.value};setLogForm(p=>({...p,films:arr}));}}/>
            <input style={{...inp,marginBottom:0,fontSize:11}} placeholder="Best moment..." value={f.highlight} onChange={e=>{const arr=[...logForm.films];arr[i]={...arr[i],highlight:e.target.value};setLogForm(p=>({...p,films:arr}));}}/>
          </div>
        ))}
        <button onClick={()=>setLogForm(p=>({...p,films:[...p.films,{title:"",highlight:""}]}))} style={{...ghBtn,marginBottom:9,width:"100%"}}>+ Add film</button>
        <div style={{fontSize:9,fontWeight:700,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>My Rating</div>
        <div style={{marginBottom:10}}><Stars rating={logForm.myRating} size={22} onRate={v=>setLogForm(p=>({...p,myRating:v}))}/></div>
        <div style={{fontSize:9,fontWeight:700,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Memorable Quote</div>
        <input style={{...inp,marginBottom:12}} placeholder='"After all this time?..."' value={logForm.quote} onChange={e=>setLogForm(p=>({...p,quote:e.target.value}))}/>
        <button onClick={saveLog} style={{...gBtn,width:"100%",padding:"11px",fontSize:13}}>Save Marathon ⚡</button>
      </Modal>}

      {showWL&&<Modal onClose={()=>setShowWL(false)} title="Add to Watchlist">
        <div style={{fontSize:9,fontWeight:700,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>Title</div>
        <input style={inp} placeholder="Movie title..." value={wlForm.title} onChange={e=>setWlForm(p=>({...p,title:e.target.value}))}/>
        <div style={{display:"flex",gap:8,marginBottom:12}}>
          <div style={{flex:1}}>
            <div style={{fontSize:9,fontWeight:700,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>Genre</div>
            <select style={{...inp,padding:"8px 5px",marginBottom:0}} value={wlForm.genre} onChange={e=>setWlForm(p=>({...p,genre:e.target.value}))}>
              {["Fantasy","Horror","Comedy","Action","Romance","Sci-Fi","Thriller","Animation","Drama"].map(g=><option key={g}>{g}</option>)}
            </select>
          </div>
          <div style={{flex:"0 0 80px"}}>
            <div style={{fontSize:9,fontWeight:700,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>Year</div>
            <input style={{...inp,marginBottom:0}} type="number" value={wlForm.year} onChange={e=>setWlForm(p=>({...p,year:parseInt(e.target.value)}))}/>
          </div>
        </div>
        <button onClick={addWatchlist} style={{...gBtn,width:"100%",padding:"11px",fontSize:13}}>Add 👀</button>
      </Modal>}

      <div style={{background:"#18181c",borderBottom:"1px solid #ffd16622",padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:10}}>
        <div style={{display:"flex",alignItems:"center",gap:7}}>
          <span style={{fontSize:16}}>⚡</span>
          <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,color:"#ffd166",letterSpacing:3}}>UNITED</span>
          <span style={{fontSize:8,color:"#26de81",fontWeight:700,background:"#26de8122",padding:"2px 5px",borderRadius:20,border:"1px solid #26de8133"}}>LIVE</span>
        </div>
        {profile&&<div style={{cursor:"pointer"}} onClick={()=>{setDraft({...profile});setEditProf(true);}}><Avi name={profile.name} color={profile.color} size={27}/></div>}
      </div>

      <div style={{background:"#0d0d0f",borderBottom:"1px solid #1a1a20",padding:"4px 12px",minHeight:24,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div key={quoteI} style={{animation:"fs 0.5s ease",fontSize:10,color:"#ffd16666",textAlign:"center",fontStyle:"italic"}}>{QUOTES[quoteI]}</div>
      </div>

      <div style={{display:"flex",background:"#13131a",borderBottom:"1px solid #1e1e26"}}>
        {[{id:"swipe",l:"🎬"},{id:"home",l:"🏠"},{id:"marathons",l:"⚡"},{id:"united",l:"🧙"},{id:"chat",l:"💬"}].map(t=>(
          <button key={t.id} onClick={()=>setPage(t.id)} style={{flex:1,padding:"10px 2px",background:page===t.id?"#1a1500":"transparent",border:"none",borderBottom:"2px solid "+(page===t.id?"#ffd166":"transparent"),color:page===t.id?"#ffd166":"#444",fontSize:17,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"all 0.2s"}}>{t.l}</button>
        ))}
      </div>

      {page==="swipe"&&(
        <div style={{flex:1,padding:"12px",overflowY:"auto"}}>
          <div style={{display:"flex",gap:8,marginBottom:11}}>
            {[{v:"movies",l:"🎬 Movies"},{v:"marathons",l:"⚡ Marathons"}].map(m=>(
              <button key={m.v} onClick={()=>setSwipeMode(m.v)} style={{flex:1,padding:"9px",background:swipeMode===m.v?"linear-gradient(135deg,#ffd166,#fd9644)":"#18181c",border:"1.5px solid "+(swipeMode===m.v?"#ffd166":"#2a2a30"),borderRadius:10,color:swipeMode===m.v?"#0d0d0f":"#555",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>{m.l}</button>
            ))}
          </div>
          <div style={{display:"flex",background:"#18181c",border:"1px solid #2a2a30",borderRadius:10,overflow:"hidden",marginBottom:11}}>
            {[{v:"swipe",l:"👆 Swipe"},{v:"results",l:"🏆 Results"+(results.length>0?" ("+results.length+")":"")}].map(t=>(
              <button key={t.v} onClick={()=>setSwipeTab(t.v)} style={{flex:1,padding:"8px",background:swipeTab===t.v?"#2a2a30":"transparent",border:"none",color:swipeTab===t.v?(t.v==="swipe"?"#ffd166":"#26de81"):"#555",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>{t.l}</button>
            ))}
          </div>
          {swipeTab==="swipe"&&(
            <div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                <span style={{fontSize:10,color:"#444"}}>{swipeMode==="movies"?"Film":"Marathon"} {(curIdx%curDeck.length)+1}/{curDeck.length}</span>
                <span style={{fontSize:10,color:"#26de81",fontWeight:700}}>{Object.keys(allVotes).length} swiped 🔴</span>
              </div>
              <div style={{position:"relative",height:420,marginBottom:12}}>
                <div style={{position:"absolute",inset:0,background:"#18181c",border:"1px solid #2a2a30",borderRadius:22,transform:"scale(0.96) translateY(6px)",zIndex:0}}/>
                <div style={{position:"absolute",inset:0,background:"#161616",border:"1px solid #1e1e26",borderRadius:22,transform:"scale(0.92) translateY(12px)",zIndex:0}}/>
                <div style={{position:"absolute",inset:0,zIndex:1}}>
                  <SwipeCard key={swipeMode+"-"+curIdx} card={curCard} onSwipe={swipe} votes={curVotes} isMarathon={swipeMode==="marathons"}/>
                </div>
              </div>
              <div style={{display:"flex",gap:10,justifyContent:"center",marginBottom:6}}>
                <button onClick={()=>swipe("no")} style={{width:54,height:54,borderRadius:"50%",background:"#ff4d6d22",border:"2px solid #ff4d6d44",color:"#ff4d6d",fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
                <button onClick={()=>swipe("yes")} style={{width:70,height:70,borderRadius:"50%",background:"#26de8122",border:"2px solid #26de8166",color:"#26de81",fontSize:26,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",marginTop:-8}}>♥</button>
                <button onClick={skip} style={{width:54,height:54,borderRadius:"50%",background:"#ffd16622",border:"2px solid #ffd16644",color:"#ffd166",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>⏭</button>
              </div>
              <p style={{textAlign:"center",fontSize:9,color:"#333"}}>Cards loop forever · keep swiping!</p>
            </div>
          )}
          {swipeTab==="results"&&(
            <div>
              <div style={{...card,background:"linear-gradient(135deg,#0d1a0d,#18181c)",border:"1px solid #26de8133",marginBottom:10}}>
                <div style={{fontSize:11,fontWeight:700,color:"#26de81",marginBottom:3}}>⚡ Live Group Matches</div>
                <p style={{fontSize:11,color:"#555"}}>Ranked by how many of United said yes — updates live!</p>
              </div>
              {results.length===0&&<div style={{textAlign:"center",padding:"32px 0"}}><div style={{fontSize:38}}>🃏</div><p style={{color:"#444",marginTop:9,fontSize:12}}>No votes yet — start swiping!</p></div>}
              {results.map((c,i)=>(
                <div key={c.id} style={{...card,marginBottom:8,...(i===0?{border:"1px solid #ffd16633",background:"#1e1a0a"}:{})}}>
                  <div style={{display:"flex",alignItems:"center",gap:9}}>
                    <div style={{fontSize:22,minWidth:30,textAlign:"center"}}>{i===0?"🏆":i===1?"🥈":i===2?"🥉":c.emoji}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:12,fontWeight:700,color:"#f0ece4",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.title}</div>
                      <div style={{fontSize:9,color:"#555",marginTop:1}}>{c.genre} · {c.runtime}</div>
                      <div style={{marginTop:4,display:"flex",gap:3,flexWrap:"wrap"}}>
                        {c.yes.map(v=><span key={v} style={{fontSize:8,padding:"1px 5px",borderRadius:9,background:"#26de8120",color:"#26de81",border:"1px solid #26de8130"}}>{v} 👍</span>)}
                        {c.no.map(v=><span key={v} style={{fontSize:8,padding:"1px 5px",borderRadius:9,background:"#ff4d6d10",color:"#ff4d6d55",border:"1px solid #ff4d6d20"}}>{v} 👎</span>)}
                      </div>
                    </div>
                    <div style={{textAlign:"center",minWidth:28}}>
                      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:"#26de81",lineHeight:1}}>{c.yes.length}</div>
                      <div style={{fontSize:8,color:"#555",textTransform:"uppercase",letterSpacing:1}}>yes</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {page==="home"&&(
        <div style={{flex:1,padding:"12px",overflowY:"auto"}}>
          {profile&&(
            <div style={{...card,background:"linear-gradient(135deg,#1a1200,#18181c)",border:"1px solid #ffd16622",marginBottom:11}}>
              <div style={{display:"flex",alignItems:"center",gap:11}}>
                <Avi name={profile.name} color={profile.color} size={42}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:700,color:"#f0ece4"}}>{profile.nickname||profile.name}</div>
                  {profile.house&&<span style={{padding:"2px 6px",borderRadius:18,background:profile.house.color+"44",color:profile.house.accent,border:"1px solid "+profile.house.color+"44",fontSize:9,fontWeight:700,display:"inline-block",marginTop:2}}>{profile.house.emoji} {profile.house.name}</span>}
                  <div style={{fontSize:10,color:"#ffd16666",marginTop:2}}>{profile.personality&&profile.personality.emoji} {profile.personality&&profile.personality.title}</div>
                </div>
                <button onClick={()=>{setDraft({...profile});setEditProf(true);}} style={{...ghBtn,padding:"4px 8px",fontSize:10}}>Edit</button>
              </div>
            </div>
          )}
          <div style={{display:"flex",gap:8,marginBottom:11}}>
            {[{n:logged.length,l:"Marathons"},{n:logged.reduce((s,m)=>s+(m.movies?m.movies.length:0),0),l:"Films"},{n:logged.length?(logged.reduce((a,m)=>a+avgR(m),0)/logged.length).toFixed(1):"—",l:"Avg ⭐"}].map((s,i)=>(
              <div key={i} style={{flex:1,background:"#18181c",border:"1px solid #2a2a30",borderRadius:11,padding:"9px 5px",textAlign:"center"}}>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,color:"#ffd166"}}>{s.n}</div>
                <div style={{color:"#444",fontSize:9,marginTop:1}}>{s.l}</div>
              </div>
            ))}
          </div>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,color:"#f0ece4",letterSpacing:1,marginBottom:9}}>The United Crew</div>
          <div style={{display:"flex",gap:10,marginBottom:14}}>
            {CREW.map(m=>(
              <div key={m.name} onClick={()=>setViewP(m)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4,cursor:"pointer"}}>
                <Avi name={m.name} color={m.color} size={40}/>
                <span style={{fontSize:10,color:"#888",fontWeight:600}}>{m.name}</span>
                <span style={{fontSize:9,color:m.house.accent,background:m.house.color+"33",padding:"1px 5px",borderRadius:9}}>{m.house.emoji}</span>
              </div>
            ))}
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,color:"#f0ece4",letterSpacing:1}}>👀 Watchlist</div>
            <button onClick={()=>setShowWL(true)} style={{...ghBtn,padding:"3px 8px",fontSize:10}}>+ Add</button>
          </div>
          {watchlist.length===0&&<div style={{color:"#444",fontSize:12,marginBottom:12}}>Nothing yet — add something!</div>}
          {[...watchlist].sort((a,b)=>(b.hype&&b.hype.length||0)-(a.hype&&a.hype.length||0)).map((w,i)=>(
            <div key={w.id} style={{...card,marginBottom:7}}>
              <div style={{display:"flex",alignItems:"center",gap:9}}>
                <div style={{fontSize:12,minWidth:20,textAlign:"center",color:"#444"}}>#{i+1}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:600,color:"#f0ece4",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{w.title}</div>
                  <div style={{fontSize:9,color:"#555"}}>by {w.by} · {w.genre}</div>
                </div>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                  <div style={{fontSize:15,fontWeight:700,color:"#a29bfe",lineHeight:1}}>{w.hype&&w.hype.length||0}</div>
                  <button onClick={()=>toggleHype(w.id,w.hype||[])} style={{padding:"2px 7px",background:w.hype&&w.hype.includes(name)?"#a29bfe33":"transparent",border:"1px solid "+(w.hype&&w.hype.includes(name)?"#a29bfe":"#2a2a30"),borderRadius:7,color:w.hype&&w.hype.includes(name)?"#a29bfe":"#444",fontSize:9,fontWeight:700,cursor:"pointer"}}>
                    {w.hype&&w.hype.includes(name)?"✓ Hyped":"Hype"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {page==="marathons"&&(
        <div style={{flex:1,padding:"12px",overflowY:"auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:21,color:"#ffd166",letterSpacing:1.5}}>⚡ Marathons</div>
              <div style={{color:"#555",fontSize:10,marginTop:2}}>History, ratings and rankings</div>
            </div>
            <button onClick={()=>setShowLog(true)} style={gBtn}>+ Log</button>
          </div>
          <div style={{display:"flex",gap:6,marginBottom:11}}>
            {[{v:"avg",l:"⭐ Avg"},{v:"mine",l:"👤 Mine"},{v:"date",l:"📅 Date"}].map(o=>(
              <button key={o.v} onClick={()=>setLogSort(o.v)} style={{flex:1,padding:"6px 4px",background:logSort===o.v?"#ffd16622":"transparent",border:"1px solid "+(logSort===o.v?"#ffd166":"#2a2a30"),borderRadius:8,color:logSort===o.v?"#ffd166":"#555",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>{o.l}</button>
            ))}
          </div>
          {sortedLogged.length===0&&<div style={{textAlign:"center",padding:"32px 0"}}><div style={{fontSize:40}}>🎬</div><p style={{color:"#444",marginTop:9,fontSize:12}}>No marathons logged yet!</p></div>}
          {sortedLogged.map((m,i)=>{
            const av=avgR(m);
            const mine=m.ratings&&m.ratings[name]||0;
            return(
              <div key={m.id} style={{...card,marginBottom:10,...(i===0&&logSort==="avg"?{border:"1px solid #ffd16633",background:"#1e1a0a"}:{})}}>
                <div onClick={()=>setExpanded(expanded===m.id?null:m.id)} style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}>
                  <div style={{fontSize:8,color:"#555",fontWeight:700,minWidth:16,textAlign:"center"}}>#{i+1}</div>
                  <div style={{fontSize:20,minWidth:28,textAlign:"center"}}>{m.emoji}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:700,color:"#f0ece4"}}>{m.theme}</div>
                    <div style={{fontSize:10,color:"#555",marginTop:1}}>{m.date} · {m.movies&&m.movies.length} films</div>
                    <div style={{display:"flex",gap:8,marginTop:3,alignItems:"center"}}>
                      <Stars rating={av} size={11}/>
                      <span style={{fontSize:10,color:"#ffd166",fontWeight:700}}>{av.toFixed(1)}</span>
                      <span style={{fontSize:9,color:"#444"}}>avg</span>
                      {mine>0&&<span style={{fontSize:9,color:"#a29bfe"}}>you: {"★".repeat(mine)}</span>}
                    </div>
                  </div>
                  <span style={{color:"#333",fontSize:11,transform:expanded===m.id?"rotate(180deg)":"none",transition:"transform 0.2s",display:"inline-block"}}>▾</span>
                </div>
                {expanded===m.id&&(
                  <div style={{borderTop:"1px solid #1e1e26",marginTop:10,paddingTop:10,display:"flex",flexDirection:"column",gap:9}}>
                    <div>
                      <div style={{fontSize:9,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>Ratings</div>
                      <div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:8}}>
                        {Object.entries(m.ratings||{}).map(([nm,r])=>(
                          <div key={nm} style={{background:"#0d0d0f",borderRadius:8,padding:"5px 9px",textAlign:"center"}}>
                            <div style={{fontSize:9,color:"#888",marginBottom:2}}>{nm}</div>
                            <div style={{color:"#ffd166",fontSize:12}}>{"★".repeat(r)}{"☆".repeat(5-r)}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{fontSize:9,color:"#555",marginBottom:4}}>Your rating</div>
                      <Stars rating={mine} size={20} onRate={v=>rateLog(m.id,v)}/>
                    </div>
                    {m.movies&&m.movies.length>0&&(
                      <div>
                        <div style={{fontSize:9,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>Films</div>
                        {m.movies.map((f,j)=>(
                          <div key={j} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #1a1a20"}}>
                            <div style={{fontSize:11,fontWeight:600,color:"#f0ece4"}}>{f.title}</div>
                            {f.highlight&&<div style={{fontSize:9,color:"#777",fontStyle:"italic",maxWidth:130,textAlign:"right"}}>"{f.highlight}"</div>}
                          </div>
                        ))}
                      </div>
                    )}
                    {m.quote&&<div style={{background:"#ffd16611",borderLeft:"3px solid #ffd166",borderRadius:"0 7px 7px 0",padding:"7px 9px",fontSize:11,color:"#ffd16688",fontStyle:"italic"}}>{m.quote}</div>}
                    {m.snacks&&<div style={{fontSize:10,color:"#888"}}>🍿 {m.snacks}</div>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {page==="united"&&(
        <div style={{flex:1,padding:"12px",overflowY:"auto"}}>
          <div style={{marginBottom:11}}>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:21,color:"#ffd166",letterSpacing:1.5}}>🧙 United</div>
            <div style={{color:"#555",fontSize:10,marginTop:2}}>Quizzes, wavelength and unity score</div>
          </div>
          <div style={{...card,background:"linear-gradient(135deg,#0d1a0d,#18181c)",border:"1px solid #26de8133",marginBottom:11}}>
            <div style={{fontSize:11,fontWeight:700,color:"#26de81",marginBottom:8}}>⚡ United Tracker — Live</div>
            <div style={{display:"flex",justifyContent:"center",marginBottom:9}}>
              <div style={{position:"relative",width:80,height:80}}>
                <svg viewBox="0 0 100 100" style={{width:80,height:80,transform:"rotate(-90deg)"}}>
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#1e1e26" strokeWidth="11"/>
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#26de81" strokeWidth="11" strokeLinecap="round" strokeDasharray={(2*Math.PI*42*(scores.overall||0))+" "+(2*Math.PI*42*(1-(scores.overall||0)))}/>
                </svg>
                <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:19,color:"#26de81",lineHeight:1}}>{Math.round((scores.overall||0)*100)}%</div>
                  <div style={{fontSize:7,color:"#444",textTransform:"uppercase",letterSpacing:1}}>United</div>
                </div>
              </div>
            </div>
            {["Adam","Kim","Lawrence"].map(n2=>{
              const pct=Math.round((scores[n2]||0)*100);
              const col=pct>80?"#26de81":pct>50?"#ffd166":"#ff4d6d";
              return(
                <div key={n2} style={{marginBottom:6}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:11,color:"#888"}}>🤝 United with {n2}</span><span style={{fontSize:11,fontWeight:700,color:col}}>{pct}%</span></div>
                  <div style={{height:7,background:"#1e1e26",borderRadius:4,overflow:"hidden"}}><div style={{width:pct+"%",height:"100%",background:col,borderRadius:4,transition:"width 0.6s ease"}}/></div>
                </div>
              );
            })}
          </div>
          <div style={{...card,marginBottom:11}}>
            <div style={{fontSize:11,fontWeight:700,color:"#ffd166",marginBottom:3}}>🌊 Wavelength</div>
            <p style={{fontSize:10,color:"#555",marginBottom:8}}>Match the group pick — updates everyone's United score live!</p>
            {!wDone?(
              <div>
                <div style={{height:3,background:"#1e1e26",borderRadius:2,marginBottom:9,overflow:"hidden"}}><div style={{width:((wStep/WAVELENGTH.length)*100)+"%",height:"100%",background:"linear-gradient(90deg,#ffd166,#26de81)",borderRadius:2,transition:"width 0.3s"}}/></div>
                {(()=>{
                  const q=WAVELENGTH[wStep];
                  const answered=wAns[q.id]!==undefined;
                  return(
                    <div>
                      <div style={{fontSize:9,color:"#ffd16644",fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>{q.cat}</div>
                      <div style={{fontSize:13,fontWeight:600,color:"#f0ece4",lineHeight:1.4,marginBottom:9}}>{q.text}</div>
                      <div style={{display:"flex",flexDirection:"column",gap:6}}>
                        {q.options.map((opt,i)=>{
                          const chosen=wAns[q.id]===i;
                          const correct=answered&&i===q.correct;
                          return <button key={i} onClick={()=>!answered&&waveAnswer(q.id,i)} style={{padding:"8px 11px",background:chosen?"#ffd16622":correct?"#26de8122":"#13131a",border:"1.5px solid "+(chosen?"#ffd166":correct?"#26de81":"#2a2a30"),borderRadius:9,color:chosen?"#ffd166":correct?"#26de81":"#f0ece4",fontSize:11,cursor:answered?"default":"pointer",textAlign:"left",fontFamily:"'DM Sans',sans-serif",transition:"all 0.15s"}}>{opt}{correct&&<span style={{marginLeft:5,fontSize:9}}> ← group pick</span>}</button>;
                        })}
                      </div>
                      {answered&&<div style={{marginTop:8,padding:"6px 9px",borderRadius:8,background:wAns[q.id]===q.correct?"#26de8122":"#ff4d6d22",fontSize:10,color:wAns[q.id]===q.correct?"#26de81":"#ff8fa3",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <span>{wAns[q.id]===q.correct?"⚡ Match! United!":"Not quite 😅"}</span>
                        <button onClick={()=>setWStep(s=>Math.min(s+1,WAVELENGTH.length-1))} style={{background:"transparent",border:"none",color:"#666",cursor:"pointer",fontSize:10,fontFamily:"'DM Sans',sans-serif"}}>Next →</button>
                      </div>}
                    </div>
                  );
                })()}
              </div>
            ):(
              <div style={{textAlign:"center",padding:"12px 0"}}>
                <div style={{fontSize:30,marginBottom:5}}>⚡</div>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,color:"#ffd166",letterSpacing:1}}>Round Complete!</div>
                <div style={{color:"#555",fontSize:10,margin:"4px 0 10px"}}>{Object.entries(wAns).filter(([id,v])=>{const q=WAVELENGTH.find(q=>q.id===id);return q&&v===q.correct;}).length} / {WAVELENGTH.length} matched</div>
                <button onClick={()=>{setWStep(0);setWAns({});setWDone(false);}} style={gBtn}>Play Again 🌀</button>
              </div>
            )}
          </div>
          <div style={card}>
            <div style={{fontSize:11,fontWeight:700,color:"#a29bfe",marginBottom:3}}>🧠 United Quiz</div>
            <p style={{fontSize:10,color:"#555",marginBottom:8}}>HP + group knowledge</p>
            {!uDone?(
              <div>
                <div style={{height:3,background:"#1e1e26",borderRadius:2,marginBottom:9,overflow:"hidden"}}><div style={{width:((uStep/UQ.length)*100)+"%",height:"100%",background:"#a29bfe",borderRadius:2,transition:"width 0.3s"}}/></div>
                {(()=>{
                  const q=UQ[uStep];
                  const answered=uAns[q.id]!==undefined;
                  return(
                    <div>
                      <div style={{fontSize:9,color:"#a29bfe66",fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Q{uStep+1}/{UQ.length}</div>
                      <div style={{fontSize:13,fontWeight:600,color:"#f0ece4",lineHeight:1.4,marginBottom:9}}>{q.text}</div>
                      <div style={{display:"flex",flexDirection:"column",gap:6}}>
                        {q.options.map((opt,i)=>(
                          <button key={i} onClick={()=>{if(!answered){const a={...uAns,[q.id]:opt};setUAns(a);if(uStep<UQ.length-1)setUStep(s=>s+1);else setUDone(true);}}} style={{padding:"8px 11px",background:uAns[q.id]===opt?"#a29bfe22":"#13131a",border:"1.5px solid "+(uAns[q.id]===opt?"#a29bfe":"#2a2a30"),borderRadius:9,color:uAns[q.id]===opt?"#a29bfe":"#f0ece4",fontSize:11,cursor:"pointer",textAlign:"left",fontFamily:"'DM Sans',sans-serif",transition:"all 0.15s"}}>{opt}</button>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            ):(
              <div style={{textAlign:"center",padding:"11px 0"}}>
                <div style={{fontSize:28,marginBottom:5}}>🧙</div>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:17,color:"#a29bfe",letterSpacing:1}}>Quiz Done!</div>
                <button onClick={()=>{setUStep(0);setUAns({});setUDone(false);}} style={{...ghBtn,borderColor:"#a29bfe",color:"#a29bfe",marginTop:9}}>Retake 🔄</button>
              </div>
            )}
          </div>
        </div>
      )}

      {page==="chat"&&(
        <div style={{flex:1,display:"flex",flexDirection:"column",height:"calc(100vh - 120px)"}}>
          <div style={{padding:"10px 13px 4px"}}>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:21,color:"#f0ece4",letterSpacing:1.5}}>💬 United Chat</div>
            <div style={{fontSize:9,color:"#26de81",marginTop:2}}>🔴 Live — all messages sync instantly</div>
          </div>
          <div style={{flex:1,overflowY:"auto",padding:"5px 12px",display:"flex",flexDirection:"column",gap:7}}>
            {msgs.map(msg=>(
              <div key={msg.id} style={{display:"flex",flexDirection:"column",alignItems:msg.user==="System"?"center":msg.user===name?"flex-end":"flex-start",maxWidth:"80%",alignSelf:msg.user===name?"flex-end":msg.user==="System"?"center":"flex-start"}}>
                {msg.user==="System"?(
                  <div style={{background:"#1e1e26",color:"#444",fontSize:9,padding:"3px 10px",borderRadius:18,fontStyle:"italic"}}>{msg.text}</div>
                ):(
                  <div>
                    {msg.user!==name&&<div style={{fontSize:9,color:"#ffd16666",fontWeight:700,marginBottom:2,paddingLeft:3}}>{msg.user}</div>}
                    <div style={{background:msg.user===name?"#ffd166":"#18181c",border:"1px solid "+(msg.user===name?"#ffd166":"#2a2a30"),borderRadius:msg.user===name?"13px 3px 13px 13px":"3px 13px 13px 13px",padding:"7px 11px",fontSize:12,color:msg.user===name?"#0d0d0f":"#f0ece4",lineHeight:1.5,fontWeight:msg.user===name?600:400}}>{msg.text}</div>
                    <div style={{fontSize:8,color:"#222",marginTop:2}}>{msg.time}</div>
                  </div>
                )}
              </div>
            ))}
            <div ref={chatRef}/>
          </div>
          <div style={{display:"flex",gap:7,padding:"8px 12px",background:"#13131a",borderTop:"1px solid #1e1e26"}}>
            <input style={{flex:1,padding:"9px 11px",background:"#0d0d0f",border:"1.5px solid #2a2a30",borderRadius:9,color:"#f0ece4",fontSize:13,outline:"none",fontFamily:"'DM Sans',sans-serif"}} placeholder="Say something, United..." value={chatIn} onChange={e=>setChatIn(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMsg()}/>
            <button onClick={sendMsg} style={{...gBtn,padding:"7px 13px"}}>⚡</button>
          </div>
        </div>
      )}
    </div>
  );
}
