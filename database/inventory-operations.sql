begin;

-- Keep inventory-operation data in the existing owner-scoped sample-data model.
alter table public.forma_demo_records drop constraint if exists forma_demo_records_resource_check;
alter table public.forma_demo_records add constraint forma_demo_records_resource_check
  check (resource = any (array['users','products','carts','suppliers','locations','purchase_orders','restock_actions']));

create policy "owner_insert_inventory_records" on public.forma_demo_records
  for insert to authenticated
  with check ((select auth.uid()) = owner_id and resource in ('suppliers','locations','purchase_orders','restock_actions'));
create policy "owner_update_inventory_records" on public.forma_demo_records
  for update to authenticated
  using ((select auth.uid()) = owner_id and resource in ('suppliers','locations','purchase_orders','restock_actions'))
  with check ((select auth.uid()) = owner_id and resource in ('suppliers','locations','purchase_orders','restock_actions'));
grant insert, update on public.forma_demo_records to authenticated;

insert into forma_private.demo_seed (resource,id,payload) values
 ('suppliers',1,'{"id":1,"name":"Northline Goods","contactName":"Jordan Lee","email":"orders@northline.example","leadTimeDays":5}'),
 ('suppliers',2,'{"id":2,"name":"Mosaic Supply Co.","contactName":"Taylor Brooks","email":"hello@mosaicsupply.example","leadTimeDays":8}'),
 ('suppliers',3,'{"id":3,"name":"Harbor Wholesale","contactName":"Casey Morgan","email":"sales@harborwholesale.example","leadTimeDays":3}'),
 ('locations',1,'{"id":1,"name":"Main warehouse","code":"MAIN","address":"Helsinki, Finland"}'),
 ('locations',2,'{"id":2,"name":"Store backroom","code":"STORE","address":"Helsinki, Finland"}'),
 ('purchase_orders',1,'{"id":1,"supplierId":1,"locationId":1,"status":"Ordered","expectedDate":"2026-09-22","itemCount":48}'),
 ('purchase_orders',2,'{"id":2,"supplierId":3,"locationId":2,"status":"Draft","expectedDate":"2026-09-28","itemCount":20}'),
 ('restock_actions',1,'{"id":1,"productId":13,"supplierId":1,"locationId":1,"purchaseOrderId":1,"quantity":24,"status":"Ordered","createdAt":"2026-09-15"}'),
 ('restock_actions',2,'{"id":2,"productId":7,"supplierId":3,"locationId":2,"purchaseOrderId":2,"quantity":12,"status":"Planned","createdAt":"2026-09-15"}')
on conflict (resource,id) do update set payload = excluded.payload;

insert into public.forma_demo_records(owner_id,resource,id,payload)
select u.id,s.resource,s.id,s.payload
from auth.users u cross join forma_private.demo_seed s
where not coalesce(u.is_anonymous,false)
  and s.resource in ('suppliers','locations','purchase_orders','restock_actions')
on conflict do nothing;

commit;
