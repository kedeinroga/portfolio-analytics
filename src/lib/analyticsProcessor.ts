export const processAnalyticsData = (data: any[]) => {
  const weeklyVisits = Array(7).fill(0).map((_, i) => ({ day: getDayOfWeek(i), visits: 0 }));
  const monthlyVisits = Array(12).fill(0).map((_, i) => ({ month: getMonth(i), visits: 0 }));
  const cvDownloads = Array(12).fill(0).map((_, i) => ({ month: getMonth(i), downloads: 0 }));
  const sectionInteractions: { [key: string]: number } = {};
  const geographicLocation: { [key: string]: number } = {};

  // Track by month for filtering
  const sectionInteractionsByMonth: { [month: number]: { [key: string]: number } } = {};
  const geographicLocationByMonth: { [month: number]: { [key: string]: number } } = {};

  // Track by year and month for monthly visits and CV downloads
  const monthlyVisitsByYear: { [year: number]: { [month: number]: number } } = {};
  const cvDownloadsByYear: { [year: number]: { [month: number]: number } } = {};

  // Track detailed CV download information
  const cvDownloadDetails: any[] = [];

  // Track weekly visits by year, month, and week
  const weeklyVisitsByYearMonth: {
    [year: number]: {
      [month: number]: {
        [week: number]: { [day: number]: number }
      }
    }
  } = {};

  data.forEach(item => {
    const timestamp = item.timestamp?.toDate ? item.timestamp.toDate() : new Date(item.timestamp);
    const month = timestamp.getMonth();
    const year = timestamp.getFullYear();

    if (item.eventType === 'page_view') {
      const date = timestamp;
      const dayOfWeek = date.getDay();
      if (weeklyVisits[dayOfWeek]) weeklyVisits[dayOfWeek].visits++;
      if (monthlyVisits[month]) monthlyVisits[month].visits++;

      // Track by year and month
      if (!monthlyVisitsByYear[year]) {
        monthlyVisitsByYear[year] = {};
      }
      monthlyVisitsByYear[year][month] = (monthlyVisitsByYear[year][month] || 0) + 1;

      // Track by year, month, and week
      const weekOfMonth = getWeekOfMonth(date);
      if (!weeklyVisitsByYearMonth[year]) {
        weeklyVisitsByYearMonth[year] = {};
      }
      if (!weeklyVisitsByYearMonth[year][month]) {
        weeklyVisitsByYearMonth[year][month] = {};
      }
      if (!weeklyVisitsByYearMonth[year][month][weekOfMonth]) {
        weeklyVisitsByYearMonth[year][month][weekOfMonth] = {};
      }
      weeklyVisitsByYearMonth[year][month][weekOfMonth][dayOfWeek] =
        (weeklyVisitsByYearMonth[year][month][weekOfMonth][dayOfWeek] || 0) + 1;
    }

    if (item.eventType === 'cv_download') {
      if (cvDownloads[month]) cvDownloads[month].downloads++;

      // Track by year and month
      if (!cvDownloadsByYear[year]) {
        cvDownloadsByYear[year] = {};
      }
      cvDownloadsByYear[year][month] = (cvDownloadsByYear[year][month] || 0) + 1;

      // Track detailed download information
      cvDownloadDetails.push({
        country: item.location?.country || 'Unknown',
        city: item.location?.city || 'Unknown',
        language: item.language || 'Unknown',
        date: timestamp,
        day: timestamp.getDate(),
        month: timestamp.getMonth(),
        year: timestamp.getFullYear(),
        monthName: getMonth(timestamp.getMonth()),
        dayOfWeek: getDayOfWeek(timestamp.getDay()),
      });
    }

    if (item.eventType === 'page_view_specific_section') {
      if (item.section && item.section.length > 0) {
        sectionInteractions[item.section] = (sectionInteractions[item.section] || 0) + 1;

        // Track by month
        if (!sectionInteractionsByMonth[month]) {
          sectionInteractionsByMonth[month] = {};
        }
        sectionInteractionsByMonth[month][item.section] = (sectionInteractionsByMonth[month][item.section] || 0) + 1;
      }
    }

    if (item.location && item.location.country) {
      geographicLocation[item.location.country] = (geographicLocation[item.location.country] || 0) + 1;

      // Track by month
      if (!geographicLocationByMonth[month]) {
        geographicLocationByMonth[month] = {};
      }
      geographicLocationByMonth[month][item.location.country] = (geographicLocationByMonth[month][item.location.country] || 0) + 1;
    }
  });

  return {
    weeklyVisits,
    monthlyVisits,
    cvDownloads,
    sectionInteractions: Object.entries(sectionInteractions).map(([section, interactions]) => ({ section, interactions })),
    geographicLocation: Object.entries(geographicLocation).map(([country, visits]) => ({ country, visits })),
    sectionInteractionsByMonth,
    geographicLocationByMonth,
    monthlyVisitsByYear,
    cvDownloadsByYear,
    cvDownloadDetails: cvDownloadDetails.sort((a, b) => b.date - a.date), // Most recent first
    weeklyVisitsByYearMonth,
  };
};

const getDayOfWeek = (dayIndex: number) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[dayIndex];
};

const getMonth = (monthIndex: number) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[monthIndex];
};

// Get week number of the month (1-5)
const getWeekOfMonth = (date: Date) => {
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const dayOfMonth = date.getDate();
  const firstDayWeekday = firstDayOfMonth.getDay();
  return Math.ceil((dayOfMonth + firstDayWeekday) / 7);
};