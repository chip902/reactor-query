import { NextRequest, NextResponse } from 'next/server';
import { 
  DataElementSearchResponseItem,
  RuleComponentSearchResponseItem,
  RuleSearchResponseItem,
  ExtensionSearchResponseItem,
} from '@/lib/types';

type SearchApiResponse =
  | DataElementSearchResponseItem[]
  | RuleComponentSearchResponseItem[]
  | RuleSearchResponseItem[]
  | ExtensionSearchResponseItem[];

const convertToCSV = (data: SearchApiResponse) => {
  if (!data || data.length === 0) return '';
  
  const headers = ['name', 'id', 'type'];
  
  const csvRows = [
    headers.join(','), // Header row
    ...data.map(item => {
      const values = [
        item.attributes?.name || '',
        item.id || '',
        item.type || ''
      ];
      
      // Handle values that might contain commas
      return values.map(value => 
        typeof value === 'string' ? 
          `"${value.replace(/"/g, '""')}"` : 
          String(value)
      ).join(',');
    })
  ];
  
  return csvRows.join('\n');
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, resourceType } = body;

    if (!data || !Array.isArray(data)) {
      return new NextResponse('Invalid data format', { status: 400 });
    }

    const csv = convertToCSV(data);
    
    // Set headers for CSV download
    const headers = new Headers({
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename=search-results-${resourceType}-${new Date().toISOString()}.csv`
    });

    return new NextResponse(csv, { headers });
  } catch (error) {
    console.error('Error generating CSV:', error);
    return new NextResponse('Error generating CSV', { status: 500 });
  }
}
