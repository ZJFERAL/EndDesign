import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'system';

const KEY = 'ef-theme';
const ORDER: Theme[] = ['system', 'light', 'dark'];

function read(): Theme {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' || v === 'system' ? v : 'system';
  } catch {
    return 'system';
  }
}

/**
 * 三态主题。system 时不写 data-theme，交给 CSS 媒体查询。
 * 首帧读取在 useState 初始化里完成，避免闪烁。
 */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(read);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') {
      root.removeAttribute('data-theme');
      root.style.colorScheme = '';
    } else {
      root.setAttribute('data-theme', theme);
      root.style.colorScheme = theme;
    }
    try {
      localStorage.setItem(KEY, theme);
    } catch {
      /* 隐私模式下写入失败，本次会话仍然生效 */
    }
  }, [theme]);

  const setTheme = useCallback((t: Theme) => setThemeState(t), []);

  const cycle = useCallback(() => {
    setThemeState((prev) => {
      const next = ORDER[(ORDER.indexOf(prev) + 1) % ORDER.length];
      return next ?? 'system';
    });
  }, []);

  return { theme, setTheme, cycle };
}

export const THEME_LABEL: Record<Theme, string> = {
  system: '跟随系统',
  light: '浅色',
  dark: '深色',
};
