'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  ChartContainer,
} from '@/components/ui/chart';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  const [sectionMonth, setSectionMonth] = useState<number | 'all'>(new Date().getMonth());
  const [geoMonth, setGeoMonth] = useState<number | 'all'>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  
  // Weekly visits filters
  const [weeklyYear, setWeeklyYear] = useState<number>(new Date().getFullYear());
  const [weeklyMonth, setWeeklyMonth] = useState<number>(new Date().getMonth());
  const [weeklyWeek, setWeeklyWeek] = useState<number | 'all'>('all');
  
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

  // Helper functions to get filtered data
  const getFilteredSectionData = () => {
    if (!chartData) return [];
    if (sectionMonth === 'all') return chartData.sectionInteractions;
    
    const monthData = chartData.sectionInteractionsByMonth[sectionMonth] || {};
    return Object.entries(monthData).map(([section, interactions]) => ({ section, interactions }));
  };

  const getFilteredGeoData = () => {
    if (!chartData) return [];
    if (geoMonth === 'all') return chartData.geographicLocation;
    
    const monthData = chartData.geographicLocationByMonth[geoMonth] || {};
    return Object.entries(monthData).map(([country, visits]) => ({ country, visits }));
  };

  // Helper function to get month name
  const getMonth = (monthIndex: number) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[monthIndex];
  };

  // Helper functions for year-based filtering
  const getAvailableYears = () => {
    if (!chartData) return [];
    const years = new Set<number>();
    Object.keys(chartData.monthlyVisitsByYear || {}).forEach(year => years.add(parseInt(year)));
    Object.keys(chartData.cvDownloadsByYear || {}).forEach(year => years.add(parseInt(year)));
    return Array.from(years).sort((a, b) => b - a); // Most recent first
  };

  const getMonthlyVisitsForYear = () => {
    if (!chartData || !chartData.monthlyVisitsByYear) return [];
    const yearData = chartData.monthlyVisitsByYear[selectedYear] || {};
    return Object.entries(yearData)
      .map(([month, visits]) => ({ month: getMonth(parseInt(month)), visits }))
      .sort((a, b) => {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return monthNames.indexOf(a.month) - monthNames.indexOf(b.month);
      });
  };

  const getCvDownloadsForYear = () => {
    if (!chartData || !chartData.cvDownloadsByYear) return [];
    const yearData = chartData.cvDownloadsByYear[selectedYear] || {};
    return Object.entries(yearData)
      .map(([month, downloads]) => ({ month: getMonth(parseInt(month)), downloads }))
      .sort((a, b) => {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return monthNames.indexOf(a.month) - monthNames.indexOf(b.month);
      });
  };

  // Helper functions to get available months
  const getAvailableMonthsForSections = () => {
    if (!chartData || !chartData.sectionInteractionsByMonth) return [];
    const monthIndices = Object.keys(chartData.sectionInteractionsByMonth).map(m => parseInt(m));
    return monthIndices.sort((a, b) => a - b);
  };

  const getAvailableMonthsForGeo = () => {
    if (!chartData || !chartData.geographicLocationByMonth) return [];
    const monthIndices = Object.keys(chartData.geographicLocationByMonth).map(m => parseInt(m));
    return monthIndices.sort((a, b) => a - b);
  };

  const getMonthLabel = (monthIndex: number) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    return months[monthIndex];
  };

  // Helper functions for weekly visits filtering
  const getAvailableYearsForWeekly = () => {
    if (!chartData || !chartData.weeklyVisitsByYearMonth) return [];
    const years = Object.keys(chartData.weeklyVisitsByYearMonth).map(y => parseInt(y));
    return years.sort((a, b) => b - a);
  };

  const getAvailableMonthsForWeekly = () => {
    if (!chartData || !chartData.weeklyVisitsByYearMonth || !chartData.weeklyVisitsByYearMonth[weeklyYear]) return [];
    const months = Object.keys(chartData.weeklyVisitsByYearMonth[weeklyYear]).map(m => parseInt(m));
    return months.sort((a, b) => a - b);
  };

  const getAvailableWeeksForMonth = () => {
    if (!chartData || !chartData.weeklyVisitsByYearMonth || 
        !chartData.weeklyVisitsByYearMonth[weeklyYear] || 
        !chartData.weeklyVisitsByYearMonth[weeklyYear][weeklyMonth]) return [];
    const weeks = Object.keys(chartData.weeklyVisitsByYearMonth[weeklyYear][weeklyMonth]).map(w => parseInt(w));
    return weeks.sort((a, b) => a - b);
  };

  const getWeeklyVisitsData = () => {
    if (!chartData || !chartData.weeklyVisitsByYearMonth) return chartData?.weeklyVisits || [];
    
    if (weeklyWeek === 'all') {
      // Aggregate all weeks in the selected month
      const monthData = chartData.weeklyVisitsByYearMonth[weeklyYear]?.[weeklyMonth] || {};
      const aggregated: { [day: number]: number } = {};
      
      Object.values(monthData).forEach((weekData: any) => {
        Object.entries(weekData).forEach(([day, visits]) => {
          aggregated[parseInt(day)] = (aggregated[parseInt(day)] || 0) + (visits as number);
        });
      });
      
      return Array(7).fill(0).map((_, i) => ({ 
        day: getDayOfWeekName(i), 
        visits: aggregated[i] || 0 
      }));
    } else {
      // Show specific week
      const weekData = chartData.weeklyVisitsByYearMonth[weeklyYear]?.[weeklyMonth]?.[weeklyWeek] || {};
      return Array(7).fill(0).map((_, i) => ({ 
        day: getDayOfWeekName(i), 
        visits: weekData[i] || 0 
      }));
    }
  };

  const getDayOfWeekName = (dayIndex: number) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[dayIndex];
  };

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
              <div className="flex flex-col gap-2">
                <CardTitle>Weekly Visits</CardTitle>
                <div className="flex flex-wrap gap-2">
                  <Select
                    value={weeklyYear.toString()}
                    onValueChange={(value) => setWeeklyYear(parseInt(value))}
                  >
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableYearsForWeekly().map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={weeklyMonth.toString()}
                    onValueChange={(value) => setWeeklyMonth(parseInt(value))}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableMonthsForWeekly().map((monthIndex) => (
                        <SelectItem key={monthIndex} value={monthIndex.toString()}>
                          {getMonthLabel(monthIndex)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={weeklyWeek.toString()}
                    onValueChange={(value) => setWeeklyWeek(value === 'all' ? 'all' : parseInt(value))}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Week" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Weeks</SelectItem>
                      {getAvailableWeeksForMonth().map((week) => (
                        <SelectItem key={week} value={week.toString()}>
                          Week {week}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getWeeklyVisitsData()}>
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
              <div className="flex items-center justify-between">
                <CardTitle>Monthly Visits</CardTitle>
                <Select
                  value={selectedYear.toString()}
                  onValueChange={(value) => setSelectedYear(parseInt(value))}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableYears().map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getMonthlyVisitsForYear()}>
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
              <div className="flex items-center justify-between">
                <CardTitle>CV Downloads</CardTitle>
                <Select
                  value={selectedYear.toString()}
                  onValueChange={(value) => setSelectedYear(parseInt(value))}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableYears().map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getCvDownloadsForYear()}>
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
              <div className="flex items-center justify-between">
                <CardTitle>Section Interactions</CardTitle>
                <Select
                  value={sectionMonth.toString()}
                  onValueChange={(value) => setSectionMonth(value === 'all' ? 'all' : parseInt(value))}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    {getAvailableMonthsForSections().map((monthIndex: number) => (
                      <SelectItem key={monthIndex} value={monthIndex.toString()}>
                        {getMonthLabel(monthIndex)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getFilteredSectionData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="interactions"
                    nameKey="section"
                    label={(entry) => entry.section}
                  >
                    {getFilteredSectionData().map((entry:any, index:number) => (
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
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Geographic Location</CardTitle>
                <Select
                  value={geoMonth.toString()}
                  onValueChange={(value) => setGeoMonth(value === 'all' ? 'all' : parseInt(value))}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    {getAvailableMonthsForGeo().map((monthIndex: number) => (
                      <SelectItem key={monthIndex} value={monthIndex.toString()}>
                        {getMonthLabel(monthIndex)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart 
                  data={[...getFilteredGeoData()].sort((a, b) => b.visits - a.visits).slice(0, 20)}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="country" type="category" width={90} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="visits" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          {/* CV Download Details Section */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>CV Download Details - Interested Users</CardTitle>
              <CardDescription>
                Detailed information about users who downloaded your CV, showing genuine interest in your profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Day</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Language</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {chartData.cvDownloadDetails && chartData.cvDownloadDetails.length > 0 ? (
                      chartData.cvDownloadDetails.map((download: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {download.monthName} {download.day}, {download.year}
                          </TableCell>
                          <TableCell>{download.dayOfWeek}</TableCell>
                          <TableCell>{download.country}</TableCell>
                          <TableCell>{download.city}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                              download.language === 'en' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'
                            }`}>
                              {download.language === 'en' ? '🇬🇧 English' : '🇪🇸 Español'}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No CV downloads yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <p>Loading analytics data...</p>
      )}
    </div>
  );
}
