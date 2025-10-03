'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
} from '@/components/ui/chart';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { processAnalyticsData } from '@/lib/analyticsProcessor';
import { useRouter } from 'next/navigation';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

export default function Dashboard() {
  const [chartData, setChartData] = useState<any>(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      if (app) {
        const db = getFirestore(app);
        const analyticsCollection = collection(db, 'analytics');
        const analyticsSnapshot = await getDocs(analyticsCollection);
        const analyticsList = analyticsSnapshot.docs.map(doc => doc.data());
        const processedData = processAnalyticsData(analyticsList);
        setChartData(processedData);
      }
    };

    if (status === 'authenticated') {
      fetchData();
    }
  }, [status]);

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  if (status === 'unauthenticated') {
    return (
      <div className="container mx-auto py-10 text-center">
        <h1 className="text-3xl font-bold">Access Denied</h1>
        <p className="mb-4">You need to be logged in to view this page.</p>
        <Button onClick={() => signIn('google')}>Login with Google</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <div className="flex gap-4">
          <Button asChild>
            <Link href="/">Back to Home</Link>
          </Button>
          <Button onClick={() => signOut({ callbackUrl: '/' })}>Logout</Button>
        </div>
      </div>
      {chartData ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Visits</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.weeklyVisits}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="visits" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Monthly Visits</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.monthlyVisits}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="visits" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>CV Downloads</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.cvDownloads}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="downloads" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Section Interactions</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.sectionInteractions}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="interactions"
                    nameKey="section"
                    label={(entry) => entry.section}
                  >
                    {chartData.sectionInteractions.map((entry:any, index:number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Geographic Location</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.geographicLocation}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="visits"
                    nameKey="country"
                    label={(entry) => entry.country}
                  >
                    {chartData.geographicLocation.map((entry:any, index:number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      ) : (
        <p>Loading analytics data...</p>
      )}
    </div>
  );
}
