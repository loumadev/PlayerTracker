using System;
using System.Diagnostics;
using System.Threading.Tasks;
using System.Runtime.InteropServices;

public class Startup {
    const UInt32 WM_KEYDOWN = 0x0100;
	
    [DllImport("user32.dll")]
    static extern bool PostMessage(IntPtr hWnd, UInt32 Msg, int wParam, int lParam);

    [STAThread]
    public async Task<object> Invoke(dynamic obj) {
        Process [] processes = Process.GetProcessesByName("javaw");

        foreach(Process proc in processes) {
            PostMessage(proc.MainWindowHandle, WM_KEYDOWN, (int)obj.keyCode, 0);
		}

		return true;
    }
}