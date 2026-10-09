import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useAPConfig, type APTemplateField } from '@/hooks/useAPConfig';

export function TemplatePicker({ field, value, onChange }: { field: APTemplateField; value: string; onChange: (v: string) => void }) {
  const { templatesFor, can } = useAPConfig();
  const [open, setOpen] = useState(false);
  const [append, setAppend] = useState(false);
  if (!can('useTemplates')) return null;
  const list = templatesFor(field);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="ghost" size="sm" className="h-6 px-2 text-xs text-primary">
          <FileText className="h-3 w-3 mr-1" />Template{list.length ? ` (${list.length})` : ''}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-80" align="end">
        <Command filter={(v, s) => (v.toLowerCase().includes(s.toLowerCase()) ? 1 : 0)}>
          <CommandInput placeholder="Search template name..." />
          <div className="flex items-center justify-between px-3 py-1.5 border-b text-xs text-muted-foreground">
            <span>{append ? 'Add to existing text' : 'Replace existing text'}</span>
            <Switch checked={append} onCheckedChange={setAppend} />
          </div>
          <CommandList>
            <CommandEmpty>No templates for this field.</CommandEmpty>
            <CommandGroup>
              {list.map(t => (
                <CommandItem key={t.id} value={t.name} onSelect={() => {
                  onChange(append && value ? `${value}\n${t.body}` : t.body); setOpen(false);
                }} className="flex-col items-start">
                  <span className="font-medium">{t.name}</span>
                  <span className="text-xs text-muted-foreground line-clamp-2">{t.body}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
