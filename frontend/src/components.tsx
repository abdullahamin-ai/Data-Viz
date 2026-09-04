import type {ReactNode} from "react";
import {motion, AnimatePresence} from "framer-motion";
import {useEffect, useId, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";
import {ArrowLeft, LogOut, ChevronDown, User} from "lucide-react";

export function Button({children, variant = "primary", className = "", ...p}: any) {
  const base = "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-[background,box-shadow,border-color] disabled:opacity-40 disabled:pointer-events-none";
  const styles: Record<string, string> = {
    // Flat brass fill ki jagah subtle top-to-bottom gradient + ek halki inset
    // top highlight -- button ko physically embossed/tactile depth deta hai,
    // sirf flat color-swap nahi.
    primary: "bg-gradient-to-b from-brass-light to-brass text-ink shadow-glow shadow-[inset_0_1px_0_rgba(255,255,255,.35)] hover:from-[#EBD08A] hover:to-brass-light",
    ghost: "bg-white/[.04] text-white hover:bg-white/[.08] border border-hair",
    subtle: "text-muted hover:bg-white/[.06] hover:text-white",
    danger: "text-red-300 hover:bg-red-400/10",
  };
  return (
    <motion.button
      whileTap={{scale: 0.97}}
      whileHover={p.disabled ? undefined : {scale: 1.01}}
      transition={{type: "spring", stiffness: 500, damping: 32}}
      className={`${base} ${styles[variant] || styles.primary} ${className}`}
      {...p}
    >
      {children}
    </motion.button>
  );
}

export function Card({children, className = "", hover = false, ...rest}: {children: ReactNode; className?: string; hover?: boolean; [k: string]: any}) {
  return (
    <div
      className={
        "rounded-2xl border border-hair bg-surface/80 p-5 shadow-card backdrop-blur-sm " +
        (hover ? "transition-[transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-brass/30 " : "") +
        className
      }
      {...rest}
    >
      {children}
    </div>
  );
}

export function Spinner({className = ""}: {className?: string}) {
  return (
    <div
      className={"h-5 w-5 animate-spin rounded-full border-2 border-white/15 " + className}
      style={{borderTopColor: "#C9A24B"}}
    />
  );
}

export function ErrorBox({children}: {children: ReactNode}) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{opacity: 0, y: -8, height: 0}}
        animate={{opacity: 1, y: 0, height: "auto"}}
        exit={{opacity: 0, height: 0}}
        transition={{duration: 0.2}}
        className="overflow-hidden"
      >
        <div className="rounded-lg border border-red-400/25 bg-red-400/[.08] p-3 text-sm text-red-200">
          {children}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export function Skeleton({className = ""}: {className?: string}) {
  return <div className={"animate-shimmer bg-shimmer rounded-lg " + className} />;
}

export function GradientText({children, className = ""}: {children: ReactNode; className?: string}) {
  return <span className={"text-brass-gradient " + className}>{children}</span>;
}

/** Floating-label text input used across auth and filter forms. */
export function Field({label, icon, type = "text", value, onChange, endAdornment, ...rest}: {label: string; icon?: ReactNode; type?: string; value: string; onChange: (e: any) => void; endAdornment?: ReactNode; [k: string]: any}) {
  const id = useId();
  // CSS pseudo-classes (:placeholder-shown / :autofill) alone don't reliably
  // re-trigger the sibling label's style on page-load autofill in Chrome --
  // they only recompute once the user interacts with the field. This state
  // is set the instant the onAutoFillStart animation fires (see index.css),
  // so the label floats correctly from the very first paint, not just after
  // a click.
  const [autofilled, setAutofilled] = useState(false);
  return (
    <div className="relative">
      {icon && <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint">{icon}</span>}
      <input
        id={id}
        value={value}
        onChange={onChange}
        onAnimationStart={(e: any) => { if (e.animationName === "onAutoFillStart") setAutofilled(true); }}
        type={type}
        placeholder=" "
        className={
          "peer w-full rounded-lg border border-hair bg-white/[.03] pb-2.5 pt-6 text-[15px] text-white outline-none transition-colors placeholder-transparent focus:border-brass/60 disabled:cursor-not-allowed disabled:opacity-60 " +
          // Browsers force their own (usually white/yellow) background +
          // dark text on autofilled fields, which breaks the dark theme.
          // These two autofill-only overrides keep it matching the card.
          "[&:-webkit-autofill]:[-webkit-text-fill-color:#fff] [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0px_1000px_#14171D_inset] [&:-webkit-autofill]:[caret-color:#fff] " +
          (icon ? "pl-10 " : "pl-3.5 ") + (endAdornment ? "pr-10" : "pr-3.5")
        }
        {...rest}
      />
      {endAdornment && <span className="absolute right-3.5 top-1/2 -translate-y-1/2">{endAdornment}</span>}
      <label
        htmlFor={id}
        className={
          // Position CSS-driven hai, sirf React `value` state pe nahi --
          // browser autofill (Chrome/Safari saved credentials) DOM input
          // mein direct text daal deta hai bina React's onChange fire kiye,
          // isliye JS `filled` state stale reh jaata tha aur label
          // typed/autofilled text ke upar overlap ho jaata tha.
          // `:not(:placeholder-shown)` normal typing ke liye kaafi hai, lekin
          // Chrome autofill ke case mein ye pseudo-class user field ko touch
          // kiye bina turant update nahi hoti (known Chrome quirk) -- isliye
          // saath mein Tailwind ka `autofill:` variant bhi lagaya hai jo
          // `:-webkit-autofill` pseudo-class use karta hai aur autofill ko
          // reliably turant detect kar leta hai, page-load pe hi.
          "pointer-events-none absolute transition-all top-1/2 -translate-y-1/2 text-sm normal-case tracking-normal text-muted " +
          (icon ? "left-10" : "left-3.5") + " " +
          "peer-focus:top-2 peer-focus:-translate-y-0 peer-focus:text-[11px] peer-focus:uppercase peer-focus:tracking-wide peer-focus:text-brass-light " +
          "peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:-translate-y-0 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-wide peer-[:not(:placeholder-shown)]:text-faint " +
          "peer-autofill:top-2 peer-autofill:-translate-y-0 peer-autofill:text-[11px] peer-autofill:uppercase peer-autofill:tracking-wide peer-autofill:text-faint " +
          (autofilled ? "!top-2 !-translate-y-0 !text-[11px] !uppercase !tracking-wide !text-faint" : "")
        }
      >
        {label}
      </label>
    </div>
  );
}

/** Pill-style segmented control, used for chart-type selection and aggregation selection. */
export function Segmented<T extends string>({options, value, onChange, groupId = "segmented"}: {options: readonly {value: T; label: string; icon?: ReactNode}[]; value: T; onChange: (v: T) => void; groupId?: string}) {
  // groupId ke through layoutId unique banaya jata hai per-instance -- pehle
  // ye hardcoded "segmented-active" tha jo Chart Type aur Aggregation dono
  // Segmented instances mein same tha, isliye Framer Motion unhe "same
  // element" samajh kar yellow highlight ko ek se doosri jagah shift kar
  // deta tha (jab Aggregation pe click karo to Chart Type ka highlight gayab
  // ho jata, ya ulta). Har instance ko apna alag layoutId dene se dono
  // independently apna highlight rakhte hain.
  return (
    <div className="inline-flex rounded-lg border border-hair bg-white/[.03] p-1">
      {options.map(o => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={
            "relative flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors " +
            (value === o.value ? "text-ink" : "text-muted hover:text-white")
          }
        >
          {value === o.value && <motion.span layoutId={`segmented-active-${groupId}`} className="absolute inset-0 -z-10 rounded-md bg-brass" transition={{type: "spring", stiffness: 500, damping: 34}} />}
          {o.icon}{o.label}
        </button>
      ))}
    </div>
  );
}

export function Badge({children, tone = "default", icon}: {children: ReactNode; tone?: "default" | "numeric" | "categorical" | "datetime" | "text"; icon?: ReactNode}) {
  const tones: Record<string, string> = {
    default: "bg-white/[.06] text-muted",
    numeric: "bg-[#4FA9A0]/10 text-[#7BC5BC]",
    categorical: "bg-[#A784B0]/10 text-[#C7A6CF]",
    datetime: "bg-[#6E8FD1]/10 text-[#9CB4E3]",
    text: "bg-[#C97B63]/10 text-[#E0A793]",
  };
  return <span className={"inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider " + (tones[tone] || tones.default)}>{icon}{children}</span>;
}

/** Centered overlay modal. Closes on backdrop click or Escape. */
export function Modal({open, onClose, children}: {open: boolean; onClose: () => void; children: ReactNode}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}
          className="fixed inset-0 z-50 flex items-center justify-center p-5"
        >
          <motion.div
            initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}
            onClick={onClose}
            className="absolute inset-0 bg-ink/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{opacity: 0, y: 10, scale: 0.97}}
            animate={{opacity: 1, y: 0, scale: 1}}
            exit={{opacity: 0, y: 10, scale: 0.97}}
            transition={{type: "spring", stiffness: 420, damping: 34}}
            role="dialog" aria-modal="true"
            className="relative w-full max-w-sm"
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Brand-styled replacement for window.confirm(). */
export function ConfirmDialog({
  open, title, message, confirmLabel = "Delete", danger = true, onConfirm, onCancel,
}: {
  open: boolean; title: string; message: string; confirmLabel?: string; danger?: boolean;
  onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <Modal open={open} onClose={onCancel}>
      <Card className="p-6">
        <h3 className="font-display text-xl font-medium">{title}</h3>
        <p className="mt-2 text-sm text-muted">{message}</p>
        <div className="mt-6 flex justify-end gap-2.5">
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button variant={danger ? "danger" : "primary"} onClick={onConfirm} className={danger ? "border border-red-400/25 bg-red-400/[.08]" : ""}>
            {confirmLabel}
          </Button>
        </div>
      </Card>
    </Modal>
  );
}

/** Animated integer counter, e.g. row counts. */
export function Counter({value, className = ""}: {value: number; className?: string}) {
  const [display, setDisplay] = useState(0);
  const raf = useRef<number>();
  useEffect(() => {
    const start = performance.now();
    const duration = 700;
    const from = display;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (value - from) * eased));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return <span className={"font-mono " + className}>{display.toLocaleString()}</span>;
}

/** Navigates back in browser history. Falls back to `fallback` route (default: /upload)
 *  when there is no history entry to return to — e.g. the user opened a deep link directly. */
export function BackButton({fallback = "/upload", label = "Back"}: {fallback?: string; label?: string}) {
  const navigate = useNavigate();
  const canGoBack = window.history.length > 1;
  const handleClick = () => {
    if (canGoBack) {
      navigate(-1);
    } else {
      navigate(fallback, {replace: true});
    }
  };
  return (
    <Button variant="subtle" onClick={handleClick} className="self-start -ml-2">
      <ArrowLeft size={15} />
      {label}
    </Button>
  );
}

/** Header avatar + dropdown showing the signed-in email, with a logout action.
 *  Replaces a bare "Logout" button so the user always sees which account
 *  they're signed in as. Closes on outside click or Escape. */
export function UserMenu({email, onLogout}: {email?: string | null; onLogout: () => void}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const initial = (email?.[0] || "?").toUpperCase();

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDocClick);
    window.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDocClick); window.removeEventListener("keydown", onKey); };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 rounded-full border border-hair bg-white/[.03] py-1 pl-1 pr-2.5 text-sm text-muted transition-colors hover:border-brass/40 hover:text-white"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brass to-brass-light text-[12px] font-semibold text-black shadow-sm ring-1 ring-white/10">
          {email ? initial : <User size={14} strokeWidth={2.5} />}
        </span>
        <ChevronDown size={14} className={"transition-transform " + (open ? "rotate-180" : "")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{opacity: 0, y: -6, scale: 0.97}}
            animate={{opacity: 1, y: 0, scale: 1}}
            exit={{opacity: 0, y: -6, scale: 0.97}}
            transition={{duration: 0.15}}
            className="absolute right-0 top-[calc(100%+8px)] z-20 w-56 overflow-hidden rounded-xl border border-hair bg-surface2/95 shadow-card backdrop-blur-md"
          >
            <div className="border-b border-hair px-3.5 py-3">
              <div className="text-[11px] uppercase tracking-wide text-faint">Signed in as</div>
              <div className="mt-0.5 truncate text-sm font-medium text-white">{email || "Unknown"}</div>
            </div>
            <button
              type="button"
              onClick={() => { setOpen(false); onLogout(); }}
              className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm text-red-300 transition-colors hover:bg-red-400/10"
            >
              <LogOut size={15} /> Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}