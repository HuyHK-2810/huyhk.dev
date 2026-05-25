/**
 * Inlined at the top of <body> so the html.dark class is set before any
 * paint — avoids a light→dark flash on dark-mode users.
 */
const script = `(()=>{try{
const m=document.cookie.match(/(?:^|; )hk_theme=(light|dark)/);
const t=m?m[1]:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
const c=document.documentElement.classList;
t==='dark'?c.add('dark'):c.remove('dark');
document.documentElement.style.colorScheme=t;
}catch(e){}})();`;

export default function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
