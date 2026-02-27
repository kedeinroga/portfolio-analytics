'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calculator,
  Percent,
  DollarSign,
  Calendar,
  RefreshCcw,
  Plus,
  Trash2,
  Printer,
  TrendingDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Footer } from '@/components/footer';

// --- FINANCIAL LOGIC ---

/** Calcula cuota fija (Fórmula de anualidad) */
const calculatePMT = (principal: number, annualRate: number, months: number): number => {
  if (annualRate === 0) return principal / months;
  const r = annualRate / 100 / 12;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
};

/** Algoritmo: encontrar tasa dada una cuota (Búsqueda Binaria) */
const findRate = (principal: number, months: number, targetPayment: number): number => {
  if (targetPayment <= principal / months) return 0;
  let low = 0;
  let high = 500;
  let foundRate = 0;
  for (let i = 0; i < 100; i++) {
    const mid = (low + high) / 2;
    const payment = calculatePMT(principal, mid, months);
    if (Math.abs(payment - targetPayment) < 0.000001) return mid;
    if (payment > targetPayment) high = mid;
    else low = mid;
    foundRate = mid;
  }
  return foundRate;
};

interface Prepayment {
  month: number;
  amount: number;
}

interface ScheduleRow {
  month: number;
  payment: number;
  interest: number;
  principal: number;
  extra: number;
  balance: number;
}

interface Summary {
  quota: number;
  rate: number;
  totalPaid: number;
  totalInterest: number;
  realMonths: number;
  savedMonths: number;
}

/** Genera Tabla de Amortización con Prepagos */
const generateSchedule = (
  principal: number,
  annualRate: number,
  totalMonths: number,
  prepayments: Prepayment[] = []
): ScheduleRow[] => {
  const schedule: ScheduleRow[] = [];
  let balance = principal;
  const r = annualRate / 100 / 12;
  let monthlyPayment = calculatePMT(principal, annualRate, totalMonths);

  const prepayMap: Record<number, number> = prepayments.reduce(
    (acc, curr) => {
      acc[curr.month] = (acc[curr.month] || 0) + curr.amount;
      return acc;
    },
    {} as Record<number, number>
  );

  let currentMonth = 1;

  while (balance > 0.01 && currentMonth <= totalMonths * 2) {
    const interest = balance * r;
    let principalPayment = monthlyPayment - interest;

    if (balance < principalPayment) {
      principalPayment = balance;
      monthlyPayment = interest + principalPayment;
    }

    const extraPayment = prepayMap[currentMonth] || 0;
    const totalPrincipalPaid = principalPayment + extraPayment;
    const endBalance = balance - totalPrincipalPaid;

    schedule.push({
      month: currentMonth,
      payment: monthlyPayment,
      interest,
      principal: principalPayment,
      extra: extraPayment,
      balance: endBalance < 0 ? 0 : endBalance,
    });

    balance = endBalance;
    if (balance <= 0) break;
    currentMonth++;
  }

  return schedule;
};

const fmt = (n: number) =>
  n.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// --- MAIN COMPONENT ---

export default function FinanzasPage() {
  const [mode, setMode] = useState<'quota' | 'rate'>('quota');

  const [amount, setAmount] = useState<number>(10000);
  const [rate, setRate] = useState<number>(12);
  const [months, setMonths] = useState<number>(12);
  const [targetQuota, setTargetQuota] = useState<number>(0);

  const [prepayments, setPrepayments] = useState<Prepayment[]>([]);
  const [newPrepayMonth, setNewPrepayMonth] = useState<number>(1);
  const [newPrepayAmount, setNewPrepayAmount] = useState<number>(1000);

  const [schedule, setSchedule] = useState<ScheduleRow[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);

  const calculate = () => {
    let calculatedRate = rate;
    let calculatedQuota = 0;

    if (mode === 'rate') {
      calculatedRate = findRate(amount, months, targetQuota);
      setRate(calculatedRate);
      calculatedQuota = targetQuota;
    } else {
      calculatedQuota = calculatePMT(amount, rate, months);
    }

    const table = generateSchedule(amount, calculatedRate, months, prepayments);
    setSchedule(table);

    const totalPaid = table.reduce((sum, row) => sum + row.payment + row.extra, 0);
    const totalInterest = table.reduce((sum, row) => sum + row.interest, 0);
    const realMonths = table.length;

    setSummary({
      quota: calculatedQuota,
      rate: calculatedRate,
      totalPaid,
      totalInterest,
      realMonths,
      savedMonths: months - realMonths,
    });
  };

  const addPrepayment = () => {
    if (newPrepayAmount <= 0 || newPrepayMonth < 1) return;
    setPrepayments([...prepayments, { month: newPrepayMonth, amount: newPrepayAmount }]);
    setNewPrepayAmount(0);
  };

  const removePrepayment = (index: number) => {
    const updated = [...prepayments];
    updated.splice(index, 1);
    setPrepayments(updated);
  };

  // Recalculate when prepayments change (if results already shown)
  useEffect(() => {
    if (summary) calculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prepayments]);

  const handlePrint = () => window.print();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Simplified Header */}
      <header className="sticky top-0 z-50 w-full bg-background/80 shadow-md backdrop-blur-sm no-print">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="text-xl font-bold text-primary">
              KRG
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 flex-grow">
        {/* Hero Section */}
        <div className="py-12 text-center no-print">
          <div className="flex items-center justify-center gap-3 mb-4">
            <TrendingDown className="h-12 w-12 text-primary" />
          </div>
          <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Simulador Financiero
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Calcula cuotas, descubre tasas ocultas y simula abonos a capital
          </p>
        </div>

        {/* Print header (only shown when printing) */}
        <div className="hidden print:block mb-6 border-b pb-4">
          <h1 className="text-2xl font-bold">Simulador Financiero — KRG</h1>
          <p>
            <strong>Capital:</strong> ${fmt(amount)} &nbsp;|&nbsp;
            <strong>Plazo Original:</strong> {months} meses
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 print:block">
          {/* LEFT PANEL */}
          <div className="md:col-span-1 space-y-6 no-print">
            {/* Mode + Inputs */}
            <Card className="border-l-4 border-l-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calculator className="h-5 w-5 text-primary" />
                  Parámetros del Crédito
                </CardTitle>
                <CardDescription>Ingresa los datos del préstamo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Mode Tabs */}
                <div className="flex bg-muted p-1 rounded-lg">
                  <button
                    onClick={() => setMode('quota')}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                      mode === 'quota'
                        ? 'bg-background shadow text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Calcular Cuota
                  </button>
                  <button
                    onClick={() => setMode('rate')}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                      mode === 'rate'
                        ? 'bg-background shadow text-accent-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Hallar Tasa
                  </button>
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <Label htmlFor="amount" className="flex items-center gap-1">
                    <DollarSign className="h-3.5 w-3.5" />
                    Monto del Préstamo
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    min={0}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                  />
                </div>

                {/* Months */}
                <div className="space-y-2">
                  <Label htmlFor="months" className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Plazo (Meses)
                  </Label>
                  <Input
                    id="months"
                    type="number"
                    min={1}
                    value={months}
                    onChange={(e) => setMonths(Number(e.target.value))}
                  />
                </div>

                {/* Rate or Target Quota */}
                {mode === 'quota' ? (
                  <div className="space-y-2">
                    <Label htmlFor="rate" className="flex items-center gap-1">
                      <Percent className="h-3.5 w-3.5" />
                      Tasa de Interés Anual (%)
                    </Label>
                    <Input
                      id="rate"
                      type="number"
                      min={0}
                      step={0.01}
                      value={rate}
                      onChange={(e) => setRate(Number(e.target.value))}
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="targetQuota" className="flex items-center gap-1 text-accent-foreground">
                      <DollarSign className="h-3.5 w-3.5" />
                      Cuota Objetivo Mensual
                    </Label>
                    <Input
                      id="targetQuota"
                      type="number"
                      min={0}
                      value={targetQuota}
                      onChange={(e) => setTargetQuota(Number(e.target.value))}
                      className="border-accent/50 focus-visible:ring-accent"
                    />
                  </div>
                )}

                <Button onClick={calculate} className="w-full">
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  {mode === 'quota' ? 'Calcular Tabla' : 'Calcular Tasa y Tabla'}
                </Button>
              </CardContent>
            </Card>

            {/* Prepayments (only shown after calculation) */}
            {summary && (
              <Card className="border-l-4 border-l-accent">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <span className="bg-accent/10 text-accent-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                      +
                    </span>
                    Abonos a Capital
                  </CardTitle>
                  <CardDescription>Simula pagos extraordinarios al principal</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <div className="space-y-1 w-24">
                      <Label htmlFor="prepayMonth" className="text-xs">Mes #</Label>
                      <Input
                        id="prepayMonth"
                        type="number"
                        min={1}
                        value={newPrepayMonth}
                        onChange={(e) => setNewPrepayMonth(Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-1 flex-1">
                      <Label htmlFor="prepayAmount" className="text-xs">Monto</Label>
                      <Input
                        id="prepayAmount"
                        type="number"
                        min={0}
                        value={newPrepayAmount}
                        onChange={(e) => setNewPrepayAmount(Number(e.target.value))}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button onClick={addPrepayment} size="icon" variant="secondary" className="h-10 w-10">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-44 overflow-y-auto">
                    {prepayments.length === 0 && (
                      <p className="text-xs text-muted-foreground italic text-center py-2">
                        No hay abonos programados.
                      </p>
                    )}
                    {prepayments.map((p, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center bg-muted/50 p-2 rounded border border-border text-sm"
                      >
                        <span>
                          Mes {p.month}:{' '}
                          <strong>${fmt(p.amount)}</strong>
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => removePrepayment(idx)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t">
                    <Button
                      onClick={handlePrint}
                      variant="outline"
                      className="w-full"
                    >
                      <Printer className="mr-2 h-4 w-4" />
                      Imprimir / Guardar PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* RIGHT PANEL */}
          <div className="md:col-span-2 space-y-6 print:w-full print:block">
            {summary ? (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:grid-cols-4 print:gap-2">
                  <Card className="bg-primary text-primary-foreground print:bg-white print:text-foreground print:border print:shadow-none">
                    <CardContent className="p-4">
                      <p className="text-primary-foreground/70 text-xs font-medium uppercase print:text-muted-foreground">
                        Cuota Mensual
                      </p>
                      <p className="text-2xl font-bold">${fmt(summary.quota)}</p>
                    </CardContent>
                  </Card>
                  <Card className="print:shadow-none">
                    <CardContent className="p-4">
                      <p className="text-muted-foreground text-xs font-medium uppercase">Tasa Anual</p>
                      <p className="text-2xl font-bold">{summary.rate.toFixed(2)}%</p>
                    </CardContent>
                  </Card>
                  <Card className="print:shadow-none">
                    <CardContent className="p-4">
                      <p className="text-muted-foreground text-xs font-medium uppercase">Total Intereses</p>
                      <p className="text-2xl font-bold">${fmt(summary.totalInterest)}</p>
                    </CardContent>
                  </Card>
                  <Card
                    className={`print:shadow-none ${
                      prepayments.length > 0
                        ? 'border-green-400 bg-green-50 dark:bg-green-950/30'
                        : ''
                    }`}
                  >
                    <CardContent className="p-4">
                      <p
                        className={`text-xs font-medium uppercase ${
                          prepayments.length > 0 ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
                        }`}
                      >
                        Tiempo Real
                      </p>
                      <p
                        className={`text-2xl font-bold ${
                          prepayments.length > 0 ? 'text-green-700 dark:text-green-300' : ''
                        }`}
                      >
                        {summary.realMonths}{' '}
                        <span className="text-sm font-normal">meses</span>
                      </p>
                      {summary.savedMonths > 0 && (
                        <Badge variant="secondary" className="mt-1 text-green-700 bg-green-100 no-print text-xs">
                          ¡{summary.savedMonths} meses menos!
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Amortization Table */}
                <Card className="overflow-hidden print:shadow-none print:border-none">
                  <CardHeader className="bg-muted/50 border-b print:bg-white print:p-0 print:mb-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Tabla de Amortización</CardTitle>
                        <CardDescription>
                          {schedule.length} cuotas · Total pagado: ${fmt(summary.totalPaid)}
                        </CardDescription>
                      </div>
                      <Button
                        onClick={handlePrint}
                        variant="secondary"
                        size="sm"
                        className="no-print"
                      >
                        <Printer className="mr-2 h-4 w-4" />
                        PDF
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-auto max-h-[480px] print:max-h-none print:overflow-visible">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground sticky top-0 print:static print:text-foreground">
                          <tr>
                            <th className="px-4 py-3 border-b font-medium print:px-2">Mes</th>
                            <th className="px-4 py-3 border-b font-medium print:px-2">Cuota</th>
                            <th className="px-4 py-3 border-b font-medium print:px-2">Interés</th>
                            <th className="px-4 py-3 border-b font-medium print:px-2">Capital</th>
                            <th className="px-4 py-3 border-b font-medium print:px-2">Abono</th>
                            <th className="px-4 py-3 border-b font-medium print:px-2">Saldo</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {schedule.map((row) => (
                            <tr
                              key={row.month}
                              className="hover:bg-muted/30 transition-colors print:hover:bg-white"
                            >
                              <td className="px-4 py-2.5 font-medium print:px-2">{row.month}</td>
                              <td className="px-4 py-2.5 print:px-2">${fmt(row.payment)}</td>
                              <td className="px-4 py-2.5 text-destructive print:px-2 print:text-foreground">
                                ${fmt(row.interest)}
                              </td>
                              <td className="px-4 py-2.5 text-primary print:px-2 print:text-foreground">
                                ${fmt(row.principal)}
                              </td>
                              <td className="px-4 py-2.5 print:px-2">
                                {row.extra > 0 ? (
                                  <Badge
                                    variant="secondary"
                                    className="text-green-700 bg-green-100 dark:bg-green-950/40 dark:text-green-300 print:bg-transparent print:text-foreground"
                                  >
                                    +${fmt(row.extra)}
                                  </Badge>
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                )}
                              </td>
                              <td className="px-4 py-2.5 font-semibold print:px-2">${fmt(row.balance)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="min-h-[400px] flex flex-col items-center justify-center border-dashed">
                <CardContent className="text-center text-muted-foreground py-16">
                  <Calculator className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p>
                    Ingresa los datos del crédito y presiona{' '}
                    <strong>Calcular Tabla</strong> para ver la simulación.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />

      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
