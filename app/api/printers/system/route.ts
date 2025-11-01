import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
  try {
    // Windows'ta kurulu yazıcıları PowerShell ile al
    const { stdout } = await execAsync(
      'powershell -Command "Get-Printer | Select-Object Name, DriverName, PortName, Shared, Published | ConvertTo-Json"',
      { encoding: 'utf8' }
    );

    let printers = [];
    
    if (stdout && stdout.trim()) {
      try {
        const parsed = JSON.parse(stdout);
        // Tek yazıcı varsa array'e çevir
        printers = Array.isArray(parsed) ? parsed : [parsed];
        
        // Yazıcı bilgilerini formatla
        printers = printers.map((printer: any) => ({
          name: printer.Name || 'Bilinmeyen Yazıcı',
          driver: printer.DriverName || '',
          port: printer.PortName || '',
          shared: printer.Shared || false,
          published: printer.Published || false,
          type: printer.PortName?.includes('USB') ? 'USB' : 
                printer.PortName?.includes('LPT') ? 'Parallel' :
                printer.PortName?.includes('COM') ? 'Serial' :
                'Network'
        }));
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
      }
    }

    return NextResponse.json(printers);
  } catch (error) {
    console.error('System Printers API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch system printers', details: String(error) }, { status: 500 });
  }
}










