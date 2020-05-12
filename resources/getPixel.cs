using System;
using System.Diagnostics;
using System.Threading.Tasks;
using System.Runtime.InteropServices;

public class Startup {
	[DllImport("user32.dll")]
	static extern IntPtr GetDC(IntPtr hwnd);

	[DllImport("user32.dll")]
	static extern Int32 ReleaseDC(IntPtr hwnd, IntPtr hdc);

	[DllImport("gdi32.dll")]
	static extern uint GetPixel(IntPtr hdc, int nXPos, int nYPos);

	static public int[] GetPixelColor(int x, int y) {
		IntPtr hdc = GetDC(IntPtr.Zero);
		uint pixel = GetPixel(hdc, x, y);
		ReleaseDC(IntPtr.Zero, hdc);
		int r = (int)(pixel & 0x000000FF);
		int g = (int)(pixel & 0x0000FF00) >> 8;
		int b = (int)(pixel & 0x00FF0000) >> 16;

		int[] color = {r, g, b};
		return color;
  	}

	public async Task<object> Invoke(dynamic obj) {
		int x = (int)obj.x;
		int y = (int)obj.y;
		return GetPixelColor(x, y);
	}
}