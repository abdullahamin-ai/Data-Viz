import {BrowserRouter,Routes,Route,Navigate,Link,useNavigate,useParams,useLocation} from "react-router-dom";
import {useState,useEffect,useRef} from "react";
import type React from "react";
import {motion,AnimatePresence} from "framer-motion";
import {UploadCloud,LayoutDashboard,Trash2,Check,Sparkles,FileWarning,Mail,Lock,BarChart3,LineChart as LineIcon,AreaChart as AreaIcon,PieChart as PieIcon,ArrowRight,X as ClearIcon,Database,FileDown,Image as ImageIcon,Table2,Zap,ShieldCheck,Eye,EyeOff,Hash,Tag,Calendar,Type as TypeIcon} from "lucide-react";
import {auth,upload,dashboards,chartData,datasetInfo} from "./api";
import {AuthProvider,useAuth} from "./context";
import {ToastProvider,useToast} from "./toast";
import {Button,Card,Spinner,ErrorBox,Skeleton,GradientText,Counter,Field,Segmented,Badge,ConfirmDialog,BackButton,UserMenu} from "./components";
import {BarChartPremium,LineChartPremium,AreaChartPremium,DonutChartPremium,CHART_COLORS} from "./charts";
import {exportChartCSV,exportChartPNG} from "./export";
import type {Dataset,Dashboard,Suggestion} from "./types";
import "./index.css";

const CHART_TYPES = [
 {value:"bar",label:"Bar",icon:<BarChart3 size={14}/>},
 {value:"line",label:"Line",icon:<LineIcon size={14}/>},
 {value:"area",label:"Area",icon:<AreaIcon size={14}/>},
 {value:"pie",label:"Pie",icon:<PieIcon size={14}/>},
] as const;
type ChartType = typeof CHART_TYPES[number]["value"];

const AGG_TYPES = [
 {value:"sum",label:"Sum"},
 {value:"avg",label:"Avg"},
 {value:"count",label:"Count"},
] as const;
type AggType = typeof AGG_TYPES[number]["value"];

const stagger = {show: {transition: {staggerChildren: 0.05}}};
const item = {hidden: {opacity: 0, y: 10}, show: {opacity: 1, y: 0, transition: {duration: 0.25}}};

// Har chart type ka apna alag accent color -- pehle sab types (bar/line/area)
// hamesha CHART_COLORS[0] (brass) use karte the, ab palette se har type ko
// apna color mil raha hai taake chart type switch karte hi visually bhi farq
// mehsoos ho, sirf shape hi na badle.
const TYPE_COLOR: Record<ChartType,string> = {bar:CHART_COLORS[0],line:CHART_COLORS[1],area:CHART_COLORS[3],pie:CHART_COLORS[0]};
const TYPE_ICON: Record<ChartType,JSX.Element> = Object.fromEntries(CHART_TYPES.map(c=>[c.value,c.icon])) as any;

function ChartView({type,data}:{type:ChartType;data:{label:string;value:number}[]}){
 if(type==="pie") return <DonutChartPremium data={data}/>;
 if(type==="line") return <LineChartPremium data={data} color={TYPE_COLOR.line}/>;
 if(type==="area") return <AreaChartPremium data={data} color={TYPE_COLOR.area}/>;
 return <BarChartPremium data={data} color={TYPE_COLOR.bar}/>;
}

function Backdrop(){
 return <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-noise">
  <div className="absolute -top-40 -left-24 h-[32rem] w-[32rem] rounded-full bg-brass/[.08] blur-[130px] animate-ambient"/>
  <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-[#4FA9A0]/[.06] blur-[120px]"/>
 </div>
}

function NavLink({to,children}:{to:string;children:React.ReactNode}){
 const loc=useLocation();
 // Dashboard route se aaya hua tab highlight uss jagah ke mutabiq hona chahiye jahan se
 // user aaya hai: agar Saved dashboard open/edit ki hai (state.dashboard mojood hai) to
 // "Saved" active rahe, warna naye upload se aaya hoga to "New dataset" active ho
 const onDashboard=loc.pathname.startsWith("/dashboard");
 const cameFromSaved=!!(loc.state as any)?.dashboard;
 const active=onDashboard
  ?(cameFromSaved?to==="/saved":to==="/upload")
  :loc.pathname.startsWith(to);
 return <Link to={to} className={"relative rounded-lg px-3 py-2 text-sm transition-colors "+(active?"text-ink":"text-muted hover:text-white")}>
  {active&&<motion.div layoutId="nav-active" className="absolute inset-0 -z-10 rounded-lg bg-brass" transition={{type:"spring",stiffness:420,damping:34}}/>}
  <span className="relative">{children}</span>
 </Link>
}

function Layout({children}:{children:any}){
 const {token,email,logout}=useAuth();
 const loc=useLocation();
 const isLanding=loc.pathname==="/"&&!token;
 // Browser tab ka title pehle hamesha same rehta tha chahe koi bhi page ho.
 // Ab route ke mutabiq badalta hai -- multiple tabs khule hon (jaise Upload
 // aur Saved) to unhe pehchanna aasan ho jata hai.
 useEffect(()=>{
  const titles:Record<string,string>=
   {"/upload":"New dataset","/saved":"Saved dashboards","/login":"Sign in","/signup":"Create account"};
  const base="DataViz";
  const t=loc.pathname.startsWith("/dashboard")?"Dashboard":titles[loc.pathname];
  document.title=t?`${t} — ${base}`:`${base} — Dashboards from any spreadsheet`;
 },[loc.pathname]);
 return <div className="relative min-h-screen">
  <Backdrop/>
  <header className="sticky top-0 z-10 border-b border-hair bg-ink/80 backdrop-blur-md">
   <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
    <Link to="/" className="font-display text-xl font-semibold tracking-tight">Data<GradientText>Viz</GradientText></Link>
    {token
     ?<nav className="flex items-center gap-2">
       <NavLink to="/upload">New dataset</NavLink>
       <NavLink to="/saved">Saved</NavLink>
       <div className="ml-2"><UserMenu email={email} onLogout={logout}/></div>
      </nav>
     :isLanding&&<nav className="flex items-center gap-2">
       <Link to="/login" className="rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:text-white">Sign in</Link>
       <Link to="/signup"><Button variant="ghost">Get started</Button></Link>
      </nav>
    }
   </div>
  </header>
  <main className={isLanding?"":"mx-auto max-w-6xl px-5 py-10"}>
   <AnimatePresence mode="wait">
    <motion.div key={loc.pathname} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:0.18}}>
     {children}
    </motion.div>
   </AnimatePresence>
  </main>
 </div>
}
function Protected({children}:{children:any}){return useAuth().token?<>{children}</>:<Navigate to="/login" replace/>}

const heroStagger = {show: {transition: {staggerChildren: 0.1, delayChildren: 0.05}}};
const heroItem = {hidden: {opacity: 0, y: 18}, show: {opacity: 1, y: 0, transition: {duration: 0.55, ease: [0.16,1,0.3,1]}}};

// Sample data purely for the landing page's illustrative chart preview — no
// upload/API call happens here, it's just a visual demonstration of the product.
const DEMO_DATA = [
 {label:"Jan",value:38},{label:"Feb",value:52},{label:"Mar",value:47},
 {label:"Apr",value:63},{label:"May",value:58},{label:"Jun",value:74},
];

const FEATURES = [
 {icon:<Zap size={18}/>,title:"Column types detected automatically",desc:"Numeric, categorical, datetime and text are told apart the moment you upload — no manual tagging."},
 {icon:<Sparkles size={18}/>,title:"Chart suggestions, not blank canvases",desc:"The right chart for each column pairing is proposed for you, ready to open with one click."},
 {icon:<LayoutDashboard size={18}/>,title:"Multi-chart dashboards",desc:"Build several charts from one dataset and lay them out together, side by side."},
 {icon:<FileDown size={18}/>,title:"Export anytime",desc:"Pull any chart out as a PNG for a deck, or a CSV for a spreadsheet."},
 {icon:<ShieldCheck size={18}/>,title:"Your data, your account",desc:"Datasets and dashboards are private to your login — nothing is shared across accounts."},
 {icon:<Table2 size={18}/>,title:"Dashboards you can return to",desc:"Save a view once and reopen it from anywhere, fully rebuilt from live data."},
];

function Landing(){
 return <div>
  <section className="mx-auto max-w-6xl px-5 pb-16 pt-14 lg:pt-20">
   <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr]">
    <motion.div variants={heroStagger} initial="hidden" animate="show">
     <motion.p variants={heroItem} className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-brass-light">DataViz</motion.p>
     <motion.h1 variants={heroItem} className="font-display text-4xl font-medium leading-[1.1] tracking-tight lg:text-6xl">Every spreadsheet<br/>has a story</motion.h1>
     <motion.p variants={heroItem} className="mt-5 max-w-md text-[15px] leading-relaxed text-muted lg:text-base">Upload a CSV or JSON file and get column analysis, chart suggestions, and a working dashboard back in seconds — no formulas, no formatting.</motion.p>
     <motion.div variants={heroItem} className="mt-8 flex flex-wrap items-center gap-3">
      <Link to="/signup"><Button className="px-5 py-3">Get started free<ArrowRight size={15}/></Button></Link>
      <Link to="/login"><Button variant="ghost" className="px-5 py-3">Sign in</Button></Link>
     </motion.div>
     <motion.p variants={heroItem} className="mt-4 text-xs text-faint">No credit card. CSV or JSON, up to 25 MB.</motion.p>
    </motion.div>
    <motion.div initial={{opacity:0,y:16,scale:0.98}} animate={{opacity:1,y:0,scale:1}} transition={{duration:0.6,ease:[0.16,1,0.3,1],delay:0.15}}>
     <Card className="p-6">
      <div className="flex items-center justify-between">
       <div>
        <div className="font-display text-lg font-medium">Revenue by month</div>
        <div className="text-xs text-faint">Sample preview · demo data</div>
       </div>
       <Badge tone="numeric">numeric</Badge>
      </div>
      <div className="mt-4"><AreaChartPremium data={DEMO_DATA} color={CHART_COLORS[3]}/></div>
     </Card>
    </motion.div>
   </div>
  </section>

  <section className="border-t border-hair bg-white/[.015]">
   <div className="mx-auto max-w-6xl px-5 py-16">
    <motion.div initial={{opacity:0,y:12}} whileInView={{opacity:1,y:0}} viewport={{once:true,margin:"-80px"}} transition={{duration:0.5}}>
     <h2 className="font-display text-3xl font-medium tracking-tight">Built to get out of your way</h2>
     <p className="mt-2 max-w-xl text-muted">From raw file to a dashboard you'll actually reopen.</p>
    </motion.div>
    <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{once:true,margin:"-60px"}} className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
     {FEATURES.map((f,i)=>
      <motion.div variants={item} key={i}>
       <Card className="h-full">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brass/10 text-brass-light">{f.icon}</span>
        <div className="mt-3.5 font-medium text-white">{f.title}</div>
        <div className="mt-1.5 text-sm leading-relaxed text-muted">{f.desc}</div>
       </Card>
      </motion.div>
     )}
    </motion.div>
   </div>
  </section>

  <section className="mx-auto max-w-6xl px-5 py-16">
   <motion.div initial={{opacity:0,y:12}} whileInView={{opacity:1,y:0}} viewport={{once:true,margin:"-80px"}} transition={{duration:0.5}}>
    <Card className="flex flex-col items-center gap-4 p-10 text-center">
     <h2 className="font-display text-3xl font-medium tracking-tight">Turn your next CSV into a dashboard</h2>
     <p className="max-w-md text-muted">It takes less time than opening a spreadsheet formula reference.</p>
     <Link to="/signup"><Button className="px-5 py-3">Get started free<ArrowRight size={15}/></Button></Link>
    </Card>
   </motion.div>
  </section>
 </div>
}

/** Root route: signed-in users go straight to their workspace; everyone else sees the landing page. */
function Home(){ return useAuth().token ? <Navigate to="/upload" replace/> : <Landing/> }

const loginStagger = {show: {transition: {staggerChildren: 0.09, delayChildren: 0.1}}};
const loginItem = {hidden: {opacity: 0, y: 16}, show: {opacity: 1, y: 0, transition: {duration: 0.5, ease: [0.16,1,0.3,1]}}};

function Login({signup=false}:{signup?:boolean}){
 const {login}=useAuth(); const nav=useNavigate(); const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [busy,setBusy]=useState(false); const [err,setErr]=useState(""); const [showPassword,setShowPassword]=useState(false);
 const submit=async(e:any)=>{e.preventDefault();setErr("");if(!/^[^@]+@[^@]+\.[^@]+$/.test(email))return setErr("Enter a valid email.");if(password.length<8)return setErr("Password must be at least 8 characters.");setBusy(true);try{const r=signup?await auth.signup(email,password):await auth.login(email,password);login(r.data.access_token,r.data.user?.email);nav("/upload")}catch(e:any){setErr(e.response?.data?.detail||"Request failed.")}finally{setBusy(false)}};
 // Value props ab ek plain dot ki jagah apna khaas icon rakhte hain — teeno
 // features ko ek nazar mein alag pehchan mil jati hai.
 const valueProps=[
  {icon:<Database size={14}/>,t:"Column types detected automatically",d:"numeric, categorical, datetime and text are told apart on upload"},
  {icon:<Sparkles size={14}/>,t:"Chart suggestions, not blank canvases",d:"the right chart for each column pairing is proposed for you"},
  {icon:<LayoutDashboard size={14}/>,t:"Dashboards you can return to",d:"save a view once and reopen it from anywhere"},
 ];
 return <div className="grid min-h-[75vh] items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
  <motion.div className="lg:hidden" initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} transition={{duration:.5}}>
   <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-brass-light">DataViz</p>
   <h1 className="font-display text-3xl font-medium leading-[1.15] tracking-tight">Every <span className="text-brass-gradient">spreadsheet</span><br/>has a story</h1>
   <p className="mt-3 text-[14px] leading-relaxed text-muted">Upload a CSV or JSON and get a working dashboard back in seconds.</p>
  </motion.div>
  <div className="hidden lg:block">
   <motion.div initial={{opacity:0,x:-16}} animate={{opacity:1,x:0}} transition={{duration:.6,ease:[0.16,1,0.3,1]}}>
    <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-brass-light">DataViz</p>
    <h1 className="font-display text-5xl font-medium leading-[1.08] tracking-tight">Every <span className="text-brass-gradient">spreadsheet</span><br/>has a story</h1>
    <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted">Upload a CSV or JSON file and get column analysis, chart suggestions, and a working dashboard back in seconds — no formulas, no formatting.</p>
    <div className="mt-10 space-y-4">
     {valueProps.map((v,i)=>
      <div key={i} className="flex gap-3">
       <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-brass/10 text-brass-light">{v.icon}</div>
       <div><div className="font-medium text-white">{v.t}</div><div className="text-sm text-muted">{v.d}</div></div>
      </div>
     )}
    </div>
   </motion.div>
  </div>
  <motion.div variants={loginStagger} initial="hidden" animate="show" className="mx-auto w-full max-w-sm">
   <Card className="p-7 shadow-[0_0_50px_-18px_rgba(201,162,75,0.35)]">
    <motion.div variants={loginItem}>
     <h2 className="font-display text-2xl font-medium">{signup?"Create your account":"Welcome back"}</h2>
     <p className="mt-1.5 text-sm text-muted">{signup?"Start turning datasets into dashboards.":"Sign in to your workspace."}</p>
    </motion.div>
    {err&&<motion.div variants={loginItem} className="mt-4"><ErrorBox>{err}</ErrorBox></motion.div>}
    <fieldset disabled={busy} className={"mt-6 space-y-3.5 transition-opacity "+(busy?"opacity-60":"")}>
     <form onSubmit={submit} className="space-y-3.5">
      <motion.div variants={loginItem}><Field label="Email" icon={<Mail size={16}/>} type="email" value={email} onChange={(e:any)=>setEmail(e.target.value)} autoComplete="email"/></motion.div>
      <motion.div variants={loginItem}>
       <Field
        label="Password" icon={<Lock size={16}/>} type={showPassword?"text":"password"} value={password}
        onChange={(e:any)=>setPassword(e.target.value)} autoComplete="current-password"
        endAdornment={
         <button type="button" tabIndex={-1} onClick={()=>setShowPassword(s=>!s)} aria-label={showPassword?"Hide password":"Show password"} className="text-faint transition-colors hover:text-white">
          {showPassword?<EyeOff size={16}/>:<Eye size={16}/>}
         </button>
        }
       />
       {signup&&<p className="mt-1.5 pl-0.5 text-xs text-faint">At least 8 characters.</p>}
      </motion.div>
      <motion.div variants={loginItem}>
       <Button disabled={busy} className="flex w-full justify-center">{busy?<Spinner/>:<>{signup?"Create account":"Sign in"}<ArrowRight size={15}/></>}</Button>
      </motion.div>
     </form>
    </fieldset>
    <motion.p variants={loginItem} className="mt-6 text-center text-sm text-muted">{signup?"Already have an account? ":"Need an account? "}<Link className="font-medium text-brass-light hover:text-brass" to={signup?"/login":"/signup"}>{signup?"Sign in":"Sign up"}</Link></motion.p>
   </Card>
  </motion.div>
 </div>
}

// ColumnSelect: X/Y ke liye dropdown — free-text ki jagah real column names dikhata hai
function ColumnSelect({label,columns,value,onChange,placeholder,disabled=false}:{label:string;columns:Record<string,string>;value:string;onChange:(v:string)=>void;placeholder?:string;disabled?:boolean}){
 return <div className="flex flex-col gap-1.5">
  <label className="text-[11px] uppercase tracking-wide text-faint">{label}</label>
  <select
   value={value}
   onChange={e=>onChange(e.target.value)}
   disabled={disabled}
   className="w-full rounded-lg border border-hair bg-white/[.03] px-3.5 py-2.5 text-[15px] text-white outline-none transition-colors focus:border-brass/60 disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer"
  >
   <option value="" className="bg-[#0B0D11] text-muted">{placeholder||"Select column…"}</option>
   {Object.entries(columns).map(([col,type])=>
    <option key={col} value={col} className="bg-[#0B0D11]">{col} ({type})</option>
   )}
  </select>
 </div>
}

function UploadPage(){
 const [file,setFile]=useState<File|null>(null);const [busy,setBusy]=useState(false);const [err,setErr]=useState("");const [data,setData]=useState<Dataset|null>(null);const [dragging,setDragging]=useState(false);const nav=useNavigate();
 const go=async()=>{if(!file)return;setBusy(true);setErr("");try{const r=await upload(file);setData(r.data)}catch(e:any){setErr(e.response?.data?.detail||"Upload failed.")}finally{setBusy(false)}};
 // Suggestion pe click karne se seedha dashboard khulta hai us suggestion ke saath pre-filled
 const openWithSuggestion=(s:Suggestion)=>{if(!data)return;nav(`/dashboard/${data.id}`,{state:{suggestions:data.suggestions,autoApply:s}})};
 const openDashboard=()=>{if(!data)return;nav(`/dashboard/${data.id}`,{state:{suggestions:data.suggestions}})};
 const onDrop=(e:React.DragEvent)=>{e.preventDefault();setDragging(false);const f=e.dataTransfer.files?.[0];if(f)setFile(f)};
 const badgeTone=(t:string)=>(["numeric","categorical","datetime","text"].includes(t)?t:"default") as any;
 // Har column type ka apna icon -- pehle sirf color-coded text tha, ab ek
 // nazar mein pehchan bhi ho jati hai (Hash=numeric, Tag=categorical, waghera).
 const badgeIcon=(t:string)=>({numeric:<Hash size={10}/>,categorical:<Tag size={10}/>,datetime:<Calendar size={10}/>,text:<TypeIcon size={10}/>} as Record<string,React.ReactNode>)[t];
 // File size human-readable format mein
 const fileSize=(bytes:number)=>bytes<1024*1024?`${(bytes/1024).toFixed(0)} KB`:`${(bytes/1024/1024).toFixed(1)} MB`;
 return <div className="space-y-6">
  <div>
   <h1 className="font-display text-4xl font-medium tracking-tight">Upload a dataset</h1>
   <p className="mt-2 text-muted">CSV or JSON. Column types and chart ideas are detected automatically.</p>
  </div>
  {err&&<ErrorBox>{err}</ErrorBox>}
  <Card>
   <label
    onDragEnter={e=>{e.preventDefault();setDragging(true)}}
    onDragOver={e=>e.preventDefault()}
    onDragLeave={()=>setDragging(false)}
    onDrop={onDrop}
    className={"flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed text-center transition-all duration-200 "+(dragging?"border-brass/60 bg-brass/[.06] scale-[1.01] shadow-[0_0_60px_-15px_rgba(201,162,75,0.5)]":"border-white/15 bg-white/[.02] hover:border-white/25")}
   >
    <input type="file" accept=".csv,.json" className="hidden" onChange={e=>setFile(e.target.files?.[0]||null)}/>
    <motion.div animate={dragging?{y:-4,scale:1.1}:{y:0,scale:1}} transition={{type:"spring",stiffness:300,damping:20}}>
     <UploadCloud size={40} className={dragging?"text-brass-light":"text-faint"}/>
    </motion.div>
    {file
     ? <><div className="mt-3 font-medium">{file.name}</div><div className="mt-1 text-sm text-brass-light">{fileSize(file.size)}</div></>
     : <><div className="mt-3 font-medium">Drop a CSV/JSON or click to browse</div><div className="mt-1 text-sm text-faint">Max 25 MB · CSV or JSON</div></>
    }
   </label>
   <Button onClick={go} disabled={!file||busy} className="mt-4 flex items-center gap-2">{busy?<><Spinner/> Processing…</>:"Generate dashboard"}</Button>
  </Card>
  <AnimatePresence>
  {data&&<motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:.3}}>
   <Card>
    <div className="flex flex-wrap items-start justify-between gap-4">
     <div>
      <h2 className="font-display text-2xl font-medium">{data.filename}</h2>
      <p className="text-muted"><Counter value={data.row_count}/> rows · {Object.keys(data.columns).length} columns</p>
     </div>
     <Button onClick={openDashboard}><LayoutDashboard size={16}/>Open dashboard</Button>
    </div>
    <motion.div variants={stagger} initial="hidden" animate="show" className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
     {Object.entries(data.columns).map(([k,v])=>
      <motion.div variants={item} key={k} className="rounded-xl border border-hair bg-white/[.03] p-3">
       <div className="truncate font-medium">{k}</div>
       <div className="mt-1.5"><Badge tone={badgeTone(v)} icon={badgeIcon(v)}>{v}</Badge></div>
      </motion.div>
     )}
    </motion.div>
    {data.suggestions.length>0&&<div className="mt-6">
     <p className="mb-2 flex items-center gap-1.5 text-sm text-muted"><Sparkles size={14} className="text-brass-light"/>Suggested charts — click to open</p>
     <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-wrap gap-2">
      {data.suggestions.map((s,i)=>
       <motion.div variants={item} key={i}>
        <Button variant="ghost" onClick={()=>openWithSuggestion(s)}>{s.title}</Button>
       </motion.div>
      )}
     </motion.div>
    </div>}
    {data.preview.length>0&&<div className="mt-6">
     <p className="mb-2 text-sm text-muted">Preview — first {data.preview.length} rows</p>
     <div className="overflow-x-auto rounded-xl border border-hair">
      <table className="w-full min-w-[480px] text-left text-sm">
       <thead>
        <tr className="border-b border-hair bg-white/[.02]">
         {Object.keys(data.columns).map(k=><th key={k} className="whitespace-nowrap px-3.5 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-faint">{k}</th>)}
        </tr>
       </thead>
       <tbody>
        {data.preview.map((row,i)=>
         <tr key={i} className={i%2?"bg-white/[.015]":""}>
          {Object.keys(data.columns).map(k=><td key={k} className="whitespace-nowrap px-3.5 py-2.5 font-mono text-[13px] text-muted">{String(row[k]??"—")}</td>)}
         </tr>
        )}
       </tbody>
      </table>
     </div>
    </div>}
   </Card>
  </motion.div>}
  </AnimatePresence>
 </div>
}

type ChartEntry = {id:string;title:string;data:{label:string;value:number}[];type:ChartType;x:string;y:string|null};

function DashboardPage({id,columns={},suggestions=[],autoApply,savedDashboard}:{id:number;columns?:Record<string,string>;suggestions?:Suggestion[];autoApply?:Suggestion;savedDashboard?:Dashboard}){
 const {notify}=useToast();
 const nav=useNavigate();
 // Dashboard ab EK chart tak mehdood nahi — "charts" poori grid hai jismein
 // multiple charts side-by-side rehte hain, har ek apna id, export aur remove
 // button rakhta hai.
 const [charts,setCharts]=useState<ChartEntry[]>([]);const [err,setErr]=useState("");const [saved,setSaved]=useState(false);const [building,setBuilding]=useState(false);
 const [x,setX]=useState("");const [y,setY]=useState("");const [chartType,setChartType]=useState<ChartType>("bar");const [agg,setAgg]=useState<AggType>("sum");
 // Ye saved dashboard ka id/name track karta hai — "Update dashboard" isi ko PUT karta hai
 const [dashboardId,setDashboardId]=useState<number|null>(null);const [dashboardName,setDashboardName]=useState("");const [updating,setUpdating]=useState(false);
 // Har chart card ke andar liye gaye <svg> tak pahunchne ke liye ref map — PNG export isko use karta hai.
 const chartRefs=useRef<Record<string,HTMLDivElement|null>>({});

 const makeId=()=>`c${Date.now()}${Math.random().toString(36).slice(2,7)}`;

 // Naya chart banata hai aur GRID mein ADD karta hai (purane charts ko replace nahi karta).
 const addChart=async(bx?:string,by?:string,btype?:ChartType,bagg?:AggType)=>{
  const ux=bx??x,uy=by??y,ut=btype??chartType,ua=bagg??agg;
  if(!ux)return;
  // Same X/Y/chart-type combination pehle se grid mein maujood ho to dobara
  // identical chart nahi banate -- sirf user ko batate hain, warna "Add chart"
  // ya suggestion do dafa click karne se hu-ba-hu do charts ban jate hain.
  const dup=charts.some(c=>c.x===ux&&(c.y||"")===(uy||"")&&c.type===ut);
  if(dup){notify("This chart is already on the dashboard.");return;}
  setErr("");setBuilding(true);
  try{
   const r=await chartData(id,ux,uy||undefined,ua);
   const xLabel=ux==="__row__"?"records":ux;
   const title=ux==="__row__"?`${uy} across records`:`${uy||"Count"} by ${xLabel}`;
   setCharts(cs=>[...cs,{id:makeId(),title,data:r.data.data,type:ut,x:ux,y:uy||null}]);
   setSaved(false);
  }catch(e:any){setErr(e.response?.data?.detail||"Chart generation failed.")}
  finally{setBuilding(false)}
 };
 // Saved-dashboard reload ke liye: builder ke x/y state ko chhue baghair seedha
 // ek config se chart bana kar grid mein add karta hai.
 const loadConfig=async(cfg:Suggestion)=>{
  if(!cfg?.x)return;
  try{
   const r=await chartData(id,cfg.x,cfg.y||undefined,"sum");
   const xLabel=cfg.x==="__row__"?"records":cfg.x;
   const title=cfg.title||(cfg.x==="__row__"?`${cfg.y} across records`:`${cfg.y||"Count"} by ${xLabel}`);
   const t=(CHART_TYPES.map(c=>c.value) as string[]).includes(cfg.type)?cfg.type as ChartType:"bar";
   setCharts(cs=>[...cs,{id:makeId(),title,data:r.data.data,type:t,x:cfg.x,y:cfg.y||null}]);
  }catch(e:any){notify(`Could not load "${cfg.title||cfg.x}": ${e.response?.data?.detail||"chart generation failed."}`,"error");}
 };
 const applySuggestion=(s:Suggestion)=>{setX(s.x);setY(s.y||"");const t=(CHART_TYPES.map(c=>c.value) as string[]).includes(s.type)?s.type as ChartType:"bar";setChartType(t);addChart(s.x,s.y||undefined,t)};
 const removeChart=(chartId:string)=>{setCharts(cs=>cs.filter(c=>c.id!==chartId));delete chartRefs.current[chartId];setSaved(false)};
 // StrictMode (dev mode) jaan-boojh kar mount effects ko 2 dafa chalata hai
 // taake side-effect bugs pakre jayein. Bina guard ke yeh effect autoApply/
 // savedDashboard wale charts DO DAFA add kar deta (2 charts ban jate pehli
 // dafa mein). Yeh ref confirm karta hai ke asal kaam sirf EK dafa ho.
 const initRan=useRef(false);
 useEffect(()=>{
  if(initRan.current)return;
  initRan.current=true;
  (async()=>{
   if(autoApply){applySuggestion(autoApply);return}
   if(savedDashboard){
    setDashboardId(savedDashboard.id);
    setDashboardName(savedDashboard.name);
    const rawConfigs=(savedDashboard.chart_configs||[]) as Suggestion[];
    // Purane saved dashboards mein (fix se pehle) hu-ba-hu duplicate configs
    // save ho chuke ho sakte hain -- load karte waqt bhi unhe filter karte
    // hain taake same chart do dafa na bane. Save "Update dashboard" se DB
    // mein bhi clean ho jayega.
    const seen=new Set<string>();
    const configs=rawConfigs.filter(cfg=>{
     const key=`${cfg.x}|${cfg.y||""}|${cfg.type}`;
     if(seen.has(key))return false;
     seen.add(key);return true;
    });
    for(const cfg of configs){ await loadConfig(cfg); }
    // Sab configs DB se aaye saved data se match karte hain, isliye load
    // complete hone ke baad saved=true kar dete hain — warna "Save dashboard"
    // enabled dikhta rehta aur accidental duplicate ban sakta.
    setSaved(true);
   }
  })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
 },[]);
 const isRowMode=x==="__row__";
 const hasColumns=Object.keys(columns).length>0;

 const saveDashboard=async()=>{
  const name=`${charts[0]?.x||"New"} dashboard`;
  // Raw aggregated "data" snapshot store nahi karte — x/y/type/title bas store
  // karte hain taake reload pe fresh data chartData se dobara fetch ho.
  const configs=charts.map(c=>({x:c.x,y:c.y,type:c.type,title:c.title}));
  try{
   const r=await dashboards.create({dataset_id:id,name,chart_configs:configs});
   setDashboardId(r.data.id);setDashboardName(r.data.name);setSaved(true);
   notify("Dashboard saved.");
  }catch(e:any){notify(e.response?.data?.detail||"Could not save dashboard.","error");}
 };
 const updateDashboardFn=async()=>{
  setUpdating(true);
  const name=dashboardName||`${charts[0]?.x||"New"} dashboard`;
  const configs=charts.map(c=>({x:c.x,y:c.y,type:c.type,title:c.title}));
  try{
   await dashboards.update(dashboardId as number,{name,chart_configs:configs});
   setSaved(true);
   notify("Dashboard updated.");
   // Update ke baad edit screen apne aap band ho kar Saved section khul jaye
   nav("/saved");
  }catch(e:any){notify(e.response?.data?.detail||"Could not update dashboard.","error");}
  finally{setUpdating(false);}
 };

 return <div className="space-y-6">
  <BackButton fallback="/upload"/>
  <div>
   <h1 className="font-display text-4xl font-medium tracking-tight">Interactive analysis</h1>
   <p className="mt-2 text-muted">Choose columns, then add as many charts as you need to the dashboard below.</p>
  </div>
  {suggestions.length>0&&<Card>
   <p className="mb-2 flex items-center gap-1.5 text-sm text-muted"><Sparkles size={14} className="text-brass-light"/>Quick start</p>
   <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-wrap gap-2">
    {suggestions.map((s,i)=><motion.div variants={item} key={i}><Button variant="ghost" onClick={()=>applySuggestion(s)}>{s.title}</Button></motion.div>)}
   </motion.div>
  </Card>}
  {err&&<ErrorBox>{err}</ErrorBox>}
  <Card>
   <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
    {hasColumns
     ? <>
        <div className="relative">
         <ColumnSelect label="X / category" columns={columns} value={isRowMode?"":x} onChange={setX} placeholder="Select X column…" disabled={isRowMode}/>
         {isRowMode&&<button type="button" onClick={()=>setX("")} aria-label="Clear" className="absolute right-3.5 bottom-2.5 text-faint transition-colors hover:text-white"><ClearIcon size={15}/></button>}
        </div>
        <ColumnSelect label="Y / numeric (optional)" columns={columns} value={y} onChange={setY} placeholder="Select Y column…"/>
       </>
     : <>
        <div className="relative">
         <Field label="X / category" value={isRowMode?"Row order (auto)":x} onChange={(e:any)=>setX(e.target.value)} placeholder="e.g. Region" disabled={isRowMode}/>
         {isRowMode&&<button type="button" onClick={()=>setX("")} aria-label="Clear" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-faint transition-colors hover:text-white"><ClearIcon size={15}/></button>}
        </div>
        <Field label="Y / numeric (optional)" value={y} onChange={(e:any)=>setY(e.target.value)} placeholder="e.g. Sales"/>
       </>
    }
    <div className="flex flex-col gap-4 md:flex-row md:items-end">
     <div className="flex flex-col gap-1.5">
      <label className="text-[11px] uppercase tracking-wide text-faint">Aggregation</label>
      <Segmented options={AGG_TYPES} value={agg} onChange={setAgg} groupId="aggregation"/>
     </div>
    </div>
   </div>
   <div className="mt-4 flex flex-wrap items-center gap-3">
    <div className="flex flex-col gap-1.5">
     <label className="text-[11px] uppercase tracking-wide text-faint">Chart type</label>
     <Segmented options={CHART_TYPES as any} value={chartType} onChange={setChartType} groupId="chart-type"/>
    </div>
    <div className="mt-auto"><Button onClick={()=>addChart()} disabled={!x||building} className="h-[46px]">{building?<><Spinner/>Adding…</>:<><LayoutDashboard size={15}/>Add chart</>}</Button></div>
   </div>
  </Card>

  {charts.length===0?
   <Card><div className="flex flex-col items-center gap-3 py-16 text-center">
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brass/10 text-brass-light"><LayoutDashboard size={22}/></div>
    <div>
     <p className="font-medium text-white">No charts yet</p>
     <p className="mt-1 text-sm text-faint">Choose columns above and click "Add chart" to get started.</p>
    </div>
   </div></Card>
   :
   <motion.div variants={stagger} initial="hidden" animate="show" className={"grid gap-5 "+(charts.length>1?"md:grid-cols-2":"grid-cols-1")}>
    <AnimatePresence>
     {charts.map(c=>
      <motion.div key={c.id} layout initial={{opacity:0,y:12,scale:0.98}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,scale:0.95}} transition={{duration:.25}}>
       <Card hover className="group">
        <div className="flex items-start justify-between gap-3">
         <h3 className="font-display text-lg font-medium flex items-center gap-2">
          <span className="h-2 w-2 shrink-0 rounded-full transition-transform duration-200 group-hover:scale-125" style={{background:TYPE_COLOR[c.type]}}/>{c.title}
         </h3>
         <div className="flex shrink-0 items-center gap-0.5 opacity-60 transition-opacity duration-200 group-hover:opacity-100">
          <button type="button" title="Export CSV" onClick={()=>exportChartCSV(c.data,c.title)} className="rounded-lg p-1.5 text-faint transition-colors hover:bg-white/[.06] hover:text-white"><FileDown size={15}/></button>
          <button type="button" title="Export PNG" onClick={()=>exportChartPNG(chartRefs.current[c.id],c.title).catch((e:any)=>notify(e.message||"Could not export image.","error"))} className="rounded-lg p-1.5 text-faint transition-colors hover:bg-white/[.06] hover:text-white"><ImageIcon size={15}/></button>
          <button type="button" title="Remove chart" onClick={()=>removeChart(c.id)} className="rounded-lg p-1.5 text-faint transition-colors hover:bg-red-400/10 hover:text-red-300"><Trash2 size={15}/></button>
         </div>
        </div>
        <div className="mt-4" ref={el=>{chartRefs.current[c.id]=el}}>
         {c.data.length===0?<div className="py-16 text-center text-faint">No data points for that selection.</div>:<ChartView type={c.type} data={c.data}/>}
        </div>
       </Card>
      </motion.div>
     )}
    </AnimatePresence>
   </motion.div>
  }

  {/* Dashboard ka naam ab khud edit kiya ja sakta hai -- pehle ye hamesha
      auto-generated hota tha (e.g. "Date dashboard"). Naam Save/Update
      dono ke sath jata hai, koi backend change nahi -- name field pehle se
      dono endpoints accept karte the. */}
  {charts.length>0&&<div className="max-w-sm">
   <Field label="Dashboard name" value={dashboardName} onChange={(e:any)=>{setDashboardName(e.target.value);setSaved(false)}} placeholder={`${charts[0]?.x||"New"} dashboard`}/>
  </div>}
  {charts.length>0&&<div className="flex flex-wrap gap-3">
   {/* "Save dashboard" sirf tab dikhta hai jab ye dashboard PEHLI dafa save ho
       raha ho (dashboardId abhi tak nahi bana). Ek dafa save/update ho jaye
       (Saved list se khola ho ya pehli save ke baad), sirf "Update dashboard"
       dikhega -- taake dobara "Save" click karke accidental duplicate na
       bane aur Saved section mein sirf latest version rahe. */}
   {!dashboardId&&<Button disabled={saved} onClick={saveDashboard}>
    <AnimatePresence mode="wait" initial={false}>
     {saved?<motion.span key="saved" initial={{opacity:0,scale:.7}} animate={{opacity:1,scale:1}} className="flex items-center gap-1.5"><Check size={16}/>Saved</motion.span>:<motion.span key="save" initial={{opacity:0}} animate={{opacity:1}}>Save dashboard</motion.span>}
    </AnimatePresence>
   </Button>}
   {dashboardId&&<Button disabled={updating||saved} onClick={updateDashboardFn}>
    <AnimatePresence mode="wait" initial={false}>
     {saved?<motion.span key="saved" initial={{opacity:0,scale:.7}} animate={{opacity:1,scale:1}} className="flex items-center gap-1.5"><Check size={16}/>Saved</motion.span>:updating?<motion.span key="updating" className="flex items-center gap-1.5"><Spinner/>Updating…</motion.span>:<motion.span key="update" initial={{opacity:0}} animate={{opacity:1}}>Update dashboard</motion.span>}
    </AnimatePresence>
   </Button>}
  </div>}
 </div>
}

function SavedSkeleton(){
 return <div className="mt-6 grid gap-4 md:grid-cols-2">
  {[0,1,2,3].map(i=><Card key={i}><Skeleton className="h-5 w-2/3"/><Skeleton className="mt-3 h-3 w-1/3"/><Skeleton className="mt-2 h-3 w-1/2"/></Card>)}
 </div>
}

function Saved(){
 const {notify}=useToast();
 const [items,setItems]=useState<Dashboard[]>([]);const [loading,setLoading]=useState(true);const nav=useNavigate();
 const [pendingDelete,setPendingDelete]=useState<Dashboard|null>(null);
 const load=()=>dashboards.list().then(r=>setItems(r.data.items)).finally(()=>setLoading(false));
 useEffect(()=>{load()},[]);
 // Poora dashboard object state ke through bhejte hain (jaise suggestions/autoApply
 // pehle se bhejte hain) taake dobara fetch kiye bina saved chart auto-load ho sake.
 const openSaved=(d:Dashboard)=>nav(`/dashboard/${d.dataset_id}`,{state:{dashboard:d}});
 const confirmRemove=async()=>{
  if(!pendingDelete)return;
  const d=pendingDelete;setPendingDelete(null);
  try{await dashboards.remove(d.id);load();notify(`"${d.name}" deleted.`);}
  catch(e:any){notify(e.response?.data?.detail||"Could not delete dashboard.","error");}
 };
 return <div>
  <BackButton fallback="/upload"/>
  <h1 className="font-display text-4xl font-medium tracking-tight mt-2">Saved dashboards</h1>
  {loading?<SavedSkeleton/>:items.length===0?
   <Card className="mt-6 text-center py-10">
    <FileWarning className="mx-auto mb-3 text-faint" size={32}/>
    <p className="text-muted">You haven't saved a dashboard yet.</p>
    <div className="mt-5 flex justify-center">
     <Button onClick={()=>nav("/upload")}><UploadCloud size={15}/>Upload your first dataset</Button>
    </div>
   </Card>
   :
   <motion.div variants={stagger} initial="hidden" animate="show" className="mt-6 grid gap-4 md:grid-cols-2">
    {items.map(d=>
     <motion.div variants={item} key={d.id}>
      <Card hover className="cursor-pointer" onClick={()=>openSaved(d)}>
       {/* Har card ab uske chart type ka apna icon + color dikhata hai (Bookmark
           ki jagah) — pehle saari saved cards identical dikhti thi, ab ek nazar
           mein pata chal jayega konsa dashboard bar/line/area/pie hai. */}
       {(()=>{const t=(d.chart_configs?.[0]?.type as ChartType)||"bar"; const tc=TYPE_COLOR[t]||TYPE_COLOR.bar; return <div className="flex items-start justify-between gap-3">
        <h2 className="font-medium flex items-center gap-2">
         <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md" style={{background:`${tc}22`,color:tc}}>{TYPE_ICON[t]||TYPE_ICON.bar}</span>
         {d.name}
        </h2>
        <button onClick={(e)=>{e.stopPropagation();setPendingDelete(d)}} className="rounded-lg p-1.5 text-faint transition-colors hover:bg-red-400/10 hover:text-red-300"><Trash2 size={15}/></button>
       </div>})()}
       {/* Dataset info — dataset_id se file ka naam seedha available nahi, id dikhate hain */}
       <div className="mt-2 flex items-center gap-1.5 text-xs text-faint">
        <Database size={11}/>
        <span>Dataset #{d.dataset_id}</span>
        <span className="mx-1">·</span>
        <span>{d.chart_configs?.length||0} chart{d.chart_configs?.length!==1?"s":""}</span>
       </div>
       <p className="mt-1.5 text-xs text-faint">Updated {new Date(d.updated_at).toLocaleString()}</p>
      </Card>
     </motion.div>
    )}
   </motion.div>
  }
  <ConfirmDialog
   open={!!pendingDelete}
   title="Delete dashboard?"
   message={pendingDelete?`"${pendingDelete.name}" will be permanently removed. This can't be undone.`:""}
   confirmLabel="Delete"
   onConfirm={confirmRemove}
   onCancel={()=>setPendingDelete(null)}
  />
 </div>
}

function App(){return <ToastProvider><AuthProvider><Layout><Routes><Route path="/login" element={<Login/>}/><Route path="/signup" element={<Login signup/>}/><Route path="/" element={<Home/>}/><Route path="/upload" element={<Protected><UploadPage/></Protected>}/><Route path="/dashboard/:id" element={<Protected><DashboardRoute/></Protected>}/><Route path="/saved" element={<Protected><Saved/></Protected>}/><Route path="*" element={<Navigate to="/" replace/>}/></Routes></Layout></AuthProvider></ToastProvider>}
function DashboardRoute(){
 const {id}=useParams();
 const location=useLocation();
 const state=location.state as any;
 const autoApply=state?.autoApply;
 const savedDashboard=state?.dashboard;
 // Saved dashboard ko Saved page se open karne par state mein sirf {dashboard}
 // hota hai -- suggestions/columns nahi. Un dono ko dataset se fetch karte
 // hain taake Saved wale flow mein bhi "Quick start" aur column dropdowns
 // waisi hi milein jaisi naya dataset upload karne par milti hain.
 const [fetched,setFetched]=useState<{columns:Record<string,string>;suggestions:Suggestion[]}|null>(
  state?.suggestions?{columns:state?.columns||{},suggestions:state.suggestions}:null
 );
 const [loadingInfo,setLoadingInfo]=useState(!!savedDashboard&&!fetched);
 useEffect(()=>{
  if(fetched||!savedDashboard)return;
  let cancelled=false;
  datasetInfo(savedDashboard.dataset_id).then(r=>{
   if(cancelled)return;
   setFetched({columns:r.data.columns||{},suggestions:r.data.suggestions||[]});
  }).catch(()=>{}).finally(()=>{if(!cancelled)setLoadingInfo(false)});
  return ()=>{cancelled=true};
  // eslint-disable-next-line react-hooks/exhaustive-deps
 },[savedDashboard?.id]);
 if(loadingInfo)return <SavedSkeleton/>;
 return <DashboardPage id={Number(id)} columns={fetched?.columns||{}} suggestions={fetched?.suggestions||[]} autoApply={autoApply} savedDashboard={savedDashboard}/>
}
export default ()=> <BrowserRouter><App/></BrowserRouter>;