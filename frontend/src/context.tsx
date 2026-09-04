import {createContext,useContext,useState,useEffect,ReactNode} from "react";
import {auth} from "./api";
type Ctx={token:string|null;email:string|null;login:(t:string,email?:string)=>void;logout:()=>void};
const AuthContext=createContext<Ctx>({token:null,email:null,login:()=>{},logout:()=>{}});
export function AuthProvider({children}:{children:ReactNode}) {
 const [token,setToken]=useState(localStorage.getItem("token"));
 const [email,setEmail]=useState(localStorage.getItem("email"));
 const login=(t:string,em?:string)=>{
  localStorage.setItem("token",t);setToken(t);
  if(em){localStorage.setItem("email",em);setEmail(em)}
 };
 const logout=()=>{localStorage.removeItem("token");localStorage.removeItem("email");setToken(null);setEmail(null)};
 useEffect(()=>{
  // Purana session: token maujood hai lekin email kabhi save nahi hui (isi
  // wajah se dropdown mein "Signed in as Unknown" dikhta tha) -- backend se
  // ek dafa email fetch karke localStorage mein bhar do.
  if(token&&!email){
   auth.me().then(r=>{
    const em=r.data?.email;
    if(em){localStorage.setItem("email",em);setEmail(em)}
   }).catch(()=>{});
  }
 },[token,email]);
 return <AuthContext.Provider value={{token,email,login,logout}}>{children}</AuthContext.Provider>
}
export const useAuth=()=>useContext(AuthContext);