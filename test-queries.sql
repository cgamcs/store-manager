-- Verificar vistas
SELECT viewname FROM pg_views WHERE schemaname = 'public' AND viewname LIKE 'vista_%';

-- Verificar triggers
SELECT trigger_name, event_object_table, action_timing, event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public' AND trigger_name LIKE 'trg_%';

-- Verificar procedimientos
SELECT proname FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.proname LIKE 'sp_%';