import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  try {
    // Tambahkan download=1 untuk link SharePoint/OneDrive agar memaksa download file asli
    // daripada mengembalikan halaman HTML viewer
    let fetchUrl = url;
    if (url.includes('sharepoint.com') || url.includes('1drv.ms') || url.includes('onedrive.live.com')) {
      if (!url.includes('download=1') && !url.includes('raw=1')) {
        const separator = url.includes('?') ? '&' : '?';
        fetchUrl = `${url}${separator}download=1`;
      }
    }

    // Lakukan fetch dari sisi server (menghindari CORS di browser)
    const response = await fetch(fetchUrl, {
      method: 'GET',
      redirect: 'follow', // Penting: Ikuti redirect (302) dari SharePoint ke URL file sementara
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      }
    });

    if (!response.ok) {
      return new NextResponse(`Failed to fetch image: ${response.status} ${response.statusText}`, { status: response.status });
    }

    const contentType = response.headers.get('content-type');
    
    // Pastikan response bukan HTML (kalau HTML berarti gagal by-pass viewer atau butuh login)
    if (contentType && contentType.includes('text/html')) {
      return new NextResponse('Link membutuhkan login atau bukan gambar langsung', { status: 403 });
    }

    const buffer = await response.arrayBuffer();

    // Kembalikan buffer gambar dengan header yang benar agar browser menampilkannya
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error: any) {
    console.error('Image proxy error:', error);
    return new NextResponse(`Error fetching image: ${error.message}`, { status: 500 });
  }
}
