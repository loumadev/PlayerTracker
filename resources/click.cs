using System.Threading.Tasks;

public class Startup {
	[System.Runtime.InteropServices.DllImport("user32.dll")]
	static extern bool SetCursorPos(int x, int y);

	[System.Runtime.InteropServices.DllImport("user32.dll")]
	public static extern void mouse_event(int dwFlags, int dx, int dy, int cButtons, int dwExtraInfo);

	public const int MOUSEEVENTF_LEFTDOWN = 0x02;
	public const int MOUSEEVENTF_LEFTUP = 0x04;
	public const int MOUSEEVENTF_RIGHTDOWN = 0x08;
	public const int MOUSEEVENTF_RIGHTUP = 0x10;

	//This simulates a left mouse click
	public static void Click(int x, int y, bool left) {
		SetCursorPos(x, y);
		mouse_event(left ? MOUSEEVENTF_LEFTDOWN : MOUSEEVENTF_RIGHTDOWN, x, x, 0, 0);
		mouse_event(left ? MOUSEEVENTF_LEFTUP : MOUSEEVENTF_RIGHTUP, y, y, 0, 0);
	}

	public async Task<object> Invoke(dynamic obj) {
		int x = (int)obj.x;
        int y = (int)obj.y;
        bool left = (bool)obj.left || true;

		Click(x, y, left);

		return true;
	}
}