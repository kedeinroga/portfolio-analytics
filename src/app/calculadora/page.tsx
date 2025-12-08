'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Plus, Printer, Trash2, CalendarCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Footer } from '@/components/footer';

export default function CalculadoraPage() {
  const [deadlines, setDeadlines] = useState<number[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [daysInput, setDaysInput] = useState<string>('');
  const [startDateDisplay, setStartDateDisplay] = useState<string>('Selecciona una fecha de inicio para comenzar.');

  useEffect(() => {
    updateStartDateDisplay();
  }, [startDate]);

  const updateStartDateDisplay = () => {
    if (!startDate) {
      setStartDateDisplay('Selecciona una fecha de inicio para comenzar.');
      return;
    }

    const [y, m, d] = startDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = date.toLocaleDateString('es-ES', options);
    const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    setStartDateDisplay(`Inicio de contrato: ${capitalizedDate}`);
  };

  const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') addDeadline();
  };

  const setDaysAndAdd = (days: number) => {
    setDaysInput(days.toString());
    setTimeout(() => addDeadline(days), 0);
  };

  const addDeadline = (customDays?: number) => {
    if (!startDate) {
      alert("Por favor, selecciona primero la FECHA DE INICIO.");
      return;
    }

    const daysVal = customDays || parseInt(daysInput);

    if (isNaN(daysVal) || daysVal <= 0) {
      alert("Por favor ingresa una cantidad válida de días.");
      return;
    }

    if (deadlines.includes(daysVal)) {
      alert("Ya has agregado este plazo.");
      return;
    }

    const newDeadlines = [...deadlines, daysVal].sort((a, b) => a - b);
    setDeadlines(newDeadlines);
    setDaysInput('');
  };

  const removeDeadline = (days: number) => {
    setDeadlines(deadlines.filter(d => d !== days));
  };

  const resetAll = () => {
    if (confirm('¿Estás seguro de borrar todos los cálculos?')) {
      setDeadlines([]);
      setStartDate('');
    }
  };

  const printResults = () => {
    if (deadlines.length === 0) {
      alert("No hay nada que imprimir aún.");
      return;
    }
    window.print();
  };

  const calculateDate = (startStr: string, daysToAdd: number): Date => {
    const [y, m, d] = startStr.split('-').map(Number);
    const resultDate = new Date(y, m - 1, d);
    resultDate.setDate(resultDate.getDate() + daysToAdd);
    return resultDate;
  };

  const renderDeadlineCard = (days: number) => {
    const limitDate = calculateDate(startDate, days);
    
    const dayName = limitDate.toLocaleDateString('es-ES', { weekday: 'long' });
    const fullDate = limitDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    const capDayName = dayName.charAt(0).toUpperCase() + dayName.slice(1);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = limitDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let badgeVariant: "default" | "destructive" | "secondary" = "default";
    let badgeText = `Faltan ${diffDays} días`;
    let borderColor = "border-l-primary";

    if (diffDays < 0) {
      badgeVariant = "destructive";
      badgeText = `Venció hace ${Math.abs(diffDays)} días`;
      borderColor = "border-l-destructive";
    } else if (diffDays === 0) {
      badgeVariant = "destructive";
      badgeText = "¡Es HOY!";
      borderColor = "border-l-destructive";
    }

    return (
      <Card key={days} className={`transition-all hover:shadow-lg border-l-4 ${borderColor} no-print-border`}>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="bg-muted rounded-full w-14 h-14 flex flex-col items-center justify-center border">
                <span className="text-xs text-muted-foreground font-semibold">DÍA</span>
                <span className="text-lg font-bold leading-none">{days}</span>
              </div>
              <div>
                <h3 className="font-bold text-lg">{capDayName}</h3>
                <p className="text-sm text-muted-foreground">{fullDate}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <Badge variant={badgeVariant} className={diffDays === 0 ? 'animate-pulse' : ''}>
                {badgeText}
              </Badge>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => removeDeadline(days)} 
                className="no-print h-8 w-8" 
                title="Eliminar este plazo"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Simplified Header - Only KRG logo linking to home */}
      <header className="sticky top-0 z-50 w-full bg-background/80 shadow-md backdrop-blur-sm no-print">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="text-xl font-bold text-primary">
              KRG
            </Link>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 flex-grow">
        {/* Hero Section */}
        <div className="py-12 text-center no-print">
          <div className="flex items-center justify-center gap-3 mb-4">
            <CalendarCheck className="h-12 w-12 text-primary" />
          </div>
          <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Calculadora de Plazos
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Evita penalizaciones calculando tus fechas límite exactas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          
          {/* Panel de Configuración (Izquierda) */}
          <div className="md:col-span-1 space-y-6 no-print">
            {/* Paso 1: Fecha Inicio */}
            <Card className="border-l-4 border-l-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  Fecha de Inicio
                </CardTitle>
                <CardDescription>¿Cuándo inició labores?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Fecha base (Día 0)</Label>
                  <Input 
                    type="date" 
                    id="startDate" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Paso 2: Agregar Plazos */}
            <Card className="border-l-4 border-l-accent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="bg-accent/10 text-accent-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  Plazos (Días)
                </CardTitle>
                <CardDescription>Agrega los plazos que necesitas calcular</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-grow space-y-2">
                    <Label htmlFor="daysInput">Días a sumar</Label>
                    <Input 
                      type="number" 
                      id="daysInput" 
                      placeholder="Ej: 25" 
                      value={daysInput}
                      onChange={(e) => setDaysInput(e.target.value)}
                      onKeyPress={handleEnter}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button 
                      onClick={() => addDeadline()} 
                      size="icon"
                      className="h-10 w-10"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Botones rápidos */}
                <div className="space-y-2">
                  <Label>Accesos rápidos</Label>
                  <div className="flex gap-2 flex-wrap">
                    <Button onClick={() => setDaysAndAdd(25)} variant="secondary" size="sm">+25</Button>
                    <Button onClick={() => setDaysAndAdd(50)} variant="secondary" size="sm">+50</Button>
                    <Button onClick={() => setDaysAndAdd(75)} variant="secondary" size="sm">+75</Button>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-2">
                  <Button 
                    onClick={printResults} 
                    variant="outline"
                    className="w-full"
                  >
                    <Printer className="mr-2 h-4 w-4" /> 
                    Imprimir / Guardar PDF
                  </Button>
                  <Button 
                    onClick={resetAll} 
                    variant="ghost"
                    className="w-full text-destructive hover:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Borrar todo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Panel de Resultados (Derecha) */}
          <div className="md:col-span-2">
            <Card className="min-h-[400px]">
              <CardHeader className="border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">Cronograma de Entregas</CardTitle>
                    <CardDescription className="mt-2">
                      {startDateDisplay}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="hidden md:block no-print">
                    Cálculo Automático
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {deadlines.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Calendar className="h-16 w-16 mx-auto mb-4 opacity-20" />
                      <p>Ingresa la fecha de inicio y agrega los días<br />para ver las fechas límite aquí.</p>
                    </div>
                  ) : (
                    deadlines.map(days => renderDeadlineCard(days))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />

      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .no-print-border {
            border-left: 2px solid #ddd !important;
          }
        }
      `}</style>
    </div>
  );
}
