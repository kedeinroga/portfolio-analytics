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

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'El nombre debe tener al menos 2 caracteres.',
  }),
  email: z.string().email({
    message: 'Por favor, introduce una dirección de correo válida.',
  }),
  message: z.string().min(10, {
    message: 'El mensaje debe tener al menos 10 caracteres.',
  }),
});

export function Contact() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      message: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log('Form submitted:', values);
    logEvent('contact_form_submission', values);
    toast({
      title: '¡Mensaje enviado!',
      description: 'Gracias por contactarme. Te responderé pronto.',
    });
    form.reset();
  }

  return (
    <FadeIn>
      <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Contacto
      </h2>
      <p className="mt-6 text-lg leading-8 text-muted-foreground">
        ¿Tienes un proyecto en mente o quieres colaborar? No dudes en enviarme un
        mensaje.
      </p>
      <div className="mt-10">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Tu nombre" {...field} />
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="tu@email.com" {...field} />
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
                  <FormLabel>Mensaje</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Cuéntame sobre tu idea..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Enviar Mensaje</Button>
          </form>
        </Form>
      </div>
    </FadeIn>
  );
}
