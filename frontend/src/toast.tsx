import {createContext, useCallback, useContext, useState, useRef, type ReactNode} from "react";
import {AnimatePresence, motion} from "framer-motion";
import {CheckCircle2, XCircle, Info} from "lucide-react";

type ToastTone = "success" | "error" | "info";
type Toast = {id: number; message: string; tone: ToastTone};
type ToastCtx = {notify: (message: string, tone?: ToastTone) => void};

const ToastContext = createContext<ToastCtx>({notify: () => {}});
export const useToast = () => useContext(ToastContext);

const ICONS: Record<ToastTone, ReactNode> = {
  success: <CheckCircle2 size={18} className="text-brass-light" />,
  error: <XCircle size={18} className="text-red-300" />,
  info: <Info size={18} className="text-[#9CB4E3]" />,
};

export function ToastProvider({children}: {children: ReactNode}) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const notify = useCallback((message: string, tone: ToastTone = "success") => {
    const id = ++idRef.current;
    setToasts(t => [...t, {id, message, tone}]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200);
  }, []);

  return (
    <ToastContext.Provider value={{notify}}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-50 flex w-full max-w-sm flex-col gap-2.5">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              layout
              initial={{opacity: 0, y: 16, scale: 0.95}}
              animate={{opacity: 1, y: 0, scale: 1}}
              exit={{opacity: 0, x: 24, transition: {duration: 0.15}}}
              transition={{type: "spring", stiffness: 400, damping: 30}}
              className="pointer-events-auto flex items-start gap-2.5 rounded-xl border border-hair bg-surface2/95 p-3.5 text-sm shadow-card backdrop-blur-md"
            >
              <span className="mt-0.5 shrink-0">{ICONS[t.tone]}</span>
              <span className="text-[13px] leading-snug text-white">{t.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
