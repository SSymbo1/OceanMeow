export async function themeCalculate(state: string): Promise<'light' | 'dark'> {
  if (state === 'system') {
    const { theme } = await window.electronAPI.getSystemEnvironment();
    return theme ? 'dark' : 'light';
  } else {
    return state as 'light' | 'dark';
  }
}

export function localization() {}
