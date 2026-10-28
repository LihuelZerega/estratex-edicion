-- Consultas de /contexto-cliente. SOLO SELECT.
-- Reemplazar {{client_id}} (uuid, de clientes.json) y {{month}} ('YYYY-MM', el mes que se edita).
-- Correr cada bloque por separado con execute_sql del conector estratex-db (read_only=true).
-- Proyecto: jpxsxjuawnepnfvsugko (estratex).

-- Q1 · Cliente + manual de marca
select c.id, c.company_name, c.is_active, c.logo_url,
       b.onboarding_completed, b.updated_at as manual_actualizado,
       b.general_info, b.brand_identity, b.target_audience, b.advertising_strategy
from clients c
left join brand_profiles b on b.client_id = c.id
where c.id = '{{client_id}}';

-- Q2 · Ciclo del mes
select id, month, status, is_active, deadline_design
from monthly_cycles
where client_id = '{{client_id}}' and month = '{{month}}';

-- Q3 · Plan del mes: reels a editar (se cruzan por publish_date con las carpetas DD-MM-AAAA)
select p.id as post_id, p.publish_date, p.created_at, p.copy, p.design_notes,
       p.post_description, p.final_copy, p.required_services,
       p.planning_status, p.graphics_status,
       p.graphics_rejection_reason, p.correction_phase, p.correction_request
from posts p
join monthly_cycles mc on mc.id = p.cycle_id
where mc.client_id = '{{client_id}}' and mc.month = '{{month}}'
  and p.format_type = 'Reel' and coalesce(p.is_active, true)
order by p.publish_date, p.created_at;

-- Q4 · Regla NUEVO / ESTABLECIDO: meses distintos con posts aprobados, contando el mes editado
select count(distinct mc.month) as meses_con_aprobados,
       string_agg(distinct mc.month, ', ') as meses
from monthly_cycles mc
join posts p on p.cycle_id = mc.id
where mc.client_id = '{{client_id}}' and mc.month <= '{{month}}'
  and p.planning_status = 'approved' and coalesce(p.is_active, true);

-- Q5 · Historial aprobado: reels publicados en los 3 meses calendario anteriores al editado
--      (por publish_date: los ciclos se publican a veces en meses posteriores)
select to_char(p.publish_date, 'YYYY-MM') as mes_publicacion, mc.month as ciclo,
       p.publish_date, p.copy, p.design_notes, p.graphics_status,
       count(*) over () as total
from posts p
join monthly_cycles mc on mc.id = p.cycle_id
where mc.client_id = '{{client_id}}'
  and p.publish_date >= to_date('{{month}}' || '-01', 'YYYY-MM-DD') - interval '3 months'
  and p.publish_date <  to_date('{{month}}' || '-01', 'YYYY-MM-DD')
  and p.format_type = 'Reel' and p.planning_status = 'approved' and coalesce(p.is_active, true)
order by p.publish_date desc
limit 15;

-- Q6 · Devoluciones de edición/gráfica (todas las fechas). Reels primero; otros formatos aportan reglas de marca.
select mc.month, p.format_type, p.publish_date, p.copy,
       p.graphics_rejection_reason,
       case when p.correction_phase = 'graphics' then p.correction_request end as correction_request,
       coalesce(p.correction_requested_at, p.rejected_at, p.updated_at) as fecha
from posts p
join monthly_cycles mc on mc.id = p.cycle_id
where mc.client_id = '{{client_id}}'
  and (nullif(trim(p.graphics_rejection_reason), '') is not null
       or (p.correction_phase = 'graphics' and nullif(trim(p.correction_request), '') is not null))
order by (p.format_type = 'Reel') desc, fecha desc
limit 40;

-- Q7 · Devoluciones de planificación (últimas 15)
select mc.month, p.format_type, p.copy,
       coalesce(nullif(trim(p.planning_rejection_reason), ''),
                case when p.correction_phase = 'planning' then p.correction_request end) as devolucion,
       coalesce(p.correction_requested_at, p.rejected_at, p.updated_at) as fecha
from posts p
join monthly_cycles mc on mc.id = p.cycle_id
where mc.client_id = '{{client_id}}'
  and (nullif(trim(p.planning_rejection_reason), '') is not null
       or (p.correction_phase = 'planning' and nullif(trim(p.correction_request), '') is not null))
order by fecha desc
limit 15;

-- Q8 · Notas internas: calidad, notas generales del cliente y memoria de Tex
select 'calidad' as origen, note_date::text as fecha, content, correction_note as detalle, status
from (select * from quality_notes where client_id = '{{client_id}}' order by note_date desc limit 15) q
union all
select 'nota_cliente', created_at::date::text, content, null, type
from (select * from client_notes where client_id = '{{client_id}}' and type = 'general' order by created_at desc limit 10) n
union all
select 'memoria_tex', created_at::date::text, content, null, null
from (select * from tex_memory_chunks where scope = 'client:' || '{{client_id}}' order by created_at desc limit 20) t;
