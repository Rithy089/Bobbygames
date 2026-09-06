-- Allow letters/digits including Khmer script; exclude markup, invisible bidi controls and arbitrary symbols.
alter table public.profiles add constraint safe_display_name
 check (display_name ~ '^[[:alnum:] _ក-៹-]+$');

