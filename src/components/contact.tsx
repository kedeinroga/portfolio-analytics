'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { logEvent } from '@/lib/analytics';
import { FadeIn } from './fade-in';
import { useI18n } from '@/context/i18n';

const formSchema = (t: (key: string) => string) => z.object({
  name: z.string().min(2, {
    message: t('contact.form.name.error'),
  }),
  email: z.string().email({
    message: t('contact.form.email.error'),
  }),
  message: z.string().min(10, {
    message: t('contact.form.message.error'),
  }),
});


export function Contact() {
  const { toast } = useToast();
  const { t } = useI18n();

  const currentFormSchema = formSchema(t);

  const form = useForm<z.infer<typeof currentFormSchema>>({
    resolver: zodResolver(currentFormSchema),
    defaultValues: {
      name: '',
      email: '',
      message: '',
    },
  });

  function onSubmit(values: z.infer<typeof currentFormSchema>) {
    console.log('Form submitted:', values);
    logEvent('contact_form_submission', values);
    toast({
      title: t('contact.toast.title'),
      description: t('contact.toast.description'),
    });
    form.reset();
  }

  return (
    <FadeIn>
      <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {t('contact.title')}
      </h2>
      <p className="mt-6 text-lg leading-8 text-muted-foreground">
        {t('contact.description')}
      </p>
      <div className="mt-10">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('contact.form.name.label')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('contact.form.name.placeholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('contact.form.email.label')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('contact.form.email.placeholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('contact.form.message.label')}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={t('contact.form.message.placeholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">{t('contact.form.submit')}</Button>
          </form>
        </Form>
      </div>
    </FadeIn>
  );
}
