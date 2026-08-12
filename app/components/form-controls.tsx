"use client";

import { Check, ChevronDown, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

export type SelectChoice = { value: string; label: string; detail?: string };

export function ElasticSelect({ label, name, options, value, onChange, placeholder, searchPlaceholder, emptyText = "No matching options", searchable = false, disabled = false, required = false }: { label: string; name: string; options: SelectChoice[]; value: string; onChange: (value: string) => void; placeholder: string; searchPlaceholder?: string; emptyText?: string; searchable?: boolean; disabled?: boolean; required?: boolean }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value);
  const filtered = useMemo(() => options.filter((option) => `${option.label} ${option.detail ?? ""}`.toLocaleLowerCase().includes(query.toLocaleLowerCase())), [options, query]);

  useEffect(() => {
    function close(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", close);
    window.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", close); window.removeEventListener("keydown", escape); };
  }, []);

  return <div className={`elasticSelect formField ${open ? "open" : ""} ${disabled ? "disabled" : ""}`} ref={rootRef}>
    <span className="formLabel">{label}{required ? <b aria-hidden="true"> *</b> : null}</span>
    <input type="hidden" name={name} value={value} />
    <button className="elasticTrigger" type="button" disabled={disabled} aria-haspopup="listbox" aria-expanded={open} onClick={() => { setOpen((current) => !current); setQuery(""); }}>
      <span className={selected ? "selectedValue" : "selectPlaceholder"}>{selected?.label ?? placeholder}</span><ChevronDown aria-hidden="true" />
    </button>
    <div className="elasticMenu" aria-hidden={!open}>
      {searchable ? <label className="selectSearch"><Search aria-hidden="true" /><span className="srOnly">{searchPlaceholder ?? "Search"}</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={searchPlaceholder ?? "Search…"} onKeyDown={(event) => { if (event.key === "Enter") event.preventDefault(); }} /></label> : null}
      <div className="elasticOptions" role="listbox" aria-label={label}>
        {filtered.map((option) => <button type="button" role="option" aria-selected={option.value === value} className={option.value === value ? "selected" : ""} key={option.value} onClick={() => { onChange(option.value); setOpen(false); setQuery(""); }}><span><strong>{option.label}</strong>{option.detail ? <small>{option.detail}</small> : null}</span>{option.value === value ? <Check aria-hidden="true" /> : null}</button>)}
        {!filtered.length ? <p className="noOptions">{emptyText}</p> : null}
      </div>
    </div>
  </div>;
}

export function MultiChoice({ legend, name, options, selected, onChange, hint }: { legend: string; name: string; options: SelectChoice[]; selected: string[]; onChange: (selected: string[]) => void; hint?: string }) {
  function toggle(value: string) {
    const exclusive = value.startsWith("none-");
    if (exclusive) return onChange(selected.includes(value) ? [] : [value]);
    const withoutExclusive = selected.filter((item) => !item.startsWith("none-"));
    onChange(withoutExclusive.includes(value) ? withoutExclusive.filter((item) => item !== value) : [...withoutExclusive, value]);
  }
  return <fieldset className="multiChoice"><legend>{legend}</legend>{hint ? <p>{hint}</p> : null}<div>{options.map((option) => { const active = selected.includes(option.value); return <label className={active ? "active" : ""} key={option.value}><input type="checkbox" name={name} value={option.value} checked={active} onChange={() => toggle(option.value)} /><span className="choiceCheck"><Check aria-hidden="true" /></span><span><strong>{option.label}</strong>{option.detail ? <small>{option.detail}</small> : null}</span></label>; })}</div></fieldset>;
}
