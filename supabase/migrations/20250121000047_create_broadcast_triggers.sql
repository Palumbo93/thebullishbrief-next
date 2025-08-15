-- Create broadcast triggers for real-time messaging
-- This replaces the Postgres Changes approach with Broadcast for better reliability

-- Create broadcast function for bull_room_messages
create or replace function public.bull_room_messages_changes()
returns trigger
security definer
language plpgsql
as $$
begin
  perform realtime.broadcast_changes(
    'bull-room:' || coalesce(NEW.room_id, OLD.room_id) ::text, -- topic - the room-specific topic
    TG_OP,                                                     -- event - the event that triggered the function
    TG_OP,                                                     -- operation - the operation that triggered the function
    TG_TABLE_NAME,                                             -- table - the table that caused the trigger
    TG_TABLE_SCHEMA,                                           -- schema - the schema of the table that caused the trigger
    NEW,                                                       -- new record - the record after the change
    OLD                                                        -- old record - the record before the change
  );
  return null;
end;
$$;

-- Create broadcast function for bull_room_reactions
create or replace function public.bull_room_reactions_changes()
returns trigger
security definer
language plpgsql
as $$
begin
  perform realtime.broadcast_changes(
    'bull-room:' || coalesce(NEW.room_id, OLD.room_id) ::text, -- topic - the room-specific topic
    TG_OP,                                                     -- event - the event that triggered the function
    TG_OP,                                                     -- operation - the operation that triggered the function
    TG_TABLE_NAME,                                             -- table - the table that caused the trigger
    TG_TABLE_SCHEMA,                                           -- schema - the schema of the table that caused the trigger
    NEW,                                                       -- new record - the record after the change
    OLD                                                        -- old record - the record before the change
  );
  return null;
end;
$$;

-- Create triggers for bull_room_messages
drop trigger if exists handle_bull_room_messages_changes on public.bull_room_messages;
create trigger handle_bull_room_messages_changes
after insert or update or delete
on public.bull_room_messages
for each row
execute function public.bull_room_messages_changes();

-- Create triggers for bull_room_reactions
drop trigger if exists handle_bull_room_reactions_changes on public.bull_room_reactions;
create trigger handle_bull_room_reactions_changes
after insert or update or delete
on public.bull_room_reactions
for each row
execute function public.bull_room_reactions_changes();

-- Add broadcast authorization policy
drop policy if exists "Authenticated users can receive broadcasts" on "realtime"."messages";
create policy "Authenticated users can receive broadcasts"
on "realtime"."messages"
for select
to authenticated
using ( true );

-- Add comments
comment on function public.bull_room_messages_changes() is 'Broadcasts real-time changes for bull room messages';
comment on function public.bull_room_reactions_changes() is 'Broadcasts real-time changes for bull room reactions';
comment on table "public"."bull_room_messages" is 'Broadcast enabled: real-time changes are broadcast to room-specific channels';
comment on table "public"."bull_room_reactions" is 'Broadcast enabled: real-time changes are broadcast to room-specific channels';
