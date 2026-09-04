import axios from "axios";
const api = axios.create({baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"});
api.interceptors.request.use(c => { const t=localStorage.getItem("token"); if(t) c.headers.Authorization=`Bearer ${t}`; return c; });
// Expired/invalid tokens otherwise surface as raw 401 errors on every screen
// with no way back to login. Clear the stale token and force a re-login.
api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      if (location.pathname !== "/login") location.href = "/login";
    }
    return Promise.reject(err);
  }
);
export const auth = {
  signup: (email:string,password:string)=>api.post("/api/auth/signup",{email,password}),
  login: (email:string,password:string)=>api.post("/api/auth/login",{email,password}),
  // Purane sessions ke liye jinka token localStorage mein hai lekin email save
  // nahi hui -- current token se signed-in user ki email fetch karta hai.
  me: ()=>api.get("/api/auth/me")
};
export const upload = (file:File)=>{const f=new FormData();f.append("file",file);return api.post("/api/upload",f,{headers:{"Content-Type":"multipart/form-data"}})};
// Saved dashboard edit karte waqt columns + chart suggestions dobara fetch karne ke liye
export const datasetInfo = (id:number)=>api.get(`/api/upload/${id}`);
// aggregation parameter ab hardcoded "sum" nahi — caller pass karta hai (sum/avg/count)
export const chartData = (id:number,x:string,y?:string,aggregation:string="sum")=>api.get(`/api/chart-data/${id}`,{params:{x,y,aggregation}});
export const dashboards = {
  list: ()=>api.get("/api/dashboards"),
  create:(payload:any)=>api.post("/api/dashboards",payload),
  update:(id:number,payload:any)=>api.put(`/api/dashboards/${id}`,payload),
  remove:(id:number)=>api.delete(`/api/dashboards/${id}`)
};
export default api;