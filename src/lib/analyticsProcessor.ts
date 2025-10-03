export const processAnalyticsData = (data: any[]) => {
  const weeklyVisits = Array(7).fill(0).map((_, i) => ({ day: getDayOfWeek(i), visits: 0 }));
  const monthlyVisits = Array(12).fill(0).map((_, i) => ({ month: getMonth(i), visits: 0 }));
  const cvDownloads = Array(12).fill(0).map((_, i) => ({ month: getMonth(i), downloads: 0 }));
  const sectionInteractions: { [key: string]: number } = {};
  const geographicLocation: { [key: string]: number } = {};

  data.forEach(item => {
    // FIX: Convert Firestore Timestamp to JavaScript Date object
    const timestamp = item.timestamp?.toDate ? item.timestamp.toDate() : new Date(item.timestamp);

    if (item.eventType === 'page_view') {
      const date = timestamp;
      const dayOfWeek = date.getDay();
      const month = date.getMonth();
      if(weeklyVisits[dayOfWeek]) weeklyVisits[dayOfWeek].visits++;
      if(monthlyVisits[month]) monthlyVisits[month].visits++;
    }

    if (item.eventType === 'cv_download') {
      const date = timestamp;
      const month = date.getMonth();
      if(cvDownloads[month]) cvDownloads[month].downloads++;
    }

    if (item.eventType === 'page_view_specific_section') {
      sectionInteractions[item.section] = (sectionInteractions[item.section] || 0) + 1;
    }

    if (item.country) {
      geographicLocation[item.country] = (geographicLocation[item.country] || 0) + 1;
    }
  });

  return {
    weeklyVisits,
    monthlyVisits,
    cvDownloads,
    sectionInteractions: Object.entries(sectionInteractions).map(([section, interactions]) => ({ section, interactions })),
    geographicLocation: Object.entries(geographicLocation).map(([country, visits]) => ({ country, visits })),
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
