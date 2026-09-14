begin;
create schema if not exists forma_private;
revoke all on schema forma_private from public, anon, authenticated;
create table forma_private.demo_seed (
 resource text not null, id integer not null, payload jsonb not null,
 primary key (resource, id)
);
insert into forma_private.demo_seed(resource,id,payload)
select resource,id,payload from public.forma_demo_records
where owner_id = 'be1bda88-b187-42b2-9299-6be352083811';
alter table public.forma_demo_records drop constraint forma_demo_records_pkey;
alter table public.forma_demo_records add primary key (owner_id,resource,id);
create function forma_private.provision_demo_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
 if TG_TABLE_SCHEMA <> 'auth' or TG_TABLE_NAME <> 'users' or TG_OP <> 'INSERT' then
  raise exception 'Only auth user creation is supported';
 end if;
 if coalesce(new.is_anonymous,false) then return new; end if;
 insert into public.forma_demo_access(owner_id) values(new.id) on conflict do nothing;
 insert into public.forma_demo_records(owner_id,resource,id,payload)
 select new.id,resource,id,payload from forma_private.demo_seed
 on conflict do nothing;
 return new;
end;
$$;
revoke all on function forma_private.provision_demo_user() from public,anon,authenticated;
create trigger forma_provision_demo_user after insert on auth.users
for each row execute function forma_private.provision_demo_user();
insert into public.forma_demo_access(owner_id)
select id from auth.users where not coalesce(is_anonymous,false)
on conflict do nothing;
insert into public.forma_demo_records(owner_id,resource,id,payload)
select u.id,s.resource,s.id,s.payload from auth.users u cross join forma_private.demo_seed s
where not coalesce(u.is_anonymous,false)
on conflict do nothing;
commit;
